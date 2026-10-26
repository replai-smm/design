/** Поверхности: одна анатомия (Tile) у плиток, уведомлений, состояния, кода, рамки графика; API Carbon. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { ActionableNotification, ChartFrame, ClickableTile, CodeSnippet, ExpandableTile, InlineNotification, StateView, StatTile, Tile, TileAboveTheFoldContent, TileBelowTheFoldContent } from '../index'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())
const ANATOMY = ['rounded-surface', 'border-line', 'bg-surface']

const tile = (above: React.ReactNode, below: React.ReactNode = 'детали', props = {}) => (
  <ExpandableTile {...props}>
    <TileAboveTheFoldContent>{above}</TileAboveTheFoldContent>
    <TileBelowTheFoldContent>{below}</TileBelowTheFoldContent>
  </ExpandableTile>
)

describe('одна поверхность', () => {
  it('у всех поверхностей — та же анатомия: слой, рамка, угол; заголовок — роль heading', () => {
    const { container } = render(
      <>
        <Tile>своё</Tile>
        <ClickableTile href="#x">переход</ClickableTile>
        {tile('Плитка')}
        <StatTile value={1} label="подпись" />
        <InlineNotification kind="error" title="Беда" />
        <ActionableNotification kind="error" title="Беда" actionButtonLabel="Повторить" hasFocus={false} />
        <StateView kind="ошибка" title="Не загрузилось" />
        <ChartFrame title="График" summary="вывод" />
      </>,
    )
    for (const slot of ['tile', 'clickable-tile', 'expandable-tile', 'stat-tile', 'inline-notification', 'actionable-notification', 'state-view', 'chart-frame']) {
      const el = container.querySelector(`[data-slot=${slot}]`)!
      for (const c of ANATOMY) expect(el.className, `${slot}: ${c}`).toContain(c)
      const title = el.querySelector('[data-part=title]')
      if (title && slot !== 'stat-tile') expect(title.className, slot).toContain('text-heading')
    }
  })

  it('метка уведомления — одна ширина, цвет вида; код — утопленный (холст)', () => {
    const { container } = render(
      <>
        <InlineNotification kind="warning" title="a" />
        <InlineNotification kind="success" title="b" />
        <CodeSnippet>x</CodeSnippet>
      </>,
    )
    const [a, b] = container.querySelectorAll('[data-mark]')
    expect(a.className).toContain('border-l-2')
    expect(a.className).toContain('border-l-warning')
    expect(b.getAttribute('data-mark')).toBe('success')
    expect(container.querySelector('[data-slot=code-snippet]')!.className).toContain('bg-canvas')
  })
})

describe('плитки (Carbon: Tile, ClickableTile, ExpandableTile)', () => {
  it('Tile kind: метка слева цвета вида, как у уведомления; без kind — тихая плитка', () => {
    const { container } = render(
      <>
        <Tile>тихая</Tile>
        <Tile kind="error">беда</Tile>
        <Tile kind="warning">внимание</Tile>
      </>,
    )
    const [quietTile, error, warning] = [...container.querySelectorAll<HTMLElement>('[data-slot="tile"]')]
    expect(quietTile!.hasAttribute('data-mark')).toBe(false)
    expect(quietTile!.className).not.toContain('border-l-2')
    expect(error!.getAttribute('data-kind')).toBe('error')
    expect(error!.hasAttribute('data-mark')).toBe(true)
    expect(error!.className).toContain('border-l-2')
    expect(error!.className).toContain('border-l-danger')
    expect(warning!.className).toContain('border-l-warning')
    for (const t of [error!, warning!]) for (const c of ANATOMY) expect(t.className).toContain(c)
  })

  it('ClickableTile: с href — ссылка, без него — кнопка; выключенная не нажимается', () => {
    const onClick = vi.fn()
    render(
      <>
        <ClickableTile href="#a">Ссылка</ClickableTile>
        <ClickableTile onClick={onClick}>Действие</ClickableTile>
        <ClickableTile onClick={onClick} disabled>
          Выкл
        </ClickableTile>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Ссылка' }).getAttribute('href')).toBe('#a')
    fireEvent.click(screen.getByRole('button', { name: 'Действие' }))
    fireEvent.click(screen.getByRole('button', { name: 'Выкл' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ExpandableTile: кнопка раскрывает, слово и имя — по Carbon; expanded — снаружи; onClick зовётся', () => {
    const onClick = vi.fn()
    const { rerender } = render(tile('Лицо', 'детали', { tileCollapsedLabel: 'Подробнее', tileExpandedLabel: 'Свернуть', onClick }))
    const b = screen.getByRole('button', { name: 'Подробнее' })
    expect(b.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById(b.getAttribute('aria-controls')!)!.hasAttribute('inert')).toBe(true)
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Свернуть' }).getAttribute('aria-expanded')).toBe('true')
    rerender(tile('Лицо', 'детали', { expanded: true }))
    expect(screen.getByRole('button', { name: 'Свернуть' }).getAttribute('aria-expanded')).toBe('true')
    rerender(tile('Лицо', 'детали', { expanded: false }))
    expect(screen.getByRole('button', { name: 'Подробнее' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('приманка П7: на лице заголовок и больше трёх фактов — ошибка; третий уровень раскрытия — ошибка', () => {
    quiet()
    expect(() => render(tile([<p key="h">З</p>, <p key="1">1</p>, <p key="2">2</p>, <p key="3">3</p>, <p key="4">4</p>]))).toThrow(/не больше 3 фактов/)
    expect(() => render(tile('1', tile('2', tile('3', 'нельзя'))))).toThrow(/глубже 2 уровней/)
    vi.restoreAllMocks()
    expect(() => render(tile([<p key="h">З</p>, <p key="1">1</p>, <p key="2">2</p>, <p key="3">3</p>], tile('2', <Tile>3</Tile>)))).not.toThrow()
  })
})

describe('плитка с цифрой и состояние', () => {
  it('плитка с onClick — ClickableTile; беда — знак и слово; сравнение — метки рядов и разница', () => {
    const onClick = vi.fn()
    render(<StatTile value={17} label="проектов" alert={{ tone: 'опасно', text: '2 без доступа' }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /^17/ }))
    expect(onClick).toHaveBeenCalled()
    expect(document.querySelector('[data-part=alert] svg[data-icon=tone-danger]')).toBeTruthy()
    const { container } = render(<StatTile variant="metric" value="3 420" label="Ср." compare={{ value: '3 040', delta: 12.5 }} />)
    expect([...container.querySelectorAll('[data-series]')].map((m) => m.className.match(/bg-series-\d/)?.[0])).toEqual(['bg-series-1', 'bg-series-2'])
    expect(container.textContent).toContain('больше на')
  })

  it('состояние: знак тона состояния, ошибка — alert', () => {
    const { container } = render(<StateView kind="нет доступа" title="Нет доступа" />)
    expect(container.querySelector('svg[data-icon=tone-warning]')).toBeTruthy()
    render(<StateView kind="ошибка" title="Не загрузилось" />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})

describe('уведомления (Carbon: InlineNotification, ActionableNotification)', () => {
  it('kind по умолчанию — error; role — status; знак — картинка со словом вида', () => {
    render(<InlineNotification title="Беда" subtitle="Подробно" hideCloseButton />)
    const note = screen.getByRole('status')
    expect(note.getAttribute('data-kind')).toBe('error')
    expect(within(note).getByRole('img', { name: 'Ошибка' }).getAttribute('data-icon')).toBe('tone-danger')
    expect(within(note).queryByRole('button')).toBeNull()
  })

  it('«закрыть» есть по умолчанию: onCloseButtonClick, потом onClose; onClose вернул false — остаётся', () => {
    const order: string[] = []
    const { unmount } = render(<InlineNotification kind="info" title="Только просмотр" onCloseButtonClick={() => order.push('кнопка')} onClose={() => (order.push('закрыть'), false)} />)
    const close = screen.getByRole('button', { name: 'Закрыть уведомление' })
    expect(close.dataset.slot).toBe('button')
    fireEvent.click(close)
    expect(order).toEqual(['кнопка', 'закрыть'])
    expect(screen.getByRole('status')).toBeTruthy()
    unmount()
    render(<InlineNotification kind="info" title="Уйдёт" aria-label="Скрыть" />)
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть' }))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('ActionableNotification: alertdialog, фокус на действии, Tab по кругу, Esc закрывает; inline — тихая кнопка, без него — с рамкой и тенью', () => {
    const onAction = vi.fn()
    const onClose = vi.fn()
    const { container, rerender } = render(<ActionableNotification kind="warning" title="Не загрузилось" subtitle="Сервер молчит" actionButtonLabel="Повторить" onActionButtonClick={onAction} onClose={onClose} />)
    const dlg = screen.getByRole('alertdialog', { name: 'Не загрузилось' })
    const act1 = screen.getByRole('button', { name: 'Повторить' })
    expect(document.activeElement).toBe(act1)
    expect(act1.dataset.kind).toBe('tertiary')
    expect(dlg.className).toContain('shadow-raised')
    const close = screen.getByRole('button', { name: 'Закрыть уведомление' })
    act(() => close.focus())
    fireEvent.keyDown(close, { key: 'Tab' })
    expect(document.activeElement).toBe(act1)
    fireEvent.click(act1)
    expect(onAction).toHaveBeenCalled()
    fireEvent.keyDown(act1, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
    expect(container.querySelector('[data-slot=actionable-notification]')).toBeNull()
    rerender(<ActionableNotification key="b" inline hasFocus={false} role="status" kind="info" title="Б" actionButtonLabel="Открыть" />)
    expect(screen.getByRole('button', { name: 'Открыть' }).dataset.kind).toBe('ghost')
    expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Открыть' }))
  })
})

describe('код и рамка графика', () => {
  it('CodeSnippet: «Копировать» пишет в буфер и говорит «Скопировано»; multi свёрнут до 15 строк — «Показать ещё»', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    try {
      const code = Array.from({ length: 20 }, (_, i) => `строка ${i}`).join('\n')
      const { container } = render(
        <CodeSnippet type="multi" aria-label="Вывод">
          {code}
        </CodeSnippet>,
      )
      const pre = screen.getByRole('textbox', { name: 'Вывод' })
      expect(pre.getAttribute('aria-readonly')).toBe('true')
      expect(pre.style.getPropertyValue('--lines')).toBe('15')
      const more = screen.getByRole('button', { name: /Показать ещё/ })
      fireEvent.click(more)
      expect(pre.hasAttribute('data-lines')).toBe(false)
      expect(screen.getByRole('button', { name: /Свернуть/ }).getAttribute('aria-expanded')).toBe('true')
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Копировать' })))
      expect(writeText).toHaveBeenCalledWith(code)
      expect(container.querySelector('[aria-live=polite]')!.textContent).toBe('Скопировано')
      render(<CodeSnippet hideCopyButton>npm test</CodeSnippet>)
      expect(screen.getAllByRole('button', { name: /Копировать|Скопировано/ })).toHaveLength(1)
    } finally {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('рамка: заголовок и вывод связаны с рисунком; легенда — ряд и вид линии; состояния вместо графика', () => {
    const { rerender } = render(
      <ChartFrame title="Посещения" summary="вырос" legend={[{ key: 'a', label: 'А' }, { key: 'b', label: 'Б', series: 1, line: 'dashed' }]}>
        <svg />
      </ChartFrame>,
    )
    const fig = screen.getByRole('figure', { name: 'Посещения' })
    expect(document.getElementById(fig.getAttribute('aria-describedby')!)?.textContent).toBe('вырос')
    const items = within(screen.getByRole('list', { name: 'Легенда' })).getAllByRole('listitem')
    expect(items[1].getAttribute('data-line')).toBe('dashed')
    rerender(<ChartFrame title="Посещения" summary="вырос" state="error" error={{ title: 'Не загрузился' }} legend={[{ key: 'a', label: 'А' }]} />)
    expect(screen.getByRole('alert').textContent).toContain('Не загрузился')
    expect(screen.queryByRole('list', { name: 'Легенда' })).toBeNull()
  })
})
