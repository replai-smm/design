import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { ConfirmProvider, Dialog, useConfirm } from './Dialog'
import { Notification } from './Notification'
import { TextField } from './TextField'

const meta = {
  title: 'Слои/Окно',
  component: Dialog,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Новая сессия',
    description: 'Где идёт сессия: агент работает в этой папке.',
    size: 'md',
    persistent: true,
    actions: (
      <ActionArea primary={{ label: 'Начать' }} label="Действия окна">
        <Button>Отмена</Button>
      </ActionArea>
    ),
    children: <TextField label="Папка" defaultValue="~/dev/replai" />,
  },
} satisfies Meta<typeof Dialog>
export default meta
type S = StoryObj<typeof meta>

/** Окно: по центру на ноутбуке, шторкой снизу на телефоне; одна кнопка «закрыть»; главная справа. */
export const Обычное: S = {}
/** Действие идёт: главная занята. */
export const Загрузка: S = { tags: ['state:загрузка'], args: { actions: <ActionArea primary={{ label: 'Начинаем…', loading: true }} label="Действия окна" /> } }
/** Беда внутри окна — уведомлением у места. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { children: <Notification tone="опасно" scope="list" title="Папки нет на ПК">Проверьте путь.</Notification> },
}
/** Шторка слева — колонка раскладки на телефоне. */
export const ШторкаСлева: S = { args: { side: 'left', title: 'Проекты', description: undefined, actions: undefined, children: <p className="m-0 text-body">Список проектов.</p> } }

function Ask() {
  const confirm = useConfirm()
  useEffect(() => {
    void confirm({ title: 'Удалить черновик?', body: 'Черновик пропадёт у всех. Вернуть нельзя.', danger: true })
  }, [confirm])
  return null
}

/** Подтверждение: опасное — кнопкой тона «опасно», фокус на «Отмена». */
export const Подтверждение: S = {
  render: () => (
    <ConfirmProvider>
      <Ask />
    </ConfirmProvider>
  ),
}
