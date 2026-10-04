/**
 * Поведение компонентов DF (DF-PORT решение 6; опись DF §3, §6.2, чеклист §8): переписка, поле ответа, три колонки,
 * неделя, сетка сверки, рамка графика. Облик и a11y — общие сторожа (a11y.test, rules.test) по историям.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { StatTile, FilterBar, ChatThread, ReplyBox, ThreeColumn, WeekCalendar, ProofreadGrid, GridLegend, ChartFrame, mondayOf, addWeeks, weekTitle, seriesVar, resolveSeriesColors, SERIES } from '../index'
import { chat, chatFailed, posts, weekStart, today, communities, monthColumns, proofCell, manyCommunities, type Post } from '../stories/df-fixtures'

afterEach(() => vi.restoreAllMocks())

describe('ChatThread — переписка', () => {
  it('входящие и наши: автор, время машинно, разделитель дня, лента — log с подписью', () => {
    render(<ChatThread label="Переписка с Анной" messages={chat} />)
    const log = screen.getByRole('log', { name: 'Переписка с Анной' })
    const msgs = log.querySelectorAll('[data-slot=chat-message]')
    expect([...msgs].map((m) => (m as HTMLElement).dataset.direction)).toEqual(['in', 'out', 'in', 'out'])
    expect(log.querySelector('time[datetime="2026-10-03T10:02"]')?.textContent).toBe('10:02')
    expect([...log.querySelectorAll('[data-slot=chat-day]')].map((d) => d.textContent)).toEqual(['3 октября', 'сегодня'])
    expect(within(msgs[3] as HTMLElement).getByText('отправляется…')).toBeTruthy()
  })

  it('не ушло: знак, слово с причиной и «Повторить»', () => {
    const retry = vi.fn()
    const msgs = chatFailed.map((m) => (m.status === 'error' ? { ...m, onRetry: retry } : m))
    render(<ChatThread label="п" messages={msgs} />)
    expect(screen.getByRole('alert').textContent).toContain('не отправлено: ВК не ответил')
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('«⇡ более ранние» зовёт onLoad; всё загружено — «Это вся переписка», кнопки нет', () => {
    const onLoad = vi.fn()
    const { rerender } = render(<ChatThread label="п" messages={chat} earlier={{ onLoad }} />)
    fireEvent.click(screen.getByRole('button', { name: /Показать более ранние/ }))
    expect(onLoad).toHaveBeenCalledOnce()
    rerender(<ChatThread label="п" messages={chat} earlier={{ onLoad, done: true }} />)
    expect(screen.queryByRole('button', { name: /более ранние/ })).toBeNull()
    expect(screen.getByText('Это вся переписка')).toBeTruthy()
  })

  it('более ранние сверху — прокрутка держит то же сообщение (без прыжка)', () => {
    // раскладки в jsdom нет: высоту ленты и место сообщения m3 задаём сами
    let height = 300
    let m3Top = 40
    const proto = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop')!
    Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
      configurable: true,
      get(this: HTMLElement) {
        return this.dataset?.id === 'm3' ? m3Top : 0
      },
    })
    try {
      const { container, rerender } = render(<ChatThread label="п" messages={chat.slice(2)} earlier={{ onLoad: () => {} }} />)
      const el = container.querySelector('[data-slot=chat-thread]') as HTMLElement
      expect(el.style.overflowAnchor).toBe('none')
      Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => height })
      Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 100 })
      el.scrollTop = 0
      fireEvent.scroll(el)
      rerender(<ChatThread label="п" messages={chat.slice(2)} earlier={{ onLoad: () => {} }} pending="ИИ думает…" />)
      height = 500
      m3Top = 230
      rerender(<ChatThread label="п" messages={chat} earlier={{ onLoad: () => {} }} pending="ИИ думает…" />)
      expect(el.scrollTop).toBe(190) // m3 уехало на 190 px вниз — лента сдвинулась на столько же
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'offsetTop', proto)
    }
  })

  it('загрузка — скелет и «занято»; ошибка — «Повторить»; пусто — первый запуск', () => {
    const { rerender } = render(<ChatThread label="п" messages={[]} state="loading" />)
    expect(document.querySelector('[aria-busy=true]')).toBeTruthy()
    const retry = vi.fn()
    rerender(<ChatThread label="п" messages={[]} state="error" error={{ title: 'Не загрузилось', onRetry: retry }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalled()
    rerender(<ChatThread label="п" messages={[]} empty={{ kind: 'первый запуск', title: 'Спросите первое' }} />)
    expect(document.querySelector('[data-state="первый запуск"]')?.textContent).toContain('Спросите первое')
  })
})

describe('ReplyBox — поле ответа', () => {
  const field = () => screen.getByRole('textbox', { name: 'Ответ' }) as HTMLTextAreaElement

  it('Enter отправляет и очищает, Shift+Enter — нет (enterToSend)', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'привет' } })
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('привет')
    expect(field().value).toBe('')
  })

  it('без enterToSend Enter не отправляет («Сообщения»), Ctrl+Enter — отправляет', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} enterToSend={false} defaultValue="текст" />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).toHaveBeenCalledWith('текст')
    expect(screen.getByText('Ctrl+Enter — отправить')).toBeTruthy()
  })

  it('sendShortcut={false}: ни Enter, ни Ctrl/⌘+Enter не отправляют — только кнопка; подсказки о клавишах нет', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} enterToSend={false} sendShortcut={false} defaultValue="в ВК" />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    fireEvent.keyDown(field(), { key: 'Enter', metaKey: true })
    expect(onSend).not.toHaveBeenCalled()
    expect(screen.queryByText(/Ctrl\+Enter/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
    expect(onSend).toHaveBeenCalledWith('в ВК')
  })

  it('sendShortcut={false} с enterToSend: Enter отправляет, Ctrl+Enter — нет', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} sendShortcut={false} defaultValue="вопрос" />)
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('вопрос')
  })

  it('набор через IME: Enter не перехватывается', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} defaultValue="ь" />)
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('пустое не уходит: слово ошибки под полем, поле помечено', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} emptyMessage="Напишите текст сообщения" />)
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
    expect(onSend).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('Напишите текст сообщения')
    expect(field().getAttribute('aria-invalid')).toBe('true')
    fireEvent.change(field(), { target: { value: 'а' } })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('отправка идёт — второй раз не уходит; удача — очищено', async () => {
    let done!: () => void
    const onSend = vi.fn(() => new Promise<void>((r) => (done = r)))
    render(<ReplyBox label="Ответ" onSend={onSend} defaultValue="раз" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
    })
    const btn = screen.getByRole('button', { name: 'Отправить' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(field().readOnly).toBe(true)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledTimes(1)
    await act(async () => done())
    expect(field().value).toBe('')
    expect(field().readOnly).toBe(false)
  })

  it('неудача не теряет текст (ошибку показывает продукт)', async () => {
    const onSend = vi.fn(() => Promise.reject(new Error('нет')))
    const { rerender } = render(<ReplyBox label="Ответ" onSend={onSend} defaultValue="важный ответ" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
    })
    expect(field().value).toBe('важный ответ')
    rerender(<ReplyBox label="Ответ" onSend={onSend} defaultValue="важный ответ" error="ВК не принял" />)
    expect(screen.getByRole('alert').textContent).toContain('ВК не принял')
  })

  it('выключено с причиной; вторичная отправка — не главная кнопка', () => {
    const { rerender } = render(<ReplyBox label="Ответ" onSend={() => {}} disabled disabledReason="Нет ключа" />)
    expect(field().disabled).toBe(true)
    expect(field().getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.getByText('Нет ключа')).toBeTruthy()
    expect(document.querySelector('[data-slot=reply-send]')?.getAttribute('data-variant')).toBe('primary')
    rerender(<ReplyBox label="Ответ" onSend={() => {}} emphasis="secondary" />)
    expect(document.querySelector('[data-slot=reply-send]')?.getAttribute('data-variant')).toBe('secondary')
  })
})

describe('ThreeColumn — три колонки', () => {
  const view = (active: 0 | 1 | 2, onBack = vi.fn()) =>
    render(<ThreeColumn labels={['Сообщества', 'Посты', 'Пост']} active={active} onBack={onBack} first={<p>список</p>} second={<p>лента</p>} third={<p>карточка</p>} />)

  it('три области с подписями; на телефоне видна активная (остальные hidden до lg)', () => {
    view(1)
    const cols = screen.getAllByRole('region')
    expect(cols.map((c) => c.getAttribute('aria-label'))).toEqual(['Сообщества', 'Посты', 'Пост'])
    expect(cols.map((c) => c.dataset.active)).toEqual(['false', 'true', 'false'])
    expect(cols[0].className).toMatch(/(^| )hidden( |$)/)
    expect(cols[0].className).toContain('lg:flex')
    expect(cols[1].className).not.toMatch(/(^| )hidden( |$)/)
  })

  it('«← назад» ведёт к предыдущей колонке и называет её', () => {
    const onBack = vi.fn()
    view(2, onBack)
    fireEvent.click(screen.getByRole('button', { name: /Посты/ }))
    expect(onBack).toHaveBeenCalledWith(1)
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['← Сообщества', '← Посты'])
  })

  it('смена колонки — направление выезда: вперёд справа, назад слева', () => {
    const { rerender, container } = view(0)
    const p = (a: 0 | 1 | 2) => <ThreeColumn labels={['А', 'Б', 'В']} active={a} onBack={() => {}} first="1" second="2" third="3" />
    rerender(p(1))
    expect(container.querySelector('[data-column="1"]')?.getAttribute('data-dir')).toBe('forward')
    rerender(p(0))
    expect(container.querySelector('[data-column="0"]')?.getAttribute('data-dir')).toBe('back')
  })

  it('две колонки без `third`: две области, вторая занимает остальное, «← назад» к первой', () => {
    const onBack = vi.fn()
    const { container } = render(<ThreeColumn labels={['Черновики', 'Пост']} active={1} onBack={onBack} first={<p>список</p>} second={<p>пост</p>} />)
    const cols = screen.getAllByRole('region')
    expect(cols.map((c) => c.getAttribute('aria-label'))).toEqual(['Черновики', 'Пост'])
    expect(container.querySelector('[data-slot=three-column]')?.getAttribute('data-columns')).toBe('2')
    expect(cols[1].className).toContain('lg:flex-1')
    expect(cols[1].className).not.toContain('lg:border-x')
    fireEvent.click(screen.getByRole('button', { name: /Черновики/ }))
    expect(onBack).toHaveBeenCalledWith(0)
  })
})

describe('WeekCalendar — неделя', () => {
  const base = { label: 'Публикации недели', weekStart, today, items: posts, getKey: (p: Post) => p.id, getDate: (p: Post) => p.at, renderItem: (p: Post) => p.text }

  it('неделя с понедельника; посты по дням и по времени; выходные и сегодня помечены', () => {
    render(<WeekCalendar {...base} />)
    const days = document.querySelectorAll('[data-slot=week-day]')
    expect(days).toHaveLength(7)
    expect(days[0].textContent).toMatch(/понедельник, 5 октября/)
    expect([...days].map((d) => (d as HTMLElement).dataset.weekend ?? '')).toEqual(['', '', '', '', '', 'true', 'true'])
    expect((days[2] as HTMLElement).dataset.today).toBe('true')
    expect(days[2].textContent).toContain('сегодня')
    expect([...days[0].querySelectorAll('[data-slot=week-item]')].map((i) => i.textContent)).toEqual([posts[0].text, posts[1].text])
    expect(days[1].textContent).toContain('Нет публикаций')
  })

  it('«+» в дне — день недели; нажатие на пост — пост', () => {
    const onAddDay = vi.fn()
    const onItemClick = vi.fn()
    render(<WeekCalendar {...base} onAddDay={onAddDay} onItemClick={onItemClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Запланировать на 8 октября' }))
    expect(onAddDay.mock.calls[0][0].getDate()).toBe(8)
    fireEvent.click(screen.getByRole('button', { name: /Новый круассан/ }))
    expect(onItemClick).toHaveBeenCalledWith(posts[2])
  })

  it('понедельник, сдвиг и подпись недели', () => {
    expect(mondayOf(new Date(2026, 9, 11)).getDate()).toBe(5)
    expect(mondayOf(new Date(2026, 9, 5)).getDate()).toBe(5)
    expect(addWeeks(weekStart, -1).getDate()).toBe(28)
    expect(weekTitle(weekStart)).toMatch(/^5 окт\.? — 11 окт\.?$/)
  })

  it('◀ ▶ навигация; много в дне — «ещё N» раскрывает', () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    const many = Array.from({ length: 5 }, (_, i) => ({ id: `x${i}`, at: new Date(2026, 9, 6, 9 + i), text: `пост ${i}` }))
    render(<WeekCalendar {...base} items={many} dayLimit={2} nav={{ onPrev, onNext }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Прошлая неделя' }))
    fireEvent.click(screen.getByRole('button', { name: 'Следующая неделя' }))
    expect([onPrev.mock.calls.length, onNext.mock.calls.length]).toEqual([1, 1])
    const tue = document.querySelectorAll('[data-slot=week-day]')[1]
    expect(tue.querySelectorAll('[data-slot=week-item]')).toHaveLength(2)
    fireEvent.click(within(tue as HTMLElement).getByRole('button', { name: 'ещё 3' }))
    expect(tue.querySelectorAll('[data-slot=week-item]')).toHaveLength(5)
  })

  it('пусто с `empty` — состояние вместо сетки; загрузка — скелет', () => {
    const { rerender } = render(<WeekCalendar {...base} items={[]} empty={{ kind: 'первый запуск', title: 'Выберите сообщество' }} />)
    expect(document.querySelector('[data-slot=week-day]')).toBeNull()
    expect(screen.getByText('Выберите сообщество')).toBeTruthy()
    rerender(<WeekCalendar {...base} state="loading" />)
    expect(document.querySelectorAll('[data-slot=week-day]')).toHaveLength(7)
    expect(document.querySelector('[aria-busy=true]')).toBeTruthy()
  })
})

describe('ProofreadGrid — сетка сверки', () => {
  const base = { label: 'Посты по дням', rowHeader: 'Сообщество', columns: monthColumns, rows: communities, getKey: (c: (typeof communities)[0]) => c.id, renderRowHeader: (c: (typeof communities)[0]) => c.name, getCell: proofCell }

  it('настоящая таблица: шапка дней, заголовки строк, клетка — значение и слово тона', () => {
    render(<ProofreadGrid {...base} />)
    const table = screen.getByRole('table', { name: 'Посты по дням' })
    expect(within(table).getAllByRole('columnheader')).toHaveLength(32)
    expect(within(table).getAllByRole('rowheader').map((h) => h.textContent)).toEqual(communities.map((c) => c.name))
    const cell = table.querySelector('tbody tr td') as HTMLElement
    expect(cell.dataset.tone).toBe(proofCell(communities[0], monthColumns[0]).tone)
    expect(cell.textContent).toMatch(/^\d\/2 /)
    expect(table.querySelectorAll('thead th[data-muted]')).toHaveLength(9) // выходные октября 2026
    // рамка прокрутки держит скрытые слова (sr-only — absolute) внутри себя: страница вбок не раздвигается
    expect(screen.getByRole('region', { name: 'Посты по дням: прокрутка' }).className).toMatch(/(^| )relative( |$)/)
  })

  it('отметка «возможен перенос» — черта и слово; будущее — тихое', () => {
    render(<ProofreadGrid {...base} />)
    const noted = document.querySelector('td[data-note]') as HTMLElement
    expect(noted.textContent).toContain('возможен перенос')
    expect(noted.className).toContain('border-b-support-caution-minor')
    expect(document.querySelectorAll('td[data-tone=future]').length).toBe(communities.length * 27)
  })

  it('нажатие на строку — строка; выбранная помечена', () => {
    const onRowClick = vi.fn()
    render(<ProofreadGrid {...base} onRowClick={onRowClick} selectedKey="c2" />)
    fireEvent.click(screen.getByRole('button', { name: communities[0].name }))
    expect(onRowClick).toHaveBeenCalledWith(communities[0])
    expect(screen.getByRole('button', { name: communities[1].name }).getAttribute('aria-current')).toBe('true')
  })

  it('много — первые pageSize и «показать ещё»; пусто и ошибка — состояния', () => {
    const { rerender } = render(<ProofreadGrid {...base} rows={manyCommunities} pageSize={50} />)
    expect(document.querySelectorAll('[data-slot=grid-row]')).toHaveLength(50)
    fireEvent.click(screen.getByRole('button', { name: 'показать ещё · 20' }))
    expect(document.querySelectorAll('[data-slot=grid-row]')).toHaveLength(70)
    rerender(<ProofreadGrid {...base} rows={[]} empty={{ kind: 'ничего не найдено', title: 'По выбранному фильтру проектов нет' }} />)
    expect(screen.getByText('По выбранному фильтру проектов нет')).toBeTruthy()
    rerender(<ProofreadGrid {...base} state="error" />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('шапка дней закреплена: рамка не выше экрана, шапка — top-0, угол — над шапкой и первой колонкой; можно выключить', () => {
    const { rerender } = render(<ProofreadGrid {...base} />)
    const region = screen.getByRole('region', { name: 'Посты по дням: прокрутка' })
    expect(region.className).toContain('max-h-dvh')
    expect(region.className).toContain('overflow-y-auto')
    const heads = [...region.querySelectorAll('thead th')] as HTMLElement[]
    expect(heads[0].className).toMatch(/sticky.*left-0.*top-0 z-30|top-0 z-30/)
    expect(heads.slice(1).every((h) => /(^| )sticky( |$)/.test(h.className) && h.className.includes('top-0'))).toBe(true)
    rerender(<ProofreadGrid {...base} stickyHeader={false} />)
    const off = screen.getByRole('region', { name: 'Посты по дням: прокрутка' })
    expect(off.className).not.toContain('max-h-dvh')
    expect((off.querySelector('thead th:nth-child(2)') as HTMLElement).className).not.toContain('top-0')
  })

  it('колонки без тона (КМ, итоги): значение без цвета и без слова тона; пусто — пусто', () => {
    const cols = [{ key: 'km', label: 'КМ', plain: true }, ...monthColumns.slice(0, 3), { key: 'plan', label: 'план', plain: true }]
    const getCell = (c: (typeof communities)[0], col: { key: string }) =>
      col.key === 'km' ? { value: c.id === 'c1' ? 'Алёна' : undefined } : col.key === 'plan' ? { value: 6, hint: 'сумма норм' } : proofCell(c, col as never)
    render(<ProofreadGrid {...base} columns={cols} getCell={getCell} />)
    const row = document.querySelector('[data-slot=grid-row]') as HTMLElement
    const [km, , , , plan] = [...row.querySelectorAll('td')] as HTMLElement[]
    expect(km.dataset.plain).toBe('true')
    expect(km.dataset.tone).toBeUndefined()
    expect(km.textContent).toBe('Алёна')
    expect(plan.textContent).toBe('6. сумма норм')
    expect(plan.className).not.toMatch(/bg-status-/)
    const empty = (document.querySelectorAll('[data-slot=grid-row]')[1] as HTMLElement).querySelector('td') as HTMLElement
    expect(empty.textContent).toBe('')
  })

  it('легенда: образец и слово каждого тона', () => {
    render(<GridLegend items={[{ tone: 'success' }, { tone: 'error', label: 'пропуск дня' }]} note="возможен перенос" />)
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['в норме', 'пропуск дня', 'возможен перенос'])
  })
})

describe('ChartFrame — рамка графика', () => {
  it('заголовок и вывод словами связаны с рисунком; легенда — слово и вид линии', () => {
    render(
      <ChartFrame title="Охват" summary="Охват вырос вдвое" legend={[{ key: 'a', label: 'Охват' }, { key: 'b', label: 'Посты', line: 'dashed' }]}>
        <canvas aria-hidden="true" />
      </ChartFrame>,
    )
    const fig = screen.getByRole('figure', { name: 'Охват' })
    expect(document.getElementById(fig.getAttribute('aria-describedby')!)?.textContent).toBe('Охват вырос вдвое')
    const items = within(screen.getByRole('list', { name: 'Легенда' })).getAllByRole('listitem')
    expect(items.map((i) => [i.dataset.series, i.dataset.line])).toEqual([
      ['0', 'solid'],
      ['1', 'dashed'],
    ])
  })

  it('загрузка, ошибка, пусто — вместо графика, той же высоты; легенды нет', () => {
    const retry = vi.fn()
    const { rerender } = render(<ChartFrame title="т" summary="с" height="lg" state="loading" legend={[{ key: 'a', label: 'А' }]} />)
    expect(document.querySelector('[aria-busy=true] .h-80')).toBeTruthy()
    rerender(<ChartFrame title="т" summary="с" height="lg" state="error" error={{ title: 'Не загрузилось', onRetry: retry }} legend={[{ key: 'a', label: 'А' }]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalled()
    expect(screen.queryByRole('list', { name: 'Легенда' })).toBeNull()
    rerender(<ChartFrame title="т" summary="с" height="lg" empty={{ kind: 'ничего не найдено', title: 'Постов за период нет' }} />)
    expect(screen.getByText('Постов за период нет').closest('[data-slot=state-view]')?.className).toContain('h-80')
  })

  it('«Данные таблицей» раскрывается, свёрнутая — inert', () => {
    render(<ChartFrame title="т" summary="с" table={<table aria-label="данные"><tbody><tr><td>1</td></tr></tbody></table>} />)
    const btn = screen.getByRole('button', { name: 'Данные таблицей' })
    const box = document.getElementById(btn.getAttribute('aria-controls')!)!
    expect(box.hasAttribute('inert')).toBe(true)
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
    expect(box.hasAttribute('inert')).toBe(false)
  })

  it('цвета рядов — токены: var() для CSS, значения темы для холста, по кругу', () => {
    expect(seriesVar(0)).toBe('var(--cds-interactive)')
    expect(seriesVar(SERIES.length)).toBe(seriesVar(0))
    const root = document.documentElement
    root.style.setProperty('--cds-interactive', '#0f62fe') // ds-allow: тест подставляет значение токена и читает его обратно
    root.style.setProperty('--cds-support-success', '#24a148') // ds-allow: тест подставляет значение токена и читает его обратно
    const c = resolveSeriesColors(root)
    expect(c).toHaveLength(SERIES.length)
    expect(c.slice(0, 2)).toEqual(['#0f62fe', '#24a148']) // ds-allow: тест подставляет значение токена и читает его обратно
    root.removeAttribute('style')
  })
})

describe('StatTile — плитка с цифрой', () => {
  it('с onClick — вся плитка кнопка; без перехода — не нажимается; со ссылкой — ссылка', () => {
    const go = vi.fn()
    const { rerender } = render(<StatTile value="12" label="неотв. диалогов" onClick={go} />)
    fireEvent.click(screen.getByRole('button', { name: /12\s*неотв\. диалогов/ }))
    expect(go).toHaveBeenCalledOnce()
    rerender(<StatTile value="2/3" label="событий нет" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    rerender(<StatTile value="3" label="кабинета" href="#target" />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('#target')
  })

  it('беда — знак тона и слово, не только цвет', () => {
    render(<StatTile value="17" label="сообществ" alert={{ tone: 'error', text: '2 без доступа' }} />)
    const a = document.querySelector('[data-slot=stat-alert]') as HTMLElement
    expect(a.dataset.tone).toBe('error')
    expect(a.textContent).toContain('2 без доступа')
    expect(a.querySelector('[data-tone-icon=error]')).toBeTruthy()
  })

  it('сравнение: А и Б с меткой ряда, разница ▲▼ в % и словом для читалки; Б = 0 — без разницы', () => {
    const { rerender } = render(<StatTile variant="metric" label="Ср. лайки" value="30" compare={{ value: '10', delta: 200 }} />)
    const d = document.querySelector('[data-slot=delta]') as HTMLElement
    expect(d.dataset.direction).toBe('up')
    expect(d.textContent).toBe('▲больше на200,0%')
    expect([...document.querySelectorAll('[data-series]')].map((m) => (m as HTMLElement).dataset.series)).toEqual(['0', '1'])
    expect(document.querySelector('[data-slot=stat-compare]')?.textContent).toContain('10')
    rerender(<StatTile variant="metric" label="Ср. лайки" value="2,1" compare={{ value: '2,6', delta: -19.2 }} />)
    expect((document.querySelector('[data-slot=delta]') as HTMLElement).textContent).toBe('▼меньше на19,2%')
    rerender(<StatTile variant="metric" label="Постов" value="7" compare={{ value: '0', delta: null }} />)
    expect(document.querySelector('[data-slot=delta]')).toBeNull()
  })
})

describe('FilterBar required — обязательный выбор', () => {
  const f = [{ key: 'p', label: 'Период', required: true, options: [{ value: '30', label: '30 дней' }, { value: '90', label: '90 дней' }] }]
  it('без «все»; пустое значение — первый; повторное нажатие на выбранный ничего не меняет', () => {
    const on = vi.fn()
    render(<FilterBar filters={f} value={{}} onChange={on} />)
    expect(screen.queryByRole('radio', { name: 'все' })).toBeNull()
    expect(screen.getByRole('radio', { name: '30 дней' }).getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByRole('radio', { name: '30 дней' }))
    expect(on).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('radio', { name: '90 дней' }))
    expect(on).toHaveBeenCalledWith({ p: '90' })
  })
})
