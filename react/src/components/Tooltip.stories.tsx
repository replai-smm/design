import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Элементы/Подсказка',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: { content: 'Прикрепить файл: PDF, картинка, таблица', children: <Button variant="ghost" icon="upload" aria-label="Прикрепить файл" /> },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.focus()
  },
} satisfies Meta<typeof Tooltip>
export default meta
type S = StoryObj<typeof meta>

/** Фокус или наведение — подсказка на инверсии. */
export const Обычное: S = {}
