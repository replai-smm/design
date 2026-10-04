import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { manyPosts, posts, today, weekStart, type Post } from '../stories/df-fixtures'
import { ActionArea } from './Button'
import { addWeeks, WeekCalendar, type WeekCalendarProps } from './WeekCalendar'

const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })

/** Карточка поста DF: время, «⏰ отложен» или оценка, текст, 👍 👁. */
function PostCard({ p }: { p: Post }) {
  return (
    <>
      <span className="flex flex-wrap items-center gap-2 text-label-01 text-text-secondary">
        <time dateTime={p.at.toISOString()}>{time.format(p.at)}</time>
        {p.postponed ? <span>⏰ отложен</span> : p.grade && <span>оценка {p.grade}</span>}
      </span>
      <span className="line-clamp-3 text-body-compact-01 text-text-primary">{p.text}</span>
      {!p.postponed && (
        <span className="text-label-01 text-text-secondary">
          👍 {p.likes ?? 0} · 👁 {p.views ?? 0}
        </span>
      )}
    </>
  )
}

const base: WeekCalendarProps<Post> = {
  label: 'Публикации недели',
  weekStart,
  today,
  items: posts,
  getKey: (p) => p.id,
  getDate: (p) => p.at,
  renderItem: (p) => <PostCard p={p} />,
  onItemClick: () => {},
  onAddDay: () => {},
}

function WithNav(props: Partial<WeekCalendarProps<Post>>) {
  const [week, setWeek] = useState(weekStart)
  return <WeekCalendar {...base} {...props} weekStart={week} nav={{ onPrev: () => setWeek(addWeeks(week, -1)), onNext: () => setWeek(addWeeks(week, 1)) }} />
}

const meta = {
  title: 'Компоненты/Неделя',
  component: WeekCalendar<Post>,
  parameters: { layout: 'padded' },
  args: base,
} satisfies Meta<typeof WeekCalendar<Post>>
export default meta
type S = StoryObj<typeof meta>

/** Неделя с понедельника: выходные со своей шапкой, сегодня — словом; «+» в дне, пустой день — «Нет публикаций». */
export const Обычное: S = { render: (a) => <WithNav {...a} /> }

export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }

export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Неделя не загрузилась', description: 'Сервер не ответил.', onRetry: () => {} } } }

export const БезСообщества: S = {
  tags: ['state:первый запуск'],
  args: { items: [], empty: { kind: 'первый запуск', title: 'Выберите сообщество', description: 'Календарь покажет публикации выбранного сообщества.', action: <ActionArea primary={{ label: 'Выбрать сообщество' }} label="Первый шаг" /> } },
}

export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { items: [], empty: { kind: 'ничего не найдено', title: 'На этой неделе публикаций нет' } } }

/** Пустая неделя без `empty`: дни на месте, в каждом «Нет публикаций» и «+». */
export const ПустаяНеделя: S = { args: { items: [] } }

/** Много постов: в дне первые три и «ещё N». */
export const Много: S = { tags: ['state:много'], args: { items: manyPosts, dayLimit: 3 } }
