import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select, type SelectOption } from './Select'
import { Stack } from './layout'

const periods: SelectOption[] = [
  { value: '7', label: 'Неделя' },
  { value: '30', label: 'Месяц' },
  { value: '90', label: 'Квартал' },
  { value: 'all', label: 'Всё время', disabled: true },
]

function Demo() {
  const [v, setV] = useState('30')
  return <Select label="Период" options={periods} value={v} onChange={setV} helperText="За сколько дней считать" />
}

const meta = {
  title: 'Компоненты/Выбор',
  component: Select,
  parameters: { layout: 'padded' },
  args: { label: 'Период', options: periods },
} satisfies Meta<typeof Select>
export default meta
type S = StoryObj<typeof meta>

/** Родной выбор системы: на телефоне — колесо, клавиатура и читалка — без доработок. */
export const Обычное: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <Demo />
      <Select label="Тип поста" options={[{ value: 'post', label: 'Пост' }, { value: 'story', label: 'История' }]} placeholder="Выберите тип" />
    </Stack>
  ),
}

export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="06" className="max-w-md">
      <Select label="Тип поста" options={[{ value: 'post', label: 'Пост' }]} placeholder="Выберите тип" error="Выберите тип поста" />
    </Stack>
  ),
}

export const Недоступно: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <Select label="Период" options={periods} defaultValue="7" disabled helperText="Период задаёт админ" />
    </Stack>
  ),
}
