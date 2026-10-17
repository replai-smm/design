import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from './CodeBlock'
import { csvCode, longCode } from '../stories/agent-fixtures'

const meta = {
  title: 'Поверхности/Блок кода',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  args: { code: csvCode, label: 'src/export/csv.ts' },
} satisfies Meta<typeof CodeBlock>
export default meta
type S = StoryObj<typeof meta>

/** Утопленная поверхность, моно-шрифт Plex Mono, «Копировать». */
export const Обычное: S = {}
/** 200 строк и строка в 300 знаков: высота не больше 12 строк, длинное — вбок внутри. */
export const Много: S = { tags: ['state:много'], args: { code: longCode, label: 'вывод' } }
