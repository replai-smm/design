/**
 * Справка — «?» у подписи: подробность открывается нажатием и не висит абзацем под полем. Работает на телефоне (нажатие,
 * не наведение), Esc и нажатие мимо закрывают, фокус возвращается на «?». Короткое «зачем поле» — подсказкой под полем
 * (`helperText`), правила экрана целиком — свёрнутым «Как это работает» (`HowItWorks`), не здесь.
 */
import type { ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface HelpProps {
  /** О чём справка — для читалки: «Подробнее: Баллы за лайк». */
  about: string
  /** Текст справки: два-три предложения. */
  children: ReactNode
  className?: string
}

export function Help({ about, children, className }: HelpProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        data-slot="help"
        aria-label={`Подробнее: ${about}`}
        className={cx('inline-flex size-icon shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted hover:text-fg', FOCUS, className)}
      >
        <Icon name="help" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-slot="help-content"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="ds-pop z-50 max-w-hint rounded-surface border border-line bg-surface p-compact text-body text-fg shadow-raised"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
