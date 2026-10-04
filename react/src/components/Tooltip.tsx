/**
 * Подсказка (Carbon Tooltip) на Radix Tooltip: короткий текст на тёмной (в тёмной теме — светлой) плашке у элемента.
 * Появляется при наведении и при фокусе с клавиатуры, Esc прячет; читалка слышит её как описание элемента.
 * Подсказка — не место для нужного: без неё элемент понятен (у значка-кнопки есть `aria-label`). На телефоне
 * наведения нет — важное пишем словами рядом, а не в подсказке.
 * Ребёнок — один элемент, который берёт фокус (кнопка, ссылка); не берёт — в разработке ошибка.
 */
import { Children, isValidElement, useCallback, type ReactElement, type ReactNode } from 'react'
import { Tooltip as RTooltip } from 'radix-ui'
import { cx, rule } from '../lib/cx'

export interface TooltipProps {
  /** Текст подсказки: коротко, одна-две строки. */
  content: ReactNode
  /** Один элемент, который берёт фокус. */
  children: ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** Задержка до показа, мс (Carbon: 100 мс). */
  delay?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]'

export function Tooltip({ content, children, side = 'top', align = 'center', delay = 100, open, defaultOpen, onOpenChange, className }: TooltipProps) {
  rule(Children.count(children) === 1 && isValidElement(children), 'у подсказки один ребёнок — элемент, который берёт фокус (кнопка, ссылка)')
  const check = useCallback((el: HTMLElement | null) => {
    if (!el) return
    rule(el.matches(FOCUSABLE) && el.tabIndex >= 0, `подсказка у элемента <${el.tagName.toLowerCase()}>, который не берёт фокус: с клавиатуры её не открыть — оберните в кнопку`)
  }, [])
  return (
    <RTooltip.Provider delayDuration={delay} skipDelayDuration={300}>
      <RTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RTooltip.Trigger asChild ref={check}>
          {children}
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            data-slot="tooltip"
            side={side}
            align={align}
            sideOffset={4}
            collisionPadding={8}
            className={cx('ds-pop z-50 max-w-72 bg-background-inverse px-4 py-2 text-body-compact-01 text-text-inverse shadow-raised', className)}
          >
            {content}
            <RTooltip.Arrow width={12} height={6} className="fill-background-inverse" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  )
}
