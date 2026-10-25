/**
 * Раскрытие (Carbon: Accordion) — заголовок строкой и содержимое по требованию: правила экрана («Как это работает»),
 * редкие настройки, подробности. Строка во всю ширину, знак справа, линии сверху и снизу; несколько подряд — одна
 * стопка. Раскрытие ≤ 2 уровней: третий — отдельный экран. Механика — общая (lib/disclosure.tsx).
 */
import type { ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Expand, chevron, useDisclosure } from '../lib/disclosure'
import { Icon } from './Icon'

export interface AccordionProps {
  /** Заголовок строки: «Как это работает». */
  title: ReactNode
  /** Открыто при показе. */
  defaultOpen?: boolean
  children?: ReactNode
  className?: string
}

export function Accordion({ title, defaultOpen = false, children, className }: AccordionProps) {
  const fold = useDisclosure(defaultOpen)
  return (
    <div data-slot="accordion" className={cx('min-w-0 border-b border-line first:border-t', className)}>
      <button
        type="button"
        {...fold.trigger}
        className={cx('flex min-h-touch w-full cursor-pointer items-center justify-between gap-items px-compact text-start text-body text-fg hover:bg-hover md:min-h-control', FOCUS)}
      >
        <span data-part="title" className="min-w-0">
          {title}
        </span>
        <Icon name="chevron-down" className={chevron(fold.open)} />
      </button>
      <Expand id={fold.id} open={fold.open}>
        <div className="max-w-prose px-compact pt-tight pb-blocks text-body text-fg-muted">{children}</div>
      </Expand>
    </div>
  )
}
