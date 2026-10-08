/**
 * Окно (Carbon Modal) на Radix Dialog: по центру на ноутбуке, снизу во всю ширину на телефоне. Фокус заперт в окне,
 * Esc и «×» закрывают, после закрытия фокус возвращается на кнопку, которая открыла окно.
 * Открытое окно — своё состояние экрана со своей главной кнопкой (П5): `actions` — `<ActionArea primary>`;
 * на ноутбуке кнопки окна — во всю ширину нижней полосы, главная справа (Carbon), на телефоне — главная внизу.
 * Первый фокус: элемент с `data-autofocus`, иначе первое поле тела, иначе главная кнопка, иначе «×».
 *
 * `ConfirmDialog` — подтверждение вместо `window.confirm`: вопрос, «Отмена» и действие. Опасное (`danger`) —
 * красной кнопкой без главной рядом (П10), фокус сначала на «Отмена» (Carbon: случайный Enter не удалит).
 * `onConfirm` вернул обещание — кнопка ждёт, окно закроется после успеха; ошибка — плашкой в окне, окно открыто.
 * `useConfirm()` — то же одной строкой: `if (await confirm({ title: 'Удалить пост?', danger: true })) …`
 * (нужен `<ConfirmProvider>` один раз вокруг приложения).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Dialog as RDialog } from 'radix-ui'
import { cx } from '../lib/cx'
import { LayerContext } from '../lib/controllable'
import { ActionArea, Button } from './Button'
import { Notification } from './Notification'
import { SurfaceProvider } from './layout'

/** sm · md · lg — ширина на ноутбуке; full — во весь экран (длинная работа в окне: «Чат с ИИ» Статистики). */
export type DialogSize = 'sm' | 'md' | 'lg' | 'full'

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Кнопка, которая открывает окно (необязательно: окно можно открыть из кода). */
  trigger?: ReactNode
  title: ReactNode
  /** Строка над заголовком: чьё это окно («Кофейня «Зерно»»). */
  label?: ReactNode
  /** Пояснение под заголовком — читалка прочтёт его при открытии. */
  description?: ReactNode
  size?: DialogSize
  /** `<ActionArea primary={…}>` — нижняя полоса окна. */
  actions?: ReactNode
  /** Не закрывать кликом мимо окна — у окна с полями ввода, чтобы случайный клик не стёр набранное. */
  persistent?: boolean
  /** Подпись «×» для читалки. */
  closeLabel?: string
  children?: ReactNode
}

const WIDTH: Record<Exclude<DialogSize, 'full'>, string> = { sm: 'md:max-w-md', md: 'md:max-w-2xl', lg: 'md:max-w-4xl' }
/** Где стоит окно: снизу на телефоне и по центру на ноутбуке; во весь экран — везде. */
const place = (size: DialogSize) =>
  size === 'full'
    ? 'inset-0 h-dvh'
    : cx('inset-x-0 bottom-0 max-h-11/12', 'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-10/12 md:-translate-x-1/2 md:-translate-y-1/2', WIDTH[size])
const TABBABLE = 'input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])'

export function Dialog({ open, defaultOpen, onOpenChange, trigger, title, label, description, size = 'sm', actions, persistent, closeLabel = 'закрыть', children }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <RDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <RDialog.Trigger asChild>{trigger}</RDialog.Trigger>}
      <RDialog.Portal>
        <RDialog.Overlay className="ds-overlay fixed inset-0 z-40 bg-overlay" />
        <RDialog.Content
          ref={ref}
          {...(description ? {} : { 'aria-describedby': undefined })}
          data-slot="dialog"
          data-size={size}
          onOpenAutoFocus={(e) => {
            const root = ref.current
            const target =
              root?.querySelector<HTMLElement>('[data-autofocus]') ??
              root?.querySelector<HTMLElement>(`[data-dialog-body] :is(${TABBABLE})`) ??
              root?.querySelector<HTMLElement>('[data-dialog-footer] [data-variant=primary]:not([disabled])')
            if (target) {
              e.preventDefault()
              target.focus()
            }
          }}
          onPointerDownOutside={(e) => persistent && e.preventDefault()}
          className={cx(
            'ds-dialog fixed z-50 flex w-full flex-col bg-layer-01 text-text-primary shadow-raised focus-visible:outline-none',
            place(size),
          )}
        >
          <SurfaceProvider name="окно">
            <LayerContext.Provider value={2}>
              <div data-ds-surface="окно" className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3 pt-4 pl-4">
                  <div className="flex min-w-0 flex-col gap-1 pb-2">
                    {label && <p className="m-0 text-label-01 text-text-secondary">{label}</p>}
                    <RDialog.Title className="m-0 text-heading-03">{title}</RDialog.Title>
                  </div>
                  <RDialog.Close
                    aria-label={closeLabel}
                    className="-mt-4 inline-flex size-12 shrink-0 cursor-pointer items-center justify-center text-icon-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2"
                  >
                    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </RDialog.Close>
                </div>
                <div data-dialog-body="" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-2 pb-6 md:pr-16">
                  {description ? <RDialog.Description className="m-0 text-body-01 text-text-primary">{description}</RDialog.Description> : null}
                  {children}
                </div>
                {actions && (
                  <div data-dialog-footer="" className="ds-dialog-footer border-t border-border-subtle-01 p-4 md:border-t-0 md:p-0">
                    {actions}
                  </div>
                )}
              </div>
            </LayerContext.Provider>
          </SurfaceProvider>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

/* ——— Подтверждение ——— */

export interface ConfirmDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  /** Вопрос: «Удалить черновик?» */
  title: ReactNode
  /** Что будет: «Черновик пропадёт у всех. Вернуть нельзя.» */
  children?: ReactNode
  /** Слово действия: «Удалить» (не «Да» и не «ОК»). */
  confirmLabel: string
  cancelLabel?: string
  /** Опасное действие: красная кнопка, фокус сначала на «Отмена». */
  danger?: boolean
  /** Правило Карты, которое разрешает действие (П15) — в data-rule кнопки. */
  rule?: string
  /** Действие. Вернуло обещание — кнопка ждёт; отказ — его текст плашкой в окне. */
  onConfirm: () => void | Promise<unknown>
  onCancel?: () => void
}

export function ConfirmDialog({ open: openProp, defaultOpen, onOpenChange, trigger, title, children, confirmLabel, cancelLabel = 'Отмена', danger, rule: ruleId, onConfirm, onCancel }: ConfirmDialogProps) {
  const [inner, setInner] = useState(Boolean(defaultOpen))
  const open = openProp ?? inner
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setOpen = (v: boolean) => {
    if (busy && !v) return
    if (openProp === undefined) setInner(v)
    if (!v) setError(null)
    onOpenChange?.(v)
  }
  const confirm = async () => {
    setError(null)
    const r = onConfirm()
    if (!(r instanceof Promise)) return setOpen(false)
    setBusy(true)
    try {
      await r
      setBusy(false)
      if (openProp === undefined) setInner(false)
      onOpenChange?.(false)
    } catch (e) {
      setBusy(false)
      setError(e instanceof Error ? e.message : String(e))
    }
  }
  const cancel = (
    <Button data-autofocus={danger ? '' : undefined} disabled={busy} onClick={() => (onCancel?.(), setOpen(false))}>
      {cancelLabel}
    </Button>
  )
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (!v && onCancel?.(), setOpen(v))}
      trigger={trigger}
      title={title}
      size="sm"
      actions={
        danger ? (
          <ActionArea label="Подтверждение">
            <Button variant="danger" rule={ruleId} loading={busy} onClick={confirm}>
              {confirmLabel}
            </Button>
            {cancel}
          </ActionArea>
        ) : (
          <ActionArea label="Подтверждение" primary={{ label: confirmLabel, rule: ruleId, loading: busy, onClick: confirm }}>
            {cancel}
          </ActionArea>
        )
      }
    >
      {children ? <div className="text-body-01">{children}</div> : null}
      {error && (
        <Notification tone="error" scope="row" title="Не получилось">
          {error}
        </Notification>
      )}
    </Dialog>
  )
}

/* ——— useConfirm ——— */

export interface ConfirmOptions {
  title: ReactNode
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  rule?: string
}
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>
const ConfirmContext = createContext<ConfirmFn | null>(null)

/** Подтверждение одной строкой вместо `window.confirm`: `await confirm({…})` → true, если человек согласился. */
export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext)
  if (!fn) throw new Error('ДС-React: useConfirm() вне <ConfirmProvider> — оберните приложение в <ConfirmProvider>')
  return fn
}

/** Поставщик подтверждений: одно окно на приложение, вопросы идут по одному. */
export function ConfirmProvider({ children }: { children?: ReactNode }) {
  const [req, setReq] = useState<{ o: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)
  const [open, setOpen] = useState(false)
  const confirm = useCallback<ConfirmFn>(
    (o) =>
      new Promise<boolean>((resolve) => {
        setReq({ o, resolve })
        setOpen(true)
      }),
    [],
  )
  const done = (v: boolean) => {
    req?.resolve(v)
    setOpen(false)
  }
  const value = useMemo(() => confirm, [confirm])
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {req && (
        <ConfirmDialog
          open={open}
          onOpenChange={(v) => !v && done(false)}
          title={req.o.title}
          confirmLabel={req.o.confirmLabel ?? (req.o.danger ? 'Удалить' : 'Продолжить')}
          cancelLabel={req.o.cancelLabel}
          danger={req.o.danger}
          rule={req.o.rule}
          onConfirm={() => done(true)}
        >
          {req.o.body}
        </ConfirmDialog>
      )}
    </ConfirmContext.Provider>
  )
}
