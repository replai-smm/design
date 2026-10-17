/**
 * Блок кода: утопленная поверхность, моноширинный текст как есть, подпись (язык или путь) и «Копировать».
 * Длинная строка не переносится — блок прокручивается вбок внутри себя; прокрутка берёт фокус. `maxLines` — выше
 * блок не растёт. Скопировано — слово «скопировано» на миг, для читалки тоже.
 */
import { useEffect, useState, type CSSProperties } from 'react'
import { FOCUS } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { Surface } from './Surface'

export interface CodeBlockProps {
  code: string
  /** Подпись над кодом: язык («ts», «bash») или путь файла. */
  label?: string
  /** Кнопка «Копировать» (по умолчанию да). */
  copy?: boolean
  /** Высота не больше стольких строк (12 по умолчанию; 0 — без предела). */
  maxLines?: number
  className?: string
}

export function CodeBlock({ code, label, copy = true, maxLines = 12, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])
  return (
    <Surface as="figure" inset flush data-slot="code-block" className={cx('m-0', className)}>
      {(label || copy) && (
        <figcaption data-part="title" className="flex min-h-dense items-center justify-between gap-items border-b border-line pl-compact text-caption text-fg-muted">
          <span className="truncate font-mono">{label}</span>
          {copy && (
            <Button variant="ghost" dense onClick={() => void navigator.clipboard?.writeText(code).then(() => setCopied(true))} aria-live="polite" data-slot="code-copy">
              {copied ? 'скопировано' : 'Копировать'}
            </Button>
          )}
        </figcaption>
      )}
      <pre
        tabIndex={0}
        aria-label={label ? `Код: ${label}` : 'Код'}
        data-part="body"
        data-lines={maxLines || undefined}
        style={maxLines ? ({ '--lines': maxLines } as CSSProperties) : undefined}
        className={cx('ds-code m-0 overflow-auto px-compact py-items font-mono text-code text-fg', FOCUS)}
      >
        <code>{code}</code>
      </pre>
    </Surface>
  )
}
