/**
 * Разделы продукта — каркас вокруг страницы: основные разделы на виду, редкие свёрнуты в «Ещё» (не 13 равных пунктов).
 * Ноутбук — колонка слева: основные, под ними «Ещё» раскрывается на месте, редкие — тише. Телефон — панель внизу:
 * первые `tabs` основных и «Ещё», которое открывает шторку со всеми остальными (значки — если они есть у всех вкладок);
 * липкая полоса страницы (`BottomBar`) встаёт над панелью. Выбранный раздел — «выбрано» и `aria-current="page"`; выбран редкий — «Ещё» раскрыто и отмечено.
 */
import { useId, useState, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { CountBadge } from './CountBadge'
import { Dialog } from './Dialog'
import { Icon, type IconName } from './Icon'

export interface NavItem {
  id: string
  label: string
  icon?: IconName
  /** Число у раздела: сколько ждёт. */
  count?: number
}

export interface SectionNavProps {
  /** Подпись навигации для читалки: «Разделы». */
  label: string
  /** Основные разделы, по порядку важности. */
  main: NavItem[]
  /** Редкие разделы — под «Ещё». */
  more?: NavItem[]
  selected: string
  onSelect: (id: string) => void
  /** Сколько основных в панели телефона; по умолчанию 4. */
  tabs?: number
  /** Страница выбранного раздела. */
  children?: ReactNode
}

const ROW = `flex min-h-control w-full min-w-0 cursor-pointer items-center gap-items rounded-control px-compact text-start text-body hover:bg-hover ${FOCUS}`

function Row({ item, selected, quiet, onSelect }: { item: NavItem; selected: boolean; quiet?: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      aria-current={selected ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
      className={cx(ROW, selected ? 'bg-selected font-semibold text-fg' : quiet ? 'text-fg-muted' : 'text-fg')}
    >
      {item.icon && <Icon name={item.icon} />}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count !== undefined && item.count > 0 && <CountBadge count={item.count} />}
    </button>
  )
}

function Tab({ label, icon, selected, expanded, onClick }: { label: string; icon?: IconName; selected: boolean; expanded?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-current={selected ? 'page' : undefined}
      aria-expanded={expanded}
      onClick={onClick}
      className={cx('flex min-h-touch min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-tight border-t-2 px-tight text-caption hover:bg-hover', FOCUS, selected ? 'border-fg font-semibold text-fg' : 'border-transparent text-fg-muted')}
    >
      {icon && <Icon name={icon} />}
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}

export function SectionNav({ label, main, more = [], selected, onSelect, tabs = 4, children }: SectionNavProps) {
  const inMore = more.some((i) => i.id === selected)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const id = useId()
  const expanded = open || inMore
  const inTabs = main.slice(0, tabs)
  // значки в панели — у всех или ни у кого: иначе «Ещё» со значком выше и громче разделов
  const icons = inTabs.every((i) => i.icon)
  const rest = [...main.slice(tabs), ...more]
  const pick = (to: string) => {
    setSheet(false)
    onSelect(to)
  }
  return (
    <div data-slot="section-nav" className="ds-nav min-w-0 md:flex md:items-start">
      <nav aria-label={label} className="sticky top-0 hidden w-rail shrink-0 flex-col gap-tight border-r border-line p-items md:flex">
        {main.map((item) => (
          <Row key={item.id} item={item} selected={item.id === selected} onSelect={onSelect} />
        ))}
        {more.length > 0 && (
          <>
            <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(!expanded)} className={cx(ROW, 'text-fg-muted')}>
              <Icon name={expanded ? 'chevron-down' : 'chevron-right'} />
              <span className="min-w-0 flex-1 truncate">Ещё</span>
            </button>
            <div id={id} className="ds-expand" data-open={expanded} inert={!expanded}>
              <div className="flex flex-col gap-tight pl-blocks">
                {more.map((item) => (
                  <Row key={item.id} item={item} quiet selected={item.id === selected} onSelect={onSelect} />
                ))}
              </div>
            </div>
          </>
        )}
      </nav>
      <div data-part="content" className="min-w-0 flex-1">
        {children}
      </div>
      <nav aria-label={`${label}, внизу`} className="ds-tabbar fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface md:hidden">
        {inTabs.map((item) => (
          <Tab key={item.id} label={item.label} icon={icons ? item.icon : undefined} selected={item.id === selected} onClick={() => onSelect(item.id)} />
        ))}
        {rest.length > 0 && <Tab label="Ещё" icon={icons ? 'menu' : undefined} selected={rest.some((i) => i.id === selected)} expanded={sheet} onClick={() => setSheet(true)} />}
      </nav>
      <Dialog open={sheet} onOpenChange={setSheet} title="Ещё">
        <div className="flex flex-col gap-tight">
          {rest.map((item) => (
            <Row key={item.id} item={item} selected={item.id === selected} onSelect={pick} />
          ))}
        </div>
      </Dialog>
    </div>
  )
}
