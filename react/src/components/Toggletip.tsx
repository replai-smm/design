/**
 * Справка по нажатию (Carbon: Toggletip) — знак «i» у подписи: дополнительное объяснение открывается нажатием, а не висит
 * абзацем под полем. Работает и на телефоне: цель нажатия — 40 px при знаке 16. Esc и нажатие мимо закрывают, фокус
 * возвращается на «i». Нужное для дела в справку не прячут — его пишут словами рядом (подсказка под полем, `helperText`);
 * правила экрана целиком — свёрнутым `Accordion`. Подсказка по наведению у кнопки — `Tooltip`.
 */
import type { ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface ToggletipProps {
  /** О чём справка — для читалки: «Подробнее: Срок хранения». */
  label: string
  /** Текст справки: одно-три предложения. */
  children: ReactNode
  className?: string
}

export function Toggletip({ label, children, className }: ToggletipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        data-slot="toggletip"
        aria-label={`Подробнее: ${label}`}
        className={cx('-m-compact inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control p-compact text-fg-muted hover:text-fg', FOCUS, className)}
      >
        <Icon name="information" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-slot="toggletip-content"
          aria-label={label}
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
