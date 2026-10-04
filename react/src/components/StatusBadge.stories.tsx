import type { Meta, StoryObj } from '@storybook/react-vite'
import { STATUS_IDS } from '../lib/status'
import { StatusBadge } from './StatusBadge'
import { Inline, Stack } from './layout'

const meta = {
  title: 'Компоненты/Метка статуса',
  component: StatusBadge,
  parameters: { layout: 'padded' },
  args: { status: 'work.failing' },
} satisfies Meta<typeof StatusBadge>
export default meta
type S = StoryObj<typeof meta>

/** Палитра продукта: четыре тона, у каждого своя форма значка и слово. */
export const Продукт: S = {
  render: () => (
    <Inline gap="03">
      {STATUS_IDS.map((id) => (
        <StatusBadge key={id} status={id} />
      ))}
    </Inline>
  ),
}

/** Палитра Карты: цвет — у рамки, слово обычным текстом; серый — не цвет состояния. */
export const Карта: S = {
  render: () => (
    <Inline gap="03">
      {STATUS_IDS.map((id) => (
        <StatusBadge key={id} status={id} palette="karta" />
      ))}
    </Inline>
  ),
}

/** Слово продукта вместо слова закона: тон тот же. */
export const СловоПродукта: S = {
  render: () => (
    <Stack gap="03">
      <Inline gap="03">
        <StatusBadge status="work.failing" label="не отвечает" />
        <StatusBadge status="work.working" label="отвечает" />
        <StatusBadge status="work.off" label="на паузе" />
      </Inline>
    </Stack>
  ),
}
