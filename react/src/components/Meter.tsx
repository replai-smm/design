/**
 * Шкала заполнения (Carbon ProgressBar, определённый): сколько из предела уже взято — лимит плана, контекст сессии,
 * место на диске. Не путь из шагов (`Steps`) и не загрузка (`InlineLoading`).
 * - Полоса и слово: «62 % · сброс 18:40». Слово обязательно — по полосе число не прочесть.
 * - Тон по порогу: с `warnAt` — «внимание» (знак треугольник), с `errorAt` — «опасно» (крест); ниже — без тона.
 * - `inline` — подпись, полоса и слово в одну строку (шапка приложения); иначе подпись сверху.
 * - Для читалки — `role="meter"` со значением словами (`aria-valuetext`).
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export interface MeterProps {
  /** Что меряем: «5 ч», «Неделя», «Контекст». */
  label: string
  value: number
  max?: number
  /** Слово рядом: «62 % · сброс 18:40», «41k / 200k». По умолчанию — проценты. */
  valueText?: ReactNode
  /** Доля, с которой тон «внимание» (по умолчанию 0,8). */
  warnAt?: number
  /** Доля, с которой тон «опасно» (по умолчанию 0,95). */
  errorAt?: number
  inline?: boolean
  className?: string
}

const BAR = { none: 'bg-interactive', warning: 'bg-status-warning', error: 'bg-status-error' } as const
const MARK = { warning: 'text-status-warning', error: 'text-status-error' } as const

/** Тон шкалы по доле. */
export function meterTone(share: number, warnAt = 0.8, errorAt = 0.95): 'none' | 'warning' | 'error' {
  return share >= errorAt ? 'error' : share >= warnAt ? 'warning' : 'none'
}

export function Meter({ label, value, max = 100, valueText, warnAt = 0.8, errorAt = 0.95, inline = false, className }: MeterProps) {
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const pct = Math.round(share * 100)
  const tone = meterTone(share, warnAt, errorAt)
  const text = valueText ?? `${pct} %`
  return (
    <div
      data-slot="meter"
      data-tone={tone}
      className={cx('flex min-w-0 text-label-01', inline ? 'items-center gap-2' : 'flex-col gap-1', className)}
    >
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        aria-valuetext={typeof text === 'string' ? text : `${pct} %`}
        className={cx('relative block h-1 overflow-hidden bg-layer-accent-01', inline ? 'w-16 shrink-0' : 'w-full')}
      >
        <span className={cx('absolute inset-y-0 left-0 block', BAR[tone])} style={{ width: `${pct}%` }} />
      </span>
      <span className="inline-flex min-w-0 items-center gap-1 text-text-primary">
        {tone !== 'none' && <ToneIcon tone={tone} className={cx('size-3', MARK[tone])} />}
        <span className="truncate">{text}</span>
      </span>
    </div>
  )
}
