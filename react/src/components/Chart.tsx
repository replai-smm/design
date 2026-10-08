/**
 * График линий и столбцов на SVG — внутри `ChartFrame` (перенос `SvgChart` DF «Дашборд агентства», для дашборда набора
 * Статистики). Без библиотеки и без холста: цвета рядов и сетки — классы токенов тех же `SERIES`, что у легенды рамки,
 * тема меняется сама. Как у прежних графиков Chart.js: линия, столбцы, подписи оси X не чаще
 * 10, ось Y с нуля и короткими числами («12 тыс.»), точки при ≤ 45 значениях; подсказка точки — `<title>` (наведение).
 * - Заливки под линией нет (у `SvgChart` DF была): правило ДС — цвет без прозрачности поверх токена.
 * - Вид линии ряда (сплошная, пунктир, точки) — тот же, что в легенде рамки: цвет не один.
 * - `values` — подписи значений над точками и столбцами (Статистика: «цифры над точками», просьба 11.08).
 * - Меньше двух значений у линии — графика нет: продукт показывает `empty` рамки («Мало данных для графика»),
 *   проверка — `chartHasData()`.
 */
import { SERIES, type SeriesLine } from './ChartFrame'

export interface ChartSeries {
  key: string
  label: string
  /** Значения по подписям оси X; `null` — значения нет: точки нет, линия идёт к следующей. */
  data: Array<number | null>
  /** Номер цвета ряда (`SERIES`); по умолчанию — порядок ряда. */
  series?: number
  line?: SeriesLine
}

export interface ChartProps {
  kind: 'line' | 'bar'
  /** Подписи оси X: дни, месяцы. */
  labels: string[]
  series: ChartSeries[]
  /** Подпись для читалки (`role="img"`) — коротко; главный вывод — `summary` рамки. */
  label: string
  /** Подписи значений над точками и столбцами. */
  values?: boolean
  /** Как писать значение в подписи и подсказке (по умолчанию «12 345,6»). */
  format?: (v: number) => string
}

const STROKE = ['stroke-interactive', 'stroke-support-success', 'stroke-support-caution-major', 'stroke-support-error', 'stroke-support-caution-undefined', 'stroke-text-secondary'] as const
const FILL = ['fill-interactive', 'fill-support-success', 'fill-support-caution-major', 'fill-support-error', 'fill-support-caution-undefined', 'fill-text-secondary'] as const
const DASH: Record<SeriesLine, string | undefined> = { solid: undefined, dashed: '6 4', dotted: '2 3' }

const W = 640
const H = 240
const PAD_L = 60
const PAD_R = 8
const PAD_B = 24
const PW = W - PAD_L - PAD_R
/** Поле внутри оси у линии: крайние подписи X и значения не обрезаются краем. */
const INSET = 16

const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact' })
const full = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

/** Верх оси Y: ближайшее «круглое» сверху (1, 2, 5 × 10ⁿ), не меньше 1. */
export function niceMax(v: number): number {
  if (!(v > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 5, 10]) if (v <= m * p) return m * p
  return 10 * p
}

/** Какие подписи оси X показать: не больше `max`, через равный шаг. */
/** Деления оси Y: четверти, если они целые («0 · 250 · 500»), иначе пятые («0 · 10 · 20 … 50»). */
export function ticksOf(top: number): number[] {
  const steps = Number.isInteger(top / 4) ? 4 : 5
  return Array.from({ length: steps + 1 }, (_, i) => (top * i) / steps)
}

export function tickIndexes(n: number, max = 10): number[] {
  if (n <= 0) return []
  const step = Math.max(1, Math.ceil(n / max))
  const out: number[] = []
  for (let i = 0; i < n; i += step) out.push(i)
  return out
}

/** Есть что рисовать: у линии — хотя бы две точки в каком-то ряду, у столбцов — хотя бы одно значение. */
export function chartHasData(kind: ChartProps['kind'], series: ChartSeries[]): boolean {
  const most = Math.max(0, ...series.map((s) => s.data.filter((v) => v != null).length))
  return kind === 'line' ? most >= 2 : most >= 1
}

export function Chart({ kind, labels, series, label, values, format = (v) => full.format(v) }: ChartProps) {
  const padT = values ? 20 : 8
  const ph = H - padT - PAD_B
  const n = Math.max(labels.length, ...series.map((s) => s.data.length))
  const top = niceMax(Math.max(0, ...series.flatMap((s) => s.data.map((v) => v ?? 0))))
  const y = (v: number) => padT + ph - (Math.max(0, v) / top) * ph
  const band = n ? PW / n : PW
  const x = (i: number) => (kind === 'bar' ? PAD_L + band * i + band / 2 : PAD_L + INSET + (n > 1 ? ((PW - 2 * INSET) * i) / (n - 1) : PW / 2 - INSET))
  const ticksY = ticksOf(top)
  const dots = n <= 45
  const tip = (i: number, s: ChartSeries, v: number) => `${labels[i] ?? ''} · ${s.label}: ${format(v)}`
  const valueText = (key: string, cx: number, cy: number, v: number) => (
    <text key={key} x={cx} y={cy - 6} textAnchor="middle" data-slot="chart-value" className="fill-text-primary text-label-01">
      {format(v)}
    </text>
  )

  return (
    <svg data-slot="chart" data-kind={kind} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-full w-full">
      {ticksY.map((t) => (
        <g key={t}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} className="stroke-border-subtle-01" strokeWidth={1} />
          <text x={PAD_L - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-text-secondary text-label-01">
            {compact.format(t)}
          </text>
        </g>
      ))}
      {tickIndexes(n).map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-text-secondary text-label-01">
          {labels[i] ?? ''}
        </text>
      ))}
      {kind === 'bar'
        ? series.map((s, si) => {
            const w = Math.max(1, (band * 0.8) / series.length)
            const c = (s.series ?? si) % SERIES.length
            return (
              <g key={s.key} data-series={c}>
                {s.data.map((v, i) => {
                  if (v == null) return null
                  const bx = x(i) - (band * 0.8) / 2 + w * si
                  return (
                    <g key={i}>
                      <rect x={bx} y={y(v)} width={w} height={Math.max(0, padT + ph - y(v))} className={FILL[c]}>
                        <title>{tip(i, s, v)}</title>
                      </rect>
                      {values && valueText(`v${i}`, bx + w / 2, y(v), v)}
                    </g>
                  )
                })}
              </g>
            )
          })
        : series.map((s, si) => {
            const c = (s.series ?? si) % SERIES.length
            const pts = s.data.flatMap((v, i) => (v == null ? [] : [{ i, v, px: x(i), py: y(v) }]))
            const path = pts.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`)
            return (
              <g key={s.key} data-series={c} data-line={s.line ?? 'solid'}>
                <polyline points={path.join(' ')} fill="none" className={STROKE[c]} strokeWidth={2} strokeDasharray={DASH[s.line ?? 'solid']} strokeLinejoin="round" />
                {dots &&
                  pts.map((p) => (
                    <circle key={p.i} cx={p.px} cy={p.py} r={2.5} className={FILL[c]}>
                      <title>{tip(p.i, s, p.v)}</title>
                    </circle>
                  ))}
                {values && pts.map((p) => valueText(`v${p.i}`, p.px, p.py, p.v))}
              </g>
            )
          })}
    </svg>
  )
}
