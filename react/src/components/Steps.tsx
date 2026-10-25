/**
 * Шаги процесса: где человек в пути из нескольких шагов и сколько осталось («Текст · Куда · Предпросмотр · Итог»).
 * Состояние шага — словарь хода: `done` — пройден, `running` — текущий (`aria-current="step"`), `idle` — впереди,
 * `error` — знак «опасно». Словом для читалки и формой знака, не только цветом. `onStepClick` — назад к пройденному;
 * впереди не нажимается. Телефон — одной строкой «Шаг 2 из 4 · Куда»; `compact` — одной строкой всегда.
 * Шаги — не вкладки: содержимое шага рисует продукт. Шагов — от трёх (Carbon: Progress indicator); два — одна форма.
 */
import { cx, rule } from '../lib/cx'
import { FOCUS } from '../lib/anatomy'
import { PROGRESS_WORD, type Progress } from '../lib/vocab'
import { Icon } from './Icon'

export interface StepsProps {
  /** Подписи шагов по порядку. */
  steps: string[]
  /** Текущий шаг (с нуля). */
  current: number
  /** Шаг с ошибкой — знак «опасно» вместо галочки. */
  errorAt?: number
  /** Вернуться к пройденному шагу. Без него шаги — просто путь. */
  onStepClick?: (index: number) => void
  /** Подпись для читалки: «Шаги публикации». */
  label: string
  /** Одной строкой на любой ширине: знаки шагов в ряд и «Шаг 2 из 4 · Куда». */
  compact?: boolean
  className?: string
}

export function stepProgress(i: number, current: number, errorAt?: number): Progress {
  if (errorAt === i) return 'error'
  if (i < current) return 'done'
  if (i === current) return 'running'
  return 'idle'
}

const WORD: Record<Progress, string> = { ...PROGRESS_WORD, done: 'пройден', running: 'текущий' }

function Mark({ progress }: { progress: Progress }) {
  if (progress === 'error') return <Icon tone="опасно" />
  if (progress === 'done') return <Icon tone="хорошо" />
  return progress === 'running' ? <Icon name="tone-neutral" className="text-fg" /> : <Icon tone="нейтрально" />
}

export function Steps({ steps, current, errorAt, onStepClick, label, compact = false, className }: StepsProps) {
  rule(steps.length >= 3, 'Steps: шагов меньше трёх — это не путь (Carbon: шаги — от трёх), хватит одной формы')
  rule(current >= 0 && current < steps.length, `Steps: текущий шаг ${current} вне списка из ${steps.length}`)
  const now = Math.min(Math.max(current, 0), steps.length - 1)
  return (
    <nav data-slot="steps" aria-label={label} className={cx('min-w-0', className)}>
      <p data-slot="steps-compact" className={cx('m-0 flex min-w-0 flex-wrap items-center gap-x-items text-body text-fg', !compact && 'md:hidden')}>
        {compact && (
          <span aria-hidden="true" className="inline-flex items-center gap-tight">
            {steps.map((_, i) => (
              <Mark key={i} progress={stepProgress(i, now, errorAt)} />
            ))}
          </span>
        )}
        <span className="text-fg-muted">
          Шаг {now + 1} из {steps.length}
          <span aria-hidden="true"> · </span>
        </span>
        <span className="font-semibold">{steps[now]}</span>
        {errorAt === now && <span className="text-danger-fg"> — ошибка</span>}
      </p>
      <ol className={cx('m-0 hidden list-none gap-items p-0', !compact && 'md:flex')}>
        {steps.map((s, i) => {
          const p = stepProgress(i, now, errorAt)
          const clickable = Boolean(onStepClick) && i < now
          const body = (
            <>
              <Mark progress={p} />
              <span className={cx('truncate', p === 'running' ? 'font-semibold text-fg' : p === 'idle' ? 'text-fg-muted' : 'text-fg')}>
                {s}
                <span className="sr-only">, {WORD[p]}</span>
              </span>
            </>
          )
          const cls = 'flex min-h-control w-full min-w-0 items-center gap-items rounded-control px-items text-start text-body'
          return (
            <li
              key={i}
              data-slot="step"
              data-progress={p}
              aria-current={p === 'running' ? 'step' : undefined}
              className={cx('min-w-0 flex-1 border-t-2', p === 'error' ? 'border-danger' : p === 'idle' ? 'border-line' : 'border-fg')}
            >
              {clickable ? (
                <button type="button" onClick={() => onStepClick!(i)} className={cx(cls, 'cursor-pointer hover:bg-hover', FOCUS)}>
                  {body}
                </button>
              ) : (
                <span className={cls}>{body}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
