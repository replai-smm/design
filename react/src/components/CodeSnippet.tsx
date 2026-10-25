/**
 * Код как есть (Carbon: CodeSnippet): утопленная плитка, моноширинный текст, кнопка-значок «Копировать».
 * - `type="single"` (по умолчанию) — одна строка, длинная прокручивается вбок внутри;
 * - `type="multi"` — блок: длинная строка не переносится (`wrapText` — переносится), выше `maxCollapsedNumberOfRows`
 *   строк (15) свёрнут — «Показать ещё» раскрывает до `maxExpandedNumberOfRows` (0 — без предела).
 * Поле кода берёт фокус (`role="textbox"`, только чтение), его имя — `aria-label`. Скопировано — слово `feedback` на
 * `feedbackTimeout` мс в подсказке и для читалки.
 */
import { useEffect, useState, type CSSProperties, type HTMLAttributes, type MouseEvent } from 'react'
import { FOCUS, SUNKEN } from '../lib/anatomy'
import { cx } from '../lib/cx'
import { ChevronDown, Copy } from '../lib/icons.gen'
import { chevron } from '../lib/disclosure'
import { Button, IconButton } from './Button'

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  /** Код. */
  children?: string
  type?: 'single' | 'multi'
  /** Имя поля кода для читалки. */
  'aria-label'?: string
  /** Подсказка кнопки «Копировать». */
  copyButtonDescription?: string
  /** Что копировать, если не сам код. */
  copyText?: string
  disabled?: boolean
  /** Слово «скопировано». */
  feedback?: string
  feedbackTimeout?: number
  hideCopyButton?: boolean
  /** Свёрнутый блок — не выше стольких строк (только `multi`; 0 — не сворачивать). */
  maxCollapsedNumberOfRows?: number
  /** Раскрытый блок — не выше стольких строк (0 — без предела). */
  maxExpandedNumberOfRows?: number
  showMoreText?: string
  showLessText?: string
  /** Переносить длинные строки (только `multi`). */
  wrapText?: boolean
  /** Нажатие «Копировать». */
  onClick?(event: MouseEvent<HTMLButtonElement>): void
  className?: string
}

export function CodeSnippet({
  children = '',
  type = 'single',
  'aria-label': label = 'Код',
  copyButtonDescription = 'Копировать',
  copyText,
  disabled = false,
  feedback = 'Скопировано',
  feedbackTimeout = 2000,
  hideCopyButton = false,
  maxCollapsedNumberOfRows = 15,
  maxExpandedNumberOfRows = 0,
  showMoreText = 'Показать ещё',
  showLessText = 'Свернуть',
  wrapText = false,
  onClick,
  className,
  ...rest
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), feedbackTimeout)
    return () => clearTimeout(t)
  }, [copied, feedbackTimeout])
  const multi = type === 'multi'
  const rows = children.split('\n').length
  const foldable = multi && maxCollapsedNumberOfRows > 0 && rows > maxCollapsedNumberOfRows && (maxExpandedNumberOfRows <= 0 || maxExpandedNumberOfRows > maxCollapsedNumberOfRows)
  const lines = !multi ? 0 : expanded ? maxExpandedNumberOfRows : maxCollapsedNumberOfRows
  const copy = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    void navigator.clipboard?.writeText(copyText ?? children).then(() => setCopied(true))
  }
  return (
    <div {...rest} data-slot="code-snippet" data-type={type} className={cx('relative flex min-w-0', multi ? 'flex-col' : 'items-center', SUNKEN, disabled && 'text-fg-disabled', className)}>
      <pre
        role="textbox"
        aria-readonly="true"
        aria-multiline={multi || undefined}
        aria-label={label}
        tabIndex={disabled ? undefined : 0}
        data-part="body"
        data-lines={lines || undefined}
        style={lines ? ({ '--lines': lines } as CSSProperties) : undefined}
        className={cx(
          'ds-code relative m-0 min-w-0 flex-1 overflow-auto px-compact py-items font-mono text-code',
          multi && !hideCopyButton && 'pr-sections',
          wrapText && multi ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
          FOCUS,
        )}
      >
        <code>{children}</code>
      </pre>
      {!hideCopyButton && (
        <div className={cx(multi && 'absolute top-tight right-tight')}>
          <IconButton kind="ghost" size="sm" label={copied ? feedback : copyButtonDescription} align="bottom" disabled={disabled} onClick={copy} data-part="copy">
            <Copy />
          </IconButton>
        </div>
      )}
      {foldable && (
        <div className="flex justify-end border-t border-line px-tight py-tight">
          <Button kind="ghost" size="sm" disabled={disabled} aria-expanded={expanded} onClick={() => setExpanded((x) => !x)} data-part="more">
            {expanded ? showLessText : showMoreText}
            <ChevronDown aria-hidden="true" className={cx('size-icon', chevron(expanded))} />
          </Button>
        </div>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? feedback : ''}
      </span>
    </div>
  )
}
