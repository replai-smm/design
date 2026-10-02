/**
 * dist/ — вывод из tokens.json, scale.json, statuses.json. Правка руками или забытая пересборка — красный.
 * Плюс главное, что обещает каждый вывод: две темы и системная тема в CSS, сброшенная палитра в Tailwind,
 * рабочий tokens.ts, страница образцов без сети и с нулём пар ниже нормы.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { outputs, SHADCN } from '../lib/generate.mjs'

const design = resolve(import.meta.dirname, '..')
const read = (p: string) => readFileSync(resolve(design, p), 'utf8')
const tokens = JSON.parse(read('tokens.json'))
const { statuses } = JSON.parse(read('statuses.json'))

describe('dist', () => {
  const out = outputs()

  it('совпадает с источником (собрать: node design/build.mjs)', () => {
    for (const [rel, content] of Object.entries<string>(out)) expect(read(rel) === content, `${rel} отстал`).toBe(true)
  })

  it('tokens.css: светлая по умолчанию, тёмная по атрибуту, по классу .dark и по теме системы', () => {
    const css = out['dist/tokens.css']
    expect(css).toMatch(/:root,\n\[data-theme="light"\] \{\n {2}color-scheme: light;/)
    expect(css).toContain('[data-theme="dark"],\n.dark {')
    expect(css).toContain('@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain(`--cds-background: ${tokens.themes['светлая'].colors.background};`)
    expect(css).toContain(`--cds-background: ${tokens.themes['тёмная'].colors.background};`)
    expect(css).toContain('--cds-duration-move: 600ms;')
    expect(css).toContain("src: url('../fonts/IBMPlexSans-Regular.woff2') format('woff2');")
  })

  it('tailwind.css: палитра и углы Tailwind сброшены, все цвета и псевдонимы shadcn ведут на токены', () => {
    const tw = out['dist/tailwind.css']
    expect(tw).toContain('--color-*: initial;')
    expect(tw).toContain('--radius-*: initial;')
    for (const n of Object.keys(tokens.themes['светлая'].colors)) expect(tw).toContain(`--color-${n}: var(--cds-${n});`)
    for (const [k, n] of Object.entries(SHADCN)) expect(tw).toContain(`--color-${k}: var(--cds-${n});`)
    expect(tw).not.toMatch(/#[0-9a-f]{3,8}\b/)
  })

  it('tokens.ts: темы, тоны и статусы те же, что в источнике', async () => {
    const m = await import('../dist/tokens.ts')
    expect(Object.keys(m.themes)).toEqual(['light', 'dark'])
    expect(m.themes.dark.background).toBe(tokens.themes['тёмная'].colors.background)
    expect(m.tones).toEqual(tokens.palettes.product)
    expect(m.kartaTones).toEqual(tokens.palettes.karta)
    expect(m.statuses.map((s: any) => s.say)).toEqual(statuses.map((s: any) => s.say))
    expect(m.toneColors('опасно')).toEqual({
      mark: 'var(--cds-status-error)',
      text: 'var(--cds-status-error-text)',
      background: 'var(--cds-status-error-background)',
    })
    expect(m.statusById('work.failing').tone).toBe('опасно')
    expect(m.kartaColor('work.working')).toBe(`var(--cds-${tokens.palettes.karta['без изменений']})`)
    expect(m.kartaColor('work.unchecked')).toBeNull()
  })

  it('образцы (showcase.html): открывается без сети, показывает все статусы, пар ниже нормы — 0', () => {
    const html = out['dist/showcase.html']
    expect(html).not.toMatch(/(?:src|href)=["']https?:/)
    expect(html).not.toMatch(/url\(['"]?https?:/)
    expect(html).toContain('data:font/woff2;base64,')
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">')
    for (const s of statuses) expect(html).toContain(`</svg>${s.say}</span>`)
    expect(html).toContain('Сейчас ниже нормы: 0.')
    expect(html).toContain('data-set-width="390"')
    expect(html).toContain('data-set-width="1280"')
  })
})
