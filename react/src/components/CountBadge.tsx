/**
 * Счётчик: число у строки, вкладки или кнопки — непрочитанные, неотвеченные, «!» у пустого пула. Число — не статус.
 * Тон словаря: `нейтрально` — просто число в рамке; `инфо` — новое, что ждёт взгляда: инверсия (контраст, не цвет);
 * `внимание`, `опасно` — со знаком тона. Больше 99 — «99+». `label` — что считаем, для читалки.
 */
import { cx } from '../lib/cx'
import { TONE, type Tone } from '../lib/vocab'
import { Icon } from './Icon'

export interface CountBadgeProps {
  /** Число или знак («!»). */
  count: number | string
  tone?: Exclude<Tone, 'хорошо'>
  /** Что считаем — для читалки: «непрочитанных» прочтётся как «непрочитанных: 3». */
  label?: string
  className?: string
}

const MAX = 99

/** Что показать: число до 99, «99+» сверху, строка — как есть. */
export function countText(count: number | string): string {
  if (typeof count === 'string') return count
  return count > MAX ? `${MAX}+` : String(count)
}

export function CountBadge({ count, tone = 'нейтрально', label, className }: CountBadgeProps) {
  const text = countText(count)
  const urgent = tone === 'опасно' || tone === 'внимание'
  return (
    <span
      data-slot="count-badge"
      data-tone={TONE[tone].key}
      className={cx(
        'inline-flex shrink-0 items-center gap-tight rounded-full border px-items text-caption',
        tone === 'инфо' ? 'border-inverse bg-inverse text-fg-inverse' : 'border-line text-fg',
        className,
      )}
    >
      {urgent && <Icon tone={tone} />}
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
