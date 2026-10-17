import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Loading, Skeleton } from './Skeleton'
import { StateView } from './StateView'

const meta = {
  title: 'Поверхности/Состояние',
  component: StateView,
  parameters: { layout: 'padded' },
  args: { kind: 'первый запуск', title: 'Групп пока нет', description: 'Подключите первую группу — ответы начнут приходить сюда.' },
} satisfies Meta<typeof StateView>
export default meta
type S = StoryObj<typeof meta>

export const ПервыйЗапуск: S = { tags: ['state:первый запуск'] }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { kind: 'всё сделано', title: 'Все отзывы отвечены', description: 'Новые появятся здесь сами.' } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { kind: 'ничего не найдено', title: 'По фильтру ничего', description: undefined, action: <Button>Сбросить фильтры</Button> } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { kind: 'нет доступа', title: 'Доступов нет — обратитесь к руководителю', description: undefined } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { kind: 'ошибка', title: 'Список не загрузился', description: 'Сервер не ответил за 30 с.', action: <Button>Повторить</Button> } }
/** Загрузка — не StateView, а скелет той же формы. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <Loading>
      <div className="flex flex-col gap-items">
        <Skeleton width="1/3" />
        <Skeleton />
      </div>
    </Loading>
  ),
}
