/**
 * Всплывашки «готово» — очередь (своя, у Carbon пары нет); одна всплывашка — поля Carbon ToastNotification: `kind`
 * (по умолчанию `error`, как у Carbon), `title`, `subtitle`, `caption`, `timeout`, `hideCloseButton`, `role`, `onClose`.
 * Плитка с меткой вида всплывает над экраном внизу справа (на телефоне — во всю ширину), уходит вбок по свайпу.
 * Без `timeout` гаснет сама за 5 с; `timeout={0}` — висит до «закрыть». Беда — не сюда, а уведомлением в потоке у её
 * места. `useToast().show({ kind: 'success', title })` — из любого места внутри `<Toaster>`.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Toast as RToast } from 'radix-ui'
import { cx } from '../lib/cx'
import { Close } from '../lib/icons.gen'
import { IconButton } from './Button'
import { NotificationIcon, notificationFrame, type NotificationCommonProps } from './InlineNotification'

/** Поля одной всплывашки (Carbon: ToastNotificationProps). */
export interface ToastNotificationProps extends NotificationCommonProps {
  subtitle?: string
  /** Мелкая строка под подписью: время, источник. */
  caption?: string
  /** Через сколько мс погаснет; 0 — висит до «закрыть». По умолчанию 5000. */
  timeout?: number
  /** Как читалка объявит: `alert` — сразу, перебивая; `status` и `log` — в паузе (Radix: type foreground · background). */
  role?: 'alert' | 'log' | 'status'
}

interface ToastApi {
  show: (t: ToastNotificationProps) => void
}
const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('ДС-React: useToast() вне <Toaster> — оберните приложение в <Toaster>')
  return api
}

let nextId = 1

export interface ToasterProps {
  children?: ReactNode
  /** Всплывашки, открытые сразу (истории). */
  initial?: ToastNotificationProps[]
}

export function Toaster({ children, initial = [] }: ToasterProps) {
  const [items, setItems] = useState(() => initial.map((t) => ({ ...t, id: nextId++ })))
  const show = useCallback<ToastApi['show']>((t) => setItems((xs) => [...xs, { ...t, id: nextId++ }]), [])
  const api = useMemo(() => ({ show }), [show])
  const drop = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id))
  return (
    <ToastContext.Provider value={api}>
      <RToast.Provider swipeDirection="right" label="Уведомление">
        {children}
        {items.map(({ id, kind = 'error', title, subtitle, caption, children: body, timeout = 5000, hideCloseButton = false, role = 'status', onClose, onCloseButtonClick, statusIconDescription, 'aria-label': closeLabel, className }) => {
          const frame = notificationFrame(kind)
          return (
            <RToast.Root
              key={id}
              open
              type={role === 'alert' ? 'foreground' : 'background'}
              duration={timeout > 0 ? timeout : Infinity}
              data-slot="toast"
              {...frame}
              onOpenChange={(open) => {
                if (!open && onClose?.() !== false) drop(id)
              }}
              className={cx('ds-toast shadow-raised', frame.className, className)}
            >
              <NotificationIcon kind={kind} description={statusIconDescription} />
              <div className="flex min-w-0 flex-1 flex-col gap-tight">
                {title && (
                  <RToast.Title data-part="title" className="text-heading text-fg">
                    {title}
                  </RToast.Title>
                )}
                {subtitle && <RToast.Description className="text-fg-muted">{subtitle}</RToast.Description>}
                {caption && <div className="text-caption text-fg-muted">{caption}</div>}
                {body}
              </div>
              {!hideCloseButton && (
                <IconButton
                  kind="ghost"
                  size="sm"
                  label={closeLabel ?? 'Закрыть уведомление'}
                  className="-my-tight"
                  onClick={(e) => {
                    onCloseButtonClick?.(e)
                    if (onClose?.(e) !== false) drop(id)
                  }}
                >
                  <Close />
                </IconButton>
              )}
            </RToast.Root>
          )
        })}
        <RToast.Viewport className="ds-toasts fixed inset-x-0 z-50 m-0 flex list-none flex-col gap-items p-blocks md:right-0 md:left-auto md:w-popup" />
      </RToast.Provider>
    </ToastContext.Provider>
  )
}
