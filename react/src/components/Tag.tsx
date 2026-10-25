/**
 * Метка (Carbon: Tag, DismissibleTag) — слово в таблетке цвета `type`: категория, выбранный фильтр, короткое состояние
 * («черновик», «в архиве»). Цвет — из ролей с проверенной парой текста: red · purple — подложка тона, green · gray —
 * заливка, high-contrast — инверсия, outline — рамка; остальных цветов Carbon в ролях нет (README «Расходится с
 * Carbon»). Цвет никогда не один — смысл несёт слово. Состояние со знаком (успех, ошибка, ожидание) — `IconIndicator`.
 * `DismissibleTag` — метка с кнопкой «убрать» (выбранный фильтр).
 */
import type { ElementType, MouseEvent, ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { SIZES, TAG_TYPES, type Size, type TagType } from '../lib/vocab'
import { Icon } from './Icon'

const TYPE: Record<TagType, string> = {
  red: 'bg-danger-bg text-danger-fg border-transparent',
  purple: 'bg-decision-bg text-decision-fg border-transparent',
  green: 'bg-success-fill text-fg border-transparent',
  gray: 'bg-neutral-fill text-fg border-transparent',
  'high-contrast': 'bg-inverse text-fg-inverse border-transparent',
  outline: 'bg-transparent text-fg border-line-strong',
}
const SIZE: Record<Size, string> = { sm: 'min-h-icon px-items', md: 'min-h-groups px-items', lg: 'min-h-dense px-compact' }

function look(type: TagType, size: Size, disabled: boolean | undefined) {
  rule(TAG_TYPES.includes(type), `цвета метки «${String(type)}» нет: ${TAG_TYPES.join(' · ')}`)
  rule(SIZES.includes(size), `размера «${String(size)}» нет: sm · md · lg`)
  return cx(
    'inline-flex max-w-full min-w-0 items-center gap-tight rounded-full border text-caption whitespace-nowrap align-middle',
    disabled ? 'border-line bg-transparent text-fg-disabled' : TYPE[type],
    SIZE[size],
  )
}

export interface TagProps {
  /** Слово метки. */
  children?: ReactNode
  /** Цвет; по умолчанию `gray`. */
  type?: TagType
  /** sm 16 · md 24 (по умолчанию) · lg 32. */
  size?: Size
  /** Значок перед словом — компонент из входа пакета `/icons`. */
  renderIcon?: ElementType
  disabled?: boolean
  id?: string
  className?: string
}

/** Метка: слово в таблетке. */
export function Tag({ children, type = 'gray', size = 'md', renderIcon: RenderIcon, disabled, id, className }: TagProps) {
  return (
    <span id={id} data-slot="tag" data-type={type} aria-disabled={disabled || undefined} className={cx(look(type, size, disabled), className)}>
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  )
}

export interface DismissibleTagProps {
  /** Слово метки. */
  text?: string
  type?: TagType
  size?: Size
  renderIcon?: ElementType
  disabled?: boolean
  id?: string
  /** Нажали «убрать». */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void
  /** Подпись кнопки «убрать» для читалки; по умолчанию «Убрать: <слово>». */
  dismissTooltipLabel?: string
  /** Полное слово, когда метка обрезана. */
  tagTitle?: string
  className?: string
}

/** Метка с кнопкой «убрать»: выбранный фильтр, адресат. */
export function DismissibleTag({ text, type = 'gray', size = 'md', renderIcon: RenderIcon, disabled, id, onClose, dismissTooltipLabel, tagTitle, className }: DismissibleTagProps) {
  return (
    <span id={id} data-slot="tag" data-type={type} aria-disabled={disabled || undefined} className={cx(look(type, size, disabled), 'pr-tight', className)}>
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
      <span className="truncate" title={tagTitle ?? text}>
        {text}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-label={dismissTooltipLabel ?? `Убрать: ${text ?? ''}`}
        onClick={onClose}
        className={cx('-my-tight inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-hover disabled:cursor-not-allowed', FOCUS)}
      >
        <Icon name="close" />
      </button>
    </span>
  )
}
