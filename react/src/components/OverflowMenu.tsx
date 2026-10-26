/**
 * Меню «…» (Carbon: OverflowMenu, OverflowMenuItem): кнопка-значок без слова (`iconDescription` — подсказка и имя для
 * читалки, по умолчанию «Действия»), по нажатию — список действий поверх экрана. Кнопка — всегда `kind="ghost"`:
 * меню стоит и в строке списка (П5). Сюда уносят редкое и опасное — подальше от главной (П10): `isDelete` — опасный
 * пункт, `hasDivider` — черта над ним. Клавиатура — стрелки, Enter, Esc; фокус возвращается на кнопку.
 * `direction` — снизу (по умолчанию) или сверху, `flipped` — меню к правому краю кнопки.
 */
import { useEffect, useState, type ElementType, type MouseEvent, type ReactNode } from 'react'
import { DropdownMenu } from 'radix-ui'
import { FAST, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { OverflowMenuVertical } from '../lib/icons.gen'
import type { PopoverAlignment, Size } from '../lib/vocab'
import { IconButton } from './Button'

export interface OverflowMenuProps {
  /** Пункты — `OverflowMenuItem`. */
  children: ReactNode
  /** Имя кнопки для читалки (вместо `iconDescription`). */
  'aria-label'?: string
  /** Подсказка и имя кнопки. */
  iconDescription?: string
  /** Где подсказка кнопки. */
  align?: PopoverAlignment
  direction?: 'top' | 'bottom'
  /** Меню к правому краю кнопки. */
  flipped?: boolean
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  /** Значок кнопки — компонент из входа пакета `/icons` (по умолчанию «⋮»). */
  renderIcon?: ElementType
  size?: Size
  id?: string
  className?: string
  menuOptionsClass?: string
}

/** Меню действий за кнопкой «…» (Carbon: OverflowMenu). */
export function OverflowMenu({
  children,
  'aria-label': ariaLabel,
  iconDescription = 'Действия',
  align,
  direction = 'bottom',
  flipped = false,
  open: openProp = false,
  onOpen,
  onClose,
  onClick,
  renderIcon: RenderIcon = OverflowMenuVertical,
  size,
  id,
  className,
  menuOptionsClass,
}: OverflowMenuProps) {
  const [open, setOpen] = useState(openProp)
  useEffect(() => setOpen(openProp), [openProp])
  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) onOpen?.()
        else onClose?.()
      }}
    >
      <DropdownMenu.Trigger asChild>
        <IconButton kind="ghost" size={size} id={id} label={ariaLabel ?? iconDescription} align={align} onClick={onClick} className={className} data-part="overflow-menu">
          <RenderIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={direction}
          align={flipped ? 'end' : 'start'}
          sideOffset={4}
          data-part="menu"
          className={cx('ds-pop z-50 flex min-w-rail flex-col py-tight shadow-raised', SURFACE, menuOptionsClass)}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export interface OverflowMenuItemProps {
  /** Слово пункта. */
  itemText?: ReactNode
  onClick?: (event: Event) => void
  disabled?: boolean
  /** Опасное действие: «Удалить». */
  isDelete?: boolean
  /** Черта над пунктом: отделить опасное. */
  hasDivider?: boolean
  /** Пункт — ссылка. */
  href?: string
  /** Подсказка браузера со словом пункта (длинное обрежется). */
  requireTitle?: boolean
  title?: string
  className?: string
}

/** Пункт меню «…» (Carbon: OverflowMenuItem). */
export function OverflowMenuItem({ itemText, onClick, disabled = false, isDelete = false, hasDivider = false, href, requireTitle, title, className }: OverflowMenuItemProps) {
  const cls = cx(
    'flex min-h-touch cursor-pointer items-center px-compact text-start text-body no-underline outline-none md:min-h-control',
    FAST,
    isDelete ? 'text-danger-fg data-[highlighted]:bg-danger data-[highlighted]:text-fg-inverse' : 'text-fg data-[highlighted]:bg-hover',
    'data-[disabled]:cursor-not-allowed data-[disabled]:text-fg-disabled',
    className,
  )
  const tip = title ?? (requireTitle && typeof itemText === 'string' ? itemText : undefined)
  const body = <span className="min-w-0 truncate">{itemText}</span>
  return (
    <>
      {hasDivider && <DropdownMenu.Separator className="my-tight h-px bg-line" />}
      <DropdownMenu.Item asChild={href !== undefined} disabled={disabled} onSelect={onClick} title={tip} data-delete={isDelete || undefined} className={cls}>
        {href !== undefined ? <a href={href}>{body}</a> : body}
      </DropdownMenu.Item>
    </>
  )
}
