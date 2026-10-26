/**
 * Таблица (Carbon: DataTable) — состояние строк и сортировки отдельно, вид — частями: `DataTable` отдаёт детям-функции
 * `{ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps, getCellProps, sortBy }`, а таблицу
 * собирают из `TableContainer`, `Table`, `TableHead`, `TableRow`, `TableHeader`, `TableBody`, `TableCell`.
 * - Строки — в порядке данных. Сортировка — выбор человека: `isSortable` у таблицы или у заголовка, нажатие по кругу
 *   NONE → ASC → DESC → NONE; сравнение — `sortRow` (по умолчанию как у Carbon: числа как числа, строки `localeCompare`).
 * - Строка — `TableRow`: главной кнопки в ней нет (П5) — только `kind="ghost"` и меню «…» (`OverflowMenu`);
 *   выбранная — `isSelected` (роль «выбрано»).
 * - Широкая не ужимается: не влезает — прокрутка вбок внутри `TableContainer`, первая колонка стоит.
 * - Загрузка — `DataTableSkeleton` той же формы; пусто и ошибка — `StateView` на месте таблицы (сборка — в истории).
 * Геттеры не отдают `key`: React 19 ругается на `key` в разворачивании — ключ ставят сами (`key={row.id}`).
 */
import { createContext, forwardRef, useContext, useId, useMemo, useState, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { SORT_STATES, type DataTableSortState, type Size } from '../lib/vocab'
import { RowContext } from './Button'
import { Icon } from './Icon'
import { SkeletonPlaceholder, SkeletonText } from './SkeletonText'

/* ——— состояние ——— */

export interface DataTableHeader {
  key: string
  header: ReactNode
  isSortable?: boolean
}

export interface DataTableCell<T = unknown> {
  id: string
  value: T
  isEditable: boolean
  isEditing: boolean
  isValid: boolean
  errors: null | Error[]
  info: { header: string }
}

export interface DataTableRow<T = unknown> {
  id: string
  cells: DataTableCell<T>[]
  disabled?: boolean
  isExpanded?: boolean
  isSelected?: boolean
}

/** Строка данных: `id` и значения по ключам заголовков. */
export type DataTableInputRow = { id: string; disabled?: boolean; isExpanded?: boolean; isSelected?: boolean } & Record<string, unknown>

export interface SortRowParams {
  key: string
  sortDirection: DataTableSortState
  sortStates: typeof SORT_STATES
  locale: string
  compare: (a: unknown, b: unknown, locale?: string) => number
}
export type SortRowFn = (cellA: unknown, cellB: unknown, options: SortRowParams) => number

export interface DataTableRenderProps {
  headers: DataTableHeader[]
  rows: DataTableRow[]
  getHeaderProps: (options: { header: DataTableHeader; isSortable?: boolean; onClick?: (event: MouseEvent<HTMLButtonElement>, sortState: { sortHeaderKey: string; sortDirection: DataTableSortState }) => void; [key: string]: unknown }) => TableHeaderProps & { id: string }
  getRowProps: (options: { row: DataTableRow; [key: string]: unknown }) => TableRowProps
  getTableProps: () => TableProps
  getTableContainerProps: () => Record<string, never>
  getCellProps: (options: { cell: DataTableCell; [key: string]: unknown }) => TableCellProps
  sortBy: (headerKey: string) => void
}

export interface DataTableProps {
  rows: DataTableInputRow[]
  headers: DataTableHeader[]
  children?: (props: DataTableRenderProps) => ReactElement
  render?: (props: DataTableRenderProps) => ReactElement
  /** Все заголовки сортируют (у заголовка — своё `isSortable`). */
  isSortable?: boolean
  sortRow?: SortRowFn
  locale?: string
  /** sm 32 · md 40 · lg 48; без него — 48 на телефоне, 40 на ноутбуке. */
  size?: Size
}

const asText = (v: unknown): string => {
  const child = (v as { props?: { children?: unknown } } | null)?.props?.children
  return typeof child === 'string' ? child : String(v ?? '')
}

/** Сравнение Carbon: числа как числа; строки — `localeCompare` (числовые — по числу); пустое — как пустая строка. */
function compare(a: unknown, b: unknown, locale = 'en'): number {
  const x = a ?? ''
  const y = b ?? ''
  if (typeof x === 'number' && typeof y === 'number') return x - y
  const sa = asText(x)
  const sb = asText(y)
  const numeric = !Number.isNaN(parseFloat(sa)) && !Number.isNaN(parseFloat(sb))
  return sa.localeCompare(sb, locale, { numeric })
}

const defaultSortRow: SortRowFn = (a, b, { sortDirection, locale, compare: cmp }) => (sortDirection === 'ASC' ? cmp(a, b, locale) : sortDirection === 'DESC' ? cmp(b, a, locale) : 0)

const NEXT: Record<DataTableSortState, DataTableSortState> = { NONE: 'ASC', ASC: 'DESC', DESC: 'NONE' }
const ARIA_SORT = { NONE: 'none', ASC: 'ascending', DESC: 'descending' } as const

/** Строки и сортировка таблицы; вид — детьми-функцией (Carbon: DataTable). */
export function DataTable({ rows: input, headers, children, render, isSortable = false, sortRow = defaultSortRow, locale = 'en', size }: DataTableProps) {
  const prefix = useId()
  const [sort, setSort] = useState<{ key: string | null; direction: DataTableSortState }>({ key: null, direction: 'NONE' })
  const headerId = (key: string) => `${prefix}-header-${key}`
  const rows = useMemo(() => {
    const out: DataTableRow[] = input.map((r) => ({
      id: r.id,
      disabled: r.disabled ?? false,
      isExpanded: r.isExpanded ?? false,
      isSelected: r.isSelected ?? false,
      cells: headers.map((h) => ({ id: `${r.id}:${h.key}`, value: r[h.key], isEditable: false, isEditing: false, isValid: true, errors: null, info: { header: h.key } })),
    }))
    const at = headers.findIndex((h) => h.key === sort.key)
    if (sort.direction === 'NONE' || at < 0) return out
    const params = { key: sort.key!, sortDirection: sort.direction, sortStates: SORT_STATES, locale, compare }
    return out.slice().sort((a, b) => sortRow(a.cells[at]!.value, b.cells[at]!.value, params))
  }, [input, headers, sort, sortRow, locale])
  const sortBy = (key: string) => setSort((s) => ({ key, direction: s.key === key ? NEXT[s.direction] : 'ASC' }))
  const props: DataTableRenderProps = {
    headers,
    rows,
    sortBy,
    getHeaderProps: ({ header, isSortable: own, onClick, ...rest }) => ({
      ...rest,
      id: headerId(header.key),
      isSortable: own ?? header.isSortable ?? isSortable,
      isSortHeader: sort.key === header.key,
      sortDirection: sort.key === header.key ? sort.direction : 'NONE',
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        const sortDirection = sort.key === header.key ? NEXT[sort.direction] : 'ASC'
        sortBy(header.key)
        onClick?.(event, { sortHeaderKey: header.key, sortDirection })
      },
    }),
    getRowProps: ({ row, ...rest }) => ({ ...rest, isSelected: row.isSelected, 'aria-disabled': row.disabled || undefined }),
    getTableProps: () => ({ size, isSortable }),
    getTableContainerProps: () => ({}),
    getCellProps: ({ cell, ...rest }) => ({ ...rest, headers: headerId(cell.info.header) }),
  }
  return (render ?? children)?.(props) ?? null
}

/* ——— части ——— */

const SizeContext = createContext<Size | undefined>(undefined)
const HEIGHT: Record<Size, string> = { sm: 'h-dense', md: 'h-control', lg: 'h-touch' }
const cellHeight = (size?: Size) => (size ? HEIGHT[size] : 'h-touch md:h-control')

export interface TableContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Заголовок над таблицей — её имя для читалки. */
  title?: ReactNode
  description?: ReactNode
}

/** Рамка таблицы с заголовком и прокруткой вбок (Carbon: TableContainer). */
export function TableContainer({ title, description, className, children, ...rest }: TableContainerProps) {
  const id = useId()
  return (
    <div data-slot="table-container" className={cx('flex min-w-0 flex-col gap-items', className)} {...rest}>
      {(title || description) && (
        <div className="flex flex-col gap-tight">
          {title && (
            <div id={`${id}-t`} data-part="title" className="text-heading text-fg">
              {title}
            </div>
          )}
          {description && <div className="text-body text-fg-muted">{description}</div>}
        </div>
      )}
      <TitleContext.Provider value={title ? `${id}-t` : undefined}>
        <div data-part="scroll" className="relative min-w-0 overflow-x-auto rounded-surface border border-line">
          {children}
        </div>
      </TitleContext.Provider>
    </div>
  )
}
const TitleContext = createContext<string | undefined>(undefined)

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** sm 32 · md 40 · lg 48; без него — 48 на телефоне, 40 на ноутбуке. */
  size?: Size
  isSortable?: boolean
}

/** Таблица (Carbon: Table). */
export function Table({ size, isSortable, className, children, ...rest }: TableProps) {
  const titled = useContext(TitleContext)
  return (
    <SizeContext.Provider value={size}>
      <table data-slot="table" data-sortable={isSortable || undefined} aria-labelledby={rest['aria-label'] ? undefined : titled} className={cx('ds-table w-full border-collapse text-body', className)} {...rest}>
        {children}
      </table>
    </SizeContext.Provider>
  )
}

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>

/** Строка в шапке — на холсте, в теле — на поверхности (первая колонка стоит и берёт цвет строки). */
const HeadContext = createContext(false)

/** Шапка таблицы (Carbon: TableHead). */
export function TableHead({ children, ...rest }: TableHeadProps) {
  return (
    <thead {...rest}>
      <HeadContext.Provider value>{children}</HeadContext.Provider>
    </thead>
  )
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

/** Строки таблицы (Carbon: TableBody). */
export function TableBody(props: TableBodyProps) {
  return <tbody {...props} />
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Выбранная строка — роль «выбрано». */
  isSelected?: boolean
}

/** Строка таблицы (Carbon: TableRow): в ней кнопки только `kind="ghost"`. */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ isSelected, className, children, ...rest }, ref) {
  const head = useContext(HeadContext)
  return (
    <tr ref={ref} data-slot="table-row" data-selected={isSelected || undefined} className={cx('border-b border-line', !head && 'last:border-b-0', isSelected ? 'bg-selected' : head ? 'bg-canvas' : 'bg-surface', className)} {...rest}>
      <RowContext.Provider value>{children}</RowContext.Provider>
    </tr>
  )
})

export interface TableHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  isSortable?: boolean
  isSortHeader?: boolean
  sortDirection?: DataTableSortState
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Заголовок колонки (Carbon: TableHeader): сортируемый — кнопка со знаком направления. */
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader(
  { isSortable = false, isSortHeader = false, sortDirection = 'NONE', onClick, scope = 'col', className, children, ...rest },
  ref,
) {
  const size = useContext(SizeContext)
  const active = isSortHeader && sortDirection !== 'NONE'
  return (
    <th ref={ref} scope={scope} aria-sort={isSortable ? ARIA_SORT[isSortHeader ? sortDirection : 'NONE'] : undefined} className={cx('px-compact text-start align-middle text-heading whitespace-nowrap text-fg', cellHeight(size), isSortable && 'p-0', className)} {...rest}>
      {isSortable ? (
        <button
          type="button"
          data-part="sort"
          onClick={onClick}
          className={cx('flex h-full w-full min-w-0 cursor-pointer items-center justify-between gap-items px-compact text-start text-heading text-fg hover:bg-hover', FOCUS)}
        >
          <span className="min-w-0">{children}</span>
          <Icon name={active ? (sortDirection === 'ASC' ? 'arrow-up' : 'arrow-down') : 'sort'} className={active ? 'text-fg' : 'text-fg-muted'} />
        </button>
      ) : (
        children
      )}
    </th>
  )
})

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>

/** Ячейка (Carbon: TableCell). */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ className, ...rest }, ref) {
  const size = useContext(SizeContext)
  return <td ref={ref} className={cx('px-compact align-middle', cellHeight(size), className)} {...rest} />
})

/* ——— загрузка ——— */

export interface DataTableSkeletonProps extends HTMLAttributes<HTMLTableElement> {
  /** Заголовки колонок — видны и во время загрузки. */
  headers?: Array<{ header: ReactNode; key?: string }>
  columnCount?: number
  rowCount?: number
  /** Место заголовка и описания над таблицей. */
  showHeader?: boolean
  /** Место панели инструментов над таблицей. */
  showToolbar?: boolean
  size?: Size
}

/** Место таблицы при загрузке — та же форма (Carbon: DataTableSkeleton). `aria-busy` — у области, которая грузит. */
export function DataTableSkeleton({ headers, columnCount = headers?.length ?? 5, rowCount = 5, showHeader = true, showToolbar = true, size, className, ...rest }: DataTableSkeletonProps) {
  const cols = Array.from({ length: columnCount }, (_, i) => i)
  return (
    <div data-slot="data-table-skeleton" className={cx('flex min-w-0 flex-col gap-items', className)}>
      {showHeader && (
        <div className="flex flex-col gap-tight">
          <SkeletonText heading width="33%" />
          <SkeletonText width="50%" />
        </div>
      )}
      {showToolbar && <SkeletonPlaceholder className="h-control w-full" />}
      <div className="relative min-w-0 overflow-x-auto rounded-surface border border-line">
        <Table size={size} {...rest}>
          <TableHead>
            <TableRow>
              {cols.map((i) => (
                <TableHeader key={headers?.[i]?.key ?? i}>{headers?.[i]?.header ?? <SkeletonText width="50%" />}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowCount }, (_, r) => (
              <TableRow key={r}>
                {cols.map((i) => (
                  <TableCell key={i}>
                    <SkeletonText width={i === 0 ? '75%' : '50%'} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
