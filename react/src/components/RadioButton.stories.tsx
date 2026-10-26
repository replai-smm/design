import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadioButton, RadioButtonGroup } from './RadioButton'

const meta = {
  title: 'Компоненты/Поля/RadioButton',
  component: RadioButtonGroup,
  parameters: { layout: 'padded' },
  args: { name: 'period', legendText: 'Период отчёта', defaultSelected: 'month', children: null },
} satisfies Meta<typeof RadioButtonGroup>
export default meta
type S = StoryObj<typeof meta>

const items = (
  <>
    <RadioButton labelText="Неделя" value="week" />
    <RadioButton labelText="Месяц" value="month" />
    <RadioButton labelText="Квартал" value="quarter" />
    <RadioButton labelText="Год" value="year" disabled />
  </>
)

/** Один из нескольких: в ряд (по умолчанию) и столбиком; выключенный вариант. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex flex-col gap-groups">
      <RadioButtonGroup {...args} helperText="Отчёт строится по выбранному периоду.">
        {items}
      </RadioButtonGroup>
      <RadioButtonGroup name="period-v" legendText="Столбиком" orientation="vertical" defaultSelected="week">
        {items}
      </RadioButtonGroup>
    </div>
  ),
}

export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: (args) => (
    <RadioButtonGroup name={args.name} legendText={args.legendText} invalid invalidText="Выберите период">
      {items}
    </RadioButtonGroup>
  ),
}
