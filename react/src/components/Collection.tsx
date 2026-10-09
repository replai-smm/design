/**
 * Страница списка (шаблон CONCEPT §3.4): таблица `DataTable` и список `List` — одна логика, разный вид.
 * - Группы по статусу, срочное сверху (П2): опасно → внимание → нейтрально → хорошо; внутри — порядок данных.
 * - Норма не пишется (П3): группа «хорошо» свёрнута внизу, раскрывается за 0,6 с без прыжка.
 * - Состояния (П12): загрузка — скелет той же высоты строк (П13), ошибка, пусто (первый запуск, всё сделано,
 *   ничего не найдено, нет доступа), много — первые `pageSize` строк и «показать ещё».
 * - В строке главной кнопки нет (П5): действие строки — тихая кнопка или нажатие на строку (открыть панель деталей).
 * - На телефоне в таблице видны только колонки лица (`face`), остальные — в панели деталей.
 * - Широкая таблица (11–13 колонок денег) не ужимается до переноса чисел: колонка не уже самого длинного слова,
 *   `minWidth` — не уже шага шкалы и значение в одну строку; не влезает — таблица прокручивается по горизонтали внутри
 *   себя, первая колонка (и слово группы) стоит на месте.
 * - Сортировка по заголовку (`DataTable`, колонка с `sortValue`) — выбор человека, а не порядок продукта: без неё
 *   порядок данных; с ней строки переставляются внутри группы тона, группы срочного остаются сверху (П2 не ломается).
 */
import { Fragment, useId, useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { rankOf, toneOf, type StatusId } from '../lib/status'
import { Button, RowContext } from './Button'
import { StatusBadge } from './StatusBadge'
import { Tooltip } from './Tooltip'
import { Skeleton, StateView, type StateKind } from './StateView'

export interface CollectionProps<T> {
  rows: T[]
  getKey: (row: T) => string
  /** Статус строки — для групп «срочное сверху». Без него групп нет. */
  getStatus?: (row: T) => StatusId
  /** Слова групп — слова продукта вместо слов закона (тон остаётся). */
  statusLabel?: (id: StatusId) => string | undefined
  /** ready — данные; loading — скелет; error — ошибка с «Повторить». */
  state?: 'ready' | 'loading' | 'error'
  error?: { title: ReactNode; description?: ReactNode; onRetry?: () => void }
  /** Что показать, когда строк нет. */
  empty?: { kind: Exclude<StateKind, 'ошибка'>; title: ReactNode; description?: ReactNode; action?: ReactNode }
  /** Сколько строк показать до «показать ещё». */
  pageSize?: number
  /** Свернуть группу «хорошо» (П3). */
  collapseHealthy?: boolean
  /** Нажатие на строку — обычно открыть `<Drawer>` с деталями. */
  onRowClick?: (row: T) => void
  /** Тихие кнопки строки (ghost, tertiary). */
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
    return [...by.entries()]
      .sort(([a], [b]) => rankOf(a) - rankOf(b))
      .map(([status, rs]) => ({ status, rows: rs, healthy: toneOf(status) === 'хорошо' }))
  }, [rows, getStatus])
}

/** Сколько строк каждой группы показать при лимите `limit` (свёрнутая норма в лимит не входит). */
function budget<T>(groups: Group<T>[], limit: number, collapse: boolean): number[] {
  let left = limit
  return groups.map((g) => {
    if (collapse && g.healthy) return g.rows.length
    const n = Math.min(g.rows.length, Math.max(left, 0))
    left -= n
    return n
  })
}

function CollectionState<T>({ state, error, empty, rows }: Pick<CollectionProps<T>, 'state' | 'error' | 'empty' | 'rows'>) {
  if (state === 'error')
    return (
      <StateView
        kind="ошибка"
        title={error?.title ?? 'Не загрузилось'}
        description={error?.description}
        action={error?.onRetry && <Button variant="tertiary" onClick={error.onRetry}>Повторить</Button>}
      />
    )
  if (state !== 'loading' && rows.length === 0)
    return <StateView kind={empty?.kind ?? 'ничего не найдено'} title={empty?.title ?? 'Пусто'} description={empty?.description} action={empty?.action} />
  return null
}

function MoreButton({ hidden, onMore }: { hidden: number; onMore: () => void }) {
  return (
    <div className="flex justify-start pt-2">
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
      <span className="text-label-01 text-text-secondary">{count}</span>
    </>
  )
  if (!toggle) return <span className="inline-flex items-center gap-2">{inner}</span>
  return (
    <button
      type="button"
      aria-expanded={toggle.open}
      aria-controls={toggle.controls}
      onClick={toggle.onClick}
      className="inline-flex min-h-10 cursor-pointer items-center gap-2 px-1 hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
    >
      {inner}
      <svg viewBox="0 0 16 16" aria-hidden="true" className={cx('size-4 text-icon-primary transition-transform duration-move ease-move', toggle.open && 'rotate-180')}>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
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
  /**
   * Значение для сортировки — колонку можно сортировать нажатием на заголовок. Числа сравниваются как числа, строки —
   * по-русски (с числами внутри); `null`/`undefined` — всегда внизу, в любую сторону.
   */
  sortValue?: (row: T) => number | string | null | undefined
  /** Первое нажатие сортирует в эту сторону (по умолчанию по возрастанию); повторное — в обратную. */
  sortFirst?: SortDirection
  /**
   * Подсказка заголовка — что значит колонка («Факт минус план с даты пополнения до вчера»). Заголовок подчёркнут
   * пунктиром (Carbon DefinitionTooltip) и берёт фокус; подсказка — `Tooltip` ДС при наведении и фокусе, читалка слышит
   * её как описание заголовка. У сортируемой колонки подсказка — у той же кнопки сортировки (второй остановки Tab нет).
   */
  hint?: ReactNode
  /**
   * Не уже шага шкалы отступов (`09` 48 px · `10` 64 · `11` 80 · `12` 96 · `13` 160) и значение в одну строку — деньги
   * «12 000 ₽», даты. Сумма колонок не влезает — таблица прокручивается по горизонтали, первая колонка стоит.
   */
  minWidth?: ColumnMinWidth
}

/** Шаги шкалы отступов (scale.json → spacing) для `Column.minWidth`. */
export type ColumnMinWidth = '09' | '10' | '11' | '12' | '13'
const MIN_W: Record<ColumnMinWidth, string> = { '09': 'min-w-12', '10': 'min-w-16', '11': 'min-w-20', '12': 'min-w-24', '13': 'min-w-40' }

/** Направление — те же слова, что у `aria-sort`. */
export type SortDirection = 'ascending' | 'descending'
export interface SortState {
  key: string
  direction: SortDirection
}

export interface DataTableProps<T> extends CollectionProps<T> {
  columns: Column<T>[]
  /** Управляемая сортировка (`null` — порядок продукта). Без неё таблица держит сортировку сама с `defaultSort`. */
  sort?: SortState | null
  defaultSort?: SortState | null
  onSortChange?: (sort: SortState | null) => void
  /**
   * Приглушённая строка — неактивное, что всё же показываем (кабинет не крутится 10+ дней, не запускался): текст строки
   * вторым цветом (`text-secondary`, контраст ≥ 4,5:1 на слое и при наведении — тест токенов), фон и порядок те же.
   * Причину пишут словом в строке (статус) — цвет её не заменяет; спрятать такие строки — фильтр продукта.
   */
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

/** Строки по сортировке; порядок равных — как в данных (сортировка устойчивая). */
function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState | null): T[] {
  const get = sort ? columns.find((c) => c.key === sort.key)?.sortValue : undefined
  if (!sort || !get) return rows
  return rows
    .map((r, i) => ({ r, i, v: get(r) }))
    .sort((x, y) => compareSortValues(x.v, y.v, sort.direction) || x.i - y.i)
    .map((x) => x.r)
}

function SortIcon({ direction }: { direction?: SortDirection }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" data-slot="sort-icon" className={cx('size-4 shrink-0', direction ? 'text-icon-primary' : 'text-icon-secondary')}>
      {direction === 'ascending' ? (
        <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      ) : direction === 'descending' ? (
        <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <path d="M5 13V2M2.5 4.5 5 2l2.5 2.5M11 3v11M8.5 11.5 11 14l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      )}
    </svg>
  )
}

// колонка не уже самого длинного слова (min-content): не влезает — прокрутка, а не наезд текста и не колонка в ноль
const track = (grow = 1) => (grow === 0 ? 'max-content' : `minmax(min-content, ${grow}fr)`)

export function DataTable<T>(props: DataTableProps<T>) {
  const { rows: dataRows, columns, getKey, getStatus, statusLabel, state = 'ready', pageSize = 50, collapseHealthy = true, onRowClick, rowAction, rowMuted, label, className } = props
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
  const vars = { '--ds-cols': cols.join(' '), '--ds-cols-phone': (phoneCols.length ? phoneCols : cols.slice(0, 1)).join(' ') } as CSSProperties

  const stateView = <CollectionState state={state} error={props.error} empty={props.empty} rows={rows} />
  if (state === 'error' || (state === 'ready' && rows.length === 0)) return <div className={className}>{stateView}</div>

  const shown = budget(groups, limit, collapseHealthy)
  const hidden = groups.reduce((n, g, i) => n + (collapseHealthy && g.healthy ? 0 : g.rows.length - shown[i]), 0)
  const cellCls = (c: Column<T>, body = false) =>
    cx(
      'flex min-h-12 items-center px-4 py-2 text-body-compact-01',
      c.minWidth ? MIN_W[c.minWidth] : 'min-w-0',
      body && c.minWidth && 'whitespace-nowrap',
      c.align === 'end' && 'justify-end text-end',
      !c.face && 'ds-cell-more',
    )

  const row = (r: T) => {
    const muted = rowMuted?.(r) ?? false
    return (
      <div
        key={getKey(r)}
        role="row"
        data-slot="row"
        data-muted={muted || undefined}
        className={cx('ds-row border-b border-border-subtle-01 bg-layer-01', muted && 'text-text-secondary', onRowClick && 'cursor-pointer hover:bg-layer-hover-01')}
        onClick={onRowClick ? () => onRowClick(r) : undefined}
      >
        {columns.map((c, i) => (
          <div key={c.key} role="cell" className={cellCls(c, true)}>
            {i === 0 && onRowClick ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRowClick(r)
                }}
                className={cx('min-w-0 cursor-pointer text-start hover:underline focus-visible:outline-2 focus-visible:outline-focus', muted ? 'text-text-secondary' : 'text-text-primary')}
              >
                {c.cell(r)}
              </button>
            ) : (
              c.cell(r)
            )}
          </div>
        ))}
        {withAction && (
          <div role="cell" className="flex min-h-12 items-center justify-end gap-1 px-2" onClick={(e) => e.stopPropagation()}>
            <RowContext.Provider value>{rowAction!(r)}</RowContext.Provider>
          </div>
        )}
      </div>
    )
  }

  return (
    <div data-slot="data-table" className={cx('flex min-w-0 flex-col', className)}>
      <div data-slot="table-scroll" className="min-w-0 overflow-x-auto">
        <div role="table" aria-label={label} aria-busy={state === 'loading' || undefined} aria-rowcount={state === 'loading' ? undefined : rows.length + 1} className="ds-table min-w-min border-t border-border-subtle-01" style={vars}>
          <div role="rowgroup" className="ds-rowgroup">
            <div role="row" className="ds-row bg-layer-accent-01">
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
                  <div key={c.key} role="columnheader" aria-sort={active} className={cx(cellCls(c), 'text-heading-compact-01 text-text-primary', c.sortValue && 'px-0 py-0')}>
                    {c.sortValue ? (
                      withHint(
                        <button
                          type="button"
                          data-slot="sort"
                          aria-describedby={hintId}
                          onClick={() => setSort({ key: c.key, direction: active ? (active === 'ascending' ? 'descending' : 'ascending') : (c.sortFirst ?? 'ascending') })}
                          className={cx(
                            'flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2 px-4 py-2 text-heading-compact-01 text-text-primary hover:bg-layer-accent-hover-01 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                            c.align === 'end' ? 'justify-end text-end' : 'text-start',
                          )}
                        >
                          {title}
                          <SortIcon direction={active} />
                        </button>,
                      )
                    ) : c.hint ? (
                      withHint(
                        <button
                          type="button"
                          data-slot="column-hint"
                          aria-describedby={hintId}
                          className={cx('min-w-0 cursor-help text-heading-compact-01 text-text-primary focus-visible:outline-2 focus-visible:outline-focus', c.align === 'end' ? 'text-end' : 'text-start')}
                        >
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
                <div role="columnheader" className="flex min-h-12 items-center px-2">
                  <span className="sr-only">действия</span>
                </div>
              )}
            </div>
          </div>
          {state === 'loading' ? (
            <div role="rowgroup" className="ds-rowgroup" data-state="загрузка">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} role="row" className="ds-row border-b border-border-subtle-01 bg-layer-01">
                  {columns.map((c) => (
                    <div key={c.key} role="cell" className={cellCls(c)}>
                      <Skeleton width={c.face ? '3/4' : '1/2'} />
                    </div>
                  ))}
                  {withAction && <div role="cell" className="min-h-12" />}
                </div>
              ))}
            </div>
          ) : (
            groups.map((g, gi) => {
              const head = g.status && (
                <div role="row" className="ds-row bg-layer-01">
                  <div role="rowheader" className="flex min-h-12 items-center px-4 pt-4" style={{ gridColumn: '1 / -1' }}>
                    {/* слово группы стоит при прокрутке вбок, как первая колонка */}
                    <div className="sticky left-4">
                      <GroupHead
                        status={g.status}
                        count={g.rows.length}
                        label={statusLabel?.(g.status)}
                        toggle={collapseHealthy && g.healthy ? { open: healthyOpen, onClick: () => setHealthyOpen(!healthyOpen), controls: `${uid}-ok` } : undefined}
                      />
                    </div>
                  </div>
                </div>
              )
              if (collapseHealthy && g.healthy)
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
  /** Ключ открытой строки (её карточка видна рядом — «Сообщения», «Контент» DF): фон выбора и `aria-current`. */
  activeKey?: string | null
}

export function List<T>(props: ListProps<T>) {
  const { rows, renderRow, getKey, getStatus, statusLabel, state = 'ready', pageSize = 50, collapseHealthy = true, onRowClick, rowAction, label, className, activeKey } = props
  const groups = useGroups(rows, getStatus)
  const [limit, setLimit] = useState(pageSize)
  const [healthyOpen, setHealthyOpen] = useState(false)
  const uid = useId()

  const stateView = <CollectionState state={state} error={props.error} empty={props.empty} rows={rows} />
  if (state === 'error' || (state === 'ready' && rows.length === 0)) return <div className={className}>{stateView}</div>

  const item = (r: T) => {
    const key = getKey(r)
    const active = activeKey != null && key === activeKey
    return (
      <li key={key} data-slot="row" data-active={active || undefined} className={cx('flex min-h-12 items-center gap-2 border-b border-border-subtle-01', active ? 'bg-layer-selected-01' : 'bg-layer-01')}>
        {onRowClick ? (
          <button
            type="button"
            aria-current={active || undefined}
            onClick={() => onRowClick(r)}
            className={cx(
              'flex min-h-12 min-w-0 flex-1 cursor-pointer items-center px-4 py-2 text-start text-body-01 text-text-primary focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
              active ? 'hover:bg-layer-selected-hover-01' : 'hover:bg-layer-hover-01',
            )}
          >
            {renderRow(r)}
          </button>
        ) : (
          <div className="min-w-0 flex-1 px-4 py-2 text-body-01">{renderRow(r)}</div>
        )}
        {rowAction && (
          <div className="flex shrink-0 items-center gap-1 pr-2">
            <RowContext.Provider value>{rowAction(r)}</RowContext.Provider>
          </div>
        )}
      </li>
    )
  }

  if (state === 'loading')
    return (
      <div data-slot="list" data-state="загрузка" role="status" aria-busy="true" aria-label={label} className={className}>
        <span className="sr-only">загрузка</span>
        <ul className="m-0 list-none border-t border-border-subtle-01 p-0">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex min-h-12 items-center border-b border-border-subtle-01 bg-layer-01 px-4 py-2">
              <Skeleton width={i % 2 ? '1/2' : '3/4'} />
            </li>
          ))}
        </ul>
      </div>
    )

  const shown = budget(groups, limit, collapseHealthy)
  const hidden = groups.reduce((n, g, i) => n + (collapseHealthy && g.healthy ? 0 : g.rows.length - shown[i]), 0)
  return (
    <div data-slot="list" className={cx('flex min-w-0 flex-col gap-2', className)}>
      <div role="group" aria-label={label} className="flex flex-col gap-2">
        {groups.map((g, gi) => {
          const healthy = collapseHealthy && g.healthy
          if (!healthy && shown[gi] === 0) return null
          return (
            <Fragment key={g.status ?? gi}>
              <section data-group={g.status ?? undefined} aria-label={g.status ? (statusLabel?.(g.status) ?? undefined) : undefined} className="flex flex-col gap-1">
                {g.status && (
                  <GroupHead
                    status={g.status}
                    count={g.rows.length}
                    label={statusLabel?.(g.status)}
                    toggle={healthy ? { open: healthyOpen, onClick: () => setHealthyOpen(!healthyOpen), controls: `${uid}-ok` } : undefined}
                  />
                )}
                {healthy ? (
                  <div id={`${uid}-ok`} className="ds-expand" data-open={healthyOpen} inert={!healthyOpen}>
                    <div>
                      <ul className="m-0 list-none border-t border-border-subtle-01 p-0">{g.rows.map(item)}</ul>
                    </div>
                  </div>
                ) : (
                  <ul className="m-0 list-none border-t border-border-subtle-01 p-0">{g.rows.slice(0, shown[gi]).map(item)}</ul>
                )}
              </section>
            </Fragment>
          )
        })}
      </div>
      {hidden > 0 && <MoreButton hidden={hidden} onMore={() => setLimit(limit + pageSize)} />}
    </div>
  )
}
