/**
 * Поля ввода по Carbon (TextInput, PasswordInput, TextArea) и общий каркас всех полей: подпись над полем, поле в рамке,
 * под полем — подсказка, ошибка или предупреждение. `invalid` + `invalidText` заменяют подсказку: рамка цвета «опасно»,
 * под полем — знак и слово; `warn` + `warnText` — знак «внимание» и слово. Текст под полем читалка слышит вместе с полем
 * (aria-describedby + aria-invalid). У выключенного и «только чтение» ошибки и предупреждения нет (Carbon). Высота —
 * `size`: sm 32 · md 40 · lg 48; без `size` — 48 на телефоне и 40 на ноутбуке. Справка «i» у подписи — `Toggletip`
 * в `labelText` (Carbon): `labelText={<><ToggletipLabel>Срок</ToggletipLabel><Toggletip>…</Toggletip></>}`. Тот же каркас
 * (`FieldShell`) и та же рамка (`fieldBox`) — у выбора, числа, поиска, выбора с поиском: подпись и сообщения везде одни.
 */
import { forwardRef, useId, useState, type InputHTMLAttributes, type MouseEvent, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { CONTROL, DENSE, FAST, FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { View, ViewOff } from '../lib/icons.gen'
import { SIZES, type Size } from '../lib/vocab'
import { Icon } from './Icon'

/** Общее у полей: подсказка, ошибка и предупреждение (Carbon: helperText, invalid, invalidText, warn, warnText). */
export interface FieldMessages {
  /** Подсказка под полем: формат, пример, зачем поле. */
  helperText?: ReactNode
  /** Поле в состоянии ошибки: рамка «опасно», под полем — `invalidText` вместо подсказки. */
  invalid?: boolean
  invalidText?: ReactNode
  /** Предупреждение: под полем — знак «внимание» и `warnText` вместо подсказки. */
  warn?: boolean
  warnText?: ReactNode
}

export interface FieldIds {
  id: string
  labelId: string
  helperId: string
  invalidId: string
  warnId: string
}

export function useFieldIds(id?: string): FieldIds {
  const auto = 'ds-f' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const base = id ?? auto
  return { id: base, labelId: `${base}-label`, helperId: `${base}-helper-text`, invalidId: `${base}-error-msg`, warnId: `${base}-warn-msg` }
}

/** Что видно под полем (Carbon): ошибка и предупреждение — не у выключенного и не у «только чтение»; ошибка сильнее. */
export function fieldState({ invalid, warn, disabled, readOnly }: { invalid?: boolean; warn?: boolean; disabled?: boolean; readOnly?: boolean }) {
  const shownInvalid = Boolean(invalid) && !disabled && !readOnly
  return { invalid: shownInvalid, warn: Boolean(warn) && !shownInvalid && !disabled && !readOnly }
}

/** aria-* поля: кем описано и неверно ли. `state` — из fieldState. */
export function fieldAria(ids: FieldIds, m: FieldMessages, state: { invalid: boolean; warn: boolean }, extra?: string) {
  const own = state.invalid && m.invalidText ? ids.invalidId : state.warn && m.warnText ? ids.warnId : !state.invalid && !state.warn && m.helperText ? ids.helperId : null
  const by = [own, extra].filter(Boolean).join(' ')
  return { 'aria-describedby': by || undefined, 'aria-invalid': state.invalid ? (true as const) : undefined }
}

/** Высота поля по `size`; без `size` — 48 на телефоне и 40 на ноутбуке. */
const HEIGHT: Record<Size, string> = { sm: DENSE, md: 'min-h-control', lg: 'min-h-touch' }
export const fieldHeight = (size?: Size) => (size ? HEIGHT[size] : CONTROL)
/** Квадрат кнопки внутри поля (число, пароль, выбор с поиском) — высоты поля. */
const SQUARE: Record<Size, string> = { sm: 'w-dense', md: 'w-control', lg: 'w-touch' }
export const fieldSquare = (size?: Size) => (size ? SQUARE[size] : 'w-touch md:w-control')

export function checkFieldSize(size: Size | undefined, allowed: readonly Size[] = SIZES) {
  rule(size === undefined || allowed.includes(size), `размера поля «${String(size)}» нет: ${allowed.join(' · ')} (xs — меньше цели пальца)`)
}

/** Рамка поля — общая для ввода, выбора, числа, поиска и выбора с поиском. `within` — фокус внутри (поле с кнопками). */
export function fieldBox({ invalid, disabled, readOnly, within, size }: { invalid?: boolean; disabled?: boolean; readOnly?: boolean; within?: boolean; size?: Size }) {
  return cx(
    'w-full min-w-0 rounded-control border bg-surface text-body text-fg placeholder:text-fg-muted',
    FAST,
    fieldHeight(size),
    readOnly ? 'border-line' : invalid ? 'border-danger' : 'border-line-strong',
    disabled && 'cursor-not-allowed border-line text-fg-disabled',
    within
      ? 'focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent'
      : 'focus:outline-2 focus:-outline-offset-2 focus:outline-accent',
  )
}

/** Подсказка, ошибка или предупреждение под полем. */
export function FieldNote({ ids, helperText, invalidText, warnText, state, disabled }: { ids: FieldIds; state: { invalid: boolean; warn: boolean }; disabled?: boolean } & FieldMessages) {
  if (state.invalid)
    return invalidText ? (
      <p id={ids.invalidId} className="m-0 flex items-start gap-tight text-caption text-danger-fg">
        <Icon tone="опасно" />
        <span className="min-w-0">{invalidText}</span>
      </p>
    ) : null
  if (state.warn)
    return warnText ? (
      <p id={ids.warnId} className="m-0 flex items-start gap-tight text-caption text-fg">
        <Icon tone="внимание" />
        <span className="min-w-0">{warnText}</span>
      </p>
    ) : null
  if (helperText)
    return (
      <p id={ids.helperId} className={cx('m-0 text-caption', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>
        {helperText}
      </p>
    )
  return null
}

/** Поле настройки одной строкой: `Подпись (i) ……… [ 10 ] дней`. `inline` — Carbon; `unit` — расширение сверх Carbon. */
export interface FieldRowProps {
  /** Подпись слева, поле справа — с 1024 px; уже — подпись над полем (Carbon: inline). */
  inline?: boolean
  /** Единица после поля: «дней», «штук» (расширение: у Carbon пары нет). */
  unit?: ReactNode
}

export interface FieldShellProps extends FieldMessages, FieldRowProps {
  ids: FieldIds
  /** Подпись: строка или `ToggletipLabel` + `Toggletip` (справка «i»). */
  label?: ReactNode
  hideLabel?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** Поле узкое по значению — число в строке (роль ширины `number`), а не во всю колонку. */
  narrow?: boolean
  /** data-slot корня: text-input, select, number-input … */
  slot: string
  className?: string
  children: ReactNode
}

/**
 * Каркас поля: подпись, поле, сообщение под ним. `inline` — подпись слева, справа колонкой поле, единица и под ними
 * сообщение: ошибка стоит у поля, а не под подписью. Ряд — с `lg`: рядом с колонкой разделов продукта на `md` полю не
 * хватает места. Число в строке — узкое (`narrow`, роль ширины `number`): ширина по длине значения.
 */
export function FieldShell({ ids, label, hideLabel, disabled, readOnly, slot, className, inline, unit, narrow, children, ...messages }: FieldShellProps) {
  const state = fieldState({ invalid: messages.invalid, warn: messages.warn, disabled, readOnly })
  const muted = disabled ? 'text-fg-disabled' : 'text-fg-muted'
  const head =
    label === undefined || label === null || label === false ? null : (
      <label id={ids.labelId} htmlFor={ids.id} className={cx('flex min-w-0 items-center gap-tight', inline ? 'text-body' : 'text-caption', inline && !disabled ? 'text-fg' : muted, hideLabel && 'sr-only')}>
        {label}
      </label>
    )
  const note = <FieldNote ids={ids} state={state} disabled={disabled} {...messages} />
  const data = { 'data-slot': slot, 'data-invalid': state.invalid ? 'true' : undefined, 'data-warn': state.warn ? 'true' : undefined }
  if (inline)
    return (
      <div {...data} data-inline="true" className={cx('flex min-w-0 flex-col gap-tight lg:flex-row lg:items-start lg:gap-blocks', className)}>
        <div className="min-w-0 lg:flex lg:min-h-control lg:flex-1 lg:items-center">{head}</div>
        <div className="flex min-w-0 flex-col gap-tight lg:w-narrow">
          <div className="flex min-w-0 items-center gap-items">
            <div className={narrow ? 'w-number shrink-0' : 'min-w-0 flex-1'}>{children}</div>
            {unit && <span className={cx('shrink-0 text-body', muted)}>{unit}</span>}
          </div>
          {note}
        </div>
      </div>
    )
  return (
    <div {...data} className={cx('flex min-w-0 flex-col gap-tight', className)}>
      {head}
      {children}
      {note}
    </div>
  )
}

/* ——— Однострочное поле ——— */

type InputAttrs = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'id' | 'children' | 'className' | 'defaultValue' | 'value'>

export interface TextInputProps extends FieldMessages, FieldRowProps, InputAttrs {
  /** Обязателен, как у Carbon: по нему подпись, подсказка и ошибка связаны с полем. */
  id: string
  /** Подпись поля — всегда есть (читалка); `hideLabel` прячет её с экрана, когда смысл виден рядом. */
  labelText: ReactNode
  hideLabel?: boolean
  /** sm 32 · md 40 · lg 48; без него — 48 на телефоне, 40 на ноутбуке. */
  size?: Size
  /** text, email, url, tel, date, time, month, datetime-local … (у даты и времени — выбор системы). */
  type?: string
  value?: string | number
  defaultValue?: string | number
  className?: string
}

/** Строка ввода (Carbon: TextInput). */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { id, labelText, hideLabel, helperText, invalid, invalidText, warn, warnText, size, className, disabled, readOnly, type = 'text', inline, unit, ...rest },
  ref,
) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  return (
    <FieldShell slot="text-input" ids={ids} label={labelText} hideLabel={hideLabel} disabled={disabled} readOnly={readOnly} className={className} inline={inline} unit={unit} {...messages}>
      <input
        ref={ref}
        id={ids.id}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        {...fieldAria(ids, messages, state)}
        {...rest}
        className={cx(fieldBox({ invalid: state.invalid, disabled, readOnly, size }), 'px-compact')}
      />
    </FieldShell>
  )
})

/* ——— Пароль ——— */

export interface PasswordInputProps extends Omit<TextInputProps, 'type'> {
  /** С чего начать: скрыт (`password`) или виден (`text`). */
  type?: 'password' | 'text'
  /** Подпись кнопки, когда пароль скрыт. */
  showPasswordLabel?: string
  /** Подпись кнопки, когда пароль виден. */
  hidePasswordLabel?: string
  onTogglePasswordVisibility?: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Пароль (Carbon: PasswordInput): ввод скрыт, кнопка-значок в поле показывает и прячет его. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { id, labelText, hideLabel, helperText, invalid, invalidText, warn, warnText, size, className, disabled, readOnly, type = 'password', inline, unit, showPasswordLabel = 'Показать пароль', hidePasswordLabel = 'Скрыть пароль', onTogglePasswordVisibility, ...rest },
  ref,
) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const [shown, setShown] = useState(type === 'text')
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  const Eye = shown ? ViewOff : View
  return (
    <FieldShell slot="password-input" ids={ids} label={labelText} hideLabel={hideLabel} disabled={disabled} readOnly={readOnly} className={className} inline={inline} unit={unit} {...messages}>
      <div className={cx(fieldBox({ invalid: state.invalid, disabled, readOnly, within: true, size }), 'flex items-stretch overflow-hidden')}>
        <input
          ref={ref}
          id={ids.id}
          type={shown ? 'text' : 'password'}
          disabled={disabled}
          readOnly={readOnly}
          {...fieldAria(ids, messages, state)}
          {...rest}
          className="min-w-0 flex-1 border-0 bg-transparent px-compact text-body text-inherit outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
        />
        <button
          type="button"
          aria-controls={ids.id}
          aria-label={shown ? hidePasswordLabel : showPasswordLabel}
          disabled={disabled}
          onClick={(e) => {
            setShown((v) => !v)
            onTogglePasswordVisibility?.(e)
          }}
          className={cx('inline-flex shrink-0 cursor-pointer items-center justify-center text-fg hover:bg-hover', fieldSquare(size), FOCUS, 'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')}
        >
          <Eye />
        </button>
      </div>
    </FieldShell>
  )
})

/* ——— Многострочное поле ——— */

export interface TextAreaProps extends FieldMessages, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'className' | 'defaultValue' | 'value'> {
  /** У Carbon необязателен: без него — свой. */
  id?: string
  labelText: ReactNode
  hideLabel?: boolean
  value?: string | number
  defaultValue?: string | number
  className?: string
}

/** Многострочный ввод (Carbon: TextArea): та же рамка, по умолчанию 4 строки, высота тянется. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { id, labelText, hideLabel, helperText, invalid, invalidText, warn, warnText, className, disabled, readOnly, rows = 4, ...rest },
  ref,
) {
  const ids = useFieldIds(id)
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  return (
    <FieldShell slot="text-area" ids={ids} label={labelText} hideLabel={hideLabel} disabled={disabled} readOnly={readOnly} className={className} {...messages}>
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        {...fieldAria(ids, messages, state)}
        {...rest}
        className={cx(fieldBox({ invalid: state.invalid, disabled, readOnly }), 'block resize-y px-compact py-items')}
      />
    </FieldShell>
  )
})
