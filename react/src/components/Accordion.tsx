/**
 * Раскрытие (Carbon: Accordion + AccordionItem) — заголовок строкой и содержимое по требованию: правила экрана («Как это
 * работает»), редкие настройки, подробности. Строка во всю ширину, знак справа (`align="start"` — слева), линии сверху и
 * снизу; пункты одного `Accordion` — одна стопка. Раскрытие ≤ 2 уровней: третий — отдельный экран. Механика — общая
 * (lib/disclosure.tsx). Высота строки — `size` sm 32 · md 40 · lg 48; без него — 48 на телефоне и 40 на ноутбуке.
 */
import { createContext, useContext, useEffect, type MouseEvent, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Expand, chevron, useDisclosure } from '../lib/disclosure'
import { SIZES, type Size } from '../lib/vocab'
import { Icon } from './Icon'

interface Look {
  align: 'start' | 'end'
  size?: Size
  isFlush: boolean
  disabled: boolean
}
const LookContext = createContext<Look>({ align: 'end', isFlush: false, disabled: false })

export interface AccordionProps {
  /** Знак раскрытия справа (по умолчанию) или слева. */
  align?: 'start' | 'end'
  /** Высота строки: sm 32 · md 40 · lg 48. */
  size?: Size
  /** Текст вровень с краем, без полей слева и справа (не с `align="start"`). */
  isFlush?: boolean
  /** Все пункты выключены. */
  disabled?: boolean
  /** Нумерованный список пунктов. */
  ordered?: boolean
  /** Пункты — `AccordionItem`. */
  children?: ReactNode
  className?: string
}

/** Стопка раскрытий. */
export function Accordion({ align = 'end', size, isFlush = false, disabled = false, ordered = false, children, className }: AccordionProps) {
  rule(size === undefined || SIZES.includes(size), `размера «${String(size)}» нет: sm · md · lg`)
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <LookContext.Provider value={{ align, size, isFlush: isFlush && align === 'end', disabled }}>
      <Tag data-slot="accordion" className={cx('m-0 min-w-0 list-none p-0', className)}>
        {children}
      </Tag>
    </LookContext.Provider>
  )
}

export interface AccordionItemProps {
  /** Заголовок строки: «Как это работает». */
  title?: ReactNode
  /** Открыто; смена свойства открывает и закрывает. */
  open?: boolean
  /** Нажали на заголовок: открыто ли теперь. */
  onHeadingClick?: (data: { isOpen: boolean; event: MouseEvent<HTMLButtonElement> }) => void
  /** Пункт выключен (сильнее, чем у всего `Accordion`). */
  disabled?: boolean
  /** Подпись кнопки для читалки, когда заголовка не видно. */
  'aria-label'?: string
  children?: ReactNode
  className?: string
}

const HEIGHT: Record<Size, string> = { sm: 'min-h-dense', md: 'min-h-control', lg: 'min-h-touch' }

/** Пункт раскрытия: кнопка-заголовок и содержимое. */
export function AccordionItem({ title, open = false, onHeadingClick, disabled, 'aria-label': ariaLabel, children, className }: AccordionItemProps) {
  const look = useContext(LookContext)
  const fold = useDisclosure(open)
  const { setOpen } = fold
  useEffect(() => setOpen(open), [open, setOpen])
  const off = disabled ?? look.disabled
  const pad = look.isFlush ? 'px-0' : 'px-compact'
  return (
    <li data-slot="accordion-item" data-open={fold.open || undefined} className={cx('min-w-0 border-b border-line first:border-t', className)}>
      <button
        type="button"
        {...fold.trigger}
        disabled={off}
        aria-label={ariaLabel}
        onClick={(event) => {
          fold.trigger.onClick()
          onHeadingClick?.({ isOpen: !fold.open, event })
        }}
        className={cx(
          'flex w-full cursor-pointer items-center gap-items text-start text-body text-fg hover:bg-hover disabled:cursor-not-allowed disabled:text-fg-disabled',
          look.size ? HEIGHT[look.size] : 'min-h-touch md:min-h-control',
          look.align === 'start' ? 'flex-row-reverse justify-end' : 'justify-between',
          pad,
          FOCUS,
        )}
      >
        <span data-part="title" className="min-w-0">
          {title}
        </span>
        <Icon name="chevron-down" className={chevron(fold.open)} />
      </button>
      <Expand id={fold.id} open={fold.open}>
        <div className={cx('max-w-prose pt-tight pb-blocks text-body text-fg-muted', pad)}>{children}</div>
      </Expand>
    </li>
  )
}
