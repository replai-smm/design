import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { chat } from '../stories/df-fixtures'
import { ChatThread } from './ChatThread'
import { ReplyBox } from './ReplyBox'
import { StateView } from './StateView'
import { ThreeColumn, type ColumnIndex } from './ThreeColumn'

const dialogs = [
  { id: 'd1', name: 'Анна Петрова', last: 'А можно заказать торт к субботе?' },
  { id: 'd2', name: 'Иван Смирнов', last: 'Спасибо, всё получил' },
  { id: 'd3', name: 'Мария К.', last: 'Есть ли доставка в Заречный?' },
]
const groups = ['Кофейня «Зерно»', 'Пекарня «Колос»', 'Цветы «Флокс»']

function Demo({ start = 0, picked = false }: { start?: ColumnIndex; picked?: boolean }) {
  const [active, setActive] = useState<ColumnIndex>(start)
  const [group, setGroup] = useState<string | null>(picked ? groups[0] : null)
  const [dialog, setDialog] = useState<string | null>(picked ? 'd1' : null)
  const item = 'flex min-h-12 w-full cursor-pointer flex-col items-start justify-center gap-1 border-b border-border-subtle-01 px-4 py-2 text-start hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2'
  return (
    <div className="h-screen max-h-full">
      <ThreeColumn
        labels={['Сообщества', 'Диалоги', 'Переписка']}
        active={active}
        onBack={setActive}
        first={
          <ul className="m-0 list-none p-0">
            {groups.map((g) => (
              <li key={g}>
                <button type="button" aria-current={g === group || undefined} className={item + (g === group ? ' bg-layer-selected-01' : '')} onClick={() => (setGroup(g), setActive(1))}>
                  <span className="text-body-compact-01 text-text-primary">{g}</span>
                </button>
              </li>
            ))}
          </ul>
        }
        second={
          group ? (
            <ul className="m-0 list-none p-0">
              {dialogs.map((d) => (
                <li key={d.id}>
                  <button type="button" aria-current={d.id === dialog || undefined} className={item + (d.id === dialog ? ' bg-layer-selected-01' : '')} onClick={() => (setDialog(d.id), setActive(2))}>
                    <span className="text-body-compact-01 text-text-primary">{d.name}</span>
                    <span className="text-label-01 text-text-secondary">{d.last}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4">
              <StateView kind="первый запуск" title="Выберите сообщество слева" />
            </div>
          )
        }
        third={
          dialog ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatThread label="Переписка с Анной Петровой" messages={chat} className="flex-1" />
              <div className="border-t border-border-subtle-01 p-4">
                <ReplyBox label="Ответ клиенту" enterToSend={false} onSend={() => {}} />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <StateView kind="первый запуск" title="Выберите диалог" />
            </div>
          )
        }
      />
    </div>
  )
}

const meta = {
  title: 'Паттерны/Три колонки',
  component: ThreeColumn,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ThreeColumn>
export default meta
type S = StoryObj<typeof meta>

const noArgs = { labels: ['', '', ''] as [string, string, string], active: 0 as ColumnIndex, onBack: () => {}, first: null, second: null, third: null }

/** Ноутбук: три колонки рядом. Телефон: одна колонка, нажатие ведёт дальше, «← назад» — обратно. */
export const Обычное: S = { args: noArgs, render: () => <Demo picked /> }

/** Ничего не выбрано: подсказки «Выберите …» во второй и третьей колонке. */
export const НичегоНеВыбрано: S = { tags: ['state:первый запуск'], args: noArgs, render: () => <Demo /> }

/** Телефон на третьей колонке (переписка) — сверху «← Диалоги». */
export const ТелефонПереписка: S = { args: noArgs, render: () => <Demo start={2} picked /> }
