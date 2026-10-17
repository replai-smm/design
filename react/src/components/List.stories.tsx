import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, groups, many, type GroupRow } from '../stories/fixtures'
import { Button } from './Button'
import { List } from './Collection'

const row = (r: GroupRow) => (
  <span className="flex min-w-0 flex-col gap-tight">
    <span className="truncate text-fg">{r.name}</span>
    <span className="truncate text-caption text-fg-muted">
      {r.client} · {r.reason}
    </span>
  </span>
)

const meta = {
  title: 'Коллекции/Список',
  component: List<GroupRow>,
  parameters: { layout: 'padded' },
  args: { label: 'Группы', rows: groups, renderRow: row, getKey: (r: GroupRow) => r.id, getStatus: (r: GroupRow) => r.status, onSelect: () => {}, className: 'max-w-wide' },
} satisfies Meta<typeof List<GroupRow>>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Открытая строка — «выбрано» и aria-current (её карточка видна рядом). */
export const Выбрана: S = { args: { selectedKey: 'g6' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Список не загрузился', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { rows: [], empty: { kind: 'первый запуск', title: 'Бесед пока нет' } } }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'Ничего не найдено', action: <Button>Сбросить поиск</Button> } } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа к беседам' } } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
