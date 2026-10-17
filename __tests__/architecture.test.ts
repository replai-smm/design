/**
 * Устройство ДС машиной (lib/architecture.mjs): реестр компонентов против исходников и историй — уровень, анатомия,
 * один смысл — один компонент, импорт только нижних уровней, полка = уровень, словари тонов и хода, значки, таблетки.
 * Настоящая ДС — ноль нарушений; приманка (bait/architecture) — каждое правило обязано сработать.
 */
import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { checkArchitecture, readTree } from '../lib/architecture.mjs'

const RULES = ['anatomy/missing', 'level/unknown', 'level/file', 'level/import', 'meaning/duplicate', 'near/unknown', 'shelf/level', 'product/unknown', 'vocab/own', 'glyph/unicode', 'svg/own', 'shape/pill']

describe('устройство ДС', () => {
  it('настоящая ДС-React: нарушений нет', () => {
    expect(checkArchitecture(readTree(resolve(import.meta.dirname, '..', 'react', 'src'))).map((p: { rule: string; text: string }) => `${p.rule}: ${p.text}`)).toEqual([])
  })

  it('приманка: каждое правило срабатывает', () => {
    const found = checkArchitecture(readTree(resolve(import.meta.dirname, 'bait', 'architecture')))
    expect([...new Set(found.map((p: { rule: string }) => p.rule))].sort()).toEqual([...RULES].sort())
  })

  it('приманка: смысл «кнопка-приманка» уже занят — второй такой компонент красный; импорт вверх и вбок — красный', () => {
    const texts = checkArchitecture(readTree(resolve(import.meta.dirname, 'bait', 'architecture'))).map((p: { text: string }) => p.text)
    expect(texts.some((t: string) => t.includes('«Twin» и «Good» — один смысл'))).toBe(true)
    expect(texts.some((t: string) => t.includes('Low.tsx (Элементы) берёт High.tsx (Поверхности)'))).toBe(true)
    expect(texts.some((t: string) => t.includes('Low.tsx берёт Good.tsx своего уровня'))).toBe(true)
  })
})
