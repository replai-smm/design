import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, cabinets, groups, many, type CabinetRow, type GroupRow } from '../stories/fixtures'
import { ActionArea, Button } from './Button'
import { DataTable, type Column } from './Collection'

const rub = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)
const cabinetColumns: Column<CabinetRow>[] = [
  { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, grow: 2, sortValue: (r) => r.name },
  { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist, sortValue: (r) => r.targetologist },
  { key: 'week', header: '7 дней', cell: (r) => rub(r.week), face: true, align: 'end', nowrap: true, sortValue: (r) => r.week, sortFirst: 'descending' },
  { key: 'left', header: 'Остаток', cell: (r) => rub(r.left), align: 'end', nowrap: true, sortValue: (r) => r.left, sortFirst: 'descending' },
]

const columns: Column<GroupRow>[] = [
  { key: 'name', header: 'Группа', cell: (r) => r.name, face: true, grow: 2 },
  { key: 'reason', header: 'Что случилось', cell: (r) => r.reason, face: true, grow: 2 },
  { key: 'client', header: 'Клиент', cell: (r) => r.client },
  { key: 'checked', header: 'Проверено', cell: (r) => r.checked, align: 'end' },
]

const meta = {
  title: 'Компоненты/Коллекции/Таблица',
  component: DataTable<GroupRow>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Группы клиентов',
    rows: groups,
    columns,
    getKey: (r: GroupRow) => r.id,
    getStatus: (r: GroupRow) => r.status,
    onSelect: () => {},
    rowAction: (r: GroupRow) => (r.status === 'work.failing' ? <Button variant="ghost" dense>Починить</Button> : null),
  },
} satisfies Meta<typeof DataTable<GroupRow>>
export default meta
type S = StoryObj<typeof meta>

/** Срочное сверху; «работает» свёрнуто внизу. */
export const Обычное: S = {}
/** Выбранная строка — роль «выбрано». */
export const Выбрана: S = { args: { selectedKey: 'g2' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Список не загрузился', description: 'Сервер не ответил за 10 секунд.', onRetry: () => {} } } }
export const ПервыйЗапуск: S = {
  tags: ['state:первый запуск'],
  args: { rows: [], empty: { kind: 'первый запуск', title: 'Групп пока нет', description: 'Подключите первую группу VK.', action: <ActionArea primary={{ label: 'Подключить группу' }} label="Первый шаг" /> } },
}
/** Всё работает: норма не пишется — одна свёрнутая группа. */
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'По фильтрам групп нет', action: <Button>Сбросить фильтры</Button> } } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа', description: 'Попросите владельца клиента открыть группы.' } } }
/** 150 строк: первые 50 и «показать ещё». */
export const Много: S = { tags: ['state:много'], args: { rows: many } }

/** Сортировка по заголовку — выбор человека; пустое всегда внизу. */
export const Сортировка: S = {
  render: () => <DataTable<CabinetRow> label="Кабинеты" rows={cabinets} columns={cabinetColumns} getKey={(r) => r.id} defaultSort={{ key: 'week', direction: 'descending' }} />,
}

/** Сортировка в группах тона: строки переставляются внутри группы, «падает» сверху. */
export const СортировкаВГруппах: S = {
  render: () => <DataTable<CabinetRow> label="Кабинеты" rows={cabinets} columns={cabinetColumns} getKey={(r) => r.id} getStatus={(r) => r.status} defaultSort={{ key: 'left', direction: 'ascending' }} />,
}

/** Приглушённые строки: неактивное вторым цветом текста, причина — словом. */
export const ПриглушённыеСтроки: S = {
  render: () => (
    <DataTable<CabinetRow> label="Кабинеты" rows={cabinets} columns={[...cabinetColumns, { key: 'idle', header: 'Открутка', cell: (r) => r.idle ?? 'крутится' }]} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} onSelect={() => {}} />
  ),
}

/** Подсказка у заголовка: пунктир, Tooltip ДС; у сортируемой — у той же кнопки. */
export const ПодсказкаУЗаголовка: S = {
  render: () => (
    <DataTable<CabinetRow>
      label="Кабинеты"
      rows={cabinets}
      getKey={(r) => r.id}
      columns={[cabinetColumns[0]!, { ...cabinetColumns[1]!, sortValue: undefined, hint: 'Кто ведёт кабинет' }, { ...cabinetColumns[2]!, hint: 'Открутка за 7 дней до вчера, без НДС' }, cabinetColumns[3]!]}
    />
  ),
}

interface MonthRow {
  id: string
  name: string
  months: Array<number | null>
}
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const monthRows: MonthRow[] = cabinets.map((c, i) => ({ id: c.id, name: c.name, months: MONTHS.map((_, m) => (m > 8 && i % 3 === 0 ? null : Math.round((c.week * (m + 3)) / 4 / 10) * 10 + i * 1000)) }))
const monthColumns: Column<MonthRow>[] = [
  { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, grow: 2, sortValue: (r) => r.name },
  ...MONTHS.map((m, i): Column<MonthRow> => ({ key: `m${i}`, header: m, cell: (r) => rub(r.months[i] ?? null), align: 'end', nowrap: true, face: i >= 9, sortValue: (r) => r.months[i], sortFirst: 'descending' })),
]

/** Широкая (13 колонок денег, Статистика): деньги в одну строку, прокрутка вбок, первая колонка стоит. */
export const Широкая: S = {
  render: () => <DataTable<MonthRow> label="Открутка по месяцам" rows={monthRows} columns={monthColumns} getKey={(r) => r.id} onSelect={() => {}} />,
}
