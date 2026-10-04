import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterBar, useUrlFilters, type FilterDef, type FilterValue } from './FilterBar'

const filters: FilterDef[] = [
  {
    key: 'статус',
    label: 'Статус',
    options: [
      { value: 'падает', label: 'падает', count: 2 },
      { value: 'хотят изменить', label: 'хотят изменить', count: 1 },
      { value: 'работает', label: 'работает', count: 3 },
    ],
  },
  { key: 'клиент', label: 'Клиент', options: [{ value: 'зерно', label: 'Зерно' }, { value: 'асана', label: 'Асана' }] },
]

function Demo({ initial }: { initial: FilterValue }) {
  const [value, setValue] = useState<FilterValue>(initial)
  return <FilterBar filters={filters} value={value} onChange={setValue} search={{ label: 'Поиск по группам', placeholder: 'Название группы' }} />
}

/** Фильтры в адресе страницы: ссылку можно переслать, «назад» возвращает прежний вид. */
function InUrl() {
  const [value, setValue] = useUrlFilters(['статус', 'клиент', 'q'])
  return <FilterBar filters={filters} value={value} onChange={setValue} search={{ label: 'Поиск по группам' }} />
}

const meta = {
  title: 'Компоненты/Фильтры и поиск',
  component: FilterBar,
  parameters: { layout: 'padded' },
  args: { filters, value: {}, onChange: () => {} },
} satisfies Meta<typeof FilterBar>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = { render: () => <Demo initial={{}} /> }
export const ВыбранФильтр: S = { render: () => <Demo initial={{ статус: 'падает', q: 'кофе' }} /> }
export const ВАдресе: S = { render: () => <InUrl /> }

const periods: FilterDef[] = [
  {
    key: 'период',
    label: 'Период',
    required: true,
    options: [
      { value: '30', label: '30 дней' },
      { value: '90', label: '90 дней' },
      { value: 'свой', label: '📅 период' },
    ],
  },
]

function Required() {
  const [value, setValue] = useState<FilterValue>({})
  return <FilterBar filters={periods} value={value} onChange={setValue} />
}

/** Выбор обязателен (`required`): без «все», выбранный не снимается — режим, а не фильтр. Без значения — первый. */
export const ОбязательныйВыбор: S = { render: () => <Required /> }
