/** Данные историй: группы VK у клиента — как в Replai («Все группы»), без настоящих имён и номеров. */
import type { StatusId } from '../lib/status'

export interface GroupRow {
  id: string
  name: string
  client: string
  status: StatusId
  reason: string
  checked: string
}

const base: GroupRow[] = [
  { id: 'g1', name: 'Кофейня «Зерно»', client: 'Зерно', status: 'work.failing', reason: 'Ключ доступа отозван', checked: '5 мин назад' },
  { id: 'g2', name: 'Студия йоги', client: 'Асана', status: 'change.changing', reason: 'Меняем ответы на отзывы', checked: '12 мин назад' },
  { id: 'g3', name: 'Пекарня у дома', client: 'Хлеб', status: 'work.working', reason: '—', checked: '1 мин назад' },
  { id: 'g4', name: 'Автосервис «Ключ»', client: 'Ключ', status: 'work.unchecked', reason: 'Ещё не проверяли', checked: '—' },
  { id: 'g5', name: 'Цветы на Ленина', client: 'Флора', status: 'work.working', reason: '—', checked: '3 мин назад' },
  { id: 'g6', name: 'Детский клуб', client: 'Радуга', status: 'work.failing', reason: 'Сообщения не приходят', checked: '8 мин назад' },
  { id: 'g7', name: 'Барбершоп', client: 'Бритва', status: 'work.awaiting-run', reason: 'Ждёт прогона тестов', checked: '—' },
  { id: 'g8', name: 'Книжная лавка', client: 'Том', status: 'work.working', reason: '—', checked: '2 мин назад' },
]

export const groups = base

/** «Много»: 150 строк (П12) — первые 50 видны, остальное за «показать ещё». */
export const many: GroupRow[] = Array.from({ length: 150 }, (_, i) => {
  const b = base[i % base.length]
  return { ...b, id: `m${i}`, name: `${b.name} · ${i + 1}` }
})

export const allWorking: GroupRow[] = base.map((g) => ({ ...g, status: 'work.working' as StatusId, reason: '—' }))

/** Кабинеты рекламы — как таблица «Таргет» Статистики (сортировка по заголовку), без настоящих имён и сумм. */
export interface CabinetRow {
  id: string
  name: string
  targetologist: string
  status: StatusId
  week: number
  left: number | null
  /** Не крутится — слово причины (приглушённая строка «Таргета»). */
  idle?: string
}

export const cabinets: CabinetRow[] = [
  { id: 'c1', name: 'Кофейня «Зерно»', targetologist: 'Анна', status: 'work.failing', week: 18400, left: 2100 },
  { id: 'c2', name: 'Студия йоги', targetologist: 'Борис', status: 'work.working', week: 9200, left: 15400 },
  { id: 'c3', name: 'Автосервис «Ключ»', targetologist: 'Анна', status: 'work.working', week: 31000, left: null, idle: 'не запускался' },
  { id: 'c4', name: 'Детский клуб', targetologist: 'Вера', status: 'work.failing', week: 4600, left: 300 },
  { id: 'c5', name: 'Барбершоп', targetologist: 'Борис', status: 'work.unchecked', week: 12750, left: 8800, idle: 'не крутится 12 дней' },
  { id: 'c6', name: 'Цветы на Ленина', targetologist: 'Вера', status: 'work.working', week: 21300, left: 6400 },
]
