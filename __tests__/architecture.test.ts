/**
 * Устройство ДС машиной (lib/architecture.mjs): реестр компонентов против исходников и историй — уровень, анатомия,
 * один смысл — один компонент, index.ts только `export { … }`, импорт только нижних уровней (в любой записи пути),
 * полка = уровень, словари тонов и хода, значки, таблетки; таблица «Уровни» README = реестр.
 * Настоящая ДС — ноль нарушений; приманка (bait/architecture) — каждое правило обязано сработать.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { checkArchitecture, importsOf, readmeProblems, readTree } from '../lib/architecture.mjs'

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

  it('README «Уровни» совпадает с реестром; приманка — лишний, пропущенный и чужой по уровню компонент', () => {
    const real = resolve(import.meta.dirname, '..')
    const registry = JSON.parse(readFileSync(resolve(real, 'react/src/registry.json'), 'utf8'))
    expect(readmeProblems(readFileSync(resolve(real, 'README.md'), 'utf8'), registry)).toEqual([])
    const bait = readmeProblems(
      `## Уровни\n\n| Уровень | Компоненты |\n|---|---|\n| Низ | Low, Ghost |\n| Верх | Good, Low |\n\n## Дальше\n`,
      { levels: ['Низ', 'Верх', 'Пусто'], components: { Low: { level: 'Низ' }, Good: { level: 'Низ' } } },
    ).map((p: { text: string }) => p.text)
    expect(bait).toEqual([
      'в README таблицы «Уровни» нет строки «Пусто»',
      '«Good» (Низ) в реестре, а в README в строке уровня его нет',
      '«Ghost» в README в строке «Низ», а в реестре его там нет',
      '«Good» в README в строке «Верх», а в реестре его там нет',
      '«Low» в README в строке «Верх», а в реестре его там нет',
    ])
  })
})
