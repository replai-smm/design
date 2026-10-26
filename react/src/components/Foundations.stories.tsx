import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { colors, scale, tones } from '../../../dist/tokens.ts'
import { ICONS, type IconName } from '../lib/icons.gen'
import { TONES } from '../lib/vocab'
import { Icon } from './Icon'

function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-compact">
      <h2 className="m-0 text-title text-fg">{title}</h2>
      {children}
    </section>
  )
}

function Roles() {
  return (
    <Sheet title="Роли цвета">
      <ul className="m-0 grid list-none grid-cols-1 gap-items p-0 md:grid-cols-2 lg:grid-cols-3">
        {Object.keys(colors.light).map((r) => (
          <li key={r} className="flex items-center gap-compact rounded-surface border border-line bg-surface p-items">
            <span className="size-control shrink-0 rounded-control border border-line" style={{ background: `var(--ds-${r})` }} />
            <span className="flex min-w-0 flex-col">
              <code className="font-mono text-code text-fg">{r}</code>
              <span className="text-caption text-fg-muted">
                {colors.light[r as keyof typeof colors.light]} · {colors.dark[r as keyof typeof colors.dark]}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

function Tones() {
  return (
    <Sheet title="Тоны">
      <ul className="m-0 flex list-none flex-col gap-items p-0">
        {TONES.map((t) => (
          <li key={t} className="flex flex-wrap items-center gap-compact">
            <span className="inline-flex items-center gap-tight text-body">
              <Icon tone={t} />
              {t}
            </span>
            <span className="text-caption text-fg-muted">
              знак {tones[t].mark} · текст {tones[t].text} · {tones[t].bg ? `подложка ${tones[t].bg}` : 'без подложки'}
              {tones[t].fill ? ` · заливка ${tones[t].fill}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

const TEXT: Record<string, string> = { caption: 'text-caption', body: 'text-body', heading: 'text-heading', reading: 'text-reading', code: 'text-code font-mono', title: 'text-title', page: 'text-page' }

function Type() {
  return (
    <Sheet title="Роли текста">
      {Object.entries(TEXT).map(([k, cls]) => (
        <div key={k} className="flex flex-col gap-tight border-b border-line pb-items">
          <span className="text-caption text-fg-muted">
            {k} · {scale[`text-${k}-size` as keyof typeof scale]} / {scale[`text-${k}-line` as keyof typeof scale]}
          </span>
          <span className={`${cls} text-fg`}>Съешь ещё этих мягких французских булок — 0123456789</span>
        </div>
      ))}
    </Sheet>
  )
}

const SPACE: Record<string, string> = { tight: 'w-tight', items: 'w-items', compact: 'w-compact', blocks: 'w-blocks', groups: 'w-groups', sections: 'w-sections' }
const SIZE: Record<string, string> = { icon: 'h-icon', dense: 'h-dense', control: 'h-control', touch: 'h-touch' }

function Steps() {
  return (
    <Sheet title="Отступы и высоты">
      <div className="flex flex-wrap items-end gap-blocks">
        {Object.entries(SPACE).map(([k, w]) => (
          <div key={k} className="flex flex-col items-start gap-tight">
            <span className={`block h-blocks rounded-control bg-fg ${w}`} />
            <code className="font-mono text-code text-fg-muted">{k}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-blocks">
        {Object.entries(SIZE).map(([k, h]) => (
          <div key={k} className={`flex w-touch items-center justify-center rounded-control border border-line-strong bg-surface text-caption ${h}`}>{k}</div>
        ))}
      </div>
    </Sheet>
  )
}

function Depth() {
  return (
    <Sheet title="Углы и глубина">
      <div className="flex flex-wrap gap-blocks">
        <div className="rounded-control border border-line-strong bg-surface p-compact text-body">контрол · 4</div>
        <div className="rounded-surface border border-line bg-surface p-blocks text-body">поверхность · 6 · плоско</div>
        <div className="rounded-surface border border-line bg-surface p-blocks text-body shadow-raised">всплывает</div>
        <div className="rounded-surface border border-line bg-surface p-blocks text-body shadow-overlay">поверх</div>
        <span className="self-center rounded-full bg-danger-bg px-items py-tight text-caption text-danger-fg">таблетка — метка</span>
      </div>
    </Sheet>
  )
}

function Icons() {
  return (
    <Sheet title="Значки">
      <ul className="m-0 flex list-none flex-wrap gap-items p-0">
        {(Object.keys(ICONS) as IconName[]).map((n) => (
          <li key={n} className="flex min-w-rail items-center gap-items rounded-control border border-line bg-surface px-items py-tight text-caption text-fg">
            <Icon name={n} />
            <code className="font-mono">{n}</code>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

const meta = {
  title: 'Основы/Роли и шкалы',
  parameters: { layout: 'padded' },
} satisfies Meta
export default meta
type S = StoryObj<typeof meta>

export const Цвет: S = { render: () => <Roles /> }
export const Тоны: S = { render: () => <Tones /> }
export const Текст: S = { render: () => <Type /> }
export const ОтступыИВысоты: S = { render: () => <Steps /> }
export const УглыИГлубина: S = { render: () => <Depth /> }
export const Значки: S = { render: () => <Icons /> }
