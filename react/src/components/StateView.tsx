/**
 * Состояния «пусто / ошибка / загрузка» (шаблон CONCEPT §3.4, принцип П12). Слова состояний — из матрицы облика
 * (design/matrix.yaml → states): первый запуск, всё сделано, ничего не найдено, нет доступа, ошибка, загрузка.
 * «Всё сделано» и «первый запуск» — разные экраны. Загрузка — скелет той же формы, что содержимое (П13, без прыжка).
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type StateKind = 'первый запуск' | 'всё сделано' | 'ничего не найдено' | 'нет доступа' | 'ошибка'

const ICON: Record<StateKind, 'neutral' | 'success' | 'error' | 'warning'> = {
  'первый запуск': 'neutral',
  'всё сделано': 'success',
  'ничего не найдено': 'neutral',
  'нет доступа': 'warning',
  ошибка: 'error',
}
const MARK = { neutral: 'text-icon-secondary', success: 'text-status-success', error: 'text-status-error', warning: 'text-status-warning' } as const

export interface StateViewProps {
  kind: StateKind
  title: ReactNode
  description?: ReactNode
  /** Что сделать дальше: `<ActionArea primary>` или тихая кнопка («Повторить», «Сбросить фильтры»). */
  action?: ReactNode
  className?: string
}

export function StateView({ kind, title, description, action, className }: StateViewProps) {
  const tone = ICON[kind]
  return (
    <div
      data-slot="state-view"
      data-state={kind}
      role={kind === 'ошибка' ? 'alert' : 'status'}
      className={cx('flex flex-col items-start gap-3 border border-border-subtle-01 bg-layer-01 px-4 py-8 md:px-8', className)}
    >
      <ToneIcon tone={tone} className={cx('size-6', MARK[tone])} />
      <div className="flex flex-col gap-1">
        <p className="m-0 text-heading-compact-02 text-text-primary">{title}</p>
        {description && <p className="m-0 max-w-prose text-body-01 text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** Полоса скелета: занимает место будущего текста, чтобы содержимое не прыгнуло. */
export function Skeleton({ className, width = 'full' }: { className?: string; width?: 'full' | '3/4' | '1/2' | '1/3' }) {
  const W = { full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3' } as const
  return <span aria-hidden="true" data-slot="skeleton" className={cx('block h-4 bg-skeleton-background', W[width], className)} />
}

/** Загрузка области: скелет и скрытая подпись для читалки. */
export function Loading({ label = 'загрузка', children }: { label?: string; children: ReactNode }) {
  return (
    <div data-slot="loading" data-state="загрузка" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
