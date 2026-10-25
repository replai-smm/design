import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileField } from './FileField'

const file = (name: string, size: number) => {
  const f = new File(['x'], name, { type: 'application/pdf' })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

const meta = {
  title: 'Компоненты/Поля/Выбор файла',
  component: FileField,
  parameters: { layout: 'padded' },
  args: { label: 'Документы заказа', accept: '.pdf,image/*', maxSize: 10 * 1024 * 1024, multiple: true, defaultValue: [file('счёт-1024.pdf', 850 * 1024)], className: 'max-w-form' },
} satisfies Meta<typeof FileField>
export default meta
type S = StoryObj<typeof meta>

/** Ограничения словами в подсказке, выбранное — с размером и «убрать». */
export const Обычное: S = {}
/** Не тот тип или размер — файл не взят, ошибка называет файл. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: '«отчёт.xlsx» — не тот тип, можно: PDF, картинки' } }
