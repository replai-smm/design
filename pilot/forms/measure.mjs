// Замеры пилота: вес сборки, снимки, axe, высоты на телефоне, проба Tailwind-на-Carbon. Сначала `npx vite build`.
// node measure.mjs [weight|shots|axe|touch|theme|probe|all] → печатает JSON и пишет measures.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { preview, createServer } from 'vite'

const require = createRequire(import.meta.url)
const what = process.argv[2] ?? 'all'
const VARIANTS = ['a', 'b']
const out = existsSync('measures.json') ? JSON.parse(readFileSync('measures.json', 'utf8')) : {}

function weight() {
  const res = {}
  for (const v of VARIANTS) {
    const html = readFileSync(`dist/${v}.html`, 'utf8')
    const refs = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g)].map((m) => m[1])
    const sum = { js: { min: 0, gzip: 0 }, css: { min: 0, gzip: 0 }, files: refs }
    for (const r of refs) {
      const buf = readFileSync(`dist/${r}`)
      const k = r.endsWith('.css') ? 'css' : 'js'
      sum[k].min += buf.length
      sum[k].gzip += gzipSync(buf, { level: 9 }).length
    }
    res[v] = sum
  }
  return res
}

const shotUrl = (base, v, theme) => `${base}/${v}.html?theme=${theme}`

async function withPreview(fn) {
  const server = await preview({ preview: { port: 4317, strictPort: true }, logLevel: 'warn' })
  const browser = await chromium.launch()
  try {
    return await fn(browser, 'http://localhost:4317')
  } finally {
    await browser.close()
    await server.close()
  }
}

async function open(browser, url, width, height, colorScheme = 'light') {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  return { ctx, page, errors }
}

async function shots(browser, base) {
  mkdirSync('shots', { recursive: true })
  const res = {}
  for (const v of VARIANTS)
    for (const theme of ['light', 'dark'])
      for (const [w, h] of [[390, 844], [1280, 800]]) {
        const { ctx, page, errors } = await open(browser, shotUrl(base, v, theme), w, h, theme)
        const full = await page.evaluate(() => document.documentElement.scrollHeight)
        await page.setViewportSize({ width: w, height: full })
        await page.waitForTimeout(150)
        const file = `shots/${v}-${theme}-${w}.png`
        await page.screenshot({ path: file, fullPage: true })
        res[file] = { height: full, errors }
        await ctx.close()
      }
  return res
}

async function axe(browser, base) {
  const src = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
  const res = {}
  for (const v of VARIANTS)
    for (const theme of ['light', 'dark'])
      for (const [w, h] of [[390, 844], [1280, 800]]) {
        const { ctx, page } = await open(browser, shotUrl(base, v, theme), w, h, theme)
        await page.addScriptTag({ content: src })
        const r = await page.evaluate(async () => {
          const x = await window.axe.run(document)
          return x.violations.map((vi) => ({ id: vi.id, impact: vi.impact, nodes: vi.nodes.length, targets: vi.nodes.map((n) => n.target.join(' ')) }))
        })
        res[`${v}-${theme}-${w}`] = r
        await ctx.close()
      }
  return res
}

// высоты контролов на телефоне 390: что человек нажимает пальцем
async function touch(browser, base) {
  const res = {}
  for (const v of VARIANTS) {
    const { ctx, page } = await open(browser, shotUrl(base, v, 'light'), 390, 844)
    res[v] = await page.evaluate(() => {
      const h = (el) => (el ? Math.round(el.getBoundingClientRect().height * 10) / 10 : null)
      const byLabel = (t) => [...document.querySelectorAll('label')].find((l) => l.textContent.trim() === t)
      const ctl = (t) => {
        const l = byLabel(t)
        const el = l && document.getElementById(l.htmlFor)
        // число: рамка вокруг поля и кнопок; галочка: строка, которую нажимают
        return el
      }
      const frame = (el) => el?.closest('.cds--number__input-wrapper, [data-slot=number-field] .flex.items-stretch') ?? el
      const btn = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t)
      const cb = ctl('Присылать сводку по понедельникам')
      const tip = document.querySelector('[aria-label^="Подробнее"]')
      const acc = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Как работают напоминания'))
      return {
        'поле «Адрес почты»': h(ctl('Адрес почты')),
        'число «Напоминать о сроке за»': h(frame(ctl('Напоминать о сроке за'))),
        'кнопки шага числа (−/+)': h(frame(ctl('Напоминать о сроке за'))?.querySelector('button')),
        'выбор «Язык писем»': h(ctl('Язык писем')),
        // у Carbon квадрат галочки — ::before подписи, сам input скрыт
        'галочка: квадрат': cb?.classList.contains('cds--checkbox') ? parseFloat(getComputedStyle(cb.nextElementSibling, '::before').height) : h(cb),
        'галочка: строка с подписью': h(cb?.closest('.cds--form-item, [data-slot=checkbox] > div')),
        'справка «i»': h(tip),
        'раскрытие «Как работают напоминания»': h(acc),
        'кнопка «Отменить»': h(btn('Отменить')),
        'кнопка «Сохранить»': h(btn('Сохранить')),
      }
    })
    await ctx.close()
  }
  return res
}

// тема: ?theme= и, без него, prefers-color-scheme — цвет фона страницы
async function theme(browser, base) {
  const res = {}
  for (const v of VARIANTS)
    for (const [q, scheme] of [['?theme=light', 'dark'], ['?theme=dark', 'light'], ['', 'light'], ['', 'dark']]) {
      const { ctx, page } = await open(browser, `${base}/${v}.html${q}`, 1280, 800, scheme)
      res[`${v} ${q || '(нет)'} система=${scheme}`] = await page.evaluate(() => {
        const el = document.querySelector('.cds--g10, .cds--g100') ?? document.body
        return getComputedStyle(el).backgroundColor
      })
      await ctx.close()
    }
  return res
}

async function probe() {
  const server = await createServer({ server: { port: 4318, strictPort: true }, logLevel: 'warn' })
  await server.listen()
  const browser = await chromium.launch()
  const res = {}
  try {
    for (const mode of ['plain', 'layered']) {
      const { ctx, page } = await open(browser, `http://localhost:4318/probe.html?carbon=${mode}`, 1280, 800)
      await page.waitForSelector('[id$="--imp"]')
      await page.waitForTimeout(300)
      res[mode] = await page.evaluate(() =>
        Object.fromEntries(window.CASES.map((c) => {
          const el = (s) => document.getElementById(`${c.id}--${s}`)
          const get = (s) => getComputedStyle(el(s)).getPropertyValue(c.prop)
          const base = get('base'), tw = get('tw'), imp = get('imp')
          return [c.id, { class: c.cls, prop: c.prop, carbon: base, tailwind: tw, 'tailwind!': imp, changed: tw !== base, changedWithImportant: imp !== base }]
        })),
      )
      await ctx.close()
    }
    return res
  } finally {
    await browser.close()
    await server.close()
  }
}

if (what === 'weight' || what === 'all') out.weight = weight()
if (['shots', 'axe', 'touch', 'theme', 'all'].includes(what))
  await withPreview(async (browser, base) => {
    if (what === 'shots' || what === 'all') out.shots = await shots(browser, base)
    if (what === 'axe' || what === 'all') out.axe = await axe(browser, base)
    if (what === 'touch' || what === 'all') out.touch = await touch(browser, base)
    if (what === 'theme' || what === 'all') out.theme = await theme(browser, base)
  })
if (what === 'probe' || what === 'all') out.probe = await probe()
writeFileSync('measures.json', JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify(what === 'all' ? out : out[what], null, 2))
