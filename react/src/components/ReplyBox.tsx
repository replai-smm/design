/**
 * Поле ответа с «Отправить» (DF: «Сообщения», «Комментарии», «ИИ», «Чаты»; чат orbit).
 * - Клавиши (`send`): `enter` — Enter отправляет, Shift+Enter — новая строка; `ctrl-enter` — Enter — новая строка,
 *   Ctrl/⌘+Enter отправляет; `button` — только кнопкой (отправка необратима: ответ в ВК). Набор через IME не трогаем.
 * - Отправка идёт — кнопка «занята», поле только для чтения, второй раз не уходит. Неудача не теряет текст:
 *   `onSend` вернул отклонённое обещание — текст остаётся, ошибку показывает `error`.
 * - «Отправить» — главная области (П5) через `ActionArea`; рядом — тихие (`tools`). Уже есть главная на поверхности —
 *   `emphasis="secondary"`. `disabled` — словами, почему нельзя.
 * - Чат агента: `stop` — «Стоп», пока агент работает; `menu` — меню над полем (`CommandMenu`), клавиши поля сначала
 *   получает `onKeyDown` продукта (взял — `preventDefault`), `activeDescendant` — активная строка меню для читалки;
 *   `layout="row"` — кнопки в ряд, «Отправить» справа.
 */
import { forwardRef, useId, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ActionArea, Button } from './Button'
import { Icon } from './Icon'
import { fieldBox } from './TextField'

export interface ReplyBoxProps {
  /** Подпись поля для читалки: «Ответ клиенту». */
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
  /** Меню над полем: команды «/». */
  menu?: ReactNode
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  /** id активной строки меню (`aria-activedescendant`). */
  activeDescendant?: string
  className?: string
}

export interface ReplyBoxHandle {
  focus: () => void
}

const HINT = { enter: 'Enter — отправить, Shift+Enter — новая строка', 'ctrl-enter': 'Ctrl+Enter — отправить', button: null } as const

export const ReplyBox = forwardRef<ReplyBoxHandle, ReplyBoxProps>(function ReplyBox(
  { label, value, onChange, onSend, placeholder, sendLabel = 'Отправить', send: mode = 'enter', sending: sendingProp, disabled, error, emptyMessage, allowEmpty = false, tools, attachment, hint, emphasis = 'primary', rows = 3, layout = 'stack', stop, menu, onKeyDown: onKeyDownProp, activeDescendant, className },
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
    onKeyDownProp?.(e)
    if (e.defaultPrevented || e.key !== 'Enter' || e.nativeEvent.isComposing) return
    const mod = e.ctrlKey || e.metaKey
    if ((mode === 'ctrl-enter' && mod) || (mode === 'enter' && (mod || (!e.shiftKey && !e.altKey)))) {
      e.preventDefault()
      void doSend()
    }
  }

  const shownError = error ?? (emptyShown ? emptyMessage : null)
  const hintText = hint === false ? null : (hint ?? HINT[mode])
  const describedBy = [shownError ? `${id}-err` : null, reason ? `${id}-why` : null, hintText ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const sendProps = { onClick: () => void doSend(), loading: sending, disabled: off, 'data-part': 'send' }
  const stopButton = stop && (
    <Button onClick={stop.onStop} icon="stop" data-part="stop">
      {stop.label ?? 'Стоп'}
    </Button>
  )

  return (
    <div data-slot="reply-box" data-state={sending ? 'загрузка' : shownError ? 'ошибка' : undefined} className={cx('flex min-w-0 flex-col gap-items', className)}>
      <label htmlFor={`${id}-field`} className="sr-only">
        {label}
      </label>
      {menu}
      <textarea
        ref={area}
        aria-activedescendant={activeDescendant}
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
      {emphasis === 'primary' ? (
        <ActionArea primary={{ label: sendLabel, ...sendProps }} label={`${label}: действия`} layout={layout}>
          {stopButton}
          {tools}
        </ActionArea>
      ) : (
        <div role="group" aria-label={`${label}: действия`} className="flex flex-col-reverse gap-items md:flex-row md:flex-wrap md:items-center">
          <Button className="max-md:w-full" {...sendProps}>
            {sendLabel}
          </Button>
          {stopButton}
          {tools}
        </div>
      )}
    </div>
  )
})
