/**
 * Правила API (DESIGN-APPROACH §3): одна главная кнопка на область и на поверхность (П5), опасное не рядом с главным (П10),
 * в строке главной нет (П5), лицо карточки ≤ 3 фактов и раскрытие не глубже 2 уровней (П7), срочное сверху и норма
 * свёрнута (П2, П3), «много» — «показать ещё» (П12), закрытый список статусов, фильтры в адресе.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react'
import { ActionArea, Button, Card, DataTable, List, Page, PageHeader, StatusBadge, FilterBar, useUrlFilters, Toaster, useToast, Drawer, Tabs, CountBadge, countText, Steps, stepState } from '../index'
import { STATUS_IDS, TONE_ORDER, statusOf, toneOf, type Tone } from '../lib/status'
import { cabinets, groups, many, type CabinetRow, type GroupRow } from '../stories/fixtures'
import { compareSortValues, type Column, type SortState } from '../components/Collection'
import statusesJson from '../../../statuses.json'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

describe('кнопки: одна главная (П5), опасное не рядом (П10)', () => {
  it('у Button нет варианта primary — главная только через ActionArea', () => {
    // @ts-expect-error — варианта primary у Button нет в типе
    const bad = <Button variant="primary">x</Button>
    expect(bad).toBeTruthy()
    render(<ActionArea primary={{ label: 'Сохранить' }} />)
    expect(screen.getByRole('button', { name: 'Сохранить' }).dataset.variant).toBe('primary')
  })

  it('две главные на одной странице — ошибка', () => {
    quiet()
    expect(() =>
      render(
        <Page header={<PageHeader title="Т" />}>
          <ActionArea primary={{ label: 'Первая' }} />
          <ActionArea primary={{ label: 'Вторая' }} />
        </Page>,
      ),
    ).toThrow(/вторая главная кнопка/)
  })

  it('открытая панель — своя поверхность: главная в панели не спорит с главной страницы', () => {
    render(
      <Page header={<PageHeader title="Т" />} actions={<ActionArea primary={{ label: 'Главная страницы' }} />}>
        <Drawer defaultOpen title="Панель" actions={<ActionArea primary={{ label: 'Главная панели' }} />} />
      </Page>,
    )
    expect(document.querySelectorAll('[data-variant=primary]')).toHaveLength(2)
  })

  it('область внутри области — ошибка', () => {
    quiet()
    expect(() => render(<ActionArea primary={{ label: 'А' }}><ActionArea primary={{ label: 'Б' }} /></ActionArea>)).toThrow(/внутри другой области/)
  })

  it('danger рядом с главной — ошибка (П10)', () => {
    quiet()
    expect(() => render(<ActionArea primary={{ label: 'Сохранить' }}><Button variant="danger">Удалить</Button></ActionArea>)).toThrow(/опасное/)
  })

  it('в строке списка: область действий — ошибка, громкая кнопка — ошибка, тихая — можно', () => {
    quiet()
    const t = (action: React.ReactNode) =>
      render(<DataTable<GroupRow> label="т" rows={groups.slice(0, 1)} columns={[{ key: 'n', header: 'Н', cell: (r) => r.name, face: true }]} getKey={(r) => r.id} rowAction={() => action} />)
    expect(() => t(<ActionArea primary={{ label: 'x' }} />)).toThrow(/в строке списка нет области/)
    expect(() => t(<Button>x</Button>)).toThrow(/только тихая/)
    expect(() => t(<Button variant="ghost">Починить</Button>)).not.toThrow()
  })

  it('rule → data-rule (П15), loading → aria-busy и disabled', () => {
    render(<ActionArea primary={{ label: 'Сохранить', rule: 'R-12', loading: true }} />)
    const b = screen.getByRole('button', { name: 'Сохранить' })
    expect(b.dataset.rule).toBe('R-12')
    expect(b.getAttribute('aria-busy')).toBe('true')
    expect((b as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('метка статуса: закрытый список, обе палитры', () => {
  it('список статусов — ровно statuses.json', () => {
    expect([...STATUS_IDS]).toEqual(statusesJson.statuses.map((s) => s.id))
  })

  it('неизвестный статус — ошибка', () => {
    quiet()
    expect(() => render(<StatusBadge status={'work.unknown' as never} />)).toThrow(/закрытом списке/)
  })

  it('у каждого статуса — слово закона, значок тона; палитра karta — рамка цвета Карты или без цвета', () => {
    for (const id of STATUS_IDS) {
      const { container, unmount } = render(
        <>
          <StatusBadge status={id} />
          <StatusBadge status={id} palette="karta" />
        </>,
      )
      const [p, k] = container.querySelectorAll('[data-slot=status-badge]')
      expect(p.textContent).toBe(statusOf(id).say)
      expect(p.querySelector('[data-tone-icon]')).toBeTruthy()
      const karta = statusOf(id).karta
      if (karta === 'без изменений') expect(k.className).toContain('border-support-info')
      else if (karta === 'хотят изменить') expect(k.className).toContain('border-status-warning')
      else if (karta === 'падает') expect(k.className).toContain('border-status-error')
      else expect(k.className).toContain('border-border-subtle-01')
      unmount()
    }
  })
})

describe('таблица и список: срочное сверху (П2), норма свёрнута (П3), много (П12)', () => {
  const cols = [{ key: 'n', header: 'Группа', cell: (r: GroupRow) => r.name, face: true }]

  it('группы идут по порядку внимания: опасно → внимание → нейтрально → хорошо', () => {
    const { container } = render(<DataTable<GroupRow> label="т" rows={groups} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    const order = [...container.querySelectorAll('[data-group]')].map((g) => toneOf(g.getAttribute('data-group') as never))
    expect(order).toEqual([...order].sort((a, b) => TONE_ORDER.indexOf(a) - TONE_ORDER.indexOf(b)))
    expect(order[0]).toBe('опасно')
    expect(order.at(-1)).toBe('хорошо')
  })

  it('«работает» свёрнуто: строки недоступны, пока не раскрыли; раскрытие — 0,6 с (ds-expand)', () => {
    const { container } = render(<List<GroupRow> label="т" rows={groups} renderRow={(r) => r.name} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    const ok = container.querySelector('[data-group="work.working"]')!
    const toggle = within(ok as HTMLElement).getByRole('button', { expanded: false })
    const region = ok.querySelector('.ds-expand')!
    expect(region.hasAttribute('inert')).toBe(true)
    fireEvent.click(toggle)
    expect(region.getAttribute('data-open')).toBe('true')
    expect(region.hasAttribute('inert')).toBe(false)
  })

  it('150 строк: видно 50, «показать ещё · N» добавляет следующие', () => {
    const rows = many.filter((r) => r.status !== 'work.working')
    const { container } = render(<DataTable<GroupRow> label="т" rows={rows} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    const visible = () => container.querySelectorAll('[data-slot=row]').length
    expect(visible()).toBe(50)
    const more = screen.getByRole('button', { name: new RegExp(`показать ещё · ${rows.length - 50}`) })
    fireEvent.click(more)
    expect(visible()).toBe(Math.min(100, rows.length))
  })

  it('состояния: загрузка — скелет той же высоты строк; ошибка — «Повторить»; пусто — своё состояние', () => {
    const retry = vi.fn()
    const { container, rerender } = render(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="loading" />)
    expect(container.querySelectorAll('[data-slot=skeleton]').length).toBeGreaterThan(0)
    expect(container.querySelector('[role=table]')!.getAttribute('aria-busy')).toBe('true')
    rerender(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} state="error" error={{ title: 'Не загрузилось', onRetry: retry }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalled()
    rerender(<DataTable<GroupRow> label="т" rows={[]} columns={cols} getKey={(r) => r.id} empty={{ kind: 'первый запуск', title: 'Групп пока нет' }} />)
    expect(container.querySelector('[data-state="первый запуск"]')).toBeTruthy()
  })

  it('на телефоне видны только колонки лица: остальные помечены ds-cell-more', () => {
    const { container } = render(
      <DataTable<GroupRow>
        label="т"
        rows={groups.slice(0, 1)}
        columns={[...cols, { key: 'c', header: 'Клиент', cell: (r) => r.client }]}
        getKey={(r) => r.id}
      />,
    )
    const head = container.querySelectorAll('[role=columnheader]')
    expect(head[0].className).not.toContain('ds-cell-more')
    expect(head[1].className).toContain('ds-cell-more')
  })
})

describe('карточка: лицо ≤ 3 (П7), раскрытие не глубже 2 уровней', () => {
  it('четыре факта на лице — ошибка', () => {
    quiet()
    expect(() => render(<Card title="К" face={['1', '2', '3', '4']} />)).toThrow(/не больше 3/)
  })

  it('третий уровень раскрытия — ошибка', () => {
    quiet()
    const lvl3 = <Card title="3" more="глубже нельзя" />
    const lvl2 = <Card title="2" defaultOpen more={lvl3} />
    expect(() => render(<Card title="1" defaultOpen more={lvl2} />)).toThrow(/глубже 2 уровней/)
    expect(() => render(<Card title="1" defaultOpen more={<Card title="2" more="можно" />} />)).not.toThrow()
  })

  it('«подробнее» раскрывает за 0,6 с: aria-expanded, inert снимается', () => {
    render(<Card title="К" more="детали" />)
    const btn = screen.getByRole('button', { name: /подробнее/ })
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('фильтры в адресе и всплывашки', () => {
  it('useUrlFilters пишет и читает ?ключ=значение, «все» снимает фильтр', () => {
    window.history.replaceState(null, '', '/groups?статус=падает')
    function Demo() {
      const [v, set] = useUrlFilters(['статус'])
      return <FilterBar filters={[{ key: 'статус', label: 'Статус', options: [{ value: 'падает', label: 'падает' }, { value: 'работает', label: 'работает' }] }]} value={v} onChange={set} />
    }
    render(<Demo />)
    expect(screen.getByRole('radio', { name: 'падает' }).getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByRole('radio', { name: 'работает' }))
    expect(new URLSearchParams(window.location.search).get('статус')).toBe('работает')
    fireEvent.click(screen.getByRole('radio', { name: 'все' }))
    expect(window.location.search).toBe('')
  })

  it('вкладки: неактивная размонтируется, keepMounted — живёт спрятанной; чужое значение — ни одна не выбрана', () => {
    const items = () => [
      { value: 'a', label: 'Первая', content: <p>первая</p> },
      { value: 'b', label: 'Вторая', content: <p>вторая</p>, keepMounted: true },
    ]
    const { rerender } = render(<Tabs label="Разделы" items={items()} value="b" />)
    expect(screen.getByText('вторая')).toBeTruthy()
    rerender(<Tabs label="Разделы" items={items()} value="a" />)
    expect(screen.getByText('первая')).toBeTruthy()
    const kept = screen.getByText('вторая').closest('[role=tabpanel]')!
    expect(kept.getAttribute('data-state')).toBe('inactive')
    expect(kept.className).toContain('data-[state=inactive]:hidden')
    rerender(<Tabs label="Разделы" items={items()} value="x" />)
    expect(screen.queryByText('первая')).toBeNull()
    expect(screen.getAllByRole('tab').every((t) => t.getAttribute('aria-selected') === 'false')).toBe(true)
  })

  it('useToast().show — всплывашка с ролью статуса', async () => {
    function Demo() {
      const t = useToast()
      return <Button onClick={() => t.show({ title: 'Готово' })}>Сделать</Button>
    }
    render(
      <Toaster>
        <Demo />
      </Toaster>,
    )
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сделать' })))
    expect(document.querySelector('[data-slot=toast]')?.textContent).toContain('Готово')
  })
})

describe('счётчик (CountBadge)', () => {
  it('число до потолка, «99+» сверху, строка как есть; label — для читалки', () => {
    expect(countText(5)).toBe('5')
    expect(countText(100)).toBe('99+')
    expect(countText(1200, 999)).toBe('999+')
    expect(countText('!')).toBe('!')
    render(<CountBadge count={3} tone="info" label="непрочитанных" />)
    const el = document.querySelector('[data-slot=count-badge]')!
    expect(el.textContent).toBe('непрочитанных: 3')
    expect(el.getAttribute('data-tone')).toBe('info')
  })

  it('срочное — со знаком тона, не только цветом', () => {
    const { container } = render(<CountBadge count={7} tone="error" />)
    expect(container.querySelector('[data-tone-icon=error]')).toBeTruthy()
    const n = render(<CountBadge count={7} />)
    expect(n.container.querySelector('[data-tone-icon]')).toBeNull()
  })
})

describe('список: открытая строка (activeKey)', () => {
  it('строка с activeKey — aria-current и фон выбора; без него — нет', () => {
    const { rerender } = render(<List label="Группы" rows={groups} getKey={(r: GroupRow) => r.id} renderRow={(r: GroupRow) => r.name} onRowClick={() => {}} activeKey={groups[0].id} />)
    const current = document.querySelectorAll('[aria-current=true]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toBe(groups[0].name)
    expect(current[0].closest('li')!.className).toContain('bg-layer-selected-01')
    rerender(<List label="Группы" rows={groups} getKey={(r: GroupRow) => r.id} renderRow={(r: GroupRow) => r.name} onRowClick={() => {}} />)
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(0)
  })
})

describe('шаги (Steps)', () => {
  it('состояние шага: пройден, текущий, впереди, ошибка', () => {
    expect([0, 1, 2, 3].map((i) => stepState(i, 2))).toEqual(['complete', 'complete', 'current', 'incomplete'])
    expect(stepState(3, 3, 3)).toBe('error')
  })

  it('текущий — aria-current=step; состояние словом для читалки; телефон — «Шаг 2 из 4 · Куда»', () => {
    render(<Steps label="Шаги публикации" steps={['Текст', 'Куда', 'Предпросмотр', 'Итог']} current={1} />)
    const nav = screen.getByRole('navigation', { name: 'Шаги публикации' })
    const items = nav.querySelectorAll('[data-slot=step]')
    expect([...items].map((li) => li.getAttribute('data-state'))).toEqual(['complete', 'current', 'incomplete', 'incomplete'])
    expect(items[1].getAttribute('aria-current')).toBe('step')
    expect(items[0].textContent).toContain('пройден')
    expect(nav.querySelector('[data-slot=steps-compact]')!.textContent).toBe('Шаг 2 из 4 · Куда')
  })

  it('назад — только к пройденным шагам; без onStepClick кнопок нет', () => {
    const seen: number[] = []
    const { rerender } = render(<Steps label="Шаги" steps={['А', 'Б', 'В']} current={2} onStepClick={(i) => seen.push(i)} />)
    const btns = screen.getAllByRole('button')
    expect(btns).toHaveLength(2)
    fireEvent.click(btns[0])
    expect(seen).toEqual([0])
    rerender(<Steps label="Шаги" steps={['А', 'Б', 'В']} current={2} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('правило: меньше двух шагов — ошибка в разработке', () => {
    expect(() => render(<Steps label="Шаги" steps={['А']} current={0} />)).toThrow(/шагов меньше двух/)
  })
})

describe('таблица: сортировка по заголовку — выбор человека, срочное сверху остаётся (П2)', () => {
  const cols: Column<CabinetRow>[] = [
    { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, sortValue: (r) => r.name },
    { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist },
    { key: 'left', header: 'Остаток', cell: (r) => (r.left == null ? '—' : String(r.left)), align: 'end', sortValue: (r) => r.left, sortFirst: 'descending' },
  ]
  const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent)
  const header = (name: string) => screen.getByRole('columnheader', { name: new RegExp(name) })

  it('без сортировки — порядок данных; сортируемый заголовок — кнопка, aria-sort только у выбранной колонки', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    expect(names()).toEqual(cabinets.map((c) => c.name))
    expect(within(header('Кабинет')).getByRole('button', { name: 'Кабинет' })).toBeTruthy()
    expect(within(header('Таргетолог')).queryByRole('button')).toBeNull()
    expect(document.querySelectorAll('[aria-sort]')).toHaveLength(0)
  })

  it('нажатие — в сторону колонки (sortFirst), повторное — в обратную; пустое внизу в обе стороны', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(header('Остаток').getAttribute('aria-sort')).toBe('descending')
    expect(names()).toEqual(['Студия йоги', 'Барбершоп', 'Цветы на Ленина', 'Кофейня «Зерно»', 'Детский клуб', 'Автосервис «Ключ»'])
    fireEvent.click(within(header('Остаток')).getByRole('button'))
    expect(header('Остаток').getAttribute('aria-sort')).toBe('ascending')
    expect(names()).toEqual(['Детский клуб', 'Кофейня «Зерно»', 'Цветы на Ленина', 'Барбершоп', 'Студия йоги', 'Автосервис «Ключ»'])
    // другая колонка: её первое направление, у прежней aria-sort снят
    fireEvent.click(within(header('Кабинет')).getByRole('button'))
    expect(header('Кабинет').getAttribute('aria-sort')).toBe('ascending')
    expect(header('Остаток').hasAttribute('aria-sort')).toBe(false)
    expect(names()[0]).toBe('Автосервис «Ключ»')
  })

  it('клавиатура: заголовок берёт фокус Tab и сортирует Enter и пробелом (это <button>)', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    const b = within(header('Кабинет')).getByRole('button')
    expect(b.tagName).toBe('BUTTON')
    expect(b.getAttribute('type')).toBe('button')
    b.focus()
    expect(document.activeElement).toBe(b)
  })

  it('с группами тона — строки сортируются внутри группы, группы срочного не двигаются (П2)', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} defaultSort={{ key: 'name', direction: 'descending' }} />)
    const order = [...document.querySelectorAll('[data-group]')].map((g) => g.getAttribute('data-group'))
    expect(order).toEqual(['work.failing', 'work.unchecked', 'work.working'])
    const failing = document.querySelector('[data-group="work.failing"]')!
    expect([...failing.querySelectorAll('[data-slot=row] [role=cell]:first-child')].map((c) => c.textContent)).toEqual(['Кофейня «Зерно»', 'Детский клуб'])
  })

  it('управляемая: таблица зовёт onSortChange и показывает только то, что дали', () => {
    const onSortChange = vi.fn()
    const { rerender } = render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} sort={null} onSortChange={onSortChange} />)
    fireEvent.click(within(header('Кабинет')).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' } satisfies SortState)
    expect(names()).toEqual(cabinets.map((c) => c.name))
    rerender(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} sort={{ key: 'name', direction: 'ascending' }} onSortChange={onSortChange} />)
    expect(names()[0]).toBe('Автосервис «Ключ»')
  })

  it('сравнение: числа как числа, строки по-русски с числами внутри, пустое внизу', () => {
    const asc = (xs: Array<number | string | null>) => [...xs].sort((a, b) => compareSortValues(a, b, 'ascending'))
    expect(asc([10, 9, null, 100])).toEqual([9, 10, 100, null])
    expect([10, 9, null, 100].sort((a, b) => compareSortValues(a, b, 'descending'))).toEqual([100, 10, 9, null])
    expect(asc(['кабинет 10', 'кабинет 9', 'Анна', ''])).toEqual(['Анна', 'кабинет 9', 'кабинет 10', ''])
    expect(asc(['Жук', 'ель', 'ёж'])).toEqual(['ёж', 'ель', 'Жук']) // ё как е, регистр не важен
  })
})

describe('метка тона: StatusBadge с tone — четыре тона продукта, своя форма значка, слово обязательно', () => {
  it('каждый тон — свой знак и токены status-*; слово — продукта; data-status нет', () => {
    const tones: Array<[Tone, string]> = [['опасно', 'error'], ['внимание', 'warning'], ['хорошо', 'success'], ['нейтрально', 'neutral']]
    render(<>{tones.map(([t]) => <StatusBadge key={t} tone={t} label={`слово ${t}`} />)}</>)
    const tags = [...document.querySelectorAll('[data-slot=status-badge]')]
    expect(tags.map((t) => t.getAttribute('data-tone'))).toEqual(tones.map(([, k]) => k))
    tags.forEach((t, i) => {
      const k = tones[i][1]
      expect(t.hasAttribute('data-status')).toBe(false)
      expect(t.className).toContain(`bg-status-${k}-background`)
      expect(t.className).toContain(`text-status-${k}-text`)
      expect(t.querySelector('svg')?.getAttribute('data-tone-icon')).toBe(k)
    })
    expect(screen.getByText('слово опасно')).toBeTruthy()
  })

  it('тот же облик, что у статуса того же тона', () => {
    render(<><StatusBadge status="work.failing" /><StatusBadge tone="опасно" label="встало" /></>)
    const [a, b] = [...document.querySelectorAll('[data-slot=status-badge]')]
    expect(b.className).toBe(a.className)
  })

  it('чужой тон, метка без слова, тон в палитре Карты — ошибка', () => {
    quiet()
    // @ts-expect-error — тонов четыре
    expect(() => render(<StatusBadge tone="синий" label="x" />)).toThrow(/тонов продукта четыре/)
    // @ts-expect-error — у метки тона слово обязательно
    expect(() => render(<StatusBadge tone="опасно" />)).toThrow(/нет слова/)
    expect(() => render(<StatusBadge tone="опасно" label="x" palette="karta" />)).toThrow(/только палитра product/)
  })
})

describe('таблица: приглушённая строка (rowMuted) — неактивное серым, но читается', () => {
  const cols: Column<CabinetRow>[] = [
    { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true },
    { key: 'idle', header: 'Открутка', cell: (r) => r.idle ?? 'крутится' },
  ]
  const rowOf = (name: string) => screen.getByText(name).closest('[role=row]') as HTMLElement

  it('приглушена только строка с rowMuted: второй цвет текста токеном, фон и порядок те же, причина словом', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} />)
    const muted = rowOf('Барбершоп')
    expect(muted.getAttribute('data-muted')).toBe('true')
    expect(muted.className).toContain('text-text-secondary')
    expect(muted.className).toContain('bg-layer-01')
    expect(within(muted).getByText('не крутится 12 дней')).toBeTruthy()
    const live = rowOf('Студия йоги')
    expect(live.hasAttribute('data-muted')).toBe(false)
    expect(live.className).not.toContain('text-text-secondary')
    expect(document.querySelectorAll('[data-muted]')).toHaveLength(cabinets.filter((c) => c.idle).length)
    const names = screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0]?.textContent)
    expect(names).toEqual(cabinets.map((c) => c.name))
  })

  it('кнопка первой колонки приглушённой строки — тоже вторым цветом (а не основным поверх серой строки)', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} rowMuted={(r) => Boolean(r.idle)} onRowClick={() => {}} />)
    expect(within(rowOf('Барбершоп')).getByRole('button').className).toContain('text-text-secondary')
    expect(within(rowOf('Студия йоги')).getByRole('button').className).toContain('text-text-primary')
  })

  it('без rowMuted приглушённых строк нет', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    expect(document.querySelectorAll('[data-muted]')).toHaveLength(0)
  })
})

describe('таблица: подсказка у заголовка (Column.hint) — Tooltip ДС, не title', () => {
  const cols: Column<CabinetRow>[] = [
    { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true },
    { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist, hint: 'Кто ведёт кабинет' },
    { key: 'week', header: '7 дней', cell: (r) => String(r.week), align: 'end', sortValue: (r) => r.week, sortFirst: 'descending', hint: 'Открутка за 7 дней до вчера' },
  ]
  const header = (name: string) => screen.getByRole('columnheader', { name: new RegExp(name) })
  const described = (el: Element) => document.getElementById(el.getAttribute('aria-describedby') ?? '')?.textContent

  it('несортируемый: заголовок — кнопка с пунктиром, подсказка — описание; фокус открывает Tooltip, Esc прячет', async () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    const b = within(header('Таргетолог')).getByRole('button', { name: 'Таргетолог' })
    expect(b.getAttribute('data-slot')).toBe('column-hint')
    expect(described(b)).toBe('Кто ведёт кабинет')
    expect(b.querySelector('.decoration-dotted')).toBeTruthy()
    expect(header('Таргетолог').hasAttribute('title')).toBe(false)
    expect(document.querySelector('[role=columnheader] [title]')).toBeNull()
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Кто ведёт кабинет'))
    fireEvent.keyDown(b, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('сортируемый: одна кнопка — и сортирует, и держит подсказку (одна остановка Tab)', async () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    const buttons = within(header('7 дней')).getAllByRole('button')
    expect(buttons).toHaveLength(1)
    const b = buttons[0]!
    expect(b.getAttribute('data-slot')).toBe('sort')
    expect(described(b)).toBe('Открутка за 7 дней до вчера')
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Открутка за 7 дней до вчера'))
    fireEvent.click(b)
    expect(header('7 дней').getAttribute('aria-sort')).toBe('descending')
  })

  it('без hint — заголовок как был: текст без кнопки и без описания', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    expect(within(header('Кабинет')).queryByRole('button')).toBeNull()
    expect(document.querySelectorAll('[role=columnheader] [aria-describedby]')).toHaveLength(2)
  })
})

describe('таблица: широкая — колонки не ужимаются, прокрутка вбок, первая колонка стоит', () => {
  const cols: Column<CabinetRow>[] = [
    { key: 'name', header: 'Кабинет', cell: (r) => r.name, face: true, grow: 2 },
    { key: 'week', header: 'Открутка за 7 дней', cell: (r) => `${r.week} ₽`, align: 'end', minWidth: '12' },
    { key: 'tg', header: 'Таргетолог', cell: (r) => r.targetologist, grow: 0 },
  ]
  const table = () => screen.getByRole('table')

  it('колонка не уже самого длинного слова (min-content), а не ужимается в ноль; grow 0 — по содержимому', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    expect(table().style.getPropertyValue('--ds-cols')).toBe('minmax(min-content, 2fr) minmax(min-content, 1fr) max-content')
    expect(table().style.getPropertyValue('--ds-cols-phone')).toBe('minmax(min-content, 2fr)')
  })

  it('minWidth: шаг шкалы у шапки и клеток, значение в одну строку только в клетках (шапка переносится)', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    const head = screen.getByRole('columnheader', { name: 'Открутка за 7 дней' })
    expect(head.className).toContain('min-w-24')
    expect(head.className).not.toContain('whitespace-nowrap')
    const cell = screen.getByText('18400 ₽')
    expect(cell.className).toContain('min-w-24')
    expect(cell.className).toContain('whitespace-nowrap')
    expect(screen.getAllByText('Анна', { selector: '[role=cell]' })[0]!.className).toContain('min-w-0')
  })

  it('таблица — внутри своей прокрутки вбок и не уже суммы колонок (строки и рамки во всю ширину)', () => {
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} />)
    const scroll = table().parentElement!
    expect(scroll.getAttribute('data-slot')).toBe('table-scroll')
    expect(scroll.className).toContain('overflow-x-auto')
    expect(table().className).toContain('min-w-min')
  })

  it('первая колонка и слово группы закреплены (ds.css: sticky, фон строки; в свёрнутой группе — clip, не hidden)', () => {
    const css = readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')
    expect(css).toMatch(/\.ds-table \.ds-row > \[role='cell'\]:first-child,\s*\.ds-table \.ds-row > \[role='columnheader'\]:first-child \{\s*position: sticky;\s*left: 0;\s*z-index: 1;\s*background-color: inherit;/)
    expect(css).toMatch(/\.ds-table \.ds-expand > \* \{\s*overflow: clip;/)
    render(<DataTable<CabinetRow> label="К" rows={cabinets} columns={cols} getKey={(r) => r.id} getStatus={(r) => r.status} />)
    for (const h of screen.getAllByRole('rowheader')) expect(h.firstElementChild?.className).toContain('sticky')
  })
})
