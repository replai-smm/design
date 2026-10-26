/**
 * Страницы длинного набора строк (Carbon: Pagination): сколько строк на странице (`pageSizes`), какие строки видны,
 * выбор страницы и стрелки «назад» · «вперёд». Строки режет тот, кто их держит: `onChange({ page, pageSize })`.
 * Номер страницы и размер — свои, `page` и `pageSize` их задают (смена свойства — новое значение). Число строк неизвестно —
 * `pagesUnknown` (вперёд можно, пока не `isLastPage`). Высота — `size`; без него — 48 на телефоне, 40 на ноутбуке.
 */
import { useEffect, useId, useState, type HTMLAttributes } from 'react'
import { cx } from '../lib/cx'
import { CaretLeft, CaretRight } from '../lib/icons.gen'
import type { Size } from '../lib/vocab'
import { IconButton } from './Button'
import { Select, SelectItem } from './Select'

export interface PaginationPageSize {
  text: string
  value: number
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'onChange'> {
  backwardText?: string
  forwardText?: string
  disabled?: boolean
  id?: string | number
  isLastPage?: boolean
  /** Видные строки при известном числе: «11–20 из 150». */
  itemRangeText?: (min: number, max: number, total: number) => string
  /** Видные строки при неизвестном числе: «11–20». */
  itemText?: (min: number, max: number) => string
  itemsPerPageText?: string
  onChange?: (data: { page: number; pageSize: number }) => void
  page?: number
  pageInputDisabled?: boolean
  pageSizeInputDisabled?: boolean
  /** «из 15» — после выбора страницы. */
  pageRangeText?: (current: number, total: number) => string
  /** Имя выбора страницы для читалки. */
  pageSelectLabelText?: (total: number) => string
  pageSize?: number
  pageSizes?: Array<number | PaginationPageSize>
  /** Номер страницы при неизвестном числе: «страница 3». */
  pageText?: (page: number) => string
  pagesUnknown?: boolean
  size?: Size
  totalItems?: number
}

const sizesOf = (sizes?: Array<number | PaginationPageSize>) => sizes?.map((s) => (typeof s === 'number' ? { text: String(s), value: s } : s))

/** Страницы набора строк (Carbon: Pagination). */
export function Pagination({
  backwardText = 'Предыдущая страница',
  forwardText = 'Следующая страница',
  disabled = false,
  id,
  isLastPage = false,
  itemRangeText = (min, max, total) => `${min}–${max} из ${total}`,
  itemText = (min, max) => `${min}–${max}`,
  itemsPerPageText = 'Строк на странице:',
  onChange,
  page: pageProp = 1,
  pageInputDisabled,
  pageSizeInputDisabled,
  pageRangeText = (_current, total) => `из ${total}`,
  pageSelectLabelText = (total) => `Страница из ${total}`,
  pageSize: pageSizeProp,
  pageSizes: sizesProp,
  pageText = (page) => `страница ${page}`,
  pagesUnknown = false,
  size,
  totalItems,
  className,
  ...rest
}: PaginationProps) {
  const uid = useId()
  const base = id === undefined ? uid : String(id)
  const sizes = sizesOf(sizesProp)
  const pick = (want?: number) => (want !== undefined && (!sizes || sizes.some((s) => s.value === want)) ? want : (sizes?.[0]?.value ?? 10))
  const [page, setPage] = useState(pageProp)
  const [pageSize, setPageSize] = useState(() => pick(pageSizeProp))
  useEffect(() => setPage(pageProp), [pageProp])
  useEffect(() => setPageSize(pick(pageSizeProp)), [pageSizeProp])
  const totalPages = totalItems ? Math.max(Math.ceil(totalItems / pageSize), 1) : 1
  const go = (next: number, nextSize = pageSize) => {
    setPage(next)
    setPageSize(nextSize)
    onChange?.({ page: next, pageSize: nextSize })
  }
  const first = pageSize * (page - 1) + 1
  const range = pagesUnknown || !totalItems ? (totalItems === 0 ? itemRangeText(0, 0, 0) : itemText(first, page * pageSize)) : itemRangeText(Math.min(first, totalItems), Math.min(page * pageSize, totalItems), totalItems)
  return (
    <div data-slot="pagination" className={cx('flex min-w-0 flex-wrap items-center justify-between gap-x-blocks gap-y-items border-t border-line pt-items text-body text-fg-muted', className)} {...rest}>
      <div className="flex min-w-0 flex-wrap items-center gap-items">
        {sizes && (
          <>
            <span aria-hidden="true">{itemsPerPageText}</span>
            <Select id={`${base}-size`} labelText={itemsPerPageText} hideLabel size={size} disabled={pageSizeInputDisabled || disabled} value={pageSize} onChange={(e) => go(1, Number(e.target.value))}>
              {sizes.map((s) => (
                <SelectItem key={s.value} value={s.value} text={s.text} />
              ))}
            </Select>
          </>
        )}
        <span data-part="range" className="text-fg">
          {range}
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-items">
        {pagesUnknown ? (
          <span>{pageText(page)}</span>
        ) : (
          <>
            <Select id={`${base}-page`} labelText={pageSelectLabelText(totalPages)} hideLabel size={size} disabled={pageInputDisabled || disabled} value={page} onChange={(e) => go(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (
                <SelectItem key={i + 1} value={i + 1} text={String(i + 1)} />
              ))}
            </Select>
            <span>{pageRangeText(page, totalPages)}</span>
          </>
        )}
        <IconButton kind="ghost" size={size} label={backwardText} disabled={disabled || page === 1} onClick={() => go(page - 1)} data-part="backward">
          <CaretLeft />
        </IconButton>
        <IconButton kind="ghost" size={size} label={forwardText} disabled={disabled || (page === totalPages && !pagesUnknown) || isLastPage} onClick={() => go(page + 1)} data-part="forward">
          <CaretRight />
        </IconButton>
      </div>
    </div>
  )
}
