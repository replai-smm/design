import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineLoading } from './InlineLoading'

const meta = {
  title: 'Элементы/Ход в строке',
  component: InlineLoading,
  parameters: { layout: 'padded' },
  args: { label: 'идёт сборка' },
} satisfies Meta<typeof InlineLoading>
export default meta
type S = StoryObj<typeof meta>

/** Словарь хода: идёт, готово, ошибка — знаком и словом. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex flex-col gap-items">
      <InlineLoading {...args} />
      <InlineLoading label="сохранено" progress="done" />
      <InlineLoading label="не вышло" progress="error" />
    </div>
  ),
}
