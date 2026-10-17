/**
 * Поиск: поле со знаком лупы и «очистить». Подпись — для читалки (на экране — подсказка в поле). Рамка — та же,
 * что у поля ввода.
 */
import { useId } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Icon } from './Icon'
import { fieldBox } from './TextField'

export interface SearchFieldProps {
  value: string
  onChange: (v: string) => void
  /** Подпись поля для читалки; на экране — подсказка в поле. */
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
      <Icon name="search" className="pointer-events-none absolute left-compact text-fg-muted" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder ?? label}
        onChange={(e) => onChange(e.target.value)}
        className={cx(fieldBox({}), 'pr-control pl-sections [&::-webkit-search-cancel-button]:hidden')}
      />
      {value && (
        <button
          type="button"
          aria-label="очистить поиск"
          onClick={() => onChange('')}
          className={cx('absolute right-tight inline-flex size-dense cursor-pointer items-center justify-center rounded-control text-fg hover:bg-hover', FOCUS)}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  )
}
