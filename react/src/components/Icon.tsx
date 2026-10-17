/**
 * Значок — один набор (IBM Carbon, 16 px) через один компонент. По имени (`name="close"`) или по тону (`tone="опасно"`):
 * у тона своя форма и цвет знака из словаря тонов — цвет никогда не один. Значок — украшение: смысл несёт слово
 * рядом или `label` (тогда значок — картинка для читалки).
 */
import { createElement } from 'react'
import { cx } from '../lib/cx'
import { ICONS, type IconName } from '../lib/icons.gen'
import { TONE, type Tone } from '../lib/vocab'

export type { IconName }

type IconProps = ({ name: IconName; tone?: never } | { tone: Tone; name?: never }) & {
  /** Слово для читалки, если рядом слова нет. Без него значок скрыт от читалки. */
  label?: string
  className?: string
}

export function Icon({ name, tone, label, className }: IconProps) {
  const look = tone ? TONE[tone] : null
  const icon = ICONS[look ? look.icon : name!]
  return (
    <svg
      viewBox={icon.viewBox}
      fill="currentColor"
      focusable="false"
      data-icon={look ? look.icon : name}
      data-tone={look?.key}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={cx('size-icon shrink-0', look?.mark, className)}
    >
      {icon.parts.map(([elem, attrs], i) => createElement(elem, { key: i, ...attrs }))}
    </svg>
  )
}
