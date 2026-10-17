/**
 * Неделя публикаций (DF «Постинг» → «Неделя»): семь дней с понедельника — семь колонок на ноутбуке, дни списком на
 * телефоне. Выходные — утопленные, сегодня — словом «сегодня» и жирным числом. Карточку поста рисует продукт
 * (`renderItem`), нажатие — `onSelect`; «+» в дне — `onAddDay`. Пустой день — `emptyDay`. Много в дне — первые
 * `dayLimit` и «ещё N». Навигация недели (`nav`) — стрелки и «6 окт — 12 окт».
 * Состояния: загрузка, ошибка, пусто (`empty` вместо сетки), много.
 */
import { useId, useMemo, useState, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { DataState, EmptyView, ErrorView } from '../lib/vocab'
import { Button } from './Button'
import { Loading, Skeleton } from './Skeleton'
import { StateView } from './StateView'

export interface WeekCalendarProps<T> {
  /** Любой день недели — возьмётся её понедельник. */
  weekStart: Date
  items: T[]
  getKey: (item: T) => string
  /** По дате — день, по времени — порядок внутри дня. */
  getDate: (item: T) => Date
  renderItem: (item: T) => ReactNode
  onSelect?: (item: T) => void
  /** «+» в дне — запланировать на этот день. */
  onAddDay?: (day: Date) => void
  /** Подпись сетки для читалки: «Публикации недели». */
  label: string
  /** Слова пустого дня. */
  emptyDay?: ReactNode
  /** Сегодня (по умолчанию — сейчас). */
  today?: Date
  /** Сколько карточек в дне до «ещё N». */
  dayLimit?: number
  nav?: { onPrev: () => void; onNext: () => void; onToday?: () => void }
  state?: DataState
  error?: ErrorView
  empty?: EmptyView
  className?: string
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
/** Понедельник недели дня `d` (местное время, полночь). */
export function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}
/** Подпись недели: «6 окт. — 12 окт.». */
export function weekTitle(weekStart: Date): string {
  const mon = mondayOf(weekStart)
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6)
  const f = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
  return `${f.format(mon)} — ${f.format(sun)}`
}
/** Сдвинуть неделю на `n` недель. */
export function addWeeks(weekStart: Date, n: number): Date {
  const mon = mondayOf(weekStart)
  return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + n * 7)
}
const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const WEEKDAY_LONG = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
const DATE_LONG = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

export function WeekCalendar<T>({ weekStart, items, getKey, getDate, renderItem, onSelect, onAddDay, label, emptyDay = 'Нет публикаций', today = new Date(), dayLimit = 0, nav, state = 'ready', error, empty, className }: WeekCalendarProps<T>) {
  const uid = useId()
  const mon = mondayOf(weekStart)
  const days = Array.from({ length: 7 }, (_, i) => new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i))
  const todayKey = dayKey(today)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const byDay = useMemo(() => {
    const m = new Map<string, T[]>()
    for (const it of items) {
      const k = dayKey(getDate(it))
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(it)
    }
    for (const list of m.values()) list.sort((a, b) => getDate(a).getTime() - getDate(b).getTime())
    return m
  }, [items, getDate])

  const head = nav && (
    <div className="flex flex-wrap items-center gap-items">
      <Button variant="ghost" dense icon="chevron-left" onClick={nav.onPrev} aria-label="Прошлая неделя" data-part="week-prev" />
      <p data-part="title" className="m-0 text-center text-heading text-fg" aria-live="polite">
        {weekTitle(mon)}
      </p>
      <Button variant="ghost" dense icon="chevron-right" onClick={nav.onNext} aria-label="Следующая неделя" data-part="week-next" />
      {nav.onToday && (
        <Button dense onClick={nav.onToday}>
          Эта неделя
        </Button>
      )}
    </div>
  )

  let body: ReactNode
  if (state === 'error') body = <StateView kind="ошибка" title={error?.title ?? 'Неделя не загрузилась'} description={error?.description} action={error?.onRetry && <Button onClick={error.onRetry}>Повторить</Button>} />
  else if (state === 'ready' && empty && items.length === 0) body = <StateView kind={empty.kind} title={empty.title} description={empty.description} action={empty.action} />
  else {
    const grid = (
      <ol aria-label={label} className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-surface border border-line bg-line p-0 lg:grid-cols-7">
        {days.map((d, i) => {
          const k = dayKey(d)
          const weekend = i >= 5
          const isToday = k === todayKey
          const list = byDay.get(k) ?? []
          const limit = dayLimit > 0 && !open[k] ? dayLimit : list.length
          const hidden = list.length - Math.min(limit, list.length)
          const headId = `${uid}-d${i}`
          return (
            <li key={k} data-part="day" data-weekend={weekend || undefined} data-today={isToday || undefined} aria-labelledby={headId} className={cx('flex min-w-0 flex-col', weekend ? 'bg-canvas' : 'bg-surface')}>
              <div className="flex min-h-touch items-center justify-between gap-items px-compact md:min-h-control">
                <h3 id={headId} className={cx('m-0 flex items-baseline gap-items text-body', weekend ? 'text-fg-muted' : 'text-fg', isToday && 'font-semibold text-fg')}>
                  <span className="sr-only">{WEEKDAY_LONG.format(d)}</span>
                  <span aria-hidden="true" className="capitalize">
                    {WEEKDAY.format(d)}
                  </span>
                  <span aria-hidden="true">{d.getDate()}</span>
                  {isToday && <span className="text-caption">сегодня</span>}
                </h3>
                {onAddDay && <Button variant="ghost" dense icon="add" onClick={() => onAddDay(d)} aria-label={`Запланировать на ${DATE_LONG.format(d)}`} data-part="week-add" />}
              </div>
              {state === 'loading' ? (
                <div className="flex flex-col gap-items p-items">
                  {Array.from({ length: i % 3 === 0 ? 2 : 1 }, (_, j) => (
                    <div key={j} className="flex flex-col gap-items rounded-control border border-line p-compact">
                      <Skeleton width="1/3" />
                      <Skeleton />
                    </div>
                  ))}
                </div>
              ) : list.length === 0 ? (
                <p className="m-0 px-compact pb-compact text-caption text-fg-muted">{emptyDay}</p>
              ) : (
                <div className="flex flex-col gap-items p-items">
                  <ul className="m-0 flex list-none flex-col gap-items p-0">
                    {list.slice(0, limit).map((it) => (
                      <li key={getKey(it)} data-part="week-item">
                        {onSelect ? (
                          <button type="button" onClick={() => onSelect(it)} className={cx('flex w-full min-w-0 cursor-pointer flex-col gap-tight rounded-control border border-line bg-surface p-compact text-start text-body text-fg hover:bg-hover', FOCUS)}>
                            {renderItem(it)}
                          </button>
                        ) : (
                          <div className="flex min-w-0 flex-col gap-tight rounded-control border border-line bg-surface p-compact text-body">{renderItem(it)}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {dayLimit > 0 && list.length > dayLimit && (
                    <Button variant="ghost" dense aria-expanded={Boolean(open[k])} onClick={() => setOpen({ ...open, [k]: !open[k] })} data-part="week-more">
                      {open[k] ? 'свернуть' : `ещё ${hidden}`}
                    </Button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    )
    body = state === 'loading' ? <Loading label={`${label}: загрузка`}>{grid}</Loading> : grid
  }

  return (
    <div data-slot="week-calendar" data-week={dayKey(mon)} className={cx('flex min-w-0 flex-col gap-blocks', className)}>
      {head}
      {body}
    </div>
  )
}
