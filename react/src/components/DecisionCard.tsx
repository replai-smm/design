/**
 * Карточка решения в ленте (чат orbit): вопрос, на который отвечает только человек, — разрешить команду агенту,
 * выкатить на прод. Слово уходит кнопкой, а не текстом. Поверхность с меткой «ждёт тебя» (тон «инфо» — контраст,
 * не цвет); отвечено — метки нет, вместо кнопок слово ответа и время. До трёх фактов (П7), одна главная и тихие (П5),
 * опасное не рядом (П10); карточка — своя область главной: не спорит с главной поля ответа.
 */
import { useId, type ReactNode } from 'react'
import { rule } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { ActionArea, type PrimaryAction } from './Button'
import { Icon } from './Icon'
import { SurfaceProvider } from './layout'
import { Surface } from './Surface'

export interface DecisionAnswer {
  /** Слово ответа: «Разрешено», «На прод», «Не делаем». */
  word: ReactNode
  time?: string
  tone?: Extract<Tone, 'хорошо' | 'опасно' | 'нейтрально'>
}

export interface DecisionCardProps {
  /** Вид вопроса и id: «Разрешение», «Изменение n5t2vd». */
  kicker?: ReactNode
  title: ReactNode
  /** Факты лица — не больше трёх. */
  facts?: ReactNode[]
  /** Подробность: команда (`CodeBlock`), ссылка на PR. */
  detail?: ReactNode
  /** Вопрос словами: «На прод?». */
  question?: ReactNode
  primary: PrimaryAction
  /** Другие ответы: `<Button variant="secondary|ghost">`. */
  actions?: ReactNode
  /** Ответ уже дан — кнопок нет. */
  answered?: DecisionAnswer
  className?: string
}

export function DecisionCard({ kicker, title, facts = [], detail, question, primary, actions, answered, className }: DecisionCardProps) {
  rule(facts.length <= 3, `на лице карточки решения ${facts.length} фактов — не больше 3 (П7)`)
  const id = useId()
  return (
    <Surface as="article" mark={answered ? undefined : 'инфо'} data-slot="decision-card" data-state={answered ? 'answered' : 'waiting'} aria-labelledby={`${id}-t`} className={`w-full gap-compact ${className ?? ''}`}>
      <header className="flex min-w-0 flex-col gap-tight">
        {kicker && <p className="m-0 text-caption text-fg-muted">{kicker}</p>}
        <h3 id={`${id}-t`} data-part="title" className="m-0 text-heading break-words">
          {title}
        </h3>
      </header>
      {facts.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-tight p-0 text-body text-fg-muted">
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      {detail}
      {answered ? (
        <p data-part="answer" className="m-0 inline-flex items-center gap-items text-body">
          <Icon tone={answered.tone ?? 'нейтрально'} />
          <span>{answered.word}</span>
          {answered.time && <time className="text-fg-muted">{answered.time}</time>}
        </p>
      ) : (
        <SurfaceProvider name="решение">
          {question && <p className="m-0 text-body">{question}</p>}
          <ActionArea primary={primary} label={typeof title === 'string' ? `${title}: ответ` : 'Ответ'}>
            {actions}
          </ActionArea>
        </SurfaceProvider>
      )}
    </Surface>
  )
}
