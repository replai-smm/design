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
  title: 'ДС/Фильтры и поиск',
  component: FilterBar,
  parameters: { layout: 'padded' },
  args: { filters, value: {}, onChange: () => {} },
} satisfies Meta<typeof FilterBar>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = { render: () => <Demo initial={{}} /> }
export const ВыбранФильтр: S = { render: () => <Demo initial={{ статус: 'падает', q: 'кофе' }} /> }
export const ВАдресе: S = { render: () => <InUrl /> }
