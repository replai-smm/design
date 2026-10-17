/**
 * Уведомление в потоке — поверхность с меткой цвета тона и знаком его формы: цвет никогда не один. Где — по охвату
 * (П11): беда системы — одна плашка вверху страницы (`scope="page"`), беда списка — над списком (`list`), беда
 * объекта — в его строке (`row`). «Готово» — не сюда, а всплывашкой (`useToast`).
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { Button } from './Button'
import { Icon } from './Icon'
import { Surface } from './Surface'

export type NotificationTone = Exclude<Tone, 'нейтрально'>

export interface NotificationProps {
  tone: NotificationTone
  title: ReactNode
  children?: ReactNode
  /** Действие рядом с причиной (П8): «Починить», «Повторить» — тихая кнопка. */
  action?: ReactNode
  scope?: 'page' | 'list' | 'row'
  onClose?: () => void
  className?: string
}

export function Notification({ tone, title, children, action, scope = 'list', onClose, className }: NotificationProps) {
  return (
    <Surface mark={tone} data-slot="notification" data-scope={scope} role={tone === 'опасно' ? 'alert' : 'status'} className={cx('gap-tight text-body', className)}>
      <div className="flex min-w-0 items-center gap-items">
        <Icon tone={tone} />
        <p data-part="title" className="m-0 min-w-0 flex-1 text-heading">
          {title}
        </p>
        {onClose && <Button variant="ghost" dense icon="close" aria-label="закрыть" onClick={onClose} className="-my-tight shrink-0" />}
      </div>
      {children && <div className="min-w-0 text-fg-muted">{children}</div>}
      {action && <div className="pt-tight">{action}</div>}
    </Surface>
  )
}
