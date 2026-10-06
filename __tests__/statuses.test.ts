/**
 * Статусы — закрытый список. Слово на экране берётся из закона Карты (x-say схемы, репо process), не придумывается здесь:
 * сверку «say = x-say» и полноту по закону держит process (scripts/__tests__/design-contract.test.ts) — здесь только то, что видно без закона.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const design = resolve(import.meta.dirname, '..')
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const { statuses, tones, karta } = json(resolve(design, 'statuses.json'))
const tokens = json(resolve(design, 'tokens.json'))

describe('статусы', () => {
  it('тоны — те же четыре, что в tokens.json → palettes.product', () => {
    expect(tones).toEqual(Object.keys(tokens.palettes.product))
    for (const s of statuses) expect(tones, s.id).toContain(s.tone)
  })

  it('цвет Карты — один из трёх palettes.karta или без цвета (C-SCR-3): синий «работает», жёлтый «хотят …», красный «падает»', () => {
    expect(karta).toEqual(Object.keys(tokens.palettes.karta))
    const by = (k: string | null) => statuses.filter((s: any) => s.karta === k).map((s: any) => s.say)
    expect(by('без изменений')).toEqual(['работает'])
    expect(by('хотят изменить')).toEqual(['хотят изменить', 'хотят удалить', 'хотят добавить'])
    expect(by('падает')).toEqual(['падает'])
    expect(by(null)).toEqual(statuses.filter((s: any) => s.tone === 'нейтрально').map((s: any) => s.say))
  })

  it('id и пары (ось, значение) не повторяются', () => {
    expect(new Set(statuses.map((s: any) => s.id)).size).toBe(statuses.length)
    expect(new Set(statuses.map((s: any) => `${s.axis}|${s.value}`)).size).toBe(statuses.length)
  })

  it('красное — только «падает» (KARTA-VIEW C-SCR-10: больше красного нигде нет)', () => {
    expect(statuses.filter((s: any) => s.tone === 'опасно').map((s: any) => s.say)).toEqual(['падает'])
  })
})
