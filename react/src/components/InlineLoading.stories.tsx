import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineLoading } from './InlineLoading'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Загрузка в строке',
  component: InlineLoading,
  parameters: { layout: 'padded' },
  args: { label: 'работает' },
} satisfies Meta<typeof InlineLoading>
export default meta
type S = StoryObj<typeof meta>

/** Три состояния: идёт, готово, ошибка — знак и слово. */
export const Обычное: S = {
  render: () => (
    <Stack gap="03">
      <InlineLoading label="агент работает" />
      <InlineLoading state="finished" label="тесты прошли" />
      <InlineLoading state="error" label="сборка упала" />
    </Stack>
  ),
}

/** Идёт: дуга и слово. */
export const Идёт: S = { args: { label: 'агент работает' } }

/** Готово: знак и слово. */
export const Готово: S = { args: { state: 'finished', label: 'тесты прошли' } }

/** Ошибка: крест и слово. */
export const Ошибка: S = { args: { state: 'error', label: 'сборка упала' } }
