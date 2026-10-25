/**
 * Поле ответа с «Отправить» (сообщения, комментарии, разговор с агентом).
 * - Клавиши (`send`): `enter` — Enter отправляет, Shift+Enter — новая строка; `ctrl-enter` — Enter — новая строка,
 *   Ctrl/⌘+Enter отправляет; `button` — только кнопкой (отправка необратима: ответ уходит адресату). Набор через IME не трогаем.
 * - Отправка идёт — на месте «Отправить» ход в строке (`InlineLoading`), поле только для чтения, второй раз не уходит. Неудача не теряет текст:
 *   `onSend` вернул отклонённое обещание — текст остаётся, ошибку показывает `invalid` + `invalidText` (как у полей Carbon).
 * - «Отправить» — главная `Button` в `ButtonSet` (П5), последней; рядом — тихие (`tools`). Уже есть главная на
 *   поверхности — `buttonKind="secondary"`. Под полем — `helperText` (по умолчанию — подсказка о клавишах, на ноутбуке);
 *   `disabled` — почему нельзя, словами в `helperText`.
 * Пары в Carbon нет; имена свойств поля — как у TextArea (`labelText`, `invalid`, `helperText`).
 * - Разговор с агентом: `stop` — «Стоп», пока агент работает; `layout="row"` — кнопки в ряд, «Отправить» справа.
 */
import { forwardRef, useId, useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { StopFilledAlt } from '../lib/icons.gen'
import { Button, ButtonSet } from './Button'
import { Icon } from './Icon'
import { InlineLoading } from './InlineLoading'
import { fieldBox } from './TextInput'

export interface ReplyBoxProps {
  /** Подпись поля для читалки: «Ответ покупателю». */
  labelText: string
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
  /** Нельзя писать; почему — словами в `helperText`. */
  disabled?: boolean
  /** Ошибка отправки — под полем, знак и слово `invalidText`. */
  invalid?: boolean
  invalidText?: ReactNode
  /** Что сказать при попытке отправить пустое. Без него пустое молча не уходит. */
  emptyMessage?: ReactNode
  /** Можно отправить без текста (приложен файл). */
  allowEmpty?: boolean
  /** Тихие кнопки рядом с «Отправить». */
  tools?: ReactNode
  /** Вложение над кнопками. */
  attachment?: ReactNode
  /** Строка под полем; по умолчанию — подсказка о клавишах по `send` (на ноутбуке); `null` — без строки. */
  helperText?: ReactNode
  /** Вид «Отправить»: главная (по умолчанию) или второстепенная, если главная на поверхности уже есть. */
  buttonKind?: 'primary' | 'secondary'
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
  { labelText, value, onChange, onSend, placeholder, sendLabel = 'Отправить', send: mode = 'enter', sending: sendingProp, disabled = false, invalid = false, invalidText, emptyMessage, allowEmpty = false, tools, attachment, helperText, buttonKind = 'primary', rows = 3, layout = 'stack', stop, className },
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
  const off = disabled

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
      // текст остаётся в поле; ошибку показывает продукт через `invalid` + `invalidText`
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

  const shownError = invalid ? invalidText : emptyShown ? emptyMessage : null
  const keysHint = helperText === undefined
  const hintText = keysHint ? (off ? null : HINT[mode]) : helperText
  const describedBy = [shownError ? `${id}-err` : null, hintText ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  const sendButton = sending ? (
    <InlineLoading description="Отправляем…" data-part="send" className={cx(layout === 'row' && 'ml-auto')} />
  ) : (
    <Button kind={buttonKind} onClick={() => void doSend()} disabled={off} data-part="send" className={cx(layout === 'row' && 'ml-auto')}>
      {sendLabel}
    </Button>
  )

  return (
    <div data-slot="reply-box" data-state={sending ? 'загрузка' : shownError ? 'ошибка' : undefined} className={cx('flex min-w-0 flex-col gap-items', className)}>
      <label htmlFor={`${id}-field`} className="sr-only">
        {labelText}
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
      {hintText && (
        <p id={`${id}-hint`} className={cx('m-0 text-caption text-fg-muted', keysHint && 'max-md:hidden')}>
          {hintText}
        </p>
      )}
      {attachment && <div className="flex flex-wrap gap-items">{attachment}</div>}
      <ButtonSet aria-label={`${labelText}: действия`}>
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
