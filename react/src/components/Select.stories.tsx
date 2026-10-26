import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select, SelectItem, SelectItemGroup } from './Select'

const meta = {
  title: 'Компоненты/Поля/Select',
  component: Select,
  parameters: { layout: 'padded' },
  args: {
    id: 'role',
    labelText: 'Роль',
    defaultValue: '',
    className: 'max-w-narrow',
    children: (
      <>
        <SelectItem value="" text="Выберите роль" disabled hidden />
        <SelectItemGroup label="Правка">
          <SelectItem value="admin" text="Админ" />
          <SelectItem value="editor" text="Редактор" />
        </SelectItemGroup>
        <SelectItemGroup label="Просмотр">
          <SelectItem value="viewer" text="Читатель" />
        </SelectItemGroup>
      </>
    ),
  },
} satisfies Meta<typeof Select>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Ошибка: S = { tags: ['state:ошибка'], args: { invalid: true, invalidText: 'Выберите роль: без неё сотрудник не войдёт' } }
