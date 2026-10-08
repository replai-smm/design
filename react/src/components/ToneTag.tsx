/**
 * Метка тона со своим словом (Статистика: светофор кабинетов, «не запускался», статус версии отчёта; DF — оценка поста).
 * Тон — один из четырёх тонов продукта (опасно · внимание · хорошо · нейтрально), цвет — токены `status-*`,
 * форма значка — своя у каждого тона (крест, треугольник, галочка, пустой круг), слово — продукта.
 * `StatusBadge` — для закрытого списка статусов Карты; здесь слово своё, а тонов по-прежнему четыре: своего цвета нет.
 */
import type { ReactNode } from 'react'
import { cx, rule } from '../lib/cx'
import { TONE_KEY, TONE_ORDER, type Tone } from '../lib/status'
import { PILL, ToneIcon } from './StatusBadge'

export interface ToneTagProps {
  /** Тон продукта: опасно · внимание · хорошо · нейтрально. */
  tone: Tone
  /** Слово продукта: «встало», «не запускался», «A». Цвет никогда не один — слово обязательно. */
  children: ReactNode
  className?: string
}

export function ToneTag({ tone, children, className }: ToneTagProps) {
  rule(TONE_ORDER.includes(tone), `тона «${String(tone)}» нет: тонов продукта четыре — ${TONE_ORDER.join(' · ')}`)
  rule(children != null && children !== '', 'у метки тона нет слова: цвет никогда не один, слово обязательно')
  const key = TONE_KEY[tone]
  return (
    <span data-slot="tone-tag" data-tone={key} className={cx('inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-label-01 whitespace-nowrap', PILL[key], className)}>
      <ToneIcon tone={key} />
      {children}
    </span>
  )
}
