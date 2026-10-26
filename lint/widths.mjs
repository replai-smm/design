#!/usr/bin/env node
// Сторож ширин — экран не распирает страницу и не режет текст на любой ширине окна. Для любого продукта: берёт собранный
// Storybook (`storybook-static`), открывает каждую историю полки `Экраны/SCR-NN …` на ширинах 360 · 1024 · 1280 · 1920 (светлая тема)
// и смотрит две вещи:
//   прокрутка  — страница шире окна (scrollWidth больше clientWidth документа): горизонтальной прокрутки у страницы нет;
//   за краем   — видимый текст выходит за левый или правый край окна (не считая рядов, у которых своя прокрутка или обрезка).
// История, которая не отрисовалась (экран Storybook «component failed to render»), — тоже нарушение: пустая страница ничего не доказывает.
//
//   node node_modules/@replai-smm/design/lint/widths.mjs --storybook storybook-static [--require <часть заголовка>…] [--widths 360,1024,1280,1920] [--shelf <regexp>]
//
// --only     только истории, в заголовке или имени которых есть часть (правка одного экрана без полного прогона).
// --require  история, без которой проверка красная: продукт называет ту, что рисует самый тяжёлый набор (оболочку со всеми
//            вкладками, длинными именами и счётчиками): `--require "Оболочка кабинета/Кабинет"`. Можно повторять.
// Выход: 0 — нарушений нет, 1 — есть (в логе таблица «история × ширина» и список нарушений), 2 — проверка не смогла отработать.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

export const WIDTHS = [360, 1024, 1280, 1920]
export const SHELF = /^Экраны\/SCR-\d+/
const HEIGHT = 900
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' }

/** Playwright берём у продукта (его раннер уже с браузером), иначе — свой. */
async function playwright() {
  try {
    return createRequire(join(process.cwd(), 'noop.js'))('playwright')
  } catch {
    return await import('playwright')
  }
}

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

/** Измерение в странице: на сколько пикселей шире окна и какой текст ушёл за край. */
function measure() {
  const de = document.documentElement
  if (document.body.classList.contains('sb-show-errordisplay')) return { broken: true, over: 0, cut: [] }
  const over = de.scrollWidth - de.clientWidth
  const cut = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim()
    const el = n.parentElement
    if (!text || !el || el.closest('[hidden],[aria-hidden="true"],.sr-only,script,style')) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const range = document.createRange()
    range.selectNodeContents(n)
    for (const rc of range.getClientRects()) {
      if (rc.width === 0 || rc.height === 0) continue
      const inWindow = rc.left >= -1 && rc.right <= de.clientWidth + 1
      // Первый предок с прокруткой или обрезкой: ряд вкладок, таблица или «…» сами называют свою прокрутку (class `overflow-x-auto`,
      // `ds-scroll-row`, `text-overflow: ellipsis`); всё остальное — текст обязан лежать внутри предка (панель, которая прокручивается
      // вбок сама из-за `overflow-y-auto`, — нарушение). Предка нет — текст обязан лежать в окне.
      let a = el
      let ok = inWindow
      while (a && a !== document.body && a !== de) {
        const c = getComputedStyle(a)
        if (c.overflowX !== 'visible') {
          const own = /(^|\s)(overflow-x-auto|overflow-x-scroll|overflow-auto|overflow-scroll|ds-scroll-row)(\s|$)/.test(String(a.className))
          const b = a.getBoundingClientRect()
          ok = own || c.textOverflow === 'ellipsis' || (rc.left >= b.left - 1 && rc.right <= b.right + 1 && inWindow)
          break
        }
        a = a.parentElement
      }
      if (!ok) {
        cut.push(text.slice(0, 32))
        break
      }
    }
  }
  return { broken: false, over, cut: [...new Set(cut)].slice(0, 4) }
}

/**
 * check — прогон: { rows: [{ title, name, id, cells: { ширина: { ok, text } } }], bad: [строки нарушений], missing: [нет обязательной] }.
 * Прогон идёт одной страницей на историю: окно меняет ширину на месте, страница между измерениями не перезагружается.
 */
export async function check({ storybook, widths = WIDTHS, shelf = SHELF, require = [], only = null }) {
  const root = resolve(storybook)
  if (!existsSync(join(root, 'index.json'))) throw new Error(`нет ${join(root, 'index.json')}: сначала собрать Storybook (storybook build)`)
  const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'))
  const all = Object.values(index.entries).filter((e) => e.type === 'story' && shelf.test(e.title))
  const missing = require.filter((part) => !all.some((s) => `${s.title}`.includes(part)))
  const stories = only ? all.filter((s) => `${s.title}/${s.name}`.includes(only)) : all
  const { chromium } = await playwright()
  const server = await serve(root)
  const browser = await chromium.launch()
  const rows = []
  const bad = []
  try {
    const page = await (await browser.newContext({ viewport: { width: widths[0], height: HEIGHT } })).newPage()
    for (const s of stories) {
      await page.setViewportSize({ width: widths[0], height: HEIGHT })
      await page.goto(`${server.url}/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story&globals=theme:light`)
      await page.waitForSelector('#storybook-root > *, .sb-show-errordisplay', { state: 'attached', timeout: 15000 }).catch(() => {})
      const cells = {}
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: HEIGHT })
        await page.waitForTimeout(150)
        const r = await page.evaluate(measure)
        const problems = []
        if (r.broken) problems.push('история не отрисовалась')
        if (r.over > 1) problems.push(`страница шире окна на ${r.over}px`)
        if (r.cut.length) problems.push(`текст за краем: ${r.cut.join(' | ')}`)
        cells[w] = { ok: problems.length === 0, text: problems.join('; ') }
        if (problems.length) bad.push(`${s.title} · ${s.name} @${w}: ${problems.join('; ')}`)
      }
      rows.push({ title: s.title, name: s.name, id: s.id, cells })
    }
  } finally {
    await browser.close()
    server.close()
  }
  return { rows, bad, missing, widths }
}

/** table — таблица «история × ширина» для лога CI: экран, набор данных (имя истории) и результат на каждой ширине. */
export function table({ rows, widths }) {
  const head = `${'экран · набор данных'.padEnd(78)} ${widths.map((w) => String(w).padStart(5)).join(' ')}`
  const lines = rows.map((r) => `${`${r.title.replace(/^Экраны\//, '')} · ${r.name}`.slice(0, 78).padEnd(78)} ${widths.map((w) => (r.cells[w].ok ? '  ✓  ' : '  ✗  ')).join(' ')}`)
  return [head, ...lines].join('\n')
}

async function main(argv) {
  const opt = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []))
  const [storybook] = opt('--storybook')
  if (!storybook) {
    console.error('node node_modules/@replai-smm/design/lint/widths.mjs --storybook <storybook-static> [--require <часть заголовка>] [--widths 360,1024,1280,1920] [--shelf <regexp>] [--only <часть>]')
    return 2
  }
  const [w] = opt('--widths')
  const [shelf] = opt('--shelf')
  let r
  try {
    const [only] = opt('--only')
    r = await check({ storybook, widths: w ? w.split(',').map(Number) : WIDTHS, shelf: shelf ? new RegExp(shelf) : SHELF, require: opt('--require'), only: only ?? null })
  } catch (e) {
    console.error(`✗ ширины не проверены: ${e instanceof Error ? e.message : e}`)
    return 2
  }
  console.log(table(r))
  for (const m of r.missing) console.log(`✗ нет обязательной истории «${m}» — без неё проверка ничего не доказывает`)
  console.log(r.bad.length ? `\n${r.bad.join('\n')}\n✗ ширины: ${r.bad.length} нарушений в ${r.rows.length} историях × ${r.widths.length} ширин` : `\n✓ ширины: ${r.rows.length} историй × ${r.widths.length} ширин (${r.widths.join(' · ')}) — страница не шире окна, текст не за краем`)
  return r.bad.length || r.missing.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main(process.argv.slice(2)))
