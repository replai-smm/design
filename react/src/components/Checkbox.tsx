/**
 * Галочка: квадрат 16 px в рамке контрола, отмечено — инверсия и галка, «частично» — черта. Нажимается вся строка
 * с подписью; строка — 48 на телефоне, 32 на ноутбуке. Несколько галочек про одно — `CheckboxGroup`: общая подпись
 * (legend), подсказка, ошибка.
 */
import { forwardRef, type ReactNode } from 'react'
import { Checkbox as RCheckbox } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Icon } from './Icon'
import { Toggletip } from './Toggletip'
import { FieldNote, fieldAria, useFieldIds } from './TextField'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps {
  label: ReactNode
  hideLabel?: boolean
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  helperText?: ReactNode
  /** Справка по «i» после подписи (`Toggletip`); подпись — строкой. */
  help?: ReactNode
  /** Ошибка этой галочки («нужно согласие»). У группы — на `CheckboxGroup`. */
  error?: ReactNode
  name?: string
  value?: string
  required?: boolean
  id?: string
  className?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { label, hideLabel, checked, defaultChecked, onCheckedChange, disabled, helperText, help, error, name, value, required, id, className },
  ref,
) {
  const ids = useFieldIds(id)
  rule(!help || typeof label === 'string', 'справка «i» у галочки с подписью не строкой: читалка не узнает, о чём справка')
  return (
    <div data-slot="checkbox" data-invalid={error ? 'true' : undefined} className={cx('flex min-w-0 flex-col', className)}>
      <div className="flex min-h-touch items-center gap-items md:min-h-dense">
        <RCheckbox.Root
          ref={ref}
          id={ids.id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          name={name}
          value={value}
          required={required}
          {...fieldAria(ids, { helperText, error })}
          className={cx(
            'group inline-flex size-icon shrink-0 cursor-pointer items-center justify-center rounded-control border bg-surface text-fg-inverse',
            error ? 'border-danger' : 'border-line-strong',
            'data-[state=checked]:border-inverse data-[state=checked]:bg-inverse data-[state=indeterminate]:border-inverse data-[state=indeterminate]:bg-inverse',
            FOCUS,
            'disabled:cursor-not-allowed disabled:border-line disabled:data-[state=checked]:bg-fg-disabled',
          )}
        >
          <RCheckbox.Indicator className="inline-flex size-full items-center justify-center">
            <Icon name="check" className="group-data-[state=indeterminate]:hidden" />
            <Icon name="minus" className="hidden group-data-[state=indeterminate]:block" />
          </RCheckbox.Indicator>
        </RCheckbox.Root>
        <label htmlFor={ids.id} id={ids.labelId} className={cx('min-w-0 cursor-pointer text-body', disabled ? 'cursor-not-allowed text-fg-disabled' : 'text-fg', hideLabel && 'sr-only')}>
          {label}
        </label>
        {help && <Toggletip label={String(label)}>{help}</Toggletip>}
      </div>
      <FieldNote ids={ids} helperText={helperText} error={error} disabled={disabled} />
    </div>
  )
})

export interface CheckboxGroupProps {
  /** Общая подпись группы (legend). */
  legend: ReactNode
  helperText?: ReactNode
  error?: ReactNode
  disabled?: boolean
  /** Галочки в ряд на ноутбуке; по умолчанию — столбиком. */
  orientation?: 'vertical' | 'horizontal'
  children: ReactNode
  className?: string
  id?: string
}

/** Группа галочек: fieldset с legend — читалка называет группу у каждой галочки. */
export function CheckboxGroup({ legend, helperText, error, disabled, orientation = 'vertical', children, className, id }: CheckboxGroupProps) {
  const ids = useFieldIds(id)
  return (
    <fieldset
      data-slot="checkbox-group"
      data-invalid={error ? 'true' : undefined}
      disabled={disabled}
      {...fieldAria(ids, { helperText, error })}
      className={cx('m-0 flex min-w-0 flex-col gap-tight border-0 p-0', className)}
    >
      <legend className={cx('mb-tight p-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>{legend}</legend>
      <div className={cx('flex flex-col', orientation === 'horizontal' && 'md:flex-row md:flex-wrap md:gap-x-blocks')}>{children}</div>
      <FieldNote ids={ids} helperText={helperText} error={error} disabled={disabled} />
    </fieldset>
  )
}
