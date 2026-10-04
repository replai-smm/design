/**
 * Шаги процесса (опись DF §11.3 п. 30; Carbon ProgressIndicator): где человек в пути из нескольких шагов и сколько
 * осталось — «Текст · Куда · Предпросмотр · Итог» в DF «Постинг» (§10.5 must 1).
 * - Шаг: пройден (галочка), текущий (`aria-current="step"`), впереди (пустой круг), ошибка (знак тона «опасно»).
 *   Состояние — словом для читалки и формой значка, не только цветом.
 * - `onStepClick` — вернуться к пройденному шагу кнопкой; шаги впереди не нажимаются (их не перескочить).
 * - Телефон (< 768): одной строкой «Шаг 2 из 4 · Куда» — полоса из четырёх подписей не помещается.
 * Шаги — не вкладки: содержимое шага рисует продукт; компонент только показывает путь.
 */
import type { ReactNode } from 'react'
import { cx, rule } from '../lib/cx'
import { ToneIcon } from './StatusBadge'

export type StepState = 'complete' | 'current' | 'incomplete' | 'error'

export interface StepsProps {
  /** Подписи шагов по порядку: ['Текст', 'Куда', 'Предпросмотр', 'Итог']. */
  steps: string[]
  /** Текущий шаг (с нуля). */
  current: number
  /** Шаг с ошибкой (итог с неудачами) — знак «опасно» вместо галочки. */
  errorAt?: number
  /** Вторая строка под подписью шага (необязательно): «12 сообществ», «сразу». */
  details?: Partial<Record<number, ReactNode>>
  /** Вернуться к пройденному шагу. Без него шаги — просто путь. */
  onStepClick?: (index: number) => void
  /** Подпись для читалки: «Шаги публикации». */
  label: string
  className?: string
}

const WORD: Record<StepState, string> = { complete: 'пройден', current: 'текущий', incomplete: 'впереди', error: 'ошибка' }

export function stepState(i: number, current: number, errorAt?: number): StepState {
  if (errorAt === i) return 'error'
  if (i < current) return 'complete'
  if (i === current) return 'current'
  return 'incomplete'
}

function Mark({ state }: { state: StepState }) {
  if (state === 'error') return <ToneIcon tone="error" className="text-status-error" />
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4 shrink-0 text-icon-primary" data-step-mark={state}>
      {state === 'complete' && (
        <>
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4.9 8.2l2.1 2.1 4.1-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {state === 'current' && (
        <>
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="3.5" fill="currentColor" />
        </>
      )}
      {state === 'incomplete' && <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />}
    </svg>
  )
}

export function Steps({ steps, current, errorAt, details, onStepClick, label, className }: StepsProps) {
  rule(steps.length >= 2, 'Steps: шагов меньше двух — это не путь, подпись хватит словами')
  rule(current >= 0 && current < steps.length, `Steps: текущий шаг ${current} вне списка из ${steps.length}`)
  const now = Math.min(Math.max(current, 0), steps.length - 1)
  return (
    <nav data-slot="steps" aria-label={label} className={cx('min-w-0', className)}>
      <p data-slot="steps-compact" className="m-0 text-body-compact-01 text-text-primary md:hidden">
        <span className="text-text-secondary">
          Шаг {now + 1} из {steps.length}
          <span aria-hidden="true"> · </span>
        </span>
        <span className="font-semibold">{steps[now]}</span>
        {errorAt === now && <span className="text-status-error"> — ошибка</span>}
      </p>
      <ol className="m-0 hidden list-none gap-px p-0 md:flex">
        {steps.map((s, i) => {
          const st = stepState(i, now, errorAt)
          const clickable = Boolean(onStepClick) && i < now
          const body = (
            <>
              <Mark state={st} />
              <span className="flex min-w-0 flex-col">
                <span className={cx('truncate', st === 'current' ? 'font-semibold text-text-primary' : st === 'incomplete' ? 'text-text-secondary' : 'text-text-primary')}>
                  {s}
                  <span className="sr-only">, {WORD[st]}</span>
                </span>
                {details?.[i] !== undefined && <span className="truncate text-helper-text-01 text-text-helper">{details[i]}</span>}
              </span>
            </>
          )
          return (
            <li
              key={i}
              data-slot="step"
              data-state={st}
              aria-current={st === 'current' ? 'step' : undefined}
              className={cx(
                'min-w-0 flex-1 border-t-2',
                st === 'error' ? 'border-status-error' : st === 'incomplete' ? 'border-border-subtle-01' : 'border-border-interactive',
              )}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick!(i)}
                  className="flex min-h-10 w-full min-w-0 cursor-pointer items-start gap-2 pt-2 pr-4 text-start text-body-compact-01 hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2"
                >
                  {body}
                </button>
              ) : (
                <span className="flex min-h-10 min-w-0 items-start gap-2 pt-2 pr-4 text-body-compact-01">{body}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
