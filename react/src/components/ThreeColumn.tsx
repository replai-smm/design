/**
 * Три колонки «список → лента → карточка» (DF: «Контент», «Сообщения», «Комментарии», «ИИ», «Чаты»; DF-PORT решение 1:
 * на ноутбуке три колонки остаются). С 1024 px видны все три, каждая прокручивается сама. Уже 1024 px — по очереди:
 * видна одна колонка (`active`), во второй и третьей сверху «← назад» к предыдущей.
 * - Переход на телефоне — выезд 0,6 с (ds.css → .ds-col), вперёд справа, назад слева; «уменьшить движение» — сразу.
 * - Фокус после перехода на телефоне — на колонку, читалка слышит её название.
 * - Колонки — области с подписью (`labels`); главная кнопка — у содержимого колонки, раскладка своих кнопок не держит.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'

export type ColumnIndex = 0 | 1 | 2

export interface ThreeColumnProps {
  /** Первая колонка: сообщества, проекты, фильтры. */
  first: ReactNode
  /** Вторая: посты, диалоги, чаты. */
  second: ReactNode
  /** Третья: карточка, переписка. Пусто — подсказка «Выберите …» от продукта. */
  third: ReactNode
  /** Названия колонок — подписи областей и слова «← назад»: ['Сообщества', 'Посты', 'Пост']. */
  labels: [string, string, string]
  /** Какая колонка видна на телефоне. На ноутбуке видны все. */
  active: ColumnIndex
  /** «← назад» на телефоне: перейти к колонке `to`. */
  onBack: (to: ColumnIndex) => void
  /** Ширина первой колонки на ноутбуке. */
  firstWidth?: 'sm' | 'md'
  /** Ширина третьей колонки на ноутбуке. Вторая занимает остальное. */
  thirdWidth?: 'md' | 'lg' | 'xl'
  className?: string
}

const FIRST = { sm: 'lg:w-64', md: 'lg:w-80' } as const
const THIRD = { md: 'lg:w-md', lg: 'lg:w-lg', xl: 'lg:w-xl' } as const
const PHONE = '(max-width: 63.99rem)'

export function ThreeColumn({ first, second, third, labels, active, onBack, firstWidth = 'sm', thirdWidth = 'lg', className }: ThreeColumnProps) {
  const cols = [first, second, third]
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
    <div data-slot="three-column" data-active={active} className={cx('flex h-full min-h-0 min-w-0 overflow-hidden bg-background', className)}>
      {cols.map((content, i) => {
        const on = i === active
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
              i === 1 && 'lg:w-auto lg:flex-1 lg:border-x lg:border-border-subtle-01',
              i === 2 && cx('lg:shrink-0', THIRD[thirdWidth]),
            )}
          >
            {i > 0 && (
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
  )
}
