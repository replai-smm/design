/**
 * Поля ввода: подпись над полем, поле в рамке, под полем — подсказка или ошибка. Ошибка заменяет подсказку: рамка цвета
 * «опасно», под полем — знак и слово; текст ошибки читалка слышит вместе с полем (aria-describedby + aria-invalid).
 * Высота — 48 на телефоне и 40 на ноутбуке, `dense` — 32. Тот же каркас (`FieldShell`) и та же рамка (`fieldBox`) —
 * у выбора, числа, поиска, выбора с поиском и файла: подпись, подсказка и ошибка везде одни.
 */
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { CONTROL, DENSE, FAST } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Icon } from './Icon'
import { Toggletip } from './Toggletip'

export interface FieldBaseProps {
  /** Подпись поля — всегда есть (читалка); `hideLabel` прячет её с экрана, когда смысл виден рядом. */
  label: ReactNode
  hideLabel?: boolean
  /** Подсказка под полем: формат, пример, зачем поле. */
  helperText?: ReactNode
  /** Текст ошибки. Есть — поле в состоянии ошибки, подсказка уступает место. */
  error?: ReactNode
  /** 32 px — плотное поле (строка фильтров, шапка). */
  dense?: boolean
  /** Справка по «i» у подписи (`Toggletip`): дополнительное, не нужное для дела — нужное пишут подсказкой. */
  help?: ReactNode
  className?: string
}

/** Поле настройки одной строкой: `Подпись (i) ……… [ 10 ] баллов`. Есть у текста, числа, выбора и выбора с поиском. */
export interface FieldRowProps {
  /** Подпись слева, поле с единицей справа — с 1024 px (`lg`); уже — подпись над полем. Подпись — текстом, не мелкой строкой. */
  inline?: boolean
  /** Единица после поля: «баллов», «дней». */
  unit?: ReactNode
}

export interface FieldIds {
  id: string
  labelId: string
  helpId: string
  errId: string
}

export function useFieldIds(id?: string): FieldIds {
  const auto = 'ds-f' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const base = id ?? auto
  return { id: base, labelId: `${base}-label`, helpId: `${base}-help`, errId: `${base}-err` }
}

/** aria-* поля: кем описано и неверно ли. */
export function fieldAria(ids: FieldIds, { helperText, error }: Pick<FieldBaseProps, 'helperText' | 'error'>, extra?: string) {
  const by = [error ? ids.errId : helperText ? ids.helpId : null, extra].filter(Boolean).join(' ')
  return { 'aria-describedby': by || undefined, 'aria-invalid': error ? (true as const) : undefined }
}

/** Рамка поля — общая для ввода, выбора, числа, поиска и выбора с поиском. `within` — фокус внутри (поле с кнопками). */
export function fieldBox({ invalid, disabled, readOnly, within, dense }: { invalid?: boolean; disabled?: boolean; readOnly?: boolean; within?: boolean; dense?: boolean }) {
  return cx(
    'w-full min-w-0 rounded-control border bg-surface text-body text-fg placeholder:text-fg-muted',
    FAST,
    dense ? DENSE : CONTROL,
    readOnly ? 'border-line' : invalid ? 'border-danger' : 'border-line-strong',
    disabled && 'cursor-not-allowed border-line text-fg-disabled',
    within
      ? 'focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent'
      : 'focus:outline-2 focus:-outline-offset-2 focus:outline-accent',
  )
}

/** Подсказка или ошибка под полем. */
export function FieldNote({ ids, helperText, error, disabled }: { ids: FieldIds; helperText?: ReactNode; error?: ReactNode; disabled?: boolean }) {
  if (error)
    return (
      <p id={ids.errId} className="m-0 flex items-start gap-tight text-caption text-danger-fg">
        <Icon tone="опасно" />
        <span className="min-w-0">{error}</span>
      </p>
    )
  if (helperText)
    return (
      <p id={ids.helpId} className={cx('m-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>
        {helperText}
      </p>
    )
  return null
}

export interface FieldShellProps extends Pick<FieldBaseProps, 'label' | 'hideLabel' | 'helperText' | 'error' | 'help' | 'className'>, FieldRowProps {
  ids: FieldIds
  disabled?: boolean
  /** data-slot корня: text-field, select, number-field … */
  slot: string
  children: ReactNode
}

/**
 * Каркас поля: подпись (и «i»), поле, подсказка или ошибка. `inline` — подпись слева, справа колонкой поле, единица и под
 * ними подсказка или ошибка: ошибка стоит у поля, а не под подписью. Ряд — с `lg`: рядом с колонкой разделов продукта
 * на `md` полю не хватает места.
 */
export function FieldShell({ ids, label, hideLabel, helperText, error, help, disabled, slot, className, inline, unit, children }: FieldShellProps) {
  rule(!help || typeof label === 'string', 'справка «i» у поля с подписью не строкой: читалка не узнает, о чём справка')
  const muted = disabled ? 'text-fg-disabled' : 'text-fg-muted'
  const labelEl = (
    <label id={ids.labelId} htmlFor={ids.id} className={cx(inline ? 'text-body' : 'text-caption', inline && !disabled ? 'text-fg' : muted, hideLabel && 'sr-only')}>
      {label}
    </label>
  )
  const head = help ? (
    <span className="flex min-w-0 items-center gap-tight">
      {labelEl}
      <Toggletip label={String(label)}>{help}</Toggletip>
    </span>
  ) : (
    labelEl
  )
  const note = <FieldNote ids={ids} helperText={helperText} error={error} disabled={disabled} />
  if (inline)
    return (
      <div data-slot={slot} data-invalid={error ? 'true' : undefined} data-inline="true" className={cx('flex min-w-0 flex-col gap-tight lg:flex-row lg:items-start lg:gap-blocks', className)}>
        <div className="min-w-0 lg:flex lg:min-h-control lg:flex-1 lg:items-center">{head}</div>
        <div className="flex min-w-0 flex-col gap-tight lg:w-narrow">
          <div className="flex min-w-0 items-center gap-items">
            <div className="min-w-0 flex-1">{children}</div>
            {unit && <span className={cx('shrink-0 text-body', muted)}>{unit}</span>}
          </div>
          {note}
        </div>
      </div>
    )
  return (
    <div data-slot={slot} data-invalid={error ? 'true' : undefined} className={cx('flex min-w-0 flex-col gap-tight', className)}>
      {head}
      {children}
      {note}
    </div>
  )
}

/* ——— Однострочное поле ——— */

export interface TextFieldProps extends FieldBaseProps, FieldRowProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children' | 'className'> {
  /** text, email, password, url, tel, date, time, month, datetime-local … (у даты и времени — выбор системы). */
  type?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, helperText, error, dense, className, id, disabled, readOnly, type = 'text', inline, unit, help, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  return (
    <FieldShell slot="text-field" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} className={className} inline={inline} unit={unit} help={help}>
      <input
          ref={ref}
          id={ids.id}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          {...fieldAria(ids, { helperText, error })}
          {...rest}
          className={cx(fieldBox({ invalid: Boolean(error), disabled, readOnly, dense }), 'px-compact')}
        />
    </FieldShell>
  )
})

/* ——— Многострочное поле ——— */

export interface TextAreaProps extends Omit<FieldBaseProps, 'dense'>, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'className'> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hideLabel, helperText, error, help, className, id, disabled, readOnly, rows = 4, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  return (
    <FieldShell slot="text-area" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} help={help} disabled={disabled} className={className}>
      <textarea
          ref={ref}
          id={ids.id}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          {...fieldAria(ids, { helperText, error })}
          {...rest}
          className={cx(fieldBox({ invalid: Boolean(error), disabled, readOnly }), 'block resize-y px-compact py-items')}
        />
    </FieldShell>
  )
})
