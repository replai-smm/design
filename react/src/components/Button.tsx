/**
 * Кнопка, набор кнопок и кнопка-значок — по Carbon (Button, ButtonSet, IconButton): `kind` по умолчанию `primary`.
 * «Одна главная на поверхность» (П5) держит проверка в разработке (`rule()` бросает):
 * - на поверхности (страница, окно, карточка решения — `SurfaceProvider`) вторая `kind="primary"` — ошибка;
 * - в одном `ButtonSet` опасная кнопка (`danger…`) рядом с главной — ошибка (П10), две главные — ошибка;
 * - в строке списка — только `kind="ghost"`, набора кнопок в строке нет.
 * Виды: главная — инверсия (чёрная в светлой, белая в тёмной); `secondary` — тихая с рамкой; `tertiary` — рамка цвета
 * главной; `ghost` — без рамки (инструмент, строка); `danger` — заливка тона «опасно», `danger--tertiary` — рамка,
 * `danger--ghost` — слово. Значок — `renderIcon` (компонент из входа пакета `/icons`) после слова, как у Carbon;
 * значок без слова — `IconButton` с обязательной подписью `label` (подсказка и имя для читалки). Высота — `size`:
 * sm 32 · md 40 · lg 48; без `size` — 48 на телефоне и 40 на ноутбуке. Занятость — не свойство кнопки:
 * `InlineLoading` на её месте (паттерн «Загрузка»).
 */
import { createContext, forwardRef, useContext, useId, useLayoutEffect, useRef, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { CONTROL, DENSE, FAST, FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { BUTTON_KINDS, SIZES, isDangerKind, type ButtonKind, type IconButtonKind, type PopoverAlignment, type Size } from '../lib/vocab'
import { useSurface } from './layout'
import { Tooltip } from './Tooltip'

const KIND: Record<ButtonKind, string> = {
  primary: 'border border-inverse bg-inverse text-fg-inverse hover:border-inverse-hover hover:bg-inverse-hover',
  secondary: 'border border-line-strong bg-transparent text-fg hover:bg-hover',
  tertiary: 'border border-inverse bg-transparent text-fg hover:bg-inverse hover:text-fg-inverse',
  ghost: 'border border-transparent bg-transparent text-fg hover:bg-hover',
  danger: 'border border-danger bg-danger text-fg-inverse hover:border-danger-fg hover:bg-danger-fg',
  'danger--primary': 'border border-danger bg-danger text-fg-inverse hover:border-danger-fg hover:bg-danger-fg',
  'danger--tertiary': 'border border-danger bg-transparent text-danger-fg hover:bg-danger-bg',
  'danger--ghost': 'border border-transparent bg-transparent text-danger-fg hover:bg-danger-bg',
}
const BASE =
  `inline-flex items-center justify-center gap-items rounded-control text-body whitespace-nowrap no-underline cursor-pointer ${FAST} ${FOCUS} ` +
  'disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-fg-disabled ' +
  'aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-transparent aria-disabled:text-fg-disabled'
const HEIGHT: Record<Size, string> = { sm: DENSE, md: 'min-h-control', lg: 'min-h-touch' }
const SQUARE: Record<Size, string> = { sm: 'w-dense', md: 'w-control', lg: 'w-touch' }

/** Строка списка: главной кнопки нет (П5), кнопки — только `ghost`. */
export const RowContext = createContext(false)

/** Набор кнопок: кто в нём главный и кто опасный. */
interface SetState {
  primaries: Set<string>
  dangers: Set<string>
}
const SetContext = createContext<SetState | null>(null)

function checkSize(size: Size | undefined) {
  rule(size === undefined || SIZES.includes(size), `размера «${String(size)}» нет: sm 32 · md 40 · lg 48 (xs, xl, 2xl — меньше цели пальца или без нужды)`)
}

/** Главная и опасная кнопка отмечаются на поверхности и в наборе — так держатся П5 и П10. */
function useKindRules(kind: ButtonKind) {
  const surface = useSurface()
  const set = useContext(SetContext)
  const inRow = useContext(RowContext)
  const id = useId()
  rule(BUTTON_KINDS.includes(kind), `вида кнопки «${String(kind)}» нет: ${BUTTON_KINDS.join(' · ')}`)
  rule(!inRow || kind === 'ghost', `в строке списка кнопка только kind="ghost", а не «${kind}» (П5)`)
  const primary = kind === 'primary'
  const danger = isDangerKind(kind)
  useLayoutEffect(() => {
    if (!primary || !surface) return
    surface.primaries.add(id)
    rule(surface.primaries.size <= 1, `на поверхности «${surface.name}» вторая главная кнопка (П5): одна главная на состояние экрана`)
    return () => {
      surface.primaries.delete(id)
    }
  }, [primary, surface, id])
  useLayoutEffect(() => {
    if (!set || !(primary || danger)) return
    ;(primary ? set.primaries : set.dangers).add(id)
    rule(set.primaries.size <= 1, 'в наборе кнопок две главные (П5): главная одна')
    rule(!(set.primaries.size && set.dangers.size), 'опасное действие рядом с главным (П10): унесите его в меню «…» или в окно подтверждения')
    return () => {
      set.primaries.delete(id)
      set.dangers.delete(id)
    }
  }, [primary, danger, set, id])
}

interface ButtonCommon {
  /** Вид (Carbon: kind); по умолчанию `primary` — главная, одна на поверхность. */
  kind?: ButtonKind
  /** sm 32 · md 40 · lg 48; без него — 48 на телефоне, 40 на ноутбуке. */
  size?: Size
  /** Ссылка видом кнопки: `<a href>`. */
  href?: string
  target?: string
  rel?: string
}

export interface ButtonProps extends ButtonCommon, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Значок после слова — компонент значка (`renderIcon={Add}` из входа пакета `/icons`). */
  renderIcon?: ElementType
}

/** Действие по нажатию (Carbon: Button). */
export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(function Button(
  { kind = 'primary', size, href, target, rel, renderIcon: RenderIcon, className, children, type, disabled, ...rest },
  ref,
) {
  checkSize(size)
  rule(!RenderIcon || (children !== undefined && children !== null && children !== false), 'значок без слова — IconButton с подписью label, а не Button')
  useKindRules(kind)
  const cls = cx(BASE, KIND[kind], size ? HEIGHT[size] : CONTROL, size === 'sm' ? 'px-compact' : 'px-blocks', className)
  const body = (
    <>
      {children}
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
    </>
  )
  return href !== undefined ? (
    <a ref={ref} href={disabled ? undefined : href} target={target} rel={rel} aria-disabled={disabled || undefined} data-slot="button" data-kind={kind} className={cls} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
      {body}
    </a>
  ) : (
    <button ref={ref} data-slot="button" data-kind={kind} className={cls} type={type ?? 'button'} disabled={disabled} {...rest}>
      {body}
    </button>
  )
})

export interface IconButtonProps extends ButtonCommon, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  kind?: IconButtonKind
  /** Подпись: подсказка у значка и имя кнопки для читалки — обязательна. */
  label: ReactNode
  /** Значок — `<Close />` из входа пакета `/icons`. */
  children: ReactNode
  /** Где подсказка относительно кнопки; по умолчанию сверху. */
  align?: PopoverAlignment
  /** Задержка подсказки, мс. */
  enterDelayMs?: number
  /** Подсказка открыта при показе. */
  defaultOpen?: boolean
}

/** Кнопка-значок без слова (Carbon: IconButton): квадрат высоты кнопки, подпись — подсказкой и для читалки. */
export const IconButton = forwardRef<HTMLButtonElement & HTMLAnchorElement, IconButtonProps>(function IconButton(
  { kind = 'primary', size, label, align = 'top', enterDelayMs, defaultOpen, href, target, rel, className, children, type, disabled, ...rest },
  ref,
) {
  checkSize(size)
  rule(label !== undefined && label !== null && label !== '', 'у кнопки-значка нет подписи label: читалка не узнает, что она делает')
  useKindRules(kind)
  const cls = cx(BASE, KIND[kind], size ? cx(HEIGHT[size], SQUARE[size]) : cx(CONTROL, 'w-touch md:w-control'), 'shrink-0', className)
  return (
    <Tooltip label={label} align={align} enterDelayMs={enterDelayMs} defaultOpen={defaultOpen}>
      {href !== undefined ? (
        <a ref={ref} href={disabled ? undefined : href} target={target} rel={rel} aria-disabled={disabled || undefined} data-slot="button" data-kind={kind} className={cls} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      ) : (
        <button ref={ref} data-slot="button" data-kind={kind} className={cls} type={type ?? 'button'} disabled={disabled} {...rest}>
          {children}
        </button>
      )}
    </Tooltip>
  )
})

export interface ButtonSetProps extends HTMLAttributes<HTMLDivElement> {
  /** Столбцом во всю ширину; без него — в ряд (на телефоне — одним рядом поровну). */
  stacked?: boolean
}

/**
 * Набор кнопок (Carbon: ButtonSet): дети — кнопки по порядку, главная — последней (правее второстепенной). Главная одна,
 * опасной рядом с главной нет — проверка в разработке. В строке списка набора нет.
 */
export function ButtonSet({ stacked = false, className, children, ...rest }: ButtonSetProps) {
  const inRow = useContext(RowContext)
  const nested = useContext(SetContext)
  rule(!inRow, 'в строке списка нет набора кнопок и главной кнопки (П5): действие строки — kind="ghost" или нажатие на строку')
  rule(!nested, 'набор кнопок внутри другого набора: у набора одна главная')
  const state = useRef<SetState>({ primaries: new Set(), dangers: new Set() })
  return (
    <SetContext.Provider value={state.current}>
      <div
        role="group"
        data-slot="button-set"
        data-stacked={stacked || undefined}
        className={cx('flex min-w-0 gap-items', stacked ? 'flex-col *:w-full' : 'flex-row flex-wrap items-center max-md:*:flex-1', className)}
        {...rest}
      >
        {children}
      </div>
    </SetContext.Provider>
  )
}
