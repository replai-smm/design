/**
 * Уведомление в потоке (Carbon inline notification) и всплывашка (toast). Где что — по охвату (П11):
 * беда системы — одна плашка вверху страницы (`scope="page"`); беда списка — блок над списком (`scope="list"`);
 * беда объекта — в его строке (`scope="row"`, компактно); «готово» — всплывашка (`useToast().show`).
 * Фон — слой, у края — полоса цвета тона, значок своей формы: цвет никогда не один.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Toast as RToast } from 'radix-ui'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type NotificationTone = 'error' | 'warning' | 'success' | 'info'

const STRIPE: Record<NotificationTone, string> = {
  error: 'border-l-status-error',
  warning: 'border-l-status-warning',
  success: 'border-l-status-success',
  info: 'border-l-support-info',
}
const MARK: Record<NotificationTone, string> = {
  error: 'text-status-error',
  warning: 'text-status-warning',
  success: 'text-status-success',
  info: 'text-support-info',
}
const ICON = { error: 'error', warning: 'warning', success: 'success', info: 'neutral' } as const

export interface NotificationProps {
  tone: NotificationTone
  title: ReactNode
  children?: ReactNode
  /** Действие рядом с причиной (П8): «Починить», «Повторить» — тихая кнопка. */
  action?: ReactNode
  scope?: 'page' | 'list' | 'row'
  onClose?: () => void
  className?: string
}

export function Notification({ tone, title, children, action, scope = 'list', onClose, className }: NotificationProps) {
  const row = scope === 'row'
  return (
    <div
      data-slot="notification"
      data-tone={tone}
      data-scope={scope}
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-3 border border-l-4 border-border-subtle-01 bg-layer-01 text-text-primary',
        STRIPE[tone],
        row ? 'px-3 py-2' : 'px-4 py-3',
        className,
      )}
    >
      <ToneIcon tone={ICON[tone]} className={cx('mt-0.5', MARK[tone])} />
      <div className={cx('flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1', row ? 'text-body-compact-01' : 'text-body-01')}>
        {/* min-w-0: пункт ряда с переносом иначе не уже своего содержимого — длинная строка (кнопки с обрезкой,
            ссылка) распирала уведомление и страницу вбок на 390 (DF «Постинг», черновики недели) */}
        <p className="m-0 min-w-0 text-heading-compact-01">{title}</p>
        {children && <div className="m-0 min-w-0 text-text-secondary">{children}</div>}
        {action && <div className="basis-full md:basis-auto">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="закрыть"
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center text-icon-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}

/* ——— Всплывашка ——— */

interface ToastItem {
  id: number
  title: ReactNode
  description?: ReactNode
  tone: NotificationTone
  action?: { label: string; onClick: () => void }
}
interface ToastApi {
  show: (t: Omit<ToastItem, 'id' | 'tone'> & { tone?: NotificationTone }) => void
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
  /** Сколько висит всплывашка, мс. Carbon: 5 с и дольше, если в ней действие. */
  duration?: number
  /** Всплывашки, открытые сразу (истории и образцы). */
  initial?: Array<Omit<ToastItem, 'id'>>
}

/** Поставщик всплывашек: внизу справа на ноутбуке, внизу во всю ширину на телефоне. */
export function Toaster({ children, duration = 5000, initial = [] }: ToasterProps) {
  const [items, setItems] = useState<ToastItem[]>(() => initial.map((t) => ({ ...t, id: nextId++ })))
  const show = useCallback<ToastApi['show']>((t) => setItems((xs) => [...xs, { tone: 'success', ...t, id: nextId++ }]), [])
  const api = useMemo(() => ({ show }), [show])
  const drop = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id))
  return (
    <ToastContext.Provider value={api}>
      <RToast.Provider duration={duration} swipeDirection="right" label="Уведомление">
        {children}
        {items.map((t) => (
          <RToast.Root
            key={t.id}
            data-slot="toast"
            data-tone={t.tone}
            onOpenChange={(open) => !open && drop(t.id)}
            className={cx(
              'ds-toast flex items-start gap-3 border border-l-4 border-border-subtle-01 bg-layer-01 px-4 py-3 text-text-primary shadow-raised',
              STRIPE[t.tone],
            )}
          >
            <ToneIcon tone={ICON[t.tone]} className={cx('mt-0.5', MARK[t.tone])} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <RToast.Title className="text-heading-compact-01">{t.title}</RToast.Title>
              {t.description && <RToast.Description className="text-body-01 text-text-secondary">{t.description}</RToast.Description>}
            </div>
            {t.action && (
              <RToast.Action altText={t.action.label} asChild>
                <button
                  type="button"
                  onClick={t.action.onClick}
                  className="min-h-8 cursor-pointer px-2 text-body-compact-01 text-link-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
                >
                  {t.action.label}
                </button>
              </RToast.Action>
            )}
            <RToast.Close
              aria-label="закрыть"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center text-icon-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
            >
              <span aria-hidden="true">×</span>
            </RToast.Close>
          </RToast.Root>
        ))}
        <RToast.Viewport className="fixed inset-x-0 bottom-0 z-50 m-0 flex list-none flex-col gap-2 p-4 md:right-0 md:left-auto md:w-96" />
      </RToast.Provider>
    </ToastContext.Provider>
  )
}
