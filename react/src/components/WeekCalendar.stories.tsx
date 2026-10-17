import type { Meta, StoryObj } from '@storybook/react-vite'
import { manyPosts, posts, today, weekStart, type Post } from '../stories/df-fixtures'
import { StatusBadge } from './StatusBadge'
import { WeekCalendar } from './WeekCalendar'

const item = (p: Post) => (
  <>
    <span className="flex items-center gap-items text-caption text-fg-muted">
      {p.at.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      {p.postponed && <StatusBadge tone="инфо" label="отложен" />}
    </span>
    <span className="line-clamp-2">{p.text}</span>
  </>
)

const meta = {
  title: 'Коллекции/Неделя',
  component: WeekCalendar<Post>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Публикации недели',
    weekStart,
    today,
    items: posts,
    getKey: (p: Post) => p.id,
    getDate: (p: Post) => p.at,
    renderItem: item,
    onSelect: () => {},
    onAddDay: () => {},
    nav: { onPrev: () => {}, onNext: () => {}, onToday: () => {} },
  },
} satisfies Meta<typeof WeekCalendar<Post>>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Неделя не загрузилась', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { items: [], empty: { kind: 'первый запуск', title: 'Выберите сообщество слева' } } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { items: [], empty: { kind: 'ничего не найдено', title: 'По фильтру постов нет' } } }
/** Много в дне: первые три и «ещё N». */
export const Много: S = { tags: ['state:много'], args: { items: manyPosts, dayLimit: 3 } }
