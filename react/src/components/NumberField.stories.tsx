import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberField } from './NumberField'

const meta = {
  title: 'Поля/Число',
  component: NumberField,
  parameters: { layout: 'padded' },
  args: { label: 'Постов в неделю', defaultValue: 3, min: 0, max: 14, className: 'max-w-narrow' },
} satisfies Meta<typeof NumberField>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Вне границ — ошибка словами. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { defaultValue: 20 } }
/** Поле настройки одной строкой: подпись и «?» слева, число с единицей справа; на телефоне подпись над полем. */
export const ВСтроку: S = {
  args: { label: 'За комментарий', inline: true, unit: 'балла', help: 'Засчитывается комментарий длиннее 10 символов. Удалённый комментарий снимает баллы.', className: 'max-w-window' },
}
