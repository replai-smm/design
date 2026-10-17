import type { Meta, StoryObj } from '@storybook/react-vite'
import { csvCode } from '../stories/agent-fixtures'
import { CodeBlock } from './CodeBlock'
import { Prose, ProseHtml } from './Prose'

const meta = {
  title: 'Компоненты/Текст ответа',
  component: Prose,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Prose>
export default meta
type S = StoryObj<typeof meta>

/** Ответ агента: абзац, список, `код` в строке, блок кода; текст ещё набирается — курсор в конце. */
export const Обычное: S = {
  render: () => (
    <Prose streaming>
      <ProseHtml html="<p>Экспорт собирает строки в <code>toCsv</code> и отдаёт файл одним ответом. Что поменял:</p><ul><li>разделитель — точка с запятой (Excel в России);</li><li>текст в кавычках, перевод строки внутри не ломает файл.</li></ul>" />
      <CodeBlock code={csvCode} label="src/export/csv.ts" />
      <ProseHtml html="<p>Осталось проверить на 10 тысячах комментариев, чтобы ответ не упёрся в</p>" />
    </Prose>
  ),
}
