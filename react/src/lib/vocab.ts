/**
 * Словари ДС — одни на все компоненты. Тон, ход работы и состояние матрицы пишутся только этими словами:
 * своего перечисления «тона» или «хода» в компоненте нет (держит тест словарей).
 */
import type { ReactNode } from 'react'
import { statuses, tones, type StatusId, type Tone } from '../../../dist/tokens.ts'
import type { IconName } from './icons.gen'

export type { StatusId, Tone }

/** Тон: опасно · решение · внимание · инфо · нейтрально · хорошо (tokens.json → tones). */
export const TONES = Object.keys(tones) as Tone[]

/** Порядок внимания: срочное сверху, норма — внизу (П2, П3); «решение» — сразу за бедой: ждёт человека. */
export const TONE_ORDER: readonly Tone[] = ['опасно', 'решение', 'внимание', 'инфо', 'нейтрально', 'хорошо']

/** Облик тона: классы ролей знака, текста и подложки (у спокойных тонов подложки нет) и форма значка. Классы — словами
 * целиком (Tailwind видит только целые имена); что они те же, что в tokens.json → tones, сверяет тест словарей. */
export interface ToneLook {
  key: (typeof tones)[Tone]['key']
  mark: string
  text: string
  bg: string | null
  icon: IconName
}
export const TONE: Record<Tone, ToneLook> = {
  опасно: { key: 'danger', mark: 'text-danger', text: 'text-danger-fg', bg: 'bg-danger-bg', icon: 'tone-danger' },
  решение: { key: 'decision', mark: 'text-decision', text: 'text-decision-fg', bg: 'bg-decision-bg', icon: 'tone-decision' },
  внимание: { key: 'warning', mark: 'text-warning', text: 'text-warning-fg', bg: 'bg-warning-bg', icon: 'tone-warning' },
  инфо: { key: 'info', mark: 'text-fg', text: 'text-fg', bg: null, icon: 'tone-info' },
  нейтрально: { key: 'neutral', mark: 'text-fg-muted', text: 'text-fg', bg: null, icon: 'tone-neutral' },
  хорошо: { key: 'success', mark: 'text-success', text: 'text-fg', bg: null, icon: 'tone-success' },
}

/** Ход работы: впереди · идёт · готово · ошибка — у шагов, хода в строке и отправки сообщения одни слова. */
export type Progress = 'idle' | 'running' | 'done' | 'error'
export const PROGRESS_WORD: Record<Progress, string> = { idle: 'впереди', running: 'идёт', done: 'готово', error: 'ошибка' }

/** Что показать вместо данных — слова матрицы облика (matrix.yaml → states). */
export type StateKind = 'первый запуск' | 'всё сделано' | 'ничего не найдено' | 'нет доступа' | 'ошибка'
/** Знак состояния — тон словаря. */
export const STATE_TONE: Record<StateKind, Tone> = {
  'первый запуск': 'инфо',
  'всё сделано': 'хорошо',
  'ничего не найдено': 'нейтрально',
  'нет доступа': 'внимание',
  ошибка: 'опасно',
}

/** Данные: готовы, грузятся, не загрузились — одно слово `state` у всего, что показывает данные. */
export type DataState = 'ready' | 'loading' | 'error'

/** Пусто и ошибка — одни имена `empty` и `error` у всего, что показывает данные. */
export interface EmptyView {
  kind: Exclude<StateKind, 'ошибка'>
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}
export interface ErrorView {
  title: ReactNode
  description?: ReactNode
  onRetry?: () => void
}

/* ——— статусы: закрытый список ——— */

export type Status = (typeof statuses)[number]
export const STATUS_IDS = statuses.map((s) => s.id) as readonly StatusId[]

export function statusOf(id: StatusId): Status {
  const s = statuses.find((x) => x.id === id)
  if (!s) throw new Error(`статуса «${String(id)}» нет в закрытом списке (statuses.json)`)
  return s
}

export const toneOf = (id: StatusId): Tone => statusOf(id).tone as Tone

/** Ранг для «срочное сверху»: меньше — выше. */
export const rankOf = (id: StatusId) => TONE_ORDER.indexOf(toneOf(id)) * 100 + STATUS_IDS.indexOf(id)
