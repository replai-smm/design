/**
 * Выбор с поиском (Carbon ComboBox; WAI-ARIA combobox со списком): поле, в котором печатают, и список под ним.
 * Печать сужает список (без учёта регистра, по любой части названия); стрелки ходят по списку, Enter выбирает,
 * Esc закрывает список (закрытый — очищает выбор, если можно очищать), Tab уходит без выбора. Фокус всегда в поле:
 * активный пункт — через aria-activedescendant. Ушли из поля, не выбрав, — поле снова показывает выбранное.
 * Список — в слое поверх страницы (Radix Popover): не обрезается панелью или таблицей, ширина — как у поля.
 * Состояния: загрузка, «ничего не найдено», ошибка, много пунктов (список прокручивается, высота ограничена).
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { cx } from '../lib/cx'
import { useControllable, useLayer } from '../lib/controllable'
import { ErrorMark, FIELD_HEIGHT, FieldShell, fieldAria, fieldBoxClass, useFieldIds, type FieldBaseProps } from './TextField'

export interface ComboboxOption {
  value: string
  label: string
  /** Вторая строка пункта: город, число подписчиков. */
  description?: string
  disabled?: boolean
}

export interface ComboboxProps extends FieldBaseProps {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Пункты ещё грузятся: в списке — «загрузка». */
  loading?: boolean
  /** Слова пустого списка. */
  emptyText?: ReactNode
  /** Можно очистить выбор (кнопка «×» и Esc в закрытом поле). */
  clearable?: boolean
  /** Свой поиск; по умолчанию — часть названия или второй строки без учёта регистра. */
  filter?: (option: ComboboxOption, query: string) => boolean
  /** Открыть список сразу (истории, образцы). */
  defaultOpen?: boolean
  /** Подписи кнопок для читалки. */
  clearLabel?: string
  toggleLabel?: string
  name?: string
  id?: string
}

const norm = (s: string) => s.toLocaleLowerCase('ru').replace(/ё/g, 'е')
export const defaultFilter = (o: ComboboxOption, q: string) => norm(o.label).includes(norm(q)) || (o.description ? norm(o.description).includes(norm(q)) : false)

export function Combobox({
  label,
  hideLabel,
  helperText,
  error,
  size = 'md',
  className,
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder,
  disabled,
  loading,
  emptyText = 'Ничего не найдено',
  clearable = true,
  filter = defaultFilter,
  defaultOpen = false,
  clearLabel = 'очистить выбор',
  toggleLabel = 'список',
  name,
  id,
}: ComboboxProps) {
  const ids = useFieldIds(id)
  const listId = `${ids.id}-list`
  const layer = useLayer()
  const anchor = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, onChange)
  const [query, setQuery] = useState<string | null>(null)
  const [open, setOpenRaw] = useState(defaultOpen && !disabled)
  const selected = options.find((o) => o.value === value) ?? null
  const shown = useMemo(() => (query ? options.filter((o) => filter(o, query)) : options), [options, query, filter])
  const firstActive = () => {
    const i = selected ? shown.indexOf(selected) : -1
    return i >= 0 ? i : shown.findIndex((o) => !o.disabled)
  }
  const [active, setActive] = useState(() => (defaultOpen ? firstActive() : -1))
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const optId = (i: number) => `${listId}-${uid}-${i}`

  const setOpen = (v: boolean) => {
    if (disabled) return
    setOpenRaw(v)
    if (v) setActive(firstActive())
  }
  const close = () => {
    setOpenRaw(false)
    setQuery(null)
    setActive(-1)
  }
  const choose = (o: ComboboxOption) => {
    if (o.disabled) return
    setValue(o.value)
    close()
  }
  const move = (dir: 1 | -1) => {
    if (!shown.length) return
    let i = active
    for (let n = 0; n < shown.length; n++) {
      i = (i + dir + shown.length) % shown.length
      if (i < 0) i = shown.length - 1
      if (!shown[i]!.disabled) break
    }
    setActive(i)
    document.getElementById(optId(i))?.scrollIntoView?.({ block: 'nearest' })
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return setOpen(true)
      return move(e.key === 'ArrowDown' ? 1 : -1)
    }
    if (e.key === 'Enter' && open && active >= 0 && shown[active]) {
      e.preventDefault()
      return choose(shown[active]!)
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        return close()
      }
      if (query) return setQuery(null)
      if (clearable && value !== null) {
        e.preventDefault()
        return setValue(null)
      }
    }
    if (e.key === 'Tab' && open) close()
  }

  const listOpen = open && !disabled
  const hasList = listOpen && !loading && shown.length > 0
  const showClear = clearable && !disabled && (value !== null || Boolean(query))
  const iconBtn = cx(
    'inline-flex w-10 shrink-0 cursor-pointer items-center justify-center text-icon-primary focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
    layer === 2 ? 'hover:bg-field-hover-02' : 'hover:bg-field-hover-01',
    'disabled:cursor-not-allowed disabled:text-icon-disabled disabled:hover:bg-transparent',
  )

  return (
    <FieldShell slot="combobox" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} className={className}>
      <Popover.Root open={listOpen} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <Popover.Anchor asChild>
          <div ref={anchor} className={cx(fieldBoxClass({ layer, invalid: Boolean(error), disabled, within: true }), FIELD_HEIGHT[size], 'flex items-stretch')}>
            <input
              ref={input}
              id={ids.id}
              type="text"
              role="combobox"
              name={name}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={listOpen}
              aria-controls={listOpen ? (hasList ? listId : `${listId}-pop`) : undefined}
              aria-activedescendant={hasList && active >= 0 ? optId(active) : undefined}
              disabled={disabled}
              placeholder={placeholder}
              value={query ?? selected?.label ?? ''}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpenRaw(true)
                const next = e.target.value ? options.filter((o) => filter(o, e.target.value)) : options
                setActive(next.findIndex((o) => !o.disabled))
              }}
              onClick={() => !listOpen && setOpen(true)}
              onKeyDown={onKeyDown}
              onBlur={() => {
                if (listOpen) close()
                else setQuery(null)
              }}
              {...fieldAria(ids, { helperText, error })}
              className="min-w-0 flex-1 border-0 bg-transparent px-4 text-body-compact-01 text-inherit outline-none placeholder:text-text-placeholder disabled:cursor-not-allowed"
            />
            {error && <ErrorMark className="mr-2 self-center" />}
            {showClear && (
              <button
                type="button"
                aria-label={clearLabel}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(null)
                  setQuery(null)
                  input.current?.focus()
                }}
                className={iconBtn}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              type="button"
              tabIndex={-1}
              aria-label={toggleLabel}
              aria-expanded={listOpen}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (listOpen) close()
                else setOpen(true)
                input.current?.focus()
              }}
              className={iconBtn}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={cx('size-4 transition-transform duration-(--cds-duration-fast-02) ease-standard-productive', listOpen && 'rotate-180')}>
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            role={undefined}
            id={`${listId}-pop`}
            data-slot="combobox-list"
            side="bottom"
            align="start"
            sideOffset={0}
            collisionPadding={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchor.current?.contains(e.target as Node)) e.preventDefault()
            }}
            onMouseDown={(e) => e.preventDefault()}
            className={cx(
              'ds-pop z-50 flex w-(--radix-popover-trigger-width) flex-col overflow-hidden bg-layer-01 text-text-primary shadow-raised',
              'max-h-(--radix-popover-content-available-height)',
            )}
          >
            {loading ? (
              <p role="status" className="m-0 px-4 py-3 text-body-compact-01 text-text-secondary">
                загрузка…
              </p>
            ) : shown.length === 0 ? (
              <p role="status" className="m-0 px-4 py-3 text-body-compact-01 text-text-secondary">
                {emptyText}
              </p>
            ) : (
              <ul role="listbox" id={listId} aria-labelledby={ids.labelId} className="m-0 max-h-80 list-none overflow-y-auto p-0">
                {shown.map((o, i) => {
                  const isSel = o.value === value
                  return (
                    <li
                      key={o.value}
                      id={optId(i)}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={o.disabled || undefined}
                      data-active={i === active ? 'true' : undefined}
                      onMouseMove={() => !o.disabled && i !== active && setActive(i)}
                      onClick={() => choose(o)}
                      className={cx(
                        'group flex cursor-pointer px-4 text-body-compact-01 data-[active=true]:bg-layer-hover-01',
                        isSel ? 'bg-layer-selected-01 text-text-primary' : 'text-text-secondary',
                        o.disabled && 'cursor-not-allowed text-text-disabled',
                      )}
                    >
                      <span className="flex min-h-12 min-w-0 flex-1 items-center gap-2 border-t border-border-subtle-01 group-first:border-t-0 group-data-[active=true]:border-transparent md:min-h-10">
                        <span className="flex min-w-0 flex-1 flex-col py-2">
                          <span className="truncate">{o.label}</span>
                          {o.description && <span className="truncate text-helper-text-01 text-text-helper">{o.description}</span>}
                        </span>
                        {isSel && (
                          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4 shrink-0 text-icon-primary">
                            <path d="M3.5 8.2l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </FieldShell>
  )
}
