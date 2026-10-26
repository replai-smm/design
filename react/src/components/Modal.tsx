/**
 * Окно — единственный слой поверх экрана (Carbon: Modal): по центру на ноутбуке, шторкой снизу на телефоне (наше
 * расхождение). Глубина «поверх»: затемнение и тень. Шапка — `modalLabel` (мелко) и `modalHeading` ролью `title`,
 * «закрыть» — кнопка-значок (`closeButtonLabel`). Низ — набор кнопок Carbon: `secondaryButtonText` (→
 * `onSecondarySubmit`, без него — `onRequestClose`) и главная `primaryButtonText` (→ `onRequestSubmit`), при `danger` —
 * опасная вместо главной (П10). `passiveModal` — без низа. Открытое окно — своя область главной кнопки (П5).
 * - Открыто — `open`; Esc и «закрыть» зовут `onRequestClose`. Нажатие мимо закрывает только `passiveModal` (у окна с
 *   действиями — если `preventCloseOnClickOutside={false}`), как у Carbon: случайное нажатие не стирает набранное.
 * - Первый фокус: `selectorPrimaryFocus` (`[data-modal-primary-focus]`), у `danger` — второстепенная кнопка
 *   (случайный Enter не удалит), иначе главная (у `passiveModal` — «закрыть»). Фокус заперт и возвращается назад.
 * - Действие идёт — `loadingStatus="active"`: на главной ход в строке (`loadingDescription`), кнопки выключены.
 *
 * `useConfirm()` — подтверждение вместо `window.confirm` на том же окне: `if (await confirm({ modalHeading: 'Удалить
 * файл?', danger: true }))`. Нужен `<ConfirmProvider>` один раз вокруг приложения.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type HTMLAttributes, type ReactNode, type SyntheticEvent } from 'react'
import { Dialog as RDialog } from 'radix-ui'
import { cx, rule } from '../lib/cx'
import { Close } from '../lib/icons.gen'
import { MODAL_SIZES, type InlineLoadingStatus, type ModalSize } from '../lib/vocab'
import { Button, ButtonSet, IconButton } from './Button'
import { InlineLoading } from './InlineLoading'
import { SurfaceProvider } from './layout'

type ModalEvent = SyntheticEvent<HTMLElement> | Event

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean
  /** Заголовок окна. */
  modalHeading?: ReactNode
  /** Мелкая строка над заголовком: чьё это окно. */
  modalLabel?: ReactNode
  children?: ReactNode
  primaryButtonText?: ReactNode
  secondaryButtonText?: ReactNode
  primaryButtonDisabled?: boolean
  onRequestSubmit?(event: ModalEvent): void
  onSecondarySubmit?(event: ModalEvent): void
  /** Esc, «закрыть», второстепенная без `onSecondarySubmit`, нажатие мимо (где можно). */
  onRequestClose?(event: ModalEvent): void
  /** Опасное действие: главная — `kind="danger"`, фокус — на второстепенной. */
  danger?: boolean
  /** Без низа с кнопками: окно для чтения. */
  passiveModal?: boolean
  preventCloseOnClickOutside?: boolean
  /** Ширина на ноутбуке: xs · sm · md (по умолчанию) · lg. */
  size?: ModalSize
  closeButtonLabel?: string
  /** Что взять первым фокусом. */
  selectorPrimaryFocus?: string
  loadingStatus?: InlineLoadingStatus
  loadingDescription?: string
  onLoadingSuccess?: () => void
}

const WIDTH: Record<ModalSize, string> = { xs: 'md:max-w-popup', sm: 'md:max-w-form', md: 'md:max-w-window', lg: 'md:w-11/12 md:max-w-page' }
const PLACE = {
  bottom: 'inset-x-0 bottom-0 max-h-11/12 rounded-b-none md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-10/12 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-b-surface',
  left: 'inset-y-0 left-0 w-11/12 max-w-popup rounded-l-none',
} as const

/** Окно со стороной: снизу (окно; на ноутбуке — по центру) или слева (колонка раскладки — только ThreeColumn). */
function ModalBase({
  side,
  open = false,
  modalHeading,
  modalLabel,
  children,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonDisabled = false,
  onRequestSubmit,
  onSecondarySubmit,
  onRequestClose,
  danger = false,
  passiveModal = false,
  preventCloseOnClickOutside,
  size = 'md',
  closeButtonLabel = 'Закрыть',
  selectorPrimaryFocus = '[data-modal-primary-focus]',
  loadingStatus = 'inactive',
  loadingDescription,
  onLoadingSuccess,
  className,
  'aria-label': ariaLabel,
  ...rest
}: ModalProps & { side: keyof typeof PLACE }) {
  rule(MODAL_SIZES.includes(size), `размера окна «${String(size)}» нет: ${MODAL_SIZES.join(' · ')}`)
  const ref = useRef<HTMLDivElement>(null)
  const primary = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const close = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const loading = loadingStatus !== 'inactive'
  const outside = passiveModal ? !preventCloseOnClickOutside : preventCloseOnClickOutside === false
  return (
    <RDialog.Root open={open}>
      <RDialog.Portal>
        <RDialog.Overlay className="ds-overlay fixed inset-0 z-40 bg-scrim" />
        <RDialog.Content
          ref={ref}
          aria-describedby={undefined}
          aria-label={ariaLabel}
          data-slot="modal"
          data-size={size}
          data-side={side}
          data-danger={danger || undefined}
          {...rest}
          onOpenAutoFocus={(e) => {
            const root = ref.current
            const target =
              root?.querySelector<HTMLElement>(selectorPrimaryFocus) ??
              (danger ? root?.querySelector<HTMLElement>('[data-part=footer] [data-kind=secondary]') : null) ??
              (passiveModal || primary.current?.disabled ? close.current : primary.current)
            if (target) {
              e.preventDefault()
              target.focus()
            }
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onRequestClose?.(e)
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
            if (outside) onRequestClose?.(e)
          }}
          onFocusOutside={(e) => e.preventDefault()}
          className={cx('ds-dialog fixed z-50 flex w-full flex-col rounded-surface border border-line bg-surface text-fg shadow-overlay focus-visible:outline-none', PLACE[side], side === 'bottom' && WIDTH[size], className)}
        >
          <SurfaceProvider name="окно">
            <div className="flex items-start justify-between gap-items border-b border-line py-compact pr-items pl-blocks">
              <div className="flex min-w-0 flex-col gap-tight pt-tight">
                {modalLabel && <p className="m-0 text-caption text-fg-muted">{modalLabel}</p>}
                <RDialog.Title data-part="title" className={cx('m-0 min-w-0 text-title', !modalHeading && 'sr-only')}>
                  {modalHeading || ariaLabel}
                </RDialog.Title>
              </div>
              <IconButton ref={close} kind="ghost" label={closeButtonLabel} onClick={(e) => onRequestClose?.(e)} data-part="close">
                <Close />
              </IconButton>
            </div>
            <div data-part="body" className="relative flex min-h-0 flex-1 flex-col gap-blocks overflow-y-auto p-blocks">
              {children}
            </div>
            {!passiveModal && (
              <div data-part="footer" className="border-t border-line p-blocks">
                <ButtonSet aria-busy={loading || undefined}>
                  {secondaryButtonText && (
                    <Button kind="secondary" disabled={loading} onClick={(e) => (onSecondarySubmit ?? onRequestClose)?.(e)}>
                      {secondaryButtonText}
                    </Button>
                  )}
                  <Button ref={primary} kind={danger ? 'danger' : 'primary'} disabled={loading || primaryButtonDisabled} onClick={(e) => onRequestSubmit?.(e)}>
                    {loading ? <InlineLoading status={loadingStatus} description={loadingDescription} onSuccess={onLoadingSuccess} /> : primaryButtonText}
                  </Button>
                </ButtonSet>
              </div>
            )}
          </SurfaceProvider>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

/** Окно поверх экрана (Carbon: Modal); на телефоне — шторка снизу. */
export function Modal(props: ModalProps) {
  return <ModalBase {...props} side="bottom" />
}

/** Шторка слева — колонка раскладки на телефоне. Только для ThreeColumn: в index.ts её нет (у Carbon пары нет). */
export function LeftSheet(props: ModalProps) {
  return <ModalBase passiveModal {...props} side="left" />
}

/* ——— Подтверждение ——— */

/** Вопрос подтверждения — поля того же окна (Carbon: Modal). */
export type ConfirmOptions = Pick<ModalProps, 'modalHeading' | 'modalLabel' | 'children' | 'primaryButtonText' | 'secondaryButtonText' | 'danger' | 'size'>
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>
const ConfirmContext = createContext<ConfirmFn | null>(null)

/** Подтверждение одной строкой: `await confirm({…})` → true, если человек согласился. */
export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext)
  if (!fn) throw new Error('ДС-React: useConfirm() вне <ConfirmProvider> — оберните приложение в <ConfirmProvider>')
  return fn
}

/** Поставщик подтверждений: одно окно на приложение, вопросы идут по одному. Опасное — `danger`: «Удалить», фокус на «Отмена». */
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
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {o && (
        <Modal
          open={open}
          size="sm"
          {...o}
          primaryButtonText={o.primaryButtonText ?? (o.danger ? 'Удалить' : 'Продолжить')}
          secondaryButtonText={o.secondaryButtonText ?? 'Отмена'}
          onRequestSubmit={() => done(true)}
          onRequestClose={() => done(false)}
        >
          {o.children ? <div className="text-body">{o.children}</div> : null}
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}
