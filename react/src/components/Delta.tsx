/**
 * Разница двух чисел: стрелка знака тона («хорошо» — рост к лучшему, «опасно» — к худшему), число — цветом текста,
 * слово — для читалки («больше на 12,5%»). Проценты (сравнение периодов) или рубли (остаток бюджета: факт −
 * план). `tone={false}` — без тона: в широкой таблице тон отвлекает от чисел. Ноль — без стрелки, «без изменений».
 */
import { cx } from '../lib/cx'
import { TONE } from '../lib/vocab'
import { Icon } from './Icon'

const PCT = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
const RUB = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export type DeltaUnit = '%' | '₽'

/** Модуль разницы словами с единицей: «12,5%», «1 234 ₽». */
export function deltaText(value: number, unit: DeltaUnit = '%'): string {
  return unit === '₽' ? `${RUB.format(Math.abs(Math.round(value)))} ₽` : `${PCT.format(Math.abs(value))}%`
}

export interface DeltaProps {
  /** Разница со знаком: рост — больше нуля. */
  value: number
  /** Рост — хорошо (по умолчанию) или плохо (расход, перерасход). */
  higherIsBetter?: boolean
  unit?: DeltaUnit
  /** Стрелка тоном (по умолчанию); `false` — без тона. */
  tone?: boolean
}

export function Delta({ value, higherIsBetter = true, unit = '%', tone = true }: DeltaProps) {
  const zero = unit === '₽' ? Math.round(value) === 0 : value === 0
  const up = value > 0
  const good = up === higherIsBetter
  return (
    <span data-slot="delta" data-direction={zero ? 'none' : up ? 'up' : 'down'} className="inline-flex items-center gap-tight text-caption whitespace-nowrap text-fg-muted">
      {zero ? (
        <span className="sr-only">без изменений,</span>
      ) : (
        <>
          <Icon name={up ? 'caret-up' : 'caret-down'} className={cx(tone && (good ? TONE['хорошо'].mark : TONE['опасно'].mark))} />
          <span className="sr-only">{up ? 'больше на' : 'меньше на'}</span>
        </>
      )}
      {deltaText(value, unit)}
    </span>
  )
}
