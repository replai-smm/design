/**
 * Фильтры и поиск (шаблон «фильтры в адресе», CONCEPT §3.4). Состояние фильтров живёт в адресе страницы
 * (`?статус=падает&q=…`): ссылку можно переслать, «назад» возвращает прежний вид. Хук `useUrlFilters` — один на экран.
 * Фильтр — ряд переключателей (Radix ToggleGroup), «все» — сброс. На телефоне ряд переносится, высота — 48 px.
 */
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { ToggleGroup } from 'radix-ui'
import { cx } from '../lib/cx'

export interface FilterOption {
  value: string
  label: ReactNode
  count?: number
}
export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
}
export type FilterValue = Record<string, string>

/** Прочитать и записать фильтры в адрес страницы (history.replaceState — без лишних шагов «назад»). */
export function useUrlFilters(keys: readonly string[]): [FilterValue, (next: FilterValue) => void] {
  const read = useCallback((): FilterValue => {
    if (typeof window === 'undefined') return {}
    const q = new URLSearchParams(window.location.search)
    return Object.fromEntries(keys.flatMap((k) => (q.get(k) ? [[k, q.get(k) as string]] : [])))
  }, [keys.join('|')])
  const [value, setValue] = useState<FilterValue>(read)
  useEffect(() => {
    const on = () => setValue(read())
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [read])
  const set = useCallback(
    (next: FilterValue) => {
      const q = new URLSearchParams(window.location.search)
      for (const k of keys) {
        if (next[k]) q.set(k, next[k])
        else q.delete(k)
      }
      const s = q.toString()
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${s ? `?${s}` : ''}${window.location.hash}`)
      setValue(read())
    },
    [keys.join('|'), read],
  )
  return [value, set]
}

export interface SearchFieldProps {
  value: string
  onChange: (v: string) => void
  /** Подпись поля (видна читалке; на экране — подсказка в поле). */
  label: string
  placeholder?: string
  className?: string
}

export function SearchField({ value, onChange, label, placeholder, className }: SearchFieldProps) {
  const id = useId()
  return (
    <div data-slot="search" className={cx('relative flex min-w-0 items-center', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-icon-secondary">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder ?? label}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full border-0 border-b border-border-strong-01 bg-field-01 pr-10 pl-10 text-body-compact-01 text-text-primary placeholder:text-text-placeholder focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2 md:min-h-10"
      />
      {value && (
        <button
          type="button"
          aria-label="очистить поиск"
          onClick={() => onChange('')}
          className="absolute right-0 inline-flex size-10 cursor-pointer items-center justify-center text-icon-primary hover:bg-field-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}

export interface FilterBarProps {
  filters: FilterDef[]
  value: FilterValue
  onChange: (next: FilterValue) => void
  /** Поиск по ключу `q` — в том же адресе. */
  search?: { label: string; placeholder?: string }
  /** Подпись «все» у сброса фильтра. */
  allLabel?: string
  className?: string
}

/** Значение переключателя «все»: у Radix пустое значение значит «ничего не выбрано», поэтому своё. */
const ALL = '__все'

export function FilterBar({ filters, value, onChange, search, allLabel = 'все', className }: FilterBarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div data-slot="filter-bar" role="search" className={cx('flex min-w-0 flex-col gap-3', className)}>
      {search && <SearchField label={search.label} placeholder={search.placeholder} value={value.q ?? ''} onChange={(q) => onChange({ ...value, q })} />}
      {filters.map((f) => (
        <div key={f.key} className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-3">
          <span id={`ds-f-${uid}-${f.key}`} className="text-label-01 text-text-secondary">
            {f.label}
          </span>
          <ToggleGroup.Root
            type="single"
            aria-labelledby={`ds-f-${uid}-${f.key}`}
            value={value[f.key] || ALL}
            onValueChange={(v) => onChange({ ...value, [f.key]: v === ALL ? '' : v })}
            className="flex min-w-0 flex-wrap gap-2"
          >
            {[{ value: ALL, label: allLabel } as FilterOption, ...f.options].map((o) => (
              <ToggleGroup.Item
                key={o.value}
                value={o.value}
                className={cx(
                  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-border-strong-01 bg-layer-01 px-4 text-body-compact-01 text-text-primary md:min-h-8 md:px-3',
                  'hover:bg-layer-hover-01 data-[state=on]:border-border-inverse data-[state=on]:bg-layer-selected-inverse data-[state=on]:text-text-inverse',
                  'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
                )}
              >
                {o.label}
                {o.count !== undefined && <span className="text-label-01">{o.count}</span>}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      ))}
    </div>
  )
}
