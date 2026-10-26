/**
 * Поиск (Carbon: Search): поле со знаком лупы и «очистить», область `role="search"`. Подпись (`labelText`) — для читалки,
 * на экране — подсказка в поле (`placeholder`, по умолчанию «Поиск»). `onChange(event)` — событие поля; «очистить» и Esc
 * стирают набранное, зовут `onChange` с пустым значением и `onClear()`, фокус остаётся в поле (Carbon). Рамка — та же,
 * что у поля ввода.
 */
import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { Size } from '../lib/vocab'
import { Icon } from './Icon'
import { checkFieldSize, fieldBox, useFieldIds } from './TextInput'

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'defaultValue' | 'className' | 'children'> {
  /** Подпись поля для читалки; на экране её нет. */
  labelText: ReactNode
  value?: string | number
  defaultValue?: string | number
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  /** Подпись кнопки «очистить» для читалки. */
  closeButtonLabelText?: string
  size?: Size
  className?: string
}

const has = (v: string | number | undefined) => v !== undefined && v !== null && String(v) !== ''

/** Поиск по списку (Carbon: Search). */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  { id, labelText, value, defaultValue, onChange, onClear, onKeyDown, closeButtonLabelText = 'Очистить поиск', placeholder = 'Поиск', size, disabled, autoComplete = 'off', type = 'search', className, ...rest },
  ref,
) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const input = useRef<HTMLInputElement | null>(null)
  const [filled, setFilled] = useState(has(value) || has(defaultValue))
  useEffect(() => {
    if (value !== undefined) setFilled(has(value))
  }, [value])

  const clear = () => {
    const el = input.current
    if (!el) return
    if (value === undefined) el.value = ''
    // как у Carbon: onChange получает событие с пустым значением
    onChange?.({ target: Object.assign({}, el, { value: '' }), currentTarget: el, type: 'change' } as unknown as ChangeEvent<HTMLInputElement>)
    onClear?.()
    setFilled(false)
    el.focus()
  }

  return (
    <div role="search" aria-labelledby={ids.labelId} data-slot="search" className={cx('relative flex min-w-0 items-center', className)}>
      <label id={ids.labelId} htmlFor={ids.id} className="sr-only">
        {labelText}
      </label>
      <Icon name="search" className={cx('pointer-events-none absolute left-compact', disabled ? 'text-fg-disabled' : 'text-fg-muted')} />
      <input
        ref={(el) => {
          input.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        id={ids.id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setFilled(e.target.value !== '')
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === 'Escape' && input.current?.value) {
            e.stopPropagation()
            clear()
          }
        }}
        {...rest}
        className={cx(fieldBox({ disabled, size }), 'pr-control pl-sections [&::-webkit-search-cancel-button]:hidden')}
      />
      {filled && !disabled && (
        <button
          type="button"
          aria-label={closeButtonLabelText}
          onClick={clear}
          className={cx('absolute right-tight inline-flex size-dense cursor-pointer items-center justify-center rounded-control text-fg hover:bg-hover', FOCUS)}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  )
})
