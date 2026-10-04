/**
 * Сторожа пакета: у каждого компонента — истории на каждое его состояние (CONCEPT §3.4, П12); теги состояний — только
 * из матрицы облика; только токены (look.tokens); движение — токенами, раскрытие и выезд — 0,6 с без прыжка (look.nojump).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { scan } from '../../../lint/scan.mjs'
import { stories, stateOf, STORY_FILES } from './stories'

const root = resolve(import.meta.dirname, '..', '..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const files = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]))

const MATRIX_STATES = ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'всё сделано', 'ничего не найдено', 'нет доступа', 'много']

/** Состояния, которые компонент обещает показать, — каждому нужна история. */
const PROMISED: Record<string, string[]> = {
  'Button.stories.tsx': ['обычное', 'загрузка'],
  'StatusBadge.stories.tsx': ['обычное'],
  'StateView.stories.tsx': ['загрузка', 'ошибка', 'первый запуск', 'всё сделано', 'ничего не найдено', 'нет доступа'],
  'DataTable.stories.tsx': MATRIX_STATES,
  'List.stories.tsx': MATRIX_STATES,
  'FilterBar.stories.tsx': ['обычное'],
  'Tabs.stories.tsx': ['обычное'],
  'Card.stories.tsx': ['обычное'],
  'Drawer.stories.tsx': ['обычное'],
  'Notification.stories.tsx': ['обычное', 'ошибка'],
  'Page.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'много'],
  'Dialog.stories.tsx': ['обычное', 'загрузка', 'ошибка'],
  'TextField.stories.tsx': ['обычное', 'ошибка'],
  'Select.stories.tsx': ['обычное', 'ошибка'],
  'Checkbox.stories.tsx': ['обычное', 'ошибка'],
  'NumberField.stories.tsx': ['обычное', 'ошибка'],
  'Combobox.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'ничего не найдено', 'много'],
  'Avatar.stories.tsx': ['обычное', 'ошибка'],
  'CountBadge.stories.tsx': ['обычное', 'много'],
  'Tooltip.stories.tsx': ['обычное'],
  // компоненты DF (DF-PORT решение 6)
  'ChatThread.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'много'],
  'ReplyBox.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'нет доступа'],
  'ThreeColumn.stories.tsx': ['обычное', 'первый запуск'],
  'WeekCalendar.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'ничего не найдено', 'много'],
  'ProofreadGrid.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'ничего не найдено', 'много'],
  'ChartFrame.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'ничего не найдено'],
  'StatTile.stories.tsx': ['обычное'],
  'Steps.stories.tsx': ['обычное', 'ошибка', 'всё сделано'],
}

describe('истории на каждое состояние', () => {
  const all = stories()

  it('у каждого файла компонента есть истории', () => {
    const comps = readdirSync(resolve(root, 'src/components')).filter((f) => f.endsWith('.tsx') && !f.includes('.stories.'))
    const covered = new Set(['layout.tsx', 'Collection.tsx']) // layout — Page.stories и Button.stories; Collection — DataTable и List
    for (const c of comps) if (!covered.has(c)) expect(STORY_FILES, `нет историй у ${c}`).toContain(c.replace('.tsx', '.stories.tsx'))
    expect(Object.keys(PROMISED).sort()).toEqual([...STORY_FILES].sort())
  })

  it('теги state: — только из матрицы облика (design/matrix.yaml)', () => {
    const matrix = readFileSync(resolve(root, '..', 'matrix.yaml'), 'utf8')
    const states = /^states: \[(.+)\]$/m.exec(matrix)![1].split(',').map((s) => s.trim())
    expect(states).toEqual(MATRIX_STATES)
    for (const e of all) expect(states, `${e.title} / ${e.name}`).toContain(stateOf(e))
  })

  it('обещанные состояния есть', () => {
    for (const [file, want] of Object.entries(PROMISED)) {
      const have = new Set(all.filter((e) => e.file === file).map(stateOf))
      for (const s of want) expect([...have], `${file}: нет истории «${s}»`).toContain(s)
    }
  })
})

describe('только токены (look.tokens)', () => {
  it('сторож дизайн-системы молчит на исходниках и историях пакета', () => {
    const found = [...files('src'), ...files('.storybook')]
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .flatMap((f) => scan(read(f), f).map((x: any) => `${f}:${x.line} ${x.rule} ${x.value}`))
    expect(found).toEqual([])
  })

  it('цвета — только классы тем дизайн-системы, без dark: и без прозрачности поверх токена', () => {
    const src = files('src/components').filter((f) => !f.includes('.stories.')).map(read).join('\n')
    expect(src).not.toMatch(/\bdark:/)
    expect(src).not.toMatch(/\b(?:bg|text|border)-[a-z0-9-]+\/\d+/)
  })
})

describe('движение: токены, 0,6 с, без прыжка (look.nojump)', () => {
  const css = read('src/ds.css')
  const tsx = files('src/components').filter((f) => !f.includes('.stories.')).map(read).join('\n')

  it('длительности и кривые — только токены', () => {
    const times = [...css.matchAll(/(?:transition|animation):[^;]*;/g)].map((m) => m[0])
    for (const t of times) expect(t, t).not.toMatch(/\d+m?s\b/)
    for (const t of times) expect(t, t).toMatch(/var\(--cds-(?:duration|easing)-/)
    expect(tsx).not.toMatch(/\bduration-\d+\b/)
    expect(tsx).not.toMatch(/\btransition-all\b/)
  })

  it('раскрытие и выезд — duration-move (0,6 с); раскрытие — переходом высоты сетки, а не скачком', () => {
    expect(css).toMatch(/\.ds-expand \{[^}]*transition: grid-template-rows var\(--cds-duration-move\) var\(--cds-easing-move\)/)
    expect(css).toMatch(/\.ds-drawer\[data-state='open'\] \{\s*animation: ds-in-up var\(--cds-duration-move\)/)
    const tokens = readFileSync(resolve(root, '..', 'dist', 'tokens.css'), 'utf8')
    expect(tokens).toContain('--cds-duration-move: 600ms;')
    // анимируем только transform, opacity и высоту сетки — то, что не сдвигает соседей скачком
    const keyframes = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1])
    for (const k of keyframes) expect(k.replace(/\b(?:from|to|transform|opacity)\b|[{}:;\s\d%().-]|translate[XY]|var|--[\w-]+/g, '')).toBe('')
  })

  it('свёрнутое не ловит фокус: у раскрываемого — inert, пока закрыто', () => {
    expect(tsx.match(/className="ds-expand"[^>]*inert=\{!/g)?.length).toBeGreaterThanOrEqual(3)
  })
})
