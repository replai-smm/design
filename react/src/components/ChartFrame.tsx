/**
 * Рамка графика (DF «Дашборд агентства»: графики Chart.js; опись DF §3.13). Сам график рисует продукт (Chart.js из
 * бандла, SVG) внутри рамки; рамка даёт заголовок, тихие кнопки, легенду, текст для читалки и состояния той же высоты.
 * - Цвета рядов — только токены (`SERIES`): в CSS — `seriesVar(i)`, для холста — `resolveSeriesColors()` /
 *   `useSeriesColors()` (значения токенов текущей темы; тема сменилась — цвета пересчитаны).
 * - Цвет не один: у ряда в легенде слово и вид линии (сплошная, пунктир, точки), тот же вид продукт даёт линии графика.
 * - Текст для читалки (`summary`) обязателен: главный вывод графика словами. Таблица данных — по желанию (`table`).
 * - Загрузка, ошибка, пусто — в той же высоте, что график (без прыжка).
 */
import { useEffect, useId, useState, type ReactNode, type RefObject } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Loading, Skeleton, StateView, type StateKind } from './StateView'

/** Токены цветов рядов по порядку: синий, зелёный, оранжевый, красный, фиолетовый, серый (Carbon support + interactive). */
export const SERIES = ['interactive', 'support-success', 'support-caution-major', 'support-error', 'support-caution-undefined', 'text-secondary'] as const
/** Классы фона цвета ряда `i` (метки рядов вне графика: легенда, плитка сравнения `StatTile`). */
export const SERIES_BG = ['bg-interactive', 'bg-support-success', 'bg-support-caution-major', 'bg-support-error', 'bg-support-caution-undefined', 'bg-text-secondary'] as const
const SERIES_BORDER = ['border-interactive', 'border-support-success', 'border-support-caution-major', 'border-support-error', 'border-support-caution-undefined', 'border-text-secondary'] as const

/** Цвет ряда `i` для CSS и SVG: `var(--cds-…)`. Рядов больше шести — цвета идут по кругу (различает вид линии). */
export const seriesVar = (i: number) => `var(--cds-${SERIES[i % SERIES.length]})`

/** Значения цветов рядов в текущей теме — для холста (Chart.js не понимает var()). */
export function resolveSeriesColors(el: Element = document.documentElement): string[] {
  const cs = getComputedStyle(el)
  return SERIES.map((t) => cs.getPropertyValue(`--cds-${t}`).trim())
}

/** Цвета рядов, пересчитанные при смене темы (data-theme на корне или системная тема). */
export function useSeriesColors(ref?: RefObject<Element | null>): string[] {
  const [colors, setColors] = useState<string[]>(() => (typeof document === 'undefined' ? [] : resolveSeriesColors()))
  useEffect(() => {
    const update = () => setColors(resolveSeriesColors(ref?.current ?? document.documentElement))
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', update)
    return () => {
      mo.disconnect()
      mq?.removeEventListener?.('change', update)
    }
  }, [ref])
  return colors
}

export type SeriesLine = 'solid' | 'dashed' | 'dotted'

export interface LegendItem {
  key: string
  label: ReactNode
  /** Номер цвета ряда (по умолчанию — порядок в легенде). */
  series?: number
  /** Вид линии ряда — тот же, что на графике. Столбцы — `bar` (квадрат). */
  line?: SeriesLine | 'bar'
  /** Число рядом со словом: «12 постов». */
  value?: ReactNode
}

export interface ChartFrameProps {
  title: ReactNode
  description?: ReactNode
  /** Главный вывод словами — для читалки: «Охват вырос на 12 % за неделю». */
  summary: string
  legend?: LegendItem[]
  /** Тихие кнопки справа от заголовка: «30 дней / 90 дней». */
  tools?: ReactNode
  /** Высота области графика: sm 12rem · md 16rem · lg 20rem. */
  height?: 'sm' | 'md' | 'lg'
  state?: 'ready' | 'loading' | 'error'
  error?: { title: ReactNode; description?: ReactNode; onRetry?: () => void }
  /** Данных нет — вместо графика: «Постов за период нет». */
  empty?: { kind: Exclude<StateKind, 'ошибка'>; title: ReactNode; description?: ReactNode; action?: ReactNode }
  /** Данные таблицей под графиком (раскрывается). */
  table?: ReactNode
  /** Сам график: `<canvas>` Chart.js или SVG. */
  children?: ReactNode
  className?: string
}

const HEIGHT = { sm: 'h-48', md: 'h-64', lg: 'h-80' } as const
const LINE = { solid: 'border-solid', dashed: 'border-dashed', dotted: 'border-dotted' } as const

export function ChartFrame({ title, description, summary, legend, tools, height = 'md', state = 'ready', error, empty, table, children, className }: ChartFrameProps) {
  const id = useId()
  const [showTable, setShowTable] = useState(false)
  const h = HEIGHT[height]

  let area: ReactNode
  if (state === 'loading')
    area = (
      <Loading label={`${typeof title === 'string' ? title : 'график'}: загрузка`}>
        <div className={cx('flex flex-col justify-end gap-2', h)}>
          <Skeleton className="h-full" />
          <Skeleton width="1/2" />
        </div>
      </Loading>
    )
  else if (state === 'error')
    area = (
      <StateView
        className={h}
        kind="ошибка"
        title={error?.title ?? 'График не загрузился'}
        description={error?.description}
        action={error?.onRetry && <Button variant="tertiary" onClick={error.onRetry}>Повторить</Button>}
      />
    )
  else if (empty) area = <StateView className={h} kind={empty.kind} title={empty.title} description={empty.description} action={empty.action} />
  else
    area = (
      <div data-slot="chart-area" className={cx('relative min-w-0', h)}>
        {children}
      </div>
    )

  const ready = state === 'ready' && !empty
  return (
    <figure data-slot="chart-frame" data-state={state === 'ready' ? (empty ? empty.kind : undefined) : state === 'loading' ? 'загрузка' : 'ошибка'} aria-labelledby={`${id}-t`} aria-describedby={`${id}-s`} className={cx('m-0 flex min-w-0 flex-col gap-4 border border-border-subtle-01 bg-layer-01 p-4', className)}>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <figcaption className="flex min-w-0 flex-col gap-1">
          <span id={`${id}-t`} className="text-heading-compact-02 text-text-primary">
            {title}
          </span>
          {description && <span className="text-label-01 text-text-secondary">{description}</span>}
        </figcaption>
        {tools && <div className="flex shrink-0 flex-wrap items-center gap-1">{tools}</div>}
      </div>
      <p id={`${id}-s`} className="sr-only">
        {summary}
      </p>
      {area}
      {ready && legend && legend.length > 0 && (
        <ul aria-label="Легенда" data-slot="chart-legend" className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-label-01 text-text-secondary">
          {legend.map((it, i) => {
            const s = (it.series ?? i) % SERIES.length
            const line = it.line ?? 'solid'
            return (
              <li key={it.key} className="inline-flex items-center gap-2" data-series={s} data-line={line}>
                {line === 'bar' ? (
                  <span aria-hidden="true" className={cx('inline-block size-3', SERIES_BG[s])} />
                ) : (
                  <span aria-hidden="true" className={cx('inline-block w-5 border-t-2', SERIES_BORDER[s], LINE[line])} />
                )}
                <span className="text-text-primary">{it.label}</span>
                {it.value !== undefined && <span>{it.value}</span>}
              </li>
            )
          })}
        </ul>
      )}
      {ready && table && (
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" aria-expanded={showTable} aria-controls={`${id}-tbl`} onClick={() => setShowTable(!showTable)} className="self-start">
            {showTable ? 'Скрыть таблицу' : 'Данные таблицей'}
          </Button>
          <div id={`${id}-tbl`} className="ds-expand" data-open={showTable} inert={!showTable}>
            <div>{table}</div>
          </div>
        </div>
      )}
    </figure>
  )
}
