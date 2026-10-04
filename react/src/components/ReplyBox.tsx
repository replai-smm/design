/**
 * Поле ответа с «Отправить» (DF: «Сообщения», «Комментарии», «✨ ИИ», «Чаты»; опись DF §6.2 ReplyComposer).
 * - Клавиши: `enterToSend` — Enter отправляет, Shift+Enter — новая строка (ИИ, Чаты). Без него Enter — новая строка
 *   (Сообщения: «Enter не отправляет»). Ctrl/⌘+Enter отправляет всегда. Набор через IME Enter не перехватывает.
 * - Отправка идёт — кнопка «занята», поле только для чтения, второй раз не уходит (двойной клик и Enter).
 * - Неудача не теряет текст: `onSend` вернул отклонённое обещание — текст остаётся, ошибка видна под полем (`error`).
 *   Удача — поле очищается (если продукт не держит значение сам).
 * - «Отправить» — главная кнопка области (П5) через `ActionArea`; рядом — тихие (`tools`: «✨ Черновик ИИ»,
 *   «Ответ не нужен», «⚡ Шаблоны»). Если на поверхности уже есть главная (несколько полей на экране) —
 *   `emphasis="secondary"`.
 * Состояния: обычное, отправляется (загрузка), ошибка, выключено с причиной.
 */
import { forwardRef, useId, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ActionArea, Button } from './Button'
import { ToneIcon } from './StatusBadge'

export interface ReplyBoxProps {
  /** Подпись поля для читалки и над полем: «Ответ клиенту». */
  label: string
  /** Показать подпись над полем (по умолчанию только для читалки). */
  showLabel?: boolean
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Отправить. Вернул обещание — пока оно идёт, кнопка занята; отклонено — текст остаётся. */
  onSend: (text: string) => void | Promise<unknown>
  placeholder?: string
  sendLabel?: ReactNode
  /** Enter отправляет, Shift+Enter — новая строка. Иначе Enter — новая строка, отправка — Ctrl/⌘+Enter. */
  enterToSend?: boolean
  /** Отправка идёт (если продукт ведёт её сам). */
  sending?: boolean
  disabled?: boolean
  /** Почему выключено — видно под полем. */
  disabledReason?: ReactNode
  /** Ошибка отправки или проверки — под полем, знак и слово. */
  error?: ReactNode
  /** Что сказать при попытке отправить пустое: «Напишите текст сообщения». Без него пустое молча не уходит. */
  emptyMessage?: ReactNode
  /** Можно отправить без текста (приложен файл). */
  allowEmpty?: boolean
  /** Тихие кнопки рядом с «Отправить». */
  tools?: ReactNode
  /** Чип вложения над кнопками: «📎 отчёт.pdf ✕». */
  attachment?: ReactNode
  /** Подсказка о клавишах под полем. По умолчанию — по `enterToSend`; false — без подсказки. */
  hint?: ReactNode | false
  emphasis?: 'primary' | 'secondary'
  rows?: number
  className?: string
}

export interface ReplyBoxHandle {
  focus: () => void
}

export const ReplyBox = forwardRef<ReplyBoxHandle, ReplyBoxProps>(function ReplyBox(
  {
    label,
    showLabel = false,
    value,
    defaultValue = '',
    onChange,
    onSend,
    placeholder,
    sendLabel = 'Отправить',
    enterToSend = true,
    sending: sendingProp,
    disabled,
    disabledReason,
    error,
    emptyMessage,
    allowEmpty = false,
    tools,
    attachment,
    hint,
    emphasis = 'primary',
    rows = 3,
    className,
  },
  ref,
) {
  const id = useId()
  const area = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), [])
  const [own, setOwn] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const [emptyShown, setEmptyShown] = useState(false)
  const busyRef = useRef(false)
  const controlled = value !== undefined
  const text = controlled ? value : own
  const sending = Boolean(sendingProp) || busy

  const set = (v: string) => {
    if (!controlled) setOwn(v)
    if (emptyShown && v.trim()) setEmptyShown(false)
    onChange?.(v)
  }

  const send = async () => {
    if (disabled || sending || busyRef.current) return
    if (!text.trim() && !allowEmpty) {
      if (emptyMessage) setEmptyShown(true)
      return
    }
    const r = onSend(text)
    if (!r || typeof (r as Promise<unknown>).then !== 'function') {
      if (!controlled) setOwn('')
      return
    }
    busyRef.current = true
    setBusy(true)
    try {
      await r
      if (!controlled) setOwn('')
    } catch {
      // текст остаётся в поле; ошибку показывает продукт через `error`
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    const mod = e.ctrlKey || e.metaKey
    if (mod || (enterToSend && !e.shiftKey && !e.altKey)) {
      e.preventDefault()
      void send()
    }
  }

  const shownError = error ?? (emptyShown ? emptyMessage : null)
  const hintText = hint === false ? null : (hint ?? (enterToSend ? 'Enter — отправить, Shift+Enter — новая строка' : 'Ctrl+Enter — отправить'))
  const describedBy = [shownError ? `${id}-err` : null, disabled && disabledReason ? `${id}-why` : null, hintText ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const sendProps = { onClick: () => void send(), loading: sending, disabled: disabled, 'data-slot': 'reply-send' }

  return (
    <div data-slot="reply-box" data-state={sending ? 'загрузка' : shownError ? 'ошибка' : undefined} className={cx('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={`${id}-field`} className={showLabel ? 'text-label-01 text-text-secondary' : 'sr-only'}>
        {label}
      </label>
      <textarea
        ref={area}
        id={`${id}-field`}
        rows={rows}
        value={text}
        placeholder={placeholder}
        onChange={(e) => set(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        readOnly={sending}
        aria-busy={sending || undefined}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'block w-full min-w-0 resize-y border-0 border-b bg-field-01 px-4 py-3 text-body-01 text-text-primary placeholder:text-text-placeholder',
          'focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
          'disabled:cursor-not-allowed disabled:border-transparent disabled:text-text-disabled',
          shownError ? 'border-support-error outline-2 -outline-offset-2 outline-support-error' : 'border-border-strong-01',
        )}
      />
      {shownError && (
        <p id={`${id}-err`} role="alert" className="m-0 flex items-start gap-2 text-helper-text-01 text-text-error">
          <ToneIcon tone="error" className="mt-px size-4 text-status-error" />
          <span>{shownError}</span>
        </p>
      )}
      {disabled && disabledReason && (
        <p id={`${id}-why`} className="m-0 text-helper-text-01 text-text-helper">
          {disabledReason}
        </p>
      )}
      {hintText && !disabled && (
        <p id={`${id}-hint`} className="m-0 text-helper-text-01 text-text-helper max-md:hidden">
          {hintText}
        </p>
      )}
      {attachment && <div className="flex flex-wrap gap-2">{attachment}</div>}
      {emphasis === 'primary' ? (
        <ActionArea primary={{ label: sendLabel, ...sendProps }} label={`${label}: действия`}>
          {tools}
        </ActionArea>
      ) : (
        <div role="group" aria-label={`${label}: действия`} className="flex flex-col-reverse gap-2 md:flex-row md:flex-wrap md:items-center">
          <Button variant="secondary" className="max-md:min-h-12 max-md:w-full" {...sendProps}>
            {sendLabel}
          </Button>
          {tools}
        </div>
      )}
    </div>
  )
})
