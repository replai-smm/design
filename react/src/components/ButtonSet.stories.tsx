import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ButtonSet } from './Button'
import { InlineLoading } from './InlineLoading'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/ButtonSet',
  component: ButtonSet,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ButtonSet>
export default meta
type S = StoryObj<typeof meta>

/** Главная — одна и последней, правее второстепенной; опасное — без главной рядом; столбцом — `stacked`. */
export const Обычное: S = {
  render: () => (
    <Stack gap={6}>
      <ButtonSet aria-label="Действия формы">
        <Button kind="secondary">Отмена</Button>
        <Button>Сохранить</Button>
      </ButtonSet>
      <ButtonSet aria-label="Опасное — без главной рядом">
        <Button kind="secondary">Отмена</Button>
        <Button kind="danger">Удалить группу</Button>
      </ButtonSet>
      <ButtonSet stacked aria-label="Столбцом" className="max-w-popup">
        <Button kind="ghost">Назад</Button>
        <Button kind="secondary">Далее</Button>
      </ButtonSet>
    </Stack>
  ),
}

/** Идёт действие: на месте главной — ход в строке (паттерн «Загрузка»). */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <ButtonSet aria-label="Действия формы">
      <Button kind="secondary" disabled>
        Отмена
      </Button>
      <InlineLoading description="Сохраняем…" />
    </ButtonSet>
  ),
}
