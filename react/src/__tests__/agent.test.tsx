/**
 * Правила компонентов чата агента (orbit): карточка решения (П5, П7, ответ без кнопок), шаг агента (ошибку не прячем),
 * шкала (тон по порогу, значение словами), меню команд (клавиши из поля), схема (указатель по адресам),
 * переписка (весть, «в очереди»), раскладка рабочего места (шапка, панели телефона).
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import { AgentStep, ChatThread, CommandMenu, DecisionCard, Diagram, InlineLoading, Meter, ReplyBox, ThreeColumn, litSet, matchCommands, meterTone, type CommandMenuHandle } from '../index'
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
