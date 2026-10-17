/**
 * Рамка графика — поверхность: заголовок, тихие кнопки, легенда словом и видом линии, вывод словами для читалки
 * (`summary`, обязателен), состояния той же высоты, что график (без прыжка). Сам график — `Chart` внутри.
 */
import { useId, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import type { DataState, EmptyView, ErrorView } from '../lib/vocab'
import { Button } from './Button'
import { SERIES, seriesIndex, type SeriesLine } from './Chart'
import { Loading, Skeleton } from './Skeleton'
import { StateView } from './StateView'
import { Surface } from './Surface'

export interface LegendItem {
  key: string
  label: ReactNode
  /** Номер ряда данных (по умолчанию — порядок в легенде). */
  series?: number
  /** Вид линии — тот же, что на графике; столбцы — `bar`. */
  line?: SeriesLine | 'bar'
}

export interface ChartFrameProps {
  title: ReactNode
  description?: ReactNode
  /** Главный вывод словами — для читалки: «Охват вырос на 12 % за неделю». */
  summary: string
  legend?: LegendItem[]
  /** Тихие кнопки справа от заголовка. */
  tools?: ReactNode
  state?: DataState
  error?: ErrorView
  /** Данных нет — вместо графика. */
  empty?: EmptyView
  /** Сам график — `<Chart>`. */
  children?: ReactNode
  className?: string
}

const LINE = { solid: 'border-solid', dashed: 'border-dashed', dotted: 'border-dotted' } as const
const AREA = 'ds-chart-area'

export function ChartFrame({ title, description, summary, legend, tools, state = 'ready', error, empty, children, className }: ChartFrameProps) {
  const id = useId()
  let area: ReactNode
  if (state === 'loading')
    area = (
      <Loading label={`${typeof title === 'string' ? title : 'график'}: загрузка`}>
        <div className={cx('flex flex-col justify-end gap-items', AREA)}>
          <Skeleton className="h-full" />
        </div>
      </Loading>
    )
  else if (state === 'error')
    area = (
      <StateView
        className={AREA}
        kind="ошибка"
        title={error?.title ?? 'График не загрузился'}
        description={error?.description}
        action={error?.onRetry && <Button onClick={error.onRetry}>Повторить</Button>}
      />
    )
  else if (empty) area = <StateView className={AREA} kind={empty.kind} title={empty.title} description={empty.description} action={empty.action} />
  else
    area = (
      <div data-part="area" className={cx('relative min-w-0', AREA)}>
        {children}
      </div>
    )
  const ready = state === 'ready' && !empty
  return (
    <Surface as="figure" data-slot="chart-frame" aria-labelledby={`${id}-t`} aria-describedby={`${id}-s`} className={cx('m-0 gap-blocks', className)}>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-items">
        <figcaption className="flex min-w-0 flex-col gap-tight">
          <span id={`${id}-t`} data-part="title" className="text-heading text-fg">
            {title}
          </span>
          {description && <span className="text-caption text-fg-muted">{description}</span>}
        </figcaption>
        {tools && <div className="flex shrink-0 flex-wrap items-center gap-tight">{tools}</div>}
      </div>
      <p id={`${id}-s`} className="sr-only">
        {summary}
      </p>
      {area}
      {ready && legend && legend.length > 0 && (
        <ul aria-label="Легенда" data-part="legend" className="m-0 flex list-none flex-wrap gap-x-blocks gap-y-items p-0 text-caption text-fg-muted">
          {legend.map((it, i) => {
            const s = seriesIndex(it.series ?? i)
            const line = it.line ?? 'solid'
            return (
              <li key={it.key} className="inline-flex items-center gap-items" data-series={s} data-line={line}>
                {line === 'bar' ? (
                  <span aria-hidden="true" className={cx('inline-block size-compact rounded-control', SERIES.bg[s])} />
                ) : (
                  <span aria-hidden="true" className={cx('inline-block w-groups border-t-2', SERIES.border[s], LINE[line])} />
                )}
                <span className="text-fg">{it.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Surface>
  )
}
