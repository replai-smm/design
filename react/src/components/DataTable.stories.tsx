import type { Meta, StoryObj } from '@storybook/react-vite'
import { accounts, allWorking, many, projects, STATUS_WORD, type AccountRow, type ProjectRow } from '../stories/fixtures'
import { Button } from './Button'
import { DataTable, type DataTableColumn } from './Collection'
import { IconIndicator } from './IconIndicator'

const rub = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)
const accountColumns: DataTableColumn<AccountRow>[] = [
  { key: 'name', header: 'Счёт', cell: (r) => r.name, face: true, grow: 2, sortValue: (r) => r.name },
  { key: 'mg', header: 'Менеджер', cell: (r) => r.manager, sortValue: (r) => r.manager },
  { key: 'week', header: '7 дней', cell: (r) => rub(r.week), face: true, align: 'end', nowrap: true, sortValue: (r) => r.week, sortFirst: 'descending' },
  { key: 'left', header: 'Остаток', cell: (r) => rub(r.left), align: 'end', nowrap: true, sortValue: (r) => r.left, sortFirst: 'descending' },
]

const columns: DataTableColumn<ProjectRow>[] = [
  { key: 'name', header: 'Проект', cell: (r) => r.name, face: true, grow: 2 },
  { key: 'status', header: 'Состояние', cell: (r) => <IconIndicator kind={r.status} label={STATUS_WORD[r.status] ?? r.status} />, face: true },
  { key: 'reason', header: 'Что случилось', cell: (r) => r.reason, face: true, grow: 2 },
  { key: 'team', header: 'Команда', cell: (r) => r.team },
  { key: 'checked', header: 'Проверено', cell: (r) => r.checked, align: 'end' },
]

const meta = {
  title: 'Компоненты/Коллекции/Таблица',
  component: DataTable<ProjectRow>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Проекты команд',
    rows: projects,
    columns,
    getKey: (r: ProjectRow) => r.id,
    onSelect: () => {},
    rowAction: (r: ProjectRow) =>
      r.status === 'failed' ? (
        <Button kind="ghost" size="sm">
          Починить
        </Button>
      ) : null,
  },
} satisfies Meta<typeof DataTable<ProjectRow>>
export default meta
type S = StoryObj<typeof meta>

/** Строки в порядке данных; состояние — знаком и словом. */
export const Обычное: S = {}
/** Выбранная строка — роль «выбрано». */
export const Выбрана: S = { args: { selectedKey: 'p2' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Список не загрузился', description: 'Сервер не ответил за 10 секунд.', onRetry: () => {} } } }
export const ПервыйЗапуск: S = {
  tags: ['state:первый запуск'],
  args: { rows: [], empty: { kind: 'первый запуск', title: 'Проектов пока нет', description: 'Создайте первый проект.', action: <Button>Создать проект</Button> } },
}
/** Всё работает: у каждой строки — «работает». */
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'По фильтрам проектов нет', action: <Button kind="secondary">Сбросить фильтры</Button> } } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа', description: 'Попросите владельца команды открыть проекты.' } } }
/** 150 строк: первые 50 и «показать ещё». */
export const Много: S = { tags: ['state:много'], args: { rows: many } }

/** Сортировка по заголовку — выбор человека; пустое всегда внизу. */
export const Сортировка: S = {
  render: () => <DataTable<AccountRow> label="Счета" rows={accounts} columns={accountColumns} getKey={(r) => r.id} defaultSort={{ key: 'week', direction: 'descending' }} />,
}

/** Приглушённые строки: неактивное вторым цветом текста, причина — словом. */
export const ПриглушённыеСтроки: S = {
  render: () => (
    <DataTable<AccountRow> label="Счета" rows={accounts} columns={[...accountColumns, { key: 'idle', header: 'Списания', cell: (r) => r.idle ?? 'списывается' }]} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} onSelect={() => {}} />
  ),
}

/** Подсказка у заголовка: пунктир, Tooltip ДС; у сортируемой — у той же кнопки. */
export const ПодсказкаУЗаголовка: S = {
  render: () => (
    <DataTable<AccountRow>
      label="Счета"
      rows={accounts}
      getKey={(r) => r.id}
      columns={[accountColumns[0]!, { ...accountColumns[1]!, sortValue: undefined, hint: 'Кто ведёт счёт' }, { ...accountColumns[2]!, hint: 'Списано за 7 дней до вчера, без НДС' }, accountColumns[3]!]}
    />
  ),
}

interface MonthRow {
  id: string
  name: string
  months: Array<number | null>
}
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const monthRows: MonthRow[] = accounts.map((c, i) => ({ id: c.id, name: c.name, months: MONTHS.map((_, m) => (m > 8 && i % 3 === 0 ? null : Math.round((c.week * (m + 3)) / 4 / 10) * 10 + i * 1000)) }))
const monthColumns: DataTableColumn<MonthRow>[] = [
  { key: 'name', header: 'Счёт', cell: (r) => r.name, face: true, grow: 2, sortValue: (r) => r.name },
  ...MONTHS.map((m, i): DataTableColumn<MonthRow> => ({ key: `m${i}`, header: m, cell: (r) => rub(r.months[i] ?? null), align: 'end', nowrap: true, face: i >= 9, sortValue: (r) => r.months[i], sortFirst: 'descending' })),
]

/** Широкая (13 колонок денег): деньги в одну строку, прокрутка вбок, первая колонка стоит. */
export const Широкая: S = {
  render: () => <DataTable<MonthRow> label="Списания по месяцам" rows={monthRows} columns={monthColumns} getKey={(r) => r.id} onSelect={() => {}} />,
}
