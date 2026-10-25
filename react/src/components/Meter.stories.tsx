import type { Meta, StoryObj } from '@storybook/react-vite'
import { Meter } from './Meter'

const meta = {
  title: 'Компоненты/Элементы/Meter',
  component: Meter,
  parameters: { layout: 'padded' },
  args: { label: '5 ч', value: 62, helperText: '62 % · сброс 18:40' },
} satisfies Meta<typeof Meter>
export default meta
type S = StoryObj<typeof meta>

/** Полоса и слово; в строку — для шапки. */
export const Обычное: S = {
  render: (args) => (
    <div className="flex max-w-popup flex-col gap-blocks">
      <Meter {...args} />
      <Meter label="Неделя" value={84} helperText="84 % · сброс в пн" />
      <Meter label="Контекст" value={41} max={200} helperText="41k / 200k" type="inline" />
    </div>
  ),
}

/** Почти предел — тон «опасно». */
export const Много: S = { tags: ['state:много'], args: { value: 97, helperText: '97 % · сброс 18:40' } }
