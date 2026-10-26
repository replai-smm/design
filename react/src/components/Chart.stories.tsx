import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chart } from './Chart'
import { ordersPerDay, visits } from '../stories/fixtures'

const days = visits.map((_, i) => `${i + 1}.10`)

const meta = {
  title: 'Компоненты/Элементы/Chart',
  component: Chart,
  parameters: { layout: 'padded' },
  args: {
    kind: 'line',
    label: 'Посещения по дням',
    labels: days,
    series: [
      { key: 'a', label: 'период А', data: visits, series: 0 },
      { key: 'b', label: 'период Б', data: visits.map((v) => Math.round(v * 0.7)), series: 1, line: 'dashed' },
    ],
  },
  render: (args) => (
    <div className="ds-chart-area max-w-window">
      <Chart {...args} />
    </div>
  ),
} satisfies Meta<typeof Chart>
export default meta
type S = StoryObj<typeof meta>

/** Ряды данных — свои роли, не цвета беды; вид линии — как в легенде. */
export const Линии: S = {}
/** Одна величина во времени — заливка под линией цветом ряда. */
export const Заливка: S = { args: { area: true, label: 'Просмотры по дням', series: [{ key: 'v', label: 'просмотры', data: visits, series: 1 }] } }
/** Столбцы с подписями значений. */
export const Столбцы: S = { args: { kind: 'bar', label: 'Заказов в день', values: true, series: [{ key: 'p', label: 'заказы', data: ordersPerDay, series: 5 }] } }
/** Шесть рядов данных. */
export const ШестьРядов: S = { args: { series: Array.from({ length: 6 }, (_, s) => ({ key: `s${s}`, label: `ряд ${s + 1}`, data: visits.map((v) => v + s * 6), series: s })) } }
