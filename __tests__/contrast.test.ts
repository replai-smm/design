/**
 * Контраст: текст ≥ 4,5 : 1, знаки, границы контролов, фокус и ряды данных ≥ 3 : 1 — в обеих темах. Пары строит
 * lib/contrast.mjs из ролей tokens.json: новая роль тона или ряда сразу под проверкой.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ratio, checkAll, pairsFor, over, NON_TEXT } from '../lib/contrast.mjs'

const tokens = JSON.parse(readFileSync(resolve(import.meta.dirname, '..', 'tokens.json'), 'utf8'))

describe('формула WCAG', () => {
  it('чёрное на белом — 21, одно на одном — 1, порядок пары не важен; округление вниз', () => {
    expect([ratio('#000000', '#ffffff'), ratio('#777777', '#777777'), ratio('#ffffff', '#000000')]).toEqual([21, 1, 21])
    expect([ratio('#767676', '#ffffff'), ratio('#777777', '#ffffff')]).toEqual([4.54, 4.47])
  })

  it('полупрозрачный цвет кладётся на фон', () => {
    expect(over('#00000080', '#ffffff')).toBe('#7f7f7f')
  })
})

describe('пары ролей', () => {
  const rows = checkAll(tokens)

  it('каждый знак тона, фокус, граница контрола и каждый ряд данных — под проверкой ≥ 3 : 1', () => {
    const marks = new Set(pairsFor(tokens).filter((p) => p.min === NON_TEXT).map((p) => p.fg))
    for (const t of Object.values<any>(tokens.tones)) expect(marks.has(t.mark), t.mark).toBe(true)
    for (const r of ['accent', 'line-strong', 'series-1', 'series-6']) expect(marks.has(r), r).toBe(true)
  })

  it('все пары не ниже нормы в обеих темах', () => {
    expect(rows.filter((r) => !r.ok).map((r) => `${r.theme}: ${r.fg} на ${r.bg} = ${r.ratio} < ${r.min}${r.missing ? ` (нет роли ${r.missing})` : ''}`)).toEqual([])
    expect(new Set(rows.map((r) => r.theme))).toEqual(new Set(['light', 'dark']))
  })

  it('сторож ловит слабую пару: светло-серый текст на белом', () => {
    const bad = structuredClone(tokens)
    bad.colors['fg-muted'].light = '#bbbbbb'
    expect(checkAll(bad).some((r) => !r.ok && r.fg === 'fg-muted' && r.theme === 'light')).toBe(true)
  })
})
