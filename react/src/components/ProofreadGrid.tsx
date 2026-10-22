/**
 * Сетка статуса «строка × колонка» (DF «Вычитка»: сообщество × день; Статистика: проект × месяц) — настоящая таблица.
 * - Тон клетки — словарь тонов. Смысл клетки здесь — сам статус (план выполнен · сверх плана · недобор · пропуск),
 *   поэтому клетка залита тоном (`FILL`: роли `tones.*.fill`) — читается с одного взгляда. Это исключение по смыслу,
 *   названное в реестре (`registry.json → fill`): вне сетки статуса подложка — только у «опасно» и «внимание».
 *   Без тона — значение без заливки; `quiet` — впереди, тихим текстом. Читалка слышит слово клетки (`word`), не только
 *   цвет; отметка «возможен перенос» — черта снизу (`note`).
 * - Первая колонка и шапка стоят при прокрутке (`stickyHeader`, по умолчанию да); выходные в шапке — тише (`muted`).
 * - Колонки без тона (`plain`: итоги) — просто значение; колонка денег (`money`) — вправо, в одну строку;
 *   разница в клетке (`delta`) — `Delta` без тона; итог-строка (`totals`) — `<tfoot>`, стоит внизу.
 * - Нажатие на строку — `onSelect`, выбранная — `selectedKey` (роль «выбрано»). Много — `pageSize` и «показать ещё».
 * Легенда — `GridLegend` (те же заливки и слова); день развёрнутым — `StatusRow` (та же заливка строкой).
 * Состояния: загрузка, ошибка, пусто, много.
 */
import { useState, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { TONE, type DataState, type EmptyView, type ErrorView, type Tone } from '../lib/vocab'
import { Button } from './Button'
import { Delta, type DeltaProps } from './Delta'
import { Loading, Skeleton } from './Skeleton'
import { StateView } from './StateView'

export interface GridColumn {
  key: string
  /** Шапка: число дня. */
  label: ReactNode
  /** Вторая строка шапки: день недели. */
  sub?: ReactNode
  /** Полная подпись для читалки: «понедельник, 6 октября». */
  title?: string
  /** Выходной — тише в шапке. */
  muted?: boolean
  /** Колонка без тона (итоги): клетка — значение. */
  plain?: boolean
  /** Колонка денег: шире, значение вправо, в одну строку. */
  money?: boolean
}

export interface GridCell {
  value?: ReactNode
  tone?: Tone
  /** Впереди (будущий день): тихий текст, без тона. */
  quiet?: boolean
  /** Слово клетки для читалки: «пропуск», «в норме». */
  word?: string
  /** Отметка «возможен перенос» — черта снизу. */
  note?: boolean
  /** Подсказка при наведении и для читалки. */
  hint?: string
  /** Разница рядом с числом, без тона. */
  delta?: DeltaProps
}

export interface ProofreadGridProps<R> {
  /** Подпись таблицы: «Посты по дням, октябрь». */
  label: string
  /** Шапка колонки строк: «Сообщество». */
  rowHeader: ReactNode
  columns: GridColumn[]
  rows: R[]
  getKey: (row: R) => string
  renderRowHeader: (row: R) => ReactNode
  getCell: (row: R, column: GridColumn) => GridCell
  onSelect?: (row: R) => void
  selectedKey?: string | null
  noteLabel?: string
  /** Легенда над сеткой — `<GridLegend>`. */
  legend?: ReactNode
  pageSize?: number
  /** Шапка стоит при прокрутке вниз: рамка не выше экрана. По умолчанию да. */
  stickyHeader?: boolean
  /** Итог-строка внизу: подпись и значение каждой колонки (без тона). */
  totals?: { label: ReactNode; getCell: (column: GridColumn) => GridCell }
  state?: DataState
  error?: ErrorView
  empty?: EmptyView
  className?: string
}

/** Заливка статуса: роли `*-fill` словаря тонов (tokens.json → tones.*.fill). Только сетка статуса — этот файл. */
export const FILL: Record<Tone, string | null> = {
  опасно: 'bg-danger-fill',
  решение: 'bg-decision-fill',
  внимание: 'bg-warning-fill',
  инфо: null,
  нейтрально: 'bg-neutral-fill',
  хорошо: 'bg-success-fill',
}

/** Облик клетки и строки статуса: заливка тона и основной текст; без тона и впереди — без заливки, тихим текстом. */
const toneLook = ({ tone, quiet }: { tone?: Tone; quiet?: boolean }) => {
  if (quiet || !tone) return 'bg-surface text-fg-muted'
  return cx(FILL[tone] ?? 'bg-surface', 'text-fg')
}

const cellBase = 'h-control min-w-control px-tight text-center align-middle text-caption tabular-nums border-l border-line'
const MONEY = 'px-compact text-end whitespace-nowrap'

function CellValue({ cell }: { cell: GridCell }) {
  if (!cell.delta) return <>{cell.value}</>
  return (
    <span className="inline-flex items-baseline gap-items">
      {cell.value}
      <Delta tone={false} {...cell.delta} />
    </span>
  )
}

export function ProofreadGrid<R>({
  label,
  rowHeader,
  columns,
  rows,
  getKey,
  renderRowHeader,
  getCell,
  onSelect,
  selectedKey,
  noteLabel = 'возможен перенос',
  legend,
  pageSize = 50,
  stickyHeader = true,
  totals,
  state = 'ready',
  error,
  empty,
  className,
}: ProofreadGridProps<R>) {
  const [limit, setLimit] = useState(pageSize)
  if (state === 'error')
    return (
      <div data-slot="proofread-grid" className={className}>
        <StateView kind="ошибка" title={error?.title ?? 'Сетка не загрузилась'} description={error?.description} action={error?.onRetry && <Button onClick={error.onRetry}>Повторить</Button>} />
      </div>
    )
  if (state === 'ready' && rows.length === 0)
    return (
      <div data-slot="proofread-grid" className={className}>
        <StateView kind={empty?.kind ?? 'ничего не найдено'} title={empty?.title ?? 'Строк нет'} description={empty?.description} action={empty?.action} />
      </div>
    )

  const loading = state === 'loading'
  const shown = loading ? [] : rows.slice(0, limit)
  const hidden = loading ? 0 : rows.length - shown.length
  const table = (
    <div
      data-sticky-header={stickyHeader || undefined}
      className={cx('relative min-w-0 overflow-x-auto rounded-surface border border-line', stickyHeader && 'max-h-dvh overflow-y-auto', FOCUS)}
      tabIndex={0}
      role="region"
      aria-label={`${label}: прокрутка`}
    >
      <table aria-label={label} aria-busy={loading || undefined} className="w-max min-w-full border-collapse bg-surface text-fg">
        <thead>
          <tr>
            <th scope="col" className={cx('sticky left-0 bg-canvas px-compact text-start text-heading whitespace-nowrap', stickyHeader ? 'top-0 z-30' : 'z-10')}>
              {rowHeader}
            </th>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                data-muted={c.muted || undefined}
                className={cx('h-touch min-w-control border-l border-line bg-canvas px-tight text-center font-normal', c.muted ? 'text-fg-muted' : 'text-fg', stickyHeader && 'sticky top-0 z-20', c.money && MONEY)}
              >
                {c.title && <span className="sr-only">{c.title}</span>}
                <span aria-hidden={c.title ? true : undefined} className={cx('flex flex-col', c.money ? 'items-end' : 'items-center')}>
                  <span className="text-heading">{c.label}</span>
                  {c.sub && <span className="text-caption">{c.sub}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="sticky left-0 bg-surface px-compact text-start">
                    <Skeleton width="3/4" />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={cellBase}>
                      <Skeleton className="mx-auto" width="1/2" />
                    </td>
                  ))}
                </tr>
              ))
            : shown.map((r) => {
                const key = getKey(r)
                const selected = selectedKey != null && key === selectedKey
                return (
                  <tr key={key} data-slot="row" data-selected={selected || undefined} className="border-t border-line">
                    <th scope="row" className={cx('sticky left-0 z-10 max-w-rail px-compact text-start text-body font-normal', selected ? 'bg-selected' : 'bg-surface')}>
                      {onSelect ? (
                        <button type="button" aria-current={selected || undefined} onClick={() => onSelect(r)} className={cx('flex min-h-control w-full min-w-0 cursor-pointer items-center rounded-control text-start text-fg hover:underline', FOCUS)}>
                          <span className="truncate">{renderRowHeader(r)}</span>
                        </button>
                      ) : (
                        <span className="block truncate">{renderRowHeader(r)}</span>
                      )}
                    </th>
                    {columns.map((c) => {
                      const cell = getCell(r, c)
                      if (c.plain)
                        return (
                          <td key={c.key} data-plain title={cell.hint} className={cx(cellBase, 'bg-surface text-fg', c.money && MONEY)}>
                            <CellValue cell={cell} />
                            {cell.hint && <span className="sr-only">{`. ${cell.hint}`}</span>}
                          </td>
                        )
                      return (
                        <td
                          key={c.key}
                          data-tone={cell.tone ? TONE[cell.tone].key : undefined}
                          data-quiet={cell.quiet || undefined}
                          data-note={cell.note || undefined}
                          title={cell.hint}
                          className={cx(cellBase, toneLook(cell), cell.note && 'border-b-2 border-b-warning', c.money && MONEY)}
                        >
                          {cell.value != null || cell.delta ? <CellValue cell={cell} /> : <span aria-hidden="true">·</span>}
                          <span className="sr-only">
                            {cell.word ? ` ${cell.word}` : ''}
                            {cell.note ? `, ${noteLabel}` : ''}
                            {cell.hint ? `. ${cell.hint}` : ''}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
        </tbody>
        {totals && !loading && (
          <tfoot data-part="totals">
            <tr className="border-t-2 border-line-strong">
              <th scope="row" className={cx('sticky left-0 z-10 bg-canvas px-compact text-start text-heading', stickyHeader && 'bottom-0 z-30')}>
                {totals.label}
              </th>
              {columns.map((c) => {
                const cell = totals.getCell(c)
                return (
                  <td key={c.key} title={cell.hint} className={cx(cellBase, 'bg-canvas text-heading text-fg', stickyHeader && 'sticky bottom-0 z-20', c.money && MONEY)}>
                    <CellValue cell={cell} />
                    {cell.hint && <span className="sr-only">{`. ${cell.hint}`}</span>}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )

  return (
    <div data-slot="proofread-grid" className={cx('flex min-w-0 flex-col gap-compact', className)}>
      {legend}
      {loading ? <Loading label={`${label}: загрузка`}>{table}</Loading> : table}
      {hidden > 0 && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => setLimit(limit + pageSize)} data-slot="show-more">
            показать ещё · {hidden}
          </Button>
        </div>
      )}
    </div>
  )
}

export interface GridLegendProps {
  items: Array<{ tone?: Tone; quiet?: boolean; label: ReactNode }>
  /** Образец отметки «возможен перенос». */
  note?: ReactNode
  label?: string
}

/** Легенда сетки статуса: образец клетки у тонов с заливкой и слово; без заливки — только слово. */
export function GridLegend({ items, note, label = 'Легенда' }: GridLegendProps) {
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-x-blocks gap-y-items p-0 text-caption text-fg-muted">
      {items.map((it, i) => (
        <li key={i} className="inline-flex items-center gap-items">
          {it.tone && FILL[it.tone] && <span aria-hidden="true" className={cx('inline-block size-icon rounded-control border border-line', toneLook(it))} />}
          {it.label}
        </li>
      ))}
      {note && (
        <li className="inline-flex items-center gap-items">
          <span aria-hidden="true" className="inline-block size-icon rounded-control border border-line border-b-2 border-b-warning bg-surface" />
          {note}
        </li>
      )}
    </ul>
  )
}

export interface StatusRowProps {
  /** Статус строки — тон словаря: заливка тона, как у клетки сетки; без тона — без заливки (нет нормы). */
  tone?: Tone
  /** Строка статуса словами: «3-е · план выполнен · вышло 2 из 2». */
  title: ReactNode
  /** Что внутри: посты дня. */
  children?: ReactNode
  className?: string
  [data: `data-${string}`]: string | undefined
}

/** День сетки статуса развёрнутым: строка статуса и её содержимое, залитые тоном — той же заливкой, что клетка дня. */
export function StatusRow({ tone, title, children, className, ...rest }: StatusRowProps) {
  return (
    <div data-slot="status-row" data-tone={tone ? TONE[tone].key : undefined} className={cx('flex min-w-0 flex-col gap-tight rounded-surface border border-line px-compact py-items', toneLook({ tone }), className)} {...rest}>
      <p className="m-0 text-body">{title}</p>
      {children}
    </div>
  )
}
