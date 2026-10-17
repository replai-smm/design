import type { Meta, StoryObj } from '@storybook/react-vite'
import { csvCode, testRun } from '../stories/agent-fixtures'
import { AgentStep } from './AgentStep'
import { CodeBlock } from './CodeBlock'
import { Stack } from './layout'

const meta = {
  title: 'Паттерны/Шаг агента',
  component: AgentStep,
  parameters: { layout: 'padded' },
  args: { tool: 'Read', state: 'done' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof AgentStep>
export default meta
type S = StoryObj<typeof meta>

/** Вызовы инструментов строкой (готово — раскрывается в результат, идёт — дуга) и фоновый агент со своими шагами. */
export const Обычное: S = {
  render: () => (
    <Stack gap="02">
      <AgentStep tool="Read" target="src/export/csv.ts" state="done" summary="42 строки">
        <CodeBlock code={csvCode} label="src/export/csv.ts" />
      </AgentStep>
      <AgentStep tool="Bash" target="npm test" state="done" summary="код 0 · 3,2 с" defaultOpen>
        <CodeBlock code={testRun} label="bash" copy={false} />
      </AgentStep>
      <AgentStep tool="Агент · Explore" target="где пишется выгрузка комментариев" state="running" variant="agent" progress="шаг 4 · Grep «toCsv» в src/" defaultOpen>
        <AgentStep tool="Glob" target="src/**/export*" state="done" summary="3 файла" />
        <AgentStep tool="Read" target="src/export/index.ts" state="done" summary="88 строк" />
        <AgentStep tool="Grep" target="toCsv" state="running" />
      </AgentStep>
    </Stack>
  ),
}
