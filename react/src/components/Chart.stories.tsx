import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chart, chartHasData, type ChartSeries } from './Chart'
import { ChartFrame } from './ChartFrame'

const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен']
const joins: ChartSeries[] = [{ key: 'joins', label: 'Вступления', data: [320, 410, 380, 520, 610, 580, 700, 760, 690] }]
const spend: ChartSeries[] = [
  { key: 'target', label: 'Таргет, ₽', data: [42000, 45000, 39000, 51000, 56000, 54000, 61000, 64000, 60000] },
  { key: 'direct', label: 'Директ, ₽', data: [18000, 21000, 25000, 24000, null, 30000, 33000, 31000, 35000], line: 'dashed' },
]
const posts: ChartSeries[] = [
  { key: 'plan', label: 'План', data: [20, 20, 22, 22, 24, 24, 24, 26, 26] },
  { key: 'fact', label: 'Факт', data: [18, 21, 22, 19, 25, 24, 20, 27, 26] },
]

const meta = {
  title: 'Компоненты/График',
  component: Chart,
  parameters: { layout: 'padded' },
  args: { kind: 'line', labels: months, series: joins, label: 'Вступления по месяцам', values: true },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Chart>
export default meta
type S = StoryObj<typeof meta>

/** Линия в рамке: месяцы под осью, значения над точками (дашборд набора Статистики). */
export const Обычное: S = {
  render: (args) => (
    <ChartFrame title="Вступления в группы" description="январь–сентябрь · все сообщества набора" summary="Вступлений стало больше: 320 в январе, 690 в сентябре, больше всего — 760 в августе." legend={[{ key: 'joins', label: 'Вступления' }]}>
      <Chart {...args} />
    </ChartFrame>
  ),
}

/** Два ряда: второй — пунктиром (вид линии тот же, что в легенде); пропуск значения — точки нет. */
export const ДваРяда: S = {
  render: () => (
    <ChartFrame
      title="Затраты на рекламу, ₽"
      summary="Таргет растёт с 42 до 60 тысяч в месяц, Директ — с 18 до 35 тысяч; за май по Директу данных нет."
      legend={[
        { key: 'target', label: 'Таргет, ₽' },
        { key: 'direct', label: 'Директ, ₽', line: 'dashed' },
      ]}
    >
      <Chart kind="line" labels={months} series={spend} label="Затраты на таргет и Директ по месяцам" />
    </ChartFrame>
  ),
}

/** Столбцы: ряды рядом в каждой подписи оси, значения над столбцами. */
export const Столбцы: S = {
  render: () => (
    <ChartFrame
      title="Посты: план и факт"
      summary="Факт держится у плана; ниже плана — апрель и июль."
      legend={[
        { key: 'plan', label: 'План', line: 'bar' },
        { key: 'fact', label: 'Факт', line: 'bar' },
      ]}
    >
      <Chart kind="bar" labels={months} series={posts} label="Посты по месяцам: план и факт" values />
    </ChartFrame>
  ),
}

/** Меньше двух точек — графика нет: рамка показывает «мало данных» той же высоты (`chartHasData`). */
export const МалоДанных: S = {
  tags: ['state:ничего не найдено'],
  render: () => {
    const one: ChartSeries[] = [{ key: 'joins', label: 'Вступления', data: [320] }]
    const ok = chartHasData('line', one)
    return (
      <ChartFrame title="Вступления в группы" summary="Данных за один месяц — графика нет." empty={ok ? undefined : { kind: 'ничего не найдено', title: 'Мало данных для графика', description: 'Нужно хотя бы два месяца.' }}>
        <Chart kind="line" labels={months.slice(0, 1)} series={one} label="Вступления" />
      </ChartFrame>
    )
  },
}
