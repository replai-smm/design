/**
 * Сторожа пакета: истории на каждое обещанное состояние (П12), теги состояний — только из матрицы облика; только роли
 * и шкалы в исходниках и историях; движение — токенами, раскрытие и выезд — 0,6 с без прыжка; классы тонов — те же
 * роли, что в словаре тонов tokens.json.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { scan } from '../../../lint/scan.mjs'
import { tones } from '../../../dist/tokens.ts'
import { TONE, TONES } from '../lib/vocab'
import { stories, stateOf, STORY_FILES } from './stories'

const root = resolve(import.meta.dirname, '..', '..')
const read = (p: string) => readFileSync(resolve(root, p), 'utf8')
const files = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]))

const ALL = ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'всё сделано', 'ничего не найдено', 'нет доступа', 'много']

/** Состояния, которые компонент обещает показать, — каждому нужна история. */
const PROMISED: Record<string, string[]> = {
  'Foundations.stories.tsx': ['обычное'],
  'layout.stories.tsx': ['обычное'],
  'Stack.stories.tsx': ['обычное'],
  'Grid.stories.tsx': ['обычное'],
  'Icon.stories.tsx': ['обычное'],
  'Button.stories.tsx': ['обычное'],
  'ButtonSet.stories.tsx': ['обычное', 'загрузка'],
  'IconButton.stories.tsx': ['обычное'],
  'Heading.stories.tsx': ['обычное'],
  'Link.stories.tsx': ['обычное'],
  'Tag.stories.tsx': ['обычное'],
  'IconIndicator.stories.tsx': ['обычное'],
  'CountBadge.stories.tsx': ['обычное', 'много'],
  'Avatar.stories.tsx': ['обычное', 'ошибка'],
  'InlineLoading.stories.tsx': ['обычное'],
  'Meter.stories.tsx': ['обычное', 'много'],
  'ProgressIndicator.stories.tsx': ['обычное', 'ошибка', 'всё сделано'],
  'Tooltip.stories.tsx': ['обычное'],
  'Toggletip.stories.tsx': ['обычное'],
  'Accordion.stories.tsx': ['обычное', 'много'],
  'Delta.stories.tsx': ['обычное'],
  'SkeletonText.stories.tsx': ['загрузка'],
  'Prose.stories.tsx': ['обычное'],
  'Chart.stories.tsx': ['обычное'],
  'TextInput.stories.tsx': ['обычное', 'ошибка'],
  'PasswordInput.stories.tsx': ['обычное', 'ошибка'],
  'TextArea.stories.tsx': ['обычное', 'ошибка'],
  'NumberInput.stories.tsx': ['обычное', 'ошибка'],
  'Select.stories.tsx': ['обычное', 'ошибка'],
  'Checkbox.stories.tsx': ['обычное', 'ошибка'],
  'RadioButton.stories.tsx': ['обычное', 'ошибка'],
  'Toggle.stories.tsx': ['обычное'],
  'ComboBox.stories.tsx': ['обычное', 'ошибка', 'много'],
  'FileUploader.stories.tsx': ['обычное', 'ошибка'],
  'Search.stories.tsx': ['обычное'],
  'Form.stories.tsx': ['обычное', 'ошибка'],
  'Surface.stories.tsx': ['обычное'],
  'Card.stories.tsx': ['обычное'],
  'StatTile.stories.tsx': ['обычное'],
  'Notification.stories.tsx': ['обычное', 'ошибка'],
  'StateView.stories.tsx': ['загрузка', 'ошибка', 'первый запуск', 'всё сделано', 'ничего не найдено', 'нет доступа'],
  'CodeBlock.stories.tsx': ['обычное', 'много'],
  'ChartFrame.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'ничего не найдено'],
  'DataTable.stories.tsx': ALL,
  'List.stories.tsx': ALL,
  'Dialog.stories.tsx': ['обычное', 'загрузка', 'ошибка'],
  'Toast.stories.tsx': ['обычное'],
  'Tabs.stories.tsx': ['обычное', 'много'],
  'FilterBar.stories.tsx': ['обычное'],
  'ThreeColumn.stories.tsx': ['обычное', 'первый запуск'],
  'ChatThread.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'первый запуск', 'много'],
  'ReplyBox.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'нет доступа'],
  'patterns/CommonActions.stories.tsx': ['обычное'],
  'patterns/Dialogs.stories.tsx': ['обычное'],
  'patterns/DisabledStates.stories.tsx': ['обычное'],
  'patterns/Disclosures.stories.tsx': ['обычное'],
  'patterns/EmptyStates.stories.tsx': ['обычное'],
  'patterns/Filtering.stories.tsx': ['обычное', 'загрузка', 'ошибка', 'много'],
  'patterns/FluidStyles.stories.tsx': ['обычное'],
  'patterns/Forms.stories.tsx': ['обычное', 'ошибка'],
  'patterns/GlobalHeader.stories.tsx': ['обычное', 'много'],
  'patterns/Loading.stories.tsx': ['обычное'],
  'patterns/Login.stories.tsx': ['обычное', 'ошибка'],
  'patterns/Notifications.stories.tsx': ['обычное'],
  'patterns/OverflowContent.stories.tsx': ['обычное'],
  'patterns/ReadOnlyStates.stories.tsx': ['обычное'],
  'patterns/Search.stories.tsx': ['обычное', 'ничего не найдено'],
  'patterns/StatusIndicators.stories.tsx': ['обычное'],
  'patterns/TextToolbar.stories.tsx': ['обычное'],
}

describe('истории на каждое состояние', () => {
  const all = stories()

  it('у каждого файла компонента есть истории; список обещаний — ровно файлы историй', () => {
    const comps = readdirSync(resolve(root, 'src/components')).filter((f) => f.endsWith('.tsx') && !f.includes('.stories.'))
    const covered = new Set(['Collection.tsx']) // DataTable и List
    for (const c of comps) if (!covered.has(c)) expect(STORY_FILES, `нет историй у ${c}`).toContain(c.replace('.tsx', '.stories.tsx'))
    expect(Object.keys(PROMISED).sort()).toEqual([...STORY_FILES].sort())
  })

  it('теги state: — только из матрицы облика (matrix.yaml)', () => {
    const states = /^states: \[(.+)\]$/m.exec(readFileSync(resolve(root, '..', 'matrix.yaml'), 'utf8'))![1].split(',').map((s) => s.trim())
    expect(states).toEqual(ALL)
    for (const e of all) expect(states, `${e.title} / ${e.name}`).toContain(stateOf(e))
  })

  it('обещанные состояния есть', () => {
    for (const [file, want] of Object.entries(PROMISED)) {
      const have = new Set(all.filter((e) => e.file === file).map(stateOf))
      for (const s of want) expect([...have], `${file}: нет истории «${s}»`).toContain(s)
    }
  })
})

describe('только роли и шкалы', () => {
  it('сторож молчит на исходниках и историях пакета', () => {
    const found = [...files('src'), ...files('.storybook')]
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .flatMap((f) => scan(read(f), f).map((x: { line: number; rule: string; value: string }) => `${f}:${x.line} ${x.rule} ${x.value}`))
    expect(found).toEqual([])
  })

  it('цвета — только роли, без dark: и без прозрачности поверх роли', () => {
    const src = files('src/components').filter((f) => !f.includes('.stories.')).map(read).join('\n')
    expect(src).not.toMatch(/\bdark:/)
    expect(src).not.toMatch(/\b(?:bg|text|border)-[a-z0-9-]+\/\d+/)
  })

  it('классы тонов — те же роли, что в словаре тонов tokens.json (знак, текст, подложка)', () => {
    expect(TONES).toEqual(Object.keys(tones))
    for (const t of TONES) {
      const x = tones[t]
      expect(TONE[t], t).toMatchObject({ key: x.key, mark: `text-${x.mark}`, text: `text-${x.text}`, bg: x.bg ? `bg-${x.bg}` : null, icon: `tone-${x.key}` })
    }
  })
})

describe('движение: 110 мс и 0,6 с, без прыжка', () => {
  const css = read('src/ds.css')
  const tsx = files('src/components').filter((f) => !f.includes('.stories.')).map(read).join('\n')

  it('длительности и кривая — только токены движения', () => {
    const times = [...css.matchAll(/(?:transition|animation):[^;]*;/g)].map((m) => m[0])
    for (const t of times) expect(t, t).not.toMatch(/\d+m?s\b/)
    for (const t of times) expect(t, t).toMatch(/var\(--ds-motion-(?:fast|move)\)/)
    expect(tsx).not.toMatch(/\bduration-\d+\b/)
    expect(tsx).not.toMatch(/\btransition-all\b/)
  })

  it('раскрытие и выезд — 0,6 с; раскрытие — переходом высоты сетки; анимируется только сдвиг, поворот и прозрачность', () => {
    expect(css).toMatch(/\.ds-expand \{[^}]*transition: grid-template-rows var\(--ds-motion-move\) var\(--ds-ease\)/)
    expect(read('../dist/tokens.css')).toContain('--ds-motion-move: 600ms;')
    const keyframes = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1])
    for (const k of keyframes) expect(k.replace(/\b(?:from|to|transform|opacity)\b|[{}:;\s\d%().-]|translate[XY]|rotate|deg|var|--[\w-]+/g, '')).toBe('')
  })

  it('свёрнутое не ловит фокус: у раскрываемого — inert, пока закрыто (механика одна — lib/disclosure.tsx)', () => {
    expect(read('src/lib/disclosure.tsx')).toMatch(/className="ds-expand" data-open=\{open\} inert=\{!open\}/)
    expect(tsx).not.toMatch(/\bds-expand\b/)
  })
})
