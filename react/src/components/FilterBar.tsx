/**
 * Фильтры в адресе страницы (`?статус=падает&q=…`): ссылку можно переслать, «назад» возвращает прежний вид.
 * Фильтр — ряд сегментов `ContentSwitcher` (тот же ряд, что у вкладок; на узком переносится — видны все варианты),
 * выбранный — «выбрано»; «все» — сброс; `required` — выбор обязателен, «все» нет (режим «30 дней / 90 дней»). Поиск по
 * ключу `q` — `Search`. `useUrlFilters` — один на экран. Пары в Carbon нет (ibm-products: FilterPanel).
 */
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { SEGMENTS_WRAP } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { ContentSwitcher, Switch } from './ContentSwitcher'
import { Search } from './Search'

export interface FilterOption {
  value: string
  label: ReactNode
  count?: number
}
export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
  /** Выбор обязателен: без «все». */
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
  /** Поиск по ключу `q` — в том же адресе (`labelText`, `placeholder` — как у Search). */
  search?: { labelText: string; placeholder?: string }
  /** Слово сброса фильтра. */
  allLabel?: string
  className?: string
}

export function FilterBar({ filters, value, onChange, search, allLabel = 'все', className }: FilterBarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <div data-slot="filter-bar" role="search" className={cx('flex min-w-0 flex-col gap-compact', className)}>
      {search && <Search labelText={search.labelText} placeholder={search.placeholder} value={value.q ?? ''} onChange={(e) => onChange({ ...value, q: e.target.value })} />}
      {filters.map((f) => {
        const options: FilterOption[] = [...(f.required ? [] : [{ value: '', label: allLabel }]), ...f.options]
        const current = value[f.key] || (f.required ? (f.options[0]?.value ?? '') : '')
        return (
          <div key={f.key} className="flex min-w-0 flex-col gap-tight md:flex-row md:items-center md:gap-compact">
            <span id={`ds-f-${uid}-${f.key}`} className="text-caption text-fg-muted">
              {f.label}
            </span>
            <ContentSwitcher
              aria-labelledby={`ds-f-${uid}-${f.key}`}
              selectedIndex={Math.max(
                options.findIndex((o) => o.value === current),
                0,
              )}
              onChange={({ name }) => onChange({ ...value, [f.key]: String(name ?? '') })}
              className={SEGMENTS_WRAP}
            >
              {options.map((o) => (
                <Switch key={o.value || allLabel} name={o.value}>
                  {o.label}
                  {o.count !== undefined && <span className="text-caption text-fg-muted">{o.count}</span>}
                </Switch>
              ))}
            </ContentSwitcher>
          </div>
        )
      })}
    </div>
  )
}
