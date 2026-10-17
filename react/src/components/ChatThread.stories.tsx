import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { chat, chatFailed, longChat } from '../stories/df-fixtures'
import { AgentStep } from './AgentStep'
import { Button } from './Button'
import { ChatThread, type ChatMessage } from './ChatThread'
import { Prose, ProseHtml } from './Prose'

const meta = {
  title: 'Паттерны/Переписка',
  component: ChatThread,
  parameters: { layout: 'padded' },
  args: { label: 'Переписка с Анной Петровой', messages: chat },
  decorators: [
    (Story) => (
      <div className="flex h-96 max-w-2xl flex-col border border-border-subtle-01 bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatThread>
export default meta
type S = StoryObj<typeof meta>

/** Входящие слева, наши справа; разделитель дня; наше сообщение ещё отправляется. */
export const Обычное: S = {}

/** Наше сообщение не ушло: знак, слово, причина и «Повторить». */
export const НеОтправлено: S = { tags: ['state:ошибка'], args: { messages: chatFailed } }

/** Ответ ИИ с тихими кнопками и строка «ИИ думает…». */
export const ОтветИИ: S = {
  args: {
    label: 'Чат с ИИ по проекту «Зерно»',
    ownLabel: 'вы',
    messages: [
      { id: 'q', direction: 'out', time: '11:00', text: 'Какие посты зашли лучше всего в сентябре?' },
      {
        id: 'a',
        direction: 'in',
        author: 'ИИ',
        time: '11:01',
        text: 'Лучше всего — посты про новинки меню: охват в 2 раза выше среднего.',
        actions: (
          <>
            <Button variant="ghost" size="sm">Копировать</Button>
            <Button variant="ghost" size="sm">→ в Постинг</Button>
          </>
        ),
      },
      { id: 'q2', direction: 'out', time: '11:02', text: 'А что с конкурсами?' },
    ],
    pending: 'ИИ думает…',
  },
}

export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }

export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { state: 'error', error: { title: 'Переписка не загрузилась', description: 'ВК не ответил. Последнее сообщение: «А можно заказать торт к субботе?»', onRetry: () => {} } },
}

export const ПустойЧат: S = {
  tags: ['state:первый запуск'],
  args: { messages: [], empty: { kind: 'первый запуск', title: 'Спросите первое', description: 'Например: «Какие посты зашли лучше всего в сентябре?»' } },
}

function LongThread() {
  const [shown, setShown] = useState<ChatMessage[]>(longChat.slice(20))
  const done = shown.length >= longChat.length
  return (
    <ChatThread
      label="Переписка с Иваном"
      messages={shown}
      earlier={{ onLoad: () => setShown(longChat.slice(Math.max(0, longChat.length - shown.length - 10))), done, label: `Показать более ранние (всего ${longChat.length})` }}
    />
  )
}

/** Длинная переписка: «⇡ показать более ранние» вставляет сверху без прыжка; всё загружено — «Это вся переписка». */
export const Много: S = { tags: ['state:много'], render: () => <LongThread /> }

export const ВсяПереписка: S = { args: { messages: chat, earlier: { onLoad: () => {}, done: true } } }

/** Разговор с агентом: ответ во всю ширину (текст и шаги), весть со стороны — рамкой слева, наше «в очереди». */
export const САгентом: S = {
  args: {
    label: 'Сессия: экспорт комментариев',
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
            <AgentStep tool="Read" target="src/export/index.ts" state="done" summary="88 строк" />
            <Prose streaming>
              <ProseHtml html="<p>Экспорт кладу рядом с JSON-выгрузкой: тот же запрос, другой формат.</p>" />
            </Prose>
          </>
        ),
      },
      { id: 'n1', direction: 'in', variant: 'notice', author: 'orbit · весть', time: '14:02', text: 'Прод replai v2.41 — датчик видит новую версию, тесты зелёные.' },
      { id: 'u2', direction: 'out', time: '14:03', text: 'И фильтр по дате тоже.', status: 'queued' },
    ] as ChatMessage[],
  },
}
