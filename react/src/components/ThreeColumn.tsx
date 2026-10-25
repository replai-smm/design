/**
 * Три колонки «список → лента → карточка» (почта, сообщения, заказы). С 1024 px видны все, каждая
 * прокручивается сама; уже — по одной (`active`), во второй и третьей сверху «← назад» к предыдущей, переход — выезд
 * 0,6 с, фокус — на колонку. Без `third` — две колонки «список → карточка». `header` — полоса над колонками.
 * `phone="sheets"` — рабочее место: на телефоне видна лента, первая колонка — шторкой слева, третья — снизу
 * (`sheet`, `onSheetChange`); шторка — то же окно ДС (`Modal` без кнопок; слева — его внутренняя шторка `LeftSheet`).
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Icon } from './Icon'
import { LeftSheet, Modal } from './Modal'

export type ColumnIndex = 0 | 1 | 2

export interface ThreeColumnProps {
  first: ReactNode
  second: ReactNode
  /** Нет — раскладка в две колонки. */
  third?: ReactNode
  /** Названия колонок — подписи областей и слова «← назад». */
  labels: [string, string, string] | [string, string]
  /** Какая колонка видна на телефоне. */
  active: ColumnIndex
  /** «← назад» на телефоне: к колонке `to`. */
  onBack: (to: ColumnIndex) => void
  /** Ширина первой колонки на ноутбуке. */
  firstWidth?: 'sm' | 'md'
  /** Ширина третьей колонки на ноутбуке; вторая — остальное. */
  thirdWidth?: 'lg' | 'xl'
  /** Полоса над колонками во всю ширину. */
  header?: ReactNode
  /** Телефон: stack — по одной с «← назад»; sheets — лента, первая и третья — шторками. */
  phone?: 'stack' | 'sheets'
  /** sheets: какая шторка открыта (0 — слева, 2 — снизу). */
  sheet?: 0 | 2 | null
  onSheetChange?: (sheet: 0 | 2 | null) => void
  className?: string
}

const FIRST = { sm: 'lg:w-rail', md: 'lg:w-narrow' } as const
const THIRD = { lg: 'lg:w-panel', xl: 'lg:w-wide' } as const
const PHONE = '(max-width: 63.99rem)'

function usePhone(): boolean {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(PHONE).matches))
  useEffect(() => {
    const mq = window.matchMedia?.(PHONE)
    if (!mq) return
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

export function ThreeColumn({ first, second, third, labels, active, onBack, firstWidth = 'sm', thirdWidth = 'lg', header, phone: phoneMode = 'stack', sheet = null, onSheetChange, className }: ThreeColumnProps) {
  const phone = usePhone()
  const sheets = phoneMode === 'sheets' && phone
  const two = third === undefined
  const cols = two ? [first, second] : [first, second, third]
  const refs = useRef<Array<HTMLElement | null>>([])
  const was = useRef(active)
  const [dir, setDir] = useState<'forward' | 'back' | undefined>(undefined)

  useLayoutEffect(() => {
    if (was.current === active) return
    setDir(active > was.current ? 'forward' : 'back')
    was.current = active
    if (typeof window !== 'undefined' && window.matchMedia?.(PHONE).matches) refs.current[active]?.focus({ preventScroll: true })
  }, [active])

  return (
    <div data-slot="three-column" data-columns={cols.length} data-active={active} data-phone={phoneMode} className={cx('flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-canvas', className)}>
      {header && (
        <div data-part="header" className="shrink-0 border-b border-line bg-surface">
          {header}
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1">
        {cols.map((content, i) => {
          if (sheets && i !== 1) {
            const Sheet = i === 0 ? LeftSheet : Modal
            return (
              <Sheet key={i} passiveModal modalHeading={labels[i]} open={sheet === i} onRequestClose={() => onSheetChange?.(null)}>
                {content}
              </Sheet>
            )
          }
          const on = sheets || i === active
          return (
            <section
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              tabIndex={-1}
              aria-label={labels[i]}
              data-column={i}
              data-active={on}
              data-dir={on ? dir : undefined}
              className={cx(
                'ds-col relative min-h-0 min-w-0 flex-col overflow-y-auto bg-surface',
                FOCUS,
                on ? 'flex w-full' : 'hidden',
                'lg:flex',
                i === 0 && cx('lg:shrink-0', FIRST[firstWidth]),
                i === 1 && cx('lg:w-auto lg:flex-1 lg:border-line', two ? 'lg:border-l' : 'lg:border-x'),
                i === 2 && cx('lg:shrink-0', THIRD[thirdWidth]),
              )}
            >
              {i > 0 && phoneMode === 'stack' && (
                <div className="border-b border-line px-items py-tight lg:hidden">
                  <Button kind="ghost" size="sm" onClick={() => onBack((i - 1) as ColumnIndex)} data-part="column-back">
                    <Icon name="arrow-left" />
                    {labels[i - 1]}
                  </Button>
                </div>
              )}
              {content}
            </section>
          )
        })}
      </div>
    </div>
  )
}
