import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberInput } from './NumberInput'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from './Toggletip'

const meta = {
  title: 'Компоненты/Поля/NumberInput',
  component: NumberInput,
  parameters: { layout: 'padded' },
  args: { id: 'reports', label: 'Отчётов в неделю', defaultValue: 3, min: 0, max: 14, className: 'max-w-narrow' },
} satisfies Meta<typeof NumberInput>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Вне границ — ошибка словами. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { defaultValue: 20 } }
/** Поле настройки одной строкой (с 1024 px): подпись и «i» слева, число с единицей справа; уже — подпись над полем. */
export const ВСтроку: S = {
  args: {
    id: 'keep',
    label: (
      <>
        <ToggletipLabel>Хранить файлы</ToggletipLabel>
        <Toggletip>
          <ToggletipButton label="Подробнее: хранить файлы" />
          <ToggletipContent>Файлы старше срока удаляются из корзины.</ToggletipContent>
        </Toggletip>
      </>
    ),
    inline: true,
    unit: 'дня',
    className: 'max-w-window',
  },
}
/** Ошибка поля в строку — у поля, под ним, а не под подписью. */
export const ВСтрокуОшибка: S = { tags: ['state:ошибка'], args: { id: 'keep', label: 'Хранить файлы', inline: true, unit: 'дней', defaultValue: 20, className: 'max-w-window' } }
