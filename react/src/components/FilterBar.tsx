/**
 * Фильтры в адресе страницы (`?статус=падает&q=…`): ссылку можно переслать, «назад» возвращает прежний вид.
 * Фильтр — ряд сегментов (тот же ряд, что у вкладок; на узком переносится — видны все варианты), выбранный —
 * «выбрано»; «все» — сброс; `required` — выбор обязателен (режим «30 дней / 90 дней»). Поиск по ключу `q` —
 * `SearchField`. `useUrlFilters` — один на экран.
 */
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { ToggleGroup } from 'radix-ui'
import { SEGMENT, SEGMENT_ON, SEGMENTS, SEGMENTS_WRAP } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { SearchField } from './SearchField'

export interface FilterOption {
  value: string
  label: ReactNode
  count?: number
}
export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
  /** Выбор обязателен: без «все», выбранный не снимается повторным нажатием. */
  required?: boolean
}
export type FilterValue = Record<string, string>

/** Прочитать и записать фильтры в адрес страницы (replaceState — без лишних шагов «назад»). */
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

export interface FilterBarProps {
  filters: FilterDef[]
  value: FilterValue
  onChange: (next: FilterValue) => void
  /** Поиск по ключу `q` — в том же адресе. */
  search?: { label: string; placeholder?: string }
  /** Слово сброса фильтра. */
  allLabel?: string
  className?: string
}

/** Значение «все»: у Radix пустое значение значит «ничего не выбрано», поэтому своё. */
const ALL = '__все'

export function FilterBar({ filters, value, onChange, search, allLabel = 'все', className }: FilterBarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div data-slot="filter-bar" role="search" className={cx('flex min-w-0 flex-col gap-compact', className)}>
      {search && <SearchField label={search.label} placeholder={search.placeholder} value={value.q ?? ''} onChange={(q) => onChange({ ...value, q })} />}
      {filters.map((f) => (
        <div key={f.key} className="flex min-w-0 flex-col gap-tight md:flex-row md:items-center md:gap-compact">
          <span id={`ds-f-${uid}-${f.key}`} className="text-caption text-fg-muted">
            {f.label}
          </span>
          <ToggleGroup.Root
            type="single"
            aria-labelledby={`ds-f-${uid}-${f.key}`}
            data-part="segments"
            value={value[f.key] || (f.required ? (f.options[0]?.value ?? '') : ALL)}
            onValueChange={(v) => {
              if (f.required && !v) return
              onChange({ ...value, [f.key]: v === ALL ? '' : v })
            }}
            className={cx(SEGMENTS, SEGMENTS_WRAP)}
          >
            {[...(f.required ? [] : [{ value: ALL, label: allLabel } as FilterOption]), ...f.options].map((o) => (
              <ToggleGroup.Item key={o.value} value={o.value} className={cx(SEGMENT, SEGMENT_ON)}>
                {o.label}
                {o.count !== undefined && <span className="text-caption text-fg-muted">{o.count}</span>}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      ))}
    </div>
  )
}
