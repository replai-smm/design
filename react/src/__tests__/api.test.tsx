/**
 * Правила API (DESIGN-APPROACH §3): одна главная кнопка на область и на поверхность (П5), опасное не рядом с главным (П10),
 * в строке главной нет (П5), лицо карточки ≤ 3 фактов и раскрытие не глубже 2 уровней (П7), срочное сверху и норма
 * свёрнута (П2, П3), «много» — «показать ещё» (П12), закрытый список статусов, фильтры в адресе.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { ActionArea, Button, Card, DataTable, List, Page, PageHeader, StatusBadge, FilterBar, useUrlFilters, Toaster, useToast, Drawer } from '../index'
import { STATUS_IDS, TONE_ORDER, statusOf, toneOf } from '../lib/status'
import { groups, many, type GroupRow } from '../stories/fixtures'
import statusesJson from '../../../statuses.json'

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
