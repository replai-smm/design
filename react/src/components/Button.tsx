/**
 * Кнопка и область действий. Правило «одна главная кнопка на область» (П5) держит сам API:
 * - у `<Button>` нет варианта primary — главную кнопку рисует только `<ActionArea primary={…}>`, а у области одна главная;
 * - на поверхности (страница или открытая панель) одна область с главной — вторая даёт ошибку в разработке;
 * - в строке списка главной нет: `<ActionArea>` в строке — ошибка, у кнопок строки — только тихие варианты;
 * - опасное не стоит рядом с главным (П10): danger в области с главной — ошибка.
 * Высота: sm 32 · md 40 · lg 48 px (Carbon); на телефоне главная — во всю ширину и не ниже 48 px (П6).
 * Кнопка-ссылка: `href` — та же кнопка тегом `<a>` (те же варианты и правила); `external` или `target="_blank"` —
 * новая вкладка с `rel="noopener noreferrer"` и знаком «внешняя ссылка» (читалка слышит «откроется в новой вкладке»);
 * `download` — выгрузка файла. Своя ссылка через `asChild` с `target="_blank"` получает тот же `rel` и знак.
 */
import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useId, useLayoutEffect, type ButtonHTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react'
import { Slot } from 'radix-ui'
import { cx, rule } from '../lib/cx'
import { useSurface } from './layout'

export type ButtonVariant = 'secondary' | 'tertiary' | 'ghost' | 'danger'
type AnyVariant = 'primary' | ButtonVariant
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<AnyVariant, string> = {
  primary: 'bg-button-primary text-text-on-color hover:bg-button-primary-hover active:bg-button-primary-active',
  secondary: 'bg-button-secondary text-text-on-color hover:bg-button-secondary-hover active:bg-button-secondary-active',
  tertiary:
    'border border-button-tertiary bg-transparent text-button-tertiary hover:bg-button-tertiary-hover hover:text-text-inverse active:bg-button-tertiary-active',
  ghost: 'bg-transparent text-link-primary hover:bg-layer-hover-01 active:bg-layer-active-01',
  danger: 'bg-button-danger-primary text-text-on-color hover:bg-button-danger-hover active:bg-button-danger-active',
}
const SIZE: Record<ButtonSize, string> = { sm: 'min-h-8 px-3', md: 'min-h-10 px-4', lg: 'min-h-12 px-4' }
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-none text-body-compact-01 whitespace-nowrap cursor-pointer ' +
  'transition-colors duration-(--cds-duration-fast-02) ease-standard-productive ' +
  'focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2 ' +
  'disabled:cursor-not-allowed disabled:bg-button-disabled disabled:text-text-on-color-disabled disabled:border-transparent ' +
  'aria-disabled:cursor-not-allowed aria-disabled:bg-button-disabled aria-disabled:text-text-on-color-disabled'

/** Строка списка: здесь главной кнопки нет (П5), кнопки — только тихие. */
export const RowContext = createContext(false)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Правило Карты, которое разрешает это действие (П15): R-34. Пишется в data-rule. */
  rule?: string
  /** Идёт действие: кнопка не нажимается, читалка слышит «занято». */
  loading?: boolean
  /** Отрисовать ребёнка (ссылку) с видом кнопки. */
  asChild?: boolean
  icon?: ReactNode
  /** Адрес — кнопка становится ссылкой `<a>` с тем же видом. */
  href?: string
  /** Открыть в новой вкладке: `target="_blank"`, `rel="noopener noreferrer"`, знак «внешняя ссылка». */
  external?: boolean
  /** Выгрузка файла (`<a download>`): `true` или имя файла. */
  download?: boolean | string
  /** Для ссылки: `_blank` — то же, что `external`. */
  target?: string
  rel?: string
}

const NEW_TAB = 'откроется в новой вкладке'
const SAFE_REL = ['noopener', 'noreferrer']
const relWith = (rel?: string) => [...new Set([...(rel ?? '').split(/\s+/).filter(Boolean), ...SAFE_REL])].join(' ')

/** Знак «внешняя ссылка» (Carbon Launch): стрелка из квадрата; для читалки — словами. */
export function ExternalMark() {
  return (
    <>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-slot="external-mark" className="size-4 shrink-0">
        <path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v4h-9v-9h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="sr-only">{` (${NEW_TAB})`}</span>
    </>
  )
}

function useButtonClass(variant: AnyVariant, size: ButtonSize, className?: string) {
  return cx(BASE, VARIANT[variant], SIZE[size], className)
}

const ButtonBase = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'> & { variant?: AnyVariant }>(function ButtonBase(
  { variant = 'secondary', size = 'md', rule: ruleId, loading, asChild, icon, className, children, disabled, type, href, external, download, target, rel, ...rest },
  ref,
) {
  const cls = useButtonClass(variant, size, className)
  const lead = icon && <span aria-hidden="true" className="inline-flex size-4 shrink-0 items-center justify-center">{icon}</span>
  if (href !== undefined && !asChild) {
    const off = disabled || loading
    const newTab = external || target === '_blank'
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        data-slot="button"
        data-variant={variant}
        data-rule={ruleId}
        className={cls}
        // недоступная ссылка — без адреса: не открывается ни мышью, ни клавиатурой; роль ссылки и «недоступно» — словами для читалки
        href={off ? undefined : href}
        role={off ? 'link' : undefined}
        aria-disabled={off || undefined}
        aria-busy={loading || undefined}
        target={newTab ? '_blank' : target}
        rel={newTab ? relWith(rel) : rel}
        download={download === true ? '' : download || undefined}
        {...(rest as Record<string, unknown>)}
      >
        {lead}
        {children}
        {newTab && <ExternalMark />}
      </a>
    )
  }
  // своя ссылка через asChild в новую вкладку — тот же rel и знак, что у href
  let child = children
  if (asChild && isValidElement<{ target?: string; rel?: string; children?: ReactNode }>(children) && children.props.target === '_blank') {
    const el = children as ReactElement<{ target?: string; rel?: string; children?: ReactNode }>
    child = cloneElement(el, { rel: relWith(el.props.rel) }, <>{el.props.children}<ExternalMark /></>)
  }
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-rule={ruleId}
      className={cls}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      type={asChild ? undefined : (type ?? 'button')}
      {...rest}
    >
      {asChild ? (
        child
      ) : (
        <>
          {lead}
          {children}
        </>
      )}
    </Comp>
  )
})

/** Кнопка без главного варианта. Главная — только через `<ActionArea primary>`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'secondary', ...props }, ref) {
  const inRow = useContext(RowContext)
  rule(!inRow || variant === 'ghost' || variant === 'tertiary', `в строке списка кнопка только тихая (ghost или tertiary), а не «${variant}» (П5)`)
  return <ButtonBase ref={ref} variant={variant} {...props} />
})

export interface PrimaryAction extends Omit<ButtonProps, 'variant' | 'children'> {
  label: ReactNode
}

export interface ActionAreaProps {
  /** Единственная главная кнопка области. */
  primary?: PrimaryAction
  /** Остальные действия: `<Button variant="secondary|tertiary|ghost">`. */
  children?: ReactNode
  /** inline — в потоке; bottom — на телефоне нижняя полоса во всю ширину (П6), на ноутбуке — в потоке слева. */
  placement?: 'inline' | 'bottom'
  /** Подпись группы для читалки: «Действия страницы». */
  label?: string
  className?: string
}

const AreaContext = createContext(false)

export function ActionArea({ primary, children, placement = 'inline', label = 'Действия', className }: ActionAreaProps) {
  const inRow = useContext(RowContext)
  const nested = useContext(AreaContext)
  const surface = useSurface()
  const id = useId()
  rule(!inRow, 'в строке списка нет области действий и главной кнопки (П5): действие строки — тихая кнопка или нажатие на строку')
  rule(!nested, 'область действий внутри другой области: у области одна главная кнопка')
  if (primary) {
    const danger = Children.toArray(children).some((c) => isValidElement<ButtonProps>(c) && c.props.variant === 'danger')
    rule(!danger, 'опасное действие рядом с главным (П10): унесите его в «⋯» или в панель деталей')
  }
  useLayoutEffect(() => {
    if (!primary || !surface) return
    surface.primaries.add(id)
    rule(surface.primaries.size <= 1, `на поверхности «${surface.name}» вторая главная кнопка (П5): одна главная на состояние экрана`)
    return () => {
      surface.primaries.delete(id)
    }
  }, [primary ? 1 : 0, surface, id])
  const bottom = placement === 'bottom'
  return (
    <AreaContext.Provider value>
      <div
        role="group"
        aria-label={label}
        data-slot="action-area"
        data-placement={placement}
        className={cx(
          'flex flex-col-reverse gap-2 md:flex-row md:flex-wrap md:items-center',
          bottom && 'max-md:border-t max-md:border-border-subtle-01 max-md:bg-layer-01 max-md:px-4 max-md:py-4 max-md:-mx-4',
          className,
        )}
      >
        {primary && <PrimaryButton {...primary} bottom={bottom} />}
        {children}
      </div>
    </AreaContext.Provider>
  )
}

function PrimaryButton({ label, bottom, size = 'md', className, ...rest }: PrimaryAction & { bottom: boolean }) {
  return (
    <ButtonBase variant="primary" size={size} className={cx('max-md:min-h-12 max-md:w-full', bottom && 'md:w-auto', className)} {...rest}>
      {label}
    </ButtonBase>
  )
}
