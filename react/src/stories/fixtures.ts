/** Данные историй и тестов: проекты, счета, переписка, ряды графиков, код — нейтральные примеры. Даты зашиты — кадры не плывут. */
import { createElement } from 'react'
import type { ChatMessage } from '../components/ChatThread'
import type { IconIndicatorKind } from '../lib/vocab'

/** Слово состояния строки — у индикатора рядом со знаком. */
export const STATUS_WORD: Partial<Record<IconIndicatorKind, string>> = { failed: 'падает', 'caution-minor': 'меняется', succeeded: 'работает', 'not-started': 'не проверено', pending: 'ждёт прогона' }

export interface ProjectRow {
  id: string
  name: string
  team: string
  status: IconIndicatorKind
  reason: string
  checked: string
}

const base: ProjectRow[] = [
  { id: 'p1', name: 'Интернет-магазин', team: 'Продажи', status: 'failed', reason: 'Ключ доступа отозван', checked: '5 мин назад' },
  { id: 'p2', name: 'Портал поддержки', team: 'Поддержка', status: 'caution-minor', reason: 'Меняем шаблоны писем', checked: '12 мин назад' },
  { id: 'p3', name: 'Склад', team: 'Логистика', status: 'succeeded', reason: '—', checked: '1 мин назад' },
  { id: 'p4', name: 'Мобильное приложение', team: 'Продукт', status: 'not-started', reason: 'Ещё не проверяли', checked: '—' },
  { id: 'p5', name: 'Бухгалтерия', team: 'Финансы', status: 'succeeded', reason: '—', checked: '3 мин назад' },
  { id: 'p6', name: 'Рассылка новостей', team: 'Маркетинг', status: 'failed', reason: 'Письма не приходят', checked: '8 мин назад' },
  { id: 'p7', name: 'Онбординг сотрудников', team: 'Кадры', status: 'pending', reason: 'Ждёт прогона тестов', checked: '—' },
  { id: 'p8', name: 'Отчёты', team: 'Аналитика', status: 'succeeded', reason: '—', checked: '2 мин назад' },
]

export const projects = base

/** «Много»: 150 строк (П12) — первые 50 видны, остальное за «показать ещё». */
export const many: ProjectRow[] = Array.from({ length: 150 }, (_, i) => {
  const b = base[i % base.length]
  return { ...b, id: `m${i}`, name: `${b.name} · ${i + 1}` }
})

export const allWorking: ProjectRow[] = base.map((p) => ({ ...p, status: 'succeeded' as IconIndicatorKind, reason: '—' }))

/** Счета оплаты: таблица с сортировкой по заголовку, деньгами и приглушёнными строками. */
export interface AccountRow {
  id: string
  name: string
  manager: string
  status: IconIndicatorKind
  week: number
  left: number | null
  /** Не списывается — слово причины (приглушённая строка). */
  idle?: string
}

export const accounts: AccountRow[] = [
  { id: 'a1', name: 'Основной счёт', manager: 'Анна', status: 'failed', week: 18400, left: 2100 },
  { id: 'a2', name: 'Счёт поддержки', manager: 'Борис', status: 'succeeded', week: 9200, left: 15400 },
  { id: 'a3', name: 'Счёт склада', manager: 'Анна', status: 'succeeded', week: 31000, left: null, idle: 'не подключался' },
  { id: 'a4', name: 'Счёт маркетинга', manager: 'Вера', status: 'failed', week: 4600, left: 300 },
  { id: 'a5', name: 'Резервный счёт', manager: 'Борис', status: 'not-started', week: 12750, left: 8800, idle: 'не списывается 12 дней' },
  { id: 'a6', name: 'Счёт продаж', manager: 'Вера', status: 'succeeded', week: 21300, left: 6400 },
]

export const chat: ChatMessage[] = [
  { id: 'm1', direction: 'in', author: 'Анна Петрова', time: '10:02', datetime: '2026-10-03T10:02', day: '3 октября', text: 'Здравствуйте! Мой заказ уже отправили?' },
  { id: 'm2', direction: 'out', author: 'Поддержка', time: '10:15', datetime: '2026-10-03T10:15', day: '3 октября', text: 'Здравствуйте, Анна! Да, приедет в понедельник.' },
  { id: 'm3', direction: 'in', author: 'Анна Петрова', time: '09:40', datetime: '2026-10-04T09:40', day: 'сегодня', text: 'А можно поменять адрес доставки?', attachments: createElement('span', { className: 'text-caption text-fg-muted' }, 'файл: адрес.pdf') },
  { id: 'm4', direction: 'out', author: 'Поддержка', time: '09:52', datetime: '2026-10-04T09:52', day: 'сегодня', text: 'Можно! Напишите новый адрес и удобное время.', status: 'running' },
]

export const chatFailed: ChatMessage[] = [
  ...chat.slice(0, 3),
  { ...chat[3], status: 'error', error: 'Сервер не ответил', onRetry: () => {} },
]

export const longChat: ChatMessage[] = Array.from({ length: 40 }, (_, i) => ({
  id: `l${i}`,
  direction: i % 3 === 0 ? 'out' : 'in',
  author: i % 3 === 0 ? undefined : 'Иван',
  time: `${String(9 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
  day: i < 20 ? '2 октября' : '3 октября',
  text: i % 4 === 0 ? 'Подскажите, пожалуйста, есть ли доставка в Заречный район и сколько она стоит при заказе от двух товаров?' : `Сообщение ${i + 1}`,
}))

/** Ряды для графика историй: посещения и заказы по дням. */
export const visits = [12, 18, 15, 22, 30, 26, 34, 31, 38, 36, 42, 40, 47, 52]
export const ordersPerDay = [2, 3, 2, 4, 3, 3, 5, 4, 4, 3, 5, 6, 5, 6]

export const csvCode = `export function toCsv(rows: Order[]): string {
  const head = ['id', 'автор', 'сумма', 'дата']
  const lines = rows.map((r) => [r.id, r.author, r.total, r.date.toISOString()])
  return [head, ...lines].map((l) => l.join(';')).join('\\n')
}`

/** 200 строк кода и одна строка в 300 знаков: предел высоты `maxLines` и прокрутка вбок. */
export const longCode = [
  ...Array.from({ length: 199 }, (_, i) => `export const row${i + 1} = ${i + 1}`),
  `export const wide = '${'0123456789'.repeat(29)}'`,
].join('\n')
