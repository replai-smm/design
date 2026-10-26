/**
 * Галочка (Carbon: Checkbox, CheckboxGroup): родной `<input type="checkbox">` — квадрат 16 px в рамке контрола,
 * отмечено — инверсия и галка, `indeterminate` — черта. Нажимается вся строка с подписью; строка — 48 на телефоне, 32 на
 * ноутбуке. `onChange(event, { checked, id })` — как у Carbon. Несколько галочек про одно — `CheckboxGroup`: общая подпись
 * (`legendText`), подсказка, ошибка — у ошибочной группы рамка каждой галочки цвета «опасно».
 */
import { forwardRef, useEffect, useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import { FieldNote, fieldAria, fieldState, useFieldIds, type FieldMessages } from './TextInput'

export interface CheckboxProps extends FieldMessages, Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'type' | 'className' | 'children'> {
  id: string
  /** Подпись: строка или `ToggletipLabel` + `Toggletip` (справка «i»). */
  labelText: NonNullable<ReactNode>
  hideLabel?: boolean
  /** «Частично»: отмечена часть вложенных. */
  indeterminate?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>, data: { checked: boolean; id: string }) => void
  className?: string
}

/** Да или нет одной галочкой (Carbon: Checkbox). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, labelText, hideLabel, indeterminate, onChange, onClick, disabled, readOnly, helperText, invalid, invalidText, warn, warnText, className, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const own = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (own.current) own.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  return (
    <div data-slot="checkbox" data-invalid={state.invalid ? 'true' : undefined} className={cx('flex min-w-0 flex-col', className)}>
      <div className="flex min-h-touch items-center gap-items md:min-h-dense">
        <span className="relative inline-flex size-icon shrink-0 text-fg-inverse">
          <input
            ref={(el) => {
              own.current = el
              if (typeof ref === 'function') ref(el)
              else if (ref) ref.current = el
            }}
            type="checkbox"
            id={ids.id}
            disabled={disabled}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            onClick={(e) => {
              // галочка «только чтение» не переключается (у родного checkbox readOnly не действует)
              if (readOnly) e.preventDefault()
              onClick?.(e)
            }}
            onChange={(e) => onChange?.(e, { checked: e.target.checked, id: ids.id })}
            {...fieldAria(ids, messages, state)}
            {...rest}
            className={cx(
              'peer m-0 size-icon cursor-pointer appearance-none rounded-control border border-line-strong bg-surface in-data-[invalid=true]:border-danger',
              'checked:border-inverse checked:bg-inverse indeterminate:border-inverse indeterminate:bg-inverse',
              FOCUS,
              'disabled:cursor-not-allowed disabled:border-line disabled:checked:border-fg-disabled disabled:checked:bg-fg-disabled disabled:indeterminate:border-fg-disabled disabled:indeterminate:bg-fg-disabled',
            )}
          />
          <Icon name="check" className="pointer-events-none absolute inset-0 hidden peer-checked:block peer-indeterminate:hidden" />
          <Icon name="minus" className="pointer-events-none absolute inset-0 hidden peer-indeterminate:block" />
        </span>
        <label htmlFor={ids.id} id={ids.labelId} className={cx('flex min-w-0 cursor-pointer items-center gap-tight text-body', disabled ? 'cursor-not-allowed text-fg-disabled' : 'text-fg', hideLabel && 'sr-only')}>
          {labelText}
        </label>
      </div>
      <FieldNote ids={ids} state={state} disabled={disabled} {...messages} />
    </div>
  )
})

export interface CheckboxGroupProps extends FieldMessages {
  /** Общая подпись группы (legend). */
  legendText: ReactNode
  legendId?: string
  disabled?: boolean
  /** Галочки в ряд на ноутбуке; по умолчанию — столбиком (Carbon). */
  orientation?: 'vertical' | 'horizontal'
  children?: ReactNode
  className?: string
}

/** Несколько галочек про одно (Carbon: CheckboxGroup): fieldset с legend — читалка называет группу у каждой галочки. */
export function CheckboxGroup({ legendText, legendId, helperText, invalid, invalidText, warn, warnText, disabled, orientation = 'vertical', children, className }: CheckboxGroupProps) {
  const ids = useFieldIds(legendId ? `${legendId}-group` : undefined)
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled })
  return (
    <fieldset
      data-slot="checkbox-group"
      data-invalid={state.invalid ? 'true' : undefined}
      disabled={disabled}
      {...fieldAria(ids, messages, state)}
      className={cx('m-0 flex min-w-0 flex-col gap-tight border-0 p-0', className)}
    >
      <legend id={legendId} className={cx('mb-tight p-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>
        {legendText}
      </legend>
      <div className={cx('flex flex-col', orientation === 'horizontal' && 'md:flex-row md:flex-wrap md:gap-x-blocks')}>{children}</div>
      <FieldNote ids={ids} state={state} disabled={disabled} {...messages} />
    </fieldset>
  )
}
