import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, cabinets, groups, many, type CabinetRow, type GroupRow } from '../stories/fixtures'
import { ActionArea, Button } from './Button'
import { DataTable, type Column } from './Collection'

const rub = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)
const cabinetColumns: Column<CabinetRow>[] = [
  { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, grow: 2, sortValue: (r) => r.name },
  { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist, sortValue: (r) => r.targetologist },
  { key: 'week', header: '7 дней', cell: (r) => rub(r.week), face: true, align: 'end', sortValue: (r) => r.week, sortFirst: 'descending' },
  { key: 'left', header: 'Остаток', cell: (r) => rub(r.left), align: 'end', sortValue: (r) => r.left, sortFirst: 'descending' },
]

const columns: Column<GroupRow>[] = [
  { key: 'name', header: 'Группа', cell: (r) => r.name, face: true, grow: 2 },
  { key: 'reason', header: 'Что случилось', cell: (r) => r.reason, face: true, grow: 2 },
  { key: 'client', header: 'Клиент', cell: (r) => r.client },
  { key: 'checked', header: 'Проверено', cell: (r) => r.checked, align: 'end' },
]

const meta = {
  title: 'Компоненты/Таблица',
  component: DataTable<GroupRow>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Группы клиентов',
    rows: groups,
    columns,
    getKey: (r: GroupRow) => r.id,
    getStatus: (r: GroupRow) => r.status,
    onRowClick: () => {},
    rowAction: (r: GroupRow) => (r.status === 'work.failing' ? <Button variant="ghost" size="sm">Починить</Button> : null),
  },
} satisfies Meta<typeof DataTable<GroupRow>>
export default meta
type S = StoryObj<typeof meta>

/** Срочное сверху: «падает» → «хотят изменить» → без цвета; «работает» свёрнуто внизу. */
export const Обычное: S = {}

export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }

export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { state: 'error', error: { title: 'Список не загрузился', description: 'Сервер не ответил за 10 секунд.', onRetry: () => {} } },
}

export const ПервыйЗапуск: S = {
  tags: ['state:первый запуск'],
  args: {
    rows: [],
    empty: {
      kind: 'первый запуск',
      title: 'Групп пока нет',
      description: 'Подключите первую группу VK.',
      action: <ActionArea primary={{ label: 'Подключить группу' }} label="Первый шаг" />,
    },
  },
}

/** Всё работает: норма не пишется — одна свёрнутая группа. */
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }

export const НичегоНеНайдено: S = {
  tags: ['state:ничего не найдено'],
  args: { rows: [], empty: { kind: 'ничего не найдено', title: 'Ничего не найдено', description: 'По этим фильтрам групп нет.', action: <Button variant="tertiary">Сбросить фильтры</Button> } },
}

export const НетДоступа: S = {
  tags: ['state:нет доступа'],
  args: { rows: [], empty: { kind: 'нет доступа', title: 'Нет доступа', description: 'Попросите владельца клиента открыть группы.' } },
}

/** 150 строк: первые 50, остальное за «показать ещё». */
export const Много: S = { tags: ['state:много'], args: { rows: many } }

/**
 * Сортировка по заголовку — выбор человека: первое нажатие — в сторону колонки (`sortFirst`: суммы — от больших),
 * повторное — в обратную; пустое («—») всегда внизу. Без групп тона сортируется вся таблица.
 */
export const Сортировка: S = {
  render: () => <DataTable<CabinetRow> label="Кабинеты" rows={cabinets} columns={cabinetColumns} getKey={(r) => r.id} defaultSort={{ key: 'week', direction: 'descending' }} />,
}

/** С группами тона сортировка переставляет строки внутри группы: «падает» остаётся сверху (П2), «работает» — свёрнуто внизу. */
export const СортировкаВГруппах: S = {
  render: () => (
    <DataTable<CabinetRow> label="Кабинеты" rows={cabinets} columns={cabinetColumns} getKey={(r) => r.id} getStatus={(r) => r.status} defaultSort={{ key: 'left', direction: 'ascending' }} />
  ),
}

/**
 * Приглушённые строки (`rowMuted`): неактивные кабинеты — текст вторым цветом, читается (≥ 4,5:1), порядок тот же.
 * Причина — словом в колонке «Открутка», цвет её не заменяет; спрятать такие строки — фильтр продукта («Скрыть серые»).
 */
export const ПриглушённыеСтроки: S = {
  render: () => (
    <DataTable<CabinetRow>
      label="Кабинеты"
      rows={cabinets}
      columns={[...cabinetColumns, { key: 'idle', header: 'Открутка', cell: (r) => r.idle ?? 'крутится' }]}
      getKey={(r) => r.id}
      rowMuted={(r) => Boolean(r.idle)}
      onRowClick={() => {}}
    />
  ),
}

/**
 * Подсказка у заголовка (`Column.hint`): заголовок подчёркнут пунктиром, наведение или Tab — подсказка ДС (`Tooltip`),
 * читалка слышит её как описание. У сортируемой колонки («7 дней») подсказка — у той же кнопки сортировки.
 */
export const ПодсказкаУЗаголовка: S = {
  render: () => (
    <DataTable<CabinetRow>
      label="Кабинеты"
      rows={cabinets}
      getKey={(r) => r.id}
      columns={[
        cabinetColumns[0]!,
        { ...cabinetColumns[1]!, sortValue: undefined, hint: 'Кто ведёт кабинет; поменять — в строке «Бюджетов»' },
        { ...cabinetColumns[2]!, hint: 'Открутка за 7 дней до вчера, без НДС' },
        cabinetColumns[3]!,
      ]}
    />
  ),
}
