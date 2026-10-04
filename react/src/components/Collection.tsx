/**
 * Страница списка (шаблон CONCEPT §3.4): таблица `DataTable` и список `List` — одна логика, разный вид.
 * - Группы по статусу, срочное сверху (П2): опасно → внимание → нейтрально → хорошо; внутри — порядок данных.
 * - Норма не пишется (П3): группа «хорошо» свёрнута внизу, раскрывается за 0,6 с без прыжка.
 * - Состояния (П12): загрузка — скелет той же высоты строк (П13), ошибка, пусто (первый запуск, всё сделано,
 *   ничего не найдено, нет доступа), много — первые `pageSize` строк и «показать ещё».
 * - В строке главной кнопки нет (П5): действие строки — тихая кнопка или нажатие на строку (открыть панель деталей).
 * - На телефоне в таблице видны только колонки лица (`face`), остальные — в панели деталей.
 */
import { Fragment, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { rankOf, toneOf, type StatusId } from '../lib/status'
import { Button, RowContext } from './Button'
import { StatusBadge } from './StatusBadge'
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
}

export interface DataTableProps<T> extends CollectionProps<T> {
  columns: Column<T>[]
}

const track = (grow = 1) => (grow === 0 ? 'max-content' : `minmax(0, ${grow}fr)`)

export function DataTable<T>(props: DataTableProps<T>) {
  const { rows, columns, getKey, getStatus, statusLabel, state = 'ready', pageSize = 50, collapseHealthy = true, onRowClick, rowAction, label, className } = props
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
  const cellCls = (c: Column<T>) =>
    cx('flex min-h-12 min-w-0 items-center px-4 py-2 text-body-compact-01', c.align === 'end' && 'justify-end text-end', !c.face && 'ds-cell-more')

  const row = (r: T) => (
    <div
      key={getKey(r)}
      role="row"
      data-slot="row"
      className={cx('ds-row border-b border-border-subtle-01 bg-layer-01', onRowClick && 'cursor-pointer hover:bg-layer-hover-01')}
      onClick={onRowClick ? () => onRowClick(r) : undefined}
    >
      {columns.map((c, i) => (
        <div key={c.key} role="cell" className={cellCls(c)}>
          {i === 0 && onRowClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRowClick(r)
              }}
              className="min-w-0 cursor-pointer text-start text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus"
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

  return (
    <div data-slot="data-table" className={cx('flex min-w-0 flex-col', className)}>
      <div role="table" aria-label={label} aria-busy={state === 'loading' || undefined} aria-rowcount={state === 'loading' ? undefined : rows.length + 1} className="ds-table min-w-0 border-t border-border-subtle-01" style={vars}>
        <div role="rowgroup" className="ds-rowgroup">
          <div role="row" className="ds-row bg-layer-accent-01">
            {columns.map((c) => (
              <div key={c.key} role="columnheader" className={cx(cellCls(c), 'text-heading-compact-01 text-text-primary')}>
                {c.header}
              </div>
            ))}
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
                  <GroupHead
                    status={g.status}
                    count={g.rows.length}
                    label={statusLabel?.(g.status)}
                    toggle={collapseHealthy && g.healthy ? { open: healthyOpen, onClick: () => setHealthyOpen(!healthyOpen), controls: `${uid}-ok` } : undefined}
                  />
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
