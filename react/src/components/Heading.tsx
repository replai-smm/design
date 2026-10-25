/**
 * Заголовок (Carbon: Heading): уровень `h1`–`h6` берёт сам из вложенности `Section` — вне разделов `h1`, в разделе `h2`,
 * в разделе раздела `h3`. Роль текста — по уровню: 1 — `page` 28, 2 — `title` 20, 3 и глубже — `heading` 14/600.
 * Уровень не выбирают руками: порядок заголовков для читалки держит вложенность разделов.
 */
import type { HTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { useHeadingLevel } from './layout'

export type HeadingProps = HTMLAttributes<HTMLHeadingElement>

const ROLE = { 1: 'text-page', 2: 'text-title', 3: 'text-heading', 4: 'text-heading', 5: 'text-heading', 6: 'text-heading' } as const

export function Heading({ className, ...rest }: HeadingProps) {
  const level = useHeadingLevel()
  const Tag = `h${level}` as const
  return <Tag data-slot="heading" data-level={level} className={cx('m-0 min-w-0 text-fg', ROLE[level], className)} {...rest} />
}
