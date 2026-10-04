/** Данные историй для компонентов DF (переписка, неделя, сетка сверки, графики). Даты зашиты — кадры не плывут. */
import type { ChatMessage } from '../components/ChatThread'
import type { GridCell, GridColumn, GridTone } from '../components/ProofreadGrid'

export const chat: ChatMessage[] = [
  { id: 'm1', direction: 'in', author: 'Анна Петрова', time: '10:02', datetime: '2026-10-03T10:02', day: '3 октября', text: 'Здравствуйте! Вы работаете в воскресенье?' },
  { id: 'm2', direction: 'out', author: 'Кофейня «Зерно»', time: '10:15', datetime: '2026-10-03T10:15', day: '3 октября', text: 'Здравствуйте, Анна! Да, с 9 до 21.' },
  { id: 'm3', direction: 'in', author: 'Анна Петрова', time: '09:40', datetime: '2026-10-04T09:40', day: 'сегодня', text: 'А можно заказать торт к субботе?', attachments: <span className="text-label-01 text-text-secondary">[фото]</span> },
  { id: 'm4', direction: 'out', author: 'Кофейня «Зерно»', time: '09:52', datetime: '2026-10-04T09:52', day: 'сегодня', text: 'Можно! Напишите, какой вкус и на сколько человек.', status: 'sending' },
]

export const chatFailed: ChatMessage[] = [
  ...chat.slice(0, 3),
  { ...chat[3], status: 'error', error: 'ВК не ответил', onRetry: () => {} },
]

export const longChat: ChatMessage[] = Array.from({ length: 40 }, (_, i) => ({
  id: `l${i}`,
  direction: i % 3 === 0 ? 'out' : 'in',
  author: i % 3 === 0 ? undefined : 'Иван',
  time: `${String(9 + Math.floor(i / 6)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
  day: i < 20 ? '2 октября' : '3 октября',
  text: i % 4 === 0 ? 'Подскажите, пожалуйста, есть ли доставка в Заречный район и сколько она стоит при заказе от двух тортов?' : `Сообщение ${i + 1}`,
}))

/** Неделя 5–11 октября 2026 (понедельник — 5-е). */
export const weekStart = new Date(2026, 9, 5)
export const today = new Date(2026, 9, 7)

export interface Post {
  id: string
  at: Date
  text: string
  grade?: string
  postponed?: boolean
  likes?: number
  views?: number
}

const at = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m)
export const posts: Post[] = [
  { id: 'p1', at: at(5, 10), text: 'Осенний раф с тыквой — уже в меню', grade: 'A', likes: 34, views: 1200 },
  { id: 'p2', at: at(5, 18, 30), text: 'Вечер настолок в пятницу: записывайтесь', grade: 'B', likes: 12, views: 640 },
  { id: 'p3', at: at(7, 12), text: 'Новый круассан с миндалём', postponed: true },
  { id: 'p4', at: at(8, 9), text: 'Как мы обжариваем зерно: короткое видео', postponed: true },
  { id: 'p5', at: at(10, 11), text: 'Розыгрыш абонемента на кофе', postponed: true },
]

export const manyPosts: Post[] = Array.from({ length: 22 }, (_, i) => ({
  id: `mp${i}`,
  at: at(5 + (i % 4 === 0 ? 0 : i % 7), 8 + (i % 10), (i * 13) % 60),
  text: `Пост ${i + 1}: подборка новинок недели`,
  grade: ['A+', 'A', 'B', 'C'][i % 4],
  likes: 10 + i,
  views: 300 + i * 20,
}))

/** Октябрь 2026 для сетки сверки: 31 день, выходные — сб и вс. */
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
export const monthColumns: GridColumn[] = Array.from({ length: 31 }, (_, i) => {
  const d = new Date(2026, 9, i + 1)
  const wd = d.getDay()
  return { key: String(i + 1), label: i + 1, sub: WD[wd], muted: wd === 0 || wd === 6, title: `${i + 1} октября, ${WD[wd]}` }
})

export interface Community {
  id: string
  name: string
  norm: number
  /** Сколько вышло по дням (до 4-го — прошлое, дальше — будущее). */
  out: number[]
}

const pattern = (seed: number): number[] => Array.from({ length: 31 }, (_, i) => (i + seed) % 7 === 0 ? 0 : (i + seed) % 5 === 0 ? 1 : 2)
export const communities: Community[] = [
  { id: 'c1', name: 'Кофейня «Зерно» · Самара', norm: 2, out: pattern(1) },
  { id: 'c2', name: 'Пекарня «Колос» · Тольятти', norm: 2, out: pattern(3) },
  { id: 'c3', name: 'Цветы «Флокс» · Сызрань', norm: 1, out: pattern(5).map((n) => Math.min(n, 2)) },
  { id: 'c4', name: 'Фитнес «Атлет» · Самара — очень длинное название сообщества', norm: 2, out: pattern(2) },
]
export const manyCommunities: Community[] = Array.from({ length: 70 }, (_, i) => ({ id: `mc${i}`, name: `Сообщество ${i + 1}`, norm: 2, out: pattern(i) }))

/** Клетка сверки, как в DF: вышло/норма, тон по статусу, будущие дни тихие. */
export function proofCell(c: Community, col: GridColumn): GridCell {
  const day = Number(col.key)
  if (day > 4) return { tone: 'future', value: '' }
  const n = c.out[day - 1]
  const tone: GridTone = n === 0 ? 'error' : n < c.norm ? 'warning' : n > c.norm ? 'neutral' : 'success'
  return { tone, value: `${n}/${c.norm}`, note: c.id === 'c2' && day === 2, hint: `${day} октября: вышло ${n} из ${c.norm}` }
}

/** Ряды для графика историй: охват и посты по дням. */
export const reach = [12, 18, 15, 22, 30, 26, 34, 31, 38, 36, 42, 40, 47, 52]
export const postsPerDay = [2, 3, 2, 4, 3, 3, 5, 4, 4, 3, 5, 6, 5, 6]
