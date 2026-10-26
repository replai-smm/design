/**
 * dist/ и значки — вывод из tokens.json, scale.json и набора Carbon. Правка руками или забытая
 * пересборка — красный. Плюс главное, что обещает каждый вывод.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { outputs } from '../lib/generate.mjs'

const design = resolve(import.meta.dirname, '..')
const read = (p: string) => readFileSync(resolve(design, p), 'utf8')
const tokens = JSON.parse(read('tokens.json'))
const scale = JSON.parse(read('scale.json'))

describe('dist', () => {
  const out = outputs()

  it('совпадает с источником (собрать: npm run build)', () => {
    for (const [rel, content] of Object.entries<string>(out)) expect(read(rel) === content, `${rel} отстал`).toBe(true)
  })

  it('tokens.css: светлая по умолчанию, тёмная по атрибуту и по теме системы; меньше движения — длительности 0', () => {
    const css = out['dist/tokens.css']
    expect(css).toMatch(/:root,\n\[data-theme="light"\] \{\n {2}color-scheme: light;/)
    expect(css).toContain('[data-theme="dark"] {')
    expect(css).toContain('@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {')
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\n {2}:root \{\n {4}--ds-motion-fast: 0ms;\n {4}--ds-motion-move: 0ms;/)
    expect(css).toContain(`--ds-canvas: ${tokens.colors.canvas.dark};`)
    expect(css).toContain("src: url('../fonts/IBMPlexMono-Regular.woff2') format('woff2');")
  })

  it('tailwind.css: своё Tailwind сброшено, классы — только роли и шкалы', () => {
    const tw = out['dist/tailwind.css']
    for (const ns of ['color', 'spacing', 'radius', 'shadow', 'text', 'font', 'leading', 'ease', 'container']) expect(tw).toContain(`--${ns}-*: initial;`)
    expect(tw).toContain('--spacing: initial;')
    for (const n of Object.keys(tokens.colors)) expect(tw).toContain(`--color-${n}: var(--ds-${n});`)
    expect(tw).toContain('--spacing-items: var(--ds-space-items);')
    for (const [k, m] of Object.entries<{ value: string }>(scale.measure)) expect(tw).toContain(`--container-${k}: ${m.value};`)
    expect(tw).toContain('--text-heading--font-weight: var(--ds-text-heading-weight);')
    expect(tw).not.toMatch(/#[0-9a-f]{3,8}\b/)
  })

  it('tokens.ts: роли обеих тем и тоны — те же, что в источнике', async () => {
    const m = await import('../dist/tokens.ts')
    expect(Object.keys(m.colors)).toEqual(['light', 'dark'])
    expect(m.colors.dark.surface).toBe(tokens.colors.surface.dark)
    expect(m.tones).toEqual(tokens.tones)
    expect(m.cssVar('accent')).toBe('var(--ds-accent)')
  })

  it('showcase.html: без сети, шрифты внутри, пар ниже нормы — 0, обе ширины', () => {
    const html = out['dist/showcase.html']
    expect(html).not.toMatch(/(?:src|href)=["']https?:/)
    expect(html).toContain('data:font/woff2;base64,')
    expect(html).toContain('Ниже нормы сейчас: 0.')
    for (const w of ['390', '1280']) expect(html).toContain(`data-set-width="${w}"`)
  })

  it('значки — набор Carbon, данные путей без своего цвета', () => {
    const icons = out['react/src/lib/icons.gen.ts']
    expect(icons).toContain('"tone-danger"')
    expect(icons).not.toMatch(/fill":"#|#[0-9a-f]{6}/i)
  })
})
