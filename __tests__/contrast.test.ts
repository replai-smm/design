/**
 * Контраст (G46, признак облика look.contrast): текст ≥ 4,5:1, значки и рамки ≥ 3:1 — в обеих темах.
 * Пары строит lib/contrast.mjs из tokens.json: новый тон или тема сразу под проверкой.
 * «Было» — пары, которые не проходили до дизайн-системы (Radix в Replai и голые support-* Carbon): сторож обязан
 * их ловить, иначе он ничего не сторожит.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ratio, checkAll, pairsFor, over, TEXT, NON_TEXT } from '../lib/contrast.mjs'

const design = resolve(import.meta.dirname, '..')
const tokens = JSON.parse(readFileSync(resolve(design, 'tokens.json'), 'utf8'))
const before = JSON.parse(readFileSync(resolve(import.meta.dirname, 'fixtures/before.json'), 'utf8'))

describe('формула WCAG', () => {
  it('чёрное на белом — 21, одно на одном — 1, порядок пары не важен', () => {
    expect(ratio('#000000', '#ffffff')).toBe(21)
    expect(ratio('#777777', '#777777')).toBe(1)
    expect(ratio('#ffffff', '#000000')).toBe(21)
  })

  it('округляет вниз: 4,499 не считается за 4,5', () => {
    // #767676 на белом — классическая граница 4,54; #777777 — 4,47
    expect(ratio('#767676', '#ffffff')).toBe(4.54)
    expect(ratio('#777777', '#ffffff')).toBe(4.47)
  })

  it('полупрозрачный цвет кладётся на фон', () => {
    expect(over('#00000080', '#ffffff')).toBe('#7f7f7f')
  })
})

describe('пары дизайн-системы', () => {
  const rows = checkAll(tokens)

  it('каждый тон продукта проверен: текст на фоне, слоях и своей метке, знак на фоне и слоях — в обеих темах', () => {
    const pairs = pairsFor(tokens)
    for (const t of Object.values<string>(tokens.palettes.product)) {
      expect(pairs.filter((p) => p.fg === `${t}-text` && p.min === TEXT).length).toBe(4)
      expect(pairs.filter((p) => p.fg === t && p.why === 'знак статуса').length).toBe(3)
    }
    expect(new Set(rows.map((r) => r.theme))).toEqual(new Set(['светлая', 'тёмная']))
  })

  it('каждый цвет Карты проверен: рамка и полоса карточки на фоне и слоях — ≥ 3:1 в обеих темах', () => {
    const pairs = pairsFor(tokens)
    for (const [state, t] of Object.entries<string>(tokens.palettes.karta)) {
      expect(pairs.filter((p) => p.fg === t && p.min === NON_TEXT && p.why === `Карта: ${state}`).length, state).toBe(3)
    }
    expect(rows.filter((r) => r.why.startsWith('Карта:')).length).toBe(3 * 3 * 2)
  })

  it('все пары не ниже нормы в обеих темах', () => {
    const bad = rows.filter((r) => !r.ok).map((r) => `${r.theme}: ${r.fg} на ${r.bg} = ${r.ratio} < ${r.min}${r.missing ? ` (нет токена ${r.missing})` : ''}`)
    expect(bad).toEqual([])
  })
})

describe('«было» — сторож ловит старые пары', () => {
  for (const p of before.pairs) {
    it(`${p.what}: ${p.fg} на ${p.bg} = ${p.ratio} < ${p.min}`, () => {
      expect(ratio(p.fg, p.bg)).toBe(p.ratio)
      expect(ratio(p.fg, p.bg)).toBeLessThan(p.min)
    })
  }
})
