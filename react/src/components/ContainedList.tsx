/**
 * Список строк своего вида (Carbon: ContainedList, ContainedListItem): подпись списка (`label`) и действие у неё
 * (`action`), строки — `ContainedListItem` детьми, в порядке данных.
 * - Строка с `onClick` — кнопка во всю строку (открыть карточку рядом или окно); открытая сейчас — `aria-current`
 *   (роль «выбрано»).
 * - Действие строки (`action`) — главной кнопки в строке нет (П5): только `kind="ghost"` и меню «…» (`OverflowMenu`).
 * - Высота строки — `size` (sm 32 · md 40 · lg 48); без него — 48 на телефоне, 40 на ноутбуке.
 * Пусто, ошибка, загрузка и «Показать ещё» — сборкой рядом (StateView, SkeletonText, паттерн «Обрезка содержимого»).
 */
import { createContext, useContext, useId, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { ContainedListKind, Size } from '../lib/vocab'
import { RowContext } from './Button'

const HEIGHT: Record<Size, string> = { sm: 'min-h-dense', md: 'min-h-control', lg: 'min-h-touch' }
const rowHeight = (size?: Size) => (size ? HEIGHT[size] : 'min-h-touch md:min-h-control')
/** Высота строк и вид разделителей — от списка к строкам. */
const ListContext = createContext<{ size?: Size; inset: boolean }>({ inset: false })

export interface ContainedListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Подпись списка — его имя для читалки. */
  label?: ReactNode
  /** Действие у подписи: «Добавить», поиск по списку. */
  action?: ReactNode
  /** `on-page` — на странице (по умолчанию); `disclosed` — внутри другого слоя (меню, окно), подпись мельче. */
  kind?: ContainedListKind
  /** Разделители строк с отступом от края. */
  isInset?: boolean
  size?: Size
  children?: ReactNode
  className?: string
}

/** Список строк (Carbon: ContainedList). */
export function ContainedList({ label, action, kind = 'on-page', isInset = false, size, children, className, ...rest }: ContainedListProps) {
  const id = useId()
  return (
    <div data-slot="contained-list" data-kind={kind} data-size={size} data-inset={isInset || undefined} className={cx('flex min-w-0 flex-col gap-items', className)} {...rest}>
      {label && (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-items">
          <div id={`${id}-label`} data-part="title" className={kind === 'disclosed' ? 'text-caption text-fg-muted' : 'text-heading text-fg'}>
            {label}
          </div>
          {action}
        </div>
      )}
      {children && (
        <ul role="list" aria-labelledby={label ? `${id}-label` : undefined} className="m-0 list-none overflow-hidden rounded-surface border border-line bg-surface p-0">
          <ListContext.Provider value={{ size, inset: isInset }}>{children}</ListContext.Provider>
        </ul>
      )}
    </div>
  )
}

export interface ContainedListItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onClick' | 'children'> {
  /** Тихие кнопки строки (`kind="ghost"`) или меню «…». */
  action?: ReactNode
  children?: ReactNode
  disabled?: boolean
  /** Строка — кнопка во всю ширину. */
  onClick?: () => void
  /** Значок перед содержимым — компонент из входа пакета `/icons`. */
  renderIcon?: ElementType
  className?: string
}

/** Строка списка (Carbon: ContainedListItem). */
export function ContainedListItem({ action, children, disabled = false, onClick, renderIcon: RenderIcon, className, ...rest }: ContainedListItemProps) {
  const { size, inset } = useContext(ListContext)
  const content = (
    <>
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
    </>
  )
  const pad = cx('flex min-w-0 flex-1 items-center gap-items px-compact py-items text-start text-body', rowHeight(size))
  return (
    <li
      data-slot="contained-list-item"
      className={cx('relative flex min-w-0 items-center gap-items bg-surface aria-[current=true]:bg-selected', inset ? 'ds-rule-inset' : 'border-b border-line last:border-b-0', className)}
      {...rest}
    >
      {onClick ? (
        <button type="button" disabled={disabled} onClick={onClick} className={cx(pad, 'cursor-pointer text-fg hover:bg-hover disabled:cursor-not-allowed disabled:text-fg-disabled', FOCUS)}>
          {content}
        </button>
      ) : (
        <div className={cx(pad, disabled ? 'text-fg-disabled' : 'text-fg')}>{content}</div>
      )}
      {action && (
        <div className="flex shrink-0 items-center gap-tight pr-items">
          <RowContext.Provider value>{action}</RowContext.Provider>
        </div>
      )}
    </li>
  )
}
