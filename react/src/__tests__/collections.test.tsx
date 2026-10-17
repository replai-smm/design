/** Коллекции: срочное сверху (П2), норма свёрнута (П3), много (П12), выбранная строка, сортировка, подсказка, широкая таблица; сетка и неделя. */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { addWeeks, compareSortValues, DataTable, GridLegend, List, mondayOf, ProofreadGrid, StatusRow, weekTitle, WeekCalendar, type Column, type SortState } from '../index'
import { TONE_ORDER, toneOf } from '../lib/vocab'
import { cabinets, groups, many, type CabinetRow, type GroupRow } from '../stories/fixtures'
import { communities, manyCommunities, monthColumns, posts, proofCell, today, weekStart, type Post } from '../stories/df-fixtures'

const cols: Column<GroupRow>[] = [{ key: 'n', header: 'Группа', cell: (r) => r.name, face: true }]

describe('таблица и список: срочное сверху, норма свёрнута, много', () => {
  it('группы по порядку внимания: опасно → … → хорошо', () => {
    const { container } = render(<DataTable<GroupRow> label="т" rows={groups} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    const order = [...container.querySelectorAll('[data-group]')].map((g) => toneOf(g.getAttribute('data-group') as never))
    expect(order).toEqual([...order].sort((a, b) => TONE_ORDER.indexOf(a) - TONE_ORDER.indexOf(b)))
    expect([order[0], order.at(-1)]).toEqual(['опасно', 'хорошо'])
  })

  it('«работает» свёрнуто: строки недоступны, пока не раскрыли (0,6 с, ds-expand)', () => {
    const { container } = render(<List<GroupRow> label="т" rows={groups} renderRow={(r) => r.name} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    const ok = container.querySelector('[data-group="work.working"]') as HTMLElement
    const region = ok.querySelector('.ds-expand')!
    expect(region.hasAttribute('inert')).toBe(true)
    fireEvent.click(within(ok).getByRole('button', { expanded: false }))
    expect(region.getAttribute('data-open')).toBe('true')
  })

  it('150 строк: видно 50, «показать ещё · N» добавляет', () => {
    const rows = many.filter((r) => r.status !== 'work.working')
    const { container } = render(<DataTable<GroupRow> label="т" rows={rows} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    expect(container.querySelectorAll('[data-slot=row]').length).toBe(50)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`показать ещё · ${rows.length - 50}`) }))
    expect(container.querySelectorAll('[data-slot=row]').length).toBe(Math.min(100, rows.length))
  })

  it('загрузка — скелет; ошибка — «Повторить»; пусто — своё состояние', () => {
    const retry = vi.fn()
    const { container, rerender } = render(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="loading" />)
    expect(container.querySelectorAll('[data-slot=skeleton]').length).toBeGreaterThan(0)
    rerender(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="error" error={{ title: 'Не загрузилось', onRetry: retry }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalled()
    rerender(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} empty={{ kind: 'первый запуск', title: 'Групп пока нет' }} />)
    expect(container.querySelector('[data-state="первый запуск"]')).toBeTruthy()
  })

  it('выбранная строка — «выбрано» и aria-current; одно слово selectedKey у таблицы и списка', () => {
    const { rerender } = render(<List label="Группы" rows={groups} getKey={(r: GroupRow) => r.id} renderRow={(r: GroupRow) => r.name} onSelect={() => {}} selectedKey="g1" />)
    const cur = document.querySelectorAll('[aria-current=true]')
    expect(cur).toHaveLength(1)
    expect(cur[0].closest('li')!.className).toContain('bg-selected')
    rerender(<DataTable<GroupRow> label="т" rows={groups} columns={cols} getKey={(r) => r.id} onSelect={() => {}} selectedKey="g1" />)
    expect(document.querySelector('[data-selected]')?.className).toContain('bg-selected')
  })

  it('на телефоне видны колонки лица: остальные — ds-cell-more', () => {
    const { container } = render(<DataTable<GroupRow> label="т" rows={groups.slice(0, 1)} columns={[...cols, { key: 'c', header: 'Клиент', cell: (r) => r.client }]} getKey={(r) => r.id} />)
    const head = container.querySelectorAll('[role=columnheader]')
    expect([head[0].className.includes('ds-cell-more'), head[1].className.includes('ds-cell-more')]).toEqual([false, true])
  })
})

describe('таблица: сортировка — выбор человека, срочное сверху остаётся', () => {
  const ccols: Column<CabinetRow>[] = [
    { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, sortValue: (r) => r.name },
    { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist, hint: 'Кто ведёт кабинет' },
    { key: 'left', header: 'Остаток', cell: (r) => (r.left == null ? '—' : String(r.left)), align: 'end', nowrap: true, sortValue: (r) => r.left, sortFirst: 'descending', hint: 'Остаток на вчера' },
  ]
  const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent)
  const header = (n: string) => screen.getByRole('columnheader', { name: new RegExp(n) })

  it('нажатие — в сторону колонки, повторное — в обратную, пустое внизу', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={ccols} getKey={(r) => r.id} />)
    expect(names()).toEqual(cabinets.map((c) => c.name))
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(header('Остаток').getAttribute('aria-sort')).toBe('descending')
    expect(names()).toEqual(['Студия йоги', 'Барбершоп', 'Цветы на Ленина', 'Кофейня «Зерно»', 'Детский клуб', 'Автосервис «Ключ»'])
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(names().at(-1)).toBe('Автосервис «Ключ»')
  })

  it('с группами тона — внутри группы; управляемая — зовёт onSortChange', () => {
    const onSortChange = vi.fn()
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={ccols} getKey={(r) => r.id} getStatus={(r) => r.status} sort={null} onSortChange={onSortChange} />)
    expect([...document.querySelectorAll('[data-group]')].map((g) => g.getAttribute('data-group'))).toEqual(['work.failing', 'work.unchecked', 'work.working'])
    fireEvent.click(within(header('Кабинет')).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' } satisfies SortState)
  })

  it('сравнение: числа как числа, строки по-русски, пустое внизу', () => {
    expect([10, 9, null, 100].sort((a, b) => compareSortValues(a, b, 'ascending'))).toEqual([9, 10, 100, null])
    expect(['Жук', 'ель', 'ёж'].sort((a, b) => compareSortValues(a, b, 'ascending'))).toEqual(['ёж', 'ель', 'Жук'])
  })

  it('подсказка у заголовка — Tooltip ДС и описание; у сортируемой — у той же кнопки (одна остановка Tab)', async () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={ccols} getKey={(r) => r.id} />)
    const b = within(header('Таргетолог')).getByRole('button')
    expect(document.getElementById(b.getAttribute('aria-describedby')!)?.textContent).toBe('Кто ведёт кабинет')
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Кто ведёт кабинет'))
    expect(within(header('Остаток')).getAllByRole('button')).toHaveLength(1)
  })

  it('широкая: колонка не уже значения (min-content), nowrap — в одну строку, прокрутка вбок внутри, первая колонка стоит', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={ccols} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} />)
    const table = screen.getByRole('table')
    expect(table.style.getPropertyValue('--table-cols')).toBe('minmax(min-content, 1fr) minmax(min-content, 1fr) minmax(min-content, 1fr)')
    expect(screen.getByText('15400').className).toContain('whitespace-nowrap')
    expect(table.parentElement!.className.split(/\s+/)).toEqual(expect.arrayContaining(['relative', 'overflow-x-auto']))
    const css = readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')
    expect(css).toMatch(/\.ds-table \.ds-row > \[role='cell'\]:first-child,\s*\.ds-table \.ds-row > \[role='columnheader'\]:first-child \{\s*position: sticky;/)
    const muted = screen.getByText('Барбершоп').closest('[role=row]')!
    expect(muted.className).toContain('text-fg-muted')
  })
})

describe('сетка сверки (DF)', () => {
  const props = { label: 'Посты по дням', rowHeader: 'Сообщество', columns: monthColumns, rows: communities, getKey: (r: (typeof communities)[number]) => r.id, renderRowHeader: (r: (typeof communities)[number]) => r.name, getCell: proofCell }

  it('настоящая таблица; клетка — значение и слово для читалки; залита тоном статуса, впереди — тихо', () => {
    const { container } = render(<ProofreadGrid {...props} />)
    expect(screen.getByRole('table', { name: 'Посты по дням' })).toBeTruthy()
    const danger = container.querySelector('td[data-tone=danger]')!
    expect(danger.className).toContain('bg-danger-fill')
    expect(danger.textContent).toContain('пропуск')
    expect(container.querySelector('td[data-tone=success]')!.className).toContain('bg-success-fill')
    expect(container.querySelector('td[data-quiet]')!.className).toContain('text-fg-muted')
    expect(container.querySelector('td[data-note]')!.className).toContain('border-b-warning')
  })

  it('нажатие на строку — onSelect, выбранная — «выбрано»; много — «показать ещё»', () => {
    const onSelect = vi.fn()
    render(<ProofreadGrid {...props} rows={manyCommunities} getKey={(r) => r.id} renderRowHeader={(r) => r.name} onSelect={onSelect} selectedKey="mc0" />)
    fireEvent.click(screen.getByRole('button', { name: 'Сообщество 2' }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'mc1' }))
    expect(screen.getByRole('button', { name: 'Сообщество 1' }).closest('th')!.className).toContain('bg-selected')
    expect(screen.getByRole('button', { name: /показать ещё · 20/ })).toBeTruthy()
  })

  it('легенда: образец у тонов с заливкой, слово — у всех', () => {
    const { container } = render(<GridLegend items={[{ tone: 'опасно', label: 'пропуск' }, { tone: 'хорошо', label: 'в норме' }, { label: 'нет нормы' }]} />)
    expect([...container.querySelectorAll('li span[aria-hidden]')].map((x) => x.className.split(' ').find((c) => c.endsWith('-fill')))).toEqual(['bg-danger-fill', 'bg-success-fill'])
    expect(container.textContent).toBe('пропускв норменет нормы')
  })

  it('строка статуса: заливка того же тона, что у клетки; без тона — без заливки; свои data-атрибуты продукта', () => {
    const { container } = render(
      <>
        <StatusRow tone="хорошо" title="1-е · план выполнен" data-day="1">
          <p>12:00 Пост 1</p>
        </StatusRow>
        <StatusRow title="4-е · нет нормы в плане" />
      </>,
    )
    const [ok, none] = container.querySelectorAll('[data-slot=status-row]')
    expect(ok.className).toContain('bg-success-fill')
    expect(ok.getAttribute('data-tone')).toBe('success')
    expect(ok.getAttribute('data-day')).toBe('1')
    expect(ok.textContent).toBe('1-е · план выполнен12:00 Пост 1')
    expect(none.className).not.toMatch(/-fill\b/)
  })
})

describe('неделя (DF)', () => {
  it('с понедельника; посты по дням и времени; сегодня — словом; «+» и нажатие', () => {
    const onAddDay = vi.fn()
    const onSelect = vi.fn()
    const { container } = render(<WeekCalendar<Post> label="Неделя" weekStart={weekStart} today={today} items={posts} getKey={(p) => p.id} getDate={(p) => p.at} renderItem={(p) => p.text} onAddDay={onAddDay} onSelect={onSelect} />)
    const days = container.querySelectorAll('[data-part=day]')
    expect(days).toHaveLength(7)
    expect(days[2].getAttribute('data-today')).toBe('true')
    expect(days[2].textContent).toContain('сегодня')
    expect(days[0].querySelectorAll('[data-part=week-item]')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Запланировать на 5 октября' }))
    expect(onAddDay.mock.calls[0][0].getDate()).toBe(5)
    fireEvent.click(screen.getByRole('button', { name: /Новый круассан/ }))
    expect(onSelect).toHaveBeenCalledWith(posts[2])
  })

  it('понедельник, сдвиг, подпись; навигация — значки, не символы', () => {
    expect(mondayOf(new Date(2026, 9, 11)).getDate()).toBe(5)
    expect(addWeeks(weekStart, 1).getDate()).toBe(12)
    expect(weekTitle(weekStart)).toBe('5 окт. — 11 окт.')
    const prev = vi.fn()
    render(<WeekCalendar<Post> label="Неделя" weekStart={weekStart} items={[]} getKey={(p) => p.id} getDate={(p) => p.at} renderItem={(p) => p.text} nav={{ onPrev: prev, onNext: () => {} }} />)
    const b = screen.getByRole('button', { name: 'Прошлая неделя' })
    expect(b.querySelector('svg[data-icon=chevron-left]')).toBeTruthy()
    fireEvent.click(b)
    expect(prev).toHaveBeenCalled()
  })
})
