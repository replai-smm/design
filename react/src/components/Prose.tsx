/**
 * Текст ответа: абзацы, заголовки, списки с маркерами, ссылки, `код`, цитата, таблица — ролью «чтение» (16/24),
 * мера ≤ 72 знаков. Разметку (Markdown → элементы) делает продукт; блок кода — `CodeSnippet`. Готовый кусок HTML —
 * `ProseHtml` (продукт отвечает, что в нём нет чужих тегов). `streaming` — текст ещё набирается: курсор в конце,
 * область «занята» для читалки.
 */
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export interface ProseProps {
  children?: ReactNode
  streaming?: boolean
  className?: string
}

export function Prose({ children, streaming = false, className }: ProseProps) {
  return (
    <div data-slot="prose" data-streaming={streaming || undefined} aria-busy={streaming || undefined} className={cx('ds-prose min-w-0 text-reading text-fg', className)}>
      {children}
    </div>
  )
}

/** Кусок разобранного HTML внутри `Prose`: своей рамки нет, его абзацы — абзацы текста. */
export function ProseHtml({ html }: { html: string }) {
  return <div className="ds-prose-run" dangerouslySetInnerHTML={{ __html: html }} />
}
