/**
 * График линий и столбцов на SVG — рисунок данных без своей поверхности: рамку, легенду и состояния даёт `ChartFrame`.
 * Цвета рядов — роли рядов данных 1–6 (не цвета тонов: линия не выглядит бедой). Вид линии (сплошная, пунктир,
 * точки) — тот же, что в легенде: цвет никогда не один. Ось Y с нуля короткими числами, подписи X не чаще 10, точки
 * при ≤ 45 значениях, подсказка — `<title>`. `values` — подписи значений над точками и столбцами. Меньше двух точек
 * у линии — `chartHasData()` ложь, продукт показывает `empty` рамки.
 */

/** Ряды данных 1–6 по порядку; больше шести — по кругу (различает вид линии). */
export const SERIES = {
  bg: ['bg-series-1', 'bg-series-2', 'bg-series-3', 'bg-series-4', 'bg-series-5', 'bg-series-6'],
  border: ['border-series-1', 'border-series-2', 'border-series-3', 'border-series-4', 'border-series-5', 'border-series-6'],
  stroke: ['stroke-series-1', 'stroke-series-2', 'stroke-series-3', 'stroke-series-4', 'stroke-series-5', 'stroke-series-6'],
  fill: ['fill-series-1', 'fill-series-2', 'fill-series-3', 'fill-series-4', 'fill-series-5', 'fill-series-6'],
} as const
export const seriesIndex = (i: number) => ((i % 6) + 6) % 6

export type SeriesLine = 'solid' | 'dashed' | 'dotted'

export interface ChartSeries {
  key: string
  label: string
  /** Значения по подписям оси X; `null` — значения нет: точки нет, линия идёт к следующей. */
  data: Array<number | null>
  /** Номер ряда данных (с нуля); по умолчанию — порядок ряда. */
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

const DASH: Record<SeriesLine, string | undefined> = { solid: undefined, dashed: '6 4', dotted: '2 3' }
const W = 640
const H = 240
const PAD_L = 60
const PAD_R = 8
const PAD_B = 24
const PW = W - PAD_L - PAD_R
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

/** Деления оси Y: четверти, если они целые, иначе пятые. */
export function ticksOf(top: number): number[] {
  const steps = Number.isInteger(top / 4) ? 4 : 5
  return Array.from({ length: steps + 1 }, (_, i) => (top * i) / steps)
}

/** Какие подписи оси X показать: не больше `max`, через равный шаг. */
export function tickIndexes(n: number, max = 10): number[] {
  if (n <= 0) return []
  const step = Math.max(1, Math.ceil(n / max))
  const out: number[] = []
  for (let i = 0; i < n; i += step) out.push(i)
  return out
}

/** Есть что рисовать: у линии — две точки в каком-то ряду, у столбцов — одно значение. */
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
  const dots = n <= 45
  const tip = (i: number, s: ChartSeries, v: number) => `${labels[i] ?? ''} · ${s.label}: ${format(v)}`
  const valueText = (key: string, cx: number, cy: number, v: number) => (
    <text key={key} x={cx} y={cy - 6} textAnchor="middle" data-slot="chart-value" className="fill-fg text-caption">
      {format(v)}
    </text>
  )

  return (
    <svg data-slot="chart" data-kind={kind} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-full w-full">
      {ticksOf(top).map((t) => (
        <g key={t}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
          <text x={PAD_L - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-fg-muted text-caption">
            {compact.format(t)}
          </text>
        </g>
      ))}
      {tickIndexes(n).map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-fg-muted text-caption">
          {labels[i] ?? ''}
        </text>
      ))}
      {kind === 'bar'
        ? series.map((s, si) => {
            const w = Math.max(1, (band * 0.8) / series.length)
            const c = seriesIndex(s.series ?? si)
            return (
              <g key={s.key} data-series={c}>
                {s.data.map((v, i) => {
                  if (v == null) return null
                  const bx = x(i) - (band * 0.8) / 2 + w * si
                  return (
                    <g key={i}>
                      <rect x={bx} y={y(v)} width={w} height={Math.max(0, padT + ph - y(v))} className={SERIES.fill[c]}>
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
            const c = seriesIndex(s.series ?? si)
            const pts = s.data.flatMap((v, i) => (v == null ? [] : [{ i, v, px: x(i), py: y(v) }]))
            return (
              <g key={s.key} data-series={c} data-line={s.line ?? 'solid'}>
                <polyline points={pts.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(' ')} fill="none" className={SERIES.stroke[c]} strokeWidth={2} strokeDasharray={DASH[s.line ?? 'solid']} strokeLinejoin="round" />
                {dots &&
                  pts.map((p) => (
                    <circle key={p.i} cx={p.px} cy={p.py} r={2.5} className={SERIES.fill[c]}>
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
