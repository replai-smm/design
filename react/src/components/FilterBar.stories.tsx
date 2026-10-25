import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterBar, type FilterValue } from './FilterBar'

function Demo() {
  const [v, set] = useState<FilterValue>({ период: '30', статус: 'падает' })
  return (
    <FilterBar
      value={v}
      onChange={set}
      search={{ labelText: 'Поиск по группам' }}
      filters={[
        { key: 'статус', label: 'Статус', options: [{ value: 'падает', label: 'падает', count: 2 }, { value: 'работает', label: 'работает', count: 5 }] },
        { key: 'период', label: 'Период', required: true, options: [{ value: '30', label: '30 дней' }, { value: '90', label: '90 дней' }] },
      ]}
    />
  )
}

const meta = {
  title: 'Компоненты/Составные/FilterBar',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>
export default meta
type S = StoryObj<typeof meta>

/** Поиск и ряды сегментов; «все» — сброс; обязательный выбор — без «все». */
export const Обычное: S = {}
