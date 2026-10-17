/**
 * Шаг агента в переписке (Claude Code: вызов инструмента и фоновый агент): одна строка — что делает, над чем и как
 * идёт; нажатие раскрывает результат. Ответ модели — `Prose`, шаг — эта строка: глаз отличает речь от работы.
 * - Строка: инструмент (Read, Bash, Агент), цель (у инструмента — моноширинно: путь, команда; у агента — задача словами),
 *   итог справа («120 строк», «код 0»).
 * - Состояние — формой знака и словом: идёт (дуга, «идёт»), готово (без знака, слово для читалки), ошибка (крест,
 *   «ошибка» видно всегда). Ошибка раскрыта сразу — причину не прячем.
 * - `variant="agent"` — фоновый агент: рамка слева, под строкой — последний шаг (`progress`), внутри — его шаги.
 * - `variant="shell"` — команда человека (`!npm test` в поле), не шаг агента: рамка слева цвета действия, перед командой
 *   `$`, вывод раскрыт сразу и растёт по мере прихода. Пока идёт — рядом со строкой «Стоп» (`stop`; не внутри строки:
 *   кнопка в кнопке нельзя). `note` — пометка под строкой («песочница: только чтение»).
 * - Раскрытие — 0,6 с без прыжка; свёрнутое не берёт фокус (`inert`). Без `children` строка не нажимается.
 */
import { useId, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Spinner } from './InlineLoading'
import { ToneIcon } from './StatusBadge'

export type AgentStepState = 'running' | 'done' | 'error'

export interface AgentStepProps {
  /** Что делает: «Read», «Bash», «Агент · Explore». */
  tool: ReactNode
  /** Над чем: путь, команда, задача агента. */
  target?: ReactNode
  state: AgentStepState
  /** Итог справа: «120 строк», «код 0 · 3,2 с», «4 шага». */
  summary?: ReactNode
  /** Последний шаг фонового агента — строкой под заголовком, видно и свёрнутым. */
  progress?: ReactNode
  /** Результат или шаги агента — при раскрытии. */
  children?: ReactNode
  variant?: 'tool' | 'agent' | 'shell'
  /** Пометка под строкой: «песочница: только чтение». */
  note?: ReactNode
  /** «Стоп» рядом со строкой, пока `state="running"`. */
  stop?: { onStop: () => void; label?: ReactNode }
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const WORD: Record<AgentStepState, string> = { running: 'идёт', done: 'готово', error: 'ошибка' }

export function AgentStep({ tool, target, state, summary, progress, note, stop, children, variant = 'tool', open: openProp, defaultOpen, onOpenChange, className }: AgentStepProps) {
  const [own, setOwn] = useState(defaultOpen ?? (state === 'error' || variant === 'shell'))
  const open = openProp ?? own
  const id = useId()
  const can = children !== undefined && children !== null
  const toggle = () => {
    setOwn(!open)
    onOpenChange?.(!open)
  }
  const head = (
    <>
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {state === 'running' && <Spinner />}
        {state === 'error' && <ToneIcon tone="error" className="text-status-error" />}
        {state === 'done' && can && (
          <svg viewBox="0 0 16 16" aria-hidden="true" className={cx('size-4 text-icon-secondary transition-transform duration-move ease-move', open ? 'rotate-90' : '')}>
            <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </span>
      <span className="shrink-0 font-semibold text-text-primary">{tool}</span>
      {target && (
        <span className={cx('min-w-0 truncate text-text-secondary', variant !== 'agent' && 'font-mono text-code-01')}>
          {variant === 'shell' && <span aria-hidden="true">$ </span>}
          {target}
        </span>
      )}
      <span className={cx('ml-auto shrink-0 pl-2', state === 'error' ? 'text-text-error' : 'text-text-secondary')}>
        {state === 'done' ? <span className="sr-only">{WORD.done}</span> : WORD[state]}
        {summary && <>{state === 'done' ? '' : ' · '}{summary}</>}
      </span>
    </>
  )
  const rowCls = 'flex min-h-8 min-w-0 flex-1 items-center gap-2 px-2 text-start text-body-compact-01'
  return (
    <div
      data-slot="agent-step"
      data-state={state}
      data-variant={variant}
      className={cx(
        'flex min-w-0 flex-col',
        variant !== 'tool' && 'border-l-2 bg-layer-01 py-1',
        variant === 'agent' && 'border-border-subtle-01',
        variant === 'shell' && 'border-border-interactive',
        className,
      )}
    >
      <div className="flex min-w-0 items-center">
        {can ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-r`}
            onClick={toggle}
            className={cx(rowCls, 'cursor-pointer hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2')}
          >
            {head}
          </button>
        ) : (
          <div className={rowCls}>{head}</div>
        )}
        {stop && state === 'running' && (
          <Button variant="ghost" size="sm" onClick={stop.onStop} data-slot="step-stop" className="mr-1 shrink-0">
            {stop.label ?? 'Стоп'}
          </Button>
        )}
      </div>
      {note && <p className="m-0 truncate pr-2 pl-8 text-label-01 text-text-secondary">{note}</p>}
      {progress && <p className="m-0 truncate pr-2 pl-8 text-label-01 text-text-secondary">{progress}</p>}
      {can && (
        <div id={`${id}-r`} className="ds-expand" data-open={open} inert={!open}>
          <div>
            <div className={cx('flex min-w-0 flex-col gap-1 pt-1 pb-2', variant === 'tool' ? 'pl-8' : 'pr-2 pl-4')}>{children}</div>
          </div>
        </div>
      )}
    </div>
  )
}
