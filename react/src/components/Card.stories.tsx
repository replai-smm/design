import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Card } from './Card'
import { Grid } from './layout'

const meta = {
  title: 'ДС/Карточка',
  component: Card,
  parameters: { layout: 'padded' },
  args: {
    title: 'Ответы на отзывы',
    status: 'work.failing',
    face: ['Падает с 14:20', 'Ключ доступа отозван', '3 группы без ответов'],
    action: (
      <Button variant="ghost" size="sm">
        Починить
      </Button>
    ),
    more: <p className="m-0 text-body-01 text-text-secondary">Тесты: 12 из 14 зелёные. Последний прогон — 5 минут назад.</p>,
  },
} satisfies Meta<typeof Card>
export default meta
type S = StoryObj<typeof meta>

/** Лицо: не больше 3 фактов и 1 действия; остальное — «подробнее». */
export const Обычное: S = {}
export const Раскрыта: S = { args: { defaultOpen: true } }

/** Цвета Карты: синий — работает, жёлтый — хотят изменить, красный — падает; без цвета — остальное. */
export const ЦветаКарты: S = {
  render: () => (
    <Grid columns={3}>
      <Card title="Ответы на отзывы" status="work.failing" face={['Падает с 14:20']} />
      <Card title="Рассылка" status="change.changing" face={['Хотят изменить текст']} />
      <Card title="Вход через VK" status="work.working" face={['Работает']} />
      <Card title="Отчёты" status="work.unchecked" face={['Ещё не проверяли']} />
    </Grid>
  ),
}

/** Матрёшка: внутри «подробнее» — такие же карточки, не глубже двух уровней. */
export const Матрёшка: S = {
  args: {
    title: 'Replai',
    status: 'change.changing',
    face: ['2 модуля падают', '1 интент ждёт «делаем»'],
    action: undefined,
    defaultOpen: true,
    more: (
      <Grid columns={2} gap="03">
        <Card title="Сообщения" status="work.failing" face={['Падает с 14:20']} more={<p className="m-0 text-body-01">Подробности модуля.</p>} />
        <Card title="Отзывы" status="work.working" face={['Работает']} />
      </Grid>
    ),
  },
}

/** Палитра продукта: метка статуса на лице вместо цветной рамки. */
export const ПалитраПродукта: S = { args: { palette: 'product' } }
