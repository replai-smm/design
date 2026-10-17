/**
 * Кнопка и область действий. «Одна главная на область» (П5) держит сам API:
 * - у `<Button>` главного вида нет — главную рисует только `<ActionArea primary={…}>`, у области она одна;
 * - на поверхности (страница, окно, карточка решения) одна область с главной — вторая даёт ошибку в разработке;
 * - в строке списка главной нет: `<ActionArea>` в строке — ошибка, кнопки строки — только `ghost`;
 * - опасное не стоит рядом с главным (П10).
 * Виды: главная — инверсия (чёрная в светлой, белая в тёмной); `secondary` — тихая с рамкой; `ghost` — без рамки
 * (инструмент, строка, значок); `tone="опасно"` — рамка и слово цвета тона. Высота — 48 на телефоне и 40
 * на ноутбуке; `dense` — 32 (строка, шапка, лента чата). На телефоне главная — во всю ширину (П6).
 */
import { Children, createContext, forwardRef, isValidElement, useContext, useId, useLayoutEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { CONTROL, DENSE, FAST, FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Icon, type IconName } from './Icon'
import { useSurface } from './layout'
import type { Tone } from '../lib/vocab'

export type ButtonVariant = 'secondary' | 'ghost'
type AnyVariant = 'primary' | ButtonVariant

const VARIANT: Record<AnyVariant, string> = {
  primary: 'border border-inverse bg-inverse text-fg-inverse hover:border-inverse-hover hover:bg-inverse-hover',
  secondary: 'border border-line-strong bg-transparent text-fg hover:bg-hover',
  ghost: 'border border-transparent bg-transparent text-fg hover:bg-hover',
}
/** Опасное действие — тон «опасно»: рамка и слово цвета тона, подложка тона под указателем. */
const DANGER = 'border border-danger bg-transparent text-danger-fg hover:bg-danger-bg'
const BASE =
  `inline-flex items-center justify-center gap-items rounded-control text-body whitespace-nowrap cursor-pointer ${FAST} ${FOCUS} ` +
  'disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-fg-disabled ' +
  'aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-transparent aria-disabled:text-fg-disabled'

/** Строка списка: главной кнопки нет (П5), кнопки — только `ghost`. */
export const RowContext = createContext(false)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Опасное действие (удалить, отключить): облик тона «опасно»; рядом с главной — нельзя (П10). */
  tone?: Extract<Tone, 'опасно'>
  /** 32 px везде: строка, шапка, лента. Без него — 48 на телефоне, 40 на ноутбуке. */
  dense?: boolean
  /** Правило Карты, которое разрешает действие (П15): R-34. Пишется в data-rule. */
  rule?: string
  /** Идёт действие: кнопка не нажимается, читалка слышит «занято». */
  loading?: boolean
  /** Отрисовать ребёнка (ссылку) видом кнопки. */
  asChild?: boolean
  /** Значок перед словом; без слова — квадратная кнопка-значок (нужен `aria-label`). */
  icon?: IconName
}

const ButtonBase = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'> & { variant?: AnyVariant }>(function ButtonBase(
  { variant = 'secondary', tone, dense, rule: ruleId, loading, asChild, icon, className, children, disabled, type, ...rest },
  ref,
) {
  const square = Boolean(icon) && (children === undefined || children === null)
  rule(!square || Boolean(rest['aria-label']), 'у кнопки-значка нет aria-label: читалка не узнает, что она делает')
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-tone={tone ? 'danger' : undefined}
      data-rule={ruleId}
      className={cx(BASE, tone ? DANGER : VARIANT[variant], dense ? DENSE : CONTROL, square ? (dense ? 'w-dense' : 'w-touch md:w-control') : dense ? 'px-compact' : 'px-blocks', className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      type={asChild ? undefined : (type ?? 'button')}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon && <Icon name={icon} />}
          {children}
        </>
      )}
    </Comp>
  )
})

/** Кнопка без главного вида. Главная — только через `<ActionArea primary>`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'secondary', ...props }, ref) {
  const inRow = useContext(RowContext)
  rule(!inRow || (variant === 'ghost' && !props.tone), `в строке списка кнопка только ghost, а не «${props.tone ?? variant}» (П5)`)
  return <ButtonBase ref={ref} variant={variant} {...props} />
})

export interface PrimaryAction extends Omit<ButtonProps, 'variant' | 'tone' | 'children' | 'icon'> {
  label: ReactNode
}

export interface ActionAreaProps {
  /** Единственная главная кнопка области. */
  primary?: PrimaryAction
  /** Остальные действия: `<Button variant="secondary|ghost">`. */
  children?: ReactNode
  /** stack — на телефоне столбцом, главная внизу во всю ширину (П6); row — всегда в ряд, главная справа (строка поля чата). */
  layout?: 'stack' | 'row'
  /** Подпись группы для читалки: «Действия формы». */
  label?: string
  className?: string
}

const AreaContext = createContext(false)

export function ActionArea({ primary, children, layout = 'stack', label = 'Действия', className }: ActionAreaProps) {
  const inRow = useContext(RowContext)
  const nested = useContext(AreaContext)
  const surface = useSurface()
  const id = useId()
  rule(!inRow, 'в строке списка нет области действий и главной кнопки (П5): действие строки — ghost-кнопка или нажатие на строку')
  rule(!nested, 'область действий внутри другой области: у области одна главная кнопка')
  if (primary) {
    const danger = Children.toArray(children).some((c) => isValidElement<ButtonProps>(c) && c.props.tone === 'опасно')
    rule(!danger, 'опасное действие рядом с главным (П10): унесите его в меню «…» или в окно подтверждения')
  }
  useLayoutEffect(() => {
    if (!primary || !surface) return
    surface.primaries.add(id)
    rule(surface.primaries.size <= 1, `на поверхности «${surface.name}» вторая главная кнопка (П5): одна главная на состояние экрана`)
    return () => {
      surface.primaries.delete(id)
    }
  }, [primary ? 1 : 0, surface, id])
  const row = layout === 'row'
  const main = primary && (() => {
    const { label: word, className: own, ...props } = primary
    return (
      <ButtonBase variant="primary" {...props} className={cx(row ? 'ml-auto' : 'max-md:w-full', own)}>
        {word}
      </ButtonBase>
    )
  })()
  return (
    <AreaContext.Provider value>
      <div
        role="group"
        aria-label={label}
        data-slot="action-area"
        data-layout={layout}
        className={cx(row ? 'flex flex-row flex-wrap items-center gap-items' : 'flex flex-col-reverse gap-items md:flex-row md:flex-wrap md:items-center', className)}
      >
        {!row && main}
        {children}
        {row && main}
      </div>
    </AreaContext.Provider>
  )
}
