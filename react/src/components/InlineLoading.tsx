/**
 * Ход работы в строке: знак и слово рядом с тем, что идёт, — «работает», «идёт сборка», «сохранено».
 * Словарь хода один на ДС: `running` — дуга вращается, `done` — знак «хорошо», `error` — знак «опасно» и слово
 * цвета ошибки. Идёт — `role="status"`: читалка слышит слово, когда оно меняется. «Уменьшить движение» — дуга стоит.
 * Для области целиком — `Loading` и скелет.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import type { Progress } from '../lib/vocab'
import { Icon } from './Icon'

export interface InlineLoadingProps {
  /** Слово рядом со знаком: «работает», «готово», «не вышло». */
  label: ReactNode
  progress?: Exclude<Progress, 'idle'>
  /** Слово только для читалки (в узкой строке видно один знак). */
  hideLabel?: boolean
  className?: string
}

export function InlineLoading({ label, progress = 'running', hideLabel = false, className }: InlineLoadingProps) {
  return (
    <span
      data-slot="inline-loading"
      data-progress={progress}
      role={progress === 'running' ? 'status' : undefined}
      className={cx('inline-flex min-w-0 items-center gap-items text-caption text-fg-muted', className)}
    >
      {progress === 'running' && (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-slot="spinner" className="ds-spin size-icon shrink-0">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {progress === 'done' && <Icon tone="хорошо" />}
      {progress === 'error' && <Icon tone="опасно" />}
      <span className={cx(hideLabel ? 'sr-only' : 'truncate', progress === 'error' && 'text-danger-fg')}>{label}</span>
    </span>
  )
}
