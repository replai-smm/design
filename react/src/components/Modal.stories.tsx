import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineNotification } from './InlineNotification'
import { ConfirmProvider, Modal, useConfirm } from './Modal'
import { TextInput } from './TextInput'

const meta = {
  title: 'Компоненты/Слои/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    modalLabel: 'Сессии',
    modalHeading: 'Новая сессия',
    primaryButtonText: 'Начать',
    secondaryButtonText: 'Отмена',
    children: (
      <>
        <p className="m-0 text-body">Где идёт сессия: агент работает в этой папке.</p>
        <TextInput id="folder" labelText="Папка" defaultValue="~/dev/reports" data-modal-primary-focus />
      </>
    ),
  },
} satisfies Meta<typeof Modal>
export default meta
type S = StoryObj<typeof meta>

/** Окно: по центру на ноутбуке, шторкой снизу на телефоне; одна кнопка «закрыть»; главная справа; фокус — на поле. */
export const Обычное: S = {}
/** Действие идёт: на главной — ход в строке, кнопки выключены. */
export const Загрузка: S = { tags: ['state:загрузка'], args: { loadingStatus: 'active', loadingDescription: 'Начинаем…' } }
/** Беда внутри окна — уведомлением у места. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { children: <InlineNotification kind="error" title="Папки нет на ПК" subtitle="Проверьте путь." hideCloseButton /> },
}
/** Окно для чтения — без кнопок низа; нажатие мимо закрывает. */
export const ДляЧтения: S = { args: { passiveModal: true, modalLabel: undefined, modalHeading: 'Что нового', children: <p className="m-0 text-body">Экспорт в CSV и фильтр по дате.</p> } }

function Ask() {
  const confirm = useConfirm()
  useEffect(() => {
    void confirm({ modalHeading: 'Удалить черновик?', children: 'Черновик пропадёт у всех. Вернуть нельзя.', danger: true })
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
