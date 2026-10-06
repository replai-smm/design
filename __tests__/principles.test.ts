/**
 * Принципы дизайн-системы машиной (design/lint/principles.mjs; README «Правила для всех продуктов»): полки Storybook,
 * только токены, свои компоненты с именами ДС. Новое держит, старое — долг (храповик против базы PR).
 */
import { describe, it, expect, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { storyTitle, shelfProblem, ownComponents, dsNames, check } from '../lint/principles.mjs'

const design = resolve(import.meta.dirname, '..')
const cli = resolve(design, 'lint/principles.mjs')

describe('полка из файла историй', () => {
  it('CSF: export default { title }, const meta = { … } satisfies Meta, export default meta; MDX', () => {
    expect(storyTitle(`export default { title: 'Компоненты/Окно', args: { title: 'не это' } }`)).toBe('Компоненты/Окно')
    expect(storyTitle(`const meta = {\n  component: X,\n  args: { title: 'Привет' },\n  title: "Экраны/SCR-03 Инбокс",\n} satisfies Meta<typeof X>\nexport default meta`)).toBe('Экраны/SCR-03 Инбокс')
    expect(storyTitle(`const meta: Meta<typeof X> = { title: \`Части продукта/Шапка\` }\nexport default meta`)).toBe('Части продукта/Шапка')
    expect(storyTitle(`import { Meta } from '@storybook/blocks'\n<Meta title="Основы/Цвета" />`)).toBe('Основы/Цвета')
  })
  it('без title (Storybook назвал бы по пути) — null; title переменной — null', () => {
    expect(storyTitle(`export default { component: X, args: { title: 'x' } }`)).toBeNull()
    expect(storyTitle(`const t = 'Экраны/SCR-01'\nexport default { title: t }`)).toBeNull()
  })
})

describe('полки', () => {
  it('ДС: Основы · Компоненты · Паттерны', () => {
    for (const t of ['Основы/Цвета', 'Компоненты/Кнопка и область действий', 'Паттерны/Три колонки']) expect(shelfProblem(t, 'ds')).toBeNull()
    for (const t of ['ДС/Кнопка', 'Атомы/Кнопка', 'Кнопка', 'Экраны/SCR-01 Вход']) expect(shelfProblem(t, 'ds')).toMatch(/не полка/)
  })
  it('продукт: Экраны/SCR-NN … и Части продукта/…; полка ДС — «не дублируется»', () => {
    for (const t of ['Экраны/SCR-03 Инбокс', 'Экраны/SCR-12', 'Экраны/SCR-03 Инбокс/Пусто', 'Части продукта/Строка очереди'])
      expect(shelfProblem(t, 'product')).toBeNull()
    expect(shelfProblem('Инбокс/Очередь', 'product')).toMatch(/не полка/)
    expect(shelfProblem('Экраны/Инбокс', 'product')).toMatch(/не полка/)
    expect(shelfProblem('Компоненты/Кнопка', 'product')).toMatch(/не дублируется/)
    expect(shelfProblem('Примитивы/Вкладки', 'arena')).toMatch(/не дублируется/)
    expect(shelfProblem(null, 'product')).toMatch(/нет title/)
  })
  it('истории самой ДС-React — все на полках', () => {
    const r = check({ repo: design, kind: 'ds', roots: ['react/src'], strict: true })
    expect(r.block.filter((x) => x.check === 'полки')).toEqual([])
  })
})

describe('свои компоненты с именами ДС', () => {
  const names = dsNames()
  it('имена — компоненты из react/src/index.ts, без типов и хуков', () => {
    for (const n of ['Button', 'Dialog', 'ThreeColumn', 'ChatThread', 'StatusBadge', 'ConfirmProvider']) expect(names.has(n)).toBe(true)
    for (const n of ['ButtonProps', 'useToast', 'cx', 'STATUS_IDS', 'SERIES']) expect(names.has(n)).toBe(false)
  })
  it('ловит function, const, class; не ловит импорт, вызов и строку с ds-allow', () => {
    const src = [
      `import { Button } from '@replai-smm/design'`,
      `export function Dialog(props) { return null }`,
      `const Tabs = ({ items }) => null`,
      `export const Card: FC = () => null`,
      `class Tooltip extends Component {}`,
      `const x = <Button>ok</Button>`,
      `const Avatar = forwardRef(() => null) // ds-allow: ждёт переезда на ДС-React, интент I-avatar`,
      `const DialogTitle = () => null`,
    ].join('\n')
    expect(ownComponents(src, names)).toEqual([
      { name: 'Dialog', line: 2 },
      { name: 'Tabs', line: 3 },
      { name: 'Card', line: 4 },
      { name: 'Tooltip', line: 5 },
    ])
  })
})

describe('храповик против базы PR', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-principles-'))
  const g = (...a: string[]) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' })
  const put = (p: string, s: string) => {
    mkdirSync(join(dir, p, '..'), { recursive: true })
    writeFileSync(join(dir, p), s)
  }
  g('init', '-q', '-b', 'main')
  g('config', 'user.email', 't@t')
  g('config', 'user.name', 't')
  put('src/old.stories.tsx', `export default { title: 'Инбокс/Очередь' }\nexport const A = {}\n`)
  put('src/good.stories.tsx', `export default { title: 'Экраны/SCR-03 Инбокс' }\n`)
  put('src/ui/button.tsx', `export function Button() { return null }\n`)
  put('src/a.css', `.a { color: #fff; padding: 12px }\n`)
  put('src/__tests__/x.test.tsx', `const Dialog = () => null; expect(c).toBe('#fff')\n`)
  g('add', '.')
  g('commit', '-qm', 'база')
  g('checkout', '-qb', 'pr')
  put('src/old.stories.tsx', `export default { title: 'Инбокс/Очередь' }\nexport const A = {}\nexport const B = {}\n`)
  put('src/good.stories.tsx', `export default { title: 'Инбокс' }\n`)
  put('src/new.stories.tsx', `export default { title: 'Компоненты/Кнопка' }\n`)
  put('src/ui/button.tsx', `export function Button() { return null }\nexport const x = 1\n`)
  put('src/a.css', `.a { color: #fff; padding: 12px; margin: 8px }\n`)
  put('src/dialog.tsx', `export function Dialog() { return <div style={{ padding: 12 }} /> }\n`)
  put('src/__tests__/x.test.tsx', `const Dialog = () => null; expect(c).toBe('#000')\n`)
  g('add', '.')
  g('commit', '-qm', 'PR')
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('новое держит, старое — долг', () => {
    const r = check({ repo: dir, kind: 'product', roots: ['src'], base: 'main' })
    const k = (l: any[]) => l.map((x) => `${x.check} ${x.file}`).sort()
    expect(k(r.block)).toEqual([
      'полки src/good.stories.tsx', // была верной — сломать нельзя
      'полки src/new.stories.tsx', // новый файл — сразу на полку
      'свои src/dialog.tsx',
      'токены src/a.css', // margin: 8px — новое; color и padding — долг
      'токены src/dialog.tsx',
    ])
    expect(r.block.find((x) => x.file === 'src/a.css').text).toContain('margin: 8px')
    expect(k(r.warn)).toEqual(['полки src/old.stories.tsx', 'свои src/ui/button.tsx', 'токены src/a.css'])
  })

  it('командная строка: новое — выход 1; без базы — отчёт, выход 0; незакоммиченное тоже смотрит', () => {
    const run = (...a: string[]) => {
      try {
        return { code: 0, out: execFileSync('node', [cli, ...a], { cwd: dir, encoding: 'utf8' }) }
      } catch (e: any) {
        return { code: e.status, out: String(e.stdout) + String(e.stderr) }
      }
    }
    const pr = run('--kind', 'product', '--base', 'main', 'src')
    expect(pr.code).toBe(1)
    expect(pr.out).toContain('✗ дизайн-система')
    expect(run('--kind', 'product', 'src').code).toBe(0)
    expect(run('--kind', 'product', '--strict', 'src').code).toBe(1)
    expect(run('src').code).toBe(2)

    g('checkout', '-q', 'main')
    put('src/fresh.stories.tsx', `export default { title: 'Части продукта/Шапка' }\n`)
    put('src/fresh2.stories.tsx', `export default { title: 'Шапка' }\n`)
    const local = run('--kind', 'product', '--base', 'main', 'src')
    expect(local.code).toBe(1)
    expect(local.out).toContain('src/fresh2.stories.tsx')
    expect(local.out).not.toContain('src/fresh.stories.tsx:')
  })
})
