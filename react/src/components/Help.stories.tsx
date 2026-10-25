import type { Meta, StoryObj } from '@storybook/react-vite'
import { Help } from './Help'

const meta = {
  title: 'Элементы/Справка',
  component: Help,
  parameters: { layout: 'padded' },
  args: { about: 'Окно записей', children: 'Участвуют только последние N записей сообщества. Пусто — все записи периода.' },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-slot="help"]')?.click()
  },
} satisfies Meta<typeof Help>
export default meta
type S = StoryObj<typeof meta>

/** «?» у подписи; нажатие открывает справку рядом. */
export const Обычное: S = {
  render: (args) => (
    <span className="inline-flex items-center gap-tight text-body text-fg">
      Окно записей
      <Help {...args} />
    </span>
  ),
}
