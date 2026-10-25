import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Navigation.md?raw'
import { Accordion } from '../components/Accordion'
import { CountBadge } from '../components/CountBadge'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { PatternDoc } from './doc'

const MAIN = [
  { id: 'health', label: 'Состояние', count: 2 },
  { id: 'accrual', label: 'Основные' },
  { id: 'conditions', label: 'Условия' },
  { id: 'levels', label: 'Уровни' },
]
const MORE = ['Маркет', 'Пользователи', 'Коды', 'Инвайты', 'История', 'Бот-сообщения', 'Рассылки', 'Метки'].map((label) => ({ id: label, label, count: 0 }))

/** Колонка разделов админки Арены: 4 основных на виду, 8 редких в «Ещё». Разделы — ссылки с адресом. */
function Doc({ start = 'conditions' }: { start?: string }) {
  const [selected, setSelected] = useState(start)
  const link = (item: { id: string; label: string; count?: number }, quiet = false) => (
    <a
      key={item.id}
      href={`#${item.id}`}
      aria-current={item.id === selected ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault()
        setSelected(item.id)
      }}
      className={cx('flex min-h-control items-center gap-items rounded-control px-compact text-body no-underline hover:bg-hover', FOCUS, item.id === selected ? 'bg-selected font-semibold text-fg' : quiet ? 'text-fg-muted' : 'text-fg')}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count ? <CountBadge count={item.count} /> : null}
    </a>
  )
  return (
    <PatternDoc md={md}>
      <nav aria-label="Разделы" className="flex w-rail flex-col gap-tight p-items">
        {MAIN.map((i) => link(i))}
        <Accordion title="Ещё" defaultOpen={MORE.some((i) => i.id === selected)}>
          <div className="-mx-compact flex flex-col gap-tight">{MORE.map((i) => link(i, true))}</div>
        </Accordion>
      </nav>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Навигация по разделам', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Выбран основной раздел: «Ещё» свёрнуто. */
export const Обычное: S = {}
/** Выбран редкий раздел: «Ещё» раскрыто. */
export const Много: S = { tags: ['state:много'], args: { start: 'История' } }
