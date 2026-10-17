import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const meta = {
  title: 'Поля/Выбор',
  component: Select,
  parameters: { layout: 'padded' },
  args: {
    label: 'Роль',
    placeholder: 'Выберите роль',
    options: [
      { value: 'admin', label: 'Админ' },
      { value: 'km', label: 'Контент-менеджер' },
      { value: 'target', label: 'Таргетолог' },
    ],
    className: 'max-w-narrow',
  },
} satisfies Meta<typeof Select>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: 'Выберите роль: без неё сотрудник не войдёт' } }
