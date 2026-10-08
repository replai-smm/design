/**
 * Поведение окна, полей, аватара, подсказки и выбора с поиском (DS-1): клавиатура, связи подписей и ошибок для читалки,
 * замены, правила API. Вид и a11y историй — a11y.test.tsx, состояния — rules.test.tsx.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { useState } from 'react'
import {
  ActionArea,
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Combobox,
  ConfirmDialog,
  ConfirmProvider,
  Dialog,
  NumberField,
  Page,
  PageHeader,
  Select,
  TextArea,
  TextField,
  Tooltip,
  useConfirm,
  Drawer,
  FileField,
  acceptText,
  fileMatches,
  fileSizeText,
} from '../index'
import { initials } from '../components/Avatar'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

const describedText = (el: HTMLElement) =>
  (el.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)
    .join(' ')

describe('поле ввода', () => {
  it('подпись связана с полем, подсказка описывает поле', () => {
    render(<TextField label="Ссылка" helperText="Адрес из строки браузера" />)
    const f = screen.getByLabelText('Ссылка')
    expect(describedText(f)).toBe('Адрес из строки браузера')
    expect(f.getAttribute('aria-invalid')).toBeNull()
  })

  it('ошибка заменяет подсказку: aria-invalid, текст ошибки — в описании поля', () => {
    render(<TextField label="Ссылка" helperText="Адрес" error="Это не ссылка" />)
    const f = screen.getByLabelText('Ссылка')
    expect(f.getAttribute('aria-invalid')).toBe('true')
    expect(describedText(f)).toBe('Это не ссылка')
    expect(screen.queryByText('Адрес')).toBeNull()
    expect(f.closest('[data-slot=text-field]')?.getAttribute('data-invalid')).toBe('true')
  })

  it('спрятанная подпись остаётся для читалки', () => {
    render(<TextField label="Поиск" hideLabel />)
    expect(screen.getByLabelText('Поиск')).toBeTruthy()
    expect(screen.getByText('Поиск').className).toContain('sr-only')
  })

  it('многострочное: счётчик знаков следует за вводом', () => {
    render(<TextArea label="Текст" maxLength={10} showCount defaultValue="абв" />)
    expect(screen.getByText('3/10')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Текст'), { target: { value: 'абвгд' } })
    expect(screen.getByText('5/10')).toBeTruthy()
  })

  it('поле на странице — field-01, в окне и в панели — field-02 (слой Carbon)', () => {
    render(<TextField label="На странице" />)
    expect(screen.getByLabelText('На странице').className).toContain('bg-field-01')
    render(
      <Dialog defaultOpen title="Окно">
        <TextField label="В окне" />
      </Dialog>,
    )
    expect(screen.getByLabelText('В окне').className).toContain('bg-field-02')
  })

  it('в панели деталей — тоже field-02', () => {
    render(
      <Drawer defaultOpen title="Панель">
        <TextField label="В панели" />
      </Drawer>,
    )
    expect(screen.getByLabelText('В панели').className).toContain('bg-field-02')
  })
})

describe('выбор', () => {
  it('отдаёт значение; пустой первый пункт — подсказка, выбрать его нельзя', () => {
    const on = vi.fn()
    render(<Select label="Тип" placeholder="Выберите тип" options={[{ value: 'post', label: 'Пост' }]} onChange={on} />)
    const s = screen.getByLabelText('Тип') as HTMLSelectElement
    expect(s.value).toBe('')
    expect((screen.getByText('Выберите тип') as HTMLOptionElement).disabled).toBe(true)
    fireEvent.change(s, { target: { value: 'post' } })
    expect(on).toHaveBeenCalledWith('post')
  })

  it('ошибка — aria-invalid и текст в описании', () => {
    render(<Select label="Тип" options={[]} error="Выберите тип" />)
    const s = screen.getByLabelText('Тип')
    expect(s.getAttribute('aria-invalid')).toBe('true')
    expect(describedText(s)).toBe('Выберите тип')
  })
})

describe('галочка', () => {
  it('нажатие на подпись переключает; «частично» видно читалке как mixed', () => {
    const on = vi.fn()
    render(
      <>
        <Checkbox label="Лёгкий режим" onCheckedChange={on} />
        <Checkbox label="Все" checked="indeterminate" />
      </>,
    )
    const c = screen.getByRole('checkbox', { name: 'Лёгкий режим' })
    expect(c.getAttribute('aria-checked')).toBe('false')
    fireEvent.click(screen.getByText('Лёгкий режим'))
    expect(on).toHaveBeenCalledWith(true)
    expect(c.getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('checkbox', { name: 'Все' }).getAttribute('aria-checked')).toBe('mixed')
  })

  it('группа: legend называет группу, ошибка описывает её, недоступная группа выключает галочки', () => {
    render(
      <CheckboxGroup legend="Куда опубликовать" error="Отметьте хотя бы одно" disabled>
        <Checkbox label="Зерно" />
      </CheckboxGroup>,
    )
    const g = screen.getByRole('group', { name: 'Куда опубликовать' })
    expect(describedText(g)).toBe('Отметьте хотя бы одно')
    expect((screen.getByRole('checkbox', { name: 'Зерно' }) as HTMLButtonElement).matches(':disabled')).toBe(true)
  })
})

describe('число', () => {
  function Ctl(props: Partial<React.ComponentProps<typeof NumberField>>) {
    const [v, setV] = useState<number | null>('defaultValue' in props ? (props.defaultValue ?? null) : 5)
    return (
      <>
        <NumberField label="Постов" {...props} defaultValue={undefined} value={v} onChange={setV} />
        <output data-testid="v">{String(v)}</output>
      </>
    )
  }
  const val = () => screen.getByTestId('v').textContent

  it('роль spinbutton со значением и границами', () => {
    render(<Ctl min={0} max={20} />)
    const f = screen.getByRole('spinbutton', { name: 'Постов' })
    expect(f.getAttribute('aria-valuenow')).toBe('5')
    expect(f.getAttribute('aria-valuemin')).toBe('0')
    expect(f.getAttribute('aria-valuemax')).toBe('20')
  })

  it('стрелки — шаг, PageUp/PageDown — 10 шагов, Home/End — к границам, не выходя за них', () => {
    render(<Ctl min={0} max={20} />)
    const f = screen.getByRole('spinbutton')
    fireEvent.keyDown(f, { key: 'ArrowUp' })
    expect(val()).toBe('6')
    fireEvent.keyDown(f, { key: 'ArrowDown' })
    fireEvent.keyDown(f, { key: 'ArrowDown' })
    expect(val()).toBe('4')
    fireEvent.keyDown(f, { key: 'PageUp' })
    expect(val()).toBe('14')
    fireEvent.keyDown(f, { key: 'PageUp' })
    expect(val()).toBe('20')
    fireEvent.keyDown(f, { key: 'Home' })
    expect(val()).toBe('0')
    fireEvent.keyDown(f, { key: 'ArrowDown' })
    expect(val()).toBe('0')
    fireEvent.keyDown(f, { key: 'End' })
    expect(val()).toBe('20')
  })

  it('кнопки «−» и «+» — в обход табуляции; у края кнопка выключена', () => {
    render(<Ctl min={0} max={6} />)
    const plus = screen.getByRole('button', { name: 'увеличить' })
    expect(plus.tabIndex).toBe(-1)
    fireEvent.click(plus)
    expect(val()).toBe('6')
    expect((plus as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'уменьшить' }))
    expect(val()).toBe('5')
  })

  it('ввод: буквы не принимает, пусто — null, запятая — дробь', () => {
    render(<Ctl allowDecimal />)
    const f = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(f, { target: { value: '12a' } })
    expect(val()).toBe('5')
    fireEvent.change(f, { target: { value: '' } })
    expect(val()).toBe('null')
    fireEvent.change(f, { target: { value: '2,' } })
    expect(f.value).toBe('2,')
    expect(val()).toBe('2')
    fireEvent.change(f, { target: { value: '2,5' } })
    expect(val()).toBe('2.5')
    fireEvent.blur(f)
    expect(f.value).toBe('2,5')
  })

  it('вне границ — ошибка словами, своя ошибка важнее', () => {
    render(<NumberField label="День" defaultValue={42} min={1} max={31} />)
    const f = screen.getByRole('spinbutton')
    expect(f.getAttribute('aria-invalid')).toBe('true')
    expect(describedText(f)).toBe('Число от 1 до 31')
    render(<NumberField label="Бюджет" defaultValue={0} error="Бюджет не задан" />)
    expect(describedText(screen.getByRole('spinbutton', { name: 'Бюджет' }))).toBe('Бюджет не задан')
  })

  it('пусто и шаг — с нуля (или с ближайшей границы)', () => {
    render(<Ctl defaultValue={null} min={3} />)
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' })
    expect(val()).toBe('3')
  })
})

describe('выбор с поиском', () => {
  const options = [
    { value: 'a', label: 'Кофейня «Зерно»' },
    { value: 'b', label: 'Студия йоги', description: 'клиент «Асана»' },
    { value: 'c', label: 'Пекарня у дома', disabled: true },
    { value: 'd', label: 'Ёлки-палки' },
  ]
  function Ctl({ initial = null as string | null, ...rest }: Partial<React.ComponentProps<typeof Combobox>> & { initial?: string | null }) {
    const [v, setV] = useState<string | null>(initial)
    return (
      <>
        <Combobox label="Сообщество" options={options} value={v} onChange={setV} {...rest} />
        <output data-testid="v">{String(v)}</output>
      </>
    )
  }
  const val = () => screen.getByTestId('v').textContent
  const box = () => screen.getByRole('combobox', { name: 'Сообщество' }) as HTMLInputElement

  it('закрыт: aria-expanded=false, списка нет; стрелка вниз открывает', () => {
    render(<Ctl />)
    expect(box().getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(box().getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('listbox').id).toBe(box().getAttribute('aria-controls'))
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('печать сужает список (без регистра, ё = е, по второй строке тоже)', () => {
    render(<Ctl />)
    fireEvent.change(box(), { target: { value: 'ЕЛКИ' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Ёлки-палки'])
    fireEvent.change(box(), { target: { value: 'асана' } })
    expect(screen.getAllByRole('option')[0]!.textContent).toContain('Студия йоги')
  })

  it('стрелки ходят мимо недоступного пункта, Enter выбирает, список закрывается', () => {
    render(<Ctl />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    const activeText = () => document.getElementById(box().getAttribute('aria-activedescendant')!)?.textContent
    expect(activeText()).toBe('Кофейня «Зерно»')
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(activeText()).toBe('Ёлки-палки')
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    expect(activeText()).toBe('Кофейня «Зерно»')
    fireEvent.keyDown(box(), { key: 'ArrowUp' })
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(val()).toBe('d')
    expect(box().value).toBe('Ёлки-палки')
    expect(box().getAttribute('aria-expanded')).toBe('false')
  })

  it('клик по пункту выбирает; выбранный — aria-selected', () => {
    render(<Ctl initial="a" />)
    fireEvent.click(box())
    expect(screen.getByRole('option', { name: /Зерно/ }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('option', { name: /Студия/ }))
    expect(val()).toBe('b')
  })

  it('Esc закрывает и возвращает выбранное; в закрытом поле Esc очищает выбор', () => {
    render(<Ctl initial="a" />)
    fireEvent.change(box(), { target: { value: 'студ' } })
    expect(box().value).toBe('студ')
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(box().value).toBe('Кофейня «Зерно»')
    expect(val()).toBe('a')
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(val()).toBe('null')
  })

  it('limit: не больше N пунктов и «уточните поиск»; поиск ищет по всему списку', () => {
    const many = Array.from({ length: 75 }, (_, i) => ({ value: `m${i}`, label: `Сообщество ${i}` }))
    render(<Combobox label="Сообщество" options={many} limit={60} defaultOpen />)
    expect(screen.getAllByRole('option')).toHaveLength(60)
    expect(document.querySelector('[data-slot=combobox-more]')?.textContent).toBe('Показаны первые 60 из 75 — уточните поиск')
    fireEvent.change(box(), { target: { value: 'Сообщество 74' } })
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Сообщество 74'])
    expect(document.querySelector('[data-slot=combobox-more]')).toBeNull()
  })

  it('ушли из поля, не выбрав, — поле показывает выбранное', () => {
    render(<Ctl initial="b" />)
    fireEvent.change(box(), { target: { value: 'кофе' } })
    fireEvent.blur(box())
    expect(box().value).toBe('Студия йоги')
    expect(val()).toBe('b')
  })

  it('«×» очищает выбор; без clearable кнопки нет', () => {
    render(<Ctl initial="a" />)
    fireEvent.click(screen.getByRole('button', { name: 'очистить выбор' }))
    expect(val()).toBe('null')
    expect(box().value).toBe('')
  })

  it('clearable={false}: ни «×», ни очистки по Esc', () => {
    render(<Ctl initial="a" clearable={false} />)
    expect(screen.queryByRole('button', { name: 'очистить выбор' })).toBeNull()
    fireEvent.keyDown(box(), { key: 'Escape' })
    expect(val()).toBe('a')
  })

  it('пусто — «ничего не найдено», aria-controls ведёт на открытый слой', () => {
    render(<Ctl emptyText="Таких нет" />)
    fireEvent.change(box(), { target: { value: 'щщщ' } })
    expect(screen.getByText('Таких нет').getAttribute('role')).toBe('status')
    expect(document.getElementById(box().getAttribute('aria-controls')!)).toBeTruthy()
  })

  it('загрузка — «загрузка» в слое списка', () => {
    render(<Ctl loading defaultOpen />)
    expect(screen.getByText('загрузка…').getAttribute('role')).toBe('status')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('недоступный — не открывается', () => {
    render(<Ctl disabled />)
    fireEvent.keyDown(box(), { key: 'ArrowDown' })
    fireEvent.click(box())
    expect(box().getAttribute('aria-expanded')).toBe('false')
  })

  it('ошибка — aria-invalid и текст в описании', () => {
    render(<Ctl error="Выберите сообщество" />)
    expect(box().getAttribute('aria-invalid')).toBe('true')
    expect(describedText(box())).toBe('Выберите сообщество')
  })
})

describe('аватар', () => {
  it('буквы — первые буквы двух слов, без кавычек', () => {
    expect(initials('Кофейня «Зерно»')).toBe('КЗ')
    expect(initials('анна')).toBe('А')
    expect(initials('  ')).toBe('')
  })

  it('картинки нет — буквы и подпись для читалки; без имени — значок, скрыт от читалки', () => {
    render(<Avatar name="Студия йоги" />)
    expect(screen.getByRole('img', { name: 'Студия йоги' }).textContent).toBe('СЙ')
    const { container } = render(<Avatar />)
    expect(container.querySelector('[data-slot=avatar]')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('украшение рядом с именем — скрыто от читалки', () => {
    const { container } = render(<Avatar name="Зерно" decorative />)
    expect(container.querySelector('[data-slot=avatar]')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('картинка не загрузилась — замена (буквы), без пустого места', () => {
    render(<Avatar name="Пекарня у дома" src="нет-такой.png" />)
    expect(screen.getByText('ПУ')).toBeTruthy()
  })
})

describe('подсказка', () => {
  it('открыта — текст в роли tooltip, связан с кнопкой', async () => {
    render(
      <Tooltip content="Ключ отозван" defaultOpen>
        <Button aria-label="нет доступа" />
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip').textContent).toBe('Ключ отозван')
    const b = screen.getByRole('button', { name: 'нет доступа' })
    expect(describedText(b)).toContain('Ключ отозван')
  })

  it('фокус с клавиатуры открывает, Esc закрывает', async () => {
    render(
      <Tooltip content="Опубликовано вчера">
        <Button>Вчера</Button>
      </Tooltip>,
    )
    const b = screen.getByRole('button', { name: 'Вчера' })
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Опубликовано вчера'))
    fireEvent.keyDown(b, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('у элемента без фокуса — ошибка в разработке', () => {
    quiet()
    expect(() =>
      render(
        <Tooltip content="x">
          <span>⚠</span>
        </Tooltip>,
      ),
    ).toThrow(/не берёт фокус/)
  })
})

describe('окно', () => {
  it('фокус — на первом поле тела; Esc закрывает и сообщает об этом', async () => {
    const on = vi.fn()
    render(
      <Dialog defaultOpen onOpenChange={on} title="Рабочая страница" actions={<ActionArea primary={{ label: 'Сохранить' }} />}>
        <TextField label="Ссылка" />
      </Dialog>,
    )
    expect(screen.getByRole('dialog', { name: 'Рабочая страница' })).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Ссылка')))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(on).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('без полей — фокус на главной кнопке', async () => {
    render(<Dialog defaultOpen title="Т" actions={<ActionArea primary={{ label: 'Понятно' }} />} />)
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Понятно' })))
  })

  it('persistent: клик мимо не закрывает', async () => {
    render(
      <Dialog defaultOpen persistent title="Форма">
        <TextField label="Поле" />
      </Dialog>,
    )
    const overlay = document.querySelector('.ds-overlay')!
    fireEvent.pointerDown(overlay)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('окно — своя поверхность: его главная не спорит с главной страницы; две главные в окне — ошибка', () => {
    render(
      <Page header={<PageHeader title="Т" />} actions={<ActionArea primary={{ label: 'Главная страницы' }} />}>
        <Dialog defaultOpen title="Окно" actions={<ActionArea primary={{ label: 'Главная окна' }} />} />
      </Page>,
    )
    expect(document.querySelectorAll('[data-variant=primary]')).toHaveLength(2)
    quiet()
    expect(() =>
      render(
        <Dialog defaultOpen title="Окно" actions={<ActionArea primary={{ label: 'А' }} />}>
          <ActionArea primary={{ label: 'Б' }} />
        </Dialog>,
      ),
    ).toThrow(/вторая главная/)
  })
})

describe('подтверждение (вместо window.confirm)', () => {
  it('опасное: красная кнопка без главной, фокус на «Отмена»', async () => {
    render(<ConfirmDialog defaultOpen danger title="Удалить черновик?" confirmLabel="Удалить" onConfirm={() => {}} />)
    const del = screen.getByRole('button', { name: 'Удалить' })
    expect(del.dataset.variant).toBe('danger')
    expect(document.querySelector('[role=dialog] [data-variant=primary]')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Отмена' })))
  })

  it('обычное: действие — главная кнопка, фокус на ней', async () => {
    render(<ConfirmDialog defaultOpen title="Отметить все?" confirmLabel="Отметить" onConfirm={() => {}} />)
    const ok = screen.getByRole('button', { name: 'Отметить' })
    expect(ok.dataset.variant).toBe('primary')
    await waitFor(() => expect(document.activeElement).toBe(ok))
  })

  it('обещание: кнопка ждёт, успех закрывает окно', async () => {
    let done!: () => void
    const on = vi.fn()
    render(<ConfirmDialog defaultOpen title="Удалить?" confirmLabel="Удалить" danger onOpenChange={on} onConfirm={() => new Promise<void>((r) => (done = r))} />)
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(screen.getByRole('button', { name: 'Удалить' }).getAttribute('aria-busy')).toBe('true')
    expect((screen.getByRole('button', { name: 'Отмена' }) as HTMLButtonElement).disabled).toBe(true)
    await act(async () => done())
    expect(on).toHaveBeenCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('отказ: причина плашкой в окне, окно открыто', async () => {
    render(<ConfirmDialog defaultOpen title="Удалить?" confirmLabel="Удалить" danger onConfirm={() => Promise.reject(new Error('VK не ответил'))} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Удалить' })))
    expect(screen.getByRole('alert').textContent).toContain('VK не ответил')
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('«Отмена» закрывает и зовёт onCancel, действие не зовётся', () => {
    const ok = vi.fn()
    const cancel = vi.fn()
    render(<ConfirmDialog defaultOpen title="Удалить?" confirmLabel="Удалить" onConfirm={ok} onCancel={cancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(ok).not.toHaveBeenCalled()
  })

  it('useConfirm: «да» — true, «отмена» — false', async () => {
    const answers: boolean[] = []
    function Ask() {
      const confirm = useConfirm()
      return <Button onClick={async () => answers.push(await confirm({ title: 'Удалить пост?', danger: true }))}>Спросить</Button>
    }
    render(
      <ConfirmProvider>
        <Ask />
      </ConfirmProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }))
    await act(async () => fireEvent.click(await screen.findByRole('button', { name: 'Удалить' })))
    await waitFor(() => expect(answers).toEqual([true]))
    fireEvent.click(screen.getByRole('button', { name: 'Спросить' }))
    await act(async () => fireEvent.click(await screen.findByRole('button', { name: 'Отмена' })))
    await waitFor(() => expect(answers).toEqual([true, false]))
  })

  it('useConfirm вне поставщика — понятная ошибка', () => {
    quiet()
    function Bad() {
      useConfirm()
      return null
    }
    expect(() => render(<Bad />)).toThrow(/ConfirmProvider/)
  })
})

describe('выбор файла', () => {
  const MB = 1024 * 1024
  const file = (name: string, size: number, type = '') => new File([new Uint8Array(size)], name, { type })
  const choose = (files: File[]) => {
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(input, { target: { files } })
  }

  it('кнопка названа подписью и своим словом, ограничения словами в подсказке', () => {
    render(<FileField label="Вложение" accept=".pdf,image/*" maxSize={10 * MB} />)
    const b = screen.getByRole('button', { name: 'Вложение Выбрать файл' })
    expect(describedText(b)).toBe('Можно: PDF, картинки · до 10 МБ')
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    expect(input.hidden).toBe(true)
    expect(input.accept).toBe('.pdf,image/*')
  })

  it('кнопка открывает выбор файла (клик по скрытому input) и ref.open() тоже', () => {
    const ref = { current: null as null | { open: () => void } }
    render(<FileField ref={ref} label="Вложение" />)
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    const click = vi.spyOn(input, 'click').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /Выбрать файл/ }))
    ref.current!.open()
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('выбран файл — имя, размер и «убрать»; onChange получает файлы', () => {
    const onChange = vi.fn()
    render(<FileField label="Вложение" accept=".pdf" onChange={onChange} />)
    choose([file('отчёт.pdf', 870 * 1024, 'application/pdf')])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'отчёт.pdf' })])
    expect(screen.getByRole('list', { name: 'Выбранные файлы' }).textContent).toContain('870 КБ')
    fireEvent.click(screen.getByRole('button', { name: 'Убрать «отчёт.pdf»' }))
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(screen.queryByRole('list', { name: 'Выбранные файлы' })).toBeNull()
  })

  it('не тот тип и больше предела — файл не взят, ошибка словами вместо подсказки', () => {
    const onChange = vi.fn()
    render(<FileField label="Вложение" accept=".pdf,image/*" maxSize={1 * MB} onChange={onChange} />)
    choose([file('вирус.exe', 10)])
    expect(onChange).not.toHaveBeenCalled()
    const b = screen.getByRole('button', { name: /Выбрать файл/ })
    expect(describedText(b)).toBe('«вирус.exe» — не тот тип, можно: PDF, картинки')
    expect(document.querySelector('[data-slot=file-field]')?.getAttribute('data-invalid')).toBe('true')
    choose([file('большой.pdf', 3 * MB, 'application/pdf')])
    expect(describedText(b)).toBe('«большой.pdf» больше 1 МБ (3 МБ)')
    choose([file('фото.JPG', 100, 'image/jpeg')])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'фото.JPG' })])
    expect(describedText(b)).toBe('Можно: PDF, картинки · до 1 МБ')
  })

  it('несколько файлов: добавляются к выбранным, сверх maxFiles — не взяты и сказано', () => {
    const onChange = vi.fn()
    render(<FileField label="Фото" multiple maxFiles={2} onChange={onChange} />)
    choose([file('1.jpg', 1)])
    choose([file('2.jpg', 1), file('3.jpg', 1)])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: '1.jpg' }), expect.objectContaining({ name: '2.jpg' })])
    expect(describedText(screen.getByRole('button', { name: /Выбрать файлы/ }))).toBe('Файлов больше 2 — лишние не взяты')
  })

  it('внешняя ошибка важнее своей; недоступно — кнопка не нажимается', () => {
    render(<FileField label="Вложение" error="Сервер не принял файл" disabled />)
    const b = screen.getByRole('button', { name: /Выбрать файл/ }) as HTMLButtonElement
    expect(describedText(b)).toBe('Сервер не принял файл')
    expect(b.disabled).toBe(true)
  })

  it('слова: размер, типы, совпадение типа', () => {
    expect(fileSizeText(512)).toBe('512 Б')
    expect(fileSizeText(870 * 1024)).toBe('870 КБ')
    expect(fileSizeText(12.34 * MB)).toBe('12 МБ')
    expect(fileSizeText(1.5 * MB)).toBe('1,5 МБ')
    expect(acceptText('.pdf, .docx,image/*,application/vnd.ms-excel')).toBe('PDF, DOCX, картинки, VND.MS-EXCEL')
    expect(fileMatches(file('a.PDF', 1), '.pdf')).toBe(true)
    expect(fileMatches(file('a.png', 1, 'image/png'), 'image/*')).toBe(true)
    expect(fileMatches(file('a.txt', 1, 'text/plain'), '.pdf,image/*')).toBe(false)
  })
})
