/**
 * Уведомление в потоке у места беды (Carbon: InlineNotification, ActionableNotification): плитка с меткой цвета вида и
 * знаком его формы — цвет никогда не один. `kind` — error · warning · info · success (по умолчанию `error`, как у
 * Carbon). «Закрыть» есть по умолчанию (`hideCloseButton` прячет); `onClose` вернул `false` — уведомление остаётся.
 * Где стоит — решает место в разметке (паттерн «Уведомления»): беда системы — вверху страницы, беда списка — над ним.
 * - `InlineNotification` — только слова, без действий: `role="status"` по умолчанию.
 * - `ActionableNotification` — с действием у причины (`actionButtonLabel`, `onActionButtonClick`): `inline` — в потоке
 *   (тихая кнопка), без него — всплывшая плашка (тень, кнопка с рамкой). `role="alertdialog"` по умолчанию: фокус — на
 *   действие (`hasFocus`), Tab ходит по кругу внутри, Esc закрывает (`closeOnEscape`).
 * «Готово» — не сюда, а всплывашкой (`useToast`).
 */
import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { KIND_MARK, MARK, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Close } from '../lib/icons.gen'
import { NOTIFICATION_TONE, TONE, type NotificationKind } from '../lib/vocab'
import { Button, IconButton } from './Button'
import { Icon } from './Icon'

/** Слово знака для читалки (Carbon: statusIconDescription). */
const KIND_WORD: Record<NotificationKind, string> = { error: 'Ошибка', warning: 'Предупреждение', info: 'Сведения', success: 'Готово' }

/** Обработчик закрытия (Carbon): вернул `false` — уведомление не закрывается. */
export type NotificationCloseHandler = (event?: MouseEvent | KeyboardEvent) => boolean | void

/** Общее у всех уведомлений (Carbon: InlineNotificationProps, ActionableNotificationProps, ToastNotificationProps). */
export interface NotificationCommonProps {
  /** Вид: error · warning · info · success; по умолчанию `error`. */
  kind?: NotificationKind
  title?: string
  children?: ReactNode
  /** Без кнопки «закрыть». */
  hideCloseButton?: boolean
  onClose?: NotificationCloseHandler
  onCloseButtonClick?(event: MouseEvent): void
  /** Слово знака для читалки; по умолчанию — по виду. */
  statusIconDescription?: string
  /** Имя кнопки «закрыть» для читалки. */
  'aria-label'?: string
  className?: string
}

/** Знак вида: тон словаря, своя форма. */
export function NotificationIcon({ kind, description }: { kind: NotificationKind; description?: string }) {
  return <Icon tone={NOTIFICATION_TONE[kind]} label={description ?? KIND_WORD[kind]} className="mt-tight shrink-0" />
}

/** Каркас уведомления: метка, знак, слова и кнопки — у всех трёх видов один. */
export function notificationFrame(kind: NotificationKind) {
  return { 'data-kind': kind, 'data-mark': TONE[NOTIFICATION_TONE[kind]].key, className: cx('flex min-w-0 items-start gap-items p-blocks text-body', SURFACE, MARK, KIND_MARK[kind]) }
}

/** Закрыть: открыто ли и обработчик кнопки (как у Carbon: onCloseButtonClick, затем onClose). */
function useClose(onClose?: NotificationCloseHandler, onCloseButtonClick?: (e: MouseEvent) => void) {
  const [open, setOpen] = useState(true)
  const close = (e: MouseEvent | KeyboardEvent) => {
    onCloseButtonClick?.(e as MouseEvent)
    if (!onClose || onClose(e) !== false) setOpen(false)
  }
  return { open, close }
}

function CloseButton({ label, onClick }: { label?: string; onClick: (e: MouseEvent) => void }) {
  return (
    <IconButton kind="ghost" size="sm" label={label ?? 'Закрыть уведомление'} onClick={onClick} className="-my-tight">
      <Close />
    </IconButton>
  )
}

export interface InlineNotificationProps extends NotificationCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role' | 'children' | 'className' | 'aria-label'> {
  subtitle?: string
  role?: 'alert' | 'log' | 'status'
}

/** Уведомление в потоке без действий (Carbon: InlineNotification). */
export function InlineNotification({
  kind = 'error',
  title,
  subtitle,
  children,
  role = 'status',
  hideCloseButton = false,
  onClose,
  onCloseButtonClick,
  statusIconDescription,
  'aria-label': closeLabel,
  className,
  ...rest
}: InlineNotificationProps) {
  const { open, close } = useClose(onClose, onCloseButtonClick)
  if (!open) return null
  const frame = notificationFrame(kind)
  return (
    <div {...rest} role={role} data-slot="inline-notification" {...frame} className={cx(frame.className, className)}>
      <NotificationIcon kind={kind} description={statusIconDescription} />
      <div className="flex min-w-0 flex-1 flex-col gap-tight">
        {title && (
          <div data-part="title" className="text-heading text-fg">
            {title}
          </div>
        )}
        {subtitle && <div className="text-fg-muted">{subtitle}</div>}
        {children}
      </div>
      {!hideCloseButton && <CloseButton label={closeLabel} onClick={close} />}
    </div>
  )
}

export interface ActionableNotificationProps extends NotificationCommonProps, Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role' | 'children' | 'className' | 'aria-label'> {
  subtitle?: ReactNode
  /** Мелкая строка под подписью (время, источник). */
  caption?: string
  /** Слово действия у причины: «Повторить», «Подключить». */
  actionButtonLabel?: string
  onActionButtonClick?(event: MouseEvent<HTMLButtonElement>): void
  /** В потоке (тихая кнопка); без него — всплывшая плашка. */
  inline?: boolean
  role?: string
  /** Фокус на действие при показе (только у `role="alertdialog"`). */
  hasFocus?: boolean
  closeOnEscape?: boolean
}

const TABBABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Уведомление с действием у причины (Carbon: ActionableNotification). */
export function ActionableNotification({
  kind = 'error',
  title,
  subtitle,
  caption,
  children,
  actionButtonLabel,
  onActionButtonClick,
  inline = false,
  role = 'alertdialog',
  hasFocus = true,
  closeOnEscape = true,
  hideCloseButton = false,
  onClose,
  onCloseButtonClick,
  statusIconDescription,
  'aria-label': closeLabel,
  className,
  onKeyDown,
  ...rest
}: ActionableNotificationProps) {
  const { open, close } = useClose(onClose, onCloseButtonClick)
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const action = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const dialog = role === 'alertdialog'
  useEffect(() => {
    if (hasFocus && dialog) action.current?.focus()
  }, [hasFocus, dialog])
  if (!open) return null
  const frame = notificationFrame(kind)
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Escape' && closeOnEscape) close(e)
    if (e.key !== 'Tab' || !dialog || !box.current) return
    const all = [...box.current.querySelectorAll<HTMLElement>(TABBABLE)]
    const first = all[0]
    const last = all[all.length - 1]
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last?.focus())
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first?.focus())
  }
  return (
    <div
      {...rest}
      ref={box}
      role={role}
      aria-labelledby={title ? `${id}-t` : `${id}-s`}
      data-slot="actionable-notification"
      data-inline={inline || undefined}
      {...frame}
      onKeyDown={keys}
      className={cx(frame.className, 'flex-wrap', !inline && 'shadow-raised', className)}
    >
      <NotificationIcon kind={kind} description={statusIconDescription} />
      <div className="flex min-w-0 flex-1 flex-col gap-tight">
        {title && (
          <div id={`${id}-t`} data-part="title" className="text-heading text-fg">
            {title}
          </div>
        )}
        {subtitle && (
          <div id={`${id}-s`} className="text-fg-muted">
            {subtitle}
          </div>
        )}
        {caption && <div className="text-caption text-fg-muted">{caption}</div>}
        {children}
        {actionButtonLabel && (
          <div className="pt-tight">
            <Button ref={action} kind={inline ? 'ghost' : 'tertiary'} size="sm" onClick={onActionButtonClick}>
              {actionButtonLabel}
            </Button>
          </div>
        )}
      </div>
      {!hideCloseButton && <CloseButton label={closeLabel} onClick={close} />}
    </div>
  )
}
