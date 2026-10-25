import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, many, projects, type ProjectRow } from '../stories/fixtures'
import { Button } from './Button'
import { List } from './Collection'

const row = (r: ProjectRow) => (
  <span className="flex min-w-0 flex-col gap-tight">
    <span className="truncate text-fg">{r.name}</span>
    <span className="truncate text-caption text-fg-muted">
      {r.team} · {r.reason}
    </span>
  </span>
)

const meta = {
  title: 'Компоненты/Коллекции/Список',
  component: List<ProjectRow>,
  parameters: { layout: 'padded' },
  args: { label: 'Проекты', rows: projects, renderRow: row, getKey: (r: ProjectRow) => r.id, onSelect: () => {}, className: 'max-w-wide' },
} satisfies Meta<typeof List<ProjectRow>>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Открытая строка — «выбрано» и aria-current (её карточка видна рядом). */
export const Выбрана: S = { args: { selectedKey: 'p6' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Список не загрузился', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { rows: [], empty: { kind: 'первый запуск', title: 'Проектов пока нет' } } }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'Ничего не найдено', action: <Button kind="secondary">Сбросить поиск</Button> } } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа к проектам' } } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
