/**
 * ДС ничья (слово Саши 25.10): в правилах (patterns/*.md) и во всём ДС-React — компонентах, историях, примерах, фикстурах,
 * реестре — нет слов наших продуктов, их предметной области и номеров задач. Примеры — нейтральные, как у Carbon:
 * профиль, уведомления, адрес, оплата, проекты, отчёты. Почему такое правило — в INSIGHTS.md, не в самом правиле.
 * Приманка: строка со всеми запретными словами — каждое найдено.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

/** Слово продукта: корень и что за ним (буквы — продолжение слова). Регистр не важен. */
export const DOMAIN: [string, RegExp][] = [
  ['начисление', /начисл/iu],
  ['лайк', /лайк/iu],
  ['балл', /(?<!\p{L})балл(?!он)/iu],
  ['сообщество', /сообществ/iu],
  ['ВКонтакте', /вконтакт|(?<![\p{L}\d])(?:вк|vk)(?![\p{L}\d])/iu],
  ['клиент', /клиент/iu],
  ['Арена', /(?<!\p{L})арен[аеуыо]?(?!\p{L})|(?<![\w-])arena(?![\w-])/iu],
  ['replai', /replai/iu],
  ['DF', /(?<![\p{L}\d_-])df(?![\p{L}\d_-])/iu],
  ['номер задачи', /\b(?:rsmm|ske)-\d+/iu],
  ['orbit', /(?<![\w-])orbit(?![\w-])/iu],
  ['вычитка', /вычитк/iu],
  ['агентство', /агентств/iu],
]

/** Найденные слова продукта: [{ word, line }]. */
export function domainWords(text: string): { word: string; line: number }[] {
  const out: { word: string; line: number }[] = []
  for (const [i, line] of text.split('\n').entries()) for (const [word, re] of DOMAIN) if (re.test(line)) out.push({ word, line: i + 1 })
  return out
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
const files = [...walk(join(root, 'patterns')), ...walk(join(root, 'react/src'))].filter((f) => /\.(md|tsx?|json|css)$/.test(f))

describe('ДС ничья: слов продуктов нет', () => {
  it('правила, компоненты, истории, примеры, фикстуры и реестр — без слов продуктов и номеров задач', () => {
    const found = files.flatMap((f) => domainWords(readFileSync(f, 'utf8')).map((d) => `${relative(root, f)}:${d.line} «${d.word}»`))
    expect(found).toEqual([])
  })

  it('приманка: каждое запретное слово найдено, нейтральные — нет', () => {
    const bait = 'Начисления баллов за лайк в сообществе ВКонтакте (VK), клиент агентства, Арена, replai, DF, RSMM-55, orbit, вычитка'
    expect(new Set(domainWords(bait).map((d) => d.word))).toEqual(new Set(DOMAIN.map(([w]) => w)))
    expect(domainWords('Профиль, уведомления, адрес, оплата, проекты, отчёты, баллон, арендатор, pdf, dfn')).toEqual([])
  })
})
