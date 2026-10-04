import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountBadge } from './CountBadge'
import { Avatar } from './Avatar'
import { Inline, Stack } from './layout'

const meta = {
  title: 'ДС/Счётчик',
  component: CountBadge,
  parameters: { layout: 'padded' },
  args: { count: 3 },
} satisfies Meta<typeof CountBadge>
export default meta
type S = StoryObj<typeof meta>

/** Тоны: просто число, новое (непрочитанное), срочное со знаком; «99+» и «!». */
export const Обычное: S = {
  render: () => (
    <Stack gap="04">
      <Inline gap="03">
        <CountBadge count={12} />
        <CountBadge count={3} tone="info" label="непрочитанных" />
        <CountBadge count={5} tone="warning" />
        <CountBadge count={7} tone="error" label="неотвеченных" />
      </Inline>
      <Inline gap="03">
        <CountBadge count={1200} />
        <CountBadge count={150} tone="info" max={99} />
        <CountBadge count="!" tone="error" label="пул пуст" />
      </Inline>
    </Stack>
  ),
}

/** В строке списка: имя, текст, счётчик справа. */
export const ВСтроке: S = {
  render: () => (
    <Inline gap="03" wrap={false} className="max-w-md border-b border-border-subtle-01 bg-layer-01 px-4 py-2">
      <Avatar name="Анна Петрова" decorative />
      <span className="min-w-0 flex-1 truncate text-body-compact-01 text-text-primary">Анна Петрова: а доставка сегодня работает?</span>
      <CountBadge count={2} tone="info" label="непрочитанных" />
    </Inline>
  ),
}

/** Много: большое число не ломает строку — «99+». */
export const Много: S = { tags: ['state:много'], args: { count: 25_000, tone: 'info', label: 'непрочитанных' } }
