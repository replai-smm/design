/**
 * Вкладки (Carbon: Tabs, TabList, Tab, TabPanels, TabPanel): ряд сегментов (тот же ряд, что у ContentSwitcher) и панели.
 * Вкладка и панель связаны по порядку: первая `Tab` — первая `TabPanel`. Выбранная — по номеру: `selectedIndex` /
 * `defaultSelectedIndex`, `onChange({ selectedIndex })`; роль «выбрано». Все панели смонтированы, неактивные спрятаны
 * (`hidden`) — у вкладки-iframe своё состояние живо. Вкладка называется вопросом человека (П1); счётчик — `CountBadge`
 * в слове вкладки. Не влезает в ширину (телефон) — ряд одной строкой с прокруткой без полосы, выбранная вкладка
 * прокручивается в поле зрения. Стрелки ходят по ряду и сразу выбирают (`activation="manual"` — по Enter).
 */
import { Children, createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { Tabs as RTabs } from 'radix-ui'
import { FOCUS, SEGMENT, SEGMENT_ON, SEGMENTS, SEGMENTS_SCROLL } from '../lib/anatomy'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'

const SelectedContext = createContext(0)
const IndexContext = createContext(0)
/** Как стрелки выбирают — свойство ряда (Carbon: TabList activation), а держит его корень (Radix: Root activationMode). */
const ActivationContext = createContext<(a: 'automatic' | 'manual') => void>(() => {})

export interface TabsProps {
  /** `TabList` и `TabPanels`. */
  children?: ReactNode
  selectedIndex?: number
  defaultSelectedIndex?: number
  onChange?(state: { selectedIndex: number }): void
}

/** Вкладки (Carbon: Tabs). */
export function Tabs({ children, selectedIndex, defaultSelectedIndex = 0, onChange }: TabsProps) {
  const [current, setCurrent] = useControllable(selectedIndex, defaultSelectedIndex, (i: number) => onChange?.({ selectedIndex: i }))
  const [activation, setActivation] = useState<'automatic' | 'manual'>('automatic')
  return (
    <RTabs.Root data-slot="tabs" value={String(current)} onValueChange={(v) => setCurrent(Number(v))} activationMode={activation} className="flex min-w-0 flex-col gap-blocks">
      <ActivationContext.Provider value={setActivation}>
        <SelectedContext.Provider value={current}>{children}</SelectedContext.Provider>
      </ActivationContext.Provider>
    </RTabs.Root>
  )
}

/** Прокрутить ряд так, чтобы выбранная вкладка была видна целиком (только ряд, страница не двигается). */
function revealActive(row: HTMLElement | null) {
  const on = row?.querySelector<HTMLElement>('[data-state=active]')
  if (!row || !on) return
  const r = row.getBoundingClientRect()
  const t = on.getBoundingClientRect()
  if (t.left < r.left) row.scrollLeft -= r.left - t.left
  else if (t.right > r.right) row.scrollLeft += t.right - r.right
}

const numbered = (children: ReactNode) => Children.toArray(children).map((child, i) => <IndexContext.Provider key={i} value={i}>{child}</IndexContext.Provider>)

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** Подпись ряда для читалки. */
  'aria-label'?: string
  /** Стрелки выбирают сразу (`automatic`) или только ходят (`manual`). */
  activation?: 'automatic' | 'manual'
  children?: ReactNode
  className?: string
}

/** Ряд вкладок (Carbon: TabList). */
export function TabList({ activation = 'automatic', children, className, ...rest }: TabListProps) {
  const current = useContext(SelectedContext)
  const row = useRef<HTMLDivElement>(null)
  const setActivation = useContext(ActivationContext)
  useLayoutEffect(() => setActivation(activation), [activation, setActivation])
  useEffect(() => revealActive(row.current), [current])
  return (
    <RTabs.List ref={row} data-part="segments" className={cx(SEGMENTS, SEGMENTS_SCROLL, className)} {...rest}>
      {numbered(children)}
    </RTabs.List>
  )
}

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Слово вкладки; счётчик — `<CountBadge>` рядом со словом. */
  children?: ReactNode
  disabled?: boolean
  /** Значок перед словом — компонент из входа пакета `/icons`. */
  renderIcon?: ElementType
  className?: string
}

/** Вкладка (Carbon: Tab). */
export function Tab({ children, disabled, renderIcon: RenderIcon, className, ...rest }: TabProps) {
  const index = useContext(IndexContext)
  return (
    <RTabs.Trigger value={String(index)} disabled={disabled} className={cx(SEGMENT, SEGMENT_ON, 'disabled:cursor-not-allowed disabled:text-fg-disabled', className)} {...rest}>
      {RenderIcon && <RenderIcon aria-hidden="true" className="size-icon shrink-0" />}
      {children}
    </RTabs.Trigger>
  )
}

export interface TabPanelsProps {
  /** `TabPanel` — по одной на вкладку, в том же порядке. */
  children?: ReactNode
}

/** Панели вкладок (Carbon: TabPanels). */
export function TabPanels({ children }: TabPanelsProps) {
  return <>{numbered(children)}</>
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
}

/** Панель вкладки (Carbon: TabPanel): смонтирована всегда, неактивная — `hidden`. */
export function TabPanel({ children, className, ...rest }: TabPanelProps) {
  const index = useContext(IndexContext)
  const current = useContext(SelectedContext)
  return (
    <RTabs.Content value={String(index)} forceMount hidden={index !== current} className={cx('min-w-0 rounded-surface', FOCUS, className)} {...rest}>
      {children}
    </RTabs.Content>
  )
}
