import type { Meta, StoryObj } from '@storybook/react-vite'
import { Upload } from '../lib/icons.gen'
import { IconButton } from './Button'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Компоненты/Элементы/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: {
    description: 'Квартальный отчёт по проектам с приложениями и протоколами встреч',
    children: (
      <button type="button" className="max-w-narrow cursor-default truncate text-start text-body text-fg">
        Квартальный отчёт по проектам с приложениями и протоколами встреч
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.focus()
  },
} satisfies Meta<typeof Tooltip>
export default meta
type S = StoryObj<typeof meta>

/** Фокус или наведение — подсказка на инверсии; `description` — описание вдобавок к тексту элемента. */
export const Обычное: S = {}

/** `label` — имя элемента без слова: у кнопки-значка его ставит сам `IconButton`. */
export const Подпись: S = {
  render: () => (
    <IconButton kind="ghost" label="Прикрепить файл: PDF, картинка, таблица">
      <Upload />
    </IconButton>
  ),
}
