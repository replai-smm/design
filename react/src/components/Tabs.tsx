/**
 * Вкладки — ряд сегментов (тот же ряд, что у фильтров) и панели. Вкладка называется вопросом человека (П1).
 * Выбранная — роль «выбрано». Счётчик — `CountBadge` тона словаря: у срочного — знак. На телефоне ряд переносится.
 * Неактивная панель размонтируется; `keepMounted` — живёт спрятанной (вкладка-iframe хранит своё состояние).
 * Значение не из ряда — ни одна не выбрана.
 */
import type { ReactNode } from 'react'
import { Tabs as RTabs } from 'radix-ui'
import { FOCUS, SEGMENT, SEGMENT_ON, SEGMENTS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { CountBadge } from './CountBadge'

export interface TabItem {
  value: string
  label: ReactNode
  count?: number
  /** Тон счётчика: срочное — со знаком. */
  tone?: Exclude<Tone, 'хорошо'>
  content: ReactNode
  /** Не размонтировать содержимое неактивной вкладки. */
  keepMounted?: boolean
}

export interface TabsProps {
  items: TabItem[]
  /** Подпись ряда для читалки. */
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  className?: string
}

export function Tabs({ items, label, value, defaultValue, onValueChange, className }: TabsProps) {
  return (
    <RTabs.Root data-slot="tabs" value={value} defaultValue={defaultValue ?? items[0]?.value} onValueChange={onValueChange} className={cx('flex min-w-0 flex-col gap-blocks', className)}>
      <RTabs.List aria-label={label} data-part="segments" className={SEGMENTS}>
        {items.map((t) => (
          <RTabs.Trigger key={t.value} value={t.value} className={cx(SEGMENT, SEGMENT_ON)}>
            {t.label}
            {t.count !== undefined && <CountBadge count={t.count} tone={t.tone} />}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {items.map((t) => (
        <RTabs.Content key={t.value} value={t.value} forceMount={t.keepMounted || undefined} className={cx('min-w-0 rounded-surface', FOCUS, t.keepMounted && 'data-[state=inactive]:hidden')}>
          {t.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  )
}
