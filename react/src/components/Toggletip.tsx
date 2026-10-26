/**
 * Справка по нажатию (Carbon: Toggletip, ToggletipLabel, ToggletipButton, ToggletipContent) — знак «i» у подписи:
 * дополнительное объяснение открывается нажатием, а не висит абзацем под полем. Работает и на телефоне: цель нажатия — 48 px
 * на телефоне и 40 на ноутбуке при знаке 16. Esc и нажатие мимо закрывают, фокус возвращается на кнопку. Нужное для дела
 * в справку не прячут — его пишут словами рядом (подсказка под полем, `helperText`); правила экрана целиком — свёрнутым
 * `AccordionItem`. Подсказка по наведению у кнопки — `Tooltip`. У поля справку кладут в его подпись, как у Carbon:
 * `labelText={<><ToggletipLabel>Срок</ToggletipLabel><Toggletip>…</Toggletip></>}`.
 */
import { createContext, useContext, useId, type ElementType, type ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import type { PopoverAlignment } from '../lib/vocab'

const TipContext = createContext<{ align: PopoverAlignment; button: string }>({ align: 'bottom', button: '' })

export interface ToggletipProps {
  /** Где справка относительно кнопки; по умолчанию снизу (как у Carbon). */
  align?: PopoverAlignment
  /** Открыта при показе. */
  defaultOpen?: boolean
  as?: ElementType
  /** `ToggletipButton` и `ToggletipContent`. */
  children?: ReactNode
  className?: string
}

/** Справка: держит кнопку и содержимое вместе. */
export function Toggletip({ align = 'bottom', defaultOpen, as: Tag = 'span', children, className }: ToggletipProps) {
  const button = useId()
  return (
    <TipContext.Provider value={{ align, button }}>
      <Popover.Root defaultOpen={defaultOpen}>
        <Tag data-slot="toggletip" className={cx('inline-flex shrink-0 items-center', className)}>
          {children}
        </Tag>
      </Popover.Root>
    </TipContext.Provider>
  )
}

export interface ToggletipLabelProps {
  as?: ElementType
  children?: ReactNode
  className?: string
}

/** Подпись рядом со справкой: о чём она. */
export function ToggletipLabel({ as: Tag = 'span', children, className }: ToggletipLabelProps) {
  return (
    <Tag data-slot="toggletip-label" className={cx('min-w-0', className)}>
      {children}
    </Tag>
  )
}

export interface ToggletipButtonProps {
  /** Имя кнопки для читалки: «Подробнее: срок хранения». */
  label?: string
  /** Знак кнопки; по умолчанию «i». */
  children?: ReactNode
  className?: string
}

/** Кнопка справки: открывает и закрывает содержимое. */
export function ToggletipButton({ label = 'Подробнее', children, className }: ToggletipButtonProps) {
  const { button } = useContext(TipContext)
  return (
    <Popover.Trigger
      id={button || undefined}
      data-slot="toggletip-button"
      aria-label={label}
      className={cx('-m-blocks inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control p-blocks md:-m-compact md:p-compact text-fg-muted hover:text-fg', FOCUS, className)}
    >
      {children ?? <Icon name="information" />}
    </Popover.Trigger>
  )
}

export interface ToggletipContentProps {
  /** Текст справки: одно-три предложения. */
  children?: ReactNode
  className?: string
}

/** Содержимое справки: всплывает у кнопки. */
export function ToggletipContent({ children, className }: ToggletipContentProps) {
  const { align, button } = useContext(TipContext)
  const [side, at = 'center'] = align.split('-') as ['top' | 'bottom' | 'left' | 'right', ('start' | 'end')?]
  return (
    <Popover.Portal>
      <Popover.Content
        data-slot="toggletip-content"
        aria-labelledby={button || undefined}
        side={side}
        align={at}
        sideOffset={4}
        collisionPadding={8}
        className={cx('ds-pop z-50 max-w-hint rounded-surface border border-line bg-surface p-compact text-body text-fg shadow-raised', className)}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  )
}
