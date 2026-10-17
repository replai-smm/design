/**
 * Коллекция строк: таблица `DataTable` и список `List` — одна логика, разный вид.
 * - Группы по статусу, срочное сверху (П2): опасно → внимание → инфо → нейтрально → хорошо; внутри — порядок данных.
 * - Норма не пишется (П3): группа «хорошо» свёрнута внизу, раскрывается за 0,6 с без прыжка.
 * - Состояния (П12): загрузка — скелет той же высоты строк, ошибка с «Повторить», пусто (`empty`), много — первые
 *   `pageSize` и «показать ещё».
 * - В строке главной кнопки нет (П5): действие строки — ghost-кнопка или нажатие на строку (`onSelect`).
 * - Выбранная строка (`selectedKey`) — роль «выбрано» и `aria-current`; одно «выбрано» на всю ДС.
 * - Таблица: на телефоне видны колонки лица (`face`); широкая не ужимается — колонка не уже самого длинного слова,
 *   `nowrap` — значение в одну строку (деньги); не влезает — прокрутка вбок внутри таблицы, первая колонка стоит.
 *   Сортировка по заголовку (`sortValue`) — выбор человека: строки переставляются внутри группы тона, срочное сверху.
 */
import { useId, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { rankOf, toneOf, type DataState, type EmptyView, type ErrorView, type StatusId } from '../lib/vocab'
import { Button, RowContext } from './Button'
import { Icon } from './Icon'
import { Skeleton } from './Skeleton'
import { StateView } from './StateView'
import { StatusBadge } from './StatusBadge'
import { Tooltip } from './Tooltip'

export interface CollectionProps<T> {
  rows: T[]
  getKey: (row: T) => string
  /** Статус строки — для групп «срочное сверху». Без него групп нет. */
  getStatus?: (row: T) => StatusId
  /** Слова групп — слова продукта вместо слов закона (тон остаётся). */
  statusLabel?: (id: StatusId) => string | undefined
  state?: DataState
  error?: ErrorView
  empty?: EmptyView
  /** Сколько строк показать до «показать ещё». */
  pageSize?: number
  /** Нажатие на строку: открыть её карточку рядом или окно. */
  onSelect?: (row: T) => void
  /** Ключ выбранной строки (её карточка видна рядом). */
  selectedKey?: string | null
  /** Тихие кнопки строки (ghost). */
  rowAction?: (row: T) => ReactNode
  /** Подпись таблицы или списка для читалки. */
  label: string
  className?: string
}

interface Group<T> {
  status: StatusId | null
  rows: T[]
  healthy: boolean
}

function useGroups<T>(rows: T[], getStatus?: (r: T) => StatusId): Group<T>[] {
  return useMemo(() => {
    if (!getStatus) return [{ status: null, rows, healthy: false }]
    const by = new Map<StatusId, T[]>()
    for (const r of rows) {
      const s = getStatus(r)
      if (!by.has(s)) by.set(s, [])
      by.get(s)!.push(r)
    }
    return [...by.entries()].sort(([a], [b]) => rankOf(a) - rankOf(b)).map(([status, rs]) => ({ status, rows: rs, healthy: toneOf(status) === 'хорошо' }))
  }, [rows, getStatus])
}

/** Сколько строк каждой группы показать при лимите `limit` (свёрнутая норма в лимит не входит). */
function budget<T>(groups: Group<T>[], limit: number): number[] {
  let left = limit
  return groups.map((g) => {
    if (g.healthy) return g.rows.length
    const n = Math.min(g.rows.length, Math.max(left, 0))
    left -= n
    return n
  })
}

function CollectionState<T>({ state, error, empty, rows }: Pick<CollectionProps<T>, 'state' | 'error' | 'empty' | 'rows'>) {
  if (state === 'error')
    return <StateView kind="ошибка" title={error?.title ?? 'Не загрузилось'} description={error?.description} action={error?.onRetry && <Button onClick={error.onRetry}>Повторить</Button>} />
  if (state !== 'loading' && rows.length === 0) return <StateView kind={empty?.kind ?? 'ничего не найдено'} title={empty?.title ?? 'Пусто'} description={empty?.description} action={empty?.action} />
  return null
}

function MoreButton({ hidden, onMore }: { hidden: number; onMore: () => void }) {
  return (
    <div className="flex justify-start pt-items">
      <Button variant="ghost" onClick={onMore} data-slot="show-more">
        показать ещё · {hidden}
      </Button>
    </div>
  )
}

function GroupHead({ status, count, label, toggle }: { status: StatusId; count: number; label?: string; toggle?: { open: boolean; onClick: () => void; controls: string } }) {
  const inner = (
    <>
      <StatusBadge status={status} label={label} />
      <span className="text-caption text-fg-muted">{count}</span>
    </>
  )
  if (!toggle) return <span className="inline-flex items-center gap-items">{inner}</span>
  return (
    <button type="button" aria-expanded={toggle.open} aria-controls={toggle.controls} onClick={toggle.onClick} className={cx('inline-flex min-h-dense cursor-pointer items-center gap-items rounded-control px-tight hover:bg-hover', FOCUS)}>
      {inner}
      <Icon name="chevron-down" className={cx('transition-transform duration-move ease-standard', toggle.open && 'rotate-180')} />
    </button>
  )
}

/* ——— Таблица ——— */

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  /** Колонка лица — видна и на телефоне. Остальные с 768 px. */
  face?: boolean
  /** Доля ширины (fr). По умолчанию 1; 0 — по содержимому. */
  grow?: number
  align?: 'start' | 'end'
  /** Значение в одну строку: деньги «12 000 ₽», даты. Колонка не уже значения; не влезает — таблица прокручивается вбок. */
  nowrap?: boolean
  /** Значение для сортировки — заголовок становится кнопкой. Пустое — внизу в обе стороны. */
  sortValue?: (row: T) => number | string | null | undefined
  /** Первое нажатие сортирует в эту сторону (по умолчанию по возрастанию). */
  sortFirst?: SortDirection
  /** Что значит колонка: заголовок с пунктиром, подсказка при наведении и фокусе; читалка — как описание. */
  hint?: ReactNode
}

/** Направление — те же слова, что у `aria-sort`. */
export type SortDirection = 'ascending' | 'descending'
export interface SortState {
  key: string
  direction: SortDirection
}

export interface DataTableProps<T> extends CollectionProps<T> {
  columns: Column<T>[]
  /** Управляемая сортировка (`null` — порядок данных); без неё таблица держит сортировку сама. */
  sort?: SortState | null
  defaultSort?: SortState | null
  onSortChange?: (sort: SortState | null) => void
  /** Приглушённая строка — неактивное, что всё же показываем: текст вторым цветом, причина — словом в строке. */
  rowMuted?: (row: T) => boolean
}

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' })

type SortValue = number | string | null | undefined
const isEmpty = (v: SortValue) => v == null || v === '' || (typeof v === 'number' && Number.isNaN(v))

/** Сравнение значений сортировки: пустое — в конце при любом направлении; число раньше строки. */
export function compareSortValues(a: SortValue, b: SortValue, direction: SortDirection): number {
  const ea = isEmpty(a)
  const eb = isEmpty(b)
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1
  const sign = direction === 'ascending' ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * sign
  if (typeof a === 'number') return -sign
  if (typeof b === 'number') return sign
  return collator.compare(String(a), String(b)) * sign
}

function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState | null): T[] {
  const get = sort ? columns.find((c) => c.key === sort.key)?.sortValue : undefined
  if (!sort || !get) return rows
  return rows
    .map((r, i) => ({ r, i, v: get(r) }))
    .sort((x, y) => compareSortValues(x.v, y.v, sort.direction) || x.i - y.i)
    .map((x) => x.r)
}

// колонка не уже самого длинного слова (min-content): не влезает — прокрутка, а не наезд текста
const track = (grow = 1) => (grow === 0 ? 'max-content' : `minmax(min-content, ${grow}fr)`)

export function DataTable<T>(props: DataTableProps<T>) {
  const { rows: dataRows, columns, getKey, getStatus, statusLabel, state = 'ready', pageSize = 50, onSelect, selectedKey, rowAction, rowMuted, label, className } = props
  const [sort, setSort] = useControllable<SortState | null>(props.sort, props.defaultSort ?? null, props.onSortChange)
  // сортируем до групп: группы срочного стоят на месте (П2), внутри группы — порядок, выбранный человеком
  const rows = useMemo(() => sortRows(dataRows, columns, sort), [dataRows, columns, sort])
  const groups = useGroups(rows, getStatus)
  const [limit, setLimit] = useState(pageSize)
  const [healthyOpen, setHealthyOpen] = useState(false)
  const uid = useId()
  const withAction = Boolean(rowAction)
  const cols = [...columns.map((c) => track(c.grow)), ...(withAction ? ['max-content'] : [])]
  const phoneCols = [...columns.filter((c) => c.face).map((c) => track(c.grow)), ...(withAction ? ['max-content'] : [])]
  const vars = { '--table-cols': cols.join(' '), '--table-cols-phone': (phoneCols.length ? phoneCols : cols.slice(0, 1)).join(' ') } as CSSProperties

  const stateView = <CollectionState state={state} error={props.error} empty={props.empty} rows={rows} />
  if (state === 'error' || (state === 'ready' && rows.length === 0)) return <div className={className}>{stateView}</div>

  const shown = budget(groups, limit)
  const hidden = groups.reduce((n, g, i) => n + (g.healthy ? 0 : g.rows.length - shown[i]), 0)
  const cellCls = (c: Column<T>) => cx('flex min-h-touch items-center px-compact py-items text-body md:min-h-control', c.nowrap ? 'whitespace-nowrap' : 'min-w-0', c.align === 'end' && 'justify-end text-end', !c.face && 'ds-cell-more')

  const row = (r: T) => {
    const key = getKey(r)
    const muted = rowMuted?.(r) ?? false
    const selected = selectedKey != null && key === selectedKey
    return (
      <div
        key={key}
        role="row"
        data-slot="row"
        data-muted={muted || undefined}
        data-selected={selected || undefined}
        className={cx('ds-row border-b border-line', selected ? 'bg-selected' : 'bg-surface', muted && 'text-fg-muted', onSelect && 'cursor-pointer hover:bg-hover')}
        onClick={onSelect ? () => onSelect(r) : undefined}
      >
        {columns.map((c, i) => (
          <div key={c.key} role="cell" className={cellCls(c)}>
            {i === 0 && onSelect ? (
              <button
                type="button"
                aria-current={selected || undefined}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(r)
                }}
                className={cx('min-w-0 cursor-pointer rounded-control text-start hover:underline', FOCUS, muted ? 'text-fg-muted' : 'text-fg')}
              >
                {c.cell(r)}
              </button>
            ) : (
              c.cell(r)
            )}
          </div>
        ))}
        {withAction && (
          <div role="cell" className="flex min-h-touch items-center justify-end gap-tight px-items md:min-h-control" onClick={(e) => e.stopPropagation()}>
            <RowContext.Provider value>{rowAction!(r)}</RowContext.Provider>
          </div>
        )}
      </div>
    )
  }

  return (
    <div data-slot="data-table" className={cx('flex min-w-0 flex-col', className)}>
      <div data-part="scroll" className="relative min-w-0 overflow-x-auto rounded-surface border border-line">
        <div role="table" aria-label={label} aria-busy={state === 'loading' || undefined} aria-rowcount={state === 'loading' ? undefined : rows.length + 1} className="ds-table min-w-min" style={vars}>
          <div role="rowgroup" className="ds-rowgroup">
            <div role="row" className="ds-row border-b border-line bg-canvas">
              {columns.map((c) => {
                const active = c.sortValue && sort?.key === c.key ? sort.direction : undefined
                const hintId = c.hint ? `${uid}-hint-${c.key}` : undefined
                const title = <span className={cx('min-w-0', Boolean(c.hint) && 'underline decoration-dotted underline-offset-4')}>{c.header}</span>
                const withHint = (trigger: ReactElement) =>
                  c.hint ? (
                    <>
                      <Tooltip content={c.hint}>{trigger}</Tooltip>
                      <span id={hintId} hidden>
                        {c.hint}
                      </span>
                    </>
                  ) : (
                    trigger
                  )
                return (
                  <div key={c.key} role="columnheader" aria-sort={active} className={cx(cellCls(c), 'text-heading text-fg', c.sortValue && 'p-0')}>
                    {c.sortValue ? (
                      withHint(
                        <button
                          type="button"
                          data-part="sort"
                          aria-describedby={hintId}
                          onClick={() => setSort({ key: c.key, direction: active ? (active === 'ascending' ? 'descending' : 'ascending') : (c.sortFirst ?? 'ascending') })}
                          className={cx('flex min-h-touch w-full min-w-0 cursor-pointer items-center gap-items px-compact py-items text-heading text-fg hover:bg-hover md:min-h-control', FOCUS, c.align === 'end' ? 'justify-end text-end' : 'text-start')}
                        >
                          {title}
                          <Icon name={active === 'ascending' ? 'arrow-up' : active === 'descending' ? 'arrow-down' : 'sort'} className={active ? 'text-fg' : 'text-fg-muted'} />
                        </button>,
                      )
                    ) : c.hint ? (
                      withHint(
                        <button type="button" data-part="hint" aria-describedby={hintId} className={cx('min-w-0 cursor-help rounded-control text-heading text-fg', FOCUS, c.align === 'end' ? 'text-end' : 'text-start')}>
                          {title}
                        </button>,
                      )
                    ) : (
                      c.header
                    )}
                  </div>
                )
              })}
              {withAction && (
                <div role="columnheader" className="flex items-center px-items">
                  <span className="sr-only">действия</span>
                </div>
              )}
            </div>
          </div>
          {state === 'loading' ? (
            <div role="rowgroup" className="ds-rowgroup" data-state="загрузка">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} role="row" className="ds-row border-b border-line bg-surface">
                  {columns.map((c) => (
                    <div key={c.key} role="cell" className={cellCls(c)}>
                      <Skeleton width={c.face ? '3/4' : '1/2'} />
                    </div>
                  ))}
                  {withAction && <div role="cell" />}
                </div>
              ))}
            </div>
          ) : (
            groups.map((g, gi) => {
              const head = g.status && (
                <div role="row" className="ds-row bg-surface">
                  <div role="rowheader" className="flex items-center px-compact pt-blocks pb-tight" style={{ gridColumn: '1 / -1' }}>
                    {/* слово группы стоит при прокрутке вбок, как первая колонка */}
                    <div className="sticky left-compact">
                      <GroupHead
                        status={g.status}
                        count={g.rows.length}
                        label={statusLabel?.(g.status)}
                        toggle={g.healthy ? { open: healthyOpen, onClick: () => setHealthyOpen(!healthyOpen), controls: `${uid}-ok` } : undefined}
                      />
                    </div>
                  </div>
                </div>
              )
              if (g.healthy)
                return (
                  <div key={g.status ?? gi} role="rowgroup" className="ds-rowgroup" data-group={g.status}>
                    {head}
                    <div id={`${uid}-ok`} className="ds-expand" data-open={healthyOpen} inert={!healthyOpen}>
                      <div>{g.rows.map(row)}</div>
                    </div>
                  </div>
                )
              if (shown[gi] === 0) return null
              return (
                <div key={g.status ?? gi} role="rowgroup" className="ds-rowgroup" data-group={g.status ?? undefined}>
                  {head}
                  {g.rows.slice(0, shown[gi]).map(row)}
                </div>
              )
            })
          )}
        </div>
      </div>
      {hidden > 0 && state === 'ready' && <MoreButton hidden={hidden} onMore={() => setLimit(limit + pageSize)} />}
    </div>
  )
}

/* ——— Список ——— */

export interface ListProps<T> extends CollectionProps<T> {
  renderRow: (row: T) => ReactNode
}

export function List<T>(props: ListProps<T>) {
  const { rows, renderRow, getKey, getStatus, statusLabel, state = 'ready', pageSize = 50, onSelect, selectedKey, rowAction, label, className } = props
  const groups = useGroups(rows, getStatus)
  const [limit, setLimit] = useState(pageSize)
  const [healthyOpen, setHealthyOpen] = useState(false)
  const uid = useId()

  const stateView = <CollectionState state={state} error={props.error} empty={props.empty} rows={rows} />
  if (state === 'error' || (state === 'ready' && rows.length === 0)) return <div className={className}>{stateView}</div>

  const item = (r: T) => {
    const key = getKey(r)
    const selected = selectedKey != null && key === selectedKey
    return (
      <li key={key} data-slot="row" data-selected={selected || undefined} className={cx('flex min-h-touch items-center gap-items border-b border-line last:border-b-0 md:min-h-control', selected ? 'bg-selected' : 'bg-surface')}>
        {onSelect ? (
          <button
            type="button"
            aria-current={selected || undefined}
            onClick={() => onSelect(r)}
            className={cx('flex min-h-touch min-w-0 flex-1 cursor-pointer items-center px-compact py-items text-start text-body text-fg hover:bg-hover md:min-h-control', FOCUS)}
          >
            {renderRow(r)}
          </button>
        ) : (
          <div className="min-w-0 flex-1 px-compact py-items text-body">{renderRow(r)}</div>
        )}
        {rowAction && (
          <div className="flex shrink-0 items-center gap-tight pr-items">
            <RowContext.Provider value>{rowAction(r)}</RowContext.Provider>
          </div>
        )}
      </li>
    )
  }
  const ul = (children: ReactNode) => <ul className="m-0 list-none overflow-hidden rounded-surface border border-line p-0">{children}</ul>

  if (state === 'loading')
    return (
      <div data-slot="list" data-state="загрузка" role="status" aria-busy="true" aria-label={label} className={className}>
        <span className="sr-only">загрузка</span>
        {ul(
          Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex min-h-touch items-center border-b border-line bg-surface px-compact py-items last:border-b-0 md:min-h-control">
              <Skeleton width={i % 2 ? '1/2' : '3/4'} />
            </li>
          )),
        )}
      </div>
    )

  const shown = budget(groups, limit)
  const hidden = groups.reduce((n, g, i) => n + (g.healthy ? 0 : g.rows.length - shown[i]), 0)
  return (
    <div data-slot="list" className={cx('flex min-w-0 flex-col gap-items', className)}>
      <div role="group" aria-label={label} className="flex flex-col gap-blocks">
        {groups.map((g, gi) => {
          if (!g.healthy && shown[gi] === 0) return null
          return (
            <section key={g.status ?? gi} data-group={g.status ?? undefined} aria-label={g.status ? statusLabel?.(g.status) : undefined} className="flex flex-col gap-items">
              {g.status && (
                <GroupHead
                  status={g.status}
                  count={g.rows.length}
                  label={statusLabel?.(g.status)}
                  toggle={g.healthy ? { open: healthyOpen, onClick: () => setHealthyOpen(!healthyOpen), controls: `${uid}-ok` } : undefined}
                />
              )}
              {g.healthy ? (
                <div id={`${uid}-ok`} className="ds-expand" data-open={healthyOpen} inert={!healthyOpen}>
                  <div>{ul(g.rows.map(item))}</div>
                </div>
              ) : (
                ul(g.rows.slice(0, shown[gi]).map(item))
              )}
            </section>
          )
        })}
      </div>
      {hidden > 0 && <MoreButton hidden={hidden} onMore={() => setLimit(limit + pageSize)} />}
    </div>
  )
}
