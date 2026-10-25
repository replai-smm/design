import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Card } from './Card'
import { Grid } from './layout'

const meta = {
  title: 'Компоненты/Поверхности/Карточка',
  component: Card,
  parameters: { layout: 'padded' },
  args: {
    title: 'Ответы на отзывы',
    status: 'work.failing',
    facts: ['Падает с 14:20', 'Ключ доступа отозван', '3 группы без ответов'],
    action: <Button dense>Починить</Button>,
    more: <p className="m-0 text-body text-fg-muted">Тесты: 12 из 14 зелёные. Последний прогон — 5 минут назад.</p>,
  },
} satisfies Meta<typeof Card>
export default meta
type S = StoryObj<typeof meta>

/** Лицо: не больше трёх фактов и одного действия; остальное — «подробнее». */
export const Обычное: S = {}

/** Статусы меткой; матрёшка — внутри «подробнее» такие же карточки, не глубже двух уровней. */
export const Сетка: S = {
  render: () => (
    <Grid columns={3}>
      <Card title="Рассылка" status="change.changing" facts={['Хотят изменить текст']} />
      <Card title="Вход по почте" status="work.working" facts={['Работает']} />
      <Card
        title="Интернет-магазин"
        status="work.unchecked"
        facts={['2 модуля', '1 задача ждёт решения']}
        more={
          <Grid columns={2} gap="items">
            <Card title="Сообщения" status="work.failing" more={<p className="m-0 text-body">Подробности модуля.</p>} />
            <Card title="Отзывы" status="work.working" />
          </Grid>
        }
      />
    </Grid>
  ),
}
