import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, groups, many, type GroupRow } from '../stories/fixtures'
import { Button } from './Button'
import { List } from './Collection'

const meta = {
  title: 'ДС/Список',
  component: List<GroupRow>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Группы клиентов',
    rows: groups,
    getKey: (r: GroupRow) => r.id,
    getStatus: (r: GroupRow) => r.status,
    statusLabel: (id) => ({ 'work.failing': 'не отвечает', 'work.working': 'отвечает' })[id as string],
    renderRow: (r: GroupRow) => (
      <span className="flex min-w-0 flex-col">
        <span className="text-body-compact-01 text-text-primary">{r.name}</span>
        <span className="text-label-01 text-text-secondary">{r.reason}</span>
      </span>
    ),
    onRowClick: () => {},
    rowAction: (r: GroupRow) => (r.status === 'work.failing' ? <Button variant="ghost" size="sm">Починить</Button> : null),
  },
} satisfies Meta<typeof List<GroupRow>>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Список не загрузился', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { rows: [], empty: { kind: 'первый запуск', title: 'Групп пока нет', description: 'Подключите первую группу VK.' } } }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'Ничего не найдено' } } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа' } } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
/** Открытая строка (карточка видна рядом, DF «Сообщения»): фон выбора и aria-current. */
export const ВыбраннаяСтрока: S = { args: { activeKey: groups[1]?.id } }
