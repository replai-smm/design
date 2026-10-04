import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberField } from './NumberField'
import { Stack } from './layout'

function Demo() {
  const [v, setV] = useState<number | null>(3)
  return <NumberField label="Постов в день" value={v} onChange={setV} min={0} max={20} helperText="От 0 до 20" />
}

const meta = {
  title: 'ДС/Число',
  component: NumberField,
  parameters: { layout: 'padded' },
  args: { label: 'Постов в день' },
} satisfies Meta<typeof NumberField>
export default meta
type S = StoryObj<typeof meta>

/** Стрелки вверх и вниз — шаг; «−» и «+» — для мыши и пальца. Пусто — пусто, не ноль. */
export const Обычное: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <Demo />
      <NumberField label="Бюджет, ₽" placeholder="Не задан" step={100} min={0} />
      <NumberField label="Ставка, %" allowDecimal step={0.5} defaultValue={12.5} />
    </Stack>
  ),
}

/** Вне границ — ошибка с границами словами. */
export const ВнеГраниц: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="06" className="max-w-md">
      <NumberField label="День месяца" defaultValue={42} min={1} max={31} />
      <NumberField label="Бюджет, ₽" defaultValue={0} error="Бюджет не задан — реклама не запустится" />
    </Stack>
  ),
}

export const Недоступно: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <NumberField label="Лимит ответов" defaultValue={50} disabled helperText="Меняет админ" />
      <NumberField label="Подписчиков" defaultValue={1240} readOnly />
    </Stack>
  ),
}
