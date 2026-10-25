import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const meta = {
  title: 'Компоненты/Элементы/Аватар',
  component: Avatar,
  parameters: { layout: 'padded' },
  args: { name: 'Кофейня «Зерно»' },
} satisfies Meta<typeof Avatar>
export default meta
type S = StoryObj<typeof meta>

/** Без картинки — буквы имени; без имени — значок человека. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex items-center gap-items">
      <Avatar {...args} />
      <Avatar name="Анна Петрова" />
      <Avatar />
    </div>
  ),
}

/** Картинка не загрузилась — буквы, без своего onerror в продукте. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { src: 'https://invalid.example/none.png' } }
