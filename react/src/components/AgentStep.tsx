/**
 * Шаг агента в ленте (чат orbit): одна строка — что делает, над чем и как идёт; нажатие раскрывает результат.
 * Ответ модели — `Prose`, шаг — эта строка: глаз отличает речь от работы.
 * - Ход — словарь хода: `running` (дуга, «идёт»), `done` (без знака, слово для читалки), `error` (знак «опасно»,
 *   «ошибка» видно всегда, раскрыто сразу).
 * - `variant="tool"` — строка инструмента (цель моноширинно); `agent` — фоновый агент: поверхность с меткой, под
 *   строкой — последний шаг (`progress`); `shell` — команда человека: поверхность с меткой «инфо», `$` перед командой,
 *   вывод раскрыт и растёт; «Стоп» — рядом со строкой (`stop`). `note` — пометка под строкой.
 * - Раскрытие — 0,6 с без прыжка; свёрнутое не берёт фокус (`inert`). Без `children` строка не нажимается.
 */
import type { ReactNode } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Expand, useDisclosure } from '../lib/disclosure'
import { PROGRESS_WORD, type Progress } from '../lib/vocab'
import { Button } from './Button'
import { Icon } from './Icon'
import { InlineLoading } from './InlineLoading'
import { Surface } from './Surface'

export interface AgentStepProps {
  /** Что делает: «Read», «Bash», «Агент · Explore». */
  tool: ReactNode
  /** Над чем: путь, команда, задача агента. */
  target?: ReactNode
  progress: Exclude<Progress, 'idle'>
  /** Итог справа: «120 строк», «код 0 · 3,2 с». */
  summary?: ReactNode
  /** Последний шаг фонового агента — видно и свёрнутым. */
  last?: ReactNode
  /** Результат или шаги агента — при раскрытии. */
  children?: ReactNode
  variant?: 'tool' | 'agent' | 'shell'
  /** Пометка под строкой: «песочница: только чтение». */
  note?: ReactNode
  /** «Стоп» рядом со строкой, пока идёт. */
  stop?: { onStop: () => void; label?: ReactNode }
  className?: string
}

export function AgentStep({ tool, target, progress, summary, last, note, stop, children, variant = 'tool', className }: AgentStepProps) {
  const fold = useDisclosure(progress === 'error' || variant === 'shell')
  const can = children !== undefined && children !== null
  const head = (
    <>
      <span className="inline-flex size-icon shrink-0 items-center justify-center">
        {progress === 'running' && <InlineLoading progress="running" label={PROGRESS_WORD.running} hideLabel />}
        {progress === 'error' && <Icon tone="опасно" />}
        {progress === 'done' && can && <Icon name="chevron-right" className={cx('text-fg-muted transition-transform duration-move ease-standard', fold.open && 'rotate-90')} />}
      </span>
      <span className="shrink-0 font-semibold text-fg">{tool}</span>
      {target && (
        <span className={cx('min-w-0 truncate text-fg-muted', variant !== 'agent' && 'font-mono text-code')}>
          {variant === 'shell' && <span aria-hidden="true">$ </span>}
          {target}
        </span>
      )}
      <span className={cx('ml-auto shrink-0 pl-items', progress === 'error' ? 'text-danger-fg' : 'text-fg-muted')}>
        {progress === 'done' ? <span className="sr-only">{PROGRESS_WORD.done}</span> : PROGRESS_WORD[progress]}
        {summary && (
          <>
            {progress === 'done' ? '' : ' · '}
            {summary}
          </>
        )}
      </span>
    </>
  )
  const rowCls = 'flex min-h-dense min-w-0 flex-1 items-center gap-items rounded-control px-items text-start text-body'
  const inner = (
    <>
      <div className="flex min-w-0 items-center">
        {can ? (
          <button type="button" {...fold.trigger} className={cx(rowCls, 'cursor-pointer hover:bg-hover', FOCUS)}>
            {head}
          </button>
        ) : (
          <div className={rowCls}>{head}</div>
        )}
        {stop && progress === 'running' && (
          <Button variant="ghost" dense onClick={stop.onStop} data-part="stop" className="shrink-0">
            {stop.label ?? 'Стоп'}
          </Button>
        )}
      </div>
      {note && <p className="m-0 truncate pr-items pl-sections text-caption text-fg-muted">{note}</p>}
      {last && <p className="m-0 truncate pr-items pl-sections text-caption text-fg-muted">{last}</p>}
      {can && (
        <Expand id={fold.id} open={fold.open}>
          <div className="flex min-w-0 flex-col gap-tight pt-tight pb-items pl-sections">{children}</div>
        </Expand>
      )}
    </>
  )
  if (variant === 'tool')
    return (
      <div data-slot="agent-step" data-progress={progress} data-variant={variant} className={cx('flex min-w-0 flex-col', className)}>
        {inner}
      </div>
    )
  return (
    <Surface mark={variant === 'shell' ? 'инфо' : 'нейтрально'} data-slot="agent-step" data-progress={progress} data-variant={variant} flush className={cx('gap-tight p-items', className)}>
      {inner}
    </Surface>
  )
}
