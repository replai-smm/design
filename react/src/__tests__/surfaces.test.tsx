/** Поверхности: одна анатомия (Surface) у карточки, плитки, уведомления, состояния, кода, рамки графика. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Card, ChartFrame, CodeBlock, Notification, StateView, StatTile, Surface } from '../index'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())
const ANATOMY = ['rounded-surface', 'border-line', 'bg-surface']

describe('одна поверхность', () => {
  it('у всех поверхностей — та же анатомия: слой, рамка, угол; заголовок — роль heading', () => {
    const { container } = render(
      <>
        <Surface>своё</Surface>
        <Card title="Карточка" />
        <StatTile value={1} label="подпись" />
        <Notification tone="опасно" title="Беда" />
        <StateView kind="ошибка" title="Не загрузилось" />
        <ChartFrame title="График" summary="вывод" />
      </>,
    )
    for (const slot of ['surface', 'card', 'stat-tile', 'notification', 'state-view', 'chart-frame']) {
      const el = container.querySelector(`[data-slot=${slot}]`)!
      for (const c of ANATOMY) expect(el.className, `${slot}: ${c}`).toContain(c)
      const title = el.querySelector('[data-part=title]')
      if (title && slot !== 'stat-tile') expect(title.className, slot).toContain('text-heading')
    }
  })

  it('метка слева — одна ширина, цвет тона; утопленная — холст', () => {
    const { container } = render(
      <>
        <Surface mark="внимание">a</Surface>
        <Notification tone="опасно" title="b" />
        <CodeBlock code="x" />
      </>,
    )
    const [a, b] = container.querySelectorAll('[data-mark]')
    expect(a.className).toContain('border-l-2')
    expect(a.className).toContain('border-l-warning')
    expect(b.className).toContain('border-l-2')
    expect(container.querySelector('[data-slot=code-block]')!.className).toContain('bg-canvas')
  })
})

describe('карточка: лицо ≤ 3 (П7), раскрытие не глубже 2 уровней', () => {
  it('четыре факта — ошибка; третий уровень — ошибка; «подробнее» раскрывает', () => {
    quiet()
    expect(() => render(<Card title="К" facts={['1', '2', '3', '4']} />)).toThrow(/не больше 3/)
    expect(() => render(<Card title="1" more={<Card title="2" more={<Card title="3" more="нельзя" />} />} />)).toThrow(/глубже 2 уровней/)
    vi.restoreAllMocks()
    render(<Card title="К" more="детали" />)
    const b = screen.getByRole('button', { name: /подробнее/ })
    fireEvent.click(b)
    expect(b.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('плитка, уведомление, состояние', () => {
  it('плитка с onClick — кнопка; беда — знак и слово; сравнение — метки рядов и разница', () => {
    const onClick = vi.fn()
    render(<StatTile value={17} label="проектов" alert={{ tone: 'опасно', text: '2 без доступа' }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /^17/ }))
    expect(onClick).toHaveBeenCalled()
    expect(document.querySelector('[data-part=alert] svg[data-icon=tone-danger]')).toBeTruthy()
    const { container } = render(<StatTile variant="metric" value="3 420" label="Ср." compare={{ value: '3 040', delta: 12.5 }} />)
    expect([...container.querySelectorAll('[data-series]')].map((m) => m.className.match(/bg-series-\d/)?.[0])).toEqual(['bg-series-1', 'bg-series-2'])
    expect(container.textContent).toContain('больше на')
  })

  it('уведомление: опасно — alert, остальное — status; «закрыть» — та же кнопка, что у окна', () => {
    const onClose = vi.fn()
    render(<Notification tone="инфо" title="Только просмотр" onClose={onClose} />)
    expect(screen.getByRole('status')).toBeTruthy()
    const close = screen.getByRole('button', { name: 'закрыть' })
    expect(close.dataset.slot).toBe('button')
    fireEvent.click(close)
    expect(onClose).toHaveBeenCalled()
  })

  it('состояние: знак тона состояния, ошибка — alert', () => {
    const { container } = render(<StateView kind="нет доступа" title="Нет доступа" />)
    expect(container.querySelector('svg[data-icon=tone-warning]')).toBeTruthy()
    render(<StateView kind="ошибка" title="Не загрузилось" />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})

describe('блок кода и рамка графика', () => {
  it('«Копировать» пишет в буфер и показывает «скопировано»; maxLines — переменная высоты', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    try {
      const { container } = render(<CodeBlock code="npm test" label="bash" maxLines={6} />)
      expect((container.querySelector('pre') as HTMLElement).style.getPropertyValue('--lines')).toBe('6')
      fireEvent.click(screen.getByRole('button', { name: 'Копировать' }))
      expect(writeText).toHaveBeenCalledWith('npm test')
      expect(await screen.findByRole('button', { name: 'скопировано' })).toBeTruthy()
    } finally {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('рамка: заголовок и вывод связаны с рисунком; легенда — ряд и вид линии; состояния вместо графика', () => {
    const { rerender } = render(<ChartFrame title="Посещения" summary="вырос" legend={[{ key: 'a', label: 'А' }, { key: 'b', label: 'Б', series: 1, line: 'dashed' }]}><svg /></ChartFrame>)
    const fig = screen.getByRole('figure', { name: 'Посещения' })
    expect(document.getElementById(fig.getAttribute('aria-describedby')!)?.textContent).toBe('вырос')
    const items = within(screen.getByRole('list', { name: 'Легенда' })).getAllByRole('listitem')
    expect(items[1].getAttribute('data-line')).toBe('dashed')
    rerender(<ChartFrame title="Посещения" summary="вырос" state="error" error={{ title: 'Не загрузился' }} legend={[{ key: 'a', label: 'А' }]} />)
    expect(screen.getByRole('alert').textContent).toContain('Не загрузился')
    expect(screen.queryByRole('list', { name: 'Легенда' })).toBeNull()
  })
})
