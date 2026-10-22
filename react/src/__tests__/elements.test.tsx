/**
 * Элементы и правила API: одна главная на область и поверхность (П5), опасное не рядом (П10), в строке — только ghost,
 * закрытый список статусов и словарь тонов, счётчик, шаги, шкала, ход в строке, разница, график, значок.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionArea, Button, Chart, chartHasData, CountBadge, countText, DataTable, Delta, deltaText, Dialog, Icon, InlineLoading, Meter, meterTone, niceMax, Notification, Page, PageHeader, StatusBadge, Steps, stepProgress, tickIndexes, ticksOf } from '../index'
import { STATUS_IDS, TONE, TONE_ORDER, statusOf, toneOf } from '../lib/vocab'
import { groups, type GroupRow } from '../stories/fixtures'
import statusesJson from '../../../statuses.json'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

describe('кнопки: одна главная (П5), опасное не рядом (П10)', () => {
  it('у Button нет главного вида — главная только через ActionArea, она — инверсия', () => {
    // @ts-expect-error — главного вида у Button нет в типе
    const bad = <Button variant="primary">x</Button>
    expect(bad).toBeTruthy()
    render(<ActionArea primary={{ label: 'Сохранить' }} />)
    const b = screen.getByRole('button', { name: 'Сохранить' })
    expect(b.dataset.variant).toBe('primary')
    expect(b.className).toContain('bg-inverse')
  })

  it('две главные на одной странице — ошибка; окно — своя поверхность', () => {
    quiet()
    expect(() =>
      render(
        <Page header={<PageHeader title="Т" />}>
          <ActionArea primary={{ label: 'Первая' }} />
          <ActionArea primary={{ label: 'Вторая' }} />
        </Page>,
      ),
    ).toThrow(/вторая главная кнопка/)
    render(
      <Page header={<PageHeader title="Т" />}>
        <ActionArea primary={{ label: 'Главная страницы' }} />
        <Dialog open title="Окно" actions={<ActionArea primary={{ label: 'Главная окна' }} />} />
      </Page>,
    )
    expect(document.querySelectorAll('[data-variant=primary]')).toHaveLength(2)
  })

  it('область в области — ошибка; опасное рядом с главной — ошибка', () => {
    quiet()
    expect(() => render(<ActionArea primary={{ label: 'А' }}><ActionArea primary={{ label: 'Б' }} /></ActionArea>)).toThrow(/внутри другой области/)
    expect(() => render(<ActionArea primary={{ label: 'Сохранить' }}><Button tone="опасно">Удалить</Button></ActionArea>)).toThrow(/опасное/)
  })

  it('в строке: область — ошибка, рамочная и опасная — ошибка, ghost — можно', () => {
    quiet()
    const t = (action: React.ReactNode) => render(<DataTable<GroupRow> label="т" rows={groups.slice(0, 1)} columns={[{ key: 'n', header: 'Н', cell: (r) => r.name, face: true }]} getKey={(r) => r.id} rowAction={() => action} />)
    expect(() => t(<ActionArea primary={{ label: 'x' }} />)).toThrow(/в строке списка нет области/)
    expect(() => t(<Button>x</Button>)).toThrow(/только ghost/)
    expect(() => t(<Button variant="ghost" tone="опасно">x</Button>)).toThrow(/только ghost/)
    expect(() => t(<Button variant="ghost">Починить</Button>)).not.toThrow()
  })

  it('rule → data-rule, loading → aria-busy и disabled; кнопка-значок без подписи — ошибка', () => {
    render(<ActionArea primary={{ label: 'Сохранить', rule: 'R-12', loading: true }} />)
    const b = screen.getByRole('button', { name: 'Сохранить' })
    expect(b.dataset.rule).toBe('R-12')
    expect(b.getAttribute('aria-busy')).toBe('true')
    expect((b as HTMLButtonElement).disabled).toBe(true)
    quiet()
    expect(() => render(<Button icon="close" />)).toThrow(/aria-label/)
    render(<Button icon="close" aria-label="закрыть" />)
    expect(screen.getByRole('button', { name: 'закрыть' }).querySelector('svg[data-icon=close]')).toBeTruthy()
  })

  it('плотность: обычная 48/40, dense — 32', () => {
    render(
      <>
        <Button>А</Button>
        <Button dense>Б</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'А' }).className).toContain('min-h-touch md:min-h-control')
    expect(screen.getByRole('button', { name: 'Б' }).className).toContain('min-h-dense')
  })
})

describe('метка статуса и словарь тонов', () => {
  it('список статусов — ровно statuses.json; неизвестный — ошибка', () => {
    expect([...STATUS_IDS]).toEqual(statusesJson.statuses.map((s) => s.id))
    quiet()
    expect(() => render(<StatusBadge status={'work.unknown' as never} />)).toThrow(/закрытом списке/)
  })

  it('слово закона и знак тона; подложка — только у «опасно» и «внимание»', () => {
    for (const id of STATUS_IDS) {
      const { container, unmount } = render(<StatusBadge status={id} />)
      const el = container.querySelector('[data-slot=status-badge]')!
      expect(el.textContent).toBe(statusOf(id).say)
      expect(el.querySelector('svg[data-icon^=tone-]')).toBeTruthy()
      const look = TONE[toneOf(id)]
      if (look.bg) expect(el.className).toContain(look.bg)
      else expect(el.className).not.toMatch(/\bbg-/)
      unmount()
    }
  })

  it('«работает» — знак «хорошо» без подложки (норма не кричит)', () => {
    const { container } = render(<StatusBadge status="work.working" />)
    const el = container.querySelector('[data-slot=status-badge]')!
    expect(el.getAttribute('data-tone')).toBe('success')
    expect(el.className).not.toContain('rounded-full')
  })

  it('тон со своим словом; без слова и чужой тон — ошибка', () => {
    render(<StatusBadge tone="внимание" label="ниже среднего" />)
    expect(screen.getByText('ниже среднего').closest('[data-slot=status-badge]')?.getAttribute('data-tone')).toBe('warning')
    quiet()
    // @ts-expect-error — у метки тона слово обязательно
    expect(() => render(<StatusBadge tone="опасно" />)).toThrow(/нет слова/)
    // @ts-expect-error — тона «синий» нет
    expect(() => render(<StatusBadge tone="синий" label="x" />)).toThrow(/тона «синий» нет/)
  })

  it('«решение» — фиолетовый тон с подложкой: метка, счётчик со знаком, значок, уведомление; в порядке внимания — сразу за «опасно»', () => {
    const { container } = render(
      <>
        <StatusBadge tone="решение" label="ждёт решения" />
        <CountBadge count={2} tone="решение" />
        <Icon tone="решение" />
        <Notification tone="решение" title="Нужно решение" />
      </>,
    )
    const badge = container.querySelector('[data-slot=status-badge]')!
    expect(badge.getAttribute('data-tone')).toBe('decision')
    expect(badge.className).toContain('bg-decision-bg')
    expect(badge.className).toContain('text-decision-fg')
    expect(container.querySelector('[data-slot=count-badge] svg[data-icon=tone-decision]')).toBeTruthy()
    expect(container.querySelector(':scope > svg[data-icon=tone-decision]')?.getAttribute('class')).toContain('text-decision')
    const note = container.querySelector('[data-slot=notification]')!
    expect(note.getAttribute('data-mark')).toBe('decision')
    expect(note.className).toContain('border-l-decision')
    expect(note.getAttribute('role')).toBe('status')
    expect(TONE_ORDER.slice(0, 3)).toEqual(['опасно', 'решение', 'внимание'])
  })
})

describe('значок', () => {
  it('по имени — украшение; по тону — знак своей формы и цвета; с label — картинка для читалки', () => {
    const { container } = render(
      <>
        <Icon name="close" />
        <Icon tone="опасно" />
        <Icon name="search" label="поиск" />
      </>,
    )
    const [a, b] = container.querySelectorAll('svg')
    expect(a.getAttribute('aria-hidden')).toBe('true')
    expect(b.getAttribute('data-icon')).toBe('tone-danger')
    expect(b.getAttribute('class')).toContain('text-danger')
    expect(screen.getByRole('img', { name: 'поиск' })).toBeTruthy()
  })
})

describe('счётчик', () => {
  it('число до 99, «99+» сверху, строка как есть; label — для читалки; новое — инверсия', () => {
    expect([countText(5), countText(100), countText('!')]).toEqual(['5', '99+', '!'])
    render(<CountBadge count={3} tone="инфо" label="непрочитанных" />)
    const el = document.querySelector('[data-slot=count-badge]')!
    expect(el.textContent).toBe('непрочитанных: 3')
    expect(el.className).toContain('bg-inverse')
  })

  it('срочное — со знаком тона, не только цветом; обычное — без знака', () => {
    const { container } = render(<CountBadge count={7} tone="опасно" />)
    expect(container.querySelector('svg[data-icon=tone-danger]')).toBeTruthy()
    const n = render(<CountBadge count={7} />)
    expect(n.container.querySelector('svg')).toBeNull()
  })
})

describe('ход работы — один словарь', () => {
  it('шаги: done · running · idle · error; текущий — aria-current=step; телефон — «Шаг 2 из 4 · Куда»', () => {
    expect([0, 1, 2, 3].map((i) => stepProgress(i, 2))).toEqual(['done', 'done', 'running', 'idle'])
    expect(stepProgress(3, 3, 3)).toBe('error')
    render(<Steps label="Шаги публикации" steps={['Текст', 'Куда', 'Предпросмотр', 'Итог']} current={1} />)
    const nav = screen.getByRole('navigation', { name: 'Шаги публикации' })
    const items = nav.querySelectorAll('[data-slot=step]')
    expect([...items].map((li) => li.getAttribute('data-progress'))).toEqual(['done', 'running', 'idle', 'idle'])
    expect(items[1].getAttribute('aria-current')).toBe('step')
    expect(items[0].textContent).toContain('пройден')
    expect(nav.querySelector('[data-slot=steps-compact]')!.textContent).toBe('Шаг 2 из 4 · Куда')
  })

  it('назад — только к пройденным; меньше двух шагов — ошибка', () => {
    const seen: number[] = []
    render(<Steps label="Шаги" steps={['А', 'Б', 'В']} current={2} onStepClick={(i) => seen.push(i)} />)
    const btns = screen.getAllByRole('button')
    expect(btns).toHaveLength(2)
    fireEvent.click(btns[0])
    expect(seen).toEqual([0])
    quiet()
    expect(() => render(<Steps label="Шаги" steps={['А']} current={0} />)).toThrow(/шагов меньше двух/)
  })

  it('ход в строке: идёт — role=status со словом; ошибка — слово цвета «опасно»', () => {
    const { container, rerender } = render(<InlineLoading label="работает" />)
    expect(screen.getByRole('status').textContent).toContain('работает')
    expect(container.querySelector('[data-slot=spinner]')).toBeTruthy()
    rerender(<InlineLoading label="не вышло" progress="error" />)
    expect(screen.getByText('не вышло').className).toContain('text-danger-fg')
  })

  it('шкала: ниже 80 % без тона, с 80 % — внимание, с 95 % — опасно; role=meter со словом', () => {
    expect([meterTone(0.5), meterTone(0.8), meterTone(0.95)]).toEqual([null, 'внимание', 'опасно'])
    render(<Meter label="5 ч" value={97} valueText="97 % · сброс 18:40" />)
    const m = screen.getByRole('meter', { name: '5 ч' })
    expect(m.getAttribute('aria-valuetext')).toBe('97 % · сброс 18:40')
    expect(document.querySelector('[data-slot=meter] svg[data-icon=tone-danger]')).toBeTruthy()
  })
})

describe('разница и график', () => {
  it('разница: проценты и рубли словами; перерасход — знак «опасно»; ноль — без стрелки', () => {
    expect(deltaText(12.5)).toBe('12,5%')
    expect(deltaText(-1234, '₽')).toBe('1\u00a0234 ₽')
    const { container, rerender } = render(<Delta value={1234} unit="₽" higherIsBetter={false} />)
    expect(container.textContent).toContain('больше на')
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('text-danger')
    rerender(<Delta value={0} />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('без изменений')
  })

  it('график: ряды — роли рядов данных, не цвета тонов; вид линии; role=img', () => {
    const { container } = render(<Chart kind="line" label="Охват" labels={['1', '2', '3']} series={[{ key: 'a', label: 'А', data: [1, 2, 3] }, { key: 'b', label: 'Б', data: [3, 2, null], line: 'dashed', series: 4 }]} />)
    expect(screen.getByRole('img', { name: 'Охват' })).toBeTruthy()
    const lines = container.querySelectorAll('polyline')
    expect(lines[0].getAttribute('class')).toBe('stroke-series-1')
    expect(lines[1].getAttribute('class')).toBe('stroke-series-5')
    expect(lines[1].getAttribute('stroke-dasharray')).toBe('6 4')
    expect(container.innerHTML).not.toMatch(/danger|warning|success/)
  })

  it('заливка под линией: цвет ряда тише до оси, только у одного ряда линий', () => {
    const one = [{ key: 'a', label: 'А', data: [1, null, 3], series: 2 }]
    const { container, rerender } = render(<Chart kind="line" area label="Охват" labels={['1', '2', '3']} series={one} />)
    const area = container.querySelector('[data-slot=chart-area]')!
    expect(area.getAttribute('class')).toBe('fill-series-3')
    expect(Number(area.getAttribute('fill-opacity'))).toBeLessThan(1)
    expect(area.getAttribute('d')).toMatch(/^M[\d.]+,216 L.* L[\d.]+,216 Z$/)
    rerender(<Chart kind="line" area label="Охват" labels={['1', '2', '3']} series={[...one, { key: 'b', label: 'Б', data: [3, 2, 1] }]} />)
    expect(container.querySelector('[data-slot=chart-area]')).toBeNull()
    rerender(<Chart kind="line" label="Охват" labels={['1', '2', '3']} series={one} />)
    expect(container.querySelector('[data-slot=chart-area]')).toBeNull()
  })

  it('ось: круглый верх, подписи X не чаще 10; мало данных — chartHasData ложь', () => {
    expect([niceMax(0), niceMax(7), niceMax(130)]).toEqual([1, 10, 200])
    expect(ticksOf(200)).toEqual([0, 50, 100, 150, 200])
    expect(tickIndexes(30)).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27])
    expect(chartHasData('line', [{ key: 'a', label: 'a', data: [1, null] }])).toBe(false)
    expect(chartHasData('bar', [{ key: 'a', label: 'a', data: [1] }])).toBe(true)
  })
})
