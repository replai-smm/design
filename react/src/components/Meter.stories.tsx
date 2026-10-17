import type { Meta, StoryObj } from '@storybook/react-vite'
import { Meter } from './Meter'
import { Inline, Stack } from './layout'

const meta = {
  title: 'Компоненты/Шкала',
  component: Meter,
  parameters: { layout: 'padded' },
  args: { label: 'Контекст', value: 41, max: 200, valueText: '41k / 200k' },
} satisfies Meta<typeof Meter>
export default meta
type S = StoryObj<typeof meta>

/** Лимиты плана и контекст: ниже порога — без тона, с 80 % — «внимание», с 95 % — «опасно». В строку — для шапки. */
export const Обычное: S = {
  render: () => (
    <Stack gap="05">
      <Inline gap="06">
        <Meter inline label="5 ч" value={34} valueText="34 % · сброс 18:40" />
        <Meter inline label="Неделя" value={86} valueText="86 % · сброс пн 09:00" />
        <Meter inline label="Контекст" value={192} max={200} valueText="192k / 200k" />
      </Inline>
      <div className="max-w-sm">
        <Meter label="Место на диске" value={62} valueText="62 % · 31 из 50 ГБ" />
      </div>
    </Stack>
  ),
}

/** Выше предела (230k при 200k): полоса полная, знак «опасно», слово — как пришло. */
export const ВышеПредела: S = {
  tags: ['state:много'],
  render: () => (
    <Stack gap="05">
      <Meter label="Контекст" value={230} max={200} valueText="230k / 200k" />
      <Meter inline label="Неделя" value={100} valueText="100 % · сброс пн 09:00" />
    </Stack>
  ),
}
