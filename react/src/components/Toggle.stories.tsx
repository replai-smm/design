import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from './layout'
import { Toggle } from './Toggle'

const meta = {
  title: 'Компоненты/Поля/Toggle',
  component: Toggle,
  parameters: { layout: 'padded' },
  args: { id: 'digest', labelText: 'Сводка по понедельникам', defaultToggled: true },
} satisfies Meta<typeof Toggle>
export default meta
type S = StoryObj<typeof meta>

/** Действует сразу: включено — инверсия; слово состояния рядом; sm; подпись спрятана — вместо слова; выключено; только чтение. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={5}>
      <Toggle {...args} />
      <Toggle id="quiet" labelText="Тихие часы" />
      <Toggle id="small" labelText="Звук" size="sm" defaultToggled />
      <Toggle id="hidden" labelText="Показывать архив" hideLabel />
      <Toggle id="off" labelText="Отчёты команде" disabled />
      <Toggle id="ro" labelText="Вход по ссылке" readOnly toggled />
    </Stack>
  ),
}
