/**
 * Выбор из короткого списка (Carbon Select): родной `<select>` системы — на телефоне открывается колесом системы,
 * клавиатура и читалка работают без доработок. Вид — как у поля ввода: подпись, черта, подсказка или ошибка.
 * Список длинный или нужен поиск — `Combobox`.
 */
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { useLayer } from '../lib/controllable'
import { ErrorMark, FIELD_HEIGHT, FieldShell, fieldAria, fieldBoxClass, useFieldIds, type FieldBaseProps } from './TextField'

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
  /** Пустой первый пункт «Выберите …» — пока ничего не выбрано; выбрать его обратно нельзя. */
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel, helperText, error, size = 'md', className, id, disabled, options, value, defaultValue, onChange, placeholder, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const layer = useLayer()
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
          className={cx(
            fieldBoxClass({ layer, invalid: Boolean(error), disabled }),
            FIELD_HEIGHT[size],
            'cursor-pointer appearance-none pr-12 pl-4',
            Boolean(error) && 'pr-16',
          )}
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
        {error && <ErrorMark className="absolute right-10" />}
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cx('pointer-events-none absolute right-4 size-4', disabled ? 'text-icon-disabled' : 'text-icon-primary')}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldShell>
  )
})
