/**
 * Оболочка продукта (Carbon: UI Shell — Header, HeaderName, HeaderMenuButton, HeaderGlobalBar, HeaderGlobalAction, HeaderPanel,
 * SideNav, SideNavItems, SideNavLink, SideNavDivider, SkipToContent). Конфигурация «шапка с левой панелью» (паттерн «Шапка и
 * навигация»): одна строка шапки на любой ширине, навигация продукта — столбиком слева.
 * - `Header` — шапка, всегда видна (липкая): слева кнопка меню · название · контекст продукта, справа (`HeaderGlobalBar`) — системное:
 *   кнопки-значки (`HeaderGlobalAction`) открывают панель (`HeaderPanel`), а не ведут в раздел.
 * - `SideNav` — левая панель продукта: от ширины `lg` (1024) стоит постоянно рядом с содержимым, уже — скрыта и открывается поверх
 *   страницы по `expanded` (затемнение под ней, Esc и нажатие мимо закрывают: `onOverlayClick`). `HeaderMenuButton isCollapsible` в шапке
 *   прячется там, где панель постоянна. Имена пунктов уходят в панель, а не распирают шапку.
 * - `SideNavLink` — пункт: ссылка (`href`) или действие (`onClick`, без `href` — `<button>`); открытый — `isActive` (`aria-current`).
 * - `SkipToContent` — первая ссылка страницы: «Перейти к основному содержимому» (WCAG 2.4.1).
 * Точка перелома — `lg` Tailwind (1024), одна на ДС (у Carbon 1056). Размер шапки — 48 px (`touch`), как цель пальца.
 */
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { FAST, FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Close, Menu } from '../lib/icons.gen'
import { IconButton } from './Button'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Имя ориентира `banner` для читалки — обязательно (у Carbon тоже). */
  'aria-label': string
  children?: ReactNode
}

/** Шапка продукта (Carbon: Header): липкая строка 48 px; не переносится — лишнее уходит в панели. */
export function Header({ className, children, ...rest }: HeaderProps) {
  return (
    <header data-slot="header" className={cx('sticky top-0 z-20 flex h-touch min-w-0 items-center gap-tight border-b border-line bg-surface px-tight text-fg', className)} {...rest}>
      {children}
    </header>
  )
}

export interface HeaderMenuButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Имя кнопки для читалки и подсказка: «Меню». */
  'aria-label': string
  /** Левая панель открыта — значок «закрыть». */
  isActive?: boolean
  /** Скрыть кнопку там, где левая панель постоянна (от `lg`). */
  isCollapsible?: boolean
}

/** Кнопка меню в шапке (Carbon: HeaderMenuButton): открывает левую панель, где она не постоянна. */
export function HeaderMenuButton({ 'aria-label': label, isActive = false, isCollapsible = false, className, ...rest }: HeaderMenuButtonProps) {
  return (
    <IconButton kind="ghost" size="lg" label={label} data-slot="header-menu-button" aria-expanded={isActive} className={cx(isCollapsible && 'lg:hidden', className)} {...rest}>
      {isActive ? <Close /> : <Menu />}
    </IconButton>
  )
}

export interface HeaderNameProps {
  /** Переход (название ведёт на главную страницу продукта и только туда); без него — действие `onClick`. */
  href?: string
  /** Приставка перед названием (Carbon: prefix) — тихим цветом. */
  prefix?: string
  onClick?(event: MouseEvent<HTMLElement>): void
  children?: ReactNode
  className?: string
}

const NAME = `inline-flex h-touch min-w-0 shrink-0 cursor-pointer items-center gap-tight rounded-control px-compact text-title text-fg no-underline hover:bg-hover ${FAST} ${FOCUS}`

/** Название продукта в шапке (Carbon: HeaderName): ссылка на главную или действие. */
export function HeaderName({ href, prefix, onClick, children, className }: HeaderNameProps) {
  const body = (
    <>
      {prefix && <span className="text-fg-muted">{prefix}</span>}
      {children}
    </>
  )
  return href !== undefined ? (
    <a data-slot="header-name" href={href} onClick={onClick} className={cx(NAME, className)}>
      {body}
    </a>
  ) : (
    <button data-slot="header-name" type="button" onClick={onClick} className={cx(NAME, className)}>
      {body}
    </button>
  )
}

/** Правая часть шапки (Carbon: HeaderGlobalBar): системные кнопки, прижаты к правому краю. */
export function HeaderGlobalBar({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="header-global-bar" className={cx('ml-auto flex shrink-0 items-center gap-tight', className)} {...rest}>
      {children}
    </div>
  )
}

export interface HeaderGlobalActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Имя кнопки для читалки и подсказка — обязательно. */
  'aria-label': string
  /** Открытая ею панель видна: кнопка выбрана. */
  isActive?: boolean
  /** Значок — компонент из входа пакета `/icons`, ребёнком: `<User />`. */
  children: ReactNode
}

/** Системное действие в шапке (Carbon: HeaderGlobalAction): значок, который открывает панель. */
export function HeaderGlobalAction({ 'aria-label': label, isActive = false, className, children, ...rest }: HeaderGlobalActionProps) {
  return (
    <IconButton kind="ghost" size="lg" label={label} data-slot="header-global-action" aria-pressed={isActive} className={cx(isActive && 'bg-selected', className)} {...rest}>
      {children}
    </IconButton>
  )
}

export interface HeaderPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Имя панели для читалки — обязательно. */
  'aria-label': string
  /** Панель открыта; закрытой в странице нет вовсе. */
  expanded?: boolean
  /** Esc закрывает (расширение: у Carbon закрытием ведёт продукт). */
  onClose?(): void
  children?: ReactNode
}

/** Правая панель шапки (Carbon: HeaderPanel): открывается кнопкой `HeaderGlobalAction` под шапкой, у правого края. */
export const HeaderPanel = forwardRef<HTMLElement, HeaderPanelProps>(function HeaderPanel({ expanded = false, onClose, onKeyDown, className, children, ...rest }, ref) {
  if (!expanded) return null
  const keys = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Escape') onClose?.()
  }
  return (
    <section ref={ref} data-slot="header-panel" onKeyDown={keys} className={cx('fixed right-0 top-touch z-30 w-popup max-w-full border-l border-line bg-surface shadow-overlay', className)} {...rest}>
      <div className="relative max-h-dvh overflow-y-auto p-blocks">{children}</div>
    </section>
  )
})

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Имя ориентира `navigation` для читалки — обязательно. */
  'aria-label': string
  /** Открыта поверх страницы там, где не постоянна (уже `lg`); от `lg` стоит всегда. */
  expanded?: boolean
  /** Нажатие на затемнение и Esc — закрыть. */
  onOverlayClick?(): void
  children?: ReactNode
}

/** Левая панель продукта (Carbon: SideNav): от `lg` — постоянно слева (липкая под шапкой), уже — поверх страницы по `expanded`. */
export function SideNav({ expanded = false, onOverlayClick, onKeyDown, className, children, ...rest }: SideNavProps) {
  const keys = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Escape') onOverlayClick?.()
  }
  return (
    <>
      {expanded && <div data-slot="side-nav-overlay" aria-hidden="true" onClick={onOverlayClick} className="fixed inset-x-0 bottom-0 top-touch z-20 bg-scrim lg:hidden" />}
      <nav
        data-slot="side-nav"
        data-expanded={expanded || undefined}
        onKeyDown={keys}
        className={cx(
          'w-rail max-w-full shrink-0 flex-col border-r border-line bg-surface lg:sticky lg:top-touch lg:flex lg:self-start',
          expanded ? 'fixed bottom-0 left-0 top-touch z-30 flex' : 'hidden',
          className,
        )}
        {...rest}
      >
        <div className="relative flex min-h-0 max-h-dvh flex-1 flex-col overflow-y-auto">{children}</div>
      </nav>
    </>
  )
}

/** Список пунктов левой панели (Carbon: SideNavItems). */
export function SideNavItems({ className, children, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul data-slot="side-nav-items" className={cx('m-0 flex list-none flex-col gap-tight p-items', className)} {...rest}>
      {children}
    </ul>
  )
}

export interface SideNavLinkProps {
  /** Переход по адресу; без него — действие `onClick` (`<button>`). */
  href?: string
  /** Открытый раздел: `aria-current="page"`, выбранная заливка. */
  isActive?: boolean
  /** Значок перед словом — компонент (`renderIcon={Add}`). */
  renderIcon?: ElementType
  onClick?(event: MouseEvent<HTMLElement>): void
  children?: ReactNode
  className?: string
}

const LINK = `flex min-h-touch w-full min-w-0 cursor-pointer items-center gap-items rounded-control px-compact text-start text-body text-fg no-underline hover:bg-hover ${FAST} ${FOCUS} lg:min-h-control`

/** Пункт левой панели (Carbon: SideNavLink): ссылка или действие; число или метка — ребёнком после слова. */
export function SideNavLink({ href, isActive = false, renderIcon: RenderIcon, onClick, children, className }: SideNavLinkProps) {
  const cls = cx(LINK, isActive && 'bg-selected font-semibold', className)
  const body = (
    <>
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
      {children}
    </>
  )
  return (
    <li data-slot="side-nav-link" className="m-0 list-none">
      {href !== undefined ? (
        <a href={href} onClick={onClick} aria-current={isActive ? 'page' : undefined} className={cls}>
          {body}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-current={isActive ? 'page' : undefined} className={cls}>
          {body}
        </button>
      )}
    </li>
  )
}

/** Разделитель групп пунктов (Carbon: SideNavDivider). */
export function SideNavDivider({ className, ...rest }: HTMLAttributes<HTMLLIElement>) {
  return <li data-slot="side-nav-divider" aria-hidden="true" className={cx('m-0 my-items list-none border-t border-line', className)} {...rest} />
}

export interface SkipToContentProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Куда ведёт: `id` основного содержимого. */
  href?: string
}

/** Ссылка «Перейти к основному содержимому» (Carbon: SkipToContent): первая в странице, видна только с клавиатуры. */
export function SkipToContent({ href = '#main-content', className, children = 'Перейти к основному содержимому', ...rest }: SkipToContentProps) {
  return (
    <a data-slot="skip-to-content" href={href} className={cx('sr-only focus:not-sr-only focus:fixed focus:left-tight focus:top-tight focus:z-40 focus:rounded-control focus:bg-surface focus:px-compact focus:py-items focus:text-body focus:text-accent focus:shadow-overlay', className)} {...rest}>
      {children}
    </a>
  )
}
