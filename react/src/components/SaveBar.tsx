/**
 * Панель сохранения — одна на страницу правок, на липкой полосе (`BottomBar`): правки копятся и сохраняются разом.
 * Три состояния: всё сохранено — тихая строка (на телефоне полосы нет: место дороже); есть правки — счётчик,
 * «Отменить» и главная «Сохранить»; не сохранилось — причина знаком и словом, главная — «Повторить», правки не теряются.
 */
import type { ReactNode } from 'react'
import { ActionArea, Button } from './Button'
import { Icon } from './Icon'
import { BottomBar } from './layout'

export interface SaveBarProps {
  /** Сколько правок накоплено. */
  changes: number
  /** Идёт сохранение. */
  saving?: boolean
  /** Почему не сохранилось; есть — главная «Повторить». */
  error?: ReactNode
  onSave: () => void
  onReset: () => void
}

/** «1 несохранённое изменение», «3 несохранённых изменения», «5 несохранённых изменений». */
export function changesText(n: number): string {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return `${n} несохранённое изменение`
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return `${n} несохранённых изменения`
  return `${n} несохранённых изменений`
}

export function SaveBar({ changes, saving, error, onSave, onReset }: SaveBarProps) {
  if (changes === 0 && !error)
    return (
      <BottomBar className="max-md:hidden">
        <p data-slot="save-bar" data-state="saved" className="m-0 text-body text-fg-muted">
          Все изменения сохранены
        </p>
      </BottomBar>
    )
  return (
    <BottomBar>
      {error ? (
        <div data-slot="save-bar" data-state="error" role="alert" className="flex min-w-0 items-start gap-items">
          <Icon tone="опасно" />
          <div className="flex min-w-0 flex-col gap-tight">
            <p className="m-0 text-heading text-danger-fg">Не сохранилось</p>
            <p className="m-0 text-body text-fg-muted">{error}</p>
          </div>
        </div>
      ) : (
        <p data-slot="save-bar" data-state="changed" aria-live="polite" className="m-0 text-heading text-fg">
          {changesText(changes)}
        </p>
      )}
      <ActionArea label="Сохранение" primary={{ label: error ? 'Повторить' : 'Сохранить', onClick: onSave, loading: saving }}>
        <Button variant="ghost" disabled={saving} onClick={onReset}>
          Отменить
        </Button>
      </ActionArea>
    </BottomBar>
  )
}
