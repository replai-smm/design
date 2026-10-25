import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, CheckboxGroup } from './Checkbox'

const meta = {
  title: 'Компоненты/Поля/Галочка',
  component: CheckboxGroup,
  parameters: { layout: 'padded' },
  args: { legend: 'Разделы сотрудника', children: null },
} satisfies Meta<typeof CheckboxGroup>
export default meta
type S = StoryObj<typeof meta>

/** Группа галочек: отмечено, не отмечено, частично, выключено. */
export const Обычное: S = {
  render: (args) => (
    <CheckboxGroup legend={args.legend} helperText="Что сотрудник видит в меню.">
      <Checkbox label="Сообщения" defaultChecked />
      <Checkbox label="Задачи" />
      <Checkbox label="Все проекты" checked="indeterminate" />
      <Checkbox label="Админ" disabled />
    </CheckboxGroup>
  ),
}

/** Ошибка у галочки — под ней знак и слово. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => <Checkbox label="Согласен с условиями оплаты" error="Без согласия заказ не уйдёт" />,
}
