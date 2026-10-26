/**
 * Страница паттерна в Storybook: правило из `patterns/<имя>.md` — перевод паттерна Carbon (один источник — его же читают
 * люди и агенты в пакете) — и под ним живой пример из компонентов ДС. Разметка — узкое подмножество Markdown: `#`, `##`,
 * `###`, абзац, `- `, `1. `, таблица `| … |`, **жирный**, `код`; другое тест паттернов не пустит.
 */
import type { ReactNode } from 'react'
import { Prose } from '../components/Prose'

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  )
}

/** Правило без заголовка: разделы, абзацы, списки. */
function blocks(md: string): ReactNode[] {
  const out: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let para: string[] = []
  let rows: string[][] = []
  const cells = (l: string) => l.slice(1, -1).split('|').map((c) => c.trim())
  const flush = () => {
    if (para.length) out.push(<p key={out.length}>{inline(para.join(' '))}</p>)
    if (list) {
      const items = list.items.map((t, i) => <li key={i}>{inline(t)}</li>)
      out.push(list.ordered ? <ol key={out.length}>{items}</ol> : <ul key={out.length}>{items}</ul>)
    }
    if (rows.length) {
      const [head, ...body] = rows
      out.push(
        <table key={out.length}>
          <thead>
            <tr>{head.map((c, i) => (c ? <th key={i}>{inline(c)}</th> : <td key={i} />))}</tr>
          </thead>
          <tbody>
            {body.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      )
    }
    para = []
    list = null
    rows = []
  }
  for (const line of md.split('\n')) {
    const item = /^(-|\d+\.) (.*)$/.exec(line)
    if (line.startsWith('# ')) continue
    if (line.startsWith('|')) {
      if (para.length || list) flush()
      if (!/^\|[\s|:-]+\|$/.test(line)) rows.push(cells(line))
    } else if (line.startsWith('## ') || line.startsWith('### ')) {
      flush()
      out.push(line.startsWith('## ') ? <h2 key={out.length}>{line.slice(3)}</h2> : <h3 key={out.length}>{line.slice(4)}</h3>)
    } else if (item) {
      const ordered = item[1] !== '-'
      if (para.length || (list && list.ordered !== ordered)) flush()
      list ??= { ordered, items: [] }
      list.items.push(item[2])
    } else if (line.trim() === '') flush()
    else {
      if (list) flush()
      para.push(line)
    }
  }
  flush()
  return out
}

/** Название паттерна — первая строка `# …`. */
export const patternTitle = (md: string) => /^# (.+)$/m.exec(md)?.[1] ?? ''

/** `page` — пример сам страница (`Page` со своей областью `main`): его не вкладывают в другую область. */
export function PatternDoc({ md, page = false, children }: { md: string; page?: boolean; children: ReactNode }) {
  const box = 'min-w-0 rounded-surface border border-line bg-canvas'
  return (
    <div className="flex w-full flex-col gap-items px-blocks py-groups md:px-sections">
      <section aria-label="Правило" className="flex flex-col gap-blocks pb-groups">
        <h1 className="m-0 text-page text-fg">{patternTitle(md)}</h1>
        <Prose>{blocks(md)}</Prose>
        <h2 className="m-0 pt-groups text-title text-fg">Пример</h2>
      </section>
      {page ? (
        <div className={box}>{children}</div>
      ) : (
        <section aria-label="Пример" className={box}>
          {children}
        </section>
      )}
    </div>
  )
}
