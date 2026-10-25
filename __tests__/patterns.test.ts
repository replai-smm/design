/**
 * Паттерны (patterns/*.md) — правила сборки типовых ситуаций в формате Carbon. Машиной держится форма правила, а не его смысл:
 * у каждого — название, строка «Carbon: … · Компоненты: …» только с настоящими компонентами ДС, разделы по порядку,
 * разметка из узкого подмножества (её рисует react/src/patterns/doc.tsx), и пример — история на полке «Паттерны/<название>».
 * Приманка: правило без раздела, с чужим компонентом и с таблицей — красное.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { dsNames, storyTitle } from '../lint/principles.mjs'

const root = resolve(import.meta.dirname, '..')
const SECTIONS = ['Когда', 'Когда нет', 'Из чего', 'Делай', 'Не делай', 'Доступность', 'Чем держится']

/** Нарушения правила-паттерна: [] — правило в форме. */
export function patternProblems(md: string, names: Set<string>): string[] {
  const out: string[] = []
  const lines = md.split('\n')
  if (!/^# \S/.test(lines[0] ?? '')) out.push('первая строка — «# Название»')
  const head = /^Carbon: (.+) · Компоненты: (.+)$/.exec(lines[2] ?? '')
  if (!head) out.push('третья строка — «Carbon: <имя> · Компоненты: `A`, `B`»')
  else for (const n of head[2].match(/`([^`]+)`/g) ?? []) if (!names.has(n.slice(1, -1))) out.push(`компонента ${n} нет в ДС`)
  const sections = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3))
  if (sections.join('|') !== SECTIONS.join('|')) out.push(`разделы — ${SECTIONS.join(' · ')}; сейчас ${sections.join(' · ')}`)
  const held = md.split('## Чем держится')[1] ?? ''
  if (!/- Машина:/.test(held) || !/- Глаз:/.test(held)) out.push('«Чем держится» — строки «- Машина: …» и «- Глаз: …»')
  for (const [i, l] of lines.entries())
    if (/^\s*(\||>|```|###|\* |\+ )/.test(l) || /\[[^\]]+\]\(/.test(l)) out.push(`строка ${i + 1}: разметка вне подмножества (#, ##, абзац, - , 1. , **, \`)`)
  return out
}

const names = dsNames(resolve(root, 'react/src/index.ts'))
const files = readdirSync(resolve(root, 'patterns')).filter((f) => f.endsWith('.md'))

describe('паттерны — правила по форме Carbon', () => {
  it('паттернов не меньше тринадцати (карта DS-PATTERNS-MAP 25.10)', () => {
    expect(files.length).toBeGreaterThanOrEqual(13)
  })

  for (const f of files) {
    const md = readFileSync(resolve(root, 'patterns', f), 'utf8')
    it(`${f}: правило в форме`, () => {
      expect(patternProblems(md, names)).toEqual([])
    })
    it(`${f}: пример — история на полке «Паттерны/<название>»`, () => {
      const story = resolve(root, 'react/src/patterns', f.replace('.md', '.stories.tsx'))
      expect(existsSync(story), `нет ${story}`).toBe(true)
      const text = readFileSync(story, 'utf8')
      expect(storyTitle(text)).toBe(`Паттерны/${md.split('\n')[0].slice(2)}`)
      expect(text).toContain(`patterns/${f}?raw`)
    })
  }

  it('приманка: без раздела, с чужим компонентом и с таблицей — красное', () => {
    const bait = ['# Приманка', '', 'Carbon: Bait · Компоненты: `Button`, `Drawer`', '', '## Когда', '', '| а | б |'].join('\n')
    const found = patternProblems(bait, names).join('\n')
    expect(found).toContain('компонента `Drawer` нет в ДС')
    expect(found).toContain('разделы —')
    expect(found).toContain('вне подмножества')
    expect(found).toContain('«Чем держится»')
  })
})
