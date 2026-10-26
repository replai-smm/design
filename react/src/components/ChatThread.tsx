/**
 * Переписка (сообщения людей, разговор с агентом): входящие слева, наши справа, автор, время, вложения,
 * разделитель дня; «Показать более ранние» сверху без прыжка; новое внизу — лента остаётся внизу.
 * - Вид сообщения (`variant`): `bubble` — пузырь (переписка людей; наше — утопленное, входящее — на поверхности);
 *   `wide` — во всю ширину без рамки (ответ агента: текст, код); `notice` — весть со стороны (система)
 *   — плитка с меткой, как уведомление.
 * - Наше — словарь хода: в очереди, отправляется, не отправлено — словом; у ошибки — знак «опасно» и «Повторить».
 * - Лента — `role="log"`: читалка слышит новое, не перечитывая старое.
 * Состояния: загрузка (скелет пузырей той же формы), ошибка, пусто, много.
 */
import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react'
import { MARK, SUNKEN, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { DataState, EmptyView, ErrorView, Progress } from '../lib/vocab'
import { ArrowUp } from '../lib/icons.gen'
import { Button } from './Button'
import { Icon } from './Icon'
import { InlineLoading } from './InlineLoading'
import { SkeletonText } from './SkeletonText'
import { StateView } from './StateView'
import { Tile } from './Tile'

export interface ChatMessage {
  id: string
  /** in — от собеседника (слева), out — от нас (справа). */
  direction: 'in' | 'out'
  author?: ReactNode
  /** Кружок автора — `<Avatar>`. */
  avatar?: ReactNode
  /** Время на экране: «14:20». */
  time: string
  /** То же время машинно (ISO) — для `<time dateTime>`. */
  datetime?: string
  /** День («сегодня», «3 октября»): при смене дня встаёт разделитель. */
  day?: string
  text?: ReactNode
  /** Фото, файлы — под текстом. */
  attachments?: ReactNode
  /** Только у наших — словарь хода: `idle` — в очереди, `running` — отправляется, `done` — отправлено, `error` — не ушло. */
  status?: Progress
  variant?: 'bubble' | 'wide' | 'notice'
  /** Почему не ушло. */
  error?: ReactNode
  onRetry?: () => void
  /** Тихие кнопки под сообщением. */
  actions?: ReactNode
}

export interface ChatThreadProps {
  messages: ChatMessage[]
  /** Подпись ленты для читалки: «Переписка с Анной». */
  label: string
  state?: DataState
  error?: ErrorView
  empty?: EmptyView
  /** «Показать более ранние»: onLoad — догрузить; done — всё загружено. */
  earlier?: { onLoad: () => void; loading?: boolean; done?: boolean }
  /** Строка «ИИ думает…» под последним сообщением. */
  pending?: ReactNode
  /** Подпись наших сообщений без автора. */
  ownLabel?: string
  className?: string
}

const messageNode = (el: HTMLElement, id?: string) => (id === undefined ? undefined : [...el.querySelectorAll<HTMLElement>('[data-part=message]')].find((n) => n.dataset.id === id))

const SEND_WORD: Record<Progress, string> = { idle: 'в очереди', running: 'отправляется…', done: 'отправлено', error: 'не отправлено' }

function Message({ m, ownLabel }: { m: ChatMessage; ownLabel: string }) {
  const out = m.direction === 'out'
  const variant = m.variant ?? 'bubble'
  const bubble = variant === 'bubble'
  const body = (
    <>
      {m.text}
      {m.attachments && <div className="flex flex-wrap gap-items">{m.attachments}</div>}
    </>
  )
  return (
    <li data-part="message" data-id={m.id} data-direction={m.direction} data-status={m.status} data-variant={variant} className={cx('flex min-w-0 gap-items', out ? 'flex-row-reverse' : 'flex-row')}>
      {m.avatar && <span className="flex shrink-0 items-end">{m.avatar}</span>}
      <div className={cx('flex min-w-0 flex-col gap-tight', bubble ? 'max-w-4/5 md:max-w-2/3' : 'flex-1', out ? 'items-end' : 'items-start')}>
        <div className={cx('flex flex-wrap items-baseline gap-items text-caption text-fg-muted', out && 'flex-row-reverse')}>
          <span className="text-fg">{m.author ?? (out ? ownLabel : null)}</span>
          <time dateTime={m.datetime}>{m.time}</time>
        </div>
        {variant === 'notice' ? (
          <Tile data-mark="info" className={cx('w-full gap-items text-body break-words', MARK, 'border-l-fg')}>
            {body}
          </Tile>
        ) : (
          <div
            className={cx(
              'flex min-w-0 flex-col gap-items text-body break-words text-fg',
              bubble && cx('px-compact py-items whitespace-pre-wrap', m.status === 'error' ? 'rounded-surface border border-danger bg-canvas' : out ? SUNKEN : SURFACE),
              variant === 'wide' && 'w-full',
              (m.status === 'running' || m.status === 'idle') && 'text-fg-muted',
            )}
          >
            {body}
          </div>
        )}
        {out && m.status && m.status !== 'done' && (
          <div className="flex flex-wrap items-center gap-items text-caption" role={m.status === 'error' ? 'alert' : undefined}>
            {m.status === 'error' && <Icon tone="опасно" />}
            <span className={m.status === 'error' ? 'text-danger-fg' : 'text-fg-muted'}>
              {SEND_WORD[m.status]}
              {m.status === 'error' && m.error ? <>: {m.error}</> : null}
            </span>
            {m.status === 'error' && m.onRetry && (
              <Button kind="ghost" size="sm" onClick={m.onRetry}>
                Повторить
              </Button>
            )}
          </div>
        )}
        {m.actions && <div className="flex flex-wrap gap-tight">{m.actions}</div>}
      </div>
    </li>
  )
}

export function ChatThread({ messages, label, state = 'ready', error, empty, earlier, pending, ownLabel = 'вы', className }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const prev = useRef<{ first?: string; last?: string; height: number; firstTop: number; atBottom: boolean }>({ height: 0, firstTop: 0, atBottom: true })
  const first = messages[0]?.id
  const last = messages[messages.length - 1]?.id

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const p = prev.current
    if (p.first !== undefined && first !== p.first && last === p.last) {
      // сверху добавили более ранние — держим на экране то же сообщение
      const was = messageNode(el, p.first)
      el.scrollTop = el.scrollTop + (was ? was.offsetTop - p.firstTop : el.scrollHeight - p.height)
    } else if ((last !== p.last && (p.atBottom || first !== p.first || messages[messages.length - 1]?.direction === 'out')) || (pending && p.atBottom)) {
      el.scrollTop = el.scrollHeight
    }
    prev.current = { first, last, height: el.scrollHeight, firstTop: messageNode(el, first)?.offsetTop ?? 0, atBottom: el.scrollHeight - el.scrollTop - el.clientHeight < 48 }
  }, [first, last, messages, pending])

  // лента прижата к низу, а содержимое выросло или окно ленты сжалось — остаёмся внизу
  useLayoutEffect(() => {
    const el = scroller.current
    const list = el?.querySelector('ol')
    if (!el || !list || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (prev.current.atBottom) el.scrollTop = el.scrollHeight
    })
    ro.observe(list)
    ro.observe(el)
    return () => ro.disconnect()
  }, [state, messages.length === 0])

  const onScroll = () => {
    const el = scroller.current
    if (el) prev.current.atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  if (state === 'error')
    return (
      <div data-slot="chat-thread" className={className}>
        <StateView kind="ошибка" title={error?.title ?? 'Переписка не загрузилась'} description={error?.description} action={error?.onRetry && <Button kind="secondary" onClick={error.onRetry}>Повторить</Button>} />
      </div>
    )

  if (state === 'loading')
    return (
      <div data-slot="chat-thread" className={cx('flex min-h-0 flex-col', className)}>
        <div role="status" aria-busy="true" data-state="загрузка">
          <span className="sr-only">{`${label}: загрузка`}</span>
          <ul className="m-0 flex list-none flex-col gap-blocks p-blocks">
            {(['in', 'out', 'in'] as const).map((d, i) => (
              <li key={i} className={cx('flex flex-col gap-tight', d === 'out' ? 'items-end' : 'items-start')}>
                <SkeletonText width="33%" />
                <div className={cx('flex w-2/3 flex-col gap-items px-compact py-items', d === 'out' ? SUNKEN : SURFACE)}>
                  <SkeletonText />
                  <SkeletonText width="50%" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )

  if (messages.length === 0 && !pending)
    return (
      <div data-slot="chat-thread" className={className}>
        <StateView kind={empty?.kind ?? 'первый запуск'} title={empty?.title ?? 'Сообщений пока нет'} description={empty?.description} action={empty?.action} />
      </div>
    )

  return (
    <div data-slot="chat-thread" ref={scroller} onScroll={onScroll} style={{ overflowAnchor: 'none' }} className={cx('relative flex min-h-0 flex-col overflow-y-auto', className)}>
      {earlier && (
        <div className="flex justify-center px-blocks pt-blocks">
          {earlier.done ? (
            <span data-part="earlier-done" className="text-caption text-fg-muted">
              Это вся переписка
            </span>
          ) : (
            earlier.loading ? (
              <InlineLoading description="Загружаем более ранние" data-part="earlier" />
            ) : (
              <Button kind="ghost" size="sm" renderIcon={ArrowUp} onClick={earlier.onLoad} data-part="earlier">
                Показать более ранние
              </Button>
            )
          )}
        </div>
      )}
      <div role="log" aria-label={label}>
        <ol className="m-0 flex list-none flex-col gap-blocks p-blocks">
          {messages.map((m, i) => (
            <Fragment key={m.id}>
              {m.day && m.day !== messages[i - 1]?.day && (
                <li data-part="day" className="flex items-center gap-compact text-caption text-fg-muted">
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                  <span>{m.day}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                </li>
              )}
              <Message m={m} ownLabel={ownLabel} />
            </Fragment>
          ))}
          {pending && (
            <li data-part="pending" className="flex items-center gap-items text-caption text-fg-muted">
              <span aria-hidden="true" className="inline-flex size-items rounded-full bg-fg-muted" />
              {pending}
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
