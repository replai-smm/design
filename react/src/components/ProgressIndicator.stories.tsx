import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressIndicator, ProgressStep } from './ProgressIndicator'

const meta = {
  title: 'Компоненты/Элементы/ProgressIndicator',
  component: ProgressIndicator,
  parameters: { layout: 'padded' },
  args: { 'aria-label': 'Шаги публикации', currentIndex: 1, onChange: () => {} },
} satisfies Meta<typeof ProgressIndicator>
export default meta
type S = StoryObj<typeof meta>

const steps = (invalidAt?: number) =>
  ['Текст', 'Куда', 'Предпросмотр', 'Итог'].map((label, i) => <ProgressStep key={label} label={label} invalid={i === invalidAt} />)

export const Обычное: S = { render: (args) => <ProgressIndicator {...args}>{steps()}</ProgressIndicator> }
export const Ошибка: S = { tags: ['state:ошибка'], args: { currentIndex: 3 }, render: (args) => <ProgressIndicator {...args}>{steps(3)}</ProgressIndicator> }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { currentIndex: 3 }, render: (args) => <ProgressIndicator {...args}>{steps()}</ProgressIndicator> }
/** Столбцом: путь в узкой колонке. */
export const Столбцом: S = { args: { vertical: true, currentIndex: 2 }, render: (args) => <ProgressIndicator {...args}>{steps()}</ProgressIndicator> }
