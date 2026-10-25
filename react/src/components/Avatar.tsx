/**
 * Аватар: круг 32 px с картинкой. Картинки нет или не загрузилась — буквы имени; нет и имени — значок человека.
 * Рядом с именем в строке аватар — украшение (`decorative`): читалка не повторит имя дважды.
 */
import { Avatar as RAvatar } from 'radix-ui'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface AvatarProps {
  /** Адрес картинки; продукт сам проверяет, что адрес безопасный (https). */
  src?: string | null
  /** Имя человека или организации: подпись для читалки и буквы на замене. */
  name?: string
  /** Стоит рядом с именем — читалке не нужен. */
  decorative?: boolean
  className?: string
}

/** Буквы: первые буквы двух первых слов имени («Анна Петрова» → «АП»), без знаков и кавычек. */
export function initials(name?: string): string {
  const words = (name ?? '').split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase('ru'))
    .join('')
}

export function Avatar({ src, name, decorative, className }: AvatarProps) {
  const letters = initials(name)
  const a11y = decorative || !name ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': name }
  return (
    <RAvatar.Root
      data-slot="avatar"
      {...a11y}
      className={cx('relative inline-flex size-dense shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-canvas align-middle text-caption select-none', className)}
    >
      {src ? <RAvatar.Image src={src} alt="" className="size-full object-cover" /> : null}
      <RAvatar.Fallback data-slot="avatar-fallback" className="inline-flex size-full items-center justify-center text-fg">
        {letters ? <span aria-hidden="true">{letters}</span> : <Icon name="user" className="text-fg-muted" />}
      </RAvatar.Fallback>
    </RAvatar.Root>
  )
}
