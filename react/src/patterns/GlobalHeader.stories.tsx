import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/global-header.md?raw'
import { Accordion, AccordionItem } from '../components/Accordion'
import { CountBadge } from '../components/CountBadge'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { pattern } from './story'

const MAIN = [
  { id: 'overview', label: 'Обзор' },
  { id: 'projects', label: 'Проекты', count: 3 },
  { id: 'reports', label: 'Отчёты' },
  { id: 'team', label: 'Команда' },
]
const MORE = ['Файлы', 'Счета', 'Интеграции', 'Журнал', 'Настройки'].map((label) => ({ id: label, label, count: 0 }))

/** Левая панель: основные разделы на виду, редкие — в «Ещё»; разделы — ссылки с адресом. */
function Example({ start = 'projects' }: { start?: string }) {
  const [selected, setSelected] = useState(start)
  const [moreOpen] = useState(() => MORE.some((i) => i.id === start))
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
    <nav aria-label="Разделы" className="flex w-rail flex-col gap-tight p-items">
      {MAIN.map((i) => link(i))}
      <Accordion>
        <AccordionItem title="Ещё" open={moreOpen}>
          <div className="-mx-compact flex flex-col gap-tight">{MORE.map((i) => link(i, true))}</div>
        </AccordionItem>
      </Accordion>
    </nav>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Шапка и навигация', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Выбран основной раздел: «Ещё» свёрнуто. */
export const Обычное: S = {}
/** Выбран редкий раздел: «Ещё» раскрыто. */
export const Много: S = { tags: ['state:много'], args: { start: 'Журнал' } }
