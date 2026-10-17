import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from './Toast'

const meta = {
  title: 'Слои/Всплывашка',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  args: {
    initial: [
      { tone: 'хорошо', title: 'Пост опубликован', description: 'Кофейня «Зерно», 14:20' },
      { tone: 'инфо', title: 'Черновик сохранён', action: { label: 'Открыть', onClick: () => {} } },
    ],
  },
} satisfies Meta<typeof Toaster>
export default meta
type S = StoryObj<typeof meta>

/** «Готово» всплывает внизу справа и гаснет само; на телефоне — во всю ширину. */
export const Обычное: S = {}
