/**
 * Число (Carbon: NumberInput): поле и кнопки «−» и «+» справа. Роль `spinbutton`: стрелки — шаг, PageUp/PageDown —
 * десять шагов, Home/End — к границам, если они заданы. Кнопки — для мыши и пальца, в обход табуляции (с клавиатуры то же
 * делают стрелки). `onChange(event, { value, direction })` — как у Carbon. Вне границ — ошибка «Число от … до …»; пусто —
 * ошибка, если нет `allowEmpty` (тогда `value` — пустая строка, не ноль).
 */
import { forwardRef, useEffect, useState, type ChangeEvent, type InputHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { Size } from '../lib/vocab'
import { Icon } from './Icon'
import { FieldShell, checkFieldSize, fieldAria, fieldBox, fieldSquare, fieldState, useFieldIds, type FieldMessages, type FieldRowProps } from './TextInput'

export interface NumberInputProps
  extends FieldMessages,
    FieldRowProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'id' | 'children' | 'className' | 'value' | 'defaultValue' | 'onChange' | 'onClick' | 'type' | 'min' | 'max' | 'step'> {
  id: string
  /** Подпись (у Carbon здесь `label`, не `labelText`). */
  label?: ReactNode
  hideLabel?: boolean
  size?: Size
  value?: number | string
  /** По умолчанию 0, как у Carbon. */
  defaultValue?: number | string
  /** Пусто — допустимо: `value` — пустая строка. */
  allowEmpty?: boolean
  min?: number
  max?: number
  step?: number
  /** Без кнопок «−» и «+». */
  hideSteppers?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>, state: { value: number | string; direction: string }) => void
  className?: string
}

type Num = number | ''
const toNum = (v: number | string | undefined): Num => (v === undefined || v === '' ? '' : Number(v))
const fmt = (n: Num) => (n === '' ? '' : String(n))
const parse = (t: string): Num => (t === '' || t === '-' ? '' : Number(t.replace(',', '.')))
const places = (n: number) => String(n).split('.')[1]?.length ?? 0

/** Число со стрелками (Carbon: NumberInput). */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { id, label, hideLabel, helperText, invalid, invalidText, warn, warnText, size, className, disabled, readOnly, value: valueProp, defaultValue = 0, allowEmpty = false, onChange, min, max, step = 1, hideSteppers, onKeyDown, onBlur, inline, unit, ...rest },
  ref,
) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const [inner, setInner] = useState<Num>(() => toNum(defaultValue))
  const controlled = valueProp !== undefined
  const value = controlled ? toNum(valueProp) : inner
  const [text, setText] = useState(() => fmt(value))
  // пришло новое значение снаружи — показать его (свой недописанный ввод «-» не трогаем, если число то же)
  useEffect(() => {
    setText((t) => (parse(t) === value ? t : fmt(value)))
  }, [value])

  const emit = (event: Parameters<NonNullable<NumberInputProps['onChange']>>[0], next: Num, direction: 'up' | 'down') => {
    if (!controlled) setInner(next)
    onChange?.(event, { value: next, direction })
  }
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const off = disabled || readOnly
  const stepBy = (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLInputElement>, k: number) => {
    if (off) return
    // пусто — первый шаг ставит ноль (или ближайшую границу), дальше — шагами; дробь — с точностью шага
    const next = value === '' ? clamp(0) : clamp(Number((value + k * step).toFixed(Math.max(places(value), places(step)))))
    setText(fmt(next))
    emit(event, next, k > 0 ? 'up' : 'down')
  }
  const jump = (event: KeyboardEvent<HTMLInputElement>, to: number) => {
    if (off) return
    setText(fmt(to))
    emit(event, to, value !== '' && to < value ? 'down' : 'up')
  }

  const outOfRange = value !== '' && ((min !== undefined && value < min) || (max !== undefined && value > max))
  const empty = value === '' && !allowEmpty
  const rangeText = min !== undefined && max !== undefined ? `Число от ${min} до ${max}` : min !== undefined ? `Не меньше ${min}` : `Не больше ${max ?? 0}`
  const isInvalid = Boolean(invalid) || outOfRange || empty
  const shownInvalidText = invalidText ?? (outOfRange ? rangeText : empty ? 'Введите число' : undefined)
  const messages = { helperText, invalid: isInvalid, invalidText: shownInvalidText, warn, warnText }
  const state = fieldState({ invalid: isInvalid, warn, disabled, readOnly })
  const btn = cx('inline-flex shrink-0 cursor-pointer items-center justify-center border-l border-line text-fg hover:bg-hover', fieldSquare(size), FOCUS, 'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')

  return (
    <FieldShell slot="number-input" ids={ids} label={label} hideLabel={hideLabel} disabled={disabled} readOnly={readOnly} className={className} inline={inline} unit={unit} narrow={inline} {...messages}>
      <div className={cx(fieldBox({ invalid: state.invalid, disabled, readOnly, within: true, size }), 'flex items-stretch overflow-hidden')}>
        <input
          ref={ref}
          id={ids.id}
          type="text"
          role="spinbutton"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          readOnly={readOnly}
          aria-valuenow={value === '' ? undefined : value}
          aria-valuemin={min}
          aria-valuemax={max}
          value={text}
          onChange={(e) => {
            const t = e.target.value.trim()
            if (!/^-?\d*(?:[.,]\d*)?$/.test(t)) return
            setText(t)
            const n = parse(t)
            if (n !== value) emit(e, n, n !== '' && value !== '' && n < value ? 'down' : 'up')
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.defaultPrevented) return
            const map: Record<string, () => void> = { ArrowUp: () => stepBy(e, 1), ArrowDown: () => stepBy(e, -1), PageUp: () => stepBy(e, 10), PageDown: () => stepBy(e, -10) }
            if (min !== undefined) map.Home = () => jump(e, min)
            if (max !== undefined) map.End = () => jump(e, max)
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
          {...fieldAria(ids, messages, state)}
          {...rest}
          className="min-w-0 flex-1 border-0 bg-transparent px-compact text-body text-inherit outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
        />
        {!readOnly && !hideSteppers && (
          <>
            <button type="button" tabIndex={-1} aria-label="уменьшить" aria-controls={ids.id} disabled={disabled || (min !== undefined && value !== '' && value <= min)} onClick={(e) => stepBy(e, -1)} className={btn}>
              <Icon name="minus" />
            </button>
            <button type="button" tabIndex={-1} aria-label="увеличить" aria-controls={ids.id} disabled={disabled || (max !== undefined && value !== '' && value >= max)} onClick={(e) => stepBy(e, 1)} className={btn}>
              <Icon name="add" />
            </button>
          </>
        )}
      </div>
    </FieldShell>
  )
})
