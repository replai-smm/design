import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Notification } from './Notification'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Поверхности/Уведомление',
  component: Notification,
  parameters: { layout: 'padded' },
  args: { tone: 'опасно', scope: 'page', title: 'Почтовый сервер не отвечает', children: 'Письма стоят у всех проектов с 14:20.', action: <Button dense>Повторить</Button> },
} satisfies Meta<typeof Notification>
export default meta
type S = StoryObj<typeof meta>

/** Тоны: метка и знак своей формы; охват — где стоит. */
export const Обычное: S = {
  render: () => (
    <Stack gap="items" className="max-w-window">
      <Notification tone="внимание" scope="list" title="Ключ оплаты не подключён у 2 проектов" action={<Button dense>Подключить</Button>} />
      <Notification tone="инфо" scope="list" title="Только просмотр" onClose={() => {}}>
        Правит админ.
      </Notification>
      <Notification tone="хорошо" scope="row" title="Ключ работает" />
    </Stack>
  ),
}

export const Ошибка: S = { tags: ['state:ошибка'] }
