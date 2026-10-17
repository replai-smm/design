/**
 * Меню команд у поля ввода («/» в чате агента): команды и скиллы группами, печать сужает список.
 * Не выбор значения формы (`Combobox`): меню живёт под полем, которое печатает человек, и выбранное вставляется
 * в текст или исполняется.
 * - Фокус остаётся в поле: продукт передаёт клавиши в `ref.press(event)` — стрелки ведут по списку, Enter и Tab
 *   выбирают, Esc закрывает (`onClose`). Вернул true — клавиша взята, полю её не отдавать.
 * - Список — `role="listbox"`, активная строка — `aria-selected`, её id — `activeId()` для `aria-activedescendant` поля.
 * - Совпадение — по началу команды и по началу слова описания; группы — в порядке данных; длинный список
 *   прокручивается внутри меню. Ничего не нашлось — строка «Ничего не найдено».
 */
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useState } from 'react'
import { cx } from '../lib/cx'

export interface CommandItem {
  /** Что вставить: «/review», «/karta-build». */
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
  return items.filter(
    (i) => i.value.toLowerCase().replace(/^\//, '').startsWith(q) || (i.description ?? '').toLowerCase().split(/\s+/).some((w) => w.startsWith(q)),
  )
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
    <div data-slot="command-menu" className={cx('flex max-h-72 min-w-0 flex-col overflow-y-auto border border-border-subtle-01 bg-layer-02 shadow-raised', className)}>
      {shown.length === 0 ? (
        <p role="status" className="m-0 px-4 py-3 text-body-compact-01 text-text-secondary">
          Ничего не найдено
        </p>
      ) : (
        <div role="listbox" aria-label={label}>
          {groups.map((g, gi) => (
            <div key={g} role="group" aria-labelledby={`${uid}-g${gi}`}>
              <p id={`${uid}-g${gi}`} role="presentation" className="m-0 px-4 pt-2 pb-1 text-label-01 text-text-secondary">
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
                    className={cx('flex min-h-8 cursor-pointer items-baseline gap-3 px-4 py-1 text-body-compact-01', i === active ? 'bg-layer-selected-02' : 'hover:bg-layer-hover-02')}
                  >
                    <span className="shrink-0 font-mono text-code-01 text-text-primary">{it.value}</span>
                    {it.description && <span className="min-w-0 truncate text-text-secondary">{it.description}</span>}
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
