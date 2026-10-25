/**
 * Мастер — путь из нескольких шагов на одной странице: `Steps` сверху, содержимое шага, внизу липкая полоса (`BottomBar`)
 * с «Назад» и одной главной «Далее» (на последнем шаге — «Готово»). Почему дальше нельзя — словом у кнопки, шаг в `Steps`
 * получает знак «опасно». Содержимое шага рисует продукт; мастер держит только путь и низ.
 */
import type { ReactNode } from 'react'
import { ActionArea, Button } from './Button'
import { Icon } from './Icon'
import { BottomBar, Stack } from './layout'
import { Steps } from './Steps'

export interface WizardProps {
  /** Подпись шагов для читалки: «Шаги настройки». */
  label: string
  steps: string[]
  /** Текущий шаг (с нуля). */
  current: number
  /** Назад к прошлому шагу; на первом шаге кнопки нет. */
  onBack: () => void
  onNext: () => void
  /** Слово главной; по умолчанию «Далее», на последнем шаге — «Готово». */
  nextLabel?: string
  /** Идёт переход (проверка, сохранение). */
  busy?: boolean
  /** Почему дальше нельзя. */
  error?: ReactNode
  children?: ReactNode
}

export function Wizard({ label, steps, current, onBack, onNext, nextLabel, busy, error, children }: WizardProps) {
  const last = current === steps.length - 1
  return (
    <Stack gap="groups">
      <Steps label={label} steps={steps} current={current} errorAt={error ? current : undefined} />
      {children}
      <BottomBar>
        {error && (
          <p role="alert" className="m-0 flex min-w-0 items-start gap-items text-body text-danger-fg">
            <Icon tone="опасно" />
            <span className="min-w-0">{error}</span>
          </p>
        )}
        <ActionArea label="Шаги" className="md:ml-auto" primary={{ label: nextLabel ?? (last ? 'Готово' : 'Далее'), onClick: onNext, loading: busy }}>
          {current > 0 && (
            <Button variant="ghost" icon="arrow-left" disabled={busy} onClick={onBack}>
              Назад
            </Button>
          )}
        </ActionArea>
      </BottomBar>
    </Stack>
  )
}
