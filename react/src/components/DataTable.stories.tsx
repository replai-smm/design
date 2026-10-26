import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { accounts, allWorking, many, projects, STATUS_WORD, type ProjectRow } from '../stories/fixtures'
import { Button } from './Button'
import { DataTable, DataTableSkeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, type DataTableHeader } from './DataTable'
import { IconIndicator } from './IconIndicator'
import { Pagination } from './Pagination'
import { StateView } from './StateView'

const headers: DataTableHeader[] = [
  { key: 'name', header: 'Проект' },
  { key: 'status', header: 'Состояние' },
  { key: 'reason', header: 'Что случилось' },
  { key: 'team', header: 'Команда' },
  { key: 'checked', header: 'Проверено' },
]

/** Проекты команд: строки в порядке данных, состояние — знаком и словом, действие строки — тихая кнопка. */
function Projects({ rows = projects, selected }: { rows?: ProjectRow[]; selected?: string }) {
  const data = rows.map((r) => ({ ...r, status: <IconIndicator kind={r.status} label={STATUS_WORD[r.status] ?? r.status} />, isSelected: r.id === selected }))
  const failed = new Set(rows.filter((r) => r.status === 'failed').map((r) => r.id))
  return (
    <DataTable rows={data} headers={headers}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps, getCellProps }) => (
        <TableContainer title="Проекты команд" {...getTableContainerProps()}>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableHeader>
                  <span className="sr-only">Действия</span>
                </TableHeader>
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
                  <TableCell className="text-end">
                    {failed.has(row.id) && (
                      <Button kind="ghost" size="sm">
                        Починить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  )
}

const meta = {
  title: 'Компоненты/Коллекции/DataTable',
  component: Projects,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Projects>
export default meta
type S = StoryObj<typeof meta>

/** Строки в порядке данных; состояние — знаком и словом. */
export const Обычное: S = {}
/** Выбранная строка (`isSelected`) — роль «выбрано». */
export const Выбрана: S = { args: { selected: 'p2' } }
/** Загрузка — DataTableSkeleton той же формы; `aria-busy` — у области, которая грузит. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <div role="status" aria-busy="true">
      <span className="sr-only">Проекты команд: загрузка</span>
      <DataTableSkeleton headers={headers} showToolbar={false} />
    </div>
  ),
}
/** Ошибка и пусто — StateView на месте таблицы. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => <StateView kind="ошибка" title="Список не загрузился" description="Сервер не ответил за 10 секунд." action={<Button kind="secondary">Повторить</Button>} />,
}
export const ПервыйЗапуск: S = {
  tags: ['state:первый запуск'],
  render: () => <StateView kind="первый запуск" title="Проектов пока нет" description="Создайте первый проект." action={<Button>Создать проект</Button>} />,
}
/** Всё работает: у каждой строки — «работает». */
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = {
  tags: ['state:ничего не найдено'],
  render: () => <StateView kind="ничего не найдено" title="По фильтрам проектов нет" action={<Button kind="secondary">Сбросить фильтры</Button>} />,
}
export const НетДоступа: S = {
  tags: ['state:нет доступа'],
  render: () => <StateView kind="нет доступа" title="Нет доступа" description="Попросите владельца команды открыть проекты." />,
}

function Paged() {
  const [page, setPage] = useState({ page: 1, pageSize: 25 })
  const from = (page.page - 1) * page.pageSize
  return (
    <div className="flex flex-col">
      <Projects rows={many.slice(from, from + page.pageSize)} />
      <Pagination totalItems={many.length} page={page.page} pageSize={page.pageSize} pageSizes={[10, 25, 50]} onChange={setPage} />
    </div>
  )
}
/** 150 строк: по страницам (Pagination) — строки режет тот, кто их держит. */
export const Много: S = { tags: ['state:много'], render: () => <Paged /> }

const rub = (n: unknown) => (typeof n === 'number' ? `${n.toLocaleString('ru-RU')} ₽` : '—')
const MONEY = new Set(['week', 'left'])

/** Сортировка по заголовку — выбор человека: по кругу «по возрастанию → по убыванию → как в данных». Деньги — справа, в одну строку. */
export const Сортировка: S = {
  render: () => (
    <DataTable
      isSortable
      rows={accounts.map(({ id, name, manager, week, left }) => ({ id, name, manager, week, left }))}
      headers={[
        { key: 'name', header: 'Счёт' },
        { key: 'manager', header: 'Менеджер', isSortable: false },
        { key: 'week', header: '7 дней' },
        { key: 'left', header: 'Остаток' },
      ]}
    >
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
        <TableContainer title="Счета">
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
                  {row.cells.map((cell) =>
                    MONEY.has(cell.info.header) ? (
                      <TableCell key={cell.id} {...getCellProps({ cell })} className="text-end whitespace-nowrap">
                        {rub(cell.value)}
                      </TableCell>
                    ) : (
                      <TableCell key={cell.id} {...getCellProps({ cell })}>
                        {cell.value as ReactNode}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  ),
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const monthRows = accounts.map((c, i) => ({ id: c.id, name: c.name, ...Object.fromEntries(MONTHS.map((_, m) => [`m${m}`, m > 8 && i % 3 === 0 ? null : Math.round((c.week * (m + 3)) / 4 / 10) * 10 + i * 1000])) }))

/** Широкая (13 колонок денег): деньги в одну строку, прокрутка вбок внутри, первая колонка стоит. */
export const Широкая: S = {
  render: () => (
    <DataTable rows={monthRows} headers={[{ key: 'name', header: 'Счёт' }, ...MONTHS.map((m, i) => ({ key: `m${i}`, header: m }))]}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
        <TableContainer title="Списания по месяцам">
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
                  {row.cells.map((cell, i) => (
                    <TableCell key={cell.id} {...getCellProps({ cell })} className={i ? 'text-end whitespace-nowrap' : 'whitespace-nowrap'}>
                      {i ? rub(cell.value) : (cell.value as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  ),
}
