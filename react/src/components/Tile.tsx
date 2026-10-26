/**
 * Плитка — одна анатомия всего, что лежит слоем на холсте (Carbon: Tile): слой, тихая рамка, угол поверхности, поля
 * `blocks` (16). Остальные поверхности построены на ней.
 * - `ClickableTile` — вся плитка нажимается: `href` — переход (`<a>`), без него — действие `onClick` (`<button>`).
 * - `ExpandableTile` — лицо (`TileAboveTheFoldContent`) и подробности под сгибом (`TileBelowTheFoldContent`): кнопка со
 *   знаком раскрывает за 0,6 с, соседи едут, а не прыгают (механика одна — lib/disclosure). П7 держит проверка в
 *   разработке: на лице — заголовок и не больше трёх фактов (детей лица не больше четырёх); в подробностях — такие же
 *   плитки, раскрытие не глубже двух уровней.
 * Своей глубины (Carbon: Layer) нет: слоёв в ролях два — холст и поверхность; утопленное (код) — анатомия `SUNKEN`.
 */
import { Children, createContext, forwardRef, useContext, useEffect, type ElementType, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { FOCUS, SURFACE } from '../lib/anatomy'
import { cx, rule } from '../lib/cx'
import { Expand, chevron, useDisclosure } from '../lib/disclosure'
import { Icon } from './Icon'

export interface TileProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
}

/** Слой с рамкой (Carbon: Tile). */
export const Tile = forwardRef<HTMLDivElement, TileProps>(function Tile({ className, ...rest }, ref) {
  return <div ref={ref} data-slot="tile" className={cx('flex min-w-0 flex-col p-blocks', SURFACE, className)} {...rest} />
})

export interface ClickableTileProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  children?: ReactNode
  className?: string
  /** Переход по адресу: плитка — ссылка. */
  href?: string
  rel?: string
  disabled?: boolean
  /** Значок в углу (Carbon: renderIcon) — компонент из входа пакета `/icons`. */
  renderIcon?: ElementType
  onClick?(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>): void
}

/** Плитка-переход или плитка-действие (Carbon: ClickableTile). */
export const ClickableTile = forwardRef<HTMLAnchorElement & HTMLButtonElement, ClickableTileProps>(function ClickableTile(
  { href, rel, disabled, renderIcon: RenderIcon, onClick, className, children, ...rest },
  ref,
) {
  const cls = cx(
    'relative flex min-w-0 flex-col p-blocks text-start no-underline',
    SURFACE,
    disabled ? 'cursor-not-allowed text-fg-disabled' : cx('cursor-pointer hover:bg-hover', FOCUS),
    className,
  )
  const body = (
    <>
      {children}
      {RenderIcon && <RenderIcon aria-hidden="true" className="absolute right-blocks bottom-blocks size-icon" />}
    </>
  )
  return href !== undefined ? (
    <a ref={ref} data-slot="clickable-tile" href={disabled ? undefined : href} rel={rel} aria-disabled={disabled || undefined} onClick={disabled ? undefined : onClick} className={cls} {...rest}>
      {body}
    </a>
  ) : (
    <button ref={ref} type="button" data-slot="clickable-tile" disabled={disabled} onClick={onClick} className={cls} {...rest}>
      {body}
    </button>
  )
})

/** Глубина раскрытия: плитка внутри подробностей другой плитки — на уровень глубже. */
const DepthContext = createContext(0)

export interface ExpandableTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Дети — `TileAboveTheFoldContent` (лицо) и `TileBelowTheFoldContent` (подробности), в этом порядке. */
  children?: ReactNode
  className?: string
  /** Раскрыта; смена свойства раскрывает и сворачивает. */
  expanded?: boolean
  onClick?(event: MouseEvent<HTMLButtonElement>): void
  /** Имя кнопки для читалки, пока свёрнуто (если нет слова на кнопке). */
  tileCollapsedIconText?: string
  /** Имя кнопки для читалки, пока раскрыто. */
  tileExpandedIconText?: string
  /** Слово на кнопке, пока свёрнуто. */
  tileCollapsedLabel?: string
  /** Слово на кнопке, пока раскрыто. */
  tileExpandedLabel?: string
}

/** Плитка с подробностями под сгибом (Carbon: ExpandableTile). */
export function ExpandableTile({
  children,
  className,
  expanded = false,
  onClick,
  tileCollapsedIconText = 'Подробнее',
  tileExpandedIconText = 'Свернуть',
  tileCollapsedLabel,
  tileExpandedLabel,
  ...rest
}: ExpandableTileProps) {
  const depth = useContext(DepthContext)
  rule(depth < 2, 'раскрытие глубже 2 уровней (П7): плитка с подробностями внутри подробностей внутри подробностей — третий уровень выносят на отдельный экран')
  const fold = useDisclosure(expanded)
  const { setOpen } = fold
  useEffect(() => setOpen(expanded), [expanded, setOpen])
  const [above, below] = Children.toArray(children)
  const label = fold.open ? tileExpandedLabel : tileCollapsedLabel
  return (
    <div data-slot="expandable-tile" data-depth={String(depth)} className={cx('flex min-w-0 flex-col', SURFACE, className)} {...rest}>
      <div data-part="body" className="flex min-w-0 flex-col gap-items p-blocks">
        {above}
        <button
          type="button"
          {...fold.trigger}
          aria-label={label ? undefined : fold.open ? tileExpandedIconText : tileCollapsedIconText}
          onClick={(e) => {
            onClick?.(e)
            fold.setOpen((o) => !o)
          }}
          className={cx('inline-flex min-h-dense cursor-pointer items-center gap-tight self-end rounded-control px-items text-body text-accent hover:underline', FOCUS)}
        >
          {label}
          <Icon name="chevron-down" className={chevron(fold.open)} />
        </button>
      </div>
      <Expand id={fold.id} open={fold.open}>
        <DepthContext.Provider value={depth + 1}>
          <div className="flex flex-col gap-items border-t border-line p-blocks">{below}</div>
        </DepthContext.Provider>
      </Expand>
    </div>
  )
}

export interface TileAboveTheFoldContentProps {
  /** Заголовок и не больше трёх фактов (П7). */
  children?: ReactNode
}

/** Лицо плитки: видно всегда (Carbon: TileAboveTheFoldContent). */
export function TileAboveTheFoldContent({ children }: TileAboveTheFoldContentProps) {
  const n = Children.toArray(children).length
  rule(n <= 4, `на лице плитки ${n} блоков — заголовок и не больше 3 фактов (П7), остальное — в TileBelowTheFoldContent`)
  return (
    <div data-part="above" className="flex min-w-0 flex-col gap-items">
      {children}
    </div>
  )
}

export interface TileBelowTheFoldContentProps {
  /** Подробности: текст, таблица, такие же плитки (не глубже двух уровней). */
  children?: ReactNode
}

/** Подробности под сгибом: видны после раскрытия (Carbon: TileBelowTheFoldContent). */
export function TileBelowTheFoldContent({ children }: TileBelowTheFoldContentProps) {
  return (
    <div data-part="below" className="flex min-w-0 flex-col gap-items">
      {children}
    </div>
  )
}
