/**
 * Карточка: заголовок, статус (`Tag` или `IconIndicator`) рядом с ним, до трёх фактов и одно тихое действие на лице; «подробнее» раскрывается за 0,6 с,
 * соседи едут, а не прыгают. Внутри «подробнее» — такие же карточки, не глубже двух уровней (П7).
 */
import { createContext, useContext, useId, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Expand, chevron, useDisclosure } from '../lib/disclosure'
import { Icon } from './Icon'
import { Surface } from './Surface'

const DepthContext = createContext(0)

export interface CardProps {
  title: ReactNode
  /** Статус рядом с заголовком: `<Tag>` или `<IconIndicator>`. */
  status?: ReactNode
  /** Факты лица — не больше трёх. */
  facts?: ReactNode[]
  /** Одно действие лица — тихая кнопка рядом с причиной. */
  action?: ReactNode
  /** Что за «подробнее»: текст, таблица, вложенные карточки. */
  more?: ReactNode
  className?: string
}

export function Card({ title, status, facts = [], action, more, className }: CardProps) {
  const depth = useContext(DepthContext)
  rule(facts.length <= 3, `на лице карточки ${facts.length} фактов — не больше 3 (П7), остальное — в «подробнее»`)
  rule(!(more && depth >= 2), 'раскрытие глубже 2 уровней (П7): третий уровень — отдельный экран')
  const fold = useDisclosure()
  const id = useId()
  return (
    <Surface as="article" data-slot="card" data-depth={String(depth)} aria-labelledby={`${id}-t`} flush className={className}>
      <div data-part="body" className="flex min-w-0 flex-col gap-items p-blocks">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-items">
          <h3 id={`${id}-t`} data-part="title" className="m-0 min-w-0 text-heading">
            {title}
          </h3>
          {status}
        </div>
        {facts.length > 0 && (
          <ul data-part="facts" className="m-0 flex list-none flex-col gap-tight p-0 text-body text-fg-muted">
            {facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
        {(action || more) && (
          <div className="flex flex-wrap items-center justify-between gap-items">
            {action ?? <span />}
            {more && (
              <button
                type="button"
                {...fold.trigger}
                className={cx('inline-flex min-h-dense cursor-pointer items-center gap-tight rounded-control px-items text-body text-accent hover:underline', FOCUS)}
              >
                подробнее
                <Icon name="chevron-down" className={chevron(fold.open)} />
              </button>
            )}
          </div>
        )}
      </div>
      {more && (
        <Expand id={fold.id} open={fold.open}>
          <DepthContext.Provider value={depth + 1}>
            <div className="flex flex-col gap-items border-t border-line p-blocks">{more}</div>
          </DepthContext.Provider>
        </Expand>
      )}
    </Surface>
  )
}
