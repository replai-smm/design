/**
 * Поверхность — одна анатомия на всё, что лежит слоем на холсте: карточка, плитка, уведомление, состояние, блок кода,
 * рамка графика, карточка решения, весть в переписке. Слой, тихая рамка, угол поверхности, поля `blocks` (16);
 * заголовок внутри — роль `heading`. Метка слева (`mark`) — знак тона, одна ширина на всю систему; `inset` —
 * утопленная (код). Продукт собирает свою поверхность из неё, а не из классов.
 */
import type { ElementType, ReactNode } from 'react'
import { MARK, SUNKEN, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { TONE, type Tone } from '../lib/vocab'

const MARK_COLOR: Record<Tone, string> = {
  опасно: 'border-l-danger',
  внимание: 'border-l-warning',
  инфо: 'border-l-fg',
  нейтрально: 'border-l-line-strong',
  хорошо: 'border-l-success',
}

export interface SurfaceProps {
  as?: ElementType
  /** Метка слева цвета тона: беда, «ждёт тебя» (инфо), весть. */
  mark?: Tone
  /** Утопленная: код, вывод команды. */
  inset?: boolean
  /** Без полей: содержимое само кладёт поля (таблица внутри, раскрытие). */
  flush?: boolean
  className?: string
  children?: ReactNode
  [data: `data-${string}`]: string | undefined
  [aria: `aria-${string}`]: string | undefined
  role?: string
  /** Вся поверхность — кнопка (плитка-переход): `as="button"`. */
  onClick?: () => void
  type?: 'button'
}

export function Surface({ as: Tag = 'div', mark, inset = false, flush = false, className, children, ...rest }: SurfaceProps) {
  return (
    <Tag
      data-slot="surface"
      data-mark={mark ? TONE[mark].key : undefined}
      className={cx('flex min-w-0 flex-col', inset ? SUNKEN : SURFACE, !flush && 'p-blocks', mark && cx(MARK, MARK_COLOR[mark]), className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
