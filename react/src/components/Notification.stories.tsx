import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Notification, Toaster, useToast } from './Notification'
import { Stack } from './layout'

const meta = {
  title: 'ДС/Уведомление',
  component: Notification,
  parameters: { layout: 'padded' },
  args: { tone: 'error', title: 'VK не отвечает', children: 'Ответы на отзывы стоят с 14:20.' },
} satisfies Meta<typeof Notification>
export default meta
type S = StoryObj<typeof meta>

/** Четыре тона; место — по охвату: страница, список, строка. */
export const Обычное: S = {
  render: () => (
    <Stack gap="03">
      <Notification
        tone="error"
        scope="page"
        title="VK не отвечает"
        action={
          <Button variant="ghost" size="sm">
            Подробнее
          </Button>
        }
      >
        Ответы на отзывы стоят с 14:20.
      </Notification>
      <Notification tone="warning" scope="list" title="2 группы без ключа">
        Обновите ключи, иначе ответы остановятся завтра.
      </Notification>
      <Notification tone="success" title="Ключ обновлён" onClose={() => {}} />
      <Notification tone="info" scope="row" title="Проверяем группу" />
    </Stack>
  ),
}

export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: {
    scope: 'page',
    action: (
      <Button variant="ghost" size="sm">
        Повторить
      </Button>
    ),
  },
}

function ToastDemo() {
  const toast = useToast()
  return <Button onClick={() => toast.show({ title: 'Готово', description: 'Ключ обновлён.' })}>Показать всплывашку</Button>
}

/** «Готово» — всплывашка (П11). В истории открыта сразу. */
export const Всплывашка: S = {
  render: () => (
    <Toaster initial={[{ tone: 'success', title: 'Готово', description: 'Ключ обновлён.', action: { label: 'Отменить', onClick: () => {} } }]}>
      <ToastDemo />
    </Toaster>
  ),
}
