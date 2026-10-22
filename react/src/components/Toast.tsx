/**
 * Всплывашка «готово»: поверхность с меткой тона всплывает над экраном внизу справа (на телефоне — во всю ширину),
 * гаснет сама за 5 с, уходит вбок по свайпу. Беда — не сюда, а уведомлением в потоке у её места (П11).
 * `useToast().show({ title })` — из любого места внутри `<Toaster>`.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Toast as RToast } from 'radix-ui'
import { FOCUS, MARK, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Icon } from './Icon'
import type { NotificationTone } from './Notification'

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

const STRIPE: Record<NotificationTone, string> = { опасно: 'border-l-danger', решение: 'border-l-decision', внимание: 'border-l-warning', инфо: 'border-l-fg', хорошо: 'border-l-success' }
let nextId = 1

export interface ToasterProps {
  children?: ReactNode
  /** Всплывашки, открытые сразу (истории). */
  initial?: Array<Omit<ToastItem, 'id'>>
}

export function Toaster({ children, initial = [] }: ToasterProps) {
  const [items, setItems] = useState<ToastItem[]>(() => initial.map((t) => ({ ...t, id: nextId++ })))
  const show = useCallback<ToastApi['show']>((t) => setItems((xs) => [...xs, { tone: 'хорошо', ...t, id: nextId++ }]), [])
  const api = useMemo(() => ({ show }), [show])
  const drop = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id))
  return (
    <ToastContext.Provider value={api}>
      <RToast.Provider duration={5000} swipeDirection="right" label="Уведомление">
        {children}
        {items.map((t) => (
          <RToast.Root key={t.id} data-slot="toast" data-tone={t.tone} onOpenChange={(open) => !open && drop(t.id)} className={cx('ds-toast flex items-start gap-items p-blocks shadow-raised', SURFACE, MARK, STRIPE[t.tone])}>
            <div className="flex min-w-0 flex-1 flex-col gap-tight">
              <div className="flex items-center gap-items">
                <Icon tone={t.tone} />
                <RToast.Title data-part="title" className="text-heading">
                  {t.title}
                </RToast.Title>
              </div>
              {t.description && <RToast.Description className="text-body text-fg-muted">{t.description}</RToast.Description>}
            </div>
            {t.action && (
              <RToast.Action altText={t.action.label} asChild>
                <Button variant="ghost" dense onClick={t.action.onClick} className="-my-tight">
                  {t.action.label}
                </Button>
              </RToast.Action>
            )}
            <RToast.Close asChild>
              <Button variant="ghost" dense icon="close" aria-label="закрыть" className={cx('-my-tight shrink-0', FOCUS)} />
            </RToast.Close>
          </RToast.Root>
        ))}
        <RToast.Viewport className="fixed inset-x-0 bottom-0 z-50 m-0 flex list-none flex-col gap-items p-blocks md:right-0 md:left-auto md:w-popup" />
      </RToast.Provider>
    </ToastContext.Provider>
  )
}
