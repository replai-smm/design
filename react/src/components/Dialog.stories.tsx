import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ButtonSet } from './Button'
import { ConfirmProvider, Dialog, useConfirm } from './Dialog'
import { InlineLoading } from './InlineLoading'
import { Notification } from './Notification'
import { TextInput } from './TextInput'

const meta = {
  title: 'Компоненты/Слои/Окно',
  component: Dialog,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Новая сессия',
    description: 'Где идёт сессия: агент работает в этой папке.',
    size: 'md',
    persistent: true,
    actions: (
      <ButtonSet aria-label="Действия окна">
        <Button kind="secondary">Отмена</Button>
        <Button>Начать</Button>
      </ButtonSet>
    ),
    children: <TextInput id="folder" labelText="Папка" defaultValue="~/dev/reports" />,
  },
} satisfies Meta<typeof Dialog>
export default meta
type S = StoryObj<typeof meta>

/** Окно: по центру на ноутбуке, шторкой снизу на телефоне; одна кнопка «закрыть»; главная справа. */
export const Обычное: S = {}
/** Действие идёт: на месте главной — ход в строке. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  args: {
    actions: (
      <ButtonSet aria-label="Действия окна">
        <Button kind="secondary" disabled>
          Отмена
        </Button>
        <InlineLoading description="Начинаем…" />
      </ButtonSet>
    ),
  },
}
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

/** Подтверждение: опасное — кнопкой `kind="danger"`, фокус на «Отмена». */
export const Подтверждение: S = {
  render: () => (
    <ConfirmProvider>
      <Ask />
    </ConfirmProvider>
  ),
}
