import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { Drawer } from './Drawer'
import { StatusBadge } from './StatusBadge'
import { Stack } from './layout'

const meta = {
  title: 'ДС/Панель деталей',
  component: Drawer,
  args: {
    defaultOpen: true,
    title: 'Кофейня «Зерно»',
    description: 'Группа клиента «Зерно»',
    status: <StatusBadge status="work.failing" />,
    trigger: <Button>Открыть панель</Button>,
    actions: (
      <ActionArea primary={{ label: 'Обновить ключ', rule: 'R-21' }} label="Действия панели">
        <Button>Закрыть</Button>
      </ActionArea>
    ),
    children: (
      <Stack gap="04">
        <p className="m-0 text-body-01">Ключ доступа отозван в 14:20. Ответы на отзывы стоят.</p>
        <p className="m-0 text-body-01 text-text-secondary">Последняя проверка — 5 минут назад.</p>
      </Stack>
    ),
  },
} satisfies Meta<typeof Drawer>
export default meta
type S = StoryObj<typeof meta>

/** Открытая панель — своё состояние экрана со своей главной кнопкой (справа на ноутбуке, снизу на телефоне). */
export const Обычное: S = {}
export const Закрыта: S = { args: { defaultOpen: false } }
