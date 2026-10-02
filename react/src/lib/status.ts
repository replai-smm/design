/**
 * Статусы и тона — только из закрытого списка дизайн-системы (design/statuses.json → dist/tokens.ts).
 * Своего цвета у статуса в компоненте нет: тон продукта (четыре) или цвет Карты (три и «без цвета»).
 */
import { statuses, kartaTones, type StatusId, type Tone, type KartaTone } from '../../../dist/tokens.ts'

export type { StatusId, Tone, KartaTone }
export type Palette = 'product' | 'karta'
export type Status = (typeof statuses)[number]

/** Короткое имя тона — для классов и значков. */
export type ToneKey = 'error' | 'warning' | 'success' | 'neutral'
export const TONE_KEY: Record<Tone, ToneKey> = { опасно: 'error', внимание: 'warning', хорошо: 'success', нейтрально: 'neutral' }

/**
 * Порядок внимания (принципы П2 и П3): срочное сверху, норма — внизу и свёрнута.
 * «Нейтрально» (не проверено, ждёт прогона, выключено) — выше «хорошо»: его хоть иногда нужно трогать.
 */
export const TONE_ORDER: readonly Tone[] = ['опасно', 'внимание', 'нейтрально', 'хорошо']

export const STATUS_IDS = statuses.map((s) => s.id) as readonly StatusId[]

export function statusOf(id: StatusId): Status {
  const s = statuses.find((x) => x.id === id)
  if (!s) throw new Error(`статуса «${String(id)}» нет в закрытом списке (design/statuses.json)`)
  return s
}

export const toneOf = (id: StatusId): Tone => statusOf(id).tone as Tone

/** Цвет Карты: info (без изменений), warning (хотят изменить), error (падает) или null — без цвета. */
export type KartaKey = 'info' | 'warning' | 'error'
const KARTA_KEY: Record<string, KartaKey> = { 'support-info': 'info', 'status-warning': 'warning', 'status-error': 'error' }
export function kartaKeyOf(id: StatusId): KartaKey | null {
  const k = statusOf(id).karta as KartaTone | null
  return k ? KARTA_KEY[kartaTones[k]] : null
}

/** Ранг для сортировки «срочное сверху»: меньше — выше. */
export const rankOf = (id: StatusId) => TONE_ORDER.indexOf(toneOf(id)) * 100 + STATUS_IDS.indexOf(id)
