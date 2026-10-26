/**
 * Переключатель (Carbon: Toggle): кнопка `role="switch"` — дорожка с бегунком и слово состояния рядом (`labelA` выкл ·
 * `labelB` вкл). Действует сразу, без «Сохранить» — настройка вкл/выкл; выбор, который отправляют формой, — `Checkbox`.
 * Подпись (`labelText`) — над переключателем; `hideLabel` прячет её с экрана и ставит вместо слова состояния (Carbon).
 * `onToggle(checked)`; включено — инверсия, выключено — дорожка рамки. `size`: `md` 48 × 24 (по умолчанию) · `sm` 32 × 16.
 */
import { useState, type ButtonHTMLAttributes, type MouseEvent } from 'react'
import { FAST, FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import type { ToggleSize } from '../lib/vocab'

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'id' | 'type' | 'role' | 'aria-checked' | 'onClick' | 'onToggle' | 'className' | 'children'> {
  id: string
  /** Подпись над переключателем (строка, как у Carbon). */
  labelText?: string
  hideLabel?: boolean
  /** Слово, когда выключено. */
  labelA?: string
  /** Слово, когда включено. */
  labelB?: string
  toggled?: boolean
  defaultToggled?: boolean
  onToggle?: (checked: boolean) => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  size?: ToggleSize
  readOnly?: boolean
  className?: string
}

const TRACK: Record<ToggleSize, string> = { md: 'h-groups w-touch', sm: 'h-icon w-dense' }
const KNOB: Record<ToggleSize, string> = { md: 'size-icon', sm: 'size-items' }
const ON: Record<ToggleSize, string> = { md: 'translate-x-groups', sm: 'translate-x-blocks' }

/** Включить или выключить сразу (Carbon: Toggle). */
export function Toggle({ id, labelText, hideLabel, labelA = 'Выкл', labelB = 'Вкл', toggled, defaultToggled = false, onToggle, onClick, size = 'md', readOnly, disabled, className, 'aria-labelledby': labelledBy, ...rest }: ToggleProps) {
  rule(size === 'sm' || size === 'md', `размера переключателя «${String(size)}» нет: sm · md`)
  const [own, setOwn] = useState(defaultToggled)
  const checked = toggled ?? own
  const labelId = `${id}_label`
  const side = hideLabel ? labelText : checked ? labelB : labelA
  return (
    <div data-slot="toggle" data-size={size} className={cx('flex min-w-0 flex-col gap-tight', className)}>
      {labelText && (
        <label id={labelId} htmlFor={id} className={cx('text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted', hideLabel && 'sr-only')}>
          {labelText}
        </label>
      )}
      <div className="flex min-h-touch min-w-0 items-center gap-items md:min-h-control">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelledBy ?? (labelText ? labelId : undefined)}
          aria-readonly={readOnly || undefined}
          disabled={disabled}
          onClick={(e) => {
            if (!readOnly) {
              if (toggled === undefined) setOwn(!checked)
              onToggle?.(!checked)
            }
            onClick?.(e)
          }}
          {...rest}
          className={cx(
            'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-tight',
            TRACK[size],
            FAST,
            FOCUS,
            disabled ? 'cursor-not-allowed bg-line' : readOnly ? 'cursor-default bg-surface outline -outline-offset-1 outline-line' : checked ? 'bg-inverse' : 'bg-line-strong',
          )}
        >
          <span aria-hidden="true" className={cx('rounded-full transition-transform duration-fast ease-standard', KNOB[size], disabled ? 'bg-fg-disabled' : readOnly ? 'bg-fg' : 'bg-surface', checked && ON[size])} />
        </button>
        {side && (
          <label htmlFor={id} aria-hidden="true" className={cx('min-w-0 text-body', disabled ? 'text-fg-disabled' : 'cursor-pointer text-fg')}>
            {side}
          </label>
        )}
      </div>
    </div>
  )
}
