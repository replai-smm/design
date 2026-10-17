/**
 * Плитка с цифрой: одно число и подпись — поверхность. `compact` — число и подпись в строку (плитки-переходы);
 * `metric` — подпись сверху, число крупно, по желанию сравнение двух периодов (метка цвета ряда графика и `Delta`).
 * Беда рядом с числом (`alert`) — знак тона и слово. Вся плитка — кнопка (`onClick`), без него не нажимается.
 * Больше одного числа — `Card`.
 */
import type { ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { SERIES } from './Chart'
import { Delta } from './Delta'
import { Icon } from './Icon'
import { Surface } from './Surface'

export interface StatTileCompare {
  /** Число периода Б. */
  value: ReactNode
  /** Разница А к Б в процентах; null — не с чем сравнить. */
  delta?: number | null
  /** Подписи строк сравнения для читалки. */
  labels?: [string, string]
}

export interface StatTileProps {
  /** Главное число («17», «3,4», «2/3»). */
  value: ReactNode
  /** Что это за число: «сообществ», «Ср. просмотры». */
  label: ReactNode
  /** Продолжение подписи мелко: «· не ведём 2». */
  detail?: ReactNode
  /** Беда рядом с числом: знак тона и слово. */
  alert?: { tone: Extract<Tone, 'опасно' | 'внимание'>; text: ReactNode }
  variant?: 'compact' | 'metric'
  /** Сравнение двух периодов (только `metric`). */
  compare?: StatTileCompare
  /** Рост — хорошо (по умолчанию) или плохо (расход, ошибки). */
  higherIsBetter?: boolean
  onClick?: () => void
  className?: string
}

function Mark({ series }: { series: number }) {
  return <span aria-hidden="true" data-series={series} className={cx('inline-block size-items shrink-0 rounded-full', SERIES.bg[series])} />
}

export function StatTile({ value, label, detail, alert, variant = 'compact', compare, higherIsBetter = true, onClick, className }: StatTileProps) {
  const [la, lb] = compare?.labels ?? ['период А', 'период Б']
  const alertView = alert && (
    <span data-part="alert" data-tone={alert.tone} className="inline-flex items-center gap-tight text-caption text-fg">
      <Icon tone={alert.tone} />
      {alert.text}
    </span>
  )
  const num = (
    <span data-part="value" className="text-title text-fg">
      {value}
    </span>
  )
  const body =
    variant === 'compact' ? (
      <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-items gap-y-tight">
        {num}
        <span className="text-caption text-fg-muted">
          {label}
          {detail && <> {detail}</>}
        </span>
        {alertView}
      </span>
    ) : (
      <span className="flex min-w-0 flex-col items-start gap-tight">
        <span data-part="title" className="text-caption text-fg-muted">
          {label}
        </span>
        <span className="inline-flex flex-wrap items-center gap-items">
          {compare && <Mark series={0} />}
          {compare && <span className="sr-only">{la}:</span>}
          {num}
          {compare && compare.delta != null && <Delta value={compare.delta} higherIsBetter={higherIsBetter} />}
        </span>
        {compare && (
          <span data-part="compare" className="inline-flex items-center gap-items text-body text-fg-muted">
            <Mark series={1} />
            <span className="sr-only">{lb}:</span>
            {compare.value}
          </span>
        )}
        {detail && <span className="text-caption text-fg-muted">{detail}</span>}
        {alertView}
      </span>
    )
  return (
    <Surface
      as={onClick ? 'button' : 'div'}
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      data-slot="stat-tile"
      data-variant={variant}
      className={cx('text-start', onClick && cx('cursor-pointer hover:bg-hover', FOCUS), className)}
    >
      {body}
    </Surface>
  )
}
