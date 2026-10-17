import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from './layout'
import { StatTile } from './StatTile'

const meta = {
  title: 'Поверхности/Плитка с цифрой',
  component: StatTile,
  parameters: { layout: 'padded' },
  args: { value: 17, label: 'сообществ', detail: '· не ведём 2' },
} satisfies Meta<typeof StatTile>
export default meta
type S = StoryObj<typeof meta>

/** Число и подпись в строку; беда рядом — знаком и словом; плитка-переход — кнопка. */
export const Обычное: S = {
  render: (args) => (
    <Inline gap="items">
      <StatTile {...args} onClick={() => {}} />
      <StatTile value={42} label="неотв. комментариев" alert={{ tone: 'опасно', text: '3 горят' }} onClick={() => {}} />
      <StatTile value="2/3" label="кабинетов крутится" alert={{ tone: 'внимание', text: 'лёгкий режим' }} />
    </Inline>
  ),
}

/** Сравнение периодов: метка ряда графика и разница со словом для читалки. */
export const Сравнение: S = {
  render: () => (
    <Inline gap="items">
      <StatTile variant="metric" value="3 420" label="Ср. просмотры" compare={{ value: '3 040', delta: 12.5 }} />
      <StatTile variant="metric" value="18 400 ₽" label="Расход" compare={{ value: '15 100 ₽', delta: 21.9 }} higherIsBetter={false} />
    </Inline>
  ),
}
