/**
 * Вкладки со счётчиками (Radix Tabs). Вкладка называется вопросом человека, а не значением поля (П1).
 * Счётчик — число рядом со словом; у срочного счётчика — знак тона «опасно» или «внимание», не только цвет.
 * На телефоне ряд вкладок прокручивается вбок, высота вкладки — 48 px (цель касания).
 */
import type { ReactNode } from 'react'
import { Tabs as RTabs } from 'radix-ui'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export interface TabItem {
  value: string
  label: ReactNode
  count?: number
  /** Срочность счётчика: error — «опасно», warning — «внимание». Без него счётчик серый. */
  tone?: 'error' | 'warning'
  content: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  /** Подпись ряда вкладок для читалки. */
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  className?: string
}

const COUNT_MARK = { error: 'text-status-error', warning: 'text-status-warning' } as const

export function Tabs({ items, label, value, defaultValue, onValueChange, className }: TabsProps) {
  return (
    <RTabs.Root
      data-slot="tabs"
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={cx('flex min-w-0 flex-col gap-4', className)}
    >
      <RTabs.List aria-label={label} className="flex min-w-0 overflow-x-auto border-b border-border-subtle-01">
        {items.map((t) => (
          <RTabs.Trigger
            key={t.value}
            value={t.value}
            className={cx(
              'inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 text-body-compact-01 text-text-secondary',
              'transition-colors duration-(--cds-duration-fast-02) ease-standard-productive hover:text-text-primary hover:bg-layer-hover-01',
              'data-[state=active]:border-border-interactive data-[state=active]:text-text-primary data-[state=active]:font-semibold',
              'focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span data-slot="tab-count" className="inline-flex items-center gap-1 rounded-full border border-border-subtle-01 px-2 text-label-01 text-text-primary">
                {t.tone && <ToneIcon tone={t.tone} className={cx('size-3', COUNT_MARK[t.tone])} />}
                {t.count}
              </span>
            )}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {items.map((t) => (
        <RTabs.Content key={t.value} value={t.value} className="min-w-0 focus-visible:outline-2 focus-visible:outline-focus">
          {t.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  )
}
