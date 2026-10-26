import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionableNotification, InlineNotification } from './InlineNotification'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Поверхности/InlineNotification',
  component: InlineNotification,
  parameters: { layout: 'padded' },
  args: { kind: 'error', title: 'Почтовый сервер не отвечает', subtitle: 'Письма стоят у всех проектов с 14:20.', hideCloseButton: true, className: 'max-w-window' },
} satisfies Meta<typeof InlineNotification>
export default meta
type S = StoryObj<typeof meta>

/** Виды Carbon: метка и знак своей формы; «закрыть» — по умолчанию. */
export const Обычное: S = {
  render: () => (
    <Stack gap={3} className="max-w-window">
      <InlineNotification kind="warning" title="Ключ оплаты не подключён у 2 проектов" subtitle="Счета этих проектов не уходят." />
      <InlineNotification kind="info" title="Только просмотр" subtitle="Правит админ." />
      <InlineNotification kind="success" title="Ключ работает" hideCloseButton />
    </Stack>
  ),
}

export const Ошибка: S = { tags: ['state:ошибка'] }

/** С действием у причины — ActionableNotification: в потоке (`inline`) и всплывшая. */
export const СДействием: S = {
  render: () => (
    <Stack gap={3} className="max-w-window">
      <ActionableNotification inline hasFocus={false} kind="warning" title="Ключ оплаты не подключён" subtitle="Счета не уходят." actionButtonLabel="Подключить" />
      <ActionableNotification hasFocus={false} kind="error" title="Отчёт не собрался" subtitle="Сервер не ответил за 30 с." caption="14:20" actionButtonLabel="Повторить" />
    </Stack>
  ),
}
