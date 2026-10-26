import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextArea } from './TextInput'

const meta = {
  title: 'Компоненты/Поля/TextArea',
  component: TextArea,
  parameters: { layout: 'padded' },
  args: { labelText: 'Текст письма', placeholder: 'Текст письма…', helperText: 'Переменные подставятся для каждого получателя.', className: 'max-w-form' },
} satisfies Meta<typeof TextArea>
export default meta
type S = StoryObj<typeof meta>

/** Многострочный ввод: та же рамка, 4 строки, высота тянется. */
export const Обычное: S = {}
export const Ошибка: S = { tags: ['state:ошибка'], args: { defaultValue: 'Привет', invalid: true, invalidText: 'Не короче 20 знаков' } }
