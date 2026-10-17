import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { chat, chatFailed, longChat } from '../stories/df-fixtures'
import { csvCode } from '../stories/agent-fixtures'
import { AgentStep } from './AgentStep'
import { Button } from './Button'
import { ChatThread, type ChatMessage } from './ChatThread'
import { CodeBlock } from './CodeBlock'
import { DecisionCard } from './DecisionCard'
import { Prose, ProseHtml } from './Prose'

const meta = {
  title: 'Паттерны/Переписка',
  component: ChatThread,
  parameters: { layout: 'padded' },
  args: { label: 'Переписка с Анной Петровой', messages: chat },
  decorators: [
    (Story) => (
      <div className="flex h-dvh max-w-2xl flex-col rounded-surface border border-line bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatThread>
export default meta
type S = StoryObj<typeof meta>

/** Входящие слева, наши справа (утопленные); разделитель дня; наше ещё отправляется. */
export const Обычное: S = {}
/** Наше не ушло: знак, слово, причина и «Повторить». */
export const НеОтправлено: S = { tags: ['state:ошибка'], args: { messages: chatFailed } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Переписка не загрузилась', description: 'ВК не ответил.', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { messages: [], empty: { kind: 'первый запуск', title: 'Спросите первое', description: 'Например: «Какие посты зашли лучше всего в сентябре?»' } } }

function LongThread() {
  const [shown, setShown] = useState<ChatMessage[]>(longChat.slice(20))
  return <ChatThread label="Переписка с Иваном" messages={shown} earlier={{ onLoad: () => setShown(longChat.slice(Math.max(0, longChat.length - shown.length - 10))), done: shown.length >= longChat.length }} />
}
/** Длинная: «Показать более ранние» вставляет сверху без прыжка. */
export const Много: S = { tags: ['state:много'], render: () => <LongThread /> }

/** Разговор с агентом: ответ во всю ширину (текст, шаги, решение), весть со стороны — поверхность с меткой, наше «в очереди». */
export const САгентом: S = {
  args: {
    label: 'Сессия: экспорт комментариев',
    ownLabel: 'Саша',
    messages: [
      { id: 'u1', direction: 'out', time: '14:00', text: 'Добавь экспорт комментариев в CSV.' },
      {
        id: 'a1',
        direction: 'in',
        variant: 'wide',
        author: 'агент',
        time: '14:01',
        text: (
          <>
            <AgentStep tool="Read" target="src/export/index.ts" progress="done" summary="88 строк">
              <CodeBlock code={csvCode} label="src/export/csv.ts" />
            </AgentStep>
            <AgentStep tool="Bash" target="npm test" progress="running" />
            <Prose>
              <ProseHtml html="<p>Экспорт кладу рядом с JSON-выгрузкой:</p><ul><li>тот же запрос</li><li>другой формат</li></ul>" />
            </Prose>
            <DecisionCard kicker="Изменение n5t2vd" title="Экспорт в CSV готов" facts={['PR 418', 'CI зелёный']} question="На прод?" primary={{ label: 'На прод' }} actions={<Button>Позже</Button>} />
          </>
        ),
      },
      { id: 'n1', direction: 'in', variant: 'notice', author: 'orbit · весть', time: '14:02', text: 'Прод replai v2.41 — датчик видит новую версию, тесты зелёные.' },
      { id: 'u2', direction: 'out', time: '14:03', text: 'И фильтр по дате тоже.', status: 'idle' },
    ] as ChatMessage[],
    pending: 'агент думает…',
  },
}
