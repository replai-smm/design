import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from './Toggletip'

const meta = {
  title: 'Компоненты/Элементы/Toggletip',
  component: Toggletip,
  parameters: { layout: 'padded' },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-slot="toggletip-button"]')?.click()
  },
} satisfies Meta<typeof Toggletip>
export default meta
type S = StoryObj<typeof meta>

/** «i» у подписи; нажатие открывает справку рядом. */
export const Обычное: S = {
  render: () => (
    <span className="inline-flex items-center gap-tight text-body text-fg">
      <ToggletipLabel>Окно записей</ToggletipLabel>
      <Toggletip>
        <ToggletipButton label="Подробнее: окно записей" />
        <ToggletipContent>Участвуют только последние N записей проекта. Пусто — все записи периода.</ToggletipContent>
      </Toggletip>
    </span>
  ),
}
