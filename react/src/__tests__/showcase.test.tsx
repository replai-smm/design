/**
 * Образцы ДС-React для страницы образцов основы (design/dist/showcase.html): истории, отрисованные в статичный HTML,
 * и скомпилированный CSS. Файл dist/showcase-components.html — вывод, руками не правят:
 *   SHOWCASE_WRITE=1 npx vitest run src/__tests__/showcase.test.tsx   — записать (npm run showcase), потом node design/build.mjs
 *   npx vitest run                                                     — сверить: отстал — красный
 * Страница образцов (lib/showcase.mjs) вставляет его в рамку iframe: у рамки своё окно, поэтому вид телефона (390)
 * и ноутбука (1280) включается переключателем ширины так же, как на настоящем экране.
 */
import { describe, it, expect } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { stories, type Entry } from './stories'

const root = resolve(import.meta.dirname, '..', '..')
const OUT = resolve(root, 'dist', 'showcase-components.html')

/** Что показать: раздел → истории [файл, имя, рамка]. Рамка `fixed` — для панели и всплывашки (у них position: fixed). */
const SECTIONS: Array<{ title: string; note: string; items: Array<[string, string, ('fixed' | 'toast')?]> }> = [
  {
    title: 'Кнопки и область действий',
    note: 'Главная кнопка — только в области действий, одна на область и на экран; опасное — не рядом с главной. На телефоне главная страницы — внизу во всю ширину.',
    items: [
      ['Button.stories.tsx', 'Варианты'],
      ['Button.stories.tsx', 'Загрузка'],
    ],
  },
  {
    title: 'Метка статуса',
    note: 'Закрытый список статусов. Палитра продукта — четыре тона; палитра Карты — цвет у рамки, слово обычным текстом.',
    items: [
      ['StatusBadge.stories.tsx', 'Продукт'],
      ['StatusBadge.stories.tsx', 'Карта'],
    ],
  },
  {
    title: 'Страница списка',
    note: 'Шапка, фильтры в адресе, таблица: срочное сверху, «работает» свёрнуто внизу; нажатие на строку открывает панель деталей.',
    items: [
      ['Page.stories.tsx', 'Обычное'],
      ['Page.stories.tsx', 'БедаСистемы'],
      ['Page.stories.tsx', 'Загрузка'],
    ],
  },
  {
    title: 'Таблица: состояния',
    note: 'Каждое состояние — своя история и своя клетка скриншота.',
    items: [
      ['DataTable.stories.tsx', 'Ошибка'],
      ['DataTable.stories.tsx', 'ПервыйЗапуск'],
      ['DataTable.stories.tsx', 'ВсёСделано'],
      ['DataTable.stories.tsx', 'НичегоНеНайдено'],
      ['DataTable.stories.tsx', 'НетДоступа'],
    ],
  },
  {
    title: 'Список',
    note: 'Та же логика, что у таблицы, для строк своего вида (очереди, диалоги). Слова групп — слова продукта.',
    items: [['List.stories.tsx', 'Обычное']],
  },
  { title: 'Фильтры и поиск', note: 'Фильтры живут в адресе страницы: ссылку можно переслать.', items: [['FilterBar.stories.tsx', 'ВыбранФильтр']] },
  { title: 'Вкладки со счётчиками', note: 'Вкладка — вопрос человека; у срочного счётчика — знак тона.', items: [['Tabs.stories.tsx', 'Обычное']] },
  {
    title: 'Карточка (матрёшка)',
    note: 'Лицо: не больше трёх фактов и одного действия; «подробнее» раскрывается за 0,6 с, не глубже двух уровней.',
    items: [
      ['Card.stories.tsx', 'ЦветаКарты'],
      ['Card.stories.tsx', 'Матрёшка'],
    ],
  },
  {
    title: 'Панель деталей',
    note: 'Справа на ноутбуке, снизу на телефоне. Открытая панель — отдельное состояние со своей главной кнопкой.',
    items: [['Drawer.stories.tsx', 'Обычное', 'fixed']],
  },
  {
    title: 'Уведомления',
    note: 'По охвату: беда системы — плашка вверху, беда списка — над списком, беда объекта — в строке, «готово» — всплывашка.',
    items: [
      ['Notification.stories.tsx', 'Обычное'],
      ['Notification.stories.tsx', 'Всплывашка', 'toast'],
    ],
  },
]

/** Рамки образцов — только токены. */
const DEMO_CSS = `
body{margin:0;background:var(--cds-background);color:var(--cds-text-primary);font-family:var(--cds-font-sans)}
.dsr{display:flex;flex-direction:column;gap:var(--cds-spacing-07);padding:var(--cds-spacing-05)}
.dsr-sec{display:flex;flex-direction:column;gap:var(--cds-spacing-04)}
.dsr-sec>h2{margin:0;font-size:var(--cds-heading-03-font-size);line-height:var(--cds-heading-03-line-height);font-weight:400}
.dsr-sec>p{margin:0;color:var(--cds-text-secondary);font-size:var(--cds-body-01-font-size);line-height:var(--cds-body-01-line-height);max-width:70ch}
.dsr-item{display:flex;flex-direction:column;gap:var(--cds-spacing-02)}
.dsr-item>small{color:var(--cds-text-helper);font-size:var(--cds-label-01-font-size);letter-spacing:var(--cds-label-01-letter-spacing)}
.dsr-box{border:1px dashed var(--cds-border-subtle-01);padding:var(--cds-spacing-05);background:var(--cds-background);min-width:0;overflow-x:auto}
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
      items.push(`<div class="dsr-item"><small>${e.title.replace('ДС/', '')} · ${name}</small>${await renderStory(e, n++, frame)}</div>`)
    }
    parts.push(`<section class="dsr-sec"><h2>${s.title}</h2><p>${s.note}</p>${items.join('')}</section>`)
  }
  const css = execFileSync(process.execPath, [resolve(root, 'node_modules/@tailwindcss/cli/dist/index.mjs'), '-i', resolve(root, 'src/showcase.css'), '--minify'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  return (
    `<!-- Сгенерировано design/react (src/__tests__/showcase.test.tsx) из историй ДС-React. Руками не править: npm run showcase. -->\n` +
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
    expect(readFileSync(OUT, 'utf8') === html, 'dist/showcase-components.html отстал — npm run showcase, потом node design/build.mjs').toBe(true)
  })
})
