/**
 * Блок кода (Carbon CodeSnippet, многострочный): моноширинный текст как есть, подпись (язык или путь) и «Копировать».
 * - Длинная строка не переносится — блок прокручивается вбок внутри себя; прокрутка берёт фокус (клавиатура).
 * - `maxLines` — выше блок не растёт, остальное прокручивается.
 * - Копирование — `navigator.clipboard`; удалось — слово «скопировано» на миг, для читалки — тоже.
 */
import { useEffect, useState } from 'react'
import { cx } from '../lib/cx'
import { Button } from './Button'

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

const LINES = { 6: 'max-h-36', 12: 'max-h-72', 24: 'max-h-144' } as const

export function CodeBlock({ code, label, copy = true, maxLines = 12, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])
  const limit = maxLines === 0 ? undefined : LINES[(maxLines <= 6 ? 6 : maxLines <= 12 ? 12 : 24) as keyof typeof LINES]
  return (
    <figure data-slot="code-block" className={cx('m-0 flex min-w-0 flex-col border border-border-subtle-01 bg-layer-02', className)}>
      {(label || copy) && (
        <figcaption className="flex min-h-8 items-center justify-between gap-2 border-b border-border-subtle-01 pl-4 text-label-01 text-text-secondary">
          <span className="truncate font-mono">{label}</span>
          {copy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigator.clipboard?.writeText(code).then(() => setCopied(true))}
              aria-live="polite"
              data-slot="code-copy"
            >
              {copied ? 'скопировано' : 'Копировать'}
            </Button>
          )}
        </figcaption>
      )}
      <pre tabIndex={0} aria-label={label ? `Код: ${label}` : 'Код'} className={cx('m-0 overflow-auto px-4 py-3 font-mono text-code-01 text-text-primary focus-visible:outline-2 focus-visible:outline-focus focus-visible:-outline-offset-2', limit)}>
        <code>{code}</code>
      </pre>
    </figure>
  )
}
