/**
 * Значок — один набор (IBM Carbon, 16 px) через один компонент. По имени (`name="close"`) или по тону (`tone="опасно"`):
 * у тона своя форма и цвет знака из словаря тонов — цвет никогда не один. Значок — украшение: смысл несёт слово
 * рядом или `label` (тогда значок — картинка для читалки). Значок для `renderIcon` кнопки, ссылки и метки — компонент
 * с именем Carbon из входа пакета `/icons` (`Add`, `ChevronDown`): та же картинка.
 */
import { cx } from '../lib/cx'
import { glyph, type CarbonIconProps, type IconName } from '../lib/icons.gen'
import { TONE, type Tone } from '../lib/vocab'

export type { IconName }

type IconProps = ({ name: IconName; tone?: never } | { tone: Tone; name?: never }) & {
  /** Слово для читалки, если рядом слова нет. Без него значок скрыт от читалки. */
  label?: string
  className?: string
}

export function Icon({ name, tone, label, className }: IconProps) {
  const look = tone ? TONE[tone] : null
  const icon = look ? look.icon : name!
  const props = { 'data-icon': icon, 'data-tone': look?.key, ...(label ? { role: 'img', 'aria-label': label } : {}), className: cx(look?.mark, className) }
  return glyph(icon, props as CarbonIconProps)
}
