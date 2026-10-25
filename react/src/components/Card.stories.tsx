import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Card } from './Card'
import { IconIndicator } from './IconIndicator'
import { Column, Grid } from './layout'

const meta = {
  title: 'Компоненты/Поверхности/Карточка',
  component: Card,
  parameters: { layout: 'padded' },
  args: {
    title: 'Ответы на отзывы',
    status: <IconIndicator kind="failed" label="падает" />,
    facts: ['Падает с 14:20', 'Ключ доступа отозван', '3 группы без ответов'],
    action: (
      <Button kind="secondary" size="sm">
        Починить
      </Button>
    ),
    more: <p className="m-0 text-body text-fg-muted">Тесты: 12 из 14 зелёные. Последний прогон — 5 минут назад.</p>,
  },
} satisfies Meta<typeof Card>
export default meta
type S = StoryObj<typeof meta>

/** Лицо: не больше трёх фактов и одного действия; остальное — «подробнее». */
export const Обычное: S = {}

/** Состояние знаком и словом; матрёшка — внутри «подробнее» такие же карточки, не глубже двух уровней. */
export const Сетка: S = {
  render: () => (
    <Grid narrow withRowGap>
      <Column sm={4} md={4} lg={5}>
        <Card title="Рассылка" status={<IconIndicator kind="caution-minor" label="меняется" />} facts={['Хотят изменить текст']} />
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Card title="Вход по почте" status={<IconIndicator kind="succeeded" label="работает" />} facts={['Работает']} />
      </Column>
      <Column sm={4} md={8} lg={6}>
        <Card
          title="Интернет-магазин"
          status={<IconIndicator kind="not-started" label="не проверено" />}
          facts={['2 модуля', '1 задача ждёт решения']}
          more={
            <Grid narrow withRowGap>
              <Column sm={4} md={4} lg={8}>
                <Card title="Сообщения" status={<IconIndicator kind="failed" label="падает" />} more={<p className="m-0 text-body">Подробности модуля.</p>} />
              </Column>
              <Column sm={4} md={4} lg={8}>
                <Card title="Отзывы" status={<IconIndicator kind="succeeded" label="работает" />} />
              </Column>
            </Grid>
          }
        />
      </Column>
    </Grid>
  ),
}
