/**
 * Выбор с поиском (Carbon: ComboBox; WAI-ARIA combobox): поле, в котором печатают, и список под ним. Пункты — `items`
 * любого вида, слово пункта — `itemToString` (по умолчанию строка или поле `label`), вид — `itemToElement`; выключенный —
 * `disabled: true`. Печать, как у Carbon, список не сужает, а ставит на первый подходящий пункт; сужает
 * `shouldFilterItem`. Стрелки ходят, Enter выбирает, Esc закрывает (закрытое — очищает выбор), Tab уходит без выбора.
 * Фокус всегда в поле: активный пункт — aria-activedescendant. Список — во всплывающем слое (не обрезается панелью),
 * ширина — как у поля; выбранный — «выбрано» и галочка. `onChange({ selectedItem })` — при выборе и очистке.
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import type { Size } from '../lib/vocab'
import { Icon } from './Icon'
import { FieldShell, checkFieldSize, fieldAria, fieldBox, fieldSquare, fieldState, useFieldIds, type FieldMessages } from './TextInput'

export interface ComboBoxProps<Item> extends FieldMessages {
  id: string
  /** Подпись поля (у Carbon здесь `titleText`). */
  titleText?: ReactNode
  items: Item[]
  /** Слово пункта: в поле, для поиска и для читалки. */
  itemToString?: (item: Item | null) => string
  /** Вид пункта в списке (две строки, значок); по умолчанию — слово пункта. */
  itemToElement?: ((item: Item) => ReactNode) | null
  /** Выбранное снаружи. */
  selectedItem?: Item | null
  /** Выбранное при показе, дальше — своё. */
  initialSelectedItem?: Item
  onChange: (data: { selectedItem: Item | null | undefined }) => void
  /** Набранный текст. */
  onInputChange?: (inputText: string) => void
  /** Оставить пункт в списке при наборе; без него показаны все (Carbon). */
  shouldFilterItem?: (input: { item: Item; itemToString?: (item: Item | null) => string; inputValue: string | null }) => boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  size?: Size
  /** Куда раскрывается список. */
  direction?: 'top' | 'bottom'
  /** Имя списка для читалки. */
  'aria-label'?: string
  name?: string
  className?: string
}

const defaultItemToString = (item: unknown): string => {
  if (typeof item === 'string') return item
  if (typeof item === 'number') return String(item)
  if (item && typeof item === 'object' && 'label' in item && typeof item.label === 'string') return item.label
  return ''
}
const isItemDisabled = (item: unknown) => item !== null && typeof item === 'object' && 'disabled' in item && item.disabled === true

/** Выбор из длинного списка с поиском (Carbon: ComboBox). */
export function ComboBox<Item>({
  id,
  titleText,
  helperText,
  invalid,
  invalidText,
  warn,
  warnText,
  items,
  itemToString = defaultItemToString,
  itemToElement = null,
  selectedItem: selectedProp,
  initialSelectedItem,
  onChange,
  onInputChange,
  shouldFilterItem,
  placeholder,
  disabled,
  readOnly,
  size,
  direction = 'bottom',
  'aria-label': listLabel = 'Выберите пункт',
  name,
  className,
}: ComboBoxProps<Item>) {
  checkFieldSize(size)
  const ids = useFieldIds(id)
  const listId = `${ids.id}-list`
  const anchor = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useControllable<Item | null>(selectedProp, initialSelectedItem ?? null, (selectedItem) => onChange({ selectedItem }))
  // query — набранный текст; null — набора нет, поле показывает слово выбранного
  const [query, setQueryRaw] = useState<string | null>(null)
  const setQuery = (q: string | null) => {
    setQueryRaw(q)
    onInputChange?.(q ?? '')
  }
  const text = query ?? (selected === null ? '' : itemToString(selected))
  const [open, setOpenRaw] = useState(false)
  const shown = useMemo(() => (shouldFilterItem && query !== null ? items.filter((item) => shouldFilterItem({ item, itemToString, inputValue: query })) : items), [items, query, shouldFilterItem, itemToString])
  const firstMatch = (list: Item[], q: string) => {
    const want = q.toLowerCase()
    return list.findIndex((item) => !isItemDisabled(item) && itemToString(item).toLowerCase().includes(want))
  }
  const firstActive = () => {
    const i = selected === null ? -1 : shown.indexOf(selected)
    return i >= 0 ? i : shown.findIndex((item) => !isItemDisabled(item))
  }
  const [active, setActive] = useState(-1)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const optId = (i: number) => `${listId}-${uid}-${i}`
  const off = disabled || readOnly

  const setOpen = (v: boolean) => {
    if (off) return
    setOpenRaw(v)
    if (v) setActive(firstActive())
  }
  const close = () => {
    setOpenRaw(false)
    if (query !== null) setQuery(null)
    setActive(-1)
  }
  const choose = (item: Item) => {
    if (isItemDisabled(item)) return
    setSelected(item)
    close()
  }
  const clear = () => {
    setSelected(null)
    if (query !== null) setQuery(null)
  }
  const move = (dir: 1 | -1) => {
    if (!shown.length) return
    let i = active
    for (let n = 0; n < shown.length; n++) {
      i = (i + dir + shown.length) % shown.length
      if (!isItemDisabled(shown[i])) break
    }
    setActive(i)
    document.getElementById(optId(i))?.scrollIntoView?.({ block: 'nearest' })
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (off) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return setOpen(true)
      return move(e.key === 'ArrowDown' ? 1 : -1)
    }
    if (e.key === 'Enter' && open && active >= 0 && shown[active] !== undefined) {
      e.preventDefault()
      return choose(shown[active]!)
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        return close()
      }
      if (query) return setQuery(null)
      if (selected !== null) {
        e.preventDefault()
        return clear()
      }
    }
    if (e.key === 'Tab' && open) close()
  }

  const listOpen = open && !off
  const hasList = listOpen && shown.length > 0
  const showClear = !off && (selected !== null || Boolean(query))
  const messages = { helperText, invalid, invalidText, warn, warnText }
  const state = fieldState({ invalid, warn, disabled, readOnly })
  const iconBtn = cx('inline-flex shrink-0 cursor-pointer items-center justify-center text-fg hover:bg-hover', fieldSquare(size), FOCUS, 'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')
  const keepFocus = (e: MouseEvent) => e.preventDefault()

  return (
    <FieldShell slot="combo-box" ids={ids} label={titleText} disabled={disabled} readOnly={readOnly} className={className} {...messages}>
      <Popover.Root open={hasList} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <Popover.Anchor asChild>
          <div ref={anchor} className={cx(fieldBox({ invalid: state.invalid, disabled, readOnly, within: true, size }), 'flex items-stretch overflow-hidden')}>
            <input
              ref={input}
              id={ids.id}
              type="text"
              role="combobox"
              name={name}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={hasList}
              aria-controls={hasList ? listId : undefined}
              aria-activedescendant={hasList && active >= 0 ? optId(active) : undefined}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              value={text}
              onChange={(e) => {
                const q = e.target.value
                setQuery(q)
                setOpenRaw(true)
                const next = shouldFilterItem ? items.filter((item) => shouldFilterItem({ item, itemToString, inputValue: q })) : items
                setActive(q ? firstMatch(next, q) : next.findIndex((item) => !isItemDisabled(item)))
              }}
              onClick={() => !listOpen && setOpen(true)}
              onKeyDown={onKeyDown}
              onBlur={() => (listOpen ? close() : query !== null && setQuery(null))}
              {...fieldAria(ids, messages, state)}
              className="min-w-0 flex-1 border-0 bg-transparent px-compact text-body text-inherit outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
            />
            {showClear && (
              <button
                type="button"
                aria-label="Очистить выбор"
                onMouseDown={keepFocus}
                onClick={() => {
                  clear()
                  input.current?.focus()
                }}
                className={iconBtn}
              >
                <Icon name="close" />
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              aria-label={listOpen ? 'Закрыть список' : 'Открыть список'}
              aria-expanded={hasList}
              disabled={off}
              onMouseDown={keepFocus}
              onClick={() => {
                if (listOpen) close()
                else setOpen(true)
                input.current?.focus()
              }}
              className={iconBtn}
            >
              <Icon name="chevron-down" className={cx('transition-transform duration-fast ease-standard', listOpen && 'rotate-180')} />
            </button>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            role={undefined}
            data-slot="combo-box-list"
            side={direction}
            align="start"
            sideOffset={4}
            collisionPadding={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchor.current?.contains(e.target as Node)) e.preventDefault()
            }}
            onMouseDown={keepFocus}
            className="ds-pop z-50 flex max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) flex-col overflow-hidden rounded-surface border border-line bg-surface text-fg shadow-raised"
          >
            <ul role="listbox" id={listId} aria-label={listLabel} className="relative m-0 list-none overflow-y-auto p-tight">
              {shown.map((item, i) => {
                const isSel = item === selected
                const itemOff = isItemDisabled(item)
                return (
                  <li
                    key={optId(i)}
                    id={optId(i)}
                    role="option"
                    aria-selected={isSel}
                    aria-disabled={itemOff || undefined}
                    data-active={i === active ? 'true' : undefined}
                    onMouseMove={() => !itemOff && i !== active && setActive(i)}
                    onClick={() => choose(item)}
                    className={cx(
                      'flex min-h-touch cursor-pointer items-center gap-items rounded-control px-items text-body md:min-h-control data-[active=true]:bg-hover',
                      isSel ? 'bg-selected text-fg' : 'text-fg',
                      itemOff && 'cursor-not-allowed text-fg-disabled',
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col py-tight">{itemToElement ? itemToElement(item) : <span className="truncate">{itemToString(item)}</span>}</span>
                    {isSel && <Icon name="check" />}
                  </li>
                )
              })}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </FieldShell>
  )
}
