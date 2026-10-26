/** Поля по Carbon: подпись, подсказка, ошибка и предупреждение для читалки; ввод, пароль, число, выбор, галочка, кружки, переключатель, выбор с поиском, файл, поиск, форма. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import {
  Checkbox,
  CheckboxGroup,
  ComboBox,
  FileUploader,
  FileUploaderItem,
  Form,
  FormGroup,
  NumberInput,
  PasswordInput,
  RadioButton,
  RadioButtonGroup,
  Search,
  Select,
  SelectItem,
  SelectItemGroup,
  TextArea,
  TextInput,
  Toggle,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  ToggletipLabel,
  type FileUploaderHandle,
} from '../index'

afterEach(() => vi.restoreAllMocks())
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ')
const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})

describe('TextInput, PasswordInput, TextArea', () => {
  it('подпись связана с полем, подсказка описывает поле; onChange — событие поля (Carbon)', () => {
    const onChange = vi.fn()
    render(<TextInput id="login" labelText="Логин" helperText="Как в профиле" onChange={onChange} />)
    const f = screen.getByLabelText('Логин')
    expect(f.id).toBe('login')
    expect(described(f)).toBe('Как в профиле')
    expect(f.getAttribute('aria-invalid')).toBeNull()
    fireEvent.change(f, { target: { value: 'anna' } })
    expect(onChange.mock.calls[0][0].target.value).toBe('anna')
  })

  it('invalid + invalidText заменяют подсказку: aria-invalid, знак «опасно» и слово, рамка тона', () => {
    const { container } = render(<TextInput id="l" labelText="Логин" helperText="Как в профиле" invalid invalidText="Такого нет" />)
    const f = screen.getByLabelText('Логин')
    expect(f.getAttribute('aria-invalid')).toBe('true')
    expect(described(f)).toBe('Такого нет')
    expect(f.className).toContain('border-danger')
    expect(container.querySelector('svg[data-icon=tone-danger]')).toBeTruthy()
  })

  it('warn + warnText: знак «внимание» и слово, поле не ошибочное; у выключенного и «только чтение» сообщений нет', () => {
    const { container, rerender } = render(<TextInput id="l" labelText="Сайт" warn warnText="Без https" />)
    const f = screen.getByLabelText('Сайт')
    expect(described(f)).toBe('Без https')
    expect(f.getAttribute('aria-invalid')).toBeNull()
    expect(container.querySelector('svg[data-icon=tone-warning]')).toBeTruthy()
    rerender(<TextInput id="l" labelText="Сайт" readOnly invalid invalidText="Ошибка" helperText="Подсказка" />)
    expect(f.getAttribute('aria-invalid')).toBeNull()
    expect(described(f)).toBe('Подсказка')
    expect(f.className).toContain('border-line')
  })

  it('size: sm 32 · md 40 · lg 48; без size — 48 на телефоне и 40 на ноутбуке; xs — ошибка в разработке', () => {
    const { rerender } = render(<TextInput id="s" labelText="П" size="sm" />)
    const f = screen.getByLabelText('П')
    expect(f.className).toContain('min-h-dense')
    rerender(<TextInput id="s" labelText="П" size="lg" />)
    expect(f.className).toContain('min-h-touch')
    rerender(<TextInput id="s" labelText="П" />)
    expect(f.className).toContain('min-h-touch md:min-h-control')
    quiet()
    expect(() => render(<TextInput id="x" labelText="П" size={'xs' as 'sm'} />)).toThrow(/размера поля «xs» нет/)
  })

  it('справка «i» — Toggletip в labelText (Carbon): кнопка со своим именем, открывает справку; подпись остаётся у поля', () => {
    render(
      <TextInput
        id="w"
        labelText={
          <>
            <ToggletipLabel>Окно записей</ToggletipLabel>
            <Toggletip>
              <ToggletipButton label="Подробнее: окно записей" />
              <ToggletipContent>Только последние N записей.</ToggletipContent>
            </Toggletip>
          </>
        }
      />,
    )
    expect(screen.getByRole('textbox', { name: /^Окно записей/ }).id).toBe('w')
    fireEvent.click(screen.getByRole('button', { name: 'Подробнее: окно записей' }))
    expect(screen.getByRole('dialog', { name: 'Подробнее: окно записей' }).textContent).toContain('Только последние N записей.')
  })

  it('пароль скрыт; кнопка в поле показывает и прячет его, подпись кнопки меняется', () => {
    const onToggle = vi.fn()
    render(<PasswordInput id="p" labelText="Пароль" onTogglePasswordVisibility={onToggle} />)
    const f = screen.getByLabelText('Пароль') as HTMLInputElement
    expect(f.type).toBe('password')
    fireEvent.click(screen.getByRole('button', { name: 'Показать пароль' }))
    expect(f.type).toBe('text')
    expect(onToggle).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Скрыть пароль' }))
    expect(f.type).toBe('password')
  })

  it('спрятанная подпись остаётся для читалки; многострочное — та же рамка, 4 строки', () => {
    render(
      <>
        <TextInput id="q" labelText="Поиск" hideLabel />
        <TextArea labelText="Текст" />
      </>,
    )
    expect(screen.getByText('Поиск').className).toContain('sr-only')
    const area = screen.getByLabelText('Текст') as HTMLTextAreaElement
    expect(area.className).toContain('border-line-strong')
    expect(area.rows).toBe(4)
  })
})

describe('Select', () => {
  it('пункты — SelectItem детьми, группы — SelectItemGroup; «Выберите…» — выключенный спрятанный пункт; onChange — событие', () => {
    const onChange = vi.fn()
    const { container } = render(
      <Select id="role" labelText="Роль" defaultValue="" onChange={onChange} invalid invalidText="Нужна роль">
        <SelectItem value="" text="Выберите" disabled hidden />
        <SelectItemGroup label="Правка">
          <SelectItem value="a" text="Админ" />
        </SelectItemGroup>
      </Select>,
    )
    const s = screen.getByLabelText('Роль') as HTMLSelectElement
    expect(s.options[0].disabled).toBe(true)
    expect(s.options[0].hidden).toBe(true)
    expect(container.querySelector('optgroup')?.label).toBe('Правка')
    fireEvent.change(s, { target: { value: 'a' } })
    expect(onChange.mock.calls[0][0].target.value).toBe('a')
    expect(described(s)).toBe('Нужна роль')
  })
})

describe('Checkbox, CheckboxGroup', () => {
  it('нажатие на подпись переключает, onChange(event, { checked, id }); indeterminate — «частично»; группа называет галочки', () => {
    const onChange = vi.fn()
    render(
      <CheckboxGroup legendText="Разделы">
        <Checkbox id="m" labelText="Сообщения" onChange={onChange} />
        <Checkbox id="all" labelText="Все" indeterminate />
      </CheckboxGroup>,
    )
    fireEvent.click(screen.getByText('Сообщения'))
    expect(onChange.mock.calls[0][1]).toEqual({ checked: true, id: 'm' })
    expect((screen.getByRole('checkbox', { name: 'Все' }) as HTMLInputElement).indeterminate).toBe(true)
    expect(screen.getByRole('group', { name: 'Разделы' })).toBeTruthy()
  })

  it('ошибка группы — слово под группой и рамка каждой галочки; «только чтение» не переключается', () => {
    render(
      <>
        <CheckboxGroup legendText="Куда" invalid invalidText="Выберите хотя бы одно">
          <Checkbox id="a" labelText="Почта" />
        </CheckboxGroup>
        <Checkbox id="ro" labelText="Закреплено" readOnly defaultChecked />
      </>,
    )
    const group = screen.getByRole('group', { name: 'Куда' })
    expect(group.getAttribute('data-invalid')).toBe('true')
    expect(described(group)).toBe('Выберите хотя бы одно')
    expect(screen.getByRole('checkbox', { name: 'Почта' }).className).toContain('in-data-[invalid=true]:border-danger')
    const ro = screen.getByRole('checkbox', { name: 'Закреплено' }) as HTMLInputElement
    fireEvent.click(ro)
    expect(ro.checked).toBe(true)
  })
})

describe('RadioButton, RadioButtonGroup', () => {
  const group = (props: Partial<Parameters<typeof RadioButtonGroup>[0]> = {}) => (
    <RadioButtonGroup name="period" legendText="Период" defaultSelected="m" {...props}>
      <RadioButton labelText="Неделя" value="w" />
      <RadioButton labelText="Месяц" value="m" />
    </RadioButtonGroup>
  )

  it('группа держит name и выбранное; onChange(value, name, event) — только при смене', () => {
    const onChange = vi.fn()
    render(group({ onChange }))
    expect(screen.getByRole('group', { name: 'Период' })).toBeTruthy()
    const [w, m] = screen.getAllByRole('radio') as HTMLInputElement[]
    expect([w.name, m.name]).toEqual(['period', 'period'])
    expect(m.checked).toBe(true)
    fireEvent.click(screen.getByText('Неделя'))
    expect(onChange.mock.calls[0].slice(0, 2)).toEqual(['w', 'period'])
    expect(w.checked).toBe(true)
  })

  it('valueSelected — выбранное снаружи; readOnly — выбор не меняется; по умолчанию в ряд', () => {
    const onChange = vi.fn()
    const { rerender, container } = render(group({ valueSelected: 'w', onChange }))
    expect((screen.getAllByRole('radio')[0] as HTMLInputElement).checked).toBe(true)
    rerender(group({ valueSelected: 'm', onChange }))
    expect((screen.getAllByRole('radio')[1] as HTMLInputElement).checked).toBe(true)
    rerender(group({ valueSelected: 'm', onChange, readOnly: true }))
    fireEvent.click(screen.getByText('Неделя'))
    expect(onChange).not.toHaveBeenCalled()
    expect(container.querySelector('fieldset > div')?.className).toContain('md:flex-row')
  })
})

describe('Toggle', () => {
  it('role="switch" с именем подписи; нажатие и слово рядом переключают; onToggle(checked)', () => {
    const onToggle = vi.fn()
    render(<Toggle id="d" labelText="Сводка" onToggle={onToggle} />)
    const sw = screen.getByRole('switch', { name: 'Сводка' })
    expect(sw.getAttribute('aria-checked')).toBe('false')
    expect(screen.getByText('Выкл')).toBeTruthy()
    fireEvent.click(sw)
    expect(onToggle).toHaveBeenLastCalledWith(true)
    expect(sw.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(screen.getByText('Вкл'))
    expect(onToggle).toHaveBeenLastCalledWith(false)
  })

  it('hideLabel — подпись для читалки, на месте слова состояния; readOnly не переключается; размер — только sm · md', () => {
    const onToggle = vi.fn()
    render(
      <>
        <Toggle id="h" labelText="Архив" hideLabel />
        <Toggle id="r" labelText="Вход" toggled readOnly onToggle={onToggle} />
      </>,
    )
    expect(screen.getAllByText('Архив').map((n) => n.className.includes('sr-only'))).toEqual([true, false])
    fireEvent.click(screen.getByRole('switch', { name: 'Вход' }))
    expect(onToggle).not.toHaveBeenCalled()
    quiet()
    expect(() => render(<Toggle id="x" labelText="Х" size={'lg' as 'md'} />)).toThrow(/размера переключателя «lg» нет/)
  })
})

describe('NumberInput', () => {
  it('spinbutton: стрелки — шаг, PageUp — 10, Home/End — границы; onChange(event, { value, direction })', () => {
    const onChange = vi.fn()
    render(<NumberInput id="r" label="Отчётов" defaultValue={3} min={0} max={14} onChange={onChange} />)
    const f = screen.getByRole('spinbutton', { name: 'Отчётов' })
    fireEvent.keyDown(f, { key: 'ArrowUp' })
    expect(onChange.mock.lastCall![1]).toEqual({ value: 4, direction: 'up' })
    fireEvent.keyDown(f, { key: 'PageUp' })
    expect(onChange.mock.lastCall![1]).toEqual({ value: 14, direction: 'up' })
    fireEvent.keyDown(f, { key: 'Home' })
    expect(onChange.mock.lastCall![1]).toEqual({ value: 0, direction: 'down' })
  })

  it('по умолчанию 0; буквы не принимает; пусто — ошибка без allowEmpty, с ним — пустая строка; вне границ — ошибка словами', () => {
    const onChange = vi.fn()
    const { rerender } = render(<NumberInput id="r" label="Отчётов" min={0} max={14} onChange={onChange} />)
    const f = screen.getByRole('spinbutton') as HTMLInputElement
    expect(f.value).toBe('0')
    fireEvent.change(f, { target: { value: 'abc' } })
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.change(f, { target: { value: '20' } })
    expect(described(f)).toBe('Число от 0 до 14')
    fireEvent.change(f, { target: { value: '' } })
    expect(onChange.mock.lastCall![1].value).toBe('')
    expect(described(f)).toBe('Введите число')
    rerender(<NumberInput id="r" label="Отчётов" min={0} max={14} allowEmpty value="" />)
    expect(f.value).toBe('')
    expect(f.getAttribute('aria-invalid')).toBeNull()
    expect(screen.getByRole('button', { name: 'увеличить' }).tabIndex).toBe(-1)
  })

  it('дробь — с точностью шага; hideSteppers — без кнопок', () => {
    const onChange = vi.fn()
    render(<NumberInput id="k" label="Коэффициент" defaultValue={0.1} step={0.2} hideSteppers onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' })
    expect(onChange.mock.lastCall![1].value).toBe(0.3)
    expect(screen.queryByRole('button', { name: 'увеличить' })).toBeNull()
  })
})

describe('поле настройки одной строкой (inline — Carbon, unit — расширение)', () => {
  it('inline: подпись слева, справа поле с единицей и под ними ошибка — ошибка у поля, а не под подписью', () => {
    render(<NumberInput id="k" inline label="Хранить файлы" unit="дней" defaultValue={20} max={10} />)
    const input = screen.getByRole('spinbutton', { name: 'Хранить файлы' })
    const column = input.closest('[data-slot="number-input"] > div:last-child')!
    expect(column.textContent).toContain('дней')
    expect(column.textContent).toContain('Не больше 10')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })
  it('число в строке — узкое (роль ширины number), единица сразу за ним; текст в строке — во всю колонку', () => {
    render(
      <>
        <NumberInput id="k" inline label="Хранить файлы" unit="дней" defaultValue={1} />
        <TextInput id="n" inline labelText="Название" />
        <Select id="s" inline labelText="Язык">
          <SelectItem value="ru" text="Русский" />
        </Select>
      </>,
    )
    expect(screen.getByRole('spinbutton', { name: 'Хранить файлы' }).closest('.w-number')).not.toBeNull()
    expect(screen.getByRole('textbox', { name: 'Название' }).closest('.w-number')).toBeNull()
    expect(screen.getByLabelText('Язык').closest('[data-inline=true]')).not.toBeNull()
  })
})

describe('ComboBox', () => {
  const items = [
    { id: 'a', label: 'Анна Петрова' },
    { id: 'b', label: 'Борис Смирнов' },
    { id: 'c', label: 'Вера Иванова', disabled: true },
    { id: 'd', label: 'Цветы' },
  ]
  const box = () => screen.getByRole('combobox')

  it('стрелка вниз открывает; печать (как у Carbon) не сужает, а ставит на первый подходящий; Enter — onChange({ selectedItem })', () => {
    const onChange = vi.fn()
    render(<ComboBox id="p" titleText="Сотрудник" items={items} onChange={onChange} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(box().getAttribute('aria-expanded')).toBe('true')
    fireEvent.change(box(), { target: { value: 'смир' } })
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(document.getElementById(box().getAttribute('aria-activedescendant')!)?.textContent).toBe('Борис Смирнов')
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith({ selectedItem: items[1] })
    expect((box() as HTMLInputElement).value).toBe('Борис Смирнов')
  })

  it('shouldFilterItem сужает список; выключенный пункт не выбрать', () => {
    const onChange = vi.fn()
    render(<ComboBox id="p" titleText="Сотрудник" items={items} onChange={onChange} shouldFilterItem={({ item, inputValue }) => !inputValue || item.label.toLowerCase().includes(inputValue.toLowerCase())} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    fireEvent.change(box(), { target: { value: 'вер' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Вера Иванова'])
    expect(screen.getByRole('option').getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(screen.getByRole('option'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Esc закрывает; в закрытом Esc очищает выбор; «Очистить выбор» тоже; выбранный — aria-selected', () => {
    const onChange = vi.fn()
    render(<ComboBox id="p" titleText="Сотрудник" items={items} initialSelectedItem={items[0]} onChange={onChange} />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    const sel = screen.getAllByRole('option')[0]
    expect(sel.getAttribute('aria-selected')).toBe('true')
    expect(sel.className).toContain('bg-selected')
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(box().getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(onChange).toHaveBeenLastCalledWith({ selectedItem: null })
  })

  it('подпись — titleText; строки — любой вид через itemToString и itemToElement', () => {
    const people = [{ key: 'x', name: 'Анна', team: 'Продажи' }]
    render(<ComboBox id="p" titleText="Кто" items={people} itemToString={(p) => p?.name ?? ''} itemToElement={(p) => <b>{p.team}</b>} initialSelectedItem={people[0]} onChange={() => {}} />)
    expect((screen.getByLabelText('Кто') as HTMLInputElement).value).toBe('Анна')
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(screen.getByRole('option').textContent).toBe('Продажи')
  })
})

describe('FileUploader, FileUploaderItem', () => {
  const file = (name: string, size: number, type = 'application/pdf') => {
    const f = new File(['x'], name, { type })
    Object.defineProperty(f, 'size', { value: size })
    return f
  }
  const input = (c: HTMLElement) => c.querySelector('input[type=file]') as HTMLInputElement

  it('заголовок, ограничения словами, кнопка (по умолчанию главная); взятый файл — строкой с «убрать»', () => {
    const onAddFiles = vi.fn()
    const onChange = vi.fn()
    const onDelete = vi.fn()
    const { container } = render(<FileUploader labelTitle="КП" labelDescription="PDF, до 1 МБ" accept={['.pdf']} maxFileSize={1024 * 1024} filenameStatus="edit" onAddFiles={onAddFiles} onChange={onChange} onDelete={onDelete} />)
    const btn = screen.getByRole('button', { name: 'КП Добавить файл' })
    expect(btn.dataset.kind).toBe('primary')
    expect(described(btn)).toBe('PDF, до 1 МБ')
    const click = vi.spyOn(input(container), 'click')
    fireEvent.click(btn)
    expect(click).toHaveBeenCalled()
    fireEvent.change(input(container), { target: { files: [file('кп.pdf', 2048)] } })
    expect(onAddFiles.mock.lastCall![1].addedFiles.map((f: File) => f.name)).toEqual(['кп.pdf'])
    expect(onChange).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Убрать файл: кп.pdf' }))
    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.queryByText('кп.pdf')).toBeNull()
  })

  it('не тот тип или больше maxFileSize — файл не взят: invalidFileType, строка с ошибкой; ref.clearFiles() — очистить', () => {
    const onAddFiles = vi.fn()
    const onChange = vi.fn()
    const ref = createRef<FileUploaderHandle>()
    const { container } = render(<FileUploader ref={ref} labelTitle="КП" accept={['.pdf']} maxFileSize={1024 * 1024} multiple filenameStatus="complete" onAddFiles={onAddFiles} onChange={onChange} />)
    fireEvent.change(input(container), { target: { files: [file('отчёт.xlsx', 10, 'application/vnd.ms-excel'), file('большой.pdf', 5 * 1024 * 1024)] } })
    expect(onAddFiles.mock.lastCall![1].addedFiles.map((f: File & { invalidFileType?: boolean }) => f.invalidFileType)).toEqual([true, true])
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('Не тот тип файла')).toBeTruthy()
    expect(screen.getByText('Файл больше 1 МБ')).toBeTruthy()
    act(() => ref.current!.clearFiles())
    expect(screen.queryByText('отчёт.xlsx')).toBeNull()
  })

  it('строка файла: uploading — идёт, complete — знак «загружен», edit — «убрать» с onDelete(event, { uuid })', () => {
    const onDelete = vi.fn()
    render(
      <>
        <FileUploaderItem name="a.pdf" status="uploading" />
        <FileUploaderItem name="b.pdf" status="complete" />
        <FileUploaderItem name="c.pdf" status="edit" uuid="c1" onDelete={onDelete} invalid errorSubject="Файл больше 1 МБ" errorBody="Выберите другой" />
      </>,
    )
    expect(document.querySelector('[data-slot=inline-loading][data-status=active]')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Загружен' })).toBeTruthy()
    const del = screen.getByRole('button', { name: 'Убрать файл: c.pdf' })
    expect(described(del)).toContain('Файл больше 1 МБ')
    fireEvent.click(del)
    expect(onDelete.mock.lastCall![1]).toEqual({ uuid: 'c1' })
  })
})

describe('Search', () => {
  it('область поиска с подписью для читалки; onChange — событие; «очистить» и Esc — пустое значение, onClear, фокус в поле', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    render(<Search labelText="Поиск по проектам" value="склад" onChange={onChange} onClear={onClear} />)
    expect(screen.getByRole('search', { name: 'Поиск по проектам' })).toBeTruthy()
    const f = screen.getByRole('searchbox', { name: 'Поиск по проектам' }) as HTMLInputElement
    expect(f.placeholder).toBe('Поиск')
    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }))
    expect(onChange.mock.lastCall![0].target.value).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(f)
    fireEvent.keyDown(f, { key: 'Escape' })
    expect(onClear).toHaveBeenCalledTimes(2)
  })

  it('без value — своё: набрано — «очистить» видна, очистка стирает поле', () => {
    render(<Search labelText="Поиск" />)
    const f = screen.getByRole('searchbox', { name: 'Поиск' }) as HTMLInputElement
    expect(screen.queryByRole('button', { name: 'Очистить поиск' })).toBeNull()
    fireEvent.change(f, { target: { value: 'а' } })
    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }))
    expect(f.value).toBe('')
  })
})

describe('Form, FormGroup', () => {
  it('форма отправляется кнопкой submit; группа называет поля своей подписью; ошибка группы — слово под ней', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(
      <Form aria-label="Доставка" onSubmit={onSubmit}>
        <FormGroup legendText="Адрес" invalid message messageText="Заполните адрес">
          <TextInput id="s" labelText="Улица" />
        </FormGroup>
        <button type="submit">Сохранить</button>
      </Form>,
    )
    expect(screen.getByRole('group', { name: 'Адрес' }).getAttribute('data-invalid')).toBe('true')
    expect(screen.getByText('Заполните адрес').closest('p')!.className).toContain('text-danger-fg')
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
