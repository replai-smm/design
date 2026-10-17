#!/usr/bin/env node
// Облик машиной: каждая история собранного Storybook × обе темы × 390 и 1280 — снимок против эталона в
// visual/baseline/ и анатомия против реестра (anatomy.mjs). Эталоны лежат в репо; правка облика — новый эталон в том же PR.
//   node visual/run.mjs            — сверить (разница больше допуска матрицы или нарушение анатомии — выход 1)
//   node visual/run.mjs --update   — записать эталоны (анатомию держит всё равно)
//   node visual/run.mjs --only <часть id>  — только истории, в id которых есть часть
// Снимки детерминированы: закреплённые Playwright и Chromium, шрифты — из пакета (Plex), анимации и каретка выключены.
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import YAML from 'yaml'
import { anatomyProblems, snapshotInPage } from './anatomy.mjs'
import { compare } from './compare.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REACT = join(HERE, '..')
const STATIC = join(REACT, 'storybook-static')
const BASE = join(HERE, 'baseline')
const OUT = join(HERE, 'out')
const THEMES = ['light', 'dark']
const WIDTHS = [390, 1280]
const HEIGHT = { 390: 844, 1280: 800 }
const STILL = '*,*::before,*::after{animation-delay:-1ms!important;animation-duration:0s!important;animation-iteration-count:1!important;transition:none!important;caret-color:transparent!important}::-webkit-scrollbar{display:none!important}'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }

const matrix = YAML.parse(readFileSync(join(REACT, '..', 'matrix.yaml'), 'utf8'))
const registry = JSON.parse(readFileSync(join(REACT, 'src', 'registry.json'), 'utf8'))

/** Имя файла эталона: id истории, тема, ширина. */
export const shotName = (id, theme, width) => `${id}.${theme}.${width}.png`

function serve(root) {
  const server = createServer((req, res) => {
    let p = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)))
    if (!p.startsWith(root + sep) && p !== root) return res.writeHead(403).end()
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html')
    if (!existsSync(p)) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' })
    createReadStream(p).pipe(res)
  })
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })))
}

async function main(argv) {
  const update = argv.includes('--update')
  const oi = argv.indexOf('--only')
  const only = oi >= 0 ? argv[oi + 1] : null
  if (!existsSync(join(STATIC, 'index.json'))) throw new Error('нет storybook-static: npm run storybook:build')
  const stories = Object.values(JSON.parse(readFileSync(join(STATIC, 'index.json'), 'utf8')).entries).filter((e) => e.type === 'story' && (!only || e.id.includes(only)))
  mkdirSync(BASE, { recursive: true })
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })
  const srv = await serve(STATIC)
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning', '--disable-lcd-text', '--force-color-profile=srgb', '--disable-gpu', '--hide-scrollbars'] })
  const failures = []
  const seen = new Set()
  const jobs = stories.flatMap((s) => THEMES.flatMap((theme) => WIDTHS.map((width) => ({ s, theme, width }))))
  const work = async () => {
    const ctx = await browser.newContext({ deviceScaleFactor: 1, locale: 'ru-RU', timezoneId: 'Asia/Yekaterinburg', reducedMotion: 'reduce' })
    await ctx.addInitScript(() => {
      const fixed = new Date('2026-10-07T12:00:00+05:00').getTime()
      Date.now = () => fixed
      Math.random = () => 0.5
    })
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const { s, theme, width } = job
      const page = await ctx.newPage()
      await page.setViewportSize({ width, height: HEIGHT[width] })
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(`${srv.url}/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story&globals=theme:${theme}`, { waitUntil: 'networkidle' })
      await page.addStyleTag({ content: STILL })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(150)
      const name = shotName(s.id, theme, width)
      if (errors.length) failures.push({ name, what: 'ошибка страницы', detail: errors[0] })
      for (const p of anatomyProblems(await page.evaluate(snapshotInPage), registry)) {
        const k = `${s.id} ${p.rule} ${p.text}`
        if (!seen.has(k)) (seen.add(k), failures.push({ name, what: p.rule, detail: p.text }))
      }
      const png = await page.screenshot({ fullPage: true })
      await page.close()
      const base = join(BASE, name)
      if (update || !existsSync(base)) {
        if (!update) failures.push({ name, what: 'нет эталона', detail: 'npm run test:visual -- --update' })
        else writeFileSync(base, png)
        continue
      }
      const d = compare(readFileSync(base), png)
      if (d.pixels > matrix.max_diff_pixels) {
        failures.push({ name, what: 'облик', detail: `отличается ${d.pixels} пикселей${d.size ? ` (размер ${d.size})` : ''} — допуск ${matrix.max_diff_pixels}` })
        writeFileSync(join(OUT, name), png)
        if (d.diff) writeFileSync(join(OUT, name.replace('.png', '.diff.png')), d.diff)
      }
    }
    await ctx.close()
  }
  await Promise.all(Array.from({ length: 4 }, work))
  await browser.close()
  srv.close()
  if (update) {
    const want = new Set(stories.flatMap((s) => THEMES.flatMap((t) => WIDTHS.map((w) => shotName(s.id, t, w)))))
    if (!only) for (const f of readdirSync(BASE)) if (!want.has(f)) rmSync(join(BASE, f))
  }
  for (const f of failures) console.log(`✗ ${f.name}  ${f.what}: ${f.detail}`)
  console.log(failures.length ? `✗ облик: ${failures.length} нарушений (снимки и разница — visual/out/)` : `✓ облик: ${stories.length} историй × ${THEMES.length} темы × ${WIDTHS.length} ширины${update ? ' — эталоны записаны' : ''}`)
  return failures.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => (console.error(`✗ облик не снят: ${e.message}`), process.exit(2)))
