import type { Meta, StoryObj } from '@storybook/react-vite'
import { csvCode } from '../stories/agent-fixtures'
import { CodeBlock } from './CodeBlock'

const meta = {
  title: 'Компоненты/Блок кода',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  args: { code: csvCode, label: 'src/export/csv.ts' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof CodeBlock>
export default meta
type S = StoryObj<typeof meta>

/** Код как есть: подпись — путь, «Копировать»; длинная строка прокручивается вбок внутри блока. */
export const Обычное: S = {}
