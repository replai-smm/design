import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/filtering.md?raw'
import { Button } from '../components/Button'
import { DataTable, DataTableSkeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../components/DataTable'
import { FilterBar, type FilterValue } from '../components/FilterBar'
import { Heading } from '../components/Heading'
import { Pagination } from '../components/Pagination'
import { StateView } from '../components/StateView'
import { Section, Stack } from '../components/layout'
import type { DataState } from '../lib/vocab'
import { pattern } from './story'

interface Order {
  id: string
  item: string
  status: string
  city: string
}
const ORDERS: Order[] = [
  { id: '1041', item: 'Стол письменный', status: 'в пути', city: 'Казань' },
  { id: '1042', item: 'Лампа настольная', status: 'доставлен', city: 'Пермь' },
  { id: '1043', item: 'Кресло', status: 'в пути', city: 'Казань' },
  { id: '1044', item: 'Полка', status: 'отменён', city: 'Омск' },
]
const many = Array.from({ length: 120 }, (_, i) => ({ ...ORDERS[i % 4]!, id: String(2000 + i) }))
const headers = [
  { key: 'number', header: 'Заказ' },
  { key: 'item', header: 'Товар' },
  { key: 'status', header: 'Статус' },
  { key: 'city', header: 'Город' },
]

/** Заказы: фильтр по статусу и городу, поиск, таблица по страницам; фильтр живёт в адресе. */
function Example({ state = 'ready', rows = ORDERS }: { state?: DataState; rows?: Order[] }) {
  const [filter, setFilter] = useState<FilterValue>({})
  const [page, setPage] = useState({ page: 1, pageSize: 10 })
  const shown = rows.filter((r) => (!filter.status || r.status === filter.status) && (!filter.city || r.city === filter.city))
  const from = (page.page - 1) * page.pageSize
  return (
    <Section as={Stack} gap={5} className="p-blocks">
      <Heading>Заказы</Heading>
      <FilterBar
        filters={[
          { key: 'status', label: 'Статус', options: [{ value: 'в пути', label: 'в пути' }, { value: 'доставлен', label: 'доставлен' }, { value: 'отменён', label: 'отменён' }] },
          { key: 'city', label: 'Город', options: [{ value: 'Казань', label: 'Казань' }, { value: 'Пермь', label: 'Пермь' }, { value: 'Омск', label: 'Омск' }] },
        ]}
        value={filter}
        onChange={(v) => (setFilter(v), setPage((p) => ({ ...p, page: 1 })))}
        search={{ labelText: 'Поиск по заказам' }}
      />
      {state === 'loading' ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Заказы: загрузка</span>
          <DataTableSkeleton headers={headers} showHeader={false} showToolbar={false} />
        </div>
      ) : state === 'error' ? (
        <StateView kind="ошибка" title="Заказы не загрузились" action={<Button kind="secondary">Повторить</Button>} />
      ) : (
        <div className="flex flex-col">
          <DataTable rows={shown.slice(from, from + page.pageSize).map((r) => ({ ...r, number: `№ ${r.id}` }))} headers={headers}>
            {({ rows: view, headers: cols, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
              <TableContainer>
                <Table aria-label="Заказы" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {cols.map((header) => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {view.map((row) => (
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
          {shown.length > page.pageSize && <Pagination totalItems={shown.length} page={page.page} pageSize={page.pageSize} pageSizes={[10, 25, 50]} onChange={setPage} />}
        </div>
      )}
    </Section>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Фильтры', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error' } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
