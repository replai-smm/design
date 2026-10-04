/**
 * Переписка (DF: «Сообщения», «✨ ИИ», «Чаты»; опись DF §6.2). Лента сообщений: входящие слева, наши справа, автор,
 * время, вложения, разделитель дня; «⇡ показать более ранние» сверху; прокрутка вниз при новом сообщении.
 * - Цвет пузыря не один: у наших подпись автора «вы» (или своя) и выравнивание вправо; у ошибки — знак и слово.
 * - Лента — `role="log"`: читалка слышит новые сообщения, не перечитывая старые.
 * - Более ранние вставляются сверху без прыжка: прокрутка держит то сообщение, что было на экране.
 * - Аватар — слот (`avatar`): кружок даёт продукт или `Avatar` ДС; лента от него не зависит.
 * Состояния: загрузка (скелет пузырей той же формы), ошибка, пусто (первый запуск — «спросите первое»), много.
 */
import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Loading, Skeleton, StateView, type StateKind } from './StateView'
import { ToneIcon } from './StatusBadge'

export interface ChatMessage {
  id: string
  /** in — от собеседника (слева), out — от нас (справа). */
  direction: 'in' | 'out'
  /** Кто написал: имя клиента, «ИИ», имя менеджера. */
  author?: ReactNode
  /** Кружок автора — `<Avatar>` или своя картинка. */
  avatar?: ReactNode
  /** Время на экране: «14:20». */
  time: string
  /** То же время машинно (ISO) — для `<time dateTime>`. */
  datetime?: string
  /** День сообщения на экране («сегодня», «3 октября»): при смене дня в ленте встаёт разделитель. */
  day?: string
  text?: ReactNode
  /** Фото, файлы, «[виды вложений]» — под текстом. */
  attachments?: ReactNode
  /** Только у наших: отправляется / ушло / не ушло. */
  status?: 'sending' | 'sent' | 'error'
  /** Почему не ушло — рядом со знаком ошибки. */
  error?: ReactNode
  onRetry?: () => void
  /** Тихие кнопки под сообщением: «Копировать», «→ в Постинг». */
  actions?: ReactNode
}

export interface ChatThreadProps {
  messages: ChatMessage[]
  /** Подпись ленты для читалки: «Переписка с Анной». */
  label: string
  /** ready — сообщения; loading — скелет; error — ошибка с «Повторить». */
  state?: 'ready' | 'loading' | 'error'
  error?: { title: ReactNode; description?: ReactNode; onRetry?: () => void }
  /** Что показать в пустой переписке. */
  empty?: { kind: Exclude<StateKind, 'ошибка'>; title: ReactNode; description?: ReactNode; action?: ReactNode }
  /** «⇡ показать более ранние»: onLoad — догрузить; done — всё загружено. */
  earlier?: { onLoad: () => void; loading?: boolean; done?: boolean; label?: ReactNode; doneLabel?: ReactNode }
  /** Строка «ИИ думает…» под последним сообщением. */
  pending?: ReactNode
  /** Подпись наших сообщений без автора. */
  ownLabel?: string
  className?: string
}

const messageNode = (el: HTMLElement, id?: string) =>
  id === undefined ? undefined : [...el.querySelectorAll<HTMLElement>('[data-slot=chat-message]')].find((n) => n.dataset.id === id)

const SEND_WORD = { sending: 'отправляется…', sent: 'отправлено', error: 'не отправлено' } as const

function Bubble({ m, ownLabel }: { m: ChatMessage; ownLabel: string }) {
  const out = m.direction === 'out'
  return (
    <li data-slot="chat-message" data-id={m.id} data-direction={m.direction} data-status={m.status} className={cx('flex min-w-0 gap-2', out ? 'flex-row-reverse' : 'flex-row')}>
      {m.avatar && <span className="flex shrink-0 items-end">{m.avatar}</span>}
      <div className={cx('flex min-w-0 max-w-4/5 flex-col gap-1 md:max-w-2/3', out ? 'items-end' : 'items-start')}>
        <div className={cx('flex flex-wrap items-baseline gap-2 text-label-01 text-text-secondary', out && 'flex-row-reverse')}>
          <span className="text-text-primary">{m.author ?? (out ? ownLabel : null)}</span>
          <time dateTime={m.datetime}>{m.time}</time>
        </div>
        <div
          className={cx(
            'flex min-w-0 flex-col gap-2 px-4 py-3 text-body-01 break-words whitespace-pre-wrap text-text-primary',
            out ? 'bg-layer-accent-01' : 'border border-border-subtle-01 bg-layer-01',
            m.status === 'error' && 'border border-support-error',
            m.status === 'sending' && 'text-text-secondary',
          )}
        >
          {m.text}
          {m.attachments && <div className="flex flex-wrap gap-2">{m.attachments}</div>}
        </div>
        {out && m.status && m.status !== 'sent' && (
          <div className="flex flex-wrap items-center gap-2 text-label-01" role={m.status === 'error' ? 'alert' : undefined}>
            {m.status === 'error' && <ToneIcon tone="error" className="size-4 text-status-error" />}
            <span className={m.status === 'error' ? 'text-text-error' : 'text-text-secondary'}>
              {SEND_WORD[m.status]}
              {m.status === 'error' && m.error ? <>: {m.error}</> : null}
            </span>
            {m.status === 'error' && m.onRetry && (
              <Button variant="ghost" size="sm" onClick={m.onRetry}>
                Повторить
              </Button>
            )}
          </div>
        )}
        {m.actions && <div className="flex flex-wrap gap-1">{m.actions}</div>}
      </div>
    </li>
  )
}

export function ChatThread({ messages, label, state = 'ready', error, empty, earlier, pending, ownLabel = 'вы', className }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null)
  // что было в ленте на прошлой отрисовке: первое и последнее сообщение, высота, прижата ли лента к низу
  const prev = useRef<{ first?: string; last?: string; height: number; firstTop: number; atBottom: boolean }>({ height: 0, firstTop: 0, atBottom: true })
  const first = messages[0]?.id
  const last = messages[messages.length - 1]?.id

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const p = prev.current
    if (p.first !== undefined && first !== p.first && last === p.last) {
      // сверху добавили более ранние — держим на экране то же сообщение: сдвиг — на сколько оно уехало вниз
      // (якорь прокрутки браузера выключен, чтобы не сдвигать дважды); не нашли его — на сколько выросла лента
      const was = messageNode(el, p.first)
      el.scrollTop = el.scrollTop + (was ? was.offsetTop - p.firstTop : el.scrollHeight - p.height)
    } else if ((last !== p.last && (p.atBottom || first !== p.first || messages[messages.length - 1]?.direction === 'out')) || (pending && p.atBottom)) {
      // новое внизу: прокрутить к нему, если человек и так был внизу, это наше сообщение или открыта другая переписка
      el.scrollTop = el.scrollHeight
    }
    prev.current = { first, last, height: el.scrollHeight, firstTop: messageNode(el, first)?.offsetTop ?? 0, atBottom: el.scrollHeight - el.scrollTop - el.clientHeight < 48 }
  }, [first, last, messages, pending])

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    prev.current.atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  if (state === 'error')
    return (
      <div data-slot="chat-thread" className={className}>
        <StateView
          kind="ошибка"
          title={error?.title ?? 'Переписка не загрузилась'}
          description={error?.description}
          action={error?.onRetry && <Button variant="tertiary" onClick={error.onRetry}>Повторить</Button>}
        />
      </div>
    )

  if (state === 'loading')
    return (
      <div data-slot="chat-thread" className={cx('flex min-h-0 flex-col', className)}>
        <Loading label={`${label}: загрузка`}>
          <ul className="m-0 flex list-none flex-col gap-4 p-4">
            {(['in', 'out', 'in'] as const).map((d, i) => (
              <li key={i} className={cx('flex flex-col gap-1', d === 'out' ? 'items-end' : 'items-start')}>
                <Skeleton width="1/3" className="h-3" />
                <div className={cx('flex w-2/3 flex-col gap-2 px-4 py-3', d === 'out' ? 'bg-layer-accent-01' : 'border border-border-subtle-01 bg-layer-01')}>
                  <Skeleton />
                  <Skeleton width="1/2" />
                </div>
              </li>
            ))}
          </ul>
        </Loading>
      </div>
    )

  if (messages.length === 0 && !pending)
    return (
      <div data-slot="chat-thread" className={className}>
        <StateView kind={empty?.kind ?? 'первый запуск'} title={empty?.title ?? 'Сообщений пока нет'} description={empty?.description} action={empty?.action} />
      </div>
    )

  return (
    <div data-slot="chat-thread" ref={scroller} onScroll={onScroll} style={{ overflowAnchor: 'none' }} className={cx('flex min-h-0 flex-col overflow-y-auto', className)}>
      {earlier && (
        <div className="flex justify-center px-4 pt-4">
          {earlier.done ? (
            <span data-slot="chat-earlier-done" className="text-label-01 text-text-secondary">
              {earlier.doneLabel ?? 'Это вся переписка'}
            </span>
          ) : (
            <Button variant="ghost" size="sm" loading={earlier.loading} onClick={earlier.onLoad} data-slot="chat-earlier">
              <span aria-hidden="true">⇡</span> {earlier.label ?? 'Показать более ранние'}
            </Button>
          )}
        </div>
      )}
      <div role="log" aria-label={label}>
        <ol className="m-0 flex list-none flex-col gap-4 p-4">
        {messages.map((m, i) => (
          <Fragment key={m.id}>
            {m.day && m.day !== messages[i - 1]?.day && (
              <li data-slot="chat-day" className="flex items-center gap-3 text-label-01 text-text-secondary">
                <span aria-hidden="true" className="h-px flex-1 bg-border-subtle-01" />
                <span>{m.day}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-border-subtle-01" />
              </li>
            )}
            <Bubble m={m} ownLabel={ownLabel} />
          </Fragment>
        ))}
        {pending && (
          <li data-slot="chat-pending" className="flex items-center gap-2 text-label-01 text-text-secondary">
            <span aria-hidden="true" className="inline-flex size-2 rounded-full bg-icon-secondary" />
            {pending}
          </li>
        )}
        </ol>
      </div>
    </div>
  )
}
