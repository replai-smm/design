/**
 * Неделя публикаций (DF «Постинг» → «Неделя»; опись DF §3.4). Семь дней с понедельника: на ноутбуке (≥ 1024) — семь
 * колонок, на телефоне — дни друг под другом. У выходных своя шапка, у сегодня — метка словом, не только цветом.
 * - Карточку поста рисует продукт (`renderItem`: время, «⏰ отложен», текст, 👍 👁 💬); нажатие — `onItemClick`.
 * - «+» в дне — `onAddDay(день)`: черновик на этот день. Пустой день — «Нет публикаций».
 * - Много в дне — первые `dayLimit` и «ещё N».
 * - Навигация недели (`nav`) — ◀ «6 окт — 12 окт» ▶; подпись считается сама.
 * Состояния: загрузка (скелет карточек в днях), ошибка, пусто (`empty` вместо сетки: «Выберите сообщество»), много.
 */
import { useId, useMemo, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Loading, Skeleton, StateView, type StateKind } from './StateView'

export interface WeekCalendarProps<T> {
  /** Понедельник недели (любой день недели — возьмётся её понедельник). */
  weekStart: Date
  items: T[]
  getKey: (item: T) => string
  /** Когда пост: по дате раскладывается в день, по времени — порядок внутри дня. */
  getDate: (item: T) => Date
  renderItem: (item: T) => ReactNode
  onItemClick?: (item: T) => void
  /** «+» в дне — запланировать на этот день. Без него «+» нет. */
  onAddDay?: (day: Date) => void
  /** Подпись «+» для читалки: по умолчанию «Запланировать на 6 октября». */
  addLabel?: (day: Date) => string
  /** Подпись сетки для читалки: «Публикации недели». */
  label: string
  emptyDayText?: ReactNode
  /** Сегодня (по умолчанию — сейчас). */
  today?: Date
  /** Сколько карточек в дне до «ещё N». */
  dayLimit?: number
  /** ◀ ▶ над сеткой. */
  nav?: { onPrev: () => void; onNext: () => void; onToday?: () => void; prevLabel?: string; nextLabel?: string }
  state?: 'ready' | 'loading' | 'error'
  error?: { title: ReactNode; description?: ReactNode; onRetry?: () => void }
  /** Вместо сетки — когда неделю показать нельзя или нечего: «Выберите сообщество», «По фильтру ничего». */
  empty?: { kind: Exclude<StateKind, 'ошибка'>; title: ReactNode; description?: ReactNode; action?: ReactNode }
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
const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const WEEKDAY_LONG = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
const DATE_LONG = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

export function WeekCalendar<T>({
  weekStart,
  items,
  getKey,
  getDate,
  renderItem,
  onItemClick,
  onAddDay,
  addLabel = (d) => `Запланировать на ${DATE_LONG.format(d)}`,
  label,
  emptyDayText = 'Нет публикаций',
  today = new Date(),
  dayLimit = 0,
  nav,
  state = 'ready',
  error,
  empty,
  className,
}: WeekCalendarProps<T>) {
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
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={nav.onPrev} aria-label={nav.prevLabel ?? 'Прошлая неделя'} data-slot="week-prev">
        <span aria-hidden="true">◀</span>
      </Button>
      <p data-slot="week-title" className="m-0 min-w-40 text-center text-heading-compact-02 text-text-primary" aria-live="polite">
        {weekTitle(mon)}
      </p>
      <Button variant="ghost" size="sm" onClick={nav.onNext} aria-label={nav.nextLabel ?? 'Следующая неделя'} data-slot="week-next">
        <span aria-hidden="true">▶</span>
      </Button>
      {nav.onToday && (
        <Button variant="tertiary" size="sm" onClick={nav.onToday}>
          Эта неделя
        </Button>
      )}
    </div>
  )

  let body: ReactNode
  if (state === 'error')
    body = (
      <StateView
        kind="ошибка"
        title={error?.title ?? 'Неделя не загрузилась'}
        description={error?.description}
        action={error?.onRetry && <Button variant="tertiary" onClick={error.onRetry}>Повторить</Button>}
      />
    )
  else if (state === 'ready' && empty && items.length === 0)
    body = <StateView kind={empty.kind} title={empty.title} description={empty.description} action={empty.action} />
  else {
    const grid = (
      <ol aria-label={label} className="m-0 grid list-none grid-cols-1 gap-px border border-border-subtle-01 bg-border-subtle-01 p-0 lg:grid-cols-7">
        {days.map((d, i) => {
          const k = dayKey(d)
          const weekend = i >= 5
          const isToday = k === todayKey
          const list = byDay.get(k) ?? []
          const limit = dayLimit > 0 && !open[k] ? dayLimit : list.length
          const hidden = list.length - Math.min(limit, list.length)
          const headId = `${uid}-d${i}`
          return (
            <li key={k} data-slot="week-day" data-weekend={weekend || undefined} data-today={isToday || undefined} aria-labelledby={headId} className="flex min-w-0 flex-col bg-layer-01">
              <div
                className={cx(
                  'flex min-h-12 items-center justify-between gap-2 border-t-2 px-3 py-2',
                  weekend ? 'bg-layer-02 text-text-secondary' : 'bg-layer-01 text-text-primary',
                  isToday ? 'border-border-interactive' : 'border-transparent',
                )}
              >
                <h3 id={headId} className="m-0 flex items-baseline gap-2 text-heading-compact-01">
                  <span className="sr-only">{WEEKDAY_LONG.format(d)}</span>
                  <span aria-hidden="true" className="capitalize">{WEEKDAY.format(d)}</span>
                  <span aria-hidden="true">{d.getDate()}</span>
                  {isToday && <span className="text-label-01 text-link-primary">сегодня</span>}
                </h3>
                {onAddDay && (
                  <Button variant="ghost" size="sm" onClick={() => onAddDay(d)} aria-label={addLabel(d)} data-slot="week-add">
                    <span aria-hidden="true">+</span>
                  </Button>
                )}
              </div>
              {state === 'loading' ? (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: i % 3 === 0 ? 2 : 1 }, (_, j) => (
                    <div key={j} className="flex flex-col gap-2 border border-border-subtle-01 p-3">
                      <Skeleton width="1/3" />
                      <Skeleton />
                    </div>
                  ))}
                </div>
              ) : list.length === 0 ? (
                <p className="m-0 px-3 pb-3 text-label-01 text-text-helper">{emptyDayText}</p>
              ) : (
                <div className="flex flex-col gap-2 p-2">
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {list.slice(0, limit).map((it) => (
                      <li key={getKey(it)} data-slot="week-item">
                        {onItemClick ? (
                          <button
                            type="button"
                            onClick={() => onItemClick(it)}
                            className="flex w-full min-w-0 cursor-pointer flex-col gap-1 border border-border-subtle-01 bg-layer-01 p-3 text-start text-body-compact-01 text-text-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2"
                          >
                            {renderItem(it)}
                          </button>
                        ) : (
                          <div className="flex min-w-0 flex-col gap-1 border border-border-subtle-01 p-3 text-body-compact-01">{renderItem(it)}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                  {dayLimit > 0 && list.length > dayLimit && (
                    <Button variant="ghost" size="sm" aria-expanded={Boolean(open[k])} onClick={() => setOpen({ ...open, [k]: !open[k] })} data-slot="week-more">
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
    <div data-slot="week-calendar" data-week={dayKey(mon)} className={cx('flex min-w-0 flex-col gap-4', className)}>
      {head}
      {body}
    </div>
  )
}

/** Сдвинуть неделю на `n` недель (◀ −1, ▶ +1). */
export function addWeeks(weekStart: Date, n: number): Date {
  const mon = mondayOf(weekStart)
  return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + n * 7)
}
