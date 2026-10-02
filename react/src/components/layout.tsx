/**
 * Примитивы раскладки — единственный способ расставить блоки (CONCEPT §3.4: «примитивы раскладки»).
 * Отступы — только шаги Carbon (`--cds-spacing-01…13`), сетка — 1 колонка на телефоне, больше — с 768 px.
 * Своих margin и gap в экранах нет: экран собирается из Page → PageHeader → Section → Stack / Inline / Grid.
 */
import { createContext, useContext, useRef, type ElementType, type ReactNode } from 'react'
import { cx } from '../lib/cx'

/** Шаг отступа Carbon: 01 = 2px … 05 = 16px … 13 = 160px (design/scale.json → spacing). */
export type Space = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13'
const gapVar = (s: Space) => `var(--cds-spacing-${s})`

interface BoxProps {
  as?: ElementType
  className?: string
  children?: ReactNode
  /** Подпись области для читалки экрана (если `as` — section, nav, aside). */
  'aria-label'?: string
}

export interface StackProps extends BoxProps {
  /** Шаг между блоками. По умолчанию 05 (16px). */
  gap?: Space
}

/** Блоки друг под другом. */
export function Stack({ as: Tag = 'div', gap = '05', className, children, ...rest }: StackProps) {
  return (
    <Tag data-slot="stack" className={cx('flex min-w-0 flex-col', className)} style={{ gap: gapVar(gap) }} {...rest}>
      {children}
    </Tag>
  )
}

const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end', baseline: 'items-baseline' } as const
const JUSTIFY = { start: 'justify-start', between: 'justify-between', end: 'justify-end' } as const

export interface InlineProps extends BoxProps {
  gap?: Space
  align?: keyof typeof ALIGN
  justify?: keyof typeof JUSTIFY
  /** Переносить на новую строку, когда не помещается (по умолчанию да — телефон первым). */
  wrap?: boolean
}

/** Элементы в строку. */
export function Inline({ as: Tag = 'div', gap = '03', align = 'center', justify = 'start', wrap = true, className, children, ...rest }: InlineProps) {
  return (
    <Tag
      data-slot="inline"
      className={cx('flex min-w-0', ALIGN[align], JUSTIFY[justify], wrap ? 'flex-wrap' : 'flex-nowrap', className)}
      style={{ gap: gapVar(gap) }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const COLS = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const

export interface GridProps extends BoxProps {
  gap?: Space
  /** Колонок на ноутбуке (1280). На телефоне (390) всегда одна. */
  columns?: keyof typeof COLS
}

/** Сетка карточек: одна колонка на телефоне, `columns` — на ноутбуке. */
export function Grid({ as: Tag = 'div', gap = '05', columns = 3, className, children, ...rest }: GridProps) {
  return (
    <Tag data-slot="grid" className={cx('grid min-w-0 grid-cols-1', COLS[columns], className)} style={{ gap: gapVar(gap) }} {...rest}>
      {children}
    </Tag>
  )
}

/* ——— Поверхность: страница или открытая панель. На поверхности одна главная кнопка (П5). ——— */

interface Surface {
  name: string
  primaries: Set<string>
}
export const SurfaceContext = createContext<Surface | null>(null)
export const useSurface = () => useContext(SurfaceContext)

export function SurfaceProvider({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<Surface>({ name, primaries: new Set() })
  return <SurfaceContext.Provider value={ref.current}>{children}</SurfaceContext.Provider>
}

export interface PageProps {
  /** Шапка страницы — `<PageHeader>`. */
  header: ReactNode
  /** Действия страницы — `<ActionArea placement="bottom">`: на телефоне — нижняя полоса, на ноутбуке — под шапкой слева. */
  actions?: ReactNode
  /** Плашка беды системы (П11: одна на страницу) — `<Notification scope="page">`. */
  notice?: ReactNode
  children?: ReactNode
  className?: string
}

/** Страница: шапка, плашка, действия, содержимое. Ширина содержимого — до 1280 px, поля — шаг 05 (16 px). */
export function Page({ header, actions, notice, children, className }: PageProps) {
  return (
    <SurfaceProvider name="страница">
      <div data-slot="page" data-ds-surface="страница" className={cx('mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 md:px-8', className)}>
        {header}
        <main className="flex min-w-0 flex-col gap-6 pb-8">
          {notice}
          {actions && <div className="max-md:sticky max-md:bottom-0 max-md:z-10 max-md:order-last">{actions}</div>}
          {children}
        </main>
      </div>
    </SurfaceProvider>
  )
}

export interface PageHeaderProps {
  title: ReactNode
  /** Одна строка: на какой вопрос отвечает экран (П1). */
  description?: ReactNode
  /** Ссылка «назад». На телефоне в шапке — только название, «назад» и «⋯» (П6). */
  back?: { href: string; label?: string }
  /** Тихие действия шапки (ghost-кнопки, «⋯»). Главная кнопка — не здесь, а в `Page actions`. */
  tools?: ReactNode
  /** Метка статуса страницы, если есть. */
  status?: ReactNode
}

export function PageHeader({ title, description, back, tools, status }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className="flex flex-col gap-2">
      {back && (
        <a
          href={back.href}
          className="inline-flex min-h-8 w-fit items-center gap-1 text-body-compact-01 text-link-primary hover:text-link-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span aria-hidden="true">←</span>
          {back.label ?? 'назад'}
        </a>
      )}
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-heading-04 text-text-primary">{title}</h1>
            {status}
          </div>
          {description && <p className="m-0 max-w-prose text-body-01 text-text-secondary">{description}</p>}
        </div>
        {tools && <div className="flex shrink-0 items-center gap-2">{tools}</div>}
      </div>
    </header>
  )
}

export interface SectionProps {
  title?: ReactNode
  description?: ReactNode
  /** Тихие действия раздела справа от заголовка. */
  tools?: ReactNode
  /** Плашка беды списка (П11) — над содержимым раздела. */
  notice?: ReactNode
  children?: ReactNode
  className?: string
}

/** Раздел страницы с заголовком. Заголовок — уровень 2 (под h1 страницы). */
export function Section({ title, description, tools, notice, children, className }: SectionProps) {
  return (
    <section data-slot="section" className={cx('flex min-w-0 flex-col gap-4', className)}>
      {(title || tools) && (
        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            {title && <h2 className="m-0 text-heading-03 text-text-primary">{title}</h2>}
            {description && <p className="m-0 max-w-prose text-body-01 text-text-secondary">{description}</p>}
          </div>
          {tools && <div className="flex shrink-0 items-center gap-2">{tools}</div>}
        </div>
      )}
      {notice}
      {children}
    </section>
  )
}
