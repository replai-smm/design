/**
 * Целое число: поле и кнопки «−» и «+» справа. Роль `spinbutton`: стрелки — шаг, PageUp/PageDown — десять шагов,
 * Home/End — к границам, если они заданы. Кнопки — для мыши и пальца, в обход табуляции (с клавиатуры то же делают
 * стрелки). Вне границ — ошибка «Число от … до …». Пусто — `null`, не ноль.
 */
import { forwardRef, useEffect, useState, type InputHTMLAttributes } from 'react'
import { FOCUS } from '../lib/anatomy'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import { FieldShell, fieldAria, fieldBox, useFieldIds, type FieldBaseProps } from './TextField'

export interface NumberFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children' | 'className' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  value?: number | null
  defaultValue?: number | null
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
}

const fmt = (n: number | null) => (n === null ? '' : String(n))
const parse = (t: string): number | null => (t === '' || t === '-' ? null : Number(t))

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { label, hideLabel, helperText, error, dense, className, id, disabled, readOnly, value: valueProp, defaultValue = null, onChange, min, max, step = 1, onKeyDown, onBlur, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const [value, setValue] = useControllable<number | null>(valueProp, defaultValue, onChange)
  const [text, setText] = useState(() => fmt(value))
  // пришло новое значение снаружи — показать его (свой недописанный ввод «-» не трогаем, если число то же)
  useEffect(() => {
    setText((t) => (parse(t) === value ? t : fmt(value)))
  }, [value])

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const commit = (n: number | null) => {
    setValue(n)
    setText(fmt(n))
  }
  const off = disabled || readOnly
  const stepBy = (k: number) => {
    if (off) return
    // пусто — первый шаг ставит ноль (или ближайшую границу), дальше — шагами
    commit(value === null ? clamp(0) : clamp(Math.round(value + k * step)))
  }

  const outOfRange = value !== null && ((min !== undefined && value < min) || (max !== undefined && value > max))
  const rangeText = min !== undefined && max !== undefined ? `Число от ${min} до ${max}` : min !== undefined ? `Не меньше ${min}` : `Не больше ${max ?? 0}`
  const shownError = error ?? (outOfRange ? rangeText : undefined)
  const btn = cx('inline-flex shrink-0 cursor-pointer items-center justify-center text-fg hover:bg-hover', dense ? 'w-dense' : 'w-touch md:w-control', FOCUS, 'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')

  return (
    <FieldShell slot="number-field" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={shownError} disabled={disabled} className={className}>
      <div className={cx(fieldBox({ invalid: Boolean(shownError), disabled, readOnly, within: true, dense }), 'flex items-stretch overflow-hidden')}>
        <input
          ref={ref}
          id={ids.id}
          type="text"
          role="spinbutton"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          readOnly={readOnly}
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          value={text}
          onChange={(e) => {
            const t = e.target.value.trim()
            if (!/^-?\d*$/.test(t)) return
            setText(t)
            const n = parse(t)
            if (n !== value) setValue(n)
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.defaultPrevented) return
            const map: Record<string, () => void> = { ArrowUp: () => stepBy(1), ArrowDown: () => stepBy(-1), PageUp: () => stepBy(10), PageDown: () => stepBy(-10) }
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
          className="min-w-0 flex-1 border-0 bg-transparent px-compact text-body text-inherit outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
        />
        {!readOnly && (
          <>
            <button type="button" tabIndex={-1} aria-label="уменьшить" aria-controls={ids.id} disabled={disabled || (min !== undefined && value !== null && value <= min)} onClick={() => stepBy(-1)} className={cx(btn, 'border-l border-line')}>
              <Icon name="minus" />
            </button>
            <button type="button" tabIndex={-1} aria-label="увеличить" aria-controls={ids.id} disabled={disabled || (max !== undefined && value !== null && value >= max)} onClick={() => stepBy(1)} className={cx(btn, 'border-l border-line')}>
              <Icon name="add" />
            </button>
          </>
        )}
      </div>
    </FieldShell>
  )
})
