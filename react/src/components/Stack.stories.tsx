import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline, Stack } from './layout'
import { Surface } from './Surface'

const meta = {
  title: 'Компоненты/Раскладка/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
  args: { gap: 5 },
} satisfies Meta<typeof Stack>
export default meta
type S = StoryObj<typeof meta>

const box = (t: string) => (
  <Surface key={t} className="text-body">
    {t}
  </Surface>
)

/** Столбиком и в ряд: отступ — шаг шкалы (2 — 4 px … 7 — 32 px); Inline — ряд с переносом. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={7}>
      <Stack {...args}>{['Первый', 'Второй', 'Третий'].map(box)}</Stack>
      <Stack orientation="horizontal" gap={3}>
        {['В ряд', 'без', 'переноса'].map(box)}
      </Stack>
      <Inline gap={3}>{['Inline', 'переносится', 'когда', 'не', 'помещается'].map(box)}</Inline>
    </Stack>
  ),
}
