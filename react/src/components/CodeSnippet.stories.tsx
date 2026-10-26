import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeSnippet } from './CodeSnippet'
import { Stack } from './layout'
import { csvCode, longCode } from '../stories/fixtures'

const meta = {
  title: 'Компоненты/Поверхности/CodeSnippet',
  component: CodeSnippet,
  parameters: { layout: 'padded' },
  args: { type: 'multi', children: csvCode, 'aria-label': 'Код: экспорт в CSV' },
} satisfies Meta<typeof CodeSnippet>
export default meta
type S = StoryObj<typeof meta>

/** Утопленная плитка, Plex Mono, «Копировать»; одна строка — `type="single"`. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={5}>
      <CodeSnippet aria-label="Команда установки">npm install --save-dev vitest</CodeSnippet>
      <CodeSnippet {...args} />
    </Stack>
  ),
}
/** 200 строк и строка в 300 знаков: свёрнуто до 15 строк, «Показать ещё»; длинное — вбок внутри. */
export const Много: S = { tags: ['state:много'], args: { children: longCode, 'aria-label': 'Вывод' } }
