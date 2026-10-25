import type { Meta, StoryObj } from '@storybook/react-vite'
import { Steps } from './Steps'

const meta = {
  title: 'Компоненты/Элементы/Шаги',
  component: Steps,
  parameters: { layout: 'padded' },
  args: { label: 'Шаги публикации', steps: ['Текст', 'Куда', 'Предпросмотр', 'Итог'], current: 1, onStepClick: () => {} },
} satisfies Meta<typeof Steps>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Ошибка: S = { tags: ['state:ошибка'], args: { current: 3, errorAt: 3 } }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { current: 3 } }
/** Одной строкой: путь работы в узкой колонке. */
export const Компактно: S = { args: { compact: true, current: 2 } }
