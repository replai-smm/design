/**
 * Загрузка области: скелет той же формы, что содержимое (П13, без прыжка), и скрытая подпись для читалки.
 * Полоса скелета — роль тихой рамки: место будущего текста, не цвет.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

const W = { full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3' } as const

/** Полоса скелета высотой строки текста. */
export function Skeleton({ width = 'full', className }: { width?: keyof typeof W; className?: string }) {
  return <span aria-hidden="true" data-slot="skeleton" className={cx('block h-icon rounded-control bg-line', W[width], className)} />
}

/** Загрузка области: скелет внутри и «загрузка» для читалки. */
export function Loading({ label = 'загрузка', children }: { label?: string; children: ReactNode }) {
  return (
    <div data-slot="loading" data-state="загрузка" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
