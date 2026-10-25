/**
 * Страница настроек — лист разделов, как системные настройки: `Page` + `PageHeader` (о чём экран и одна строка, на какой
 * вопрос он отвечает) → `SettingsSection` один за другим → `SaveBar` последним. В разделе заголовок слева (на телефоне —
 * сверху), поля справа — полями ДС в одну строку (`inline`, `unit`, `help`): `За лайк (?) ……… [ 10 ] баллов`.
 * Подробность — по «?» (`Help`) или в свёрнутом «Как это работает» (`HowItWorks`), а не абзацем под каждым полем.
 * Главный раздел — обычный, второстепенный — `quiet`: иерархия видна, разделы не равны. Пусто в разделе — `StateView`.
 */
import { useId, useState, type ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Help } from './Help'
import { Icon } from './Icon'

export interface SettingsSectionProps {
  title: string
  /** Одна короткая строка под заголовком. */
  description?: ReactNode
  /** Справка по «?» у заголовка. */
  help?: ReactNode
  /** Второстепенный раздел: заголовок мельче и тише. */
  quiet?: boolean
  /** Тихие действия раздела. */
  tools?: ReactNode
  children?: ReactNode
}

/** Раздел листа настроек: заголовок слева, поля справа, разделы отделены линией. */
export function SettingsSection({ title, description, help, quiet, tools, children }: SettingsSectionProps) {
  const id = useId()
  return (
    <section data-slot="settings-section" data-quiet={quiet || undefined} aria-labelledby={id} className="flex min-w-0 flex-col gap-blocks border-t border-line pt-groups md:flex-row md:gap-sections">
      <div className="flex min-w-0 flex-col gap-tight md:w-rail md:shrink-0">
        <div className="flex min-w-0 items-center gap-tight">
          <h2 id={id} data-part="title" className={cx('m-0 min-w-0', quiet ? 'text-heading text-fg-muted' : 'text-title text-fg')}>
            {title}
          </h2>
          {help && <Help about={title}>{help}</Help>}
        </div>
        {description && <p className="m-0 text-body text-fg-muted">{description}</p>}
        {tools && <div className="flex items-center gap-items">{tools}</div>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-blocks">{children}</div>
    </section>
  )
}

export interface HowItWorksProps {
  /** По умолчанию «Как это работает». */
  title?: string
  /** Правила и оговорки экрана — по одной строке. */
  items: ReactNode[]
}

/** Свёрнутое «Как это работает»: правила экрана по требованию, а не текстом поверх интерфейса. */
export function HowItWorks({ title = 'Как это работает', items }: HowItWorksProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div data-slot="how-it-works" className="flex min-w-0 flex-col border-t border-line pt-blocks">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={cx('flex min-h-control cursor-pointer items-center gap-items self-start rounded-control text-body text-fg hover:bg-hover', FOCUS)}
      >
        <Icon name={open ? 'chevron-down' : 'chevron-right'} />
        {title}
      </button>
      <div id={id} className="ds-expand" data-open={open} inert={!open}>
        <div>
          <ul className="m-0 flex max-w-prose flex-col gap-items pt-items pl-groups text-body text-fg-muted">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
