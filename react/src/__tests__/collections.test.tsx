/** Коллекции (Carbon: DataTable + Table-части, ContainedList, Pagination): строки в порядке данных, сортировка по кругу, в строке — только ghost, страницы. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ReactNode } from 'react'
import { ContainedList, ContainedListItem, DataTable, DataTableSkeleton, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, type DataTableHeader, type DataTableInputRow, type DataTableProps } from '../index'
import { accounts, projects } from '../stories/fixtures'

/** Таблица как у Carbon: render-prop и части. */
function Grid(props: Omit<DataTableProps, 'children'> & { title?: string }) {
  return (
    <DataTable {...props}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps, getCellProps }) => (
        <TableContainer title={props.title} {...getTableContainerProps()}>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id} {...getCellProps({ cell })}>
                      {cell.value as ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  )
}

const H: DataTableHeader[] = [
  { key: 'name', header: 'Счёт' },
  { key: 'left', header: 'Остаток' },
]
const rowsOf = (): DataTableInputRow[] => accounts.map(({ id, name, left }) => ({ id, name, left }))
const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent)
const header = (n: string) => screen.getByRole('columnheader', { name: new RegExp(n) })

describe('DataTable: строки и части', () => {
  it('строки — в порядке данных; ячейка связана с заголовком (headers → id); заголовок контейнера — имя таблицы', () => {
    render(<Grid title="Счета" rows={rowsOf()} headers={H} />)
    expect(names()).toEqual(accounts.map((a) => a.name))
    const table = screen.getByRole('table', { name: 'Счета' })
    const cell = within(table).getAllByRole('cell')[1]
    expect(document.getElementById(cell.getAttribute('headers')!)?.textContent).toBe('Остаток')
    expect(table.closest('[data-part=scroll]')!.className.split(/\s+/)).toEqual(expect.arrayContaining(['relative', 'overflow-x-auto']))
  })

  it('isSelected строки — роль «выбрано»; размер — высота ячеек; без него — 48/40', () => {
    const rows = rowsOf().map((r) => ({ ...r, isSelected: r.id === 'a2' }))
    const { rerender } = render(<Grid rows={rows} headers={H} />)
    expect(document.querySelector('[data-selected]')?.className).toContain('bg-selected')
    expect(screen.getAllByRole('cell')[0].className).toContain('h-touch md:h-control')
    rerender(<Grid rows={rows} headers={H} size="sm" />)
    expect(screen.getAllByRole('cell')[0].className).toContain('h-dense')
  })

  it('первая колонка стоит при прокрутке вбок (ds.css)', () => {
    const css = readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')
    expect(css).toMatch(/\.ds-table :is\(th, td\):first-child \{\s*position: sticky;/)
  })
})

describe('DataTable: сортировка — выбор человека (Carbon)', () => {
  it('по кругу NONE → ASC → DESC → NONE; aria-sort; onClick заголовка — с новым состоянием', () => {
    const onClick = vi.fn()
    function Own() {
      return (
        <DataTable isSortable rows={rowsOf()} headers={H}>
          {({ rows, headers, getHeaderProps, getCellProps, getRowProps }) => (
            <Table aria-label="К">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header, onClick })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id} {...getCellProps({ cell })}>
                        {String(cell.value ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      )
    }
    render(<Own />)
    const button = () => within(header('Остаток')).getByRole('button')
    expect(header('Остаток').getAttribute('aria-sort')).toBe('none')
    fireEvent.click(button())
    expect(header('Остаток').getAttribute('aria-sort')).toBe('ascending')
    expect(onClick).toHaveBeenLastCalledWith(expect.anything(), { sortHeaderKey: 'left', sortDirection: 'ASC' })
    expect(names()[0]).toBe('Счёт склада') // пустое — как пустая строка (Carbon), вверху по возрастанию
    expect(names()[1]).toBe('Счёт маркетинга')
    fireEvent.click(button())
    expect(header('Остаток').getAttribute('aria-sort')).toBe('descending')
    expect(names()[0]).toBe('Счёт поддержки')
    fireEvent.click(button())
    expect(header('Остаток').getAttribute('aria-sort')).toBe('none')
    expect(names()).toEqual(accounts.map((a) => a.name))
  })

  it('isSortable у заголовка сильнее таблицы; sortRow — своё сравнение', () => {
    const sortRow = vi.fn((a: unknown, b: unknown, { sortDirection }: { sortDirection: string }) => (sortDirection === 'ASC' ? String(b).localeCompare(String(a)) : 0))
    render(<Grid isSortable sortRow={sortRow} rows={rowsOf()} headers={[{ ...H[0]! }, { ...H[1]!, isSortable: false }]} />)
    expect(within(header('Остаток')).queryByRole('button')).toBeNull()
    fireEvent.click(within(header('Счёт')).getByRole('button'))
    expect(sortRow).toHaveBeenCalled()
    expect(names()[0]).toBe([...accounts].map((a) => a.name).sort((a, b) => b.localeCompare(a))[0])
  })
})

describe('DataTableSkeleton', () => {
  it('та же форма: заголовки колонок видны, строки — скелетами', () => {
    const { container } = render(<DataTableSkeleton headers={H} rowCount={3} showHeader={false} showToolbar={false} />)
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Счёт', 'Остаток'])
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    expect(container.querySelectorAll('tbody [data-slot=skeleton-text]').length).toBe(6)
  })
})

describe('ContainedList', () => {
  it('подпись — имя списка; строка с onClick — кнопка; открытая — aria-current и «выбрано»', () => {
    const onClick = vi.fn()
    render(
      <ContainedList label="Проекты">
        {projects.slice(0, 3).map((p) => (
          <ContainedListItem key={p.id} onClick={onClick} aria-current={p.id === 'p2' || undefined}>
            {p.name}
          </ContainedListItem>
        ))}
      </ContainedList>,
    )
    const list = screen.getByRole('list', { name: 'Проекты' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: projects[0]!.name }))
    expect(onClick).toHaveBeenCalled()
    const cur = document.querySelectorAll('[aria-current=true]')
    expect(cur).toHaveLength(1)
    expect(cur[0].className).toContain('aria-[current=true]:bg-selected')
  })

  it('без onClick — не кнопка; выключенная кнопка не нажимается', () => {
    const onClick = vi.fn()
    render(
      <ContainedList>
        <ContainedListItem>просто</ContainedListItem>
        <ContainedListItem onClick={onClick} disabled>
          выкл
        </ContainedListItem>
      </ContainedList>,
    )
    expect(screen.queryByRole('button', { name: 'просто' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'выкл' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('Pagination', () => {
  it('видные строки, выбор страницы и размера, стрелки; onChange({ page, pageSize })', () => {
    const onChange = vi.fn()
    render(<Pagination totalItems={150} pageSize={25} pageSizes={[10, 25, 50]} onChange={onChange} />)
    expect(document.querySelector('[data-part=range]')!.textContent).toBe('1–25 из 150')
    const back = screen.getByRole('button', { name: 'Предыдущая страница' }) as HTMLButtonElement
    expect(back.disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }))
    expect(onChange).toHaveBeenLastCalledWith({ page: 2, pageSize: 25 })
    expect(document.querySelector('[data-part=range]')!.textContent).toBe('26–50 из 150')
    fireEvent.change(screen.getByRole('combobox', { name: 'Страница из 6' }), { target: { value: '6' } })
    expect(onChange).toHaveBeenLastCalledWith({ page: 6, pageSize: 25 })
    expect((screen.getByRole('button', { name: 'Следующая страница' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole('combobox', { name: 'Строк на странице:' }), { target: { value: '50' } })
    expect(onChange).toHaveBeenLastCalledWith({ page: 1, pageSize: 50 })
    expect(document.querySelector('[data-part=range]')!.textContent).toBe('1–50 из 150')
  })

  it('число неизвестно: «страница N», вперёд — пока не isLastPage', () => {
    const { rerender } = render(<Pagination pagesUnknown page={3} pageSize={10} />)
    expect(screen.getByText('страница 3')).toBeTruthy()
    expect(document.querySelector('[data-part=range]')!.textContent).toBe('21–30')
    expect((screen.getByRole('button', { name: 'Следующая страница' }) as HTMLButtonElement).disabled).toBe(false)
    rerender(<Pagination pagesUnknown page={3} pageSize={10} isLastPage />)
    expect((screen.getByRole('button', { name: 'Следующая страница' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
