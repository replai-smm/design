/**
 * Число (Carbon Number input): поле и кнопки «−» и «+» справа. Роль `spinbutton` (WAI-ARIA): стрелки вверх и вниз —
 * шаг, PageUp и PageDown — десять шагов, Home и End — к краям, если они заданы. Кнопки «−» и «+» — для мыши и пальца,
 * в обход табуляции (как у Carbon): с клавиатуры то же делают стрелки. Запятая и точка — обе годятся.
 * Вне границ — ошибка «Число от … до …» (своя фраза — через `error`). Пусто — `null`, не ноль.
 */
import { forwardRef, useEffect, useState, type InputHTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { useControllable, useLayer } from '../lib/controllable'
import { ErrorMark, FIELD_HEIGHT, FieldShell, fieldAria, fieldBoxClass, useFieldIds, type FieldBaseProps } from './TextField'

export interface NumberFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children' | 'className' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  value?: number | null
  defaultValue?: number | null
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Дробные числа разрешены (по умолчанию — только целые). */
  allowDecimal?: boolean
  /** Подписи кнопок для читалки. */
  decrementLabel?: string
  incrementLabel?: string
}

const fmt = (n: number | null) => (n === null ? '' : String(n).replace('.', ','))

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    label,
    hideLabel,
    helperText,
    error,
    size = 'md',
    className,
    id,
    disabled,
    readOnly,
    value: valueProp,
    defaultValue = null,
    onChange,
    min,
    max,
    step = 1,
    allowDecimal = false,
    decrementLabel = 'уменьшить',
    incrementLabel = 'увеличить',
    onKeyDown,
    onBlur,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds(id)
  const layer = useLayer()
  const [value, setValue] = useControllable<number | null>(valueProp, defaultValue, onChange)
  const [text, setText] = useState(() => fmt(value))
  // пришло новое значение снаружи — показать его (свой недописанный ввод «1,» не трогаем, если число то же)
  useEffect(() => {
    setText((t) => (parse(t) === value ? t : fmt(value)))
  }, [value])

  const pattern = allowDecimal ? /^-?\d*(?:[.,]\d*)?$/ : /^-?\d*$/
  function parse(t: string): number | null {
    if (t === '' || t === '-' || /[.,]$/.test(t)) return t === '' || t === '-' ? null : Number(t.slice(0, -1).replace(',', '.'))
    const n = Number(t.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const round = (n: number) => (allowDecimal ? Number(n.toFixed(10)) : Math.round(n))
  const commit = (n: number | null) => {
    setValue(n)
    setText(fmt(n))
  }
  const stepBy = (k: number) => {
    if (disabled || readOnly) return
    // пусто — первый шаг ставит ноль (или ближайшую границу), дальше — шагами
    commit(value === null ? clamp(0) : clamp(round(value + k * step)))
  }

  const outOfRange = value !== null && ((min !== undefined && value < min) || (max !== undefined && value > max))
  const rangeText =
    min !== undefined && max !== undefined ? `Число от ${fmt(min)} до ${fmt(max)}` : min !== undefined ? `Не меньше ${fmt(min)}` : `Не больше ${fmt(max ?? 0)}`
  const shownError = error ?? (outOfRange ? rangeText : undefined)
  const off = disabled || readOnly
  const btn = cx(
    'inline-flex w-12 shrink-0 cursor-pointer items-center justify-center text-icon-primary md:w-10',
    layer === 2 ? 'hover:bg-field-hover-02' : 'hover:bg-field-hover-01',
    'disabled:cursor-not-allowed disabled:text-icon-disabled disabled:hover:bg-transparent',
  )

  return (
    <FieldShell slot="number-field" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={shownError} disabled={disabled} className={className}>
      <div className={cx(fieldBoxClass({ layer, invalid: Boolean(shownError), disabled, readOnly, within: true }), FIELD_HEIGHT[size], 'flex items-stretch')}>
        <input
          ref={ref}
          id={ids.id}
          type="text"
          role="spinbutton"
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          disabled={disabled}
          readOnly={readOnly}
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          value={text}
          onChange={(e) => {
            const t = e.target.value.trim()
            if (!pattern.test(t)) return
            setText(t)
            const n = parse(t)
            if (n !== value) setValue(n)
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.defaultPrevented) return
            const map: Record<string, () => void> = {
              ArrowUp: () => stepBy(1),
              ArrowDown: () => stepBy(-1),
              PageUp: () => stepBy(10),
              PageDown: () => stepBy(-10),
            }
            if (min !== undefined) map.Home = () => !off && commit(min)
            if (max !== undefined) map.End = () => !off && commit(max)
            const f = map[e.key]
            if (f) {
              e.preventDefault()
              f()
            }
          }}
          onBlur={(e) => {
            setText(fmt(value))
            onBlur?.(e)
          }}
          {...fieldAria(ids, { helperText, error: shownError })}
          {...rest}
          className="min-w-0 flex-1 border-0 bg-transparent px-4 text-body-compact-01 text-inherit outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed"
        />
        {shownError && <ErrorMark className="mr-2 self-center" />}
        {!readOnly && (
          <>
            <button type="button" tabIndex={-1} aria-label={decrementLabel} aria-controls={ids.id} disabled={disabled || (min !== undefined && value !== null && value <= min)} onClick={() => stepBy(-1)} className={btn}>
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <span aria-hidden="true" className={cx('my-3 w-px shrink-0', layer === 2 ? 'bg-border-subtle-02' : 'bg-border-subtle-01')} />
            <button type="button" tabIndex={-1} aria-label={incrementLabel} aria-controls={ids.id} disabled={disabled || (max !== undefined && value !== null && value >= max)} onClick={() => stepBy(1)} className={btn}>
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4">
                <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </FieldShell>
  )
})
