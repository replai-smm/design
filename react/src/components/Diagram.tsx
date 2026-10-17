/**
 * Схема: узлы на поле и связи между ними — круг станций, путь данных, устройство службы. Места узлов задаёт продукт
 * (доли поля 0…1), схема их только рисует; связи — тихие линии без бегущих точек (бег — ложь, когда ничего не идёт).
 * - Узел: имя и одно число (`value`); внутри — строки (`items`: адаптеры, дорожки) и точки (`dots`: работы на станции).
 *   `kind="group"` — пунктирная рамка (группа адаптеров), `kind="core"` — середина круга.
 * - У всего есть адрес — id узла, строки, точки (`input`, `input/probe`, `n5t2vd`). Указатель — декларативно:
 *   `highlight` — что подсветить (рамка мягко мерцает на месте), `focus` — главное из них (рамка ярче, прокрутка к нему,
 *   `aria-current`), `dim` — остальное приглушить, `hide` — убрать. Этим управляет агент: адреса, а не координаты.
 * - Связи — дугой вокруг центра (`ring`) или прямо. Цвет — только знак тона у строки или точки (внимание, опасно).
 * - `onSelect(адрес)` — узел, строка и точка становятся кнопками (провалиться в станцию).
 * Поле держит пропорцию (`aspect`); в узком месте (< 448 px по ширине схемы) узлы уже, `fit` — поле выше, а строка узла
 * переносится (число уходит под подпись), а не обрезается.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type DiagramTone = 'error' | 'warning' | 'success'

export interface DiagramItem {
  /** Адрес строки: «input/probe», «execution/change». */
  id: string
  label: ReactNode
  /** Число или слово справа: «3», «12 мин». */
  value?: ReactNode
  tone?: DiagramTone
}

export interface DiagramDot {
  /** Адрес точки: id работы «n5t2vd». */
  id: string
  /** Что это — для читалки и подсказки: «n5t2vd · экспорт в CSV». */
  label: string
  tone?: DiagramTone
}

export interface DiagramNode {
  id: string
  label: ReactNode
  /** Одно главное число станции. */
  value?: ReactNode
  /** Место центра узла: доли ширины и высоты поля. */
  at: [number, number]
  kind?: 'station' | 'group' | 'core'
  items?: DiagramItem[]
  dots?: DiagramDot[]
  /** Беда станции — знаком тона и словом (только если есть). */
  alert?: { tone: DiagramTone; text: ReactNode }
}

export interface DiagramEdge {
  from: string
  to: string
}

export interface DiagramProps {
  nodes: DiagramNode[]
  edges?: DiagramEdge[]
  /** Подпись схемы для читалки: «Круг orbit». */
  label: string
  /** Центр, вокруг которого связи идут дугой (доли поля). Без него — прямо. */
  ring?: [number, number]
  /** square — квадрат; wide — 16:9; fit — в узком месте (телефон) выше, 3:4, с 448 px — квадрат. */
  aspect?: 'square' | 'wide' | 'fit'
  highlight?: string[]
  focus?: string
  dim?: boolean
  hide?: string[]
  onSelect?: (address: string) => void
  className?: string
}

const MARK: Record<DiagramTone, string> = { error: 'text-status-error', warning: 'text-status-warning', success: 'text-status-success' }
const ASPECT = { square: 'aspect-square', wide: 'aspect-video', fit: 'aspect-3/4 @md:aspect-square' } as const
const DOT: Record<DiagramTone | 'none', string> = { error: 'bg-status-error', warning: 'bg-status-warning', success: 'bg-status-success', none: 'bg-icon-secondary' }
const WIDTH = { station: 'w-24 @md:w-32', group: 'w-32 @md:w-40', core: 'w-28 @md:w-36' } as const

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

/** Горит ли адрес и его владелец: узел горит, если горит он сам или что-то внутри. */
export function litSet(nodes: DiagramNode[], highlight: string[] = [], focus?: string): { self: Set<string>; nodes: Set<string> } {
  const self = new Set([...highlight, ...(focus ? [focus] : [])])
  const lit = new Set<string>()
  for (const n of nodes) if (self.has(n.id) || n.items?.some((i) => self.has(i.id)) || n.dots?.some((d) => self.has(d.id))) lit.add(n.id)
  return { self, nodes: lit }
}

function Ring({ on, strong }: { on: boolean; strong?: boolean }) {
  if (!on) return null
  return <span aria-hidden="true" data-slot="lit-ring" className={cx('ds-lit-ring pointer-events-none absolute -inset-1 border-2 border-border-interactive', strong && 'outline-2 outline-offset-2 outline-focus')} />
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

  return (
    <div className={cx('@container w-full min-w-0', className)}>
    <div
      ref={field}
      role="group"
      aria-label={label}
      data-slot="diagram"
      data-pointing={pointing || undefined}
      className={cx('relative w-full', ASPECT[aspect])}
    >
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
                className={cx(lit ? 'stroke-border-interactive' : 'stroke-border-strong-01', dim && pointing && !lit && 'opacity-30')}
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
            data-slot="diagram-node"
            data-address={n.id}
            data-kind={kind}
            data-lit={self.has(n.id) || undefined}
            aria-label={typeof n.label === 'string' ? n.label : undefined}
            aria-current={focus === n.id ? 'location' : undefined}
            style={{ left: `${n.at[0] * 100}%`, top: `${n.at[1] * 100}%` }}
            className={cx(
              'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 p-2 text-text-primary transition-opacity duration-move ease-move',
              WIDTH[kind],
              kind === 'group' ? 'border border-dashed border-border-strong-01 bg-background' : 'border border-border-subtle-01 bg-layer-01',
              kind === 'core' && 'bg-layer-02',
              faded(n.id) && 'opacity-40',
            )}
          >
            <Ring on={self.has(n.id)} strong={focus === n.id} />
            <Head
              {...(onSelect ? { type: 'button' as const, onClick: pick(n.id) } : {})}
              className={cx(
                'flex min-w-0 items-baseline justify-between gap-2 text-start',
                onSelect && 'cursor-pointer hover:text-link-primary focus-visible:outline-2 focus-visible:outline-focus',
              )}
            >
              <span className="min-w-0 truncate text-heading-compact-01">{n.label}</span>
              {n.value !== undefined && <span className="shrink-0 text-body-compact-01 text-text-secondary">{n.value}</span>}
            </Head>
            {n.alert && (
              <span className="inline-flex items-center gap-1 text-label-01">
                <ToneIcon tone={n.alert.tone} className={cx('size-3', MARK[n.alert.tone])} />
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
                      <Row
                        {...(onSelect ? { type: 'button' as const, onClick: pick(it.id) } : {})}
                        className={cx(
                          'flex w-full min-w-0 flex-wrap items-center gap-x-1 border-t border-border-subtle-01 py-1 text-start text-label-01 @md:flex-nowrap',
                          onSelect && 'cursor-pointer hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus',
                        )}
                      >
                        {it.tone && <ToneIcon tone={it.tone} className={cx('size-3', MARK[it.tone])} />}
                        <span className="min-w-0 flex-auto break-words @md:flex-1 @md:truncate">{it.label}</span>
                        {it.value !== undefined && <span className="ml-auto shrink-0 text-text-secondary">{it.value}</span>}
                      </Row>
                    </li>
                  )
                })}
              </ul>
            )}
            {dots.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-1 p-0" aria-label="работы">
                {dots.map((d) => {
                  const Dot = onSelect ? 'button' : 'span'
                  return (
                    <li key={d.id} data-address={d.id} data-lit={self.has(d.id) || undefined} aria-current={focus === d.id ? 'location' : undefined} className={cx('relative', faded(d.id, n.id) && 'opacity-40')}>
                      <Ring on={self.has(d.id)} strong={focus === d.id} />
                      <Dot
                        {...(onSelect ? { type: 'button' as const, onClick: pick(d.id), 'aria-label': d.label } : {})}
                        className={cx('flex size-4 items-center justify-center', onSelect && 'cursor-pointer focus-visible:outline-2 focus-visible:outline-focus')}
                      >
                        <span aria-hidden="true" className={cx('size-2 rounded-full', DOT[d.tone ?? 'none'])} />
                        {!onSelect && <span className="sr-only">{d.label}</span>}
                      </Dot>
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
