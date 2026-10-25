/**
 * Подсказка (Carbon: Tooltip) — свойство одного элемента: короткий текст на инверсии у кнопки или ссылки при наведении и
 * фокусе, Esc прячет. `label` — имя элемента для читалки (aria-labelledby: текст ребёнка не читается), `description` —
 * описание вдобавок к тексту ребёнка (aria-describedby); оба — `label` главнее, как у Carbon. Не место для нужного: на
 * телефоне наведения нет — важное пишут словами рядом. Ребёнок — один элемент, который берёт фокус; не берёт — ошибка
 * в разработке.
 */
import { Children, cloneElement, isValidElement, useCallback, useId, type ReactElement, type ReactNode } from 'react'
import { Tooltip as RTooltip } from 'radix-ui'
import { cx, rule } from '../lib/cx'
import type { PopoverAlignment } from '../lib/vocab'


export interface TooltipProps {
  /** Имя элемента — текст подсказки (aria-labelledby). */
  label?: ReactNode
  /** Описание элемента — текст подсказки (aria-describedby); при `label` не берётся. */
  description?: ReactNode
  /** Один элемент, который берёт фокус. */
  children: ReactElement
  /** По умолчанию сверху по центру. */
  align?: PopoverAlignment
  /** Задержка перед показом, мс (по умолчанию 100). */
  enterDelayMs?: number
  /** Открыта при показе. */
  defaultOpen?: boolean
  className?: string
}

const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]'

export function Tooltip({ label, description, children, align = 'top', enterDelayMs = 100, defaultOpen, className }: TooltipProps) {
  rule(Children.count(children) === 1 && isValidElement(children), 'у подсказки один ребёнок — элемент, который берёт фокус (кнопка, ссылка)')
  rule(label !== undefined || description !== undefined, 'у подсказки нет текста: label (имя элемента) или description (описание)')
  const id = useId()
  const check = useCallback((el: HTMLElement | null) => {
    if (!el) return
    rule(el.matches(FOCUSABLE) && el.tabIndex >= 0, `подсказка у элемента <${el.tagName.toLowerCase()}>, который не берёт фокус: с клавиатуры её не открыть — оберните в кнопку`)
  }, [])
  const text = label ?? description
  const [side, at = 'center'] = align.split('-') as [NonNullable<RTooltip.TooltipContentProps['side']>, NonNullable<RTooltip.TooltipContentProps['align']>?]
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, label !== undefined ? { 'aria-labelledby': id, 'aria-describedby': undefined } : { 'aria-describedby': id })
  return (
    <RTooltip.Provider delayDuration={enterDelayMs} skipDelayDuration={300}>
      <RTooltip.Root defaultOpen={defaultOpen}>
        <RTooltip.Trigger asChild ref={check}>
          {trigger}
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            data-slot="tooltip"
            side={side}
            align={at}
            sideOffset={4}
            collisionPadding={8}
            className={cx('ds-pop z-50 max-w-hint rounded-control bg-inverse px-compact py-tight text-body text-fg-inverse shadow-raised', className)}
          >
            {text}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
      <span id={id} hidden>
        {text}
      </span>
    </RTooltip.Provider>
  )
}
