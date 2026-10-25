import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { chat, chatFailed, csvCode, longChat } from '../stories/fixtures'
import { ChatThread, type ChatMessage } from './ChatThread'
import { CodeBlock } from './CodeBlock'
import { Prose, ProseHtml } from './Prose'

const meta = {
  title: 'Компоненты/Составные/Переписка',
  component: ChatThread,
  parameters: { layout: 'padded' },
  args: { label: 'Переписка с Анной Петровой', messages: chat },
  decorators: [
    (Story) => (
      <div className="flex h-dvh max-w-window flex-col rounded-surface border border-line bg-surface">
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
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Переписка не загрузилась', description: 'Сервер не ответил.', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { messages: [], empty: { kind: 'первый запуск', title: 'Спросите первое', description: 'Например: «Какие товары продавались лучше всего в сентябре?»' } } }

function LongThread() {
  const [shown, setShown] = useState<ChatMessage[]>(longChat.slice(20))
  return <ChatThread label="Переписка с Иваном" messages={shown} earlier={{ onLoad: () => setShown(longChat.slice(Math.max(0, longChat.length - shown.length - 10))), done: shown.length >= longChat.length }} />
}
/** Длинная: «Показать более ранние» вставляет сверху без прыжка. */
export const Много: S = { tags: ['state:много'], render: () => <LongThread /> }

/** Разговор с агентом: ответ во всю ширину (текст и код), весть со стороны — поверхность с меткой, наше «в очереди». */
export const САгентом: S = {
  args: {
    label: 'Сессия: экспорт заказов',
    ownLabel: 'Анна',
    messages: [
      { id: 'u1', direction: 'out', time: '14:00', text: 'Добавь экспорт заказов в CSV.' },
      {
        id: 'a1',
        direction: 'in',
        variant: 'wide',
        author: 'агент',
        time: '14:01',
        text: (
          <>
            <Prose>
              <ProseHtml html="<p>Экспорт кладу рядом с JSON-выгрузкой:</p><ul><li>тот же запрос</li><li>другой формат</li></ul>" />
            </Prose>
            <CodeBlock code={csvCode} label="src/export/csv.ts" />
          </>
        ),
      },
      { id: 'n1', direction: 'in', variant: 'notice', author: 'система · весть', time: '14:02', text: 'Выпуск v2.41 — сервер видит новую версию, тесты зелёные.' },
      { id: 'u2', direction: 'out', time: '14:03', text: 'И фильтр по дате тоже.', status: 'idle' },
    ] as ChatMessage[],
    pending: 'агент думает…',
  },
}
