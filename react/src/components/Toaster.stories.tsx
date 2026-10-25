import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from './Toaster'

const meta = {
  title: 'Компоненты/Слои/Toaster',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  args: {
    initial: [
      { kind: 'success', title: 'Отчёт отправлен', subtitle: 'Интернет-магазин', caption: '14:20', timeout: 0 },
      { kind: 'info', title: 'Черновик сохранён', timeout: 0 },
    ],
  },
} satisfies Meta<typeof Toaster>
export default meta
type S = StoryObj<typeof meta>

/** «Готово» всплывает внизу справа и гаснет само через 5 с (`timeout`); на телефоне — во всю ширину. */
export const Обычное: S = {}
