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

/** Набор закончен: курсора нет, область не «занята»; в тексте таблица и цитата. */
export const НаборЗакончен: S = {
  render: () => (
    <Prose>
      <ProseHtml html="<p>Сравнил два способа выгрузки:</p><table><thead><tr><th>Способ</th><th>Строк в секунду</th><th>Память</th></tr></thead><tbody><tr><td>целиком в памяти</td><td>12 000</td><td>растёт с файлом</td></tr><tr><td>потоком</td><td>9 500</td><td>постоянная</td></tr></tbody></table><blockquote><p>Бухгалтерии нужен файл, который открывается двойным щелчком.</p></blockquote><p>Беру потоковый: на 10 тысячах комментариев разницы не видно, зато на 200 тысячах сервер не ляжет.</p>" />
    </Prose>
  ),
}
