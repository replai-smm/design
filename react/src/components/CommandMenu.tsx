/**
 * Меню команд у поля ввода (чат orbit, «/»): команды и скиллы группами, печать сужает список. Не выбор значения формы
 * (`Combobox`): меню всплывает над полем, которое печатает человек, выбранное вставляется в текст или исполняется.
 * - Фокус остаётся в поле: продукт передаёт клавиши в `ref.press(event)` — стрелки ведут, Enter и Tab выбирают,
 *   Esc закрывает (`onClose`). Вернул true — клавиша взята.
 * - Список — `role="listbox"`, активная строка — `aria-selected`, её id — `activeId()` для `aria-activedescendant`.
 * - Совпадение — по началу команды и по началу слова описания. Ничего — «Ничего не найдено».
 */
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useState } from 'react'
import { cx } from '../lib/cx'

export interface CommandItem {
  /** Что вставить: «/review». */
  value: string
  /** Группа: «Команды», «Скиллы». */
  group: string
  description?: string
}

export interface CommandMenuProps {
  items: CommandItem[]
  /** Что напечатано после «/». */
  query: string
  onPick: (item: CommandItem) => void
  onClose?: () => void
  /** Подпись списка для читалки. */
  label: string
  className?: string
}

export interface CommandMenuHandle {
  /** Клавиша из поля ввода. true — взята меню. */
  press: (e: { key: string }) => boolean
  /** id активной строки — для `aria-activedescendant`. */
  activeId: () => string | undefined
}

/** Строки меню по запросу: начало команды или начало слова описания. */
export function matchCommands(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase().replace(/^\//, '')
  if (!q) return items
  return items.filter((i) => i.value.toLowerCase().replace(/^\//, '').startsWith(q) || (i.description ?? '').toLowerCase().split(/\s+/).some((w) => w.startsWith(q)))
}

export const CommandMenu = forwardRef<CommandMenuHandle, CommandMenuProps>(function CommandMenu({ items, query, onPick, onClose, label, className }, ref) {
  const uid = useId()
  const shown = useMemo(() => matchCommands(items, query), [items, query])
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [query])
  const optId = (i: number) => `${uid}-o${i}`
  useEffect(() => {
    document.getElementById(optId(active))?.scrollIntoView?.({ block: 'nearest' })
  }, [active])

  useImperativeHandle(
    ref,
    () => ({
      press: (e) => {
        if (e.key === 'Escape') {
          onClose?.()
          return true
        }
        if (!shown.length) return false
        if (e.key === 'ArrowDown') setActive((a) => (a + 1) % shown.length)
        else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + shown.length) % shown.length)
        else if (e.key === 'Enter' || e.key === 'Tab') onPick(shown[Math.min(active, shown.length - 1)])
        else return false
        return true
      },
      activeId: () => (shown.length ? optId(active) : undefined),
    }),
    [shown, active, onPick, onClose],
  )

  const groups = [...new Set(shown.map((i) => i.group))]
  return (
    <div data-slot="command-menu" className={cx('ds-menu relative flex min-w-0 flex-col overflow-y-auto rounded-surface border border-line bg-surface p-tight shadow-raised', className)}>
      {shown.length === 0 ? (
        <p role="status" className="m-0 px-items py-items text-body text-fg-muted">
          Ничего не найдено
        </p>
      ) : (
        <div role="listbox" aria-label={label}>
          {groups.map((g, gi) => (
            <div key={g} role="group" aria-labelledby={`${uid}-g${gi}`}>
              <p id={`${uid}-g${gi}`} role="presentation" className="m-0 px-items pt-items pb-tight text-caption text-fg-muted">
                {g}
              </p>
              {shown.map((it, i) =>
                it.group !== g ? null : (
                  <div
                    key={it.value}
                    id={optId(i)}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => onPick(it)}
                    className={cx('flex min-h-dense cursor-pointer items-baseline gap-compact rounded-control px-items py-tight text-body', i === active ? 'bg-selected' : 'hover:bg-hover')}
                  >
                    <span className="shrink-0 font-mono text-code text-fg">{it.value}</span>
                    {it.description && <span className="min-w-0 truncate text-fg-muted">{it.description}</span>}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
