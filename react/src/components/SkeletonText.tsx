/**
 * Скелет (Carbon: SkeletonText, SkeletonPlaceholder) — место будущего содержимого той же формы (П13: без прыжка, когда
 * данные придут). Полоса — роль тихой рамки: место, а не цвет. Скелет скрыт от читалки; «идёт загрузка» ей говорит
 * тот, кто грузит: `aria-busy="true"` на области и слово для читалки (паттерн «Загрузка»).
 */
import type { HTMLAttributes } from 'react'
import { cx } from '../lib/cx'

/** Ширина — доля строки: '100%', '75%', '50%'. */
type Percent = `${number}%`

export interface SkeletonTextProps {
  /** Несколько строк (абзац). */
  paragraph?: boolean
  /** Строк в абзаце (по умолчанию 3). */
  lineCount?: number
  /** Ширина строки, у абзаца — наибольшая; по умолчанию '100%'. */
  width?: Percent
  /** Высота заголовка, а не строки текста. */
  heading?: boolean
  className?: string
}

/** Строки скелета: одна или абзац; последняя строка абзаца короче. */
export function SkeletonText({ paragraph = false, lineCount = 3, width = '100%', heading = false, className }: SkeletonTextProps) {
  const line = cx('block rounded-control bg-line', heading ? 'h-groups' : 'h-icon')
  if (!paragraph) return <span aria-hidden="true" data-slot="skeleton-text" className={cx(line, className)} style={{ width }} />
  return (
    <span aria-hidden="true" data-slot="skeleton-text" className={cx('flex flex-col gap-items', className)} style={{ maxWidth: width }}>
      {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
        <span key={i} className={line} style={{ width: i === lineCount - 1 && lineCount > 1 ? '75%' : '100%' }} />
      ))}
    </span>
  )
}

export type SkeletonPlaceholderProps = HTMLAttributes<HTMLDivElement>

/** Место картинки, графика, плитки: размер задаёт `className` (по умолчанию 48 × 48). */
export function SkeletonPlaceholder({ className, ...rest }: SkeletonPlaceholderProps) {
  return <div aria-hidden="true" data-slot="skeleton-placeholder" className={cx('rounded-control bg-line', className ?? 'size-touch')} {...rest} />
}
