/**
 * Аватар (Radix Avatar): круг с картинкой. Картинки нет или она не загрузилась — буквы имени на сером круге;
 * нет и имени — серый круг со значком человека. Замена при ошибке — сама, без `onerror` в разметке продукта.
 * Рядом с именем в строке списка аватар — украшение (`decorative`): читалка не повторит имя дважды.
 * Размеры: sm 24 · md 32 · lg 48 px.
 */
import type { ReactNode } from 'react'
import { Avatar as RAvatar } from 'radix-ui'
import { cx } from '../lib/cx'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** Адрес картинки; продукт сам проверяет, что адрес безопасный (https). */
  src?: string | null
  /** Имя человека или сообщества: подпись для читалки и буквы на замене. */
  name?: string
  size?: AvatarSize
  /** Стоит рядом с именем — читалке не нужен. */
  decorative?: boolean
  /** Своя замена вместо букв (редко). */
  fallback?: ReactNode
  className?: string
}

const SIZE: Record<AvatarSize, string> = { sm: 'size-6 text-label-01', md: 'size-8 text-label-01', lg: 'size-12 text-body-compact-02' }
const ICON: Record<AvatarSize, string> = { sm: 'size-4', md: 'size-5', lg: 'size-7' }

/** Буквы: первые буквы двух первых слов имени («Кофейня Зерно» → «КЗ»), без знаков и кавычек. */
export function initials(name?: string): string {
  const words = (name ?? '').split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase('ru'))
    .join('')
}

export function Avatar({ src, name, size = 'md', decorative, fallback, className }: AvatarProps) {
  const letters = initials(name)
  const a11y = decorative || !name ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': name }
  return (
    <RAvatar.Root
      data-slot="avatar"
      {...a11y}
      className={cx('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-layer-accent-01 align-middle select-none', SIZE[size], className)}
    >
      {src ? <RAvatar.Image src={src} alt="" className="size-full object-cover" /> : null}
      <RAvatar.Fallback data-slot="avatar-fallback" className="inline-flex size-full items-center justify-center text-text-primary">
        {fallback ??
          (letters ? (
            <span aria-hidden="true">{letters}</span>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cx('text-icon-secondary', ICON[size])}>
              <circle cx="8" cy="5.5" r="2.75" fill="currentColor" />
              <path d="M2.5 14c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5z" fill="currentColor" />
            </svg>
          ))}
      </RAvatar.Fallback>
    </RAvatar.Root>
  )
}
