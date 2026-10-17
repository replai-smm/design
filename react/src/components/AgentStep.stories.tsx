import type { Meta, StoryObj } from '@storybook/react-vite'
import { AgentStep } from './AgentStep'
import { CodeBlock } from './CodeBlock'
import { longCode, shellOutput, testRun } from '../stories/agent-fixtures'

const meta = {
  title: 'Паттерны/Шаг агента',
  component: AgentStep,
  parameters: { layout: 'padded' },
  args: { tool: 'Bash', target: 'npm test', progress: 'done', summary: 'код 0 · 3,2 с', children: <CodeBlock code={testRun} label="вывод" /> },
  decorators: [(Story) => <div className="flex max-w-2xl flex-col gap-items">{<Story />}</div>],
} satisfies Meta<typeof AgentStep>
export default meta
type S = StoryObj<typeof meta>

/** Строки инструментов, фоновый агент и команда человека — одним словарём хода. */
export const Обычное: S = {
  render: (args) => (
    <>
      <AgentStep {...args} />
      <AgentStep tool="Read" target="src/export/index.ts" progress="done" summary="88 строк" />
      <AgentStep tool="Edit" target="src/export/csv.ts" progress="running" />
      <AgentStep tool="Агент · Explore" target="найти, где собирается список комментариев" variant="agent" progress="running" last="Read src/comments/list.ts" />
      <AgentStep tool="Команда" target="npm test" variant="shell" progress="running" note="песочница: только чтение" stop={{ onStop: () => {} }}>
        <CodeBlock code={shellOutput} label="вывод" />
      </AgentStep>
    </>
  ),
}
/** Ошибка раскрыта сразу: причину не прячем. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { progress: 'error', summary: 'код 1', children: <CodeBlock code="Error: Cannot find module 'csv'" label="вывод" /> } }
/** Длинный вывод — блок кода не выше 12 строк. */
export const Много: S = { tags: ['state:много'], args: { progress: 'error', target: 'npm run build', children: <CodeBlock code={longCode} label="вывод" /> } }
