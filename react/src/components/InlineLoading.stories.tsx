import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineLoading } from './InlineLoading'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/InlineLoading',
  component: InlineLoading,
  parameters: { layout: 'padded' },
  args: { description: 'идёт сборка' },
} satisfies Meta<typeof InlineLoading>
export default meta
type S = StoryObj<typeof meta>

/** Состояния Carbon: идёт, готово, ошибка, ожидание — знаком и словом. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={3}>
      <InlineLoading {...args} />
      <InlineLoading description="сохранено" status="finished" />
      <InlineLoading description="не вышло" status="error" />
      <InlineLoading description="ждёт очереди" status="inactive" />
    </Stack>
  ),
}
