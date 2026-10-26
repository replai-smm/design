/**
 * Ход работы в строке (Carbon: InlineLoading): знак и слово рядом с тем, что идёт, — «работает», «сохраняем», «сохранено».
 * `status`: `active` — дуга вращается, `finished` — знак «хорошо», `error` — знак «опасно» и слово цвета ошибки, `inactive` —
 * только слово. Слово меняется — читалка слышит его сразу (`aria-live`, у `inactive` молчит). `onSuccess` зовётся через
 * `successDelay` после `finished` — убрать строку или закрыть окно. Занятость кнопки — этот же компонент на её месте.
 * «Уменьшить движение» — дуга стоит.
 */
import { useEffect, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import type { InlineLoadingStatus } from '../lib/vocab'
import { Icon } from './Icon'

export interface InlineLoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Слово рядом со знаком: «сохраняем», «сохранено», «не вышло». */
  description?: ReactNode
  /** Слово знака для читалки, когда `description` нет; по умолчанию — само состояние словами. */
  iconDescription?: string
  status?: InlineLoadingStatus
  /** Зовётся через `successDelay` мс после `finished`. */
  onSuccess?: () => void
  /** По умолчанию 1500 мс. */
  successDelay?: number
}

const SAY: Record<InlineLoadingStatus, string> = { inactive: 'ожидание', active: 'загрузка', finished: 'готово', error: 'ошибка' }

export function InlineLoading({ description, iconDescription, status = 'active', onSuccess, successDelay = 1500, className, ...rest }: InlineLoadingProps) {
  useEffect(() => {
    if (status !== 'finished' || !onSuccess) return
    const t = setTimeout(onSuccess, successDelay)
    return () => clearTimeout(t)
  }, [status, onSuccess, successDelay])
  const word = description ? undefined : (iconDescription ?? SAY[status])
  return (
    <div
      data-slot="inline-loading"
      data-status={status}
      aria-live={rest['aria-live'] ?? (status === 'inactive' ? 'off' : 'assertive')}
      className={cx('inline-flex min-w-0 items-center gap-items text-caption text-fg-muted', className)}
      {...rest}
    >
      {status === 'active' && (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-slot="spinner" className="ds-spin size-icon shrink-0">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {status === 'finished' && <Icon tone="хорошо" />}
      {status === 'error' && <Icon tone="опасно" />}
      {word && <span className="sr-only">{word}</span>}
      {description && <span className={cx('truncate', status === 'error' && 'text-danger-fg')}>{description}</span>}
    </div>
  )
}
