/**
 * Счётчик (опись DF §11.2 п. 14; Carbon Tag count): число рядом со строкой списка или кнопкой — непрочитанные
 * диалоги, неотвеченные у сообщества, «!» у пустого пула. Число — не статус: метка статуса — `StatusBadge`.
 * - Тон: `neutral` — просто число (рамка); `info` — новое, что ждёт взгляда (непрочитанное, «синий бейдж» DF);
 *   `warning`, `error` — срочное, со знаком тона (цвет никогда не один, как у счётчика `Tabs`).
 * - Больше `max` — «99+»; строка (`'!'`) — как есть.
 * - `label` — что считаем, для читалки: «непрочитанных: 3». Без него читалка слышит только число.
 */
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type CountTone = 'neutral' | 'info' | 'warning' | 'error'

export interface CountBadgeProps {
  /** Число или знак («!»). */
  count: number | string
  tone?: CountTone
  /** Потолок показа: больше — «99+». */
  max?: number
  /** Что считаем — для читалки: «непрочитанных». Прочтётся как «непрочитанных: 3». */
  label?: string
  className?: string
}

const TONE: Record<CountTone, string> = {
  neutral: 'border-border-subtle-01 text-text-primary',
  info: 'border-support-info bg-notification-background-info text-text-primary',
  warning: 'border-border-subtle-01 text-text-primary',
  error: 'border-border-subtle-01 text-text-primary',
}
const MARK = { warning: 'text-status-warning', error: 'text-status-error' } as const

/** Что показать: число до потолка, «99+» — сверху, строка — как есть. */
export function countText(count: number | string, max = 99): string {
  if (typeof count === 'string') return count
  return count > max ? `${max}+` : String(count)
}

export function CountBadge({ count, tone = 'neutral', max = 99, label, className }: CountBadgeProps) {
  const text = countText(count, max)
  return (
    <span
      data-slot="count-badge"
      data-tone={tone}
      className={cx('inline-flex min-h-5 shrink-0 items-center gap-1 rounded-full border px-2 text-label-01', TONE[tone], className)}
    >
      {(tone === 'warning' || tone === 'error') && <ToneIcon tone={tone} className={cx('size-3', MARK[tone])} />}
      {label ? (
        <>
          <span className="sr-only">{label}: </span>
          {text}
        </>
      ) : (
        text
      )}
    </span>
  )
}
