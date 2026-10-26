import type { Meta, StoryObj } from '@storybook/react-vite'
import { Add, Upload } from '../lib/icons.gen'
import { Button } from './Button'
import { Inline, Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/Button',
  component: Button,
  parameters: { layout: 'padded' },
  args: { children: 'Сохранить' },
} satisfies Meta<typeof Button>
export default meta
type S = StoryObj<typeof meta>

/** Виды Carbon: главная — инверсия и одна на поверхность; тихие — рамкой, рамкой цвета главной или без; опасные — тоном. */
export const Виды: S = {
  render: (args) => (
    <Stack gap={6}>
      <Inline gap={3}>
        <Button kind="secondary">Позже</Button>
        <Button kind="tertiary">Черновик</Button>
        <Button kind="ghost">Подробнее</Button>
        <Button {...args} />
      </Inline>
      <Inline gap={3}>
        <Button kind="danger">Удалить группу</Button>
        <Button kind="danger--tertiary">Отключить</Button>
        <Button kind="danger--ghost">Убрать</Button>
      </Inline>
      <Inline gap={3}>
        <Button kind="secondary" disabled>
          Недоступна
        </Button>
        <Button kind="ghost" renderIcon={Add}>
          Добавить
        </Button>
        <Button kind="secondary" href="#files" renderIcon={Upload}>
          Ссылка видом кнопки
        </Button>
      </Inline>
    </Stack>
  ),
}

/** Размеры: sm 32 · md 40 · lg 48; без `size` — 48 на телефоне и 40 на ноутбуке. */
export const Размеры: S = {
  render: () => (
    <Inline gap={3} align="end">
      <Button kind="secondary" size="sm">
        sm
      </Button>
      <Button kind="secondary" size="md">
        md
      </Button>
      <Button kind="secondary" size="lg">
        lg
      </Button>
      <Button kind="secondary">без size</Button>
    </Inline>
  ),
}
