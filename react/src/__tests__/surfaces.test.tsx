/** Поверхности: одна анатомия (Surface) у карточки, плитки, уведомления, состояния, кода, рамки графика, решения; схема. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Card, ChartFrame, CodeBlock, DecisionCard, Diagram, edgePath, litSet, Notification, ReplyBox, StateView, StatTile, Surface } from '../index'
import { ringEdges, ringNodes } from '../stories/agent-fixtures'

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
        <DecisionCard title="Решение" primary={{ label: 'Да' }} />
      </>,
    )
    for (const slot of ['surface', 'card', 'stat-tile', 'notification', 'state-view', 'chart-frame', 'decision-card']) {
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
    render(<StatTile value={17} label="сообществ" alert={{ tone: 'опасно', text: '2 без доступа' }} onClick={onClick} />)
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
    const { rerender } = render(<ChartFrame title="Охват" summary="вырос" legend={[{ key: 'a', label: 'А' }, { key: 'b', label: 'Б', series: 1, line: 'dashed' }]}><svg /></ChartFrame>)
    const fig = screen.getByRole('figure', { name: 'Охват' })
    expect(document.getElementById(fig.getAttribute('aria-describedby')!)?.textContent).toBe('вырос')
    const items = within(screen.getByRole('list', { name: 'Легенда' })).getAllByRole('listitem')
    expect(items[1].getAttribute('data-line')).toBe('dashed')
    rerender(<ChartFrame title="Охват" summary="вырос" state="error" error={{ title: 'Не загрузился' }} legend={[{ key: 'a', label: 'А' }]} />)
    expect(screen.getByRole('alert').textContent).toContain('Не загрузился')
    expect(screen.queryByRole('list', { name: 'Легенда' })).toBeNull()
  })
})

describe('карточка решения (чат)', () => {
  it('ждёт слова: метка «инфо», своя область главной — главная поля ответа рядом не спорит', () => {
    render(
      <>
        <DecisionCard title="На прод?" primary={{ label: 'На прод' }} />
        <ReplyBox label="Сообщение" onSend={() => {}} />
      </>,
    )
    expect(document.querySelectorAll('[data-variant=primary]')).toHaveLength(2)
    expect(document.querySelector('[data-slot=decision-card]')!.getAttribute('data-mark')).toBe('info')
  })

  it('отвечено — кнопок и метки нет, слово ответа и время; больше трёх фактов — ошибка', () => {
    render(<DecisionCard title="Разрешение" primary={{ label: 'Да' }} answered={{ word: 'Разрешено', time: '14:20', tone: 'хорошо' }} />)
    const card = document.querySelector('[data-slot=decision-card]')!
    expect(within(card as HTMLElement).queryAllByRole('button')).toHaveLength(0)
    expect(card.hasAttribute('data-mark')).toBe(false)
    expect(card.textContent).toContain('Разрешено14:20')
    quiet()
    expect(() => render(<DecisionCard title="x" facts={['1', '2', '3', '4']} primary={{ label: 'Да' }} />)).toThrow(/не больше 3/)
  })
})

describe('схема (чат)', () => {
  it('узел горит, если горит он или что внутри; связь — прямо или дугой', () => {
    expect([...litSet(ringNodes, ['input/probe']).nodes]).toEqual(['input'])
    expect(edgePath([0, 0], [1, 1])).toBe('M0 0L100 100')
    expect(edgePath([0, 0], [1, 0], [0.5, 0.5])).toMatch(/^M0 0Q/)
  })

  it('указатель: подсветка, фокус — aria-current, остальное приглушено; onSelect — адреса', () => {
    const onSelect = vi.fn()
    const { container } = render(<Diagram label="Круг" nodes={ringNodes} edges={ringEdges} highlight={['input/probe']} focus="execution" dim onSelect={onSelect} />)
    expect(container.querySelector('[data-address=execution]')!.getAttribute('aria-current')).toBe('location')
    expect(container.querySelector('[data-address=event]')!.className).toContain('opacity-40')
    fireEvent.click(screen.getByRole('button', { name: 'k8w1qa · фильтр по дате' }))
    expect(onSelect).toHaveBeenCalledWith('k8w1qa')
  })
})
