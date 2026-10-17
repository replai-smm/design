import type { Meta, StoryObj } from '@storybook/react-vite'
import { Delta } from './Delta'

const meta = {
  title: 'Элементы/Разница',
  component: Delta,
  parameters: { layout: 'padded' },
  args: { value: 12.5 },
} satisfies Meta<typeof Delta>
export default meta
type S = StoryObj<typeof meta>

/** Рост к лучшему — «хорошо», к худшему — «опасно»; рубли; без тона; ноль. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-blocks">
      <Delta {...args} />
      <Delta value={-8.2} />
      <Delta value={1234} unit="₽" higherIsBetter={false} />
      <Delta value={-560} unit="₽" tone={false} />
      <Delta value={0} />
    </div>
  ),
}
