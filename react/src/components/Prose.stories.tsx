import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from './CodeBlock'
import { Prose, ProseHtml } from './Prose'
import { csvCode } from '../stories/fixtures'

const meta = {
  title: 'Компоненты/Элементы/Prose',
  component: Prose,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Prose>
export default meta
type S = StoryObj<typeof meta>

const html = `<h3>Что сделал</h3><p>Добавил выгрузку комментариев в CSV. Файл собирается на сервере, <code>toCsv</code> кавычит текст.</p><ul><li>кнопка «Выгрузить» в шапке списка</li><li>разделитель — точка с запятой</li><li>дата — ISO</li></ul><ol><li>собрать строки</li><li>отдать файл</li></ol><blockquote>Тесты: 20 из 20 зелёные.</blockquote><p>Подробнее — <a href="#pr">PR 412</a>.</p>`

/** Абзацы, списки с маркерами, код, цитата — ролью «чтение». */
export const Обычное: S = {
  render: () => (
    <Prose>
      <ProseHtml html={html} />
      <CodeBlock code={csvCode} label="src/export/csv.ts" />
    </Prose>
  ),
}

/** Текст ещё набирается: курсор в конце. */
export const Набор: S = { render: () => <Prose streaming><p>Смотрю, где собирается список комментариев</p></Prose> }
