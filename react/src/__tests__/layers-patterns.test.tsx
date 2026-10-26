/** Слои и составные: окно и шторка, подтверждение, всплывашка, меню «…»; вкладки, ряд сегментов, фильтры, три колонки, переписка, поле ответа, текст ответа. */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react'
import { Button, ChatThread, ConfirmProvider, ContentSwitcher, CountBadge, FilterBar, Modal, OverflowMenu, OverflowMenuItem, Prose, ReplyBox, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, TextInput, ThreeColumn, Toaster, useConfirm, useToast, useUrlFilters } from '../index'
import { chat, chatFailed } from '../stories/fixtures'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

afterEach(() => vi.restoreAllMocks())

describe('окно (Carbon: Modal)', () => {
  it('фокус — главная, data-modal-primary-focus — сильнее; Esc и «закрыть» — onRequestClose; низ — второстепенная и главная', async () => {
    const onRequestClose = vi.fn()
    const onRequestSubmit = vi.fn()
    const { rerender } = render(<Modal open modalHeading="Новая сессия" primaryButtonText="Начать" secondaryButtonText="Отмена" onRequestClose={onRequestClose} onRequestSubmit={onRequestSubmit} />)
    const dialog = screen.getByRole('dialog', { name: 'Новая сессия' })
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Начать' })))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Начать' }))
    expect(onRequestSubmit).toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(onRequestClose).toHaveBeenCalledTimes(3)
    rerender(
      <Modal open modalHeading="Новая сессия" primaryButtonText="Начать" key="b">
        <TextInput id="folder" labelText="Папка" data-modal-primary-focus />
      </Modal>,
    )
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Папка')))
  })

  it('нажатие мимо: окно с действиями не закрывается (Carbon), passiveModal — закрывается; у passiveModal нет низа', async () => {
    const onRequestClose = vi.fn()
    const tick = () => act(() => new Promise((r) => setTimeout(r, 0))) // Radix слушает нажатия мимо со следующего такта
    const outside = () => {
      const el = document.querySelector('.ds-overlay')!
      fireEvent.pointerDown(el) // окно Radix закрывается на click после pointerdown мимо
      fireEvent.click(el)
    }
    const { unmount } = render(<Modal open modalHeading="О" primaryButtonText="Да" onRequestClose={onRequestClose} />)
    await tick()
    outside()
    expect(onRequestClose).not.toHaveBeenCalled()
    unmount()
    render(<Modal open passiveModal modalHeading="О" onRequestClose={onRequestClose} />)
    expect(screen.queryByRole('button', { name: 'Да' })).toBeNull()
    await tick()
    outside()
    expect(onRequestClose).toHaveBeenCalled()
  })

  it('шторка снизу на телефоне; размер — xs · sm · md · lg; loadingStatus — ход на главной, кнопки выключены', () => {
    const { rerender } = render(<Modal open modalHeading="О" primaryButtonText="Да" secondaryButtonText="Нет" />)
    expect(screen.getByRole('dialog').getAttribute('data-side')).toBe('bottom')
    expect(screen.getByRole('dialog').className).toContain('md:max-w-window')
    rerender(<Modal open modalHeading="О" size="xs" primaryButtonText="Да" secondaryButtonText="Нет" loadingStatus="active" loadingDescription="Сохраняем…" />)
    expect(screen.getByRole('dialog').className).toContain('md:max-w-popup')
    const footer = document.querySelector('[data-part=footer]')!
    expect(footer.textContent).toContain('Сохраняем…')
    for (const b of within(footer as HTMLElement).getAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true)
  })

  it('две главные в окне — ошибка', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <Modal open modalHeading="О" primaryButtonText="А">
          <Button>Б</Button>
        </Modal>,
      ),
    ).toThrow(/вторая главная/)
  })
})

describe('подтверждение', () => {
  function Ask({ danger, onAnswer }: { danger?: boolean; onAnswer: (v: boolean) => void }) {
    const confirm = useConfirm()
    return (
      <Button kind="secondary" onClick={async () => onAnswer(await confirm({ modalHeading: 'Удалить файл?', danger }))}>
        спросить
      </Button>
    )
  }

  it('опасное: Modal danger — kind="danger" без главной, фокус на «Отмена»; «да» — true', async () => {
    const onAnswer = vi.fn()
    render(
      <ConfirmProvider>
        <Ask danger onAnswer={onAnswer} />
      </ConfirmProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'спросить' }))
    const del = await screen.findByRole('button', { name: 'Удалить' })
    expect(del.dataset.kind).toBe('danger')
    expect(document.querySelector('[data-kind=primary]')).toBeNull()
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Отмена'))
    await act(async () => fireEvent.click(del))
    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('вне поставщика — понятная ошибка', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Ask onAnswer={() => {}} />)).toThrow(/ConfirmProvider/)
  })
})

describe('всплывашка и меню «…»', () => {
  it('useToast().show — поля ToastNotification: kind по умолчанию error, метка вида; timeout 0 — висит; «закрыть» убирает', async () => {
    function Demo() {
      const t = useToast()
      return (
        <>
          <Button kind="secondary" onClick={() => t.show({ kind: 'success', title: 'Готово', subtitle: 'Отчёт ушёл', caption: '14:20', timeout: 0 })}>
            Сделать
          </Button>
          <Button kind="ghost" onClick={() => t.show({ title: 'Беда', timeout: 0 })}>
            Сломать
          </Button>
        </>
      )
    }
    render(
      <Toaster>
        <Demo />
      </Toaster>,
    )
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сделать' })))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Сломать' })))
    const [ok, bad] = document.querySelectorAll('[data-slot=toast]')
    expect(ok.textContent).toContain('Готово')
    expect(ok.textContent).toContain('14:20')
    expect(ok.className).toContain('border-l-success')
    expect(bad.getAttribute('data-kind')).toBe('error')
    await act(async () => fireEvent.click(within(ok as HTMLElement).getByRole('button', { name: 'Закрыть уведомление' })))
    expect(document.querySelectorAll('[data-slot=toast]')).toHaveLength(1)
  })

  it('OverflowMenu: кнопка-значок ghost с подписью; пункты — меню, isDelete — опасный, onClick зовётся, onOpen/onClose', async () => {
    const onRename = vi.fn()
    const onOpen = vi.fn()
    const onClose = vi.fn()
    render(
      <OverflowMenu iconDescription="Действия с файлом" onOpen={onOpen} onClose={onClose}>
        <OverflowMenuItem itemText="Переименовать" onClick={onRename} />
        <OverflowMenuItem itemText="Удалить" isDelete hasDivider />
      </OverflowMenu>,
    )
    const trigger = screen.getByRole('button', { name: 'Действия с файлом' })
    expect(trigger.dataset.kind).toBe('ghost')
    fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
    expect(onOpen).toHaveBeenCalled()
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Удалить' }).className).toContain('text-danger-fg')
    expect(within(menu).getByRole('separator')).toBeTruthy()
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Переименовать' }))
    expect(onRename).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})

describe('вкладки, ряд сегментов, фильтры', () => {
  it('вкладки: линейные по умолчанию (линия под рядом, подчёркнута выбранная), contained — ряд сегментов в рамке', () => {
    const { container, rerender } = render(
      <Tabs>
        <TabList aria-label="Разделы">
          <Tab>Одна</Tab>
          <Tab>Две</Tab>
        </TabList>
      </Tabs>,
    )
    let row = container.querySelector('[role=tablist]') as HTMLElement
    expect(row.getAttribute('data-part')).toBe('line')
    expect(row.className).toContain('border-b')
    rerender(
      <Tabs>
        <TabList aria-label="Разделы" contained>
          <Tab>Одна</Tab>
          <Tab>Две</Tab>
        </TabList>
      </Tabs>,
    )
    row = container.querySelector('[role=tablist]') as HTMLElement
    expect(row.getAttribute('data-part')).toBe('segments')
    expect((screen.getByRole('tab', { name: 'Одна' }) as HTMLElement).className).toContain('data-[state=active]:bg-selected')
  })

  const tabs = (props: Partial<React.ComponentProps<typeof Tabs>> = {}) => (
    <Tabs {...props}>
      <TabList aria-label="Разделы">
        <Tab>
          Первая <CountBadge count={3} tone="опасно" />
        </Tab>
        <Tab>Вторая</Tab>
        <Tab disabled>Третья</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>первая</p>
        </TabPanel>
        <TabPanel>
          <p>вторая</p>
        </TabPanel>
        <TabPanel>
          <p>третья</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )

  it('вкладки по номеру: selectedIndex, onChange({ selectedIndex }); все панели смонтированы, неактивные — hidden; счётчик — CountBadge', () => {
    const onChange = vi.fn()
    const { rerender } = render(tabs({ selectedIndex: 1, onChange }))
    expect(screen.getByRole('tab', { name: /Вторая/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: /Вторая/ }).className).toContain('data-[state=active]:border-inverse')
    expect(document.querySelector('[role=tab] [data-slot=count-badge]')).toBeTruthy()
    const first = screen.getByText('первая').closest('[role=tabpanel]') as HTMLElement
    expect(first.hidden).toBe(true)
    expect((screen.getByText('вторая').closest('[role=tabpanel]') as HTMLElement).hidden).toBe(false)
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Первая/ }))
    expect(onChange).toHaveBeenCalledWith({ selectedIndex: 0 })
    rerender(tabs({ selectedIndex: 0, onChange }))
    expect(first.hidden).toBe(false)
    expect((screen.getByRole('tab', { name: 'Третья' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('на узком: вкладки — одна строка с прокруткой без полосы, выбранная прокручена в поле зрения; фильтры переносятся', () => {
    const at = (left: number, width: number) => () => ({ left, right: left + width, width, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) })
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('role') === 'tablist') return at(0, 300)() as DOMRect
      return at(this.getAttribute('data-state') === 'active' ? 520 : 0, 80)() as DOMRect
    })
    render(tabs({ defaultSelectedIndex: 1 }))
    const row = screen.getByRole('tablist', { name: 'Разделы' })
    expect(row.className.split(/\s+/)).toEqual(expect.arrayContaining(['ds-scroll-row', 'overflow-x-auto']))
    expect(row.className).not.toContain('flex-wrap')
    expect(row.scrollLeft).toBe(300)
    spy.mockRestore()
    const { container } = render(<FilterBar value={{}} onChange={() => {}} filters={[{ key: 'k', label: 'КМ', options: [{ value: 'x', label: 'x' }] }]} />)
    expect(container.querySelector('[data-slot=filter-bar] [data-slot=content-switcher]')!.className).toContain('flex-wrap')
    expect(readFileSync(resolve(import.meta.dirname, '..', 'ds.css'), 'utf8')).toMatch(/\.ds-scroll-row \{\s*scrollbar-width: none;/)
  })

  it('ContentSwitcher: выбран один, повторное нажатие не снимает; стрелки ходят и выбирают; onChange({ index, name, text })', () => {
    const onChange = vi.fn()
    render(
      <ContentSwitcher aria-label="Вид" onChange={onChange}>
        <Switch name="list" text="Список" />
        <Switch name="board" text="Доска" />
      </ContentSwitcher>,
    )
    const [list, board] = screen.getAllByRole('tab')
    expect(list.getAttribute('aria-selected')).toBe('true')
    expect(list.tabIndex).toBe(0)
    expect(board.tabIndex).toBe(-1)
    fireEvent.click(list)
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1, name: 'board', text: 'Доска' }))
    expect(document.activeElement).toBe(board)
    expect(board.getAttribute('aria-selected')).toBe('true')
    fireEvent.click(list)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ index: 0, name: 'list' }))
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
    expect(screen.getByRole('tab', { name: 'падает' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('tab', { name: 'работает' }))
    expect(new URLSearchParams(window.location.search).get('статус')).toBe('работает')
    fireEvent.click(screen.getAllByRole('tab', { name: 'все' })[0])
    expect(new URLSearchParams(window.location.search).get('статус')).toBeNull()
    expect(screen.getAllByRole('tab', { name: 'все' })).toHaveLength(1)
    expect(screen.getByRole('tab', { name: '30 дней' }).getAttribute('aria-selected')).toBe('true')
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

  it('sheets на телефоне: первая — шторка слева, третья — окно снизу без кнопок; закрытие зовёт onSheetChange(null)', async () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: true, addEventListener() {}, removeEventListener() {} })) as typeof window.matchMedia
    try {
      const onSheetChange = vi.fn()
      const { rerender } = render(<ThreeColumn {...cols} active={1} onBack={() => {}} phone="sheets" sheet={0} onSheetChange={onSheetChange} />)
      expect(screen.getByRole('dialog', { name: 'Команды' }).getAttribute('data-side')).toBe('left')
      rerender(<ThreeColumn {...cols} active={1} onBack={() => {}} phone="sheets" sheet={2} onSheetChange={onSheetChange} />)
      const sheet = screen.getByRole('dialog', { name: 'Переписка' })
      expect(sheet.getAttribute('data-side')).toBe('bottom')
      expect(sheet.querySelector('[data-part=footer]')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
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

  it('не ушло: знак, слово с причиной, «Повторить»; весть — плитка с меткой; в очереди — словом', () => {
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
    expect(screen.getByText('весть').closest('[data-slot=tile]')?.getAttribute('data-mark')).toBe('info')
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
    render(<ReplyBox labelText="Ответ" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'привет' } })
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('привет')
    expect((field() as HTMLTextAreaElement).value).toBe('')
  })

  it('send="ctrl-enter": Enter — новая строка, Ctrl+Enter — отправка; send="button" — только кнопкой', () => {
    const onSend = vi.fn()
    const { rerender } = render(<ReplyBox labelText="Ответ" send="ctrl-enter" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'а' } })
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).toHaveBeenCalledTimes(1)
    rerender(<ReplyBox labelText="Ответ" send="button" onSend={onSend} />)
    fireEvent.change(field(), { target: { value: 'б' } })
    fireEvent.keyDown(field(), { key: 'Enter', ctrlKey: true })
    expect(onSend).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Enter — отправить/)).toBeNull()
  })

  it('неудача не теряет текст; пустое — слово ошибки; invalid — слово invalidText; disabled — почему словами в helperText', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('нет'))
    const { rerender } = render(<ReplyBox labelText="Ответ" onSend={onSend} emptyMessage="Напишите текст" />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(screen.getByRole('alert').textContent).toContain('Напишите текст')
    fireEvent.change(field(), { target: { value: 'текст' } })
    await act(async () => fireEvent.keyDown(field(), { key: 'Enter' }))
    expect((field() as HTMLTextAreaElement).value).toBe('текст')
    rerender(<ReplyBox labelText="Ответ" onSend={onSend} invalid invalidText="Не принято" />)
    expect(screen.getByRole('alert').textContent).toContain('Не принято')
    expect(field().getAttribute('aria-invalid')).toBe('true')
    rerender(<ReplyBox labelText="Ответ" onSend={onSend} disabled helperText="Только просмотр" />)
    expect((field() as HTMLTextAreaElement).disabled).toBe(true)
    expect(screen.getByText('Только просмотр')).toBeTruthy()
  })

  it('разговор с агентом: «Стоп» рядом с главной, кнопки в ряд', () => {
    const onStop = vi.fn()
    render(<ReplyBox labelText="Сообщение" onSend={() => {}} layout="row" stop={{ onStop }} />)
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
