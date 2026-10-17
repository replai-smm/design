/**
 * Схема (чат orbit): узлы-поверхности на поле и тихие связи между ними — круг станций, путь данных. Места узлов задаёт
 * продукт (доли поля 0…1), схема их только рисует; связи — без бегущих точек (бег — ложь, когда ничего не идёт).
 * - Узел: имя и одно число; внутри — строки (`items`) и точки (`dots`). `kind="group"` — пунктирная рамка,
 *   `kind="core"` — середина, утопленная.
 * - У всего есть адрес — id узла, строки, точки. Указатель агента — декларативно: `highlight` (рамка мягко мерцает на
 *   месте), `focus` (главное: кольцо фокуса, прокрутка к нему, `aria-current`), `dim` — остальное приглушить, `hide` —
 *   убрать. Связи — дугой вокруг центра (`ring`) или прямо. Цвет — только знак тона у строки или точки.
 * - `onSelect(адрес)` — узел, строка и точка становятся кнопками. `aspect="fit"` — в узком месте поле выше.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import { FOCUS, SUNKEN, SURFACE } from '../lib/anatomy'
import { cx } from '../lib/cx'
import type { Tone } from '../lib/vocab'
import { Icon } from './Icon'

type DiagramTone = Extract<Tone, 'опасно' | 'внимание' | 'хорошо'>

export interface DiagramItem {
  /** Адрес строки: «input/probe». */
  id: string
  label: ReactNode
  /** Число или слово справа. */
  value?: ReactNode
  tone?: DiagramTone
}

export interface DiagramDot {
  /** Адрес точки: id работы. */
  id: string
  /** Что это — для читалки. */
  label: string
  tone?: DiagramTone
}

export interface DiagramNode {
  id: string
  label: ReactNode
  value?: ReactNode
  /** Центр узла: доли ширины и высоты поля. */
  at: [number, number]
  kind?: 'station' | 'group' | 'core'
  items?: DiagramItem[]
  dots?: DiagramDot[]
  /** Беда станции — знаком тона и словом. */
  alert?: { tone: DiagramTone; text: ReactNode }
}

export interface DiagramEdge {
  from: string
  to: string
}

export interface DiagramProps {
  nodes: DiagramNode[]
  edges?: DiagramEdge[]
  /** Подпись схемы для читалки. */
  label: string
  /** Центр, вокруг которого связи идут дугой (доли поля). */
  ring?: [number, number]
  /** square — квадрат; fit — в узком месте выше (3:4), с 448 px — квадрат. */
  aspect?: 'square' | 'fit'
  highlight?: string[]
  focus?: string
  dim?: boolean
  hide?: string[]
  onSelect?: (address: string) => void
  className?: string
}

const ASPECT = { square: 'aspect-square', fit: 'aspect-3/4 @form:aspect-square' } as const
const DOT_BG: Record<DiagramTone | 'none', string> = { опасно: 'bg-danger', внимание: 'bg-warning', хорошо: 'bg-success', none: 'bg-fg-muted' }
const WIDTH = { station: 'w-1/4', group: 'w-1/3', core: 'w-1/3' } as const

/** Путь связи в координатах поля 0…100: прямо или дугой от центра `ring`. */
export function edgePath(a: [number, number], b: [number, number], ring?: [number, number]): string {
  const [x1, y1, x2, y2] = [a[0] * 100, a[1] * 100, b[0] * 100, b[1] * 100]
  if (!ring) return `M${x1} ${y1}L${x2} ${y2}`
  const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2]
  const [dx, dy] = [mx - ring[0] * 100, my - ring[1] * 100]
  const len = Math.hypot(dx, dy) || 1
  const bend = Math.hypot(x2 - x1, y2 - y1) * 0.25
  return `M${x1} ${y1}Q${mx + (dx / len) * bend} ${my + (dy / len) * bend} ${x2} ${y2}`
}

/** Горит ли адрес и его узел: узел горит, если горит он сам или что-то внутри. */
export function litSet(nodes: DiagramNode[], highlight: string[] = [], focus?: string): { self: Set<string>; nodes: Set<string> } {
  const self = new Set([...highlight, ...(focus ? [focus] : [])])
  const lit = new Set<string>()
  for (const n of nodes) if (self.has(n.id) || n.items?.some((i) => self.has(i.id)) || n.dots?.some((d) => self.has(d.id))) lit.add(n.id)
  return { self, nodes: lit }
}

function Ring({ on, strong }: { on: boolean; strong?: boolean }) {
  if (!on) return null
  return <span aria-hidden="true" data-part="lit-ring" className={cx('ds-lit-ring pointer-events-none absolute -inset-tight rounded-surface border-2 border-fg', strong && 'outline-2 outline-offset-2 outline-accent')} />
}

export function Diagram({ nodes, edges = [], label, ring, aspect = 'square', highlight = [], focus, dim = false, hide = [], onSelect, className }: DiagramProps) {
  const hidden = new Set(hide)
  const shown = nodes.filter((n) => !hidden.has(n.id))
  const { self, nodes: litNodes } = litSet(shown, highlight, focus)
  const pointing = self.size > 0
  const at = new Map(shown.map((n) => [n.id, n.at]))
  const field = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focus) return
    field.current?.querySelector<HTMLElement>(`[data-address="${CSS.escape(focus)}"]`)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focus])

  const faded = (address: string, owner?: string) => dim && pointing && !self.has(address) && !(owner === undefined && litNodes.has(address))
  const pick = (address: string) => (onSelect ? () => onSelect(address) : undefined)
  const press = onSelect ? cx('cursor-pointer hover:bg-hover', FOCUS) : undefined

  return (
    <div className={cx('@container w-full min-w-0', className)}>
      <div ref={field} role="group" aria-label={label} data-slot="diagram" data-pointing={pointing || undefined} className={cx('relative w-full', ASPECT[aspect])}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
          {edges
            .filter((e) => at.has(e.from) && at.has(e.to))
            .map((e) => {
              const lit = litNodes.has(e.from) && litNodes.has(e.to)
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(at.get(e.from)!, at.get(e.to)!, ring)}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={lit ? 2 : 1}
                  className={cx(lit ? 'stroke-fg' : 'stroke-line-strong', dim && pointing && !lit && 'opacity-30')}
                />
              )
            })}
        </svg>
        {shown.map((n) => {
          const kind = n.kind ?? 'station'
          const items = (n.items ?? []).filter((i) => !hidden.has(i.id))
          const dots = (n.dots ?? []).filter((d) => !hidden.has(d.id))
          const Head = onSelect ? 'button' : 'div'
          return (
            <section
              key={n.id}
              data-part="node"
              data-address={n.id}
              data-kind={kind}
              data-lit={self.has(n.id) || undefined}
              aria-label={typeof n.label === 'string' ? n.label : undefined}
              aria-current={focus === n.id ? 'location' : undefined}
              style={{ left: `${n.at[0] * 100}%`, top: `${n.at[1] * 100}%` }}
              className={cx(
                'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col gap-tight p-items transition-opacity duration-move ease-standard',
                WIDTH[kind],
                kind === 'core' ? SUNKEN : kind === 'group' ? 'rounded-surface border border-dashed border-line-strong bg-canvas text-fg' : SURFACE,
                faded(n.id) && 'opacity-40',
              )}
            >
              <Ring on={self.has(n.id)} strong={focus === n.id} />
              <Head {...(onSelect ? { type: 'button' as const, onClick: pick(n.id) } : {})} className={cx('flex min-w-0 items-baseline justify-between gap-items rounded-control text-start', press)}>
                <span className="min-w-0 truncate text-heading">{n.label}</span>
                {n.value !== undefined && <span className="shrink-0 text-body text-fg-muted">{n.value}</span>}
              </Head>
              {n.alert && (
                <span className="inline-flex items-center gap-tight text-caption">
                  <Icon tone={n.alert.tone} />
                  {n.alert.text}
                </span>
              )}
              {items.length > 0 && (
                <ul className="m-0 flex list-none flex-col p-0">
                  {items.map((it) => {
                    const Row = onSelect ? 'button' : 'span'
                    return (
                      <li key={it.id} data-address={it.id} data-lit={self.has(it.id) || undefined} aria-current={focus === it.id ? 'location' : undefined} className={cx('relative', faded(it.id, n.id) && 'opacity-40')}>
                        <Ring on={self.has(it.id)} strong={focus === it.id} />
                        <Row {...(onSelect ? { type: 'button' as const, onClick: pick(it.id) } : {})} className={cx('flex w-full min-w-0 flex-wrap items-center gap-x-tight border-t border-line py-tight text-start text-caption @form:flex-nowrap', press)}>
                          {it.tone && <Icon tone={it.tone} />}
                          <span className="min-w-0 flex-auto break-words @form:flex-1 @form:truncate">{it.label}</span>
                          {it.value !== undefined && <span className="ml-auto shrink-0 text-fg-muted">{it.value}</span>}
                        </Row>
                      </li>
                    )
                  })}
                </ul>
              )}
              {dots.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-tight p-0" aria-label="работы">
                  {dots.map((d) => {
                    const Dot = onSelect ? 'button' : 'span'
                    return (
                      <li key={d.id} data-address={d.id} data-lit={self.has(d.id) || undefined} aria-current={focus === d.id ? 'location' : undefined} className={cx('relative', faded(d.id, n.id) && 'opacity-40')}>
                        <Ring on={self.has(d.id)} strong={focus === d.id} />
                        <Dot {...(onSelect ? { type: 'button' as const, onClick: pick(d.id), 'aria-label': d.label } : {})} className={cx('flex size-icon items-center justify-center rounded-full', onSelect && cx('cursor-pointer', FOCUS))}>
                          <span aria-hidden="true" className={cx('size-items rounded-full', DOT_BG[d.tone ?? 'none'])} />
                          {!onSelect && <span className="sr-only">{d.label}</span>}
                        </Dot>
                        {d.tone && <span className="sr-only">{`, ${d.tone}`}</span>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
