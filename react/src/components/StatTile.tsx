/**
 * Плитка с цифрой (опись DF §11.3 п. 26, Carbon Tile / ClickableTile): число и подпись, по желанию — сравнение
 * двух периодов с разницей ▲▼ в процентах и переход по нажатию. DF «Дашборд агентства» (пульс, ключевые показатели,
 * плитки по таргетологам), Вычитка; Replai — сводки периода.
 * - `compact` — число и подпись в строку (плитки-переходы пульса); `metric` — подпись сверху, число крупно.
 * - Сравнение: строки «А» и «Б» помечены квадратом цвета ряда графика (те же `SERIES`, что у `ChartFrame`), разница —
 *   стрелкой и словом для читалки («больше на 12,5 %»), не только цветом.
 * - Беда рядом с числом (`alert`) — знак тона и слово («⚠ 2 без доступа», «лёгкий режим»).
 * - Переход: `onClick` — вся плитка кнопка, `href` — ссылка. Без них плитка не нажимается (плитка здоровья DF).
 * Лицо плитки — одно число и одна строка; больше фактов — `Card`.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { SERIES_BG } from './ChartFrame'
import { MARK, ToneIcon } from './StatusBadge'

export interface StatTileCompare {
  /** Число периода Б. */
  value: ReactNode
  /** Разница А к Б в процентах (знак — направление); null — не с чем сравнить (Б = 0). */
  delta?: number | null
  /** Подписи строк сравнения для читалки и на экране. */
  labels?: [string, string]
}

export interface StatTileProps {
  /** Главное число («17», «3,4», «2/3»). */
  value: ReactNode
  /** Что это за число: «сообществ», «Ср. просмотры». */
  label: ReactNode
  /** Продолжение подписи мелко: «· не ведём 2», «· 3,1 ч». */
  detail?: ReactNode
  /** Беда рядом с числом: знак тона и слово. */
  alert?: { tone: 'error' | 'warning'; text: ReactNode }
  variant?: 'compact' | 'metric'
  /** Сравнение двух периодов (только `metric`). */
  compare?: StatTileCompare
  /** Рост — хорошо (по умолчанию) или плохо (расход, ошибки): от этого тон стрелки. */
  higherIsBetter?: boolean
  onClick?: () => void
  href?: string
  className?: string
}

const fmtPct = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(Math.abs(n))

/** Разница ▲▼ в процентах: стрелка цвета тона (знак, контраст 3:1), число — цвета текста, слово — для читалки. */
export function Delta({ value, higherIsBetter = true }: { value: number; higherIsBetter?: boolean }) {
  const up = value >= 0
  const good = up === higherIsBetter
  return (
    <span data-slot="delta" data-direction={up ? 'up' : 'down'} className="inline-flex items-center gap-1 text-label-01 text-text-secondary">
      <span aria-hidden="true" className={good ? MARK.success : MARK.error}>
        {up ? '▲' : '▼'}
      </span>
      <span className="sr-only">{up ? 'больше на' : 'меньше на'}</span>
      {fmtPct(value)}%
    </span>
  )
}

function Mark({ series }: { series: number }) {
  return <span aria-hidden="true" data-series={series} className={cx('inline-block size-2 shrink-0', SERIES_BG[series])} />
}

export function StatTile({ value, label, detail, alert, variant = 'compact', compare, higherIsBetter = true, onClick, href, className }: StatTileProps) {
  const [la, lb] = compare?.labels ?? ['период А', 'период Б']
  const alertView = alert && (
    <span data-slot="stat-alert" data-tone={alert.tone} className="inline-flex items-center gap-1 text-label-01 text-text-primary">
      <ToneIcon tone={alert.tone} className={MARK[alert.tone]} />
      {alert.text}
    </span>
  )
  const body =
    variant === 'compact' ? (
      <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <span data-slot="stat-value" className="text-heading-03 text-text-primary">
          {value}
        </span>
        <span className="text-label-01 text-text-secondary">
          {label}
          {detail && <> {detail}</>}
        </span>
        {alertView}
      </span>
    ) : (
      <span className="flex min-w-0 flex-col items-center gap-1 text-center">
        <span className="text-label-01 text-text-secondary">{label}</span>
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          {compare && <Mark series={0} />}
          {compare && <span className="sr-only">{la}:</span>}
          <span data-slot="stat-value" className="text-heading-03 text-text-primary">
            {value}
          </span>
          {compare && compare.delta !== undefined && compare.delta !== null && <Delta value={compare.delta} higherIsBetter={higherIsBetter} />}
        </span>
        {compare && (
          <span data-slot="stat-compare" className="inline-flex items-center gap-2 text-body-compact-01 text-text-secondary">
            <Mark series={1} />
            <span className="sr-only">{lb}:</span>
            {compare.value}
          </span>
        )}
        {detail && <span className="text-label-01 text-text-secondary">{detail}</span>}
        {alertView}
      </span>
    )

  const cls = cx(
    'inline-flex min-w-0 border border-border-subtle-01 bg-layer-01 px-4 py-2 text-start',
    variant === 'metric' && 'min-w-28 flex-col justify-center',
    (onClick || href) && 'cursor-pointer hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
    className,
  )
  if (href)
    return (
      <a data-slot="stat-tile" data-variant={variant} href={href} className={cx(cls, 'text-text-primary no-underline')}>
        {body}
      </a>
    )
  if (onClick)
    return (
      <button data-slot="stat-tile" data-variant={variant} type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    )
  return (
    <div data-slot="stat-tile" data-variant={variant} className={cls}>
      {body}
    </div>
  )
}
