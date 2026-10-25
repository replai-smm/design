import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggletip } from './Toggletip'

const meta = {
  title: 'Компоненты/Элементы/Справка',
  component: Toggletip,
  parameters: { layout: 'padded' },
  args: { label: 'Окно записей', children: 'Участвуют только последние N записей сообщества. Пусто — все записи периода.' },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-slot="toggletip"]')?.click()
  },
} satisfies Meta<typeof Toggletip>
export default meta
type S = StoryObj<typeof meta>

/** «i» у подписи; нажатие открывает справку рядом. */
export const Обычное: S = {
  render: (args) => (
    <span className="inline-flex items-center gap-tight text-body text-fg">
      Окно записей
      <Toggletip {...args} />
    </span>
  ),
}
