import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, CheckboxGroup } from './Checkbox'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from './Toggletip'

const meta = {
  title: 'Компоненты/Поля/Checkbox',
  component: CheckboxGroup,
  parameters: { layout: 'padded' },
  args: { legendText: 'Разделы сотрудника', children: null },
} satisfies Meta<typeof CheckboxGroup>
export default meta
type S = StoryObj<typeof meta>

/** Группа галочек: отмечено, не отмечено, частично, со справкой «i», выключено. */
export const Обычное: S = {
  render: (args) => (
    <CheckboxGroup legendText={args.legendText} helperText="Что сотрудник видит в меню.">
      <Checkbox id="cb-messages" labelText="Сообщения" defaultChecked />
      <Checkbox id="cb-tasks" labelText="Задачи" />
      <Checkbox id="cb-projects" labelText="Все проекты" indeterminate />
      <Checkbox
        id="cb-reports"
        labelText={
          <>
            <ToggletipLabel>Отчёты</ToggletipLabel>
            <Toggletip>
              <ToggletipButton label="Подробнее: отчёты" />
              <ToggletipContent>Отчёты за все месяцы, без правки.</ToggletipContent>
            </Toggletip>
          </>
        }
      />
      <Checkbox id="cb-admin" labelText="Админ" disabled />
    </CheckboxGroup>
  ),
}

/** Ошибка у галочки — под ней знак и слово; у группы — рамки всех галочек и слово под группой. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <>
      <Checkbox id="cb-terms" labelText="Согласен с условиями оплаты" invalid invalidText="Без согласия заказ не уйдёт" />
      <CheckboxGroup legendText="Куда присылать" invalid invalidText="Выберите хотя бы одно">
        <Checkbox id="cb-mail" labelText="Почта" />
        <Checkbox id="cb-chat" labelText="Чат" />
      </CheckboxGroup>
    </>
  ),
}
