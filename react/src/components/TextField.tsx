/**
 * Поля ввода (Carbon Text input, Text area): подпись над полем, поле с нижней чертой, под полем — подсказка или ошибка.
 * Ошибка заменяет подсказку (как у Carbon): поле обведено цветом ошибки, справа значок, текст ошибки читалка слышит
 * вместе с полем (aria-describedby + aria-invalid). Фокус — обводка `focus` внутрь поля.
 * Высота: sm 32 · md 40 · lg 48 px; на телефоне md — 48 px (палец). Поле в окне или панели берёт `field-02` (слой 2).
 * Тот же каркас (`FieldShell`) у выбора, числа и выбора с поиском — подпись, подсказка и ошибка везде одинаковые.
 */
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { useLayer, type Layer } from '../lib/controllable'
import { ToneIcon } from './StatusBadge'

export type FieldSize = 'sm' | 'md' | 'lg'

export interface FieldBaseProps {
  /** Подпись поля — всегда есть (читалка); `hideLabel` прячет её с экрана, когда смысл виден рядом. */
  label: ReactNode
  hideLabel?: boolean
  /** Подсказка под полем: формат, пример, зачем поле. */
  helperText?: ReactNode
  /** Текст ошибки. Есть — поле в состоянии ошибки, подсказка уступает место ошибке. */
  error?: ReactNode
  size?: FieldSize
  className?: string
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

const H: Record<FieldSize, string> = { sm: 'h-8', md: 'h-12 md:h-10', lg: 'h-12' }
export const FIELD_HEIGHT = H

/** Вид поля (бокса с чертой) — общий для ввода, выбора, числа и выбора с поиском. */
export function fieldBoxClass({ layer, invalid, disabled, readOnly, within }: { layer: Layer; invalid?: boolean; disabled?: boolean; readOnly?: boolean; within?: boolean }) {
  const focus = within
    ? 'focus-within:outline-2 focus-within:outline-focus focus-within:-outline-offset-2'
    : 'focus:outline-2 focus:outline-focus focus:-outline-offset-2'
  return cx(
    'w-full min-w-0 rounded-none border-0 border-b text-body-compact-01 text-text-primary',
    'transition-colors duration-(--cds-duration-fast-01) ease-standard-productive',
    readOnly
      ? 'bg-transparent border-border-subtle-01'
      : layer === 2
        ? 'bg-field-02 border-border-strong-02'
        : 'bg-field-01 border-border-strong-01',
    !readOnly && !disabled && (layer === 2 ? 'hover:bg-field-hover-02' : 'hover:bg-field-hover-01'),
    disabled && 'cursor-not-allowed border-transparent text-text-disabled',
    invalid && 'outline-2 outline-support-error -outline-offset-2',
    focus,
  )
}

/** Значок ошибки в поле (форма + цвет: цвет никогда не один). */
export function ErrorMark({ className }: { className?: string }) {
  return <ToneIcon tone="error" className={cx('pointer-events-none text-support-error', className)} />
}

export interface FieldShellProps extends Pick<FieldBaseProps, 'label' | 'hideLabel' | 'helperText' | 'error' | 'className'> {
  ids: FieldIds
  disabled?: boolean
  /** Справа от подписи: счётчик знаков. */
  aside?: ReactNode
  /** data-slot корня: text-field, select, number-field … */
  slot: string
  children: ReactNode
}

/** Каркас поля: подпись, поле, подсказка или ошибка. */
export function FieldShell({ ids, label, hideLabel, helperText, error, disabled, aside, slot, className, children }: FieldShellProps) {
  return (
    <div data-slot={slot} data-invalid={error ? 'true' : undefined} className={cx('flex min-w-0 flex-col', className)}>
      <div className={cx('mb-2 flex items-baseline justify-between gap-2', hideLabel && !aside && 'sr-only')}>
        <label id={ids.labelId} htmlFor={ids.id} className={cx('text-label-01', disabled ? 'text-text-disabled' : 'text-text-secondary', hideLabel && 'sr-only')}>
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={ids.errId} className="m-0 mt-1 text-helper-text-01 text-text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={ids.helpId} className={cx('m-0 mt-1 text-helper-text-01', disabled ? 'text-text-disabled' : 'text-text-helper')}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

/* ——— Однострочное поле ——— */

export interface TextFieldProps extends FieldBaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'children' | 'className'> {
  /** Тип ввода: text, email, password, url, tel, date, time, month, datetime-local … (у даты и времени — родной выбор системы). */
  type?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, helperText, error, size = 'md', className, id, disabled, readOnly, type = 'text', ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const layer = useLayer()
  return (
    <FieldShell slot="text-field" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} className={className}>
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={ids.id}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          {...fieldAria(ids, { helperText, error })}
          {...rest}
          className={cx(fieldBoxClass({ layer, invalid: Boolean(error), disabled, readOnly }), H[size], 'px-4 placeholder:text-text-placeholder', Boolean(error) && 'pr-10')}
        />
        {error && <ErrorMark className="absolute right-4" />}
      </div>
    </FieldShell>
  )
})

/* ——— Многострочное поле ——— */

export interface TextAreaProps extends Omit<FieldBaseProps, 'size'>, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'className'> {
  /** Показать счётчик «набрано / можно» у подписи (нужен `maxLength`). */
  showCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hideLabel, helperText, error, className, id, disabled, readOnly, rows = 4, showCount, maxLength, value, defaultValue, onChange, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const layer = useLayer()
  const [len, setLen] = useState(() => String(value ?? defaultValue ?? '').length)
  const count = value !== undefined ? String(value).length : len
  const counter =
    showCount && maxLength ? (
      <span className={cx('text-label-01', disabled ? 'text-text-disabled' : 'text-text-secondary')} aria-hidden="true">
        {count}/{maxLength}
      </span>
    ) : null
  return (
    <FieldShell slot="text-area" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} aside={counter} className={className}>
      <div className="relative flex">
        <textarea
          ref={ref}
          id={ids.id}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            setLen(e.target.value.length)
            onChange?.(e)
          }}
          {...fieldAria(ids, { helperText, error })}
          {...rest}
          className={cx(fieldBoxClass({ layer, invalid: Boolean(error), disabled, readOnly }), 'block resize-y px-4 py-3 placeholder:text-text-placeholder', Boolean(error) && 'pr-10')}
        />
        {error && <ErrorMark className="absolute top-3 right-4" />}
      </div>
    </FieldShell>
  )
})
