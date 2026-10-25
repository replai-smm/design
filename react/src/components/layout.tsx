/**
 * Раскладка — единственный способ расставить блоки: Page → PageHeader → Section → Stack / Inline / Grid.
 * Отступ — роль шкалы (`gap="items"`), сетка — одна колонка на телефоне, больше — с 768 px.
 * `SurfaceProvider` — область, где одна главная кнопка (П5): страница, окно, карточка решения, своя область продукта.
 */
import { createContext, useContext, useId, useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import { cx, rule } from '../lib/cx'

/** Роль отступа (scale.json → space). */
export type Space = 'tight' | 'items' | 'compact' | 'blocks' | 'groups' | 'sections'
const GAP: Record<Space, string> = { tight: 'gap-tight', items: 'gap-items', compact: 'gap-compact', blocks: 'gap-blocks', groups: 'gap-groups', sections: 'gap-sections' }

interface BoxProps {
  as?: ElementType
  className?: string
  children?: ReactNode
  /** Подпись области для читалки (если `as` — section, nav, aside). */
  'aria-label'?: string
}

export interface StackProps extends BoxProps {
  /** Отступ между блоками; по умолчанию `blocks` (16). */
  gap?: Space
}

/** Блоки друг под другом. */
export function Stack({ as: Tag = 'div', gap = 'blocks', className, children, ...rest }: StackProps) {
  return (
    <Tag data-slot="stack" className={cx('flex min-w-0 flex-col', GAP[gap], className)} {...rest}>
      {children}
    </Tag>
  )
}

const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end', baseline: 'items-baseline' } as const
const JUSTIFY = { start: 'justify-start', between: 'justify-between', end: 'justify-end' } as const

export interface InlineProps extends BoxProps {
  /** Отступ между элементами; по умолчанию `items` (8). */
  gap?: Space
  align?: keyof typeof ALIGN
  justify?: keyof typeof JUSTIFY
  /** Переносить, когда не помещается (по умолчанию да — телефон первым). */
  wrap?: boolean
}

/** Элементы в строку. */
export function Inline({ as: Tag = 'div', gap = 'items', align = 'center', justify = 'start', wrap = true, className, children, ...rest }: InlineProps) {
  return (
    <Tag data-slot="inline" className={cx('flex min-w-0', GAP[gap], ALIGN[align], JUSTIFY[justify], wrap ? 'flex-wrap' : 'flex-nowrap', className)} {...rest}>
      {children}
    </Tag>
  )
}

const COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3' } as const

export interface GridProps extends BoxProps {
  gap?: Space
  /** Колонок на ноутбуке; на телефоне всегда одна. */
  columns?: keyof typeof COLS
}

/** Сетка поверхностей: одна колонка на телефоне, `columns` — на ноутбуке. */
export function Grid({ as: Tag = 'div', gap = 'blocks', columns = 3, className, children, ...rest }: GridProps) {
  return (
    <Tag data-slot="grid" className={cx('grid min-w-0 grid-cols-1', GAP[gap], COLS[columns], className)} {...rest}>
      {children}
    </Tag>
  )
}

/* ——— Область одной главной кнопки (П5) ——— */

interface Surface {
  name: string
  primaries: Set<string>
  bars: Set<string>
}
const SurfaceContext = createContext<Surface | null>(null)
export const useSurface = () => useContext(SurfaceContext)

/** Область, где одна главная кнопка: вторая `ActionArea primary` внутри — ошибка в разработке. */
export function SurfaceProvider({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<Surface>({ name, primaries: new Set(), bars: new Set() })
  return <SurfaceContext.Provider value={ref.current}>{children}</SurfaceContext.Provider>
}

export interface PageProps {
  /** Шапка страницы — `<PageHeader>`. */
  header: ReactNode
  /** Плашка беды системы (П11: одна на страницу) — `<Notification scope="page">`. */
  notice?: ReactNode
  children?: ReactNode
  className?: string
}

/** Страница: шапка, плашка, содержимое. Ширина — до 1280 px; поля — `blocks` на телефоне, `sections` на ноутбуке. */
export function Page({ header, notice, children, className }: PageProps) {
  return (
    <SurfaceProvider name="страница">
      <div data-slot="page" className={cx('mx-auto flex w-full max-w-page flex-col gap-groups px-blocks pt-groups md:px-sections', className)}>
        {header}
        <main className="flex min-w-0 flex-col gap-groups pb-sections">
          {notice}
          {children}
        </main>
      </div>
    </SurfaceProvider>
  )
}

export interface PageHeaderProps {
  /** О чём экран, а не «Админка». */
  title: ReactNode
  /** Одна строка: на какой вопрос отвечает экран. */
  description?: ReactNode
  /** Тихие действия шапки; главная кнопка — не здесь. */
  tools?: ReactNode
}

export function PageHeader({ title, description, tools }: PageHeaderProps) {
  const h1 = (
    <h1 data-part="title" className="m-0 min-w-0 text-page text-fg">
      {title}
    </h1>
  )
  return (
    <header data-slot="page-header" className="flex min-w-0 items-start justify-between gap-blocks">
      {description ? (
        <div className="flex min-w-0 flex-col gap-tight">
          {h1}
          <p className="m-0 max-w-prose text-body text-fg-muted">{description}</p>
        </div>
      ) : (
        h1
      )}
      {tools && <div className="flex shrink-0 items-center gap-items">{tools}</div>}
    </header>
  )
}

export interface BottomBarProps {
  children?: ReactNode
  className?: string
}

/**
 * Липкая полоса низа страницы — последним блоком `Page`: действия, которые нужны с любого места длинной страницы
 * (сохранить правки, «Назад — Далее» мастера). Одна на страницу: вторая — ошибка в разработке. Кнопки — `ActionArea`:
 * на ноутбуке группой слева (Carbon: кнопки формы на странице — слева), на телефоне одним рядом поровну. Над нижней
 * панелью продукта: её высоту продукт кладёт в `--ds-bottom-inset` на `:root`; полоску телефона полоса учитывает сама.
 */
export function BottomBar({ children, className }: BottomBarProps) {
  const surface = useSurface()
  const id = useId()
  const at = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    rule(!at.current?.nextElementSibling, 'липкая полоса — последним блоком страницы: под ней ничего нет, иначе она закроет то, что ниже')
  })
  useLayoutEffect(() => {
    if (!surface) return
    surface.bars.add(id)
    rule(surface.bars.size <= 1, `на поверхности «${surface.name}» вторая липкая полоса: одна на страницу`)
    return () => {
      surface.bars.delete(id)
    }
  }, [surface, id])
  return (
    <div
      ref={at}
      data-slot="bottom-bar"
      className={cx('ds-bottom-bar z-10 flex min-w-0 flex-col gap-compact border-t border-line bg-surface px-blocks pt-compact shadow-raised md:flex-row md:items-center md:gap-blocks', className)}
    >
      {children}
    </div>
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

/** Раздел страницы с заголовком уровня 2. */
export function Section({ title, description, tools, notice, children, className }: SectionProps) {
  return (
    <section data-slot="section" className={cx('flex min-w-0 flex-col gap-blocks', className)}>
      {(title || tools) && (
        <div className="flex min-w-0 items-end justify-between gap-blocks">
          <div className="flex min-w-0 flex-col gap-tight">
            {title && (
              <h2 data-part="title" className="m-0 text-title text-fg">
                {title}
              </h2>
            )}
            {description && <p className="m-0 max-w-prose text-body text-fg-muted">{description}</p>}
          </div>
          {tools && <div className="flex shrink-0 items-center gap-items">{tools}</div>}
        </div>
      )}
      {notice}
      {children}
    </section>
  )
}
