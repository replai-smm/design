import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/Кнопка',
  component: ActionArea,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ActionArea>
export default meta
type S = StoryObj<typeof meta>

/** Главная — только в области действий, одна; рядом тихие. Опасное — без главной рядом. */
export const Виды: S = {
  args: { primary: { label: 'Сохранить' } },
  render: (args) => (
    <Stack gap="groups">
      <ActionArea {...args} label="Действия формы">
        <Button>Позже</Button>
        <Button variant="ghost">Подробнее</Button>
      </ActionArea>
      <ActionArea label="Опасное — без главной рядом">
        <Button tone="опасно">Удалить группу</Button>
        <Button>Отмена</Button>
      </ActionArea>
      <ActionArea label="Плотные и значки">
        <Button dense>Плотная</Button>
        <Button dense variant="ghost" icon="add">
          Добавить
        </Button>
        <Button variant="ghost" icon="close" aria-label="закрыть" />
        <Button dense variant="ghost" icon="menu" aria-label="ещё" />
        <Button disabled>Недоступна</Button>
      </ActionArea>
    </Stack>
  ),
}

/** Идёт действие: главная занята. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  args: { primary: { label: 'Сохраняем…', loading: true } },
  render: (args) => (
    <ActionArea {...args} label="Действия формы">
      <Button>Позже</Button>
    </ActionArea>
  ),
}
