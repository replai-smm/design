/** Сторож ширин (lint/widths.mjs): на фикстурном «Storybook» красный там, где страница шире окна, текст за краем или история не отрисовалась. */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
// @ts-expect-error — .mjs без типов
import { SHELF, WIDTHS, check, table } from '../lint/widths.mjs'

const STORIES: Record<string, { title: string; name: string; html: string; broken?: boolean }> = {
  'ok': { title: 'Экраны/SCR-01 Вход', name: 'Обычное', html: '<p>Вход в кабинет</p>' },
  'wide-page': { title: 'Экраны/SCR-02 Широкая страница', name: 'Обычное', html: '<div style="width:2400px">шапка шире окна</div>' },
  'cut-text': { title: 'Экраны/SCR-03 Режет текст', name: 'Обычное', html: '<div style="position:absolute;left:-60px">Обрезанный слева</div>' },
  'implicit-scroll': { title: 'Экраны/SCR-06 Панель с неявной прокруткой', name: 'Обычное', html: '<div style="width:200px;overflow-y:auto"><div style="width:600px;white-space:nowrap">текст шире панели без своей прокрутки</div></div>' },
  'scroll-row': { title: 'Экраны/SCR-04 Ряд с прокруткой', name: 'Обычное', html: '<div class="overflow-x-auto" style="overflow-x:auto;width:200px"><div style="width:900px">ряд вкладок со своей прокруткой</div></div>' },
  'shell-ok': { title: 'Экраны/SCR-07 Оболочка в порядке', name: 'Обычное', html: '<header data-slot="header" style="height:48px">шапка</header><div style="display:flex;min-height:calc(100vh - 48px)"><nav data-slot="side-nav" style="width:200px">панель</nav><main style="flex:1">содержимое</main></div>' },
  'shell-boxed': { title: 'Экраны/SCR-08 Коробка по центру', name: 'Обычное', html: '<header data-slot="header" style="height:48px">шапка</header><div style="display:flex;min-height:calc(100vh - 48px)"><nav data-slot="side-nav" style="width:200px">панель</nav><main style="flex:1;max-width:300px;margin:0 auto">содержимое</main></div>' },
  'shell-short-nav': { title: 'Экраны/SCR-09 Короткая панель', name: 'Обычное', html: '<header data-slot="header" style="height:48px">шапка</header><div style="display:flex"><nav data-slot="side-nav" style="width:200px">панель</nav><main style="flex:1">содержимое</main></div>' },
  'broken': { title: 'Экраны/SCR-05 Не отрисовалась', name: 'Обычное', html: '', broken: true },
  'not-a-screen': { title: 'Компоненты/Поля/TextInput', name: 'Обычное', html: '<div style="width:5000px">не экран — не проверяется</div>' },
}

let dir = ''
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'widths-'))
  const entries = Object.fromEntries(Object.entries(STORIES).map(([id, s]) => [id, { id, type: 'story', title: s.title, name: s.name }]))
  writeFileSync(join(dir, 'index.json'), JSON.stringify({ v: 5, entries }))
  mkdirSync(dir, { recursive: true })
  const data = JSON.stringify(STORIES)
  writeFileSync(
    join(dir, 'iframe.html'),
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body><div id="storybook-root"></div><script>
const s = ${data}[new URLSearchParams(location.search).get('id')]
if (s.broken) document.body.classList.add('sb-show-errordisplay'); else document.getElementById('storybook-root').innerHTML = '<div>' + s.html + '</div>'
</script></body></html>`,
  )
})
afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe('сторож ширин', () => {
  it('ходит только по полке экранов и по четырём ширинам', async () => {
    const r = await check({ storybook: dir })
    expect(WIDTHS).toEqual([360, 1024, 1280, 1920])
    expect(r.rows.map((x: { id: string }) => x.id).sort()).toEqual(['broken', 'cut-text', 'implicit-scroll', 'ok', 'scroll-row', 'shell-boxed', 'shell-ok', 'shell-short-nav', 'wide-page'])
    expect(SHELF.test('Экраны/SCR-12 Пульс/Пульс')).toBe(true)
    expect(SHELF.test('Компоненты/Поля/TextInput')).toBe(false)
  }, 60000)

  it('красный: страница шире окна, текст за краем, история не отрисовалась; зелёный: тихий экран и ряд со своей прокруткой', async () => {
    const r = await check({ storybook: dir })
    const bad = r.bad as string[]
    expect(bad.some((b) => b.includes('SCR-02') && b.includes('шире окна'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-03') && b.includes('за краем'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-05') && b.includes('не отрисовалась'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-06') && b.includes('за краем'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-08') && b.includes('резиновая страница'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-09') && b.includes('левая панель'))).toBe(true)
    expect(bad.some((b) => b.includes('SCR-07'))).toBe(false)
    expect(bad.some((b) => b.includes('SCR-01'))).toBe(false)
    expect(bad.some((b) => b.includes('SCR-04'))).toBe(false)
  }, 60000)

  it('обязательная история: нет её на полке — проверка называет, что нет', async () => {
    const r = await check({ storybook: dir, require: ['Вход', 'Оболочка кабинета/Кабинет'] })
    expect(r.missing).toEqual(['Оболочка кабинета/Кабинет'])
  }, 60000)

  it('таблица «история × ширина» для лога CI', async () => {
    const r = await check({ storybook: dir })
    const t = table(r) as string
    expect(t).toContain('SCR-01 Вход · Обычное')
    expect(t).toContain('360')
    expect(t).toContain('1920')
    expect(t).toContain('✗')
    expect(t).toContain('✓')
  }, 60000)
})
