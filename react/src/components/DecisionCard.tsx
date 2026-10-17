/**
 * Карточка решения в ленте: вопрос, на который отвечает только человек, — разрешить команду агенту, выкатить
 * изменение на прод. Слово уходит кнопкой, а не текстом в чат.
 * - Лицо: что (`kicker`: «Разрешение», «Изменение n5t2vd»), заголовок, до трёх фактов (П7), подробность (команда —
 *   `CodeBlock`), вопрос. Ниже — ответы: одна главная (`primary`) и тихие рядом (П5); опасное не рядом с главной (П10).
 * - Карточка, ждущая слова, — своя поверхность, как открытая панель: её главная не спорит с главной поля ответа.
 * - На телефоне — во всю ширину, главная внизу и во всю ширину (П6, `ActionArea` так и ставит).
 * - Ответили — кнопок нет, остаётся слово ответа и время (`answered`): лента — история, переголосовать нельзя.
 * - Рамка слева — знак «ждёт тебя» (цвет интерактива), отвеченная — без цвета.
 */
import { useId, type ReactNode } from 'react'
import { cx, rule } from '../lib/cx'
import { ActionArea, type PrimaryAction } from './Button'
import { SurfaceProvider } from './layout'
import { ToneIcon } from './StatusBadge'

export interface DecisionAnswer {
  /** Слово ответа: «Разрешено», «На прод», «Не делаем». */
  word: ReactNode
  time?: string
  tone?: 'success' | 'error' | 'neutral'
}

export interface DecisionCardProps {
  /** Вид вопроса и id: «Разрешение», «Изменение n5t2vd». */
  kicker?: ReactNode
  title: ReactNode
  /** Факты лица — не больше трёх. */
  facts?: ReactNode[]
  /** Подробность: команда, diff, ссылка на PR. */
  detail?: ReactNode
  /** Вопрос словами: «На прод?». */
  question?: ReactNode
  /** Главный ответ. */
  primary: PrimaryAction
  /** Другие ответы: `<Button variant="secondary|tertiary|ghost">`. */
  actions?: ReactNode
  /** Ответ уже дан — кнопок нет. */
  answered?: DecisionAnswer
  className?: string
}

const MARK = { success: 'text-status-success', error: 'text-status-error', neutral: 'text-status-neutral' } as const

export function DecisionCard({ kicker, title, facts = [], detail, question, primary, actions, answered, className }: DecisionCardProps) {
  rule(facts.length <= 3, `на лице карточки решения ${facts.length} фактов — не больше 3 (П7)`)
  const id = useId()
  const tone = answered?.tone ?? 'neutral'
  return (
    <article
      data-slot="decision-card"
      data-state={answered ? 'answered' : 'waiting'}
      aria-labelledby={`${id}-t`}
      className={cx(
        'flex w-full min-w-0 flex-col gap-3 border border-l-4 border-border-subtle-01 bg-layer-01 p-4 text-text-primary',
        answered ? 'border-l-border-subtle-01' : 'border-l-border-interactive',
        className,
      )}
    >
      <header className="flex min-w-0 flex-col gap-1">
        {kicker && <p className="m-0 text-label-01 text-text-secondary">{kicker}</p>}
        <h3 id={`${id}-t`} className="m-0 text-heading-compact-02 break-words">
          {title}
        </h3>
      </header>
      {facts.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-body-compact-01 text-text-secondary">
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      {detail}
      {answered ? (
        <p data-slot="decision-answer" className="m-0 inline-flex items-center gap-2 text-body-compact-01">
          <ToneIcon tone={tone} className={MARK[tone]} />
          <span>{answered.word}</span>
          {answered.time && <time className="text-text-secondary">{answered.time}</time>}
        </p>
      ) : (
        <SurfaceProvider name="решение">
          {question && <p className="m-0 text-body-01">{question}</p>}
          <ActionArea primary={primary} label={typeof title === 'string' ? `${title}: ответ` : 'Ответ'}>
            {actions}
          </ActionArea>
        </SurfaceProvider>
      )}
    </article>
  )
}
