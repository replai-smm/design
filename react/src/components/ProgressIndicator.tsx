/**
 * Шаги процесса (Carbon: ProgressIndicator + ProgressStep): где человек в пути из нескольких шагов и сколько осталось
 * («Текст · Куда · Предпросмотр · Итог»). Шаг пройден (`complete`), текущий (`current`, `aria-current="step"`), впереди
 * или с ошибкой (`invalid`) — словом для читалки и формой знака, не только цветом. `currentIndex` у набора сам ставит
 * пройденные и текущий; `onChange(index)` — шаги нажимаются (кроме текущего и выключенных), как у Carbon. На телефоне —
 * одной строкой «Шаг 2 из 4 · Куда» (у Carbon такой строки нет — README «Расходится с Carbon»); `vertical` — столбцом.
 * Шаги — не вкладки: содержимое шага рисует продукт. Шагов — от трёх (Carbon: Progress indicator); два — одна форма.
 */
import { Children, cloneElement, isValidElement, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import { cx, rule } from '../lib/cx'
import { FOCUS } from '../lib/anatomy'
import type { ProgressStepState } from '../lib/vocab'
import { Icon } from './Icon'

export interface ProgressIndicatorProps extends Omit<HTMLAttributes<HTMLUListElement>, 'onChange'> {
  /** Шаги — `ProgressStep` по порядку. */
  children?: ReactNode
  /** Текущий шаг (с нуля); до него — пройденные. По умолчанию 0. */
  currentIndex?: number
  /** Нажали шаг: его номер (с нуля). Без него шаги — просто путь. */
  onChange?: (index: number) => void
  /** Шаги равной ширины. */
  spaceEqually?: boolean
  /** Столбцом. */
  vertical?: boolean
}

export interface ProgressStepProps {
  /** Подпись шага. */
  label: string
  /** Вторая строка под подписью. */
  secondaryLabel?: string
  /** Описание шага для читалки. */
  description?: string
  complete?: boolean
  current?: boolean
  /** Ошибка на шаге: знак «опасно» вместо галочки. */
  invalid?: boolean
  disabled?: boolean
  /** Номер шага — ставит `ProgressIndicator`. */
  index?: number
  /** Нажали шаг — ставит `ProgressIndicator` из `onChange`. */
  onClick?: (event: KeyboardEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => void
  className?: string
}

const stateOf = ({ complete, current, invalid }: ProgressStepProps): ProgressStepState => (invalid ? 'invalid' : current ? 'current' : complete ? 'complete' : 'incomplete')
const WORD: Record<ProgressStepState, string> = { complete: 'пройден', current: 'текущий', invalid: 'ошибка', incomplete: 'впереди' }

function Mark({ state }: { state: ProgressStepState }) {
  if (state === 'invalid') return <Icon tone="опасно" />
  if (state === 'complete') return <Icon tone="хорошо" />
  return state === 'current' ? <Icon name="tone-neutral" className="text-fg" /> : <Icon tone="нейтрально" />
}

/** Шаг пути. */
export function ProgressStep(props: ProgressStepProps) {
  const { label, secondaryLabel, description, disabled, onClick, className } = props
  const state = stateOf(props)
  const body = (
    <>
      <Mark state={state} />
      <span className="flex min-w-0 flex-col">
        <span className={cx('truncate', state === 'current' ? 'font-semibold text-fg' : state === 'incomplete' ? 'text-fg-muted' : 'text-fg')}>
          {label}
          <span className="sr-only">
            , {WORD[state]}
            {description ? `, ${description}` : ''}
          </span>
        </span>
        {secondaryLabel && <span className="truncate text-caption text-fg-muted">{secondaryLabel}</span>}
      </span>
    </>
  )
  const cls = 'flex min-h-control w-full min-w-0 items-center gap-items rounded-control px-items text-start text-body'
  return (
    <li
      data-slot="progress-step"
      data-state={state}
      aria-current={state === 'current' ? 'step' : undefined}
      aria-disabled={disabled || undefined}
      className={cx('min-w-0 border-line', state === 'invalid' ? 'border-danger' : state === 'incomplete' ? 'border-line' : 'border-fg', className)}
    >
      {onClick && !disabled && state !== 'current' ? (
        <button type="button" onClick={onClick} className={cx(cls, 'cursor-pointer hover:bg-hover', FOCUS)}>
          {body}
        </button>
      ) : (
        <span className={cls}>{body}</span>
      )}
    </li>
  )
}

/** Путь из шагов. */
export function ProgressIndicator({ children, currentIndex = 0, onChange, spaceEqually = false, vertical = false, className, ...rest }: ProgressIndicatorProps) {
  const steps = Children.toArray(children).filter((c): c is ReactElement<ProgressStepProps> => isValidElement(c))
  rule(steps.length >= 3, 'ProgressIndicator: шагов меньше трёх — это не путь (Carbon: шаги — от трёх), хватит одной формы')
  rule(currentIndex >= 0 && currentIndex < steps.length, `ProgressIndicator: текущий шаг ${currentIndex} вне списка из ${steps.length}`)
  const now = Math.min(Math.max(currentIndex, 0), steps.length - 1)
  const placed = steps.map((step, index) =>
    cloneElement(step, {
      key: step.key ?? index,
      index,
      current: index === now,
      complete: step.props.complete ?? index < now,
      onClick: onChange ? () => onChange(index) : step.props.onClick,
      className: cx(vertical ? 'border-l-2' : 'border-t-2', spaceEqually && !vertical && 'flex-1 basis-0', step.props.className),
    }),
  )
  const current = steps[now]?.props
  return (
    <div data-slot="progress-indicator" className={cx('min-w-0', className)}>
      {!vertical && (
        <p data-slot="progress-compact" aria-hidden="true" className="m-0 flex min-w-0 flex-wrap items-center gap-x-items text-body text-fg md:hidden">
          <span className="text-fg-muted">
            Шаг {now + 1} из {steps.length}
            <span> · </span>
          </span>
          <span className="font-semibold">{current?.label}</span>
          {current?.invalid && <span className="text-danger-fg"> — ошибка</span>}
        </p>
      )}
      <ul className={cx('m-0 list-none gap-items p-0', vertical ? 'flex flex-col' : 'max-md:sr-only flex')} {...rest}>
        {placed}
      </ul>
    </div>
  )
}
