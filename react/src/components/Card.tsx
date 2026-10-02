/**
 * Карточка — оболочка-фрактал дашборда (матрёшка): лицо и «подробнее». Внутри «подробнее» — такие же карточки.
 * Правила (П7, П8, П10): на лице не больше 3 фактов и 1 действия; раскрытие — не глубже 2 уровней;
 * подпись раскрытия — из словаря («подробнее»). Раскрытие — 0,6 с, соседи едут плавно, без прыжка.
 * Цвет: палитра karta — рамка и полоса цвета Карты, слово обычным текстом; product — метка статуса продукта.
 */
import { createContext, useContext, useId, useState, type ReactNode } from 'react'
import { cx, rule } from '../lib/cx'
import { kartaKeyOf, statusOf, TONE_KEY, toneOf, type Palette, type StatusId } from '../lib/status'
import { StatusBadge, ToneIcon } from './StatusBadge'

const STRIPE = { info: 'border-l-support-info', warning: 'border-l-status-warning', error: 'border-l-status-error' } as const
const KMARK = { info: 'text-support-info', warning: 'text-status-warning', error: 'text-status-error' } as const

const DepthContext = createContext(0)

export interface CardProps {
  title: ReactNode
  /** Статус узла: цвет рамки (karta) или метка (product). */
  status?: StatusId
  palette?: Palette
  /** Факты лица — не больше трёх. */
  face?: ReactNode[]
  /** Одно действие лица — тихая кнопка рядом с причиной. */
  action?: ReactNode
  /** Что за «подробнее»: текст, таблица, вложенные карточки. */
  more?: ReactNode
  moreLabel?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Заголовок как ссылка на экран узла. */
  href?: string
  className?: string
}

export function Card({
  title,
  status,
  palette = 'karta',
  face = [],
  action,
  more,
  moreLabel = 'подробнее',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  href,
  className,
}: CardProps) {
  const depth = useContext(DepthContext)
  rule(face.length <= 3, `на лице карточки ${face.length} фактов — не больше 3 (П7), остальное — в «подробнее»`)
  rule(!(more && depth >= 2), 'раскрытие глубже 2 уровней (П7): третий уровень — отдельный экран')
  const [own, setOwn] = useState(defaultOpen)
  const open = openProp ?? own
  const toggle = () => {
    setOwn(!open)
    onOpenChange?.(!open)
  }
  const id = useId()
  const k = status && palette === 'karta' ? kartaKeyOf(status) : null
  const tone = status ? TONE_KEY[toneOf(status)] : 'neutral'
  return (
    <article
      data-slot="card"
      data-status={status}
      data-depth={depth}
      aria-labelledby={`${id}-t`}
      className={cx(
        'flex min-w-0 flex-col border border-border-subtle-01 bg-layer-01 text-text-primary',
        palette === 'karta' && 'border-l-4',
        k ? STRIPE[k] : palette === 'karta' && 'border-l-border-subtle-01',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 id={`${id}-t`} className="m-0 min-w-0 text-heading-compact-02">
            {href ? (
              <a href={href} className="text-text-primary hover:text-link-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          {status && palette === 'product' && <StatusBadge status={status} />}
        </div>
        {status && palette === 'karta' && (
          <p data-slot="card-status" className="m-0 inline-flex items-center gap-1 text-body-compact-01 text-text-secondary">
            <ToneIcon tone={k ? tone : 'neutral'} className={k ? KMARK[k] : 'text-icon-secondary'} />
            {statusOf(status).say}
          </p>
        )}
        {face.length > 0 && (
          <ul data-slot="card-face" className="m-0 flex list-none flex-col gap-1 p-0 text-body-01 text-text-secondary">
            {face.map((f, i) => (
              <li key={i} data-slot="fact">
                {f}
              </li>
            ))}
          </ul>
        )}
        {(action || more) && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {action ?? <span />}
            {more && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${id}-m`}
                onClick={toggle}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1 px-2 text-body-compact-01 text-link-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
              >
                {moreLabel}
                <svg viewBox="0 0 16 16" aria-hidden="true" className={cx('size-4 transition-transform duration-move ease-move', open && 'rotate-180')}>
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      {more && (
        <div id={`${id}-m`} className="ds-expand" data-open={open} inert={!open}>
          <div>
            <DepthContext.Provider value={depth + 1}>
              <div className="flex flex-col gap-3 border-t border-border-subtle-01 p-4">{more}</div>
            </DepthContext.Provider>
          </div>
        </div>
      )}
    </article>
  )
}
