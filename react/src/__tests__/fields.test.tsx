/** Поля: подпись, подсказка и ошибка для читалки; выбор, число, галочка, выбор с поиском, файл, поиск. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import { acceptText, Checkbox, CheckboxGroup, Combobox, FileField, fileMatches, fileSizeText, NumberField, SearchField, Select, TextArea, TextField, type FileFieldHandle } from '../index'

afterEach(() => vi.restoreAllMocks())
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ')

describe('поле ввода', () => {
  it('подпись связана с полем, подсказка описывает поле', () => {
    render(<TextField label="Логин" helperText="Как у ВК" />)
    const f = screen.getByLabelText('Логин')
    expect(described(f)).toBe('Как у ВК')
    expect(f.getAttribute('aria-invalid')).toBeNull()
  })

  it('ошибка заменяет подсказку: aria-invalid, знак «опасно» и слово, рамка тона', () => {
    const { container } = render(<TextField label="Логин" helperText="Как у ВК" error="Такого нет" />)
    const f = screen.getByLabelText('Логин')
    expect(f.getAttribute('aria-invalid')).toBe('true')
    expect(described(f)).toBe('Такого нет')
    expect(f.className).toContain('border-danger')
    expect(container.querySelector('svg[data-icon=tone-danger]')).toBeTruthy()
  })

  it('спрятанная подпись остаётся для читалки; dense — 32 px; многострочное — та же рамка', () => {
    render(
      <>
        <TextField label="Поиск" hideLabel dense />
        <TextArea label="Текст" />
      </>,
    )
    expect(screen.getByText('Поиск').className).toContain('sr-only')
    expect(screen.getByLabelText('Поиск').className).toContain('min-h-dense')
    expect(screen.getByLabelText('Текст').className).toContain('border-line-strong')
  })
})

describe('выбор', () => {
  it('отдаёт значение; пустой первый пункт — подсказка, выбрать нельзя; ошибка — в описании', () => {
    const onChange = vi.fn()
    render(<Select label="Роль" placeholder="Выберите" options={[{ value: 'a', label: 'Админ' }]} onChange={onChange} error="Нужна роль" />)
    const s = screen.getByLabelText('Роль') as HTMLSelectElement
    expect((s.options[0] as HTMLOptionElement).disabled).toBe(true)
    fireEvent.change(s, { target: { value: 'a' } })
    expect(onChange).toHaveBeenCalledWith('a')
    expect(described(s)).toBe('Нужна роль')
  })
})

describe('галочка', () => {
  it('нажатие на подпись переключает; «частично» — mixed; группа называет галочки', () => {
    const onChange = vi.fn()
    render(
      <CheckboxGroup legend="Разделы">
        <Checkbox label="Сообщения" onCheckedChange={onChange} />
        <Checkbox label="Все" checked="indeterminate" />
      </CheckboxGroup>,
    )
    fireEvent.click(screen.getByText('Сообщения'))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('checkbox', { name: 'Все' }).getAttribute('aria-checked')).toBe('mixed')
    expect(screen.getByRole('group', { name: 'Разделы' })).toBeTruthy()
  })
})

describe('число', () => {
  it('spinbutton: стрелки — шаг, PageUp — 10, Home/End — границы; не выходит за границы', () => {
    const onChange = vi.fn()
    render(<NumberField label="Постов" defaultValue={3} min={0} max={14} onChange={onChange} />)
    const f = screen.getByRole('spinbutton', { name: 'Постов' })
    fireEvent.keyDown(f, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(4)
    fireEvent.keyDown(f, { key: 'PageUp' })
    expect(onChange).toHaveBeenLastCalledWith(14)
    fireEvent.keyDown(f, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('буквы не принимает, пусто — null; вне границ — ошибка словами; кнопки в обход табуляции', () => {
    const onChange = vi.fn()
    const { rerender } = render(<NumberField label="Постов" min={0} max={14} onChange={onChange} />)
    const f = screen.getByRole('spinbutton')
    fireEvent.change(f, { target: { value: 'abc' } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.change(f, { target: { value: '20' } })
    expect(described(f)).toBe('Число от 0 до 14')
    expect(screen.getByRole('button', { name: 'увеличить' }).tabIndex).toBe(-1)
    rerender(<NumberField label="Постов" min={0} max={14} value={null} />)
    expect((f as HTMLInputElement).value).toBe('')
  })
})

describe('выбор с поиском', () => {
  const options = [
    { value: 'a', label: 'Кофейня «Зерно»', description: 'Самара' },
    { value: 'b', label: 'Пекарня «Колос»', description: 'Тольятти' },
    { value: 'c', label: 'Ёлки', disabled: true },
    { value: 'd', label: 'Цветы' },
  ]
  const box = () => screen.getByRole('combobox')

  it('стрелка вниз открывает; печать сужает (ё = е, по второй строке); Enter выбирает', () => {
    const onChange = vi.fn()
    render(<Combobox label="Сообщество" options={options} onChange={onChange} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(box().getAttribute('aria-expanded')).toBe('true')
    fireEvent.change(box(), { target: { value: 'тольят' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Пекарня «Колос»Тольятти'])
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('b')
    expect((box() as HTMLInputElement).value).toBe('Пекарня «Колос»')
  })

  it('Esc закрывает; в закрытом Esc очищает выбор; «очистить выбор» тоже', () => {
    const onChange = vi.fn()
    render(<Combobox label="Сообщество" options={options} defaultValue="a" onChange={onChange} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(box().getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('выбранный — aria-selected и «выбрано»; limit — первые N и «уточните поиск»; пусто — свои слова', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ value: `m${i}`, label: `Сообщество ${i}` }))
    const { rerender } = render(<Combobox label="С" options={many} defaultValue="m0" limit={5} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    const opts = screen.getAllByRole('option')
    expect(opts).toHaveLength(5)
    expect(opts[0].getAttribute('aria-selected')).toBe('true')
    expect(opts[0].className).toContain('bg-selected')
    expect(screen.getByText(/Показаны первые 5 из 30/)).toBeTruthy()
    rerender(<Combobox label="С" options={[]} empty="Не найдено" />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(screen.getByText('Не найдено')).toBeTruthy()
  })
})

describe('выбор файла', () => {
  const pdf = (name: string, size: number, type = 'application/pdf') => {
    const f = new File(['x'], name, { type })
    Object.defineProperty(f, 'size', { value: size })
    return f
  }

  it('ограничения словами; выбран файл — имя, размер и «убрать»; не тот тип — ошибка называет файл', () => {
    const onChange = vi.fn()
    const ref = createRef<FileFieldHandle>()
    const { container } = render(<FileField ref={ref} label="КП" accept=".pdf" maxSize={1024 * 1024} onChange={onChange} />)
    expect(screen.getByText('Можно: PDF · до 1 МБ')).toBeTruthy()
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    act(() => ref.current!.open())
    expect(click).toHaveBeenCalled()
    fireEvent.change(input, { target: { files: [pdf('кп.pdf', 2048)] } })
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'кп.pdf' })])
    expect(screen.getByRole('button', { name: 'Убрать «кп.pdf»' })).toBeTruthy()
    fireEvent.change(input, { target: { files: [pdf('отчёт.xlsx', 10, 'application/vnd.ms-excel')] } })
    expect(screen.getByText(/«отчёт.xlsx» — не тот тип, можно: PDF/)).toBeTruthy()
  })

  it('слова: размер, типы, совпадение', () => {
    expect([fileSizeText(500), fileSizeText(850 * 1024), fileSizeText(12.3 * 1024 * 1024)]).toEqual(['500 Б', '850 КБ', '12 МБ'])
    expect(acceptText('.pdf,image/*')).toBe('PDF, картинки')
    expect(fileMatches(pdf('a.PNG', 1, 'image/png'), 'image/*')).toBe(true)
  })
})

describe('поиск', () => {
  it('подпись для читалки, «очистить поиск» стирает', () => {
    const onChange = vi.fn()
    render(<SearchField label="Поиск по группам" value="зерно" onChange={onChange} />)
    expect(screen.getByLabelText('Поиск по группам')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'очистить поиск' }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
