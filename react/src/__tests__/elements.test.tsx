/**
 * Элементы и правила API: одна главная на поверхность (П5), опасное не рядом с главной (П10), в строке — только ghost
 * (проверка в разработке, приманка на каждое), виды и размеры Carbon, метка и индикатор, счётчик, шаги, шкала, ход в
 * строке, подсказка, справка, раскрытие, скелет, разница, график, значок.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import {
  Accordion,
  AccordionItem,
  Button,
  ButtonSet,
  BottomBar,
  Chart,
  chartHasData,
  Column,
  ContainedList,
  ContainedListItem,
  CountBadge,
  countText,
  Delta,
  deltaText,
  DismissibleTag,
  Grid,
  Heading,
  Icon,
  IconButton,
  IconIndicator,
  InlineLoading,
  Link,
  Meter,
  meterTone,
  Modal,
  niceMax,
  Page,
  PageHeader,
  ProgressIndicator,
  ProgressStep,
  Section,
  SkeletonPlaceholder,
  SkeletonText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tag,
  tickIndexes,
  ticksOf,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
  Tooltip,
} from '../index'
import { ICON_INDICATOR, ICON_INDICATOR_KINDS, NOTIFICATION_TONE, TAG_TYPES, TONE_ORDER } from '../lib/vocab'
import { Add, Close } from '../lib/icons.gen'

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

describe('кнопки: одна главная (П5), опасное не рядом (П10), в строке — ghost', () => {
  it('kind по умолчанию — primary, как у Carbon: инверсия', () => {
    render(<Button>Сохранить</Button>)
    const b = screen.getByRole('button', { name: 'Сохранить' })
    expect(b.dataset.kind).toBe('primary')
    expect(b.className).toContain('bg-inverse')
  })

  it('приманка: вторая kind="primary" на странице — ошибка; окно — своя поверхность', () => {
    quiet()
    expect(() =>
      render(
        <Page header={<PageHeader title="Т" />}>
          <Button>Первая</Button>
          <Button>Вторая</Button>
        </Page>,
      ),
    ).toThrow(/вторая главная кнопка/)
    render(
      <Page header={<PageHeader title="Т" />}>
        <Button>Главная страницы</Button>
        <Button kind="secondary">Тихая</Button>
        <Modal open modalHeading="Окно" primaryButtonText="Главная окна" />
      </Page>,
    )
    expect(document.querySelectorAll('[data-kind=primary]')).toHaveLength(2)
  })

  it('приманка: kind="danger" в одном ButtonSet с primary — ошибка; любой опасный вид — тоже; без главной — можно', () => {
    quiet()
    for (const kind of ['danger', 'danger--tertiary', 'danger--ghost'] as const)
      expect(
        () =>
          render(
            <ButtonSet>
              <Button kind={kind}>Удалить</Button>
              <Button>Сохранить</Button>
            </ButtonSet>,
          ),
        kind,
      ).toThrow(/опасное действие рядом с главным/)
    expect(() =>
      render(
        <ButtonSet>
          <Button kind="secondary">Отмена</Button>
          <Button kind="danger">Удалить</Button>
        </ButtonSet>,
      ),
    ).not.toThrow()
  })

  it('приманка: две главные в одном наборе и набор в наборе — ошибка', () => {
    quiet()
    expect(() =>
      render(
        <ButtonSet>
          <Button>А</Button>
          <Button>Б</Button>
        </ButtonSet>,
      ),
    ).toThrow(/две главные/)
    expect(() =>
      render(
        <ButtonSet>
          <ButtonSet />
        </ButtonSet>,
      ),
    ).toThrow(/внутри другого набора/)
  })

  it('приманка: в строке списка набор — ошибка, любой вид кроме ghost — ошибка, ghost — можно', () => {
    quiet()
    const t = (action: React.ReactNode) =>
      render(
        <ContainedList>
          <ContainedListItem action={action}>строка</ContainedListItem>
        </ContainedList>,
      )
    expect(() => t(<ButtonSet />)).toThrow(/в строке списка нет набора/)
    expect(() => t(<Button>x</Button>)).toThrow(/только kind="ghost"/)
    expect(() => t(<Button kind="secondary">x</Button>)).toThrow(/только kind="ghost"/)
    expect(() => t(<Button kind="danger--ghost">x</Button>)).toThrow(/только kind="ghost"/)
    expect(() =>
      t(
        <IconButton kind="secondary" label="Убрать">
          <Close />
        </IconButton>,
      ),
    ).toThrow(/только kind="ghost"/)
    expect(() => t(<Button kind="ghost">Починить</Button>)).not.toThrow()
    const row = (action: React.ReactNode) =>
      render(
        <Table aria-label="т">
          <TableBody>
            <TableRow>
              <TableCell>{action}</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )
    expect(() => row(<Button>x</Button>)).toThrow(/только kind="ghost"/)
    expect(() => row(<Button kind="ghost">Починить</Button>)).not.toThrow()
  })

  it('виды Carbon: danger — заливка тона, danger--tertiary — рамка, tertiary — рамка цвета главной; чужой вид — ошибка', () => {
    render(
      <>
        <Button kind="danger">А</Button>
        <Button kind="danger--tertiary">Б</Button>
        <Button kind="tertiary">В</Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'А' }).className).toContain('bg-danger')
    expect(screen.getByRole('button', { name: 'Б' }).className).toContain('border-danger')
    expect(screen.getByRole('button', { name: 'В' }).className).toContain('border-inverse')
    quiet()
    // @ts-expect-error — вида «warning» у Carbon нет
    expect(() => render(<Button kind="warning">x</Button>)).toThrow(/вида кнопки «warning» нет/)
  })

  it('размер: без size — 48/40, sm 32, md 40, lg 48; xs — ошибка', () => {
    render(
      <>
        <Button kind="secondary">А</Button>
        <Button kind="secondary" size="sm">
          Б
        </Button>
        <Button kind="secondary" size="lg">
          В
        </Button>
      </>,
    )
    expect(screen.getByRole('button', { name: 'А' }).className).toContain('min-h-touch md:min-h-control')
    expect(screen.getByRole('button', { name: 'Б' }).className).toContain('min-h-dense')
    expect(screen.getByRole('button', { name: 'В' }).className).toContain('min-h-touch')
    quiet()
    // @ts-expect-error — xs нет: меньше цели пальца
    expect(() => render(<Button size="xs">x</Button>)).toThrow(/размера «xs» нет/)
  })

  it('renderIcon — компонент значка после слова; без слова — IconButton, у Button — ошибка; href — ссылка видом кнопки', () => {
    render(
      <Button kind="ghost" renderIcon={Add}>
        Добавить
      </Button>,
    )
    const b = screen.getByRole('button', { name: 'Добавить' })
    expect(b.lastElementChild?.getAttribute('data-icon')).toBe('add')
    quiet()
    expect(() => render(<Button kind="ghost" renderIcon={Add} />)).toThrow(/IconButton/)
    render(
      <Button kind="secondary" href="#x">
        Перейти
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Перейти' }).getAttribute('href')).toBe('#x')
  })

  it('IconButton: подпись — имя для читалки и подсказка; без подписи — ошибка', async () => {
    render(
      <IconButton kind="ghost" label="Закрыть">
        <Close />
      </IconButton>,
    )
    const b = screen.getByRole('button', { name: 'Закрыть' })
    expect(b.className).toContain('w-touch md:w-control')
    act(() => b.focus())
    await waitFor(() => expect(screen.getByRole('tooltip').textContent).toBe('Закрыть'))
    quiet()
    expect(() =>
      render(
        // @ts-expect-error — label обязателен
        <IconButton kind="ghost">
          <Close />
        </IconButton>,
      ),
    ).toThrow(/нет подписи label/)
  })
})

describe('метка и индикатор (Carbon: Tag, IconIndicator)', () => {
  it('Tag: цвет — пара роли, проверенная контрастом; цвета без роли — ошибка', () => {
    for (const type of TAG_TYPES) {
      const { container, unmount } = render(<Tag type={type}>слово</Tag>)
      const el = container.querySelector('[data-slot=tag]')!
      expect(el.getAttribute('data-type')).toBe(type)
      expect(el.className).toContain('rounded-full')
      unmount()
    }
    const { container } = render(<Tag type="red">просрочено</Tag>)
    expect(container.querySelector('[data-slot=tag]')!.className).toContain('bg-danger-fill text-fg')
    quiet()
    // @ts-expect-error — голубого цвета в ролях нет
    expect(() => render(<Tag type="cyan">x</Tag>)).toThrow(/цвета метки «cyan» нет/)
  })

  it('DismissibleTag: кнопка «убрать» с подписью; нажатие — onClose', () => {
    const onClose = vi.fn()
    render(<DismissibleTag text="Казань" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Убрать: Казань' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('IconIndicator: у каждого вида свой знак и роль цвета; слово обязательно', () => {
    for (const kind of ICON_INDICATOR_KINDS) {
      const { container, unmount } = render(<IconIndicator kind={kind} label="слово" />)
      const svg = container.querySelector('svg')!
      expect(svg.getAttribute('data-icon'), kind).toBe(ICON_INDICATOR[kind].icon)
      expect(svg.getAttribute('class'), kind).toContain(ICON_INDICATOR[kind].mark)
      expect(container.textContent).toBe('слово')
      unmount()
    }
    expect(new Set(ICON_INDICATOR_KINDS.map((k) => ICON_INDICATOR[k].icon)).size).toBe(ICON_INDICATOR_KINDS.length)
    quiet()
    expect(() => render(<IconIndicator kind="failed" label="" />)).toThrow(/нет слова/)
  })

  it('«решение» — фиолетовый тон с подложкой у наших компонентов (счётчик со знаком, значок); в порядке внимания — сразу за «опасно»; у пар Carbon его нет', () => {
    const { container } = render(
      <>
        <CountBadge count={2} tone="решение" />
        <Icon tone="решение" />
      </>,
    )
    expect(container.querySelector('[data-slot=count-badge] svg[data-icon=tone-decision]')).toBeTruthy()
    expect(container.querySelector(':scope > svg[data-icon=tone-decision]')?.getAttribute('class')).toContain('text-decision')
    expect(TONE_ORDER.slice(0, 3)).toEqual(['опасно', 'решение', 'внимание'])
    expect(Object.values(NOTIFICATION_TONE)).not.toContain('решение')
  })
})

describe('значок', () => {
  it('по имени — украшение; по тону — знак своей формы и цвета; с label — картинка для читалки', () => {
    const { container } = render(
      <>
        <Icon name="close" />
        <Icon tone="опасно" />
        <Icon name="search" label="поиск" />
      </>,
    )
    const [a, b] = container.querySelectorAll('svg')
    expect(a.getAttribute('aria-hidden')).toBe('true')
    expect(b.getAttribute('data-icon')).toBe('tone-danger')
    expect(b.getAttribute('class')).toContain('text-danger')
    expect(screen.getByRole('img', { name: 'поиск' })).toBeTruthy()
  })
})

describe('счётчик', () => {
  it('число до 99, «99+» сверху, строка как есть; label — для читалки; новое — инверсия', () => {
    expect([countText(5), countText(100), countText('!')]).toEqual(['5', '99+', '!'])
    render(<CountBadge count={3} tone="инфо" label="непрочитанных" />)
    const el = document.querySelector('[data-slot=count-badge]')!
    expect(el.textContent).toBe('непрочитанных: 3')
    expect(el.className).toContain('bg-inverse')
  })

  it('срочное — со знаком тона, не только цветом; обычное — без знака', () => {
    const { container } = render(<CountBadge count={7} tone="опасно" />)
    expect(container.querySelector('svg[data-icon=tone-danger]')).toBeTruthy()
    const n = render(<CountBadge count={7} />)
    expect(n.container.querySelector('svg')).toBeNull()
  })
})

describe('ход работы', () => {
  const steps = (invalidAt?: number) => ['Текст', 'Куда', 'Предпросмотр', 'Итог'].map((l, i) => <ProgressStep key={l} label={l} invalid={i === invalidAt} />)

  it('шаги: пройден · текущий · впереди · ошибка; текущий — aria-current=step; телефон — «Шаг 2 из 4 · Куда»', () => {
    const { container, rerender } = render(<ProgressIndicator aria-label="Шаги публикации" currentIndex={1}>{steps()}</ProgressIndicator>)
    const list = screen.getByRole('list', { name: 'Шаги публикации' })
    const items = list.querySelectorAll('[data-slot=progress-step]')
    expect([...items].map((li) => li.getAttribute('data-state'))).toEqual(['complete', 'current', 'incomplete', 'incomplete'])
    expect(items[1].getAttribute('aria-current')).toBe('step')
    expect(items[0].textContent).toContain('пройден')
    expect(container.querySelector('[data-slot=progress-compact]')!.textContent).toBe('Шаг 2 из 4 · Куда')
    rerender(<ProgressIndicator aria-label="Шаги публикации" currentIndex={3}>{steps(3)}</ProgressIndicator>)
    expect(list.querySelectorAll('[data-slot=progress-step]')[3].getAttribute('data-state')).toBe('invalid')
  })

  it('onChange — нажимаются шаги кроме текущего и выключенных (как у Carbon); меньше трёх шагов — ошибка', () => {
    const seen: number[] = []
    render(
      <ProgressIndicator aria-label="Шаги" currentIndex={1} onChange={(i) => seen.push(i)}>
        <ProgressStep label="А" />
        <ProgressStep label="Б" />
        <ProgressStep label="В" />
        <ProgressStep label="Г" disabled />
      </ProgressIndicator>,
    )
    const btns = screen.getAllByRole('button')
    expect(btns).toHaveLength(2)
    fireEvent.click(btns[1])
    expect(seen).toEqual([2])
    quiet()
    expect(() =>
      render(
        <ProgressIndicator aria-label="Шаги">
          <ProgressStep label="А" />
          <ProgressStep label="Б" />
        </ProgressIndicator>,
      ),
    ).toThrow(/шагов меньше трёх/)
  })

  it('ход в строке: active — дуга и aria-live, error — слово цвета «опасно», finished — onSuccess через successDelay', () => {
    vi.useFakeTimers()
    const done = vi.fn()
    const { container, rerender } = render(<InlineLoading description="работает" />)
    const el = container.querySelector('[data-slot=inline-loading]')!
    expect(el.getAttribute('aria-live')).toBe('assertive')
    expect(container.querySelector('[data-slot=spinner]')).toBeTruthy()
    rerender(<InlineLoading description="не вышло" status="error" />)
    expect(screen.getByText('не вышло').className).toContain('text-danger-fg')
    rerender(<InlineLoading description="готово" status="finished" onSuccess={done} successDelay={500} />)
    act(() => vi.advanceTimersByTime(499))
    expect(done).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(done).toHaveBeenCalled()
    rerender(<InlineLoading description="ждёт" status="inactive" />)
    expect(el.getAttribute('aria-live')).toBe('off')
    vi.useRealTimers()
  })

  it('шкала: ниже 80 % без тона, с 80 % — внимание, с 95 % — опасно; role=meter со словом', () => {
    expect([meterTone(0.5), meterTone(0.8), meterTone(0.95)]).toEqual([null, 'внимание', 'опасно'])
    render(<Meter label="5 ч" value={97} helperText="97 % · сброс 18:40" />)
    const m = screen.getByRole('meter', { name: '5 ч' })
    expect(m.getAttribute('aria-valuetext')).toBe('97 % · сброс 18:40')
    expect(document.querySelector('[data-slot=meter] svg[data-icon=tone-danger]')).toBeTruthy()
  })
})

describe('разница и график', () => {
  it('разница: проценты и рубли словами; перерасход — знак «опасно»; ноль — без стрелки', () => {
    expect(deltaText(12.5)).toBe('12,5%')
    expect(deltaText(-1234, '₽')).toBe('1\u00a0234 ₽')
    const { container, rerender } = render(<Delta value={1234} unit="₽" higherIsBetter={false} />)
    expect(container.textContent).toContain('больше на')
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('text-danger')
    rerender(<Delta value={0} />)
    expect(container.querySelector('svg')).toBeNull()
    expect(container.textContent).toContain('без изменений')
  })

  it('график: ряды — роли рядов данных, не цвета тонов; вид линии; role=img', () => {
    const { container } = render(<Chart kind="line" label="Посещения" labels={['1', '2', '3']} series={[{ key: 'a', label: 'А', data: [1, 2, 3] }, { key: 'b', label: 'Б', data: [3, 2, null], line: 'dashed', series: 4 }]} />)
    expect(screen.getByRole('img', { name: 'Посещения' })).toBeTruthy()
    const lines = container.querySelectorAll('polyline')
    expect(lines[0].getAttribute('class')).toBe('stroke-series-1')
    expect(lines[1].getAttribute('class')).toBe('stroke-series-5')
    expect(lines[1].getAttribute('stroke-dasharray')).toBe('6 4')
    expect(container.innerHTML).not.toMatch(/danger|warning|success/)
  })

  it('заливка под линией: цвет ряда тише до оси, только у одного ряда линий', () => {
    const one = [{ key: 'a', label: 'А', data: [1, null, 3], series: 2 }]
    const { container, rerender } = render(<Chart kind="line" area label="Посещения" labels={['1', '2', '3']} series={one} />)
    const area = container.querySelector('[data-slot=chart-area]')!
    expect(area.getAttribute('class')).toBe('fill-series-3')
    expect(Number(area.getAttribute('fill-opacity'))).toBeLessThan(1)
    expect(area.getAttribute('d')).toMatch(/^M[\d.]+,216 L.* L[\d.]+,216 Z$/)
    rerender(<Chart kind="line" area label="Посещения" labels={['1', '2', '3']} series={[...one, { key: 'b', label: 'Б', data: [3, 2, 1] }]} />)
    expect(container.querySelector('[data-slot=chart-area]')).toBeNull()
    rerender(<Chart kind="line" label="Посещения" labels={['1', '2', '3']} series={one} />)
    expect(container.querySelector('[data-slot=chart-area]')).toBeNull()
  })

  it('ось: круглый верх, подписи X не чаще 10; мало данных — chartHasData ложь', () => {
    expect([niceMax(0), niceMax(7), niceMax(130)]).toEqual([1, 10, 200])
    expect(ticksOf(200)).toEqual([0, 50, 100, 150, 200])
    expect(tickIndexes(30)).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27])
    expect(chartHasData('line', [{ key: 'a', label: 'a', data: [1, null] }])).toBe(false)
    expect(chartHasData('bar', [{ key: 'a', label: 'a', data: [1] }])).toBe(true)
  })
})

describe('раскладка, заголовки, подсказка, справка, раскрытие, скелет', () => {
  it('Stack: шаг шкалы → роль отступа, без gap — без отступа; чужой шаг — ошибка', () => {
    const { container } = render(
      <>
        <Stack gap={5} />
        <Stack />
        <Stack orientation="horizontal" gap={3} />
      </>,
    )
    const [a, b, c] = container.querySelectorAll('[data-slot=stack]')
    expect(a.className).toContain('gap-blocks')
    expect(b.className).not.toMatch(/\bgap-/)
    expect(c.className).toContain('grid-flow-col')
    quiet()
    // @ts-expect-error — шага 9 нет
    expect(() => render(<Stack gap={9} />)).toThrow(/шага отступа 9 нет/)
  })

  it('Grid + Column: 4 · 8 · 16 колонок; ширина числом и долей; без ширины — во всю строку', () => {
    const { container } = render(
      <Grid>
        <Column />
        <Column sm={2} md={4} lg={8} />
        <Column span="25%" />
      </Grid>,
    )
    expect(container.querySelector('[data-slot=grid]')!.className).toContain('grid-cols-4 md:grid-cols-8 lg:grid-cols-16')
    const [a, b, c] = container.querySelectorAll('[data-slot=column]')
    expect(a.className).toContain('col-span-full')
    expect(b.className).toContain('col-span-2 md:col-span-4 lg:col-span-8')
    expect(c.className).toContain('col-span-1 md:col-span-2 lg:col-span-4')
    quiet()
    expect(() => render(<Column lg={17} />)).toThrow(/от 1 до 16/)
  })

  it('Section + Heading: уровень из вложенности (h1 → h2 → h3), роль текста по уровню', () => {
    render(
      <>
        <Heading>А</Heading>
        <Section>
          <Heading>Б</Heading>
          <Section>
            <Heading>В</Heading>
          </Section>
        </Section>
        <Section level={4}>
          <Heading>Г</Heading>
        </Section>
      </>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'А' }).className).toContain('text-page')
    expect(screen.getByRole('heading', { level: 2, name: 'Б' }).className).toContain('text-title')
    expect(screen.getByRole('heading', { level: 3, name: 'В' }).className).toContain('text-heading')
    expect(screen.getByRole('heading', { level: 4, name: 'Г' })).toBeTruthy()
  })

  it('шапка: subtitle — строка «о чём экран» под заголовком, pageActions — справа', () => {
    render(<PageHeader title="Условия оплаты" subtitle="Когда и как списываются деньги." pageActions={<Button kind="ghost">Ещё</Button>} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Условия оплаты' }).nextSibling?.textContent).toBe('Когда и как списываются деньги.')
    expect(screen.getByRole('button', { name: 'Ещё' })).toBeTruthy()
  })

  it('липкая полоса низа — одна на страницу: вторая — ошибка в разработке', () => {
    quiet()
    expect(() =>
      render(
        <Page header={<PageHeader title="x" />}>
          <div>
            <BottomBar />
          </div>
          <div>
            <BottomBar />
          </div>
        </Page>,
      ),
    ).toThrow(/вторая липкая полоса/)
    expect(() =>
      render(
        <Page header={<PageHeader title="y" />}>
          <BottomBar />
        </Page>,
      ),
    ).not.toThrow()
  })

  it('липкая полоса — последним блоком страницы: блок под ней — ошибка в разработке', () => {
    quiet()
    expect(() =>
      render(
        <Page header={<PageHeader title="z" />}>
          <BottomBar />
          <p>поля формы</p>
        </Page>,
      ),
    ).toThrow(/последним блоком страницы/)
  })

  it('Tooltip: label — имя элемента (aria-labelledby), description — описание (aria-describedby)', () => {
    render(
      <>
        <Tooltip label="Прикрепить файл">
          <button type="button">+</button>
        </Tooltip>
        <Tooltip description="Списано за 7 дней">
          <button type="button">Расход</button>
        </Tooltip>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Прикрепить файл' })).toBeTruthy()
    const b = screen.getByRole('button', { name: 'Расход' })
    expect(document.getElementById(b.getAttribute('aria-describedby')!)?.textContent).toBe('Списано за 7 дней')
  })

  it('Toggletip: кнопка «i» с подписью открывает содержимое по нажатию, его имя — подпись кнопки', () => {
    render(
      <Toggletip>
        <ToggletipButton label="Подробнее: срок" />
        <ToggletipContent>Сколько дней хранятся записи.</ToggletipContent>
      </Toggletip>,
    )
    const b = screen.getByRole('button', { name: 'Подробнее: срок' })
    expect(b.querySelector('svg[data-icon=information]')).toBeTruthy()
    fireEvent.click(b)
    expect(screen.getByRole('dialog', { name: 'Подробнее: срок' }).textContent).toBe('Сколько дней хранятся записи.')
  })

  it('раскрытие: кнопка во всю строку, aria-expanded и aria-controls, закрытое — inert; onHeadingClick; open меняет состояние', () => {
    const onHeadingClick = vi.fn()
    const { rerender } = render(
      <Accordion>
        <AccordionItem title="Как это работает" onHeadingClick={onHeadingClick}>
          Уведомления приходят за минуту.
        </AccordionItem>
      </Accordion>,
    )
    const btn = screen.getByRole('button', { name: 'Как это работает' })
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hasAttribute('inert')).toBe(true)
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hasAttribute('inert')).toBe(false)
    expect(panel.textContent).toBe('Уведомления приходят за минуту.')
    expect(onHeadingClick).toHaveBeenCalledWith(expect.objectContaining({ isOpen: true }))
    rerender(
      <Accordion size="sm">
        <AccordionItem title="Как это работает" open={false}>
          Уведомления приходят за минуту.
        </AccordionItem>
      </Accordion>,
    )
    expect(btn.className).toContain('min-h-dense')
  })

  it('скелет: строка ширины доли, абзац из строк, место блока; скрыт от читалки', () => {
    const { container } = render(
      <>
        <SkeletonText width="50%" />
        <SkeletonText paragraph lineCount={4} />
        <SkeletonPlaceholder />
      </>,
    )
    const [line, para] = container.querySelectorAll('[data-slot=skeleton-text]')
    expect((line as HTMLElement).style.width).toBe('50%')
    expect(para.children).toHaveLength(4)
    expect(container.querySelector('[data-slot=skeleton-placeholder]')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('Link: адрес, синий цвет ссылки; выключенная — без адреса', () => {
    render(
      <>
        <Link href="#a">Раздел</Link>
        <Link href="#b" disabled>
          Архив
        </Link>
      </>,
    )
    const a = screen.getByRole('link', { name: 'Раздел' })
    expect(a.className).toContain('text-accent')
    expect(screen.getByText('Архив').hasAttribute('href')).toBe(false)
  })
})
