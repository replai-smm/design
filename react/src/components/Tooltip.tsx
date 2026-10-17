/**
 * Подсказка — свойство одного элемента: короткий текст на инверсии у кнопки или ссылки при наведении и фокусе,
 * Esc прячет, читалка слышит её как описание. Не место для нужного: на телефоне наведения нет — важное пишут словами
 * рядом. Ребёнок — один элемент, который берёт фокус; не берёт — ошибка в разработке.
 */
import { Children, isValidElement, useCallback, type ReactElement, type ReactNode } from 'react'
import { Tooltip as RTooltip } from 'radix-ui'
import { rule } from '../lib/cx'

export interface TooltipProps {
  /** Текст подсказки: коротко, одна-две строки. */
  content: ReactNode
  /** Один элемент, который берёт фокус. */
  children: ReactElement
}

const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]'

export function Tooltip({ content, children }: TooltipProps) {
  rule(Children.count(children) === 1 && isValidElement(children), 'у подсказки один ребёнок — элемент, который берёт фокус (кнопка, ссылка)')
  const check = useCallback((el: HTMLElement | null) => {
    if (!el) return
    rule(el.matches(FOCUSABLE) && el.tabIndex >= 0, `подсказка у элемента <${el.tagName.toLowerCase()}>, который не берёт фокус: с клавиатуры её не открыть — оберните в кнопку`)
  }, [])
  return (
    <RTooltip.Provider delayDuration={100} skipDelayDuration={300}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild ref={check}>
          {children}
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            data-slot="tooltip"
            side="top"
            sideOffset={4}
            collisionPadding={8}
            className="ds-pop z-50 max-w-2xs rounded-control bg-inverse px-compact py-tight text-body text-fg-inverse shadow-raised"
          >
            {content}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  )
}
