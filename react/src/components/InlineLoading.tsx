/**
 * Загрузка в строке (Carbon InlineLoading): знак и слово рядом с тем, что идёт, — «работает», «идёт сборка»,
 * «сохранено». Для области целиком — `Loading` и скелет (StateView).
 * - Три состояния: идёт (вращающаяся дуга), готово (галочка тона «хорошо»), ошибка (крест тона «опасно»).
 *   Цвет никогда не один: у каждого состояния своя форма знака и слово.
 * - Идёт — `role="status"`: читалка слышит слово, когда оно меняется. «Уменьшить движение» — дуга стоит.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type InlineLoadingState = 'active' | 'finished' | 'error'

export interface InlineLoadingProps {
  /** Слово рядом со знаком: «работает», «готово», «не вышло». */
  label: ReactNode
  state?: InlineLoadingState
  /** Слово только для читалки (в узкой строке видно один знак). */
  hideLabel?: boolean
  className?: string
}

/** Вращающаяся дуга — знак «идёт». */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-slot="spinner" className={cx('ds-spin size-4 shrink-0 text-icon-secondary', className)}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function InlineLoading({ label, state = 'active', hideLabel = false, className }: InlineLoadingProps) {
  return (
    <span
      data-slot="inline-loading"
      data-state={state}
      role={state === 'active' ? 'status' : undefined}
      className={cx('inline-flex min-w-0 items-center gap-2 text-label-01 text-text-secondary', className)}
    >
      {state === 'active' && <Spinner />}
      {state === 'finished' && <ToneIcon tone="success" className="text-status-success" />}
      {state === 'error' && <ToneIcon tone="error" className="text-status-error" />}
      <span className={cx(hideLabel ? 'sr-only' : 'truncate', state === 'error' && 'text-text-error')}>{label}</span>
    </span>
  )
}
