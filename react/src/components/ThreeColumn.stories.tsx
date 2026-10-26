import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { chat } from '../stories/fixtures'
import { ChatThread } from './ChatThread'
import { ContainedList, ContainedListItem } from './ContainedList'
import { ReplyBox } from './ReplyBox'
import { StateView } from './StateView'
import { ThreeColumn, type ColumnIndex } from './ThreeColumn'

const dialogs = [
  { id: 'd1', name: 'Анна Петрова', last: 'А можно поменять адрес доставки?' },
  { id: 'd2', name: 'Иван Смирнов', last: 'Спасибо, всё получил' },
  { id: 'd3', name: 'Мария К.', last: 'Есть ли доставка в Заречный?' },
]
const teams = [
  { id: 't1', name: 'Продажи' },
  { id: 't2', name: 'Поддержка' },
  { id: 't3', name: 'Логистика' },
]

function Demo({ picked = false, phone = 'stack' as 'stack' | 'sheets' }: { picked?: boolean; phone?: 'stack' | 'sheets' }) {
  const [active, setActive] = useState<ColumnIndex>(picked ? 2 : 0)
  const [team, setTeam] = useState<string | null>(picked ? 't1' : null)
  const [dialog, setDialog] = useState<string | null>(picked ? 'd1' : null)
  const [sheet, setSheet] = useState<0 | 2 | null>(null)
  return (
    <div className="h-dvh">
      <ThreeColumn
        labels={['Команды', 'Диалоги', 'Переписка']}
        active={active}
        onBack={setActive}
        phone={phone}
        sheet={sheet}
        onSheetChange={setSheet}
        first={
          <div className="p-items">
            <ContainedList label="Команды">
              {teams.map((t) => (
                <ContainedListItem key={t.id} aria-current={t.id === team || undefined} onClick={() => (setTeam(t.id), setActive(1))}>
                  {t.name}
                </ContainedListItem>
              ))}
            </ContainedList>
          </div>
        }
        second={
          team ? (
            <div className="p-items">
              <ContainedList label="Диалоги">
                {dialogs.map((d) => (
                  <ContainedListItem key={d.id} aria-current={d.id === dialog || undefined} onClick={() => (setDialog(d.id), setActive(2))}>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{d.name}</span>
                      <span className="truncate text-caption text-fg-muted">{d.last}</span>
                    </span>
                  </ContainedListItem>
                ))}
              </ContainedList>
            </div>
          ) : (
            <div className="p-blocks">
              <StateView kind="первый запуск" title="Выберите команду слева" />
            </div>
          )
        }
        third={
          dialog ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatThread label="Переписка с Анной Петровой" messages={chat} className="flex-1" />
              <div className="border-t border-line p-blocks">
                <ReplyBox labelText="Ответ покупателю" send="button" onSend={() => {}} />
              </div>
            </div>
          ) : (
            <div className="p-blocks">
              <StateView kind="первый запуск" title="Выберите диалог" />
            </div>
          )
        }
      />
    </div>
  )
}

const meta = {
  title: 'Компоненты/Составные/ThreeColumn',
  component: Demo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>
export default meta
type S = StoryObj<typeof meta>

/** Выбрано: на ноутбуке три колонки, на телефоне — переписка с «← Диалоги». */
export const Обычное: S = { args: { picked: true } }
/** Ничего не выбрано: подсказки на месте колонок. */
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'] }
/** Рабочее место: на телефоне — лента, колонки — шторками. */
export const Шторки: S = { args: { picked: true, phone: 'sheets' } }
