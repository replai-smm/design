/**
 * Ссылка (Carbon: Link) — переход по адресу, а не действие: «Забыли пароль?», раздел навигации, документ. Синий — только
 * ссылка и фокус. Отдельная ссылка подчёркнута под указателем; `inline` — внутри текста, подчёркнута всегда и берёт размер
 * текста вокруг. `size`: sm 12 · md 14 (по умолчанию) · lg 16. Выключенная — без адреса, цветом выключенного.
 * Значок после слова — `renderIcon` (компонент из входа пакета `/icons`). Действие на месте — `Button`.
 */
import { forwardRef, type AnchorHTMLAttributes, type ElementType } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { SIZES, type Size } from '../lib/vocab'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  /** Внутри текста: подчёркнута, размер — как у текста вокруг. */
  inline?: boolean
  size?: Size
  disabled?: boolean
  /** Значок после слова. */
  renderIcon?: ElementType
}

const SIZE: Record<Size, string> = { sm: 'text-caption', md: 'text-body', lg: 'text-reading' }

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, inline = false, size = 'md', disabled = false, renderIcon: RenderIcon, className, children, ...rest }, ref) {
  rule(SIZES.includes(size), `размера «${String(size)}» нет: sm · md · lg`)
  return (
    <a
      ref={ref}
      data-slot="link"
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      className={cx(
        'rounded-control',
        inline ? 'underline' : cx('inline-flex items-center gap-tight no-underline hover:underline', SIZE[size]),
        disabled ? 'cursor-not-allowed text-fg-disabled' : 'cursor-pointer text-accent',
        FOCUS,
        className,
      )}
      {...rest}
    >
      {children}
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
    </a>
  )
})
