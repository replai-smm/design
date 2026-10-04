import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { Loading, Skeleton, StateView } from './StateView'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Состояния',
  component: StateView,
  parameters: { layout: 'padded' },
  args: { kind: 'ничего не найдено', title: 'Ничего не найдено' },
} satisfies Meta<typeof StateView>
export default meta
type S = StoryObj<typeof meta>

export const ПервыйЗапуск: S = {
  tags: ['state:первый запуск'],
  args: {
    kind: 'первый запуск',
    title: 'Групп пока нет',
    description: 'Подключите первую группу VK — ответы на отзывы начнутся сами.',
    action: <ActionArea primary={{ label: 'Подключить группу' }} label="Первый шаг" />,
  },
}

export const ВсёСделано: S = {
  tags: ['state:всё сделано'],
  args: { kind: 'всё сделано', title: 'Всё разобрано', description: 'Новых обращений нет. Загляните позже.' },
}

export const НичегоНеНайдено: S = {
  tags: ['state:ничего не найдено'],
  args: { kind: 'ничего не найдено', title: 'Ничего не найдено', description: 'По этим фильтрам групп нет.', action: <Button variant="tertiary">Сбросить фильтры</Button> },
}

export const НетДоступа: S = {
  tags: ['state:нет доступа'],
  args: { kind: 'нет доступа', title: 'Нет доступа', description: 'У вас нет прав на группы этого клиента. Попросите владельца.' },
}

export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { kind: 'ошибка', title: 'Не загрузилось', description: 'Сервер не ответил за 10 секунд.', action: <Button variant="tertiary">Повторить</Button> },
}

/** Загрузка — скелет той же формы, что и содержимое (без прыжка). */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <Loading>
      <Stack gap="03">
        <Skeleton width="1/3" />
        <Skeleton />
        <Skeleton width="3/4" />
      </Stack>
    </Loading>
  ),
}
