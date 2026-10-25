/**
 * Поле ответа с «Отправить» (сообщения, комментарии, разговор с агентом).
 * - Клавиши (`send`): `enter` — Enter отправляет, Shift+Enter — новая строка; `ctrl-enter` — Enter — новая строка,
 *   Ctrl/⌘+Enter отправляет; `button` — только кнопкой (отправка необратима: ответ уходит адресату). Набор через IME не трогаем.
 * - Отправка идёт — на месте «Отправить» ход в строке (`InlineLoading`), поле только для чтения, второй раз не уходит. Неудача не теряет текст:
 *   `onSend` вернул отклонённое обещание — текст остаётся, ошибку показывает `error`.
 * - «Отправить» — главная `Button` в `ButtonSet` (П5), последней; рядом — тихие (`tools`). Уже есть главная на
 *   поверхности — `emphasis="secondary"`. `disabled` — словами, почему нельзя.
 * - Разговор с агентом: `stop` — «Стоп», пока агент работает; `layout="row"` — кнопки в ряд, «Отправить» справа.
 */
import { forwardRef, useId, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { StopFilledAlt } from '../lib/icons.gen'
import { Button, ButtonSet } from './Button'
import { Icon } from './Icon'
import { InlineLoading } from './InlineLoading'
import { fieldBox } from './TextField'

export interface ReplyBoxProps {
  /** Подпись поля для читалки: «Ответ покупателю». */
  label: string
  value?: string
  onChange?: (value: string) => void
  /** Отправить. Вернул обещание — пока оно идёт, кнопка занята; отклонено — текст остаётся. */
  onSend: (text: string) => void | Promise<unknown>
  placeholder?: string
  sendLabel?: ReactNode
  /** Как отправлять с клавиатуры (по умолчанию `enter`). */
  send?: 'enter' | 'ctrl-enter' | 'button'
  /** Отправка идёт (если продукт ведёт её сам). */
  sending?: boolean
  /** Нельзя писать: `true` или слова, почему (видны под полем). */
  disabled?: ReactNode
  /** Ошибка отправки — под полем, знак и слово. */
  error?: ReactNode
  /** Что сказать при попытке отправить пустое. Без него пустое молча не уходит. */
  emptyMessage?: ReactNode
  /** Можно отправить без текста (приложен файл). */
  allowEmpty?: boolean
  /** Тихие кнопки рядом с «Отправить». */
  tools?: ReactNode
  /** Вложение над кнопками. */
  attachment?: ReactNode
  /** Подсказка о клавишах под полем; по умолчанию — по `send`; false — без подсказки. */
  hint?: ReactNode | false
  emphasis?: 'primary' | 'secondary'
  rows?: number
  layout?: 'stack' | 'row'
  /** «Стоп» — пока агент работает. */
  stop?: { onStop: () => void; label?: ReactNode }
  className?: string
}

export interface ReplyBoxHandle {
  focus: () => void
}

const HINT = { enter: 'Enter — отправить, Shift+Enter — новая строка', 'ctrl-enter': 'Ctrl+Enter — отправить', button: null } as const

export const ReplyBox = forwardRef<ReplyBoxHandle, ReplyBoxProps>(function ReplyBox(
  { label, value, onChange, onSend, placeholder, sendLabel = 'Отправить', send: mode = 'enter', sending: sendingProp, disabled, error, emptyMessage, allowEmpty = false, tools, attachment, hint, emphasis = 'primary', rows = 3, layout = 'stack', stop, className },
  ref,
) {
  const id = useId()
  const area = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), [])
  const [own, setOwn] = useState('')
  const [busy, setBusy] = useState(false)
  const [emptyShown, setEmptyShown] = useState(false)
  const busyRef = useRef(false)
  const controlled = value !== undefined
  const text = controlled ? value : own
  const sending = Boolean(sendingProp) || busy
  const off = Boolean(disabled)
  const reason = typeof disabled === 'boolean' ? null : disabled

  const set = (v: string) => {
    if (!controlled) setOwn(v)
    if (emptyShown && v.trim()) setEmptyShown(false)
    onChange?.(v)
  }

  const doSend = async () => {
    if (off || sending || busyRef.current) return
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
    if ((mode === 'ctrl-enter' && mod) || (mode === 'enter' && (mod || (!e.shiftKey && !e.altKey)))) {
      e.preventDefault()
      void doSend()
    }
  }

  const shownError = error ?? (emptyShown ? emptyMessage : null)
  const hintText = hint === false ? null : (hint ?? HINT[mode])
  const describedBy = [shownError ? `${id}-err` : null, reason ? `${id}-why` : null, hintText ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const sendButton = sending ? (
    <InlineLoading description="Отправляем…" data-part="send" className={cx(layout === 'row' && 'ml-auto')} />
  ) : (
    <Button kind={emphasis === 'primary' ? 'primary' : 'secondary'} onClick={() => void doSend()} disabled={off} data-part="send" className={cx(layout === 'row' && 'ml-auto')}>
      {sendLabel}
    </Button>
  )

  return (
    <div data-slot="reply-box" data-state={sending ? 'загрузка' : shownError ? 'ошибка' : undefined} className={cx('flex min-w-0 flex-col gap-items', className)}>
      <label htmlFor={`${id}-field`} className="sr-only">
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
        disabled={off}
        readOnly={sending}
        aria-busy={sending || undefined}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={describedBy}
        className={cx(fieldBox({ invalid: Boolean(shownError), disabled: off }), 'block resize-y px-compact py-items')}
      />
      {shownError && (
        <p id={`${id}-err`} role="alert" className="m-0 flex items-start gap-tight text-caption text-danger-fg">
          <Icon tone="опасно" />
          <span>{shownError}</span>
        </p>
      )}
      {reason && (
        <p id={`${id}-why`} className="m-0 text-caption text-fg-muted">
          {reason}
        </p>
      )}
      {hintText && !off && (
        <p id={`${id}-hint`} className="m-0 text-caption text-fg-muted max-md:hidden">
          {hintText}
        </p>
      )}
      {attachment && <div className="flex flex-wrap gap-items">{attachment}</div>}
      <ButtonSet aria-label={`${label}: действия`}>
        {stop && (
          <Button kind="secondary" renderIcon={StopFilledAlt} onClick={stop.onStop} data-part="stop">
            {stop.label ?? 'Стоп'}
          </Button>
        )}
        {tools}
        {sendButton}
      </ButtonSet>
    </div>
  )
})
