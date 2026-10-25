/** Коллекции: строки в порядке данных, много (П12), выбранная строка, сортировка, подсказка, широкая таблица. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compareSortValues, DataTable, List, type DataTableColumn, type SortState } from '../index'
import { accounts, projects, many, type AccountRow, type ProjectRow } from '../stories/fixtures'

const cols: DataTableColumn<ProjectRow>[] = [{ key: 'n', header: 'Проект', cell: (r) => r.name, face: true }]

describe('таблица и список: порядок данных, много', () => {
  it('строки — в порядке данных: группировки по состоянию нет (это логика продукта)', () => {
    const { container } = render(<DataTable<ProjectRow> label="т" rows={projects} columns={cols} getKey={(r) => r.id} />)
    expect([...container.querySelectorAll('[data-slot=row]')].map((r) => r.textContent)).toEqual(projects.map((p) => p.name))
    expect(container.querySelector('[data-group]')).toBeNull()
  })

  it('150 строк: видно 50, «показать ещё · N» добавляет', () => {
    const rows = many
    const { container } = render(<DataTable<ProjectRow> label="т" rows={rows} columns={cols} getKey={(r) => r.id} />)
    expect(container.querySelectorAll('[data-slot=row]').length).toBe(50)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`показать ещё · ${rows.length - 50}`) }))
    expect(container.querySelectorAll('[data-slot=row]').length).toBe(Math.min(100, rows.length))
  })

  it('загрузка — скелет; ошибка — «Повторить»; пусто — своё состояние', () => {
    const retry = vi.fn()
    const { container, rerender } = render(<DataTable<ProjectRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="loading" />)
    expect(container.querySelectorAll('[data-slot=skeleton-text]').length).toBeGreaterThan(0)
    rerender(<DataTable<ProjectRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="error" error={{ title: 'Не загрузилось', onRetry: retry }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalled()
    rerender(<DataTable<ProjectRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} empty={{ kind: 'первый запуск', title: 'Проектов пока нет' }} />)
    expect(container.querySelector('[data-state="первый запуск"]')).toBeTruthy()
  })

  it('выбранная строка — «выбрано» и aria-current; одно слово selectedKey у таблицы и списка', () => {
    const { rerender } = render(<List label="Проекты" rows={projects} getKey={(r: ProjectRow) => r.id} renderRow={(r: ProjectRow) => r.name} onSelect={() => {}} selectedKey="p1" />)
    const cur = document.querySelectorAll('[aria-current=true]')
    expect(cur).toHaveLength(1)
    expect(cur[0].closest('li')!.className).toContain('bg-selected')
    rerender(<DataTable<ProjectRow> label="т" rows={projects} columns={cols} getKey={(r) => r.id} onSelect={() => {}} selectedKey="p1" />)
    expect(document.querySelector('[data-selected]')?.className).toContain('bg-selected')
  })

  it('на телефоне видны колонки лица: остальные — ds-cell-more', () => {
    const { container } = render(<DataTable<ProjectRow> label="т" rows={projects.slice(0, 1)} columns={[...cols, { key: 'c', header: 'Команда', cell: (r) => r.team }]} getKey={(r) => r.id} />)
    const head = container.querySelectorAll('[role=columnheader]')
    expect([head[0].className.includes('ds-cell-more'), head[1].className.includes('ds-cell-more')]).toEqual([false, true])
  })
})

describe('таблица: сортировка — выбор человека', () => {
  const ccols: DataTableColumn<AccountRow>[] = [
    { key: 'name', header: 'Счёт', cell: (r) => r.name, face: true, sortValue: (r) => r.name },
    { key: 'mg', header: 'Менеджер', cell: (r) => r.manager, hint: 'Кто ведёт счёт' },
    { key: 'left', header: 'Остаток', cell: (r) => (r.left == null ? '—' : String(r.left)), align: 'end', nowrap: true, sortValue: (r) => r.left, sortFirst: 'descending', hint: 'Остаток на вчера' },
  ]
  const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent)
  const header = (n: string) => screen.getByRole('columnheader', { name: new RegExp(n) })

  it('нажатие — в сторону колонки, повторное — в обратную, пустое внизу', () => {
    render(<DataTable<AccountRow> label="К" rows={accounts} columns={ccols} getKey={(r) => r.id} />)
    expect(names()).toEqual(accounts.map((c) => c.name))
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(header('Остаток').getAttribute('aria-sort')).toBe('descending')
    expect(names()).toEqual(['Счёт поддержки', 'Резервный счёт', 'Счёт продаж', 'Основной счёт', 'Счёт маркетинга', 'Счёт склада'])
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(names().at(-1)).toBe('Счёт склада')
  })

  it('управляемая — зовёт onSortChange', () => {
    const onSortChange = vi.fn()
    render(<DataTable<AccountRow> label="К" rows={accounts} columns={ccols} getKey={(r) => r.id} sort={null} onSortChange={onSortChange} />)
    fireEvent.click(within(header('Счёт')).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' } satisfies SortState)
  })

  it('сравнение: числа как числа, строки по-русски, пустое внизу', () => {
    expect([10, 9, null, 100].sort((a, b) => compareSortValues(a, b, 'ascending'))).toEqual([9, 10, 100, null])
    expect(['Жук', 'ель', 'ёж'].sort((a, b) => compareSortValues(a, b, 'ascending'))).toEqual(['ёж', 'ель', 'Жук'])
  })

  it('подсказка у заголовка — Tooltip ДС и описание; у сортируемой — у той же кнопки (одна остановка Tab)', async () => {
    render(<DataTable<AccountRow> label="К" rows={accounts} columns={ccols} getKey={(r) => r.id} />)
    const b = within(header('Менеджер')).getByRole('button')
    expect(document.getElementById(b.getAttribute('aria-describedby')!)?.textContent).toBe('Кто ведёт счёт')
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Кто ведёт счёт'))
    expect(within(header('Остаток')).getAllByRole('button')).toHaveLength(1)
  })

  it('широкая: колонка не уже значения (min-content), nowrap — в одну строку, прокрутка вбок внутри, первая колонка стоит', () => {
    render(<DataTable<AccountRow> label="К" rows={accounts} columns={ccols} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} />)
    const table = screen.getByRole('table')
    expect(table.style.getPropertyValue('--table-cols')).toBe('minmax(min-content, 1fr) minmax(min-content, 1fr) minmax(min-content, 1fr)')
    expect(screen.getByText('15400').className).toContain('whitespace-nowrap')
    expect(table.parentElement!.className.split(/\s+/)).toEqual(expect.arrayContaining(['relative', 'overflow-x-auto']))
    const css = readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')
    expect(css).toMatch(/\.ds-table \.ds-row > \[role='cell'\]:first-child,\s*\.ds-table \.ds-row > \[role='columnheader'\]:first-child \{\s*position: sticky;/)
    const muted = screen.getByText('Резервный счёт').closest('[role=row]')!
    expect(muted.className).toContain('text-fg-muted')
  })
})
