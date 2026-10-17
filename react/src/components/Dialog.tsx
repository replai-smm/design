/**
 * Окно — единственный слой поверх экрана: по центру на ноутбуке, шторкой снизу на телефоне (`side="left"` — шторка
 * слева: колонка раскладки на телефоне). Глубина «поверх»: затемнение и тень окна. Шапка — заголовок ролью `title` и
 * одна кнопка «закрыть» (та же, что у уведомления); Esc и нажатие мимо закрывают, фокус заперт и возвращается на
 * кнопку, которая открыла окно. Открытое окно — своя область главной кнопки (П5): `actions` — `<ActionArea primary>`
 * внизу, главная справа на ноутбуке и внизу во всю ширину на телефоне. Первый фокус: `data-autofocus`, иначе первое
 * поле, иначе главная кнопка, иначе «закрыть».
 *
 * `useConfirm()` — подтверждение вместо `window.confirm`: `if (await confirm({ title: 'Удалить пост?', danger: true }))`.
 * Опасное — кнопкой «опасно» без главной рядом (П10), фокус сначала на «Отмена» (случайный Enter не удалит).
 * Нужен `<ConfirmProvider>` один раз вокруг приложения.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Dialog as RDialog } from 'radix-ui'
import { cx } from '../lib/cx'
import { ActionArea, Button } from './Button'
import { SurfaceProvider } from './layout'

/** sm, md — ширина на ноутбуке; full — во весь экран (долгая работа в окне: «Чат с ИИ» Статистики). */
export type DialogSize = 'sm' | 'md' | 'full'

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Кнопка, которая открывает окно (необязательно: окно можно открыть из кода). */
  trigger?: ReactNode
  title: ReactNode
  /** Пояснение под заголовком — читалка прочтёт его при открытии. */
  description?: ReactNode
  size?: DialogSize
  /** Шторка слева на любой ширине (колонка раскладки на телефоне); без него — окно. */
  side?: 'left'
  /** `<ActionArea primary={…}>` — низ окна. */
  actions?: ReactNode
  /** Не закрывать нажатием мимо — у окна с полями, чтобы случайное нажатие не стёрло набранное. */
  persistent?: boolean
  children?: ReactNode
}

const WIDTH = { sm: 'md:max-w-md', md: 'md:max-w-2xl' } as const
const place = (size: DialogSize, side?: 'left') =>
  side === 'left'
    ? 'inset-y-0 left-0 w-11/12 max-w-sm rounded-l-none'
    : size === 'full'
      ? 'inset-0 h-dvh rounded-none'
      : cx('inset-x-0 bottom-0 max-h-11/12 rounded-b-none md:rounded-b-surface', 'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-10/12 md:-translate-x-1/2 md:-translate-y-1/2', WIDTH[size])
const TABBABLE = 'input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onOpenChange, trigger, title, description, size = 'sm', side, actions, persistent, children }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RDialog.Trigger asChild>{trigger}</RDialog.Trigger>}
      <RDialog.Portal>
        <RDialog.Overlay className="ds-overlay fixed inset-0 z-40 bg-scrim" />
        <RDialog.Content
          ref={ref}
          {...(description ? {} : { 'aria-describedby': undefined })}
          data-slot="dialog"
          data-size={size}
          data-side={side ?? (size === 'full' ? undefined : 'bottom')}
          onOpenAutoFocus={(e) => {
            const root = ref.current
            const target =
              root?.querySelector<HTMLElement>('[data-autofocus]') ??
              root?.querySelector<HTMLElement>(`[data-part=body] :is(${TABBABLE})`) ??
              root?.querySelector<HTMLElement>('[data-part=footer] [data-variant=primary]:not([disabled])')
            if (target) {
              e.preventDefault()
              target.focus()
            }
          }}
          onPointerDownOutside={(e) => persistent && e.preventDefault()}
          className={cx('ds-dialog fixed z-50 flex w-full flex-col rounded-surface border border-line bg-surface text-fg shadow-overlay focus-visible:outline-none', place(size, side))}
        >
          <SurfaceProvider name="окно">
            <div className="flex items-start justify-between gap-items border-b border-line py-compact pr-items pl-blocks">
              <RDialog.Title data-part="title" className="m-0 min-w-0 pt-tight text-title">
                {title}
              </RDialog.Title>
              <RDialog.Close asChild>
                <Button variant="ghost" icon="close" aria-label="закрыть" className="shrink-0" />
              </RDialog.Close>
            </div>
            <div data-part="body" className="flex min-h-0 flex-1 flex-col gap-blocks overflow-y-auto p-blocks">
              {description ? <RDialog.Description className="m-0 text-body text-fg">{description}</RDialog.Description> : null}
              {children}
            </div>
            {actions && (
              <div data-part="footer" className="ds-dialog-footer border-t border-line p-blocks">
                {actions}
              </div>
            )}
          </SurfaceProvider>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

/* ——— Подтверждение ——— */

export interface ConfirmOptions {
  /** Вопрос: «Удалить черновик?» */
  title: ReactNode
  /** Что будет: «Черновик пропадёт у всех. Вернуть нельзя.» */
  body?: ReactNode
  /** Слово действия: «Удалить» (не «Да» и не «ОК»). */
  confirmLabel?: string
  cancelLabel?: string
  /** Опасное действие: кнопка «опасно», фокус сначала на «Отмена». */
  danger?: boolean
  /** Правило Карты, которое разрешает действие (П15) — в data-rule кнопки. */
  rule?: string
}
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>
const ConfirmContext = createContext<ConfirmFn | null>(null)

/** Подтверждение одной строкой: `await confirm({…})` → true, если человек согласился. */
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
  const o = req?.o
  const word = o?.confirmLabel ?? (o?.danger ? 'Удалить' : 'Продолжить')
  const cancel = (
    <Button data-autofocus={o?.danger ? '' : undefined} onClick={() => done(false)}>
      {o?.cancelLabel ?? 'Отмена'}
    </Button>
  )
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {o && (
        <Dialog
          open={open}
          onOpenChange={(v) => !v && done(false)}
          title={o.title}
          actions={
            o.danger ? (
              <ActionArea label="Подтверждение">
                <Button tone="опасно" rule={o.rule} onClick={() => done(true)}>
                  {word}
                </Button>
                {cancel}
              </ActionArea>
            ) : (
              <ActionArea label="Подтверждение" primary={{ label: word, rule: o.rule, onClick: () => done(true) }}>
                {cancel}
              </ActionArea>
            )
          }
        >
          {o.body ? <div className="text-body">{o.body}</div> : null}
        </Dialog>
      )}
    </ConfirmContext.Provider>
  )
}
