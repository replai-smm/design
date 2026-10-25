import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/filtering.md?raw'
import { DataTable, type DataTableColumn } from '../components/Collection'
import { FilterBar, type FilterValue } from '../components/FilterBar'
import { Heading } from '../components/Heading'
import { Section, Stack } from '../components/layout'
import type { DataState } from '../lib/vocab'
import { pattern } from './story'

interface Order {
  id: string
  item: string
  status: string
  city: string
}
const ORDERS: Order[] = [
  { id: '1041', item: 'Стол письменный', status: 'в пути', city: 'Казань' },
  { id: '1042', item: 'Лампа настольная', status: 'доставлен', city: 'Пермь' },
  { id: '1043', item: 'Кресло', status: 'в пути', city: 'Казань' },
  { id: '1044', item: 'Полка', status: 'отменён', city: 'Омск' },
]
const many = Array.from({ length: 120 }, (_, i) => ({ ...ORDERS[i % 4], id: String(2000 + i) }))
const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: 'Заказ', cell: (r) => `№ ${r.id}`, face: true },
  { key: 'item', header: 'Товар', cell: (r) => r.item, face: true, grow: 2 },
  { key: 'status', header: 'Статус', cell: (r) => r.status },
  { key: 'city', header: 'Город', cell: (r) => r.city },
]

/** Заказы: фильтр по статусу и городу, поиск, таблица; фильтр живёт в адресе. */
function Example({ state = 'ready', rows = ORDERS }: { state?: DataState; rows?: Order[] }) {
  const [filter, setFilter] = useState<FilterValue>({})
  const shown = rows.filter((r) => (!filter.status || r.status === filter.status) && (!filter.city || r.city === filter.city))
  return (
    <Section as={Stack} gap={5} className="p-blocks">
      <Heading>Заказы</Heading>
      <FilterBar
        filters={[
          { key: 'status', label: 'Статус', options: [{ value: 'в пути', label: 'в пути' }, { value: 'доставлен', label: 'доставлен' }, { value: 'отменён', label: 'отменён' }] },
          { key: 'city', label: 'Город', options: [{ value: 'Казань', label: 'Казань' }, { value: 'Пермь', label: 'Пермь' }, { value: 'Омск', label: 'Омск' }] },
        ]}
        value={filter}
        onChange={setFilter}
        search={{ label: 'Поиск по заказам' }}
      />
      <DataTable label="Заказы" rows={shown} columns={columns} state={state} error={{ title: 'Заказы не загрузились', onRetry: () => {} }} getKey={(r) => r.id} />
    </Section>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Фильтры', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error' } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
