/**
 * Выбор с поиском (WAI-ARIA combobox): поле, в котором печатают, и список под ним. Печать сужает список (без учёта
 * регистра и «ё», по названию и второй строке); стрелки ходят, Enter выбирает, Esc закрывает (закрытое — очищает
 * выбор), Tab уходит без выбора. Фокус всегда в поле: активный пункт — aria-activedescendant. Список — во всплывающем
 * слое (не обрезается панелью), ширина — как у поля; выбранный пункт — «выбрано» и галочка. Состояния: загрузка,
 * пусто (`empty`), ошибка, много (`limit` — первые N и «уточните поиск»).
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Popover } from 'radix-ui'
import { FOCUS } from '../lib/anatomy'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import { FieldShell, fieldAria, fieldBox, useFieldIds, type FieldBaseProps, type FieldRowProps } from './TextField'

export interface ComboboxOption {
  value: string
  label: string
  /** Вторая строка пункта: город, число подписчиков. */
  description?: string
  disabled?: boolean
}

export interface ComboboxProps extends FieldBaseProps, FieldRowProps {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Пункты ещё грузятся: в списке — «загрузка». */
  loading?: boolean
  /** Слова пустого списка. */
  empty?: ReactNode
  /** Не больше `limit` пунктов, под ними — «уточните поиск». */
  limit?: number
  /** Можно очистить выбор (кнопка и Esc в закрытом поле). */
  clearable?: boolean
  name?: string
  id?: string
}

const norm = (s: string) => s.toLocaleLowerCase('ru').replace(/ё/g, 'е')
const matches = (o: ComboboxOption, q: string) => norm(o.label).includes(norm(q)) || (o.description ? norm(o.description).includes(norm(q)) : false)

export function Combobox({ label, hideLabel, helperText, error, help, inline, unit, dense, className, options, value: valueProp, defaultValue = null, onChange, placeholder, disabled, loading, empty = 'Ничего не найдено', limit, clearable = true, name, id }: ComboboxProps) {
  const ids = useFieldIds(id)
  const listId = `${ids.id}-list`
  const anchor = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, onChange)
  const selected = options.find((o) => o.value === value) ?? null
  // query — текст поиска; null — поиска нет, поле показывает название выбранного
  const [query, setQuery] = useState<string | null>(null)
  const text = query ?? selected?.label ?? ''
  const [open, setOpenRaw] = useState(false)
  const matched = useMemo(() => (query ? options.filter((o) => matches(o, query)) : options), [options, query])
  const shown = useMemo(() => (limit !== undefined && limit > 0 ? matched.slice(0, limit) : matched), [matched, limit])
  const firstActive = () => {
    const i = selected ? shown.indexOf(selected) : -1
    return i >= 0 ? i : shown.findIndex((o) => !o.disabled)
  }
  const [active, setActive] = useState(-1)
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
  const iconBtn = cx('inline-flex w-control shrink-0 cursor-pointer items-center justify-center text-fg hover:bg-hover', FOCUS, 'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')
  const note = (children: ReactNode, slot?: string) => (
    <p role="status" data-slot={slot} className="m-0 px-compact py-items text-body text-fg-muted">
      {children}
    </p>
  )

  return (
    <FieldShell slot="combobox" ids={ids} label={label} hideLabel={hideLabel} helperText={helperText} error={error} disabled={disabled} className={className} help={help} inline={inline} unit={unit}>
      <Popover.Root open={listOpen} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <Popover.Anchor asChild>
          <div ref={anchor} className={cx(fieldBox({ invalid: Boolean(error), disabled, within: true, dense }), 'flex items-stretch overflow-hidden')}>
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
              value={text}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpenRaw(true)
                const next = e.target.value ? options.filter((o) => matches(o, e.target.value)) : options
                setActive(next.findIndex((o) => !o.disabled))
              }}
              onClick={() => !listOpen && setOpen(true)}
              onKeyDown={onKeyDown}
              onBlur={() => (listOpen ? close() : setQuery(null))}
              {...fieldAria(ids, { helperText, error })}
              className="min-w-0 flex-1 border-0 bg-transparent px-compact text-body text-inherit outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
            />
            {showClear && (
              <button
                type="button"
                aria-label="очистить выбор"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(null)
                  setQuery(null)
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
              aria-label="список"
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
              <Icon name="chevron-down" className={cx('transition-transform duration-fast ease-standard', listOpen && 'rotate-180')} />
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
            sideOffset={4}
            collisionPadding={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchor.current?.contains(e.target as Node)) e.preventDefault()
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="ds-pop z-50 flex max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) flex-col overflow-hidden rounded-surface border border-line bg-surface text-fg shadow-raised"
          >
            {loading ? (
              note('загрузка…')
            ) : shown.length === 0 ? (
              note(empty)
            ) : (
              <ul role="listbox" id={listId} aria-labelledby={ids.labelId} className="relative m-0 list-none overflow-y-auto p-tight">
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
                        'flex min-h-touch cursor-pointer items-center gap-items rounded-control px-items text-body md:min-h-control data-[active=true]:bg-hover',
                        isSel ? 'bg-selected text-fg' : 'text-fg',
                        o.disabled && 'cursor-not-allowed text-fg-disabled',
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col py-tight">
                        <span className="truncate">{o.label}</span>
                        {o.description && <span className="truncate text-caption text-fg-muted">{o.description}</span>}
                      </span>
                      {isSel && <Icon name="check" />}
                    </li>
                  )
                })}
              </ul>
            )}
            {!loading && matched.length > shown.length && note(`Показаны первые ${shown.length} из ${matched.length} — уточните поиск`, 'combobox-more')}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </FieldShell>
  )
}
