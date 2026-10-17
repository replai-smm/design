/**
 * Состояние вместо данных (П12): первый запуск, всё сделано, ничего не найдено, нет доступа, ошибка — слова матрицы
 * облика. Поверхность со знаком тона состояния, заголовком и одним действием («Повторить», «Сбросить фильтры»).
 * «Всё сделано» и «первый запуск» — разные состояния. Загрузка — не здесь: скелет той же формы (`Loading`, `Skeleton`).
 */
import type { ReactNode } from 'react'
import { STATE_TONE, type StateKind } from '../lib/vocab'
import { Icon } from './Icon'
import { Surface } from './Surface'

export interface StateViewProps {
  kind: StateKind
  title: ReactNode
  description?: ReactNode
  /** Что сделать дальше: тихая кнопка или `<ActionArea primary>`. */
  action?: ReactNode
  className?: string
}

export function StateView({ kind, title, description, action, className }: StateViewProps) {
  return (
    <Surface data-slot="state-view" data-state={kind} role={kind === 'ошибка' ? 'alert' : 'status'} className={className}>
      <div className="flex flex-col items-start gap-items">
        <div className="flex items-center gap-items">
          <Icon tone={STATE_TONE[kind]} />
          <p data-part="title" className="m-0 text-heading text-fg">
            {title}
          </p>
        </div>
        {description && <p className="m-0 max-w-prose text-body text-fg-muted">{description}</p>}
        {action}
      </div>
    </Surface>
  )
}
