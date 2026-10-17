/**
 * Устройство ДС машиной (lib/architecture.mjs): реестр компонентов против исходников и историй — уровень, анатомия,
 * один смысл — один компонент, index.ts только `export { … }`, импорт только нижних уровней (в любой записи пути),
 * полка = уровень, словари тонов и хода, значки, таблетки.
 * Настоящая ДС — ноль нарушений; приманка (bait/architecture) — каждое правило обязано сработать.
 */
import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { checkArchitecture, importsOf, readTree } from '../lib/architecture.mjs'

const RULES = ['anatomy/missing', 'anatomy/index', 'level/unknown', 'level/file', 'level/import', 'meaning/duplicate', 'near/unknown', 'shelf/level', 'product/unknown', 'vocab/own', 'glyph/unicode', 'svg/own', 'shape/pill']

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

  it('приманка: обходы не проходят — импорт с расширением, через ../components, динамический; export * и export default в index.ts', () => {
    const texts = checkArchitecture(readTree(resolve(import.meta.dirname, 'bait', 'architecture'))).map((p: { text: string }) => p.text)
    for (const file of ['Ext.tsx', 'Rel.tsx', 'Dyn.tsx']) expect(texts.some((t: string) => t.includes(`${file} (Элементы) берёт High.tsx (Поверхности)`)), file).toBe(true)
    expect(texts.some((t: string) => t.includes('index.ts: «export * from'))).toBe(true)
    expect(texts.some((t: string) => t.includes('index.ts: «export default'))).toBe(true)
  })

  it('importsOf видит все формы пути к компоненту и не видит комментарии и lib', () => {
    expect(importsOf(`import a from './A'\nimport b from './B.tsx'\nimport c from '../components/C'\nconst d = import('./D')\nexport { e } from './E.ts'`)).toEqual(['A.tsx', 'B.tsx', 'C.tsx', 'D.tsx', 'E.tsx'])
    expect(importsOf(`import { cx } from '../lib/cx'\nimport x from '@radix-ui/x'\n// import z from './Z'`)).toEqual([])
  })
})
