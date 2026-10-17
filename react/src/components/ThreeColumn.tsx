/**
 * Три колонки «список → лента → карточка» (DF: «Контент», «Сообщения», «Комментарии», «ИИ», «Чаты»; DF-PORT решение 1:
 * на ноутбуке три колонки остаются). С 1024 px видны все три, каждая прокручивается сама. Уже 1024 px — по очереди:
 * видна одна колонка (`active`), во второй и третьей сверху «← назад» к предыдущей.
 * - Переход на телефоне — выезд 0,6 с (ds.css → .ds-col), вперёд справа, назад слева; «уменьшить движение» — сразу.
 * - Фокус после перехода на телефоне — на колонку, читалка слышит её название.
 * - Колонки — области с подписью (`labels`); главная кнопка — у содержимого колонки, раскладка своих кнопок не держит.
 * - Две колонки «список → карточка» (DF «Постинг → Черновики», «Мои сообщества»): без `third` и с двумя подписями —
 *   вторая занимает остальное, на телефоне так же по одной.
 * - `header` — полоса над колонками во всю ширину (шапка приложения: пульс, лимиты, модель).
 * - `phone="sheets"` — раскладка рабочего места (чат агента): на телефоне видна только вторая колонка, первая
 *   выезжает слева (☰ в шапке), третья — снизу (`sheet`, `onSheetChange`); «← назад» нет — панель закрывается «×»,
 *   Esc или нажатием мимо. На ноутбуке — те же три колонки.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { cx } from '../lib/cx'
import { Button } from './Button'

export type ColumnIndex = 0 | 1 | 2

export interface ThreeColumnProps {
  /** Первая колонка: сообщества, проекты, фильтры. */
  first: ReactNode
  /** Вторая: посты, диалоги, чаты. */
  second: ReactNode
  /** Третья: карточка, переписка. Пусто — подсказка «Выберите …» от продукта. Нет — раскладка в две колонки. */
  third?: ReactNode
  /** Названия колонок — подписи областей и слова «← назад»: ['Сообщества', 'Посты', 'Пост'] (две — ['Черновики', 'Пост']). */
  labels: [string, string, string] | [string, string]
  /** Какая колонка видна на телефоне. На ноутбуке видны все. */
  active: ColumnIndex
  /** «← назад» на телефоне: перейти к колонке `to`. */
  onBack: (to: ColumnIndex) => void
  /** Ширина первой колонки на ноутбуке. */
  firstWidth?: 'sm' | 'md'
  /** Ширина третьей колонки на ноутбуке. Вторая занимает остальное. */
  thirdWidth?: 'md' | 'lg' | 'xl'
  /** Полоса над колонками во всю ширину. */
  header?: ReactNode
  /** Телефон: stack — по одной с «← назад»; sheets — вторая колонка, первая и третья — выезжающими панелями. */
  phone?: 'stack' | 'sheets'
  /** sheets: какая панель открыта на телефоне (0 — слева, 2 — снизу). */
  sheet?: 0 | 2 | null
  onSheetChange?: (sheet: 0 | 2 | null) => void
  className?: string
}

const FIRST = { sm: 'lg:w-64', md: 'lg:w-80' } as const
const THIRD = { md: 'lg:w-md', lg: 'lg:w-lg', xl: 'lg:w-xl' } as const
const PHONE = '(max-width: 63.99rem)'

/** Узкое окно (< 1024 px): колонки по одной. */
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

function Sheet({ side, label, open, onClose, children }: { side: 'left' | 'bottom'; label: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="ds-overlay fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // фокус — на саму панель, не на «×»: читалка слышит название, клавиатура начинает сверху
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
          tabIndex={-1}
          data-slot="column-sheet"
          data-side={side}
          className={cx(
            'ds-sheet fixed z-50 flex flex-col bg-layer-01 text-text-primary shadow-raised focus-visible:outline-none',
            side === 'left' ? 'inset-y-0 left-0 w-11/12 max-w-sm' : 'inset-x-0 bottom-0 max-h-11/12 min-h-1/2',
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle-01 pl-4">
            <Dialog.Title className="m-0 text-heading-compact-02">{label}</Dialog.Title>
            <Dialog.Close
              aria-label="закрыть"
              className="inline-flex size-12 shrink-0 cursor-pointer items-center justify-center text-icon-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
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

  const close = () => onSheetChange?.(null)
  return (
    <div data-slot="three-column" data-columns={cols.length} data-active={active} data-phone={phoneMode} className={cx('flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background', className)}>
      {header && <div data-slot="three-column-header" className="shrink-0 border-b border-border-subtle-01 bg-layer-01">{header}</div>}
      <div className="flex min-h-0 min-w-0 flex-1">
      {cols.map((content, i) => {
        if (sheets && i !== 1)
          return (
            <Sheet key={i} side={i === 0 ? 'left' : 'bottom'} label={labels[i]} open={sheet === i} onClose={close}>
              {content}
            </Sheet>
          )
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
              'ds-col min-h-0 min-w-0 flex-col overflow-y-auto bg-layer-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
              on ? 'flex w-full' : 'hidden',
              'lg:flex',
              i === 0 && cx('lg:shrink-0', FIRST[firstWidth]),
              i === 1 && cx('lg:w-auto lg:flex-1 lg:border-border-subtle-01', two ? 'lg:border-l' : 'lg:border-x'),
              i === 2 && cx('lg:shrink-0', THIRD[thirdWidth]),
            )}
          >
            {i > 0 && phoneMode === 'stack' && (
              <div className="border-b border-border-subtle-01 px-2 py-1 lg:hidden">
                <Button variant="ghost" size="sm" onClick={() => onBack((i - 1) as ColumnIndex)} data-slot="column-back">
                  <span aria-hidden="true">←</span> {labels[i - 1]}
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
