/**
 * Галочка (Carbon Checkbox) на Radix Checkbox: квадрат 16 px с рамкой цвета значка, отмечено — заливка и галка,
 * «частично» — черта (группа отмечена не вся). Нажимается вся строка с подписью; на телефоне строка 48 px (палец).
 * Пробел переключает. Несколько галочек про одно — `CheckboxGroup`: общая подпись (legend), подсказка, ошибка.
 */
import { forwardRef, type ReactNode } from 'react'
import { Checkbox as RCheckbox } from 'radix-ui'
import { cx } from '../lib/cx'
import { fieldAria, useFieldIds } from './TextField'

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps {
  label: ReactNode
  hideLabel?: boolean
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  /** Подсказка под галочкой. */
  helperText?: ReactNode
  /** Ошибка этой галочки («нужно согласие»). У группы ошибка — на `CheckboxGroup`. */
  error?: ReactNode
  name?: string
  value?: string
  required?: boolean
  id?: string
  className?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { label, hideLabel, checked, defaultChecked, onCheckedChange, disabled, helperText, error, name, value, required, id, className },
  ref,
) {
  const ids = useFieldIds(id)
  const invalid = Boolean(error)
  return (
    <div data-slot="checkbox" data-invalid={invalid ? 'true' : undefined} className={cx('flex min-w-0 flex-col', className)}>
      <div className="flex min-h-12 items-center gap-2 md:min-h-6">
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
            'group inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border bg-transparent text-icon-inverse',
            invalid ? 'border-support-error' : 'border-icon-primary',
            'data-[state=checked]:border-icon-primary data-[state=checked]:bg-icon-primary',
            'data-[state=indeterminate]:border-icon-primary data-[state=indeterminate]:bg-icon-primary',
            'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1',
            'disabled:cursor-not-allowed disabled:border-icon-disabled disabled:data-[state=checked]:bg-icon-disabled disabled:data-[state=indeterminate]:bg-icon-disabled',
          )}
        >
          <RCheckbox.Indicator className="inline-flex size-full items-center justify-center">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-3">
              <path className="group-data-[state=indeterminate]:hidden" d="M3.5 8.2l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              <path className="hidden group-data-[state=indeterminate]:block" d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </RCheckbox.Indicator>
        </RCheckbox.Root>
        <label
          htmlFor={ids.id}
          id={ids.labelId}
          className={cx('min-w-0 cursor-pointer text-body-compact-01', disabled ? 'cursor-not-allowed text-text-disabled' : 'text-text-primary', hideLabel && 'sr-only')}
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={ids.errId} className="m-0 text-helper-text-01 text-text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={ids.helpId} className={cx('m-0 text-helper-text-01', disabled ? 'text-text-disabled' : 'text-text-helper')}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export interface CheckboxGroupProps {
  /** Общая подпись группы (legend). */
  legend: ReactNode
  helperText?: ReactNode
  error?: ReactNode
  disabled?: boolean
  /** Галочки в ряд (на ноутбуке); по умолчанию — столбиком. */
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
      className={cx('m-0 flex min-w-0 flex-col border-0 p-0', className)}
    >
      <legend className={cx('mb-2 p-0 text-label-01', disabled ? 'text-text-disabled' : 'text-text-secondary')}>{legend}</legend>
      <div className={cx('flex flex-col', orientation === 'horizontal' && 'md:flex-row md:flex-wrap md:gap-x-4')}>{children}</div>
      {error ? (
        <p id={ids.errId} className="m-0 mt-1 text-helper-text-01 text-text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={ids.helpId} className={cx('m-0 mt-1 text-helper-text-01', disabled ? 'text-text-disabled' : 'text-text-helper')}>
          {helperText}
        </p>
      ) : null}
    </fieldset>
  )
}
