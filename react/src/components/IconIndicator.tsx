/**
 * Индикатор состояния (Carbon: IconIndicator) — знак своей формы и слово: «падает», «готово», «идёт», «ждёт». Форма
 * знака у каждого `kind` своя — цвет никогда не один. Цвет знака — роль тона: failed — «опасно», caution-major и
 * caution-minor — «внимание» (оранжевого в ролях нет, их различает форма), undefined — «решение», succeeded — «хорошо»,
 * normal · in-progress · incomplete · informative — цвет текста (синий у нас — только ссылка и фокус), not-started ·
 * pending · unknown — тихий. Слово цвета текста — без подложки; слово с подложкой — `Tag`.
 */
import { cx, rule } from '../lib/cx'
import { ICON_INDICATOR, ICON_INDICATOR_KINDS, type IconIndicatorKind } from '../lib/vocab'
import { Icon } from './Icon'

export interface IconIndicatorProps {
  kind: IconIndicatorKind
  /** Слово рядом со знаком — обязательно. */
  label: string
  className?: string
}

export function IconIndicator({ kind, label, className }: IconIndicatorProps) {
  rule(ICON_INDICATOR_KINDS.includes(kind), `вида «${String(kind)}» нет: ${ICON_INDICATOR_KINDS.join(' · ')}`)
  rule(Boolean(label), 'у индикатора нет слова (label): цвет никогда не один')
  const look = ICON_INDICATOR[kind]
  return (
    <div data-slot="icon-indicator" data-kind={kind} className={cx('inline-flex min-w-0 items-center gap-items text-body text-fg-muted', className)}>
      <Icon name={look.icon} className={look.mark} />
      <span className="min-w-0">{label}</span>
    </div>
  )
}
