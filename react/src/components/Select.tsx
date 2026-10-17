/**
 * Выбор из короткого списка: родной `<select>` системы — на телефоне колесо системы, клавиатура и читалка работают сами.
 * Вид — как у поля ввода. Список длинный или нужен поиск — `Combobox`.
 */
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import { FieldShell, fieldAria, fieldBox, useFieldIds, type FieldBaseProps } from './TextField'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends FieldBaseProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children' | 'className' | 'onChange' | 'value' | 'defaultValue'> {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Пустой первый пункт «Выберите …», пока ничего не выбрано; выбрать его обратно нельзя. */
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel, helperText, error, dense, className, id, disabled, options, value, defaultValue, onChange, placeholder, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  return (
    <FieldShell slot="select" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} className={className}>
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={ids.id}
          disabled={disabled}
          value={value}
          defaultValue={value === undefined ? (defaultValue ?? (placeholder ? '' : undefined)) : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          {...fieldAria(ids, { helperText, error })}
          {...rest}
          className={cx(fieldBox({ invalid: Boolean(error), disabled, dense }), 'cursor-pointer appearance-none pr-sections pl-compact')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" className={cx('pointer-events-none absolute right-compact', disabled ? 'text-fg-disabled' : 'text-fg')} />
      </div>
    </FieldShell>
  )
})
