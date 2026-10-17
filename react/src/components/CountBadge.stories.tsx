import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountBadge } from './CountBadge'

const meta = {
  title: 'Элементы/Счётчик',
  component: CountBadge,
  parameters: { layout: 'padded' },
  args: { count: 3, label: 'непрочитанных' },
} satisfies Meta<typeof CountBadge>
export default meta
type S = StoryObj<typeof meta>

/** Число в рамке; новое — инверсией; срочное — со знаком тона. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-items">
      <CountBadge {...args} />
      <CountBadge {...args} tone="инфо" />
      <CountBadge count={2} tone="внимание" label="ждёт тебя" />
      <CountBadge count={7} tone="опасно" label="горит" />
      <CountBadge count="!" tone="опасно" label="пул пуст" />
    </div>
  ),
}

/** Больше 99 — «99+». */
export const Много: S = { tags: ['state:много'], args: { count: 1200, tone: 'инфо' } }
