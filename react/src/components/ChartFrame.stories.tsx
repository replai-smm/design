import type { Meta, StoryObj } from '@storybook/react-vite'
import { postsPerDay, reach } from '../stories/df-fixtures'
import { Button } from './Button'
import { ChartFrame, seriesVar } from './ChartFrame'

/** Простой линейный график на SVG для историй (в DF — Chart.js из бандла с цветами `useSeriesColors`). */
function Lines({ series }: { series: Array<{ data: number[]; dash?: string }> }) {
  const max = Math.max(...series.flatMap((s) => s.data))
  const w = 400
  const h = 160
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="size-full" aria-hidden="true">
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" x2={w} y1={h * y} y2={h * y} stroke="var(--cds-border-subtle-01)" strokeWidth="1" />
      ))}
      {series.map((s, i) => (
        <polyline
          key={i}
          fill="none"
          stroke={seriesVar(i)}
          strokeWidth="2"
          strokeDasharray={s.dash}
          vectorEffect="non-scaling-stroke"
          points={s.data.map((v, x) => `${(x / (s.data.length - 1)) * w},${h - (v / max) * (h - 8) - 4}`).join(' ')}
        />
      ))}
    </svg>
  )
}

const table = (
  <table className="w-full border-collapse text-label-01">
    <caption className="sr-only">Охват и посты по дням</caption>
    <thead>
      <tr className="text-start text-text-secondary">
        <th scope="col" className="px-2 py-1 text-start font-normal">День</th>
        <th scope="col" className="px-2 py-1 text-end font-normal">Охват, тыс.</th>
        <th scope="col" className="px-2 py-1 text-end font-normal">Постов</th>
      </tr>
    </thead>
    <tbody>
      {reach.map((r, i) => (
        <tr key={i} className="border-t border-border-subtle-01">
          <th scope="row" className="px-2 py-1 text-start font-normal">{i + 1} окт.</th>
          <td className="px-2 py-1 text-end">{r}</td>
          <td className="px-2 py-1 text-end">{postsPerDay[i]}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const meta = {
  title: 'ДС/Рамка графика',
  component: ChartFrame,
  parameters: { layout: 'padded' },
  args: {
    title: 'Охват и посты',
    description: '1–14 октября · все сообщества',
    summary: 'Охват вырос с 12 до 52 тысяч за две недели, постов — от 2 до 6 в день.',
    legend: [
      { key: 'reach', label: 'Охват, тыс.', value: '52' },
      { key: 'posts', label: 'Постов в день', line: 'dashed', value: '6' },
    ],
    tools: (
      <>
        <Button variant="ghost" size="sm" aria-pressed="true">30 дней</Button>
        <Button variant="ghost" size="sm" aria-pressed="false">90 дней</Button>
      </>
    ),
    table,
    children: <Lines series={[{ data: reach }, { data: postsPerDay.map((n) => n * 8), dash: '6 4' }]} />,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartFrame>
export default meta
type S = StoryObj<typeof meta>

/** График в рамке: заголовок, тихие кнопки, легенда со словом и видом линии, «Данные таблицей». */
export const Обычное: S = {}

/** Шесть цветов рядов — токены Carbon; в столбцах — квадрат. */
export const ЦветаРядов: S = {
  args: {
    title: 'Цвета рядов',
    summary: 'Образец шести цветов рядов.',
    table: undefined,
    legend: ['Посты', 'Охват', 'Таргет', 'Директ', 'Выручка', 'Прочее'].map((label, i) => ({ key: label, label, line: 'bar' as const, series: i })),
    children: <Lines series={[0, 1, 2, 3, 4, 5].map((k) => ({ data: reach.map((v, x) => v * (1 - k * 0.12) + ((x * k) % 5)) }))} />,
  },
}

export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }

export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'График не загрузился', description: 'Статистика не ответила.', onRetry: () => {} } } }

export const НетДанных: S = { tags: ['state:ничего не найдено'], args: { empty: { kind: 'ничего не найдено', title: 'Постов за период нет', description: 'Выберите другой период.' } } }

export const НетСтатистики: S = { tags: ['state:первый запуск'], args: { empty: { kind: 'первый запуск', title: 'Сообщество не подключено к Статистике', description: 'Графики охвата появятся после подключения.' } } }
