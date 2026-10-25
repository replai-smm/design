/** Слои и паттерны: окно и шторка, подтверждение, всплывашка; вкладки, фильтры, три колонки, переписка, поле ответа, текст ответа. */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react'
import { ActionArea, Button, ChatThread, ConfirmProvider, Dialog, FilterBar, Prose, ReplyBox, Tabs, TextField, ThreeColumn, Toaster, useConfirm, useToast, useUrlFilters } from '../index'
import { chat, chatFailed } from '../stories/fixtures'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

afterEach(() => vi.restoreAllMocks())

describe('окно', () => {
  it('фокус — на первом поле; Esc закрывает; «закрыть» — одна кнопка ДС', async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open title="Новая сессия" onOpenChange={onOpenChange}>
        <TextField label="Папка" />
      </Dialog>,
    )
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Папка')))
    expect(screen.getByRole('button', { name: 'закрыть' }).dataset.slot).toBe('button')
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('шторка снизу на телефоне, слева — side="left"; во весь экран — full', () => {
    const { rerender } = render(<Dialog open title="О" />)
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('bottom')
    rerender(<Dialog open title="О" side="left" />)
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('left')
    rerender(<Dialog open title="О" size="full" />)
    expect(screen.getByRole('dialog').className).toContain('h-dvh')
  })

  it('две главные в окне — ошибка', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <Dialog open title="О" actions={<ActionArea primary={{ label: 'А' }} />}>
          <ActionArea primary={{ label: 'Б' }} />
        </Dialog>,
      ),
    ).toThrow(/вторая главная/)
  })
})

describe('подтверждение', () => {
  function Ask({ danger, onAnswer }: { danger?: boolean; onAnswer: (v: boolean) => void }) {
    const confirm = useConfirm()
    return <Button onClick={async () => onAnswer(await confirm({ title: 'Удалить файл?', danger }))}>спросить</Button>
  }

  it('опасное: кнопка тона «опасно» без главной, фокус на «Отмена»; «да» — true', async () => {
    const onAnswer = vi.fn()
    render(
      <ConfirmProvider>
        <Ask danger onAnswer={onAnswer} />
      </ConfirmProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'спросить' }))
    const del = await screen.findByRole('button', { name: 'Удалить' })
    expect(del.dataset.tone).toBe('danger')
    expect(document.querySelector('[data-variant=primary]')).toBeNull()
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Отмена'))
    await act(async () => fireEvent.click(del))
    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('вне поставщика — понятная ошибка', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Ask onAnswer={() => {}} />)).toThrow(/ConfirmProvider/)
  })
})

describe('всплывашка и меню команд', () => {
  it('useToast().show — «готово» всплывает с меткой тона', async () => {
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
    const toast = document.querySelector('[data-slot=toast]')!
    expect(toast.textContent).toContain('Готово')
    expect(toast.className).toContain('border-l-success')
  })

})

describe('вкладки и фильтры — один ряд сегментов', () => {
  it('вкладки: выбранная — «выбрано», keepMounted живёт спрятанной; счётчик — CountBadge', () => {
    const items = () => [
      { value: 'a', label: 'Первая', count: 3, tone: 'опасно' as const, content: <p>первая</p> },
      { value: 'b', label: 'Вторая', content: <p>вторая</p>, keepMounted: true },
    ]
    const { rerender } = render(<Tabs label="Разделы" items={items()} value="b" />)
    expect(screen.getByRole('tab', { name: /Вторая/ }).className).toContain('data-[state=active]:bg-selected')
    expect(document.querySelector('[role=tab] [data-slot=count-badge]')).toBeTruthy()
    rerender(<Tabs label="Разделы" items={items()} value="a" />)
    expect(screen.getByText('вторая').closest('[role=tabpanel]')!.getAttribute('data-state')).toBe('inactive')
  })

  it('на узком: вкладки — одна строка с прокруткой без полосы, выбранная прокручена в поле зрения; фильтры переносятся', () => {
    const at = (left: number, width: number) => () => ({ left, right: left + width, width, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) })
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('role') === 'tablist') return at(0, 300)() as DOMRect
      return at(this.getAttribute('data-state') === 'active' ? 520 : 0, 80)() as DOMRect
    })
    const items = ['a', 'b', 'c'].map((v) => ({ value: v, label: v, content: <p>{v}</p> }))
    render(<Tabs label="Разделы" items={items} defaultValue="c" />)
    const row = screen.getByRole('tablist')
    expect(row.className.split(/\s+/)).toEqual(expect.arrayContaining(['ds-scroll-row', 'overflow-x-auto']))
    expect(row.className).not.toContain('flex-wrap')
    expect(row.scrollLeft).toBe(300)
    spy.mockRestore()
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'a' }))
    expect(screen.getByRole('tab', { name: 'a' }).getAttribute('data-state')).toBe('active')
    const { container } = render(<FilterBar value={{}} onChange={() => {}} filters={[{ key: 'k', label: 'КМ', options: [{ value: 'x', label: 'x' }] }]} />)
    expect(container.querySelector('[data-slot=filter-bar] [data-part=segments]')!.className).toContain('flex-wrap')
    expect(readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')).toMatch(/\.ds-scroll-row \{\s*scrollbar-width: none;/)
  })

  it('фильтры в адресе: выбор пишет ?ключ=значение, «все» снимает; required — без «все»', () => {
    window.history.replaceState(null, '', '/projects?статус=падает')
    function Demo() {
      const [v, set] = useUrlFilters(['статус', 'период'])
      return (
        <FilterBar
          value={v}
          onChange={set}
          filters={[
            { key: 'статус', label: 'Статус', options: [{ value: 'падает', label: 'падает' }, { value: 'работает', label: 'работает' }] },
            { key: 'период', label: 'Период', required: true, options: [{ value: '30', label: '30 дней' }, { value: '90', label: '90 дней' }] },
          ]}
        />
      )
    }
    render(<Demo />)
    expect(screen.getByRole('radio', { name: 'падает' }).getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByRole('radio', { name: 'работает' }))
    expect(new URLSearchParams(window.location.search).get('статус')).toBe('работает')
    fireEvent.click(screen.getAllByRole('radio', { name: 'все' })[0])
    expect(new URLSearchParams(window.location.search).get('статус')).toBeNull()
    expect(screen.getAllByRole('radio', { name: 'все' })).toHaveLength(1)
    expect(screen.getByRole('radio', { name: '30 дней' }).getAttribute('aria-checked')).toBe('true')
  })
})

describe('три колонки', () => {
  const cols = { labels: ['Команды', 'Диалоги', 'Переписка'] as [string, string, string], first: <p>1</p>, second: <p>2</p>, third: <p>3</p> }

  it('три области с подписями; на телефоне видна активная; «← назад» называет предыдущую', () => {
    const onBack = vi.fn()
    render(<ThreeColumn {...cols} active={1} onBack={onBack} />)
    const regions = screen.getAllByRole('region')
    expect(regions.map((r) => r.getAttribute('aria-label'))).toEqual(cols.labels)
    expect(regions[0].className).toContain('hidden')
    fireEvent.click(within(regions[1]).getByRole('button', { name: /Команды/ }))
    expect(onBack).toHaveBeenCalledWith(0)
  })

  it('sheets на телефоне: первая — шторка слева, третья — снизу; закрытие зовёт onSheetChange(null)', async () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: true, addEventListener() {}, removeEventListener() {} })) as typeof window.matchMedia
    try {
      const onSheetChange = vi.fn()
      const { rerender } = render(<ThreeColumn {...cols} active={1} onBack={() => {}} phone="sheets" sheet={0} onSheetChange={onSheetChange} />)
      expect(screen.getByRole('dialog', { name: 'Команды' }).getAttribute('data-side')).toBe('left')
      rerender(<ThreeColumn {...cols} active={1} onBack={() => {}} phone="sheets" sheet={2} onSheetChange={onSheetChange} />)
      expect(screen.getByRole('dialog', { name: 'Переписка' }).getAttribute('data-side')).toBe('bottom')
      fireEvent.click(screen.getByRole('button', { name: 'закрыть' }))
      expect(onSheetChange).toHaveBeenCalledWith(null)
    } finally {
      window.matchMedia = mm
    }
  })
})

describe('переписка', () => {
  it('входящие и наши, время машинно, разделитель дня, лента — log; наше — словарь хода', () => {
    render(<ChatThread label="Переписка с Анной" messages={chat} />)
    const log = screen.getByRole('log', { name: 'Переписка с Анной' })
    const msgs = log.querySelectorAll('[data-part=message]')
    expect([...msgs].map((m) => (m as HTMLElement).dataset.direction)).toEqual(['in', 'out', 'in', 'out'])
    expect(log.querySelector('time[datetime="2026-10-03T10:02"]')?.textContent).toBe('10:02')
    expect([...log.querySelectorAll('[data-part=day]')].map((d) => d.textContent)).toEqual(['3 октября', 'сегодня'])
    expect(within(msgs[3] as HTMLElement).getByText('отправляется…')).toBeTruthy()
  })

  it('не ушло: знак, слово с причиной, «Повторить»; весть — поверхность с меткой; в очереди — словом', () => {
    const retry = vi.fn()
    const { rerender } = render(<ChatThread label="п" messages={chatFailed.map((m) => (m.status === 'error' ? { ...m, onRetry: retry } : m))} />)
    expect(screen.getByRole('alert').textContent).toContain('не отправлено: Сервер не ответил')
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(retry).toHaveBeenCalledOnce()
    rerender(
      <ChatThread
        label="п"
        messages={[
          { id: 'n', direction: 'in', variant: 'notice', author: 'система', time: '14:02', text: 'весть' },
          { id: 'q', direction: 'out', time: '14:03', text: 'ещё', status: 'idle' },
        ]}
      />,
    )
    expect(screen.getByText('весть').closest('[data-slot=surface]')?.getAttribute('data-mark')).toBe('info')
    expect(screen.getByText('в очереди')).toBeTruthy()
  })

  describe('лента держится внизу', () => {
    let observers: Array<() => void> = []
    beforeEach(() => {
      observers = []
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(cb: () => void) {
            observers.push(cb)
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      )
    })
    afterEach(() => vi.unstubAllGlobals())
    const thread = () => {
      const { container } = render(<ChatThread label="С" messages={[{ id: 'a', direction: 'in', time: '14:00', text: 'ответ' }]} />)
      const el = container.querySelector('[data-slot=chat-thread]') as HTMLElement
      let height = 500
      Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => height })
      Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 100 })
      return { el, grow: (to: number) => ((height = to), observers.forEach((cb) => cb())) }
    }
    it('внизу и выросла — остаётся внизу; прокрутили вверх — не дёргает', () => {
      const a = thread()
      a.el.scrollTop = 400
      fireEvent.scroll(a.el)
      a.grow(700)
      expect(a.el.scrollTop).toBe(700)
      const b = thread()
      b.el.scrollTop = 100
      fireEvent.scroll(b.el)
      b.grow(900)
      expect(b.el.scrollTop).toBe(100)
    })
  })
})

describe('поле ответа', () => {
  const field = () => screen.getByRole('textbox')

  it('send="enter": Enter отправляет и очищает, Shift+Enter — нет', () => {
    const onSend = vi.fn()
    render(<ReplyBox label="Ответ" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'привет' } })
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('привет')
    expect((field() as HTMLTextAreaElement).value).toBe('')
  })

  it('send="ctrl-enter": Enter — новая строка, Ctrl+Enter — отправка; send="button" — только кнопкой', () => {
    const onSend = vi.fn()
    const { rerender } = render(<ReplyBox label="Ответ" send="ctrl-enter" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'а' } })
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).toHaveBeenCalledTimes(1)
    rerender(<ReplyBox label="Ответ" send="button" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'б' } })
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Enter — отправить/)).toBeNull()
  })

  it('неудача не теряет текст; пустое — слово ошибки; disabled — словами, почему', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('нет'))
    const { rerender } = render(<ReplyBox label="Ответ" onSend={onSend} emptyMessage="Напишите текст" />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(screen.getByRole('alert').textContent).toContain('Напишите текст')
    fireEvent.change(field(), { target: { value: 'текст' } })
    await act(async () => fireEvent.keyDown(field(), { key: 'Enter' }))
    expect((field() as HTMLTextAreaElement).value).toBe('текст')
    rerender(<ReplyBox label="Ответ" onSend={onSend} disabled="Только просмотр" />)
    expect((field() as HTMLTextAreaElement).disabled).toBe(true)
    expect(screen.getByText('Только просмотр')).toBeTruthy()
  })

  it('разговор с агентом: «Стоп» рядом с главной, кнопки в ряд', () => {
    const onStop = vi.fn()
    render(<ReplyBox label="Сообщение" onSend={() => {}} layout="row" stop={{ onStop }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Стоп' }))
    expect(onStop).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Стоп' }).closest('[role=group]')).toBe(screen.getByRole('button', { name: 'Отправить' }).closest('[role=group]'))
  })
})

describe('текст ответа', () => {
  it('текст ответа: роль «чтение»; набор — aria-busy', () => {
    const { container, rerender } = render(<Prose streaming><p>идёт</p></Prose>)
    const p = container.querySelector('[data-slot=prose]')!
    expect(p.className).toContain('text-reading')
    expect(p.getAttribute('aria-busy')).toBe('true')
    rerender(<Prose><p>готово</p></Prose>)
    expect(p.hasAttribute('aria-busy')).toBe(false)
  })
})
