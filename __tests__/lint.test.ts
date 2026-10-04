/**
 * Сторож «только токены» (design/lint): сырые цвета, произвольные значения и палитра Tailwind — нарушения;
 * ссылки на токены, варианты Tailwind и строки с `ds-allow: <причина>` — нет. Храповик: число по файлу не растёт.
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { scan } from '../lint/scan.mjs'
import plugin from '../lint/eslint-plugin.mjs'
import { lint, ratchet } from '../lint/cli.mjs'

const design = resolve(import.meta.dirname, '..')
const cli = resolve(design, 'lint/cli.mjs')
const rules = (text: string, file = 'a.tsx') => scan(text, file).map((f: any) => `${f.rule} ${f.value}`)

describe('ловит', () => {
  it('сырые цвета: hex 3/4/6/8 знаков и функции цвета', () => {
    expect(rules(`const a = '#fff'; const b = "#12ab34"; const c = '#12ab3480'; const d = '#abcd'`)).toEqual([
      'ds/raw-color #fff',
      'ds/raw-color #12ab34',
      'ds/raw-color #12ab3480',
      'ds/raw-color #abcd',
    ])
    expect(rules(`.x { color: rgb(0 0 0); background: rgba(0,0,0,.5); fill: oklch(0.7 0.1 200); border-color: hsl(0 0% 0%) }`, 'a.css')).toHaveLength(4)
  })

  it('произвольные значения Tailwind и произвольные свойства', () => {
    expect(rules(`<div className="w-[24rem] text-[15px] md:p-[13px] bg-[#fff] [mask-type:alpha]" />`)).toEqual([
      'ds/arbitrary w-[24rem]',
      'ds/arbitrary text-[15px]',
      'ds/arbitrary md:p-[13px]',
      'ds/arbitrary bg-[#fff]',
      'ds/raw-color #fff',
      'ds/arbitrary [mask-type:alpha]',
    ])
  })

  it('палитру Tailwind, в том числе с вариантом и прозрачностью', () => {
    expect(rules(`<p className="bg-red-500 hover:text-slate-700 border-white bg-black/50" />`)).toEqual([
      'ds/palette bg-red-500',
      'ds/palette hover:text-slate-700',
      'ds/palette border-white',
      'ds/palette bg-black/50',
    ])
  })

  it('@apply в CSS', () => {
    expect(rules(`.card { @apply w-[24rem] bg-red-500; }`, 'a.css')).toEqual(['ds/arbitrary w-[24rem]', 'ds/palette bg-red-500'])
  })

  it('ванильный JS и HTML DF-Agency', () => {
    expect(rules(`el.style.color = '#ff0000'`, 'app.js')).toEqual(['ds/raw-color #ff0000'])
    expect(rules(`<span style="color:#333">x</span>`, 'index.html')).toEqual(['ds/raw-color #333'])
  })
})

describe('сырые размеры (ds/raw-size)', () => {
  it('CSS: отступы, размеры, текст, углы; @media — не объявление', () => {
    expect(
      rules(
        `.a { padding: 12px 0; font-size: .8rem; border-radius: 4px; width: 100%; max-width: 45rem; max-height: 70vh; border: 1px solid var(--cds-border-subtle-01) }\n@media (min-width: 600px) { .b { gap: var(--cds-spacing-05, 16px); margin-top: 0 } }`,
        'a.css',
      ),
    ).toEqual(['ds/raw-size padding: 12px', 'ds/raw-size font-size: .8rem', 'ds/raw-size border-radius: 4px'])
  })
  it('атрибут style, <style> в HTML и в строке JS, style={{ }} React, el.style', () => {
    expect(rules(`<div style="width:240px;color:var(--cds-text-primary)"></div>`, 'a.html')).toEqual(['ds/raw-size width: 240px'])
    expect(rules('const h = `<style>.x{margin:8px}</style><b style="height: 2rem">`', 'app.js')).toEqual(['ds/raw-size margin: 8px', 'ds/raw-size height: 2rem'])
    expect(rules(`<div style={{ padding: 12, gap: '4px', lineHeight: 1.5, width: w, top: 0 }} />`)).toEqual(['ds/raw-size padding: 12', 'ds/raw-size gap: 4px'])
    expect(rules(`el.style.marginTop = '10px'; el.style.width = pct + '%'`, 'app.js')).toEqual(['ds/raw-size marginTop: 10px'])
  })
  it('обычный JS с теми же словами — не CSS', () => {
    expect(rules(`const top = 12; const o = { width: 300, height: 200 }; chart.resize({ width: 640 })`, 'a.ts')).toEqual([])
  })
})

describe('не трогает', () => {
  it('токены, варианты Tailwind, утилиты из темы', () => {
    expect(
      rules(
        `<div className="bg-[var(--cds-layer-01)] data-[state=open]:bg-layer-02 group-data-[collapsible=icon]/sidebar:hidden [&_svg]:size-4 aria-[expanded=true]:rotate-180 text-text-secondary bg-status-error-background p-4" style={{ color: 'var(--cds-text-primary)' }} />`,
      ),
    ).toEqual([])
  })

  it('комментарии, id-селекторы в CSS, приватные поля, адреса с #', () => {
    expect(rules(`// цвет был #fff\n/* rgb(0,0,0) */\nconst x = 1`)).toEqual([])
    expect(rules(`#add, #bad { display: none }\n#fed {\n}`, 'a.css')).toEqual([])
    expect(rules(`class A { #cafe = 1; m() { return this.#cafe } }`)).toEqual([])
    expect(rules(`<a href="/page#top">`, 'a.html')).toEqual([])
  })

  it('строку с ds-allow и причиной; без причины — ловит', () => {
    expect(rules(`const vk = '#0077ff' // ds-allow: фирменный цвет кнопки VK по их правилам`)).toEqual([])
    expect(rules(`const vk = '#0077ff' // ds-allow:`)).toEqual(['ds/raw-color #0077ff'])
  })
})

describe('правило ESLint', () => {
  it('сообщает о каждом нарушении с местом в файле', () => {
    const reports: any[] = []
    const context = { sourceCode: { text: `const a = 1\nconst c = 'bg-red-500 #fff'` }, filename: 'x.tsx', report: (r: any) => reports.push(r) }
    plugin.rules['no-raw-values'].create(context).Program()
    expect(reports.map((r) => [r.loc.start.line, r.loc.start.column, r.message.split(':')[0]])).toEqual([
      [2, 11, 'ds/palette'],
      [2, 22, 'ds/raw-color'],
    ])
  })

  it('работает и со старым API (getSourceCode, getFilename)', () => {
    const reports: any[] = []
    const context = { getSourceCode: () => ({ text: `x = '#000'` }), getFilename: () => 'x.js', report: (r: any) => reports.push(r) }
    plugin.rules['no-raw-values'].create(context).Program()
    expect(reports).toHaveLength(1)
  })
})

describe('командная строка и храповик', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-lint-'))
  mkdirSync(join(dir, 'src'))
  mkdirSync(join(dir, 'src/node_modules'))
  writeFileSync(join(dir, 'src/a.tsx'), `export const A = () => <div className="w-[24rem] bg-red-500" />\n`)
  writeFileSync(join(dir, 'src/b.css'), `.b { color: #fff }\n`)
  writeFileSync(join(dir, 'src/node_modules/x.js'), `'#fff'`)
  writeFileSync(join(dir, 'src/tokens.css'), `:root { --cds-x: #fff }`)
  const run = (...args: string[]) => {
    try {
      return { code: 0, out: execFileSync('node', [cli, ...args], { cwd: dir, encoding: 'utf8' }) }
    } catch (e: any) {
      return { code: e.status, out: String(e.stdout) + String(e.stderr) }
    }
  }

  it('без храповика: есть нарушения — выход 1; node_modules и сами токены не смотрит', () => {
    const r = run('src')
    expect(r.code).toBe(1)
    expect(r.out).toContain('src/a.tsx:1:')
    expect(r.out).toContain('нарушений: 3')
    expect(Object.keys(lint([join(dir, 'src')], dir)).sort()).toEqual(['src/a.tsx', 'src/b.css'])
  })

  it('храповик: записали — держит; выросло — красный; упало — подсказывает опустить; поднять --write нельзя', () => {
    expect(run('--baseline', 'ds-baseline.json', '--write', 'src').code).toBe(0)
    expect(JSON.parse(readFileSync(join(dir, 'ds-baseline.json'), 'utf8'))).toEqual({ 'src/a.tsx': 2, 'src/b.css': 1 })
    expect(run('--baseline', 'ds-baseline.json', 'src').code).toBe(0)

    writeFileSync(join(dir, 'src/b.css'), `.b { color: #fff; background: #000 }\n`)
    const grew = run('--baseline', 'ds-baseline.json', 'src')
    expect(grew.code).toBe(1)
    expect(grew.out).toContain('src/b.css: было 1, стало 2')
    expect(run('--baseline', 'ds-baseline.json', '--write', 'src').code).toBe(1)

    writeFileSync(join(dir, 'src/b.css'), `.b { color: var(--cds-text-primary) }\n`)
    const fell = run('--baseline', 'ds-baseline.json', 'src')
    expect(fell.code).toBe(0)
    expect(fell.out).toContain('опусти храповик')
    rmSync(dir, { recursive: true, force: true })
  })

  it('ratchet: новый файл с нарушением — вырос с нуля', () => {
    expect(ratchet({ 'n.tsx': [{}] } as any, {}).grew).toEqual([{ file: 'n.tsx', was: 0, now: 1 }])
  })

  it('код самой дизайн-системы чист (кроме dist — там источник цветов и страница образцов)', () => {
    expect(lint([resolve(design, 'lib'), resolve(design, 'lint'), resolve(design, 'build.mjs')], design)).toEqual({})
  })
})
