/**
 * Раскладка: Page → PageHeader → Section → Stack / Inline / Grid + Column. Имена и свойства — как у Carbon (Stack, Grid,
 * Column, Section, PageHeader); Inline, Page, SurfaceProvider и BottomBar — наши, пары в Carbon нет.
 * Отступ — шаг шкалы Carbon spacing (`gap={5}` = 16 px, роль `blocks`): 2 tight 4 · 3 items 8 · 4 compact 12 · 5 blocks 16 ·
 * 6 groups 24 · 7 sections 32. Сетка — 16 колонок Carbon: 4 на телефоне, 8 с 768 px, 16 с 1024 px.
 * `SurfaceProvider` — область, где одна главная кнопка (П5): страница, окно, карточка решения, своя область продукта.
 */
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cx, rule } from '../lib/cx'

/** Шаг шкалы отступов Carbon (spacing-02 … spacing-07) — те, у которых есть роль scale.json → space. */
export type SpacingStep = 2 | 3 | 4 | 5 | 6 | 7
const GAP: Record<SpacingStep, string> = { 2: 'gap-tight', 3: 'gap-items', 4: 'gap-compact', 5: 'gap-blocks', 6: 'gap-groups', 7: 'gap-sections' }
const gapOf = (gap: SpacingStep | undefined) => {
  rule(gap === undefined || gap in GAP, `шага отступа ${String(gap)} нет: шаги — 2 · 3 · 4 · 5 · 6 · 7 (4 … 32 px)`)
  return gap === undefined ? undefined : GAP[gap]
}

interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
}

export interface StackProps extends BoxProps {
  /** Шаг шкалы отступов между блоками; без него — без отступа (как у Carbon). */
  gap?: SpacingStep
  /** Столбиком (по умолчанию) или в ряд без переноса. */
  orientation?: 'horizontal' | 'vertical'
}

/** Блоки столбиком или в ряд с отступом-шагом (Carbon: Stack). */
export function Stack({ as: Tag = 'div', gap, orientation = 'vertical', className, children, ...rest }: StackProps) {
  return (
    <Tag data-slot="stack" data-orientation={orientation} className={cx(orientation === 'horizontal' ? 'inline-grid grid-flow-col' : 'flex min-w-0 flex-col', gapOf(gap), className)} {...rest}>
      {children}
    </Tag>
  )
}

const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end', baseline: 'items-baseline' } as const
const JUSTIFY = { start: 'justify-start', between: 'justify-between', end: 'justify-end' } as const

export interface InlineProps extends BoxProps {
  /** Шаг шкалы отступов между элементами; по умолчанию 3 (8 px). */
  gap?: SpacingStep
  align?: keyof typeof ALIGN
  justify?: keyof typeof JUSTIFY
  /** Переносить, когда не помещается (по умолчанию да — телефон первым). */
  wrap?: boolean
}

/** Элементы в строку с переносом и выравниванием — у Carbon Stack в ряд не переносится, поэтому пары нет. */
export function Inline({ as: Tag = 'div', gap = 3, align = 'center', justify = 'start', wrap = true, className, children, ...rest }: InlineProps) {
  return (
    <Tag data-slot="inline" className={cx('flex min-w-0', gapOf(gap), ALIGN[align], JUSTIFY[justify], wrap ? 'flex-wrap' : 'flex-nowrap', className)} {...rest}>
      {children}
    </Tag>
  )
}

export interface GridProps extends BoxProps {
  /** Промежуток колонок 16 px вместо 32 (Carbon: narrow). */
  narrow?: boolean
  /** Промежуток между рядами — как между колонками (Carbon: withRowGap). */
  withRowGap?: boolean
}

/** Сетка Carbon: 4 колонки на телефоне, 8 с 768 px, 16 с 1024 px; промежуток 32 px, `narrow` — 16. Дети — `Column`. */
export function Grid({ as: Tag = 'div', narrow = false, withRowGap = false, className, children, ...rest }: GridProps) {
  return (
    <Tag
      data-slot="grid"
      className={cx('grid min-w-0 grid-cols-4 md:grid-cols-8 lg:grid-cols-16', narrow ? 'gap-x-blocks' : 'gap-x-sections', withRowGap && (narrow ? 'gap-y-blocks' : 'gap-y-sections'), className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Ширина колонки: число колонок или доля сетки своей ширины экрана (Carbon: ColumnSpan). */
export type ColumnSpan = number | '25%' | '50%' | '75%' | '100%'

// классы целиком: Tailwind видит только целые имена
const SM = ['', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12', 'col-span-13', 'col-span-14', 'col-span-15', 'col-span-16']
const MD = ['', 'md:col-span-1', 'md:col-span-2', 'md:col-span-3', 'md:col-span-4', 'md:col-span-5', 'md:col-span-6', 'md:col-span-7', 'md:col-span-8', 'md:col-span-9', 'md:col-span-10', 'md:col-span-11', 'md:col-span-12', 'md:col-span-13', 'md:col-span-14', 'md:col-span-15', 'md:col-span-16']
const LG = ['', 'lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4', 'lg:col-span-5', 'lg:col-span-6', 'lg:col-span-7', 'lg:col-span-8', 'lg:col-span-9', 'lg:col-span-10', 'lg:col-span-11', 'lg:col-span-12', 'lg:col-span-13', 'lg:col-span-14', 'lg:col-span-15', 'lg:col-span-16']
const COLUMNS = { sm: 4, md: 8, lg: 16 } as const

function spanClass(at: keyof typeof COLUMNS, span: ColumnSpan | undefined): string | undefined {
  if (span === undefined) return undefined
  const n = typeof span === 'number' ? span : (COLUMNS[at] * Number(span.slice(0, -1))) / 100
  rule(Number.isInteger(n) && n >= 1 && n <= 16, `Column: ширина «${String(span)}» — от 1 до 16 колонок или 25% · 50% · 75% · 100%`)
  return { sm: SM, md: MD, lg: LG }[at][n]
}

export interface ColumnProps extends BoxProps {
  /** Колонок на телефоне (из 4). */
  sm?: ColumnSpan
  /** Колонок с 768 px (из 8). */
  md?: ColumnSpan
  /** Колонок с 1024 px (из 16). */
  lg?: ColumnSpan
  /** Колонок на любой ширине. */
  span?: ColumnSpan
}

/** Колонка сетки (Carbon: Column): без ширины — во всю строку. */
export function Column({ as: Tag = 'div', sm, md, lg, span, className, children, ...rest }: ColumnProps) {
  const base = spanClass('sm', sm) ?? (span === undefined ? 'col-span-full' : typeof span === 'number' ? SM[span] : spanClass('sm', span))
  const wide = span !== undefined && typeof span !== 'number' ? { md: spanClass('md', span), lg: spanClass('lg', span) } : {}
  return (
    <Tag data-slot="column" className={cx('min-w-0', base, spanClass('md', md) ?? wide.md, spanClass('lg', lg) ?? wide.lg, className)} {...rest}>
      {children}
    </Tag>
  )
}

/* ——— Уровень заголовка (Carbon: Section + Heading) ——— */

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
const HeadingContext = createContext<HeadingLevel>(1)
/** Уровень заголовка в этом месте: 1 вне разделов, каждый `Section` — на один глубже (до 6). */
export const useHeadingLevel = () => useContext(HeadingContext)

export type SectionProps<E extends ElementType = 'section'> = { as?: E; level?: HeadingLevel } & Omit<ComponentPropsWithoutRef<E>, 'as'>

/**
 * Раздел (Carbon: Section): поднимает уровень `Heading` внутри на один (или ставит `level`). Своего облика нет: заголовок —
 * `<Heading>`, описание и инструменты раздела — детьми; отступы — `as={Stack} gap={5}` или `Stack` внутри.
 */
export function Section<E extends ElementType = 'section'>({ as, level, ...rest }: SectionProps<E>) {
  const parent = useHeadingLevel()
  const Tag: ElementType = as ?? 'section'
  return (
    <HeadingContext.Provider value={Math.min(level ?? parent + 1, 6) as HeadingLevel}>
      <Tag data-slot="section" {...rest} />
    </HeadingContext.Provider>
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

/** Область, где одна главная кнопка: вторая `Button kind="primary"` внутри — ошибка в разработке. */
export function SurfaceProvider({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<Surface>({ name, primaries: new Set(), bars: new Set() })
  return <SurfaceContext.Provider value={ref.current}>{children}</SurfaceContext.Provider>
}

export interface PageProps {
  /** Шапка страницы — `<PageHeader>`. */
  header: ReactNode
  /** Плашка беды системы (П11: одна на страницу) — над содержимым. */
  notice?: ReactNode
  children?: ReactNode
  className?: string
  /** На высоту окна: короткая страница тянется до низа, липкая полоса (`BottomBar`) стоит у нижнего края. */
  fill?: boolean
}

/** Страница: шапка, плашка, содержимое. Резиновая: предела ширины нет, содержимое занимает всё место; поля — `blocks` на телефоне, `sections` от md. */
export function Page({ header, notice, children, className, fill = false }: PageProps) {
  return (
    <SurfaceProvider name="страница">
      <div data-slot="page" className={cx('flex w-full flex-col gap-groups px-blocks pt-groups md:px-sections', fill && 'min-h-dvh', className)}>
        {header}
        <main className={cx('flex min-w-0 flex-col gap-groups pb-sections', fill && 'flex-1')}>
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
  /** Одна строка: на какой вопрос отвечает экран (Carbon: subtitle). */
  subtitle?: ReactNode
  /** Тихие действия шапки; главная кнопка — не здесь (Carbon: pageActions). */
  pageActions?: ReactNode
}

/** Шапка страницы (Carbon: PageHeader): заголовок уровня 1, строка под ним, действия справа. */
export function PageHeader({ title, subtitle, pageActions }: PageHeaderProps) {
  const h1 = (
    <h1 data-part="title" className="m-0 min-w-0 text-page text-fg">
      {title}
    </h1>
  )
  return (
    <header data-slot="page-header" className="flex min-w-0 items-start justify-between gap-blocks">
      {subtitle ? (
        <div className="flex min-w-0 flex-col gap-tight">
          {h1}
          <p className="m-0 max-w-prose text-body text-fg-muted">{subtitle}</p>
        </div>
      ) : (
        h1
      )}
      {pageActions && <div className="flex shrink-0 items-center gap-items">{pageActions}</div>}
    </header>
  )
}

export interface BottomBarProps {
  children?: ReactNode
  className?: string
}

/**
 * Липкая полоса низа страницы — последним блоком `Page`: действия, которые нужны с любого места длинной страницы
 * (сохранить правки, «Назад — Далее» мастера). Одна на страницу: вторая — ошибка в разработке. Кнопки — `ButtonSet`
 * (главная — последней, правее второстепенной); на ноутбуке группа слева (Carbon: кнопки формы на странице — слева), на
 * телефоне одним рядом поровну. Над нижней панелью продукта: её высоту продукт кладёт в `--ds-bottom-inset` на `:root`;
 * полоску телефона полоса учитывает сама.
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
