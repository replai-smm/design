/**
 * Шкала заполнения: сколько из предела уже взято (лимит плана, контекст сессии) или сколько пройдено до цели. Не путь из
 * шагов (`ProgressIndicator`) и не загрузка (`InlineLoading`); пары в Carbon нет (ProgressBar — ход процесса), имена
 * свойств — как у ProgressBar: `label`, `value`, `max`, `helperText`, `hideLabel`, `type="inline"`. Полоса и слово
 * («62 % · сброс 18:40») — по полосе число не прочесть.
 * `kind="limit"` (по умолчанию) — предел: с 80 % тон «внимание», с 95 % — «опасно», знаком и цветом полосы; ниже — полоса
 * цвета текста. `kind="goal"` — путь к цели: конец полосы — успех, не беда, поэтому тона нет на любом проценте — полоса
 * цвета текста, без знака. `role="meter"` для читалки.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { Icon } from './Icon'

export interface MeterProps {
  /** Что меряем: «5 ч», «Неделя», «Контекст». */
  label: string
  value: number
  max?: number
  /** Слово рядом: «62 % · сброс 18:40». По умолчанию — проценты. */
  helperText?: ReactNode
  /** Подпись только для читалки. */
  hideLabel?: boolean
  /** `inline` — подпись, полоса и слово в одну строку (шапка приложения); `default` — подпись сверху. */
  type?: 'default' | 'inline'
  /** `limit` — сколько взято из предела, к концу тон «внимание»/«опасно»; `goal` — путь к цели, без тона. */
  kind?: 'limit' | 'goal'
  className?: string
}

/** Тон шкалы по доле: с 0,8 — внимание, с 0,95 — опасно. */
export function meterTone(share: number): Extract<Tone, 'внимание' | 'опасно'> | null {
  return share >= 0.95 ? 'опасно' : share >= 0.8 ? 'внимание' : null
}

const BAR = { опасно: 'bg-danger', внимание: 'bg-warning' } as const

export function Meter({ label, value, max = 100, helperText, hideLabel = false, type = 'default', kind = 'limit', className }: MeterProps) {
  const inline = type === 'inline'
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const pct = Math.round(share * 100)
  const tone = kind === 'goal' ? null : meterTone(share)
  const text = helperText ?? `${pct} %`
  return (
    <div data-slot="meter" data-tone={tone ?? undefined} className={cx('flex min-w-0 text-caption', inline ? 'items-center gap-items' : 'flex-col gap-tight', className)}>
      <span className={cx('shrink-0 text-fg-muted', hideLabel && 'sr-only')}>{label}</span>
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        aria-valuetext={typeof text === 'string' ? text : `${pct} %`}
        className={cx('relative block h-tight overflow-hidden rounded-full bg-line', inline ? 'w-touch shrink-0' : 'w-full')}
      >
        <span className={cx('absolute inset-y-0 left-0 block', tone ? BAR[tone] : 'bg-fg')} style={{ width: `${pct}%` }} />
      </span>
      <span className="inline-flex min-w-0 items-center gap-tight text-fg">
        {tone && <Icon tone={tone} />}
        <span className="truncate">{text}</span>
      </span>
    </div>
  )
}
