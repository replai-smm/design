/**
 * Образцы ДС-React для страницы образцов (dist/showcase.html): истории, отрисованные в статичный HTML, и
 * скомпилированный CSS. Файл react/dist/showcase-components.html — вывод, руками не правят:
 *   npm run showcase   — записать, потом npm run build
 *   npm test           — сверить: отстал — красный
 * Страница образцов вставляет его в рамку iframe: вид телефона (390) и ноутбука (1280) — переключателем ширины рамки.
 */
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { stories, type Entry } from './stories'

const root = resolve(import.meta.dirname, '..', '..')
const OUT = resolve(root, 'dist', 'showcase-components.html')

/** Что показать: уровень → истории [файл, имя, рамка]. Рамка `fixed` — для окна и всплывашки (position: fixed). */
const SECTIONS: Array<{ title: string; note: string; items: Array<[string, string, ('fixed' | 'toast')?]> }> = [
  {
    title: 'Элементы',
    note: 'Главная — инверсия, одна на поверхность; тихие — рамкой или без; опасное — тоном. Метка — слово в цвете, индикатор — знак своей формы и слово.',
    items: [
      ['Button.stories.tsx', 'Виды'],
      ['Tag.stories.tsx', 'Обычное'],
      ['IconIndicator.stories.tsx', 'Обычное'],
      ['CountBadge.stories.tsx', 'Обычное'],
      ['ProgressIndicator.stories.tsx', 'Обычное'],
      ['Meter.stories.tsx', 'Обычное'],
      ['InlineLoading.stories.tsx', 'Обычное'],
    ],
  },
  {
    title: 'Поля',
    note: 'Подпись над полем, подсказка под ним, ошибка — знаком и словом вместо подсказки. Высота 48 на телефоне, 40 на ноутбуке, плотное — 32.',
    items: [
      ['TextField.stories.tsx', 'Обычное'],
      ['TextField.stories.tsx', 'Ошибка'],
      ['Checkbox.stories.tsx', 'Обычное'],
    ],
  },
  {
    title: 'Поверхности',
    note: 'Одна поверхность: слой, тихая рамка, угол 6, поля 16, заголовок одной роли; метка слева — знак тона одной ширины.',
    items: [
      ['Surface.stories.tsx', 'Обычное'],
      ['Card.stories.tsx', 'Сетка'],
      ['StatTile.stories.tsx', 'Обычное'],
      ['Notification.stories.tsx', 'Обычное'],
      ['StateView.stories.tsx', 'Ошибка'],
      ['CodeBlock.stories.tsx', 'Обычное'],
    ],
  },
  {
    title: 'Коллекции',
    note: 'Строки в порядке данных, состояние — знаком и словом; выбранная строка — роль «выбрано»; сортировка — выбор человека.',
    items: [
      ['DataTable.stories.tsx', 'Обычное'],
      ['List.stories.tsx', 'Выбрана'],
    ],
  },
  {
    title: 'Слои',
    note: 'Окно — по центру на ноутбуке, шторкой снизу на телефоне; «готово» — всплывашкой.',
    items: [
      ['Dialog.stories.tsx', 'Обычное', 'fixed'],
      ['Toast.stories.tsx', 'Обычное', 'toast'],
    ],
  },
  {
    title: 'Составные',
    note: 'Вкладки и фильтры — один ряд сегментов. Правила сборки страниц — полка «Паттерны» в Storybook и patterns/*.md.',
    items: [
      ['Tabs.stories.tsx', 'Обычное'],
      ['FilterBar.stories.tsx', 'Обычное'],
    ],
  },
]

/** Рамки образцов — только роли и шкалы. */
const DEMO_CSS = `
body{margin:0;background:var(--ds-canvas);color:var(--ds-fg);font-family:var(--ds-font-sans)}
.dsr{display:flex;flex-direction:column;gap:var(--ds-space-sections);padding:var(--ds-space-blocks)}
.dsr-sec{display:flex;flex-direction:column;gap:var(--ds-space-compact)}
.dsr-sec>h2{margin:0;font-size:var(--ds-text-title-size);line-height:var(--ds-text-title-line);font-weight:400}
.dsr-sec>p{margin:0;color:var(--ds-fg-muted);font-size:var(--ds-text-body-size);line-height:var(--ds-text-body-line);max-width:72ch}
.dsr-item{display:flex;flex-direction:column;gap:var(--ds-space-tight)}
.dsr-item>small{color:var(--ds-fg-muted);font-size:var(--ds-text-caption-size)}
.dsr-box{border:1px dashed var(--ds-line);padding:var(--ds-space-blocks);background:var(--ds-canvas);min-width:0;overflow-x:auto}
.dsr-box[data-frame=fixed],.dsr-box[data-frame=toast]{position:relative;transform:translateZ(0);overflow:hidden;padding:0}
.dsr-box[data-frame=fixed]{height:30rem}
.dsr-box[data-frame=toast]{height:12rem}
`

async function renderStory(e: Entry, n: number, frame?: string): Promise<string> {
  const box = document.createElement('div')
  box.className = 'dsr-box'
  if (frame) box.dataset.frame = frame
  document.body.appendChild(box)
  const rootEl = createRoot(box, { identifierPrefix: `s${n}-` })
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => rootEl.render(<e.Story />))
  // порталы (панель, оверлей) — внутрь рамки: у рамки transform, поэтому position: fixed держится в ней
  // (копии: настоящие узлы портала React уберёт сам при размонтировании)
  const copy = box.cloneNode(true) as HTMLElement
  for (const el of [...document.body.children]) if (el !== box) copy.appendChild(el.cloneNode(true))
  const html = copy.outerHTML
    .replace(/ data-aria-hidden="true"/g, '')
    .replace(/ aria-hidden="true"(?=[^>]*data-slot="(?:page|stack|inline)")/g, '')
  await act(async () => rootEl.unmount())
  box.remove()
  document.body.innerHTML = ''
  return html
}

async function fragment(): Promise<string> {
  const all = stories('light')
  const find = (file: string, name: string) => {
    const e = all.find((x) => x.file === file && x.name === name)
    if (!e) throw new Error(`нет истории ${file} / ${name}`)
    return e
  }
  let n = 0
  const parts: string[] = []
  for (const s of SECTIONS) {
    const items: string[] = []
    for (const [file, name, frame] of s.items) {
      const e = find(file, name)
      items.push(`<div class="dsr-item"><small>${e.title.replace(/^[^/]+\//, '')} · ${name}</small>${await renderStory(e, n++, frame)}</div>`)
    }
    parts.push(`<section class="dsr-sec"><h2>${s.title}</h2><p>${s.note}</p>${items.join('')}</section>`)
  }
  const css = execFileSync(process.execPath, [resolve(dirname(createRequire(import.meta.url).resolve('@tailwindcss/cli/package.json')), 'dist/index.mjs'), '-i', resolve(root, 'src/showcase.css'), '--minify'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  return (
    `<!-- Сгенерировано react/src/__tests__/showcase.test.tsx из историй ДС-React. Руками не править: npm run showcase. -->\n` +
    `<style>${css.trim()}\n${DEMO_CSS.trim()}</style>\n<div class="dsr">${parts.join('\n')}</div>\n`
  )
}

describe('образцы ДС-React для showcase.html', () => {
  it('dist/showcase-components.html совпадает с историями (записать: npm run showcase)', { timeout: 120_000 }, async () => {
    const html = await fragment()
    expect(html).not.toMatch(/(?:src|href)=["']https?:/)
    if (process.env.SHOWCASE_WRITE) {
      mkdirSync(resolve(root, 'dist'), { recursive: true })
      writeFileSync(OUT, html)
    }
    expect(existsSync(OUT), 'нет dist/showcase-components.html — npm run showcase').toBe(true)
    expect(readFileSync(OUT, 'utf8') === html, 'dist/showcase-components.html отстал — npm run showcase, потом npm run build').toBe(true)
  })

  it('не зависит от пояса: в UTC и на Кирибати тот же файл', { timeout: 120_000 }, async () => {
    const tz = process.env.TZ
    try {
      const at: string[] = []
      for (const zone of ['UTC', 'Pacific/Kiritimati']) {
        process.env.TZ = zone
        at.push((await fragment()).replace(/r_[0-9a-z]+_/g, 'r_')) // useId считает дальше при втором прогоне — номера не сравниваем
      }
      expect(at[0] === at[1], 'образцы зависят от пояса: дата в историях берётся из местного времени без закрепления').toBe(true)
    } finally {
      if (tz === undefined) delete process.env.TZ
      else process.env.TZ = tz
    }
  })
})
