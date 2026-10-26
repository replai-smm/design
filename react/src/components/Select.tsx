/**
 * Выбор из короткого списка (Carbon: Select, SelectItem, SelectItemGroup): родной `<select>` системы — на телефоне колесо
 * системы, клавиатура и читалка работают сами. Пункты — детьми `<SelectItem value text />`, группы — `<SelectItemGroup
 * label>`; «Выберите…» — `<SelectItem value="" text="Выберите…" disabled hidden />` и `defaultValue=""`. `onChange(event)` —
 * событие `<select>`, как у Carbon. Вид — как у поля ввода. Список длинный или нужен поиск — `ComboBox`.
 */
import { forwardRef, type OptionHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import type { Size } from '../lib/vocab'
import { Icon } from './Icon'
import { FieldShell, checkFieldSize, fieldAria, fieldBox, fieldState, useFieldIds, type FieldMessages, type FieldRowProps } from './TextInput'

export interface SelectProps extends FieldMessages, FieldRowProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'id' | 'className'> {
  id: string
  labelText?: ReactNode
  hideLabel?: boolean
  size?: Size
  /** `SelectItem` и `SelectItemGroup`. */
  children?: ReactNode
  className?: string
}

/** Выбор из короткого списка системой (Carbon: Select). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, labelText, hideLabel, helperText, invalid, invalidText, warn, warnText, size, className, disabled, inline, unit, children, ...rest },
  ref,
) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled })
  return (
    <FieldShell slot="select" ids={ids} label={labelText} hideLabel={hideLabel} disabled={disabled} className={className} inline={inline} unit={unit} {...messages}>
      <div className="relative flex items-center">
        <select ref={ref} id={ids.id} disabled={disabled} {...fieldAria(ids, messages, state)} {...rest} className={cx(fieldBox({ invalid: state.invalid, disabled, size }), 'cursor-pointer appearance-none pr-sections pl-compact')}>
          {children}
        </select>
        <Icon name="chevron-down" className={cx('pointer-events-none absolute right-compact', disabled ? 'text-fg-disabled' : 'text-fg')} />
      </div>
    </FieldShell>
  )
})

export interface SelectItemProps extends Omit<OptionHTMLAttributes<HTMLOptionElement>, 'children' | 'label'> {
  value: OptionHTMLAttributes<HTMLOptionElement>['value']
  /** Слово пункта. */
  text: string
  disabled?: boolean
  /** Спрятан из списка — пункт-подсказка «Выберите…». */
  hidden?: boolean
}

/** Пункт выбора (Carbon: SelectItem). */
export function SelectItem({ text, ...rest }: SelectItemProps) {
  return <option {...rest}>{text}</option>
}

export interface SelectItemGroupProps {
  /** Название группы пунктов. */
  label: string
  disabled?: boolean
  children?: ReactNode
  className?: string
}

/** Группа пунктов выбора (Carbon: SelectItemGroup). */
export function SelectItemGroup({ label, disabled, children, className }: SelectItemGroupProps) {
  return (
    <optgroup label={label} disabled={disabled} className={className}>
      {children}
    </optgroup>
  )
}
