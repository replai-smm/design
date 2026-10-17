/**
 * Правила компонентов чата агента (orbit): карточка решения (П5, П7, ответ без кнопок), шаг агента (ошибку не прячем),
 * шкала (тон по порогу, значение словами), меню команд (клавиши из поля), схема (указатель по адресам),
 * переписка (весть, «в очереди»), раскладка рабочего места (шапка, панели телефона).
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react'
import { createRef } from 'react'
import { ActionArea, AgentStep, Button, ChatThread, CodeBlock, CommandMenu, DecisionCard, Diagram, InlineLoading, Meter, Prose, ReplyBox, Steps, ThreeColumn, edgePath, litSet, matchCommands, meterTone, type CommandMenuHandle } from '../index'
import { commands, ringEdges, ringNodes } from '../stories/agent-fixtures'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

describe('DecisionCard — карточка решения', () => {
  it('ждёт слова: одна главная, своя поверхность — главная поля ответа рядом не спорит', () => {
    render(
      <>
        <DecisionCard title="Bash: npm test" primary={{ label: 'Разрешить' }} />
        <DecisionCard title="Изменение n5t2vd" primary={{ label: 'На прод' }} />
        <ReplyBox label="Сообщение" onSend={() => {}} />
      </>,
    )
    expect(document.querySelectorAll('[data-variant=primary]')).toHaveLength(3)
  })
  it('больше трёх фактов — ошибка (П7)', () => {
    quiet()
    expect(() => render(<DecisionCard title="Т" facts={['1', '2', '3', '4']} primary={{ label: 'Да' }} />)).toThrow(/не больше 3/)
  })
  it('отвечено — кнопок нет, видно слово ответа и время', () => {
    render(<DecisionCard title="Т" primary={{ label: 'Разрешить' }} answered={{ word: 'Запрещено', time: '14:02', tone: 'error' }} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Запрещено')).toBeTruthy()
    expect(screen.getByText('14:02').tagName).toBe('TIME')
  })
})

describe('AgentStep — шаг агента', () => {
  it('ошибка раскрыта сразу и видна словом; готово — свёрнуто и не берёт фокус', () => {
    render(
      <>
        <AgentStep tool="Bash" target="npm test" state="error">причина</AgentStep>
        <AgentStep tool="Read" target="a.ts" state="done">текст файла</AgentStep>
      </>,
    )
    const [err, done] = screen.getAllByRole('button')
    expect(err.getAttribute('aria-expanded')).toBe('true')
    expect(err.textContent).toContain('ошибка')
    expect(done.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById(done.getAttribute('aria-controls')!)?.hasAttribute('inert')).toBe(true)
    fireEvent.click(done)
    expect(done.getAttribute('aria-expanded')).toBe('true')
  })
  it('без результата строка не нажимается', () => {
    render(<AgentStep tool="Grep" target="toCsv" state="running" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('идёт')).toBeTruthy()
  })
})

describe('Meter и InlineLoading', () => {
  it('тон по порогу: ниже 80 % — без тона, с 80 % — внимание, с 95 % — опасно', () => {
    expect([meterTone(0.79), meterTone(0.8), meterTone(0.95)]).toEqual(['none', 'warning', 'error'])
    render(<Meter label="Неделя" value={86} valueText="86 % · сброс пн" />)
    const m = screen.getByRole('meter', { name: 'Неделя' })
    expect(m.getAttribute('aria-valuetext')).toBe('86 % · сброс пн')
    expect(m.closest('[data-slot=meter]')?.getAttribute('data-tone')).toBe('warning')
  })
  it('идёт — role=status со словом; ошибка — слово видно', () => {
    render(<InlineLoading label="работает" />)
    expect(screen.getByRole('status').textContent).toBe('работает')
  })
})

describe('CommandMenu — меню команд', () => {
  it('сужение: по началу команды и по слову описания', () => {
    expect(matchCommands(commands, 'k').map((c) => c.value)).toEqual(['/karta-build'])
    expect(matchCommands(commands, 'смен').map((c) => c.value)).toEqual(['/model'])
    expect(matchCommands(commands, '')).toHaveLength(commands.length)
  })
  it('клавиши из поля: стрелка вниз и Enter выбирают вторую строку; Esc закрывает; чужая клавиша не взята', () => {
    const onPick = vi.fn()
    const onClose = vi.fn()
    const ref = createRef<CommandMenuHandle>()
    render(<CommandMenu ref={ref} items={commands} query="" onPick={onPick} onClose={onClose} label="Команды" />)
    act(() => void ref.current!.press({ key: 'ArrowDown' }))
    expect(screen.getAllByRole('option')[1].getAttribute('aria-selected')).toBe('true')
    expect(ref.current!.activeId()).toBe(screen.getAllByRole('option')[1].id)
    act(() => void ref.current!.press({ key: 'Enter' }))
    expect(onPick).toHaveBeenCalledWith(commands[1])
    expect(ref.current!.press({ key: 'a' })).toBe(false)
    act(() => void ref.current!.press({ key: 'Escape' }))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('Diagram — указатель по адресам', () => {
  it('узел горит, если горит он или что-то внутри', () => {
    const { self, nodes } = litSet(ringNodes, ['input/probe', 'n5t2vd'])
    expect([...self]).toEqual(['input/probe', 'n5t2vd'])
    expect([...nodes].sort()).toEqual(['execution', 'input'])
  })
  it('highlight + dim: горит адрес, остальное приглушено; focus — aria-current; hide — убран', () => {
    const { container } = render(<Diagram label="Круг" nodes={ringNodes} edges={ringEdges} highlight={['input/probe']} focus="n5t2vd" dim hide={['core']} />)
    const at = (a: string) => container.querySelector(`[data-address="${a}"]`)!
    expect(at('input/probe').hasAttribute('data-lit')).toBe(true)
    expect(at('input/people').className).toContain('opacity-40')
    expect(at('input').className).not.toContain('opacity-40')
    expect(at('event').className).toContain('opacity-40')
    expect(at('n5t2vd').getAttribute('aria-current')).toBe('location')
    expect(container.querySelector('[data-address="core"]')).toBeNull()
  })
  it('onSelect — узел, строка и точка — кнопки с адресом', () => {
    const onSelect = vi.fn()
    render(<Diagram label="Круг" nodes={ringNodes} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'n5t2vd · экспорт в CSV' }))
    expect(onSelect).toHaveBeenCalledWith('n5t2vd')
  })
})

describe('ChatThread и ThreeColumn для чата агента', () => {
  it('весть — свой вид; наше «в очереди» — словом', () => {
    render(
      <ChatThread
        label="Сессия"
        messages={[
          { id: 'n', direction: 'in', variant: 'notice', author: 'orbit', time: '14:02', text: 'весть' },
          { id: 'q', direction: 'out', time: '14:03', text: 'ещё', status: 'queued' },
        ]}
      />,
    )
    expect(document.querySelector('[data-id=n]')?.getAttribute('data-variant')).toBe('notice')
    expect(screen.getByText('в очереди')).toBeTruthy()
  })
  it('шапка над колонками; sheets на ноутбуке — три колонки без «← назад»', () => {
    render(<ThreeColumn phone="sheets" header={<p>шапка</p>} labels={['А', 'Б', 'В']} active={1} onBack={() => {}} first="1" second="2" third="3" />)
    expect(document.querySelector('[data-slot=three-column-header]')?.textContent).toBe('шапка')
    expect(screen.getAllByRole('region')).toHaveLength(3)
    expect(document.querySelector('[data-slot=column-back]')).toBeNull()
  })
})

describe('ActionArea layout="row" — строка поля чата', () => {
  it('главная — последней в DOM и справа (ml-auto), на телефоне не во всю ширину', () => {
    render(
      <ActionArea primary={{ label: 'В очередь' }} layout="row" label="Поле: действия">
        <Button variant="ghost">Приложить</Button>
      </ActionArea>,
    )
    const group = screen.getByRole('group', { name: 'Поле: действия' })
    const primary = screen.getByRole('button', { name: 'В очередь' })
    expect(group.lastElementChild).toBe(primary)
    expect(primary.className).toContain('ml-auto')
    expect(primary.className).not.toContain('max-md:w-full')
    expect(group.className).not.toContain('flex-col-reverse')
  })
  it('stack не изменился: главная первой в DOM, на телефоне во всю ширину столбцом', () => {
    render(
      <ActionArea primary={{ label: 'Отправить' }} label="Действия">
        <Button variant="ghost">Тихая</Button>
      </ActionArea>,
    )
    const group = screen.getByRole('group', { name: 'Действия' })
    const primary = screen.getByRole('button', { name: 'Отправить' })
    expect(group.firstElementChild).toBe(primary)
    expect(primary.className).toContain('max-md:w-full')
    expect(primary.className).not.toContain('ml-auto')
    expect(group.className).toContain('flex-col-reverse')
  })
})

describe('ReplyBox в чате агента', () => {
  const field = () => screen.getByRole('textbox', { name: 'Сообщение' }) as HTMLTextAreaElement

  it('onKeyDown продукта взял клавишу (preventDefault) — Enter не отправляет; не взял — отправляет', () => {
    const onSend = vi.fn()
    const { rerender } = render(<ReplyBox label="Сообщение" onSend={onSend} defaultValue="/model" onKeyDown={(e) => e.preventDefault()} />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
    rerender(<ReplyBox label="Сообщение" onSend={onSend} defaultValue="/model" onKeyDown={() => {}} />)
    fireEvent.keyDown(field(), { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('/model')
  })
  it('«Стоп» стоит рядом с главной, зовёт onStop; без stop кнопки нет', () => {
    const onStop = vi.fn()
    const { rerender } = render(<ReplyBox label="Сообщение" onSend={() => {}} layout="row" sendLabel="В очередь" stop={{ onStop }} />)
    const stop = screen.getByRole('button', { name: 'Стоп' })
    expect(stop.closest('[data-slot=action-area]')).toBe(screen.getByRole('button', { name: 'В очередь' }).closest('[data-slot=action-area]'))
    fireEvent.click(stop)
    expect(onStop).toHaveBeenCalledOnce()
    rerender(<ReplyBox label="Сообщение" onSend={() => {}} layout="row" />)
    expect(screen.queryByRole('button', { name: 'Стоп' })).toBeNull()
  })
  it('меню стоит над полем, activeDescendant — aria-activedescendant у поля', () => {
    render(<ReplyBox label="Сообщение" onSend={() => {}} menu={<div data-testid="menu">меню</div>} activeDescendant="opt-2" />)
    expect(screen.getByTestId('menu').compareDocumentPosition(field()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(field().getAttribute('aria-activedescendant')).toBe('opt-2')
  })
})

describe('ThreeColumn phone="sheets" на телефоне', () => {
  const PHONE = '(max-width: 63.99rem)'
  const original = window.matchMedia
  const mount = (sheet: 0 | 2 | null, onSheetChange = vi.fn()) => {
    window.matchMedia = (q: string) =>
      ({ matches: q === PHONE, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList
    render(<ThreeColumn phone="sheets" sheet={sheet} onSheetChange={onSheetChange} labels={['Сессии', 'Чат', 'Панель']} active={1} onBack={() => {}} first={<p>список</p>} second={<p>лента</p>} third={<p>панель</p>} />)
    return onSheetChange
  }
  afterEach(() => {
    window.matchMedia = original
  })

  it('видна только вторая колонка; панелей нет, пока sheet=null', () => {
    mount(null)
    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual(['Чат'])
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('sheet=0 — панель слева', () => {
    mount(0)
    expect(screen.getByRole('dialog', { name: 'Сессии' }).getAttribute('data-side')).toBe('left')
  })
  it('sheet=2 — панель снизу', () => {
    mount(2)
    expect(screen.getByRole('dialog', { name: 'Панель' }).getAttribute('data-side')).toBe('bottom')
  })
  it('Esc и «×» зовут onSheetChange(null); фокус — на панели, не на «×»', async () => {
    const onSheetChange = mount(2)
    const dialog = screen.getByRole('dialog', { name: 'Панель' })
    await waitFor(() => expect(document.activeElement).toBe(dialog))
    expect(document.activeElement).not.toBe(within(dialog).getByRole('button', { name: 'закрыть' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'закрыть' }))
    expect(onSheetChange).toHaveBeenCalledWith(null)
    onSheetChange.mockClear()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onSheetChange).toHaveBeenCalledWith(null)
  })
})

describe('ChatThread — лента держится внизу при росте', () => {
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
    const { container } = render(<ChatThread label="Сессия" messages={[{ id: 'a', direction: 'in', time: '14:00', text: 'ответ' }]} />)
    const el = container.querySelector('[data-slot=chat-thread]') as HTMLElement
    let height = 500
    Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => height })
    Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 100 })
    return { el, grow: (to: number) => ((height = to), observers.forEach((cb) => cb())) }
  }

  it('лента внизу и выросла (набор ответа, картинка) — остаётся внизу', () => {
    const { el, grow } = thread()
    el.scrollTop = 400
    fireEvent.scroll(el)
    grow(700)
    expect(el.scrollTop).toBe(700)
  })
  it('прокрутили вверх — рост ленты её не дёргает', () => {
    const { el, grow } = thread()
    el.scrollTop = 100
    fireEvent.scroll(el)
    grow(900)
    expect(el.scrollTop).toBe(100)
  })
})

describe('CodeBlock — «Копировать»', () => {
  it('пишет код в navigator.clipboard и показывает «скопировано»', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    try {
      render(<CodeBlock code="npm test" label="bash" />)
      fireEvent.click(screen.getByRole('button', { name: 'Копировать' }))
      expect(writeText).toHaveBeenCalledWith('npm test')
      expect(await screen.findByRole('button', { name: 'скопировано' })).toBeTruthy()
    } finally {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  })
})

describe('Steps compact — путь одной строкой', () => {
  it('на любой ширине одна строка со знаками шагов; без compact строка прячется с md', () => {
    const { rerender } = render(<Steps label="Путь" steps={['сборка', 'приёмка', 'выкат']} current={1} compact />)
    const line = document.querySelector('[data-slot=steps-compact]')!
    expect(line.className).not.toContain('md:hidden')
    expect(document.querySelector('ol')!.className).not.toContain('md:flex')
    expect(line.querySelectorAll('[data-step-mark]')).toHaveLength(3)
    rerender(<Steps label="Путь" steps={['сборка', 'приёмка', 'выкат']} current={1} />)
    expect(document.querySelector('[data-slot=steps-compact]')!.className).toContain('md:hidden')
    expect(document.querySelector('[data-slot=steps-compact]')!.querySelector('[data-step-mark]')).toBeNull()
  })
  it('errorAt — крест вместо знака шага и слово «ошибка»', () => {
    render(<Steps label="Путь" steps={['сборка', 'приёмка', 'выкат']} current={1} errorAt={1} compact />)
    const line = document.querySelector('[data-slot=steps-compact]')!
    expect(line.querySelector('[data-tone-icon=error]')).toBeTruthy()
    expect(line.querySelectorAll('[data-step-mark]')).toHaveLength(2)
    expect(line.textContent).toContain('ошибка')
  })
})

describe('Diagram — связи и фокус', () => {
  it('edgePath: без ring — прямая; с ring — дуга, изогнутая от центра', () => {
    expect(edgePath([0.1, 0.2], [0.3, 0.4])).toBe('M10 20L30 40')
    const arc = /^M10 20Q([\d.-]+) ([\d.-]+) 30 40$/.exec(edgePath([0.1, 0.2], [0.3, 0.4], [0.5, 0.5]))
    expect(arc, 'дуга Q').toBeTruthy()
    const [cx, cy] = [Number(arc![1]), Number(arc![2])]
    expect(Math.hypot(cx - 50, cy - 50)).toBeGreaterThan(Math.hypot(20 - 50, 30 - 50))
  })
  it('строка адаптера в узком месте переносится (число под подпись), с @md — одна строка с обрезкой', () => {
    render(<Diagram label="Круг" nodes={ringNodes} />)
    const label = document.querySelector('[data-address="input/probe"] span.flex-auto')!
    expect(label.className).toContain('@md:truncate')
    expect(label.parentElement!.className).toContain('flex-wrap')
    expect(label.className.split(' ')).not.toContain('truncate')
  })
  it('focus прокручивает к узлу (scrollIntoView); без focus — нет', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      const { rerender } = render(<Diagram label="Круг" nodes={ringNodes} edges={ringEdges} />)
      expect(scrollIntoView).not.toHaveBeenCalled()
      rerender(<Diagram label="Круг" nodes={ringNodes} edges={ringEdges} focus="n5t2vd" />)
      expect(scrollIntoView).toHaveBeenCalledOnce()
      expect((scrollIntoView.mock.contexts[0] as HTMLElement).dataset.address).toBe('n5t2vd')
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })
})

describe('Prose — набор идёт', () => {
  it('streaming — aria-busy и курсор; набор закончен — нет', () => {
    const { rerender } = render(<Prose streaming>текст</Prose>)
    expect(document.querySelector('[data-slot=prose]')?.getAttribute('aria-busy')).toBe('true')
    rerender(<Prose>текст</Prose>)
    expect(document.querySelector('[data-slot=prose]')?.hasAttribute('aria-busy')).toBe(false)
  })
})

describe('AgentStep variant="shell" — команда человека', () => {
  it('вывод раскрыт сразу, рамка своего вида, «$» только для глаза', () => {
    render(<AgentStep tool="Команда" target="npm test" state="running" variant="shell">вывод</AgentStep>)
    const row = screen.getByRole('button', { name: /Команда/ })
    expect(row.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('[data-slot=agent-step]')?.getAttribute('data-variant')).toBe('shell')
    expect([...row.querySelectorAll('[aria-hidden=true]')].some((n) => n.textContent?.includes('$'))).toBe(true)
  })
  it('«Стоп» — только пока идёт, рядом со строкой, а не внутри неё (кнопка в кнопке нельзя)', () => {
    const onStop = vi.fn()
    const { rerender } = render(<AgentStep tool="Команда" target="npm test" state="running" variant="shell" stop={{ onStop }}>вывод</AgentStep>)
    const stop = screen.getByRole('button', { name: 'Стоп' })
    expect(stop.closest('button:not([data-slot=step-stop])')).toBeNull()
    fireEvent.click(stop)
    expect(onStop).toHaveBeenCalledOnce()
    rerender(<AgentStep tool="Команда" target="npm test" state="done" variant="shell" stop={{ onStop }}>вывод</AgentStep>)
    expect(screen.queryByRole('button', { name: 'Стоп' })).toBeNull()
  })
  it('note — пометка под строкой', () => {
    render(<AgentStep tool="Команда" target="git status" state="done" variant="shell" note="песочница: только чтение" />)
    expect(screen.getByText('песочница: только чтение')).toBeTruthy()
  })
})
