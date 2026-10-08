/**
 * Метка статуса (шаблон «метка статуса», CONCEPT §3.4). Статус — только из закрытого списка (design/statuses.json),
 * цвет — только из палитры: `product` — четыре тона продукта, `karta` — цвета Карты (рамка, слово обычным текстом).
 * Цвет никогда не один: у тона своя форма значка (крест, треугольник, галочка, пустой круг) и слово.
 */
import { useId } from 'react'
import { cx } from '../lib/cx'
import { kartaKeyOf, statusOf, TONE_KEY, toneOf, type Palette, type StatusId, type ToneKey } from '../lib/status'

/** Знак тона на поверхности (background, layer-01, layer-02) — пара проверена контрастом ≥ 3:1. */
export const MARK: Record<ToneKey, string> = {
  error: 'text-status-error',
  warning: 'text-status-warning',
  success: 'text-status-success',
  neutral: 'text-status-neutral',
}
/** Метка тона: фон и текст тона — пара проверена контрастом ≥ 4,5:1 (ToneTag берёт ту же). */
export const PILL: Record<ToneKey, string> = {
  error: 'bg-status-error-background text-status-error-text',
  warning: 'bg-status-warning-background text-status-warning-text',
  success: 'bg-status-success-background text-status-success-text',
  neutral: 'bg-status-neutral-background text-status-neutral-text',
}
const KARTA_BORDER = {
  info: 'border-support-info',
  warning: 'border-status-warning',
  error: 'border-status-error',
} as const
const KARTA_MARK = {
  info: 'text-support-info',
  warning: 'text-status-warning',
  error: 'text-status-error',
} as const

/** Значок тона: форма отличает тон без цвета. Маска вырезает знак внутри формы — фон под ним виден. */
export function ToneIcon({ tone, className }: { tone: ToneKey; className?: string }) {
  const id = 'ds-m' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  // в маске «белое» = видно, «чёрное» = вырезано; это яркость маски, а не цвет интерфейса
  const cut = { stroke: 'black', strokeWidth: 1.6, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cx('size-4 shrink-0', className)} data-tone-icon={tone}>
      {tone !== 'neutral' && (
        <mask id={id}>
          <rect width="16" height="16" fill="white" />
          {tone === 'error' && <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" {...cut} />}
          {tone === 'warning' && (
            <>
              <path d="M8 6.2v3.6" {...cut} />
              <circle cx="8" cy="12" r="0.95" fill="black" />
            </>
          )}
          {tone === 'success' && <path d="M4.9 8.2l2.1 2.1 4.1-4.5" {...cut} strokeLinejoin="round" />}
        </mask>
      )}
      {tone === 'error' && <circle cx="8" cy="8" r="7" fill="currentColor" mask={`url(#${id})`} />}
      {tone === 'warning' && <path d="M8 1.3l7 13.2H1z" fill="currentColor" mask={`url(#${id})`} />}
      {tone === 'success' && <circle cx="8" cy="8" r="7" fill="currentColor" mask={`url(#${id})`} />}
      {tone === 'neutral' && <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />}
    </svg>
  )
}

export interface StatusBadgeProps {
  /** id из закрытого списка: work.working, work.failing, … change.adding. */
  status: StatusId
  /** product — интерфейсы продуктов (четыре тона); karta — экраны Карты и дашборд (рамка цвета Карты). */
  palette?: Palette
  /** Слово продукта вместо слова закона. Тон остаётся тоном статуса. */
  label?: string
  className?: string
}

export function StatusBadge({ status, palette = 'product', label, className }: StatusBadgeProps) {
  const s = statusOf(status)
  const tone = TONE_KEY[toneOf(status)]
  const text = label ?? s.say
  if (palette === 'karta') {
    const k = kartaKeyOf(status)
    return (
      <span
        data-slot="status-badge"
        data-status={status}
        data-palette="karta"
        className={cx(
          'inline-flex min-h-6 items-center gap-1 rounded-full border px-2 text-label-01 text-text-primary',
          k ? KARTA_BORDER[k] : 'border-border-subtle-01',
          className,
        )}
      >
        {k ? <ToneIcon tone={tone} className={KARTA_MARK[k]} /> : <ToneIcon tone="neutral" className="text-icon-secondary" />}
        {text}
      </span>
    )
  }
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      data-palette="product"
      className={cx('inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-label-01', PILL[tone], className)}
    >
      {/* в метке значок — цвета текста тона: пара «текст на фоне метки» проверена контрастом, «знак на фоне метки» — нет */}
      <ToneIcon tone={tone} />
      {text}
    </span>
  )
}
