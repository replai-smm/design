import type { Meta, StoryObj } from '@storybook/react-vite'
import { csvCode, shellOutput, testRun } from '../stories/agent-fixtures'
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

/** Ошибка раскрыта сразу, причина видна: крест и слово «ошибка», не только цвет. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="02">
      <AgentStep tool="Bash" target="npm test -- src/inbox" state="error" summary="код 1 · 2,8 с">
        <CodeBlock code={'FAIL  src/inbox/filter.test.ts\n  ✗ фильтр по дате: from позже to\n    TypeError: createdAt is not a function'} label="вывод" copy={false} />
      </AgentStep>
      <AgentStep tool="Агент · Explore" target="где ломается фильтр" state="error" variant="agent" summary="остановлен">
        <AgentStep tool="Grep" target="createdAt" state="done" summary="5 мест" />
        <AgentStep tool="Read" target="src/inbox/filter.ts" state="error" summary="файла нет">
          <CodeBlock code="ENOENT: no such file or directory, open 'src/inbox/filter.ts'" label="вывод" copy={false} />
        </AgentStep>
      </AgentStep>
    </Stack>
  ),
}

/** Фоновый агент с двадцатью шагами: строка заголовка одна, шаги — внутри, свёрнуто — одна строка. */
export const ДвадцатьШагов: S = {
  tags: ['state:много'],
  render: () => (
    <AgentStep tool="Агент · Explore" target="где собираются комментарии для выгрузки" state="running" variant="agent" progress="шаг 20 · Grep «listComments» в src/" defaultOpen>
      {Array.from({ length: 20 }, (_, i) => (
        <AgentStep key={i} tool={i % 2 ? 'Read' : 'Grep'} target={i % 2 ? `src/comments/part${i}.ts` : `listComments${i}`} state={i === 19 ? 'running' : 'done'} summary={i === 19 ? undefined : `${i + 3} строк`} />
      ))}
    </AgentStep>
  ),
}

/** Команда человека (`!npm test` в поле), не шаг агента: рамка слева, `$` перед командой, вывод растёт, «Стоп» рядом со строкой; под ней — пометка. */
export const КомандаЧеловека: S = {
  render: () => (
    <Stack gap="03">
      <AgentStep tool="Команда" target="npm test" state="running" variant="shell" stop={{ onStop: () => {} }}>
        <CodeBlock code={shellOutput} label="вывод" copy={false} />
      </AgentStep>
      <AgentStep tool="Команда" target="git status" state="done" variant="shell" summary="код 0" note="песочница: только чтение">
        <CodeBlock code={'On branch main\nnothing to commit, working tree clean'} label="вывод" copy={false} />
      </AgentStep>
    </Stack>
  ),
}
