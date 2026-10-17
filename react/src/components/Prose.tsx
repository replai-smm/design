/**
 * Текст ответа (Carbon: типографика длинного текста): абзацы, заголовки, списки, ссылки, `код` в строке, цитата,
 * таблица — наборами текста ДС, без своих размеров. Блок кода внутри — `CodeBlock`, не голый `<pre>`.
 * - Разметку (Markdown → элементы) делает продукт; здесь только облик. Кусок уже готового HTML — `ProseHtml`
 *   (продукт отвечает, что в нём нет чужих тегов), между кусками — компоненты (`CodeBlock`).
 * - `streaming` — текст ещё набирается: в конце мигает курсор; область для читалки «занята» (`aria-busy`).
 * - Мера строки — не шире 80 знаков: длинный ответ читается, а не скользит по экрану.
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
    <div data-slot="prose" data-streaming={streaming || undefined} aria-busy={streaming || undefined} className={cx('ds-prose min-w-0 text-body-01 text-text-primary', className)}>
      {children}
    </div>
  )
}

/** Кусок разобранного HTML внутри `Prose`: своей рамки нет, его абзацы — абзацы текста. */
export function ProseHtml({ html }: { html: string }) {
  return <div className="ds-prose-run" dangerouslySetInnerHTML={{ __html: html }} />
}
