/**
 * Сетка сверки «строка × день» (DF «Вычитка»: сообщество × день месяца; опись DF §3.9). Настоящая таблица: шапка дней,
 * строка — заголовок строки слева (закреплён при прокрутке вбок), в клетке — короткое значение («1/2») и тон.
 * - Тон клетки — из токенов статусов (success, warning, error, neutral), не зашитые цвета; «будущее» и «нет данных» —
 *   тихие. Цвет не один: в клетке значение, читалка слышит слово тона (`toneLabels`), подсказка — `hint`.
 * - Отметка «возможен перенос» — черта снизу клетки (`note`) и слово для читалки (`noteLabel`).
 * - Выходные в шапке серые; нажатие на строку — `onRowClick` (раскрыть посты по дням), выбранная строка подсвечена.
 * - Порядок строк задаёт продукт (DF: проблемные сверху). Много — первые `pageSize` и «показать ещё».
 * - На телефоне сетка прокручивается вбок, первая колонка стоит. Рамка прокрутки — relative: скрытые слова для читалки
 *   (sr-only, position: absolute) остаются внутри неё и не раздвигают страницу.
 * - Шапка дней закреплена при прокрутке вниз (`stickyHeader`, по умолчанию да; DF §10.8 must 2): рамка не выше экрана
 *   и прокручивается сама, шапка стоит сверху, первая колонка — слева, угол — над обеими.
 * - Колонки без тона (`plain`: КМ, итоги «план», «вышло») — просто значение: без цвета, без слова тона для читалки.
 * - Широкая матрица (Статистика: «Динамика по месяцам» проект × месяц, «Объявления по дням» проект × день, 20–40
 *   колонок): колонка ширины денег (`width: 'money'`) — значение вправо, разряды ровно; Δ в клетке (`delta`) — `Delta`
 *   без тона рядом с числом (тон отвлекает от чисел; `tone: true` — с тоном); итог-строка внизу (`totals`) — `<tfoot>`,
 *   стоит при прокрутке вниз вместе с шапкой, первая колонка закреплена и в ней.
 * Легенда — `GridLegend` (те же тона и слова).
 * Состояния: загрузка (скелет строк), ошибка, пусто (`empty`), много.
 */
import { useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Delta, type DeltaProps } from './StatTile'
import { Loading, Skeleton, StateView, type StateKind } from './StateView'

export type GridTone = 'success' | 'warning' | 'error' | 'neutral' | 'future' | 'none'

export interface GridColumn {
  key: string
  /** Шапка: число дня. */
  label: ReactNode
  /** Вторая строка шапки: день недели. */
  sub?: ReactNode
  /** Полная подпись для читалки: «понедельник, 6 октября». */
  title?: string
  /** Выходной — серая шапка. */
  muted?: boolean
  /** Колонка без тона (КМ, итоги): клетка — значение, без цвета и слова тона; пусто — пусто, а не «·». */
  plain?: boolean
  /** Ширина: `day` — узкая под день (по умолчанию), `money` — под деньги («1 234 567 ₽»), значение вправо. */
  width?: 'day' | 'money'
}

export interface GridCell {
  value?: ReactNode
  tone?: GridTone
  /** Отметка «возможен перенос» — черта снизу. */
  note?: boolean
  /** Подсказка при наведении и слова для читалки. */
  hint?: string
  /** Разница рядом с числом: «1 234 ₽ ▲ 12,5%». Без тона, если не сказано `tone: true`. */
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
  onRowClick?: (row: R) => void
  selectedKey?: string
  /** Слова тонов для читалки и легенды. */
  toneLabels?: Partial<Record<GridTone, string>>
  noteLabel?: string
  /** Легенда над сеткой — `<GridLegend>`. */
  legend?: ReactNode
  pageSize?: number
  /** Шапка дней стоит при прокрутке вниз: рамка не выше экрана и прокручивается сама. По умолчанию да. */
  stickyHeader?: boolean
  /** Итог-строка внизу («Итого по дню»): подпись в первой колонке и значение каждой колонки (без тона). */
  totals?: { label: ReactNode; getCell: (column: GridColumn) => GridCell }
  state?: 'ready' | 'loading' | 'error'
  error?: { title: ReactNode; description?: ReactNode; onRetry?: () => void }
  empty?: { kind: Exclude<StateKind, 'ошибка'>; title: ReactNode; description?: ReactNode; action?: ReactNode }
  className?: string
}

export const GRID_TONE: Record<GridTone, string> = {
  success: 'bg-status-success-background text-status-success-text',
  warning: 'bg-status-warning-background text-status-warning-text',
  error: 'bg-status-error-background text-status-error-text',
  neutral: 'bg-status-neutral-background text-status-neutral-text',
  future: 'bg-layer-02 text-text-secondary',
  none: 'bg-layer-01 text-text-helper',
}
export const GRID_TONE_LABEL: Record<GridTone, string> = {
  success: 'в норме',
  warning: 'недобор',
  error: 'пропуск',
  neutral: 'сверх плана',
  future: 'впереди',
  none: 'нет данных',
}

const cellBase = 'h-10 min-w-10 px-1 text-center align-middle text-label-01 tabular-nums'
/** Колонка денег: шире, значение вправо (разряды друг под другом). */
const MONEY = 'min-w-28 px-3 text-end whitespace-nowrap'
const widthCls = (c: GridColumn) => (c.width === 'money' ? MONEY : undefined)

function CellValue({ cell }: { cell: GridCell }) {
  if (!cell.delta) return <>{cell.value}</>
  return (
    <span className="inline-flex items-baseline gap-2">
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
  onRowClick,
  selectedKey,
  toneLabels,
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
  const words = { ...GRID_TONE_LABEL, ...toneLabels }

  if (state === 'error')
    return (
      <div data-slot="proofread-grid" className={className}>
        <StateView
          kind="ошибка"
          title={error?.title ?? 'Сетка не загрузилась'}
          description={error?.description}
          action={error?.onRetry && <Button variant="tertiary" onClick={error.onRetry}>Повторить</Button>}
        />
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
      className={cx('relative min-w-0 overflow-x-auto border border-border-subtle-01', stickyHeader && 'max-h-dvh overflow-y-auto')}
      tabIndex={0}
      role="region"
      aria-label={`${label}: прокрутка`}
    >
      <table aria-label={label} aria-busy={loading || undefined} className="w-max min-w-full border-collapse bg-layer-01 text-text-primary">
        <thead>
          <tr>
            <th scope="col" className={cx('sticky left-0 min-w-40 bg-layer-accent-01 px-3 text-start text-heading-compact-01 md:min-w-56', stickyHeader ? 'top-0 z-30' : 'z-10')}>
              {rowHeader}
            </th>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                data-muted={c.muted || undefined}
                className={cx(
                  'h-12 min-w-10 border-l border-border-subtle-01 px-1 text-center font-normal',
                  c.muted ? 'bg-layer-02 text-text-secondary' : 'bg-layer-accent-01 text-text-primary',
                  stickyHeader && 'sticky top-0 z-20',
                  widthCls(c),
                )}
              >
                {c.title && <span className="sr-only">{c.title}</span>}
                <span aria-hidden={c.title ? true : undefined} className={cx('flex flex-col', c.width === 'money' ? 'items-end' : 'items-center')}>
                  <span className="text-heading-compact-01">{c.label}</span>
                  {c.sub && <span className="text-label-01">{c.sub}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-t border-border-subtle-01">
                  <td className="sticky left-0 bg-layer-01 px-3 text-start">
                    <Skeleton width="3/4" />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={cx(cellBase, 'border-l border-border-subtle-01')}>
                      <Skeleton className="mx-auto" width="1/2" />
                    </td>
                  ))}
                </tr>
              ))
            : shown.map((r) => {
                const key = getKey(r)
                const selected = key === selectedKey
                return (
                  <tr key={key} data-slot="grid-row" data-selected={selected || undefined} className="border-t border-border-subtle-01">
                    <th scope="row" className={cx('sticky left-0 z-10 max-w-56 px-3 text-start text-body-compact-01 font-normal', selected ? 'bg-layer-selected-01' : 'bg-layer-01')}>
                      {onRowClick ? (
                        <button
                          type="button"
                          aria-current={selected || undefined}
                          onClick={() => onRowClick(r)}
                          className="flex min-h-10 w-full min-w-0 cursor-pointer items-center text-start text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus"
                        >
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
                          <td key={c.key} data-plain title={cell.hint} className={cx(cellBase, 'border-l border-border-subtle-01 bg-layer-01 text-text-primary', widthCls(c))}>
                            <CellValue cell={cell} />
                            {cell.hint && <span className="sr-only">{`. ${cell.hint}`}</span>}
                          </td>
                        )
                      const tone = cell.tone ?? 'none'
                      return (
                        <td
                          key={c.key}
                          data-tone={tone}
                          data-note={cell.note || undefined}
                          title={cell.hint}
                          className={cx(cellBase, 'border-l border-border-subtle-01', GRID_TONE[tone], cell.note && 'border-b-4 border-b-support-caution-minor', widthCls(c))}
                        >
                          {cell.value != null || cell.delta ? <CellValue cell={cell} /> : <span aria-hidden="true">·</span>}
                          <span className="sr-only">
                            {' '}
                            {words[tone]}
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
          <tfoot data-slot="grid-totals">
            <tr className="border-t-2 border-border-strong-01">
              <th scope="row" className={cx('sticky left-0 z-10 bg-layer-accent-01 px-3 text-start text-heading-compact-01', stickyHeader && 'bottom-0 z-30')}>
                {totals.label}
              </th>
              {columns.map((c) => {
                const cell = totals.getCell(c)
                return (
                  <td key={c.key} title={cell.hint} className={cx(cellBase, 'border-l border-border-subtle-01 bg-layer-accent-01 text-heading-compact-01 text-text-primary', stickyHeader && 'sticky bottom-0 z-20', widthCls(c))}>
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
    <div data-slot="proofread-grid" className={cx('flex min-w-0 flex-col gap-3', className)}>
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
  items: Array<{ tone: GridTone; label?: ReactNode }>
  /** Показать образец отметки «возможен перенос». */
  note?: ReactNode
  label?: string
}

/** Легенда тонов сетки: образец клетки и слово. */
export function GridLegend({ items, note, label = 'Легенда' }: GridLegendProps) {
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-label-01 text-text-secondary">
      {items.map((it) => (
        <li key={it.tone} className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={cx('inline-block size-4 border border-border-subtle-01', GRID_TONE[it.tone])} />
          {it.label ?? GRID_TONE_LABEL[it.tone]}
        </li>
      ))}
      {note && (
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-4 border border-border-subtle-01 border-b-4 border-b-support-caution-minor bg-layer-01" />
          {note}
        </li>
      )}
    </ul>
  )
}
