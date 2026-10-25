/**
 * Паттерны (patterns/*.md) — 17 паттернов ядра IBM Carbon их же текстом в переводе (Apache-2.0, NOTICE.md). Машиной держится:
 * ровно 17 паттернов Carbon, у каждого строка источника (файл carbon-website и коммит) и пометка «перевод», разметка — из узкого
 * подмножества (её рисует react/src/patterns/doc.tsx), пример — история на полке «Паттерны/<название>», а строка
 * «Компоненты примера» — ровно те компоненты ДС, которые пример берёт. Своих текстов правил нет — только перевод.
 * Приманка: правило без строки источника, с ссылкой, цитатой и чужим компонентом — красное.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { dsNames, storyTitle } from '../lint/principles.mjs'

const root = resolve(import.meta.dirname, '..')

/** Паттерны ядра Carbon: имя файла у нас → slug источника (carbon-website src/pages/patterns/<slug>/index.mdx). */
export const CARBON: Record<string, string> = {
  'common-actions': 'common-actions',
  dialogs: 'dialog-pattern',
  'disabled-states': 'disabled-states',
  disclosures: 'disclosures-pattern',
  'empty-states': 'empty-states-pattern',
  filtering: 'filtering',
  'fluid-styles': 'fluid-styles',
  forms: 'forms-pattern',
  'global-header': 'global-header',
  loading: 'loading-pattern',
  login: 'login-pattern',
  notifications: 'notification-pattern',
  'overflow-content': 'overflow-content',
  'read-only-states': 'read-only-states-pattern',
  search: 'search-pattern',
  'status-indicators': 'status-indicator-pattern',
  'text-toolbar': 'text-toolbar-pattern',
}
export const COMMIT = '5e9cd1d'

/** Имя истории примера: forms → Forms.stories.tsx, empty-states → EmptyStates.stories.tsx. */
export const storyOf = (name: string) => `${name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}.stories.tsx`

/** Компоненты ДС, которые берёт пример: импорты из '../components/…'. */
export function usedComponents(story: string, names: Set<string>): string[] {
  const out = new Set<string>()
  for (const m of story.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/components\/[^']+'/g))
    for (const part of m[1].split(',')) {
      const n = part.trim().replace(/^type\s+/, '')
      if (names.has(n)) out.add(n)
    }
  return [...out].sort()
}

/** Нарушения правила-паттерна: [] — в форме. */
export function patternProblems(md: string, name: string, names: Set<string>): string[] {
  const out: string[] = []
  const lines = md.split('\n')
  if (!/^# \S/.test(lines[0] ?? '')) out.push('первая строка — «# Название»')
  const src = `Источник: carbon-website src/pages/patterns/${CARBON[name]}/index.mdx @ ${COMMIT} · Перевод с английского, Apache-2.0`
  if (!/^Carbon: .+ · /.test(lines[2] ?? '') || !lines[2].endsWith(src)) out.push(`третья строка — «Carbon: <имя> · ${src}»`)
  const comp = /^Компоненты примера: (.+)$/.exec(lines[4] ?? '')
  if (!comp) out.push('пятая строка — «Компоненты примера: `A`, `B`»')
  else for (const n of comp[1].match(/`([^`]+)`/g) ?? []) if (!names.has(n.slice(1, -1))) out.push(`компонента ${n} нет в ДС`)
  if (!lines.some((l) => l.startsWith('## '))) out.push('нет разделов «## …»')
  for (const [i, l] of lines.entries())
    if (/^\s*(>|```|####)/.test(l) || /\[[^\]]+\]\(/.test(l) || /<\/?[A-Za-z][^>]*>/.test(l)) out.push(`строка ${i + 1}: разметка вне подмножества (#, ##, ###, абзац, - , 1. , таблица, **, \`)`)
  return out
}

const names = dsNames(resolve(root, 'react/src/index.ts'))
const files = readdirSync(resolve(root, 'patterns')).filter((f) => f.endsWith('.md'))

describe('паттерны — 17 паттернов Carbon в переводе', () => {
  it('ровно паттерны ядра Carbon: ни своих, ни пропущенных', () => {
    expect(files.map((f) => f.replace('.md', '')).sort()).toEqual(Object.keys(CARBON).sort())
  })

  for (const f of files) {
    const name = f.replace('.md', '')
    const md = readFileSync(resolve(root, 'patterns', f), 'utf8')
    it(`${f}: источник, перевод, разметка`, () => {
      expect(patternProblems(md, name, names)).toEqual([])
    })
    it(`${f}: пример — история на полке «Паттерны/<название>», компоненты примера — те, что он берёт`, () => {
      const path = resolve(root, 'react/src/patterns', storyOf(name))
      expect(existsSync(path), `нет ${path}`).toBe(true)
      const story = readFileSync(path, 'utf8')
      expect(storyTitle(story)).toBe(`Паттерны/${md.split('\n')[0].slice(2)}`)
      expect(story).toContain(`patterns/${f}?raw`)
      const listed = [...(/^Компоненты примера: (.+)$/.exec(md.split('\n')[4] ?? '')?.[1] ?? '').matchAll(/`([^`]+)`/g)].map((m) => m[1]).sort()
      expect(listed).toEqual(usedComponents(story, names))
    })
  }

  it('приманка: без источника, со ссылкой, цитатой, тегом и чужим компонентом — красное', () => {
    const bait = ['# Приманка', '', 'Carbon: Forms · Источник: где-то', '', 'Компоненты примера: `Button`, `Drawer`', '', '> цитата', '[ссылка](https://x)', '<Row>'].join('\n')
    const found = patternProblems(bait, 'forms', names).join('\n')
    for (const want of ['третья строка', 'компонента `Drawer` нет в ДС', 'нет разделов', 'вне подмножества']) expect(found).toContain(want)
  })
})
