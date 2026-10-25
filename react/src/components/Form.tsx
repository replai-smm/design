/**
 * Форма и группа полей (Carbon: Form, FormGroup). `Form` — родной `<form>`: отправка по Enter и кнопке `type="submit"`
 * работает сама. `FormGroup` — fieldset с `legendText`: связанные поля одной подписью («Адрес», «Тихие часы»), читалка
 * называет группу у каждого поля; `invalid` + `message` + `messageText` — слово под группой. Своей раскладки у обоих нет,
 * как у Carbon: поля внутри ставит `Stack` (`<FormGroup legendText="…"><Stack gap={5}>…</Stack></FormGroup>`).
 */
import type { FormHTMLAttributes, FieldsetHTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export type FormProps = FormHTMLAttributes<HTMLFormElement>

/** Форма (Carbon: Form). */
export function Form({ className, children, ...rest }: FormProps) {
  return (
    <form data-slot="form" className={className} {...rest}>
      {children}
    </form>
  )
}

export interface FormGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children'> {
  /** Подпись группы (legend). */
  legendText: ReactNode
  legendId?: string
  invalid?: boolean
  /** Показать слово под группой. */
  message?: boolean
  messageText?: string
  children: ReactNode
}

/** Группа связанных полей одной подписью (Carbon: FormGroup). */
export function FormGroup({ legendText, legendId, invalid, message, messageText, disabled, className, children, ...rest }: FormGroupProps) {
  const shownInvalid = Boolean(invalid) && !disabled
  return (
    <fieldset
      data-slot="form-group"
      data-invalid={shownInvalid ? 'true' : undefined}
      disabled={disabled}
      aria-labelledby={legendId}
      className={cx('m-0 min-w-0 border-0 p-0', className)}
      {...rest}
    >
      <legend id={legendId} className={cx('mb-compact p-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>
        {legendText}
      </legend>
      {children}
      {message && messageText && (
        <p className={cx('m-0 mt-tight flex items-start gap-tight text-caption', shownInvalid ? 'text-danger-fg' : 'text-fg-muted')}>
          {shownInvalid && <Icon tone="опасно" />}
          <span className="min-w-0">{messageText}</span>
        </p>
      )}
    </fieldset>
  )
}
