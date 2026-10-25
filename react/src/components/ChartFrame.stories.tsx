import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Chart } from './Chart'
import { ChartFrame } from './ChartFrame'
import { visits } from '../stories/fixtures'

const labels = visits.map((_, i) => `${i + 1}.10`)

const meta = {
  title: 'Компоненты/Поверхности/Рамка графика',
  component: ChartFrame,
  parameters: { layout: 'padded' },
  args: {
    title: 'Посещения по дням',
    description: 'Интернет-магазин, 1–14 октября',
    summary: 'Посещения выросли с 12 до 52 тысяч за две недели',
    tools: (
      <Button kind="ghost" size="sm">
        90 дней
      </Button>
    ),
    legend: [
      { key: 'a', label: 'период А', series: 0 },
      { key: 'b', label: 'период Б', series: 1, line: 'dashed' },
    ],
    children: (
      <Chart
        kind="line"
        label="Посещения по дням"
        labels={labels}
        series={[
          { key: 'a', label: 'период А', data: visits, series: 0 },
          { key: 'b', label: 'период Б', data: visits.map((v) => Math.round(v * 0.7)), series: 1, line: 'dashed' },
        ]}
      />
    ),
    className: 'max-w-window',
  },
} satisfies Meta<typeof ChartFrame>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'График не загрузился', onRetry: () => {} } } }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { empty: { kind: 'первый запуск', title: 'Проект не подключён к отчётам' } } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { empty: { kind: 'ничего не найдено', title: 'Заказов за период нет' } } }
