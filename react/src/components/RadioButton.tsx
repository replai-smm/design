/**
 * Один из нескольких (Carbon: RadioButton, RadioButtonGroup): родной `<input type="radio">` — круг 16 px, выбранный —
 * точка внутри. Группа — fieldset с `legendText`: держит `name`, выбранное (`valueSelected` или своё с `defaultSelected`)
 * и зовёт `onChange(value, name, event)`; по умолчанию кружки в ряд, `orientation="vertical"` — столбиком (Carbon).
 * Стрелки ходят по кружкам сами (так работает браузер). Вариантов 2–5 и их видно сразу; больше — `Select` или `ComboBox`.
 */
import { createContext, forwardRef, useContext, useEffect, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { FieldNote, fieldAria, fieldState, useFieldIds, type FieldMessages } from './TextInput'

type Value = string | number

interface GroupState {
  name: string
  selected: Value | undefined
  readOnly?: boolean
  required?: boolean
  select: (value: Value, event: ChangeEvent<HTMLInputElement>) => void
}
const GroupContext = createContext<GroupState | null>(null)

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'className' | 'children'> {
  /** Подпись кружка. */
  labelText: ReactNode
  hideLabel?: boolean
  value?: Value
  /** В группе — от группы; одиночный — свой. */
  name?: string
  /** У кружка в группе не зовётся: выбор слушает группа (Carbon). */
  onChange?: (value: Value | undefined, name: string | undefined, event: ChangeEvent<HTMLInputElement>) => void
  className?: string
}

/** Кружок выбора (Carbon: RadioButton). */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { id, labelText, hideLabel, value = '', name, checked, onChange, onClick, disabled, readOnly, required, className, ...rest },
  ref,
) {
  const group = useContext(GroupContext)
  const ids = useFieldIds(id)
  const off = readOnly || group?.readOnly
  return (
    <div data-slot="radio-button" className={cx('flex min-h-touch min-w-0 items-center gap-items md:min-h-dense', className)}>
      <span className="relative inline-flex size-icon shrink-0">
        <input
          ref={ref}
          type="radio"
          id={ids.id}
          value={value}
          name={group?.name ?? name}
          checked={group ? group.selected === value : checked}
          required={group?.required ?? required}
          disabled={disabled}
          readOnly={off}
          onClick={(e) => {
            // «только чтение» — выбор не меняется (у родного radio readOnly не действует)
            if (off) e.preventDefault()
            onClick?.(e)
          }}
          onChange={(e) => (group ? group.select(value, e) : onChange?.(value, name, e))}
          {...rest}
          className={cx(
            'peer m-0 size-icon cursor-pointer appearance-none rounded-full border border-line-strong bg-surface in-data-[invalid=true]:border-danger checked:border-inverse',
            FOCUS,
            'disabled:cursor-not-allowed disabled:border-line',
          )}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-tight hidden rounded-full bg-inverse peer-checked:block peer-disabled:bg-fg-disabled" />
      </span>
      <label htmlFor={ids.id} className={cx('min-w-0 cursor-pointer text-body', disabled ? 'cursor-not-allowed text-fg-disabled' : 'text-fg', hideLabel && 'sr-only')}>
        {labelText}
      </label>
    </div>
  )
})

export interface RadioButtonGroupProps extends FieldMessages {
  /** Имя группы — одно на все кружки (обязательно, как у Carbon). */
  name: string
  legendText?: ReactNode
  /** Выбранное снаружи. */
  valueSelected?: Value
  /** Выбранное при показе, дальше — своё. */
  defaultSelected?: Value
  onChange?: (selection: Value, name: string, event: ChangeEvent<HTMLInputElement>) => void
  /** По умолчанию в ряд (Carbon); `vertical` — столбиком. */
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  children?: ReactNode
  className?: string
}

/** Один из нескольких (Carbon: RadioButtonGroup): fieldset с legend — читалка называет группу у каждого кружка. */
export const RadioButtonGroup = forwardRef<HTMLFieldSetElement, RadioButtonGroupProps>(function RadioButtonGroup(
  { name, legendText, valueSelected, defaultSelected, onChange, orientation = 'horizontal', disabled, readOnly, required, helperText, invalid, invalidText, warn, warnText, children, className },
  ref,
) {
  const ids = useFieldIds()
  const [selected, setSelected] = useState(valueSelected ?? defaultSelected)
  useEffect(() => {
    if (valueSelected !== undefined) setSelected(valueSelected)
  }, [valueSelected])
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  const select = (value: Value, event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly || value === selected) return
    setSelected(value)
    onChange?.(value, name, event)
  }
  return (
    <GroupContext.Provider value={{ name, selected, readOnly, required, select }}>
      <fieldset
        ref={ref}
        data-slot="radio-button-group"
        data-invalid={state.invalid ? 'true' : undefined}
        disabled={disabled}
        {...fieldAria(ids, messages, state)}
        className={cx('m-0 flex min-w-0 flex-col gap-tight border-0 p-0', className)}
      >
        {legendText && <legend className={cx('mb-tight p-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>{legendText}</legend>}
        <div className={cx('flex flex-col', orientation === 'horizontal' && 'md:flex-row md:flex-wrap md:gap-x-blocks')}>{children}</div>
        <FieldNote ids={ids} state={state} disabled={disabled} {...messages} />
      </fieldset>
    </GroupContext.Provider>
  )
})
