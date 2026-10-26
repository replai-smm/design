/**
 * Ряд сегментов — один вид из нескольких (Carbon: ContentSwitcher, Switch): тот же ряд, что у вкладок, выбранный —
 * роль «выбрано». Выбран всегда ровно один (`selectedIndex`, по умолчанию первый); повторное нажатие не снимает.
 * Стрелки ходят по ряду и сразу выбирают (`selectionMode="manual"` — только ходят, выбирает Enter или пробел).
 * `onChange({ index, name, text })` — как у Carbon. Ряд переносится, если не влез (фильтры).
 */
import { Children, cloneElement, forwardRef, isValidElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { SEGMENT, SEGMENT_ON, SEGMENTS } from '../lib/anatomy'
import { cx } from '../lib/cx'

export interface SwitchEventHandlersParams {
  index?: number
  name?: string | number
  text?: string
  key?: string | number
}

export interface ContentSwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Сегменты — `Switch`. */
  children?: ReactElement | ReactElement[]
  onChange: (params: SwitchEventHandlersParams) => void
  selectedIndex?: number
  selectionMode?: 'automatic' | 'manual'
  className?: string
}

/** Ряд сегментов (Carbon: ContentSwitcher). */
export function ContentSwitcher({ children, onChange, selectedIndex: selectedProp = 0, selectionMode = 'automatic', className, ...rest }: ContentSwitcherProps) {
  const [selected, setSelected] = useState(selectedProp)
  useEffect(() => setSelected(selectedProp), [selectedProp])
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const items = Children.toArray(children).filter(isValidElement) as Array<ReactElement<SwitchProps>>
  const pick = (index: number, event: SwitchEventHandlersParams) => {
    setSelected(index)
    refs.current[index]?.focus()
    onChange({ ...event, index, name: items[index]?.props.name, text: items[index]?.props.text })
  }
  const handle = (event: SwitchEventHandlersParams) => {
    const index = event.index ?? 0
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const next = (index + (event.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length
      refs.current[next]?.focus()
      if (selectionMode !== 'manual') pick(next, event)
    } else if (event.key === undefined && index !== selected) pick(index, event)
  }
  return (
    <div role="tablist" data-slot="content-switcher" data-part="segments" className={cx(SEGMENTS, className)} {...rest}>
      {items.map((child, index) =>
        cloneElement(child, {
          key: child.key ?? index,
          index,
          selected: index === selected,
          ref: (el: HTMLButtonElement | null) => {
            refs.current[index] = el
          },
          onClick: (e: SwitchEventHandlersParams) => {
            handle(e)
            child.props.onClick?.(e)
          },
          onKeyDown: (e: SwitchEventHandlersParams) => {
            handle(e)
            child.props.onKeyDown?.(e)
          },
        } as Partial<SwitchProps> & { key: string | number; ref: (el: HTMLButtonElement | null) => void }),
      )}
    </div>
  )
}

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'name' | 'onClick' | 'onKeyDown'> {
  /** Слово сегмента; без него — дети. */
  text?: string
  children?: ReactNode
  /** Что выбрано — приходит в `onChange` ряда. */
  name?: string | number
  disabled?: boolean
  index?: number
  selected?: boolean
  onClick?: (params: SwitchEventHandlersParams) => void
  onKeyDown?: (params: SwitchEventHandlersParams) => void
  className?: string
}

/** Сегмент ряда (Carbon: Switch). */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ text, children, name, disabled, index, selected = false, onClick, onKeyDown, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      tabIndex={selected ? 0 : -1}
      aria-selected={selected}
      data-state={selected ? 'on' : 'off'}
      disabled={disabled}
      {...rest}
      onClick={(e) => {
        e.preventDefault()
        onClick?.({ index, name, text })
      }}
      onKeyDown={(e) => onKeyDown?.({ index, name, text, key: e.key })}
      className={cx(SEGMENT, SEGMENT_ON, className)}
    >
      {text ?? children}
    </button>
  )
})
