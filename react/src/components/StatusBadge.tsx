/**
 * Метка статуса: статус из закрытого списка (statuses.json) или тон со своим словом (светофор, оценка, «не запускался»).
 * Облик — словарь тонов: знак своей формы и слово, цвет никогда не один. Подложка-таблетка — только у того, что
 * просит внимания («опасно», «внимание»); «хорошо», «инфо», «нейтрально» — знак и слово без подложки (норма не кричит).
 */
import { cx, rule } from '../lib/cx'
import { statusOf, TONE, TONES, toneOf, type StatusId, type Tone } from '../lib/vocab'
import { Icon } from './Icon'

interface ByStatus {
  /** id из закрытого списка: work.working, work.failing, … change.adding. */
  status: StatusId
  tone?: never
  /** Слово продукта вместо слова закона; тон — тон статуса. */
  label?: string
  className?: string
}
interface ByTone {
  status?: never
  /** Тон словаря — для слова не из закрытого списка. */
  tone: Tone
  /** Слово — обязательно: цвет никогда не один. */
  label: string
  className?: string
}
export type StatusBadgeProps = ByStatus | ByTone

export function StatusBadge(props: StatusBadgeProps) {
  const byTone = props.tone !== undefined
  if (byTone) {
    rule(TONES.includes(props.tone), `тона «${String(props.tone)}» нет: тоны — ${TONES.join(' · ')}`)
    rule(Boolean(props.label), 'у метки тона нет слова (label): цвет никогда не один')
  }
  const tone = byTone ? props.tone : toneOf(props.status)
  const word = props.label ?? (byTone ? '' : statusOf(props.status).say)
  const look = TONE[tone]
  return (
    <span
      data-slot="status-badge"
      data-status={byTone ? undefined : props.status}
      data-tone={look.key}
      className={cx('inline-flex items-center gap-tight py-tight text-caption whitespace-nowrap', look.bg ? cx('rounded-full px-items', look.bg, look.text) : 'text-fg', props.className)}
    >
      {/* на подложке знак — цвета текста тона: пара «текст на подложке» проверена контрастом */}
      {look.bg ? <Icon name={look.icon} /> : <Icon tone={tone} />}
      {word}
    </span>
  )
}
