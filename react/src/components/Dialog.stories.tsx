import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { ConfirmDialog, ConfirmProvider, Dialog, useConfirm } from './Dialog'
import { Notification } from './Notification'
import { Select } from './Select'
import { TextField } from './TextField'
import { Stack } from './layout'

const meta = {
  title: 'ДС/Окно',
  component: Dialog,
  args: {
    defaultOpen: true,
    label: 'Кофейня «Зерно»',
    title: 'Рабочая страница ВК',
    trigger: <Button>Открыть окно</Button>,
    persistent: true,
    actions: (
      <ActionArea primary={{ label: 'Сохранить', rule: 'R-21' }} label="Действия окна">
        <Button>Отмена</Button>
      </ActionArea>
    ),
    children: (
      <Stack gap="05">
        <TextField label="Ссылка на страницу" type="url" defaultValue="https://vk.com/" helperText="Страница, с которой менеджер отвечает" />
        <Select label="Кто работает" options={[{ value: 'anna', label: 'Анна' }, { value: 'oleg', label: 'Олег' }]} placeholder="Выберите менеджера" />
      </Stack>
    ),
  },
} satisfies Meta<typeof Dialog>
export default meta
type S = StoryObj<typeof meta>

/** Окно с формой: фокус — на первом поле, клик мимо не закрывает (набранное не пропадёт), Esc и «×» — закрывают. */
export const Обычное: S = {}

export const Закрыто: S = { args: { defaultOpen: false } }

/** Подтверждение вместо `window.confirm`: слово действия на кнопке, фокус на главной. */
export const Подтверждение: S = {
  render: () => (
    <ConfirmDialog defaultOpen title="Отметить все прочитанными?" confirmLabel="Отметить" onConfirm={() => {}} trigger={<Button>Отметить все</Button>}>
      12 диалогов уйдут из «Неотвеченных».
    </ConfirmDialog>
  ),
}

/** Опасное: красная кнопка без главной рядом (П10), фокус сначала на «Отмена» — случайный Enter не удалит. */
export const Удаление: S = {
  render: () => (
    <ConfirmDialog defaultOpen danger title="Удалить черновик?" confirmLabel="Удалить" onConfirm={() => {}} trigger={<Button variant="danger">Удалить</Button>}>
      Черновик «Скидка выходного дня» пропадёт у всех. Вернуть нельзя.
    </ConfirmDialog>
  ),
}

/** Действие идёт: кнопка ждёт, окно не закрыть до конца. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  args: {
    title: 'Удалить черновик?',
    persistent: true,
    children: <p className="m-0 text-body-01">Черновик «Скидка выходного дня» пропадёт у всех. Вернуть нельзя.</p>,
    actions: (
      <ActionArea label="Подтверждение">
        <Button variant="danger" loading>
          Удаляю…
        </Button>
        <Button disabled>Отмена</Button>
      </ActionArea>
    ),
  },
}

/** Не получилось — причина плашкой в окне, окно открыто, можно повторить. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: {
    title: 'Удалить черновик?',
    children: (
      <Stack gap="04">
        <p className="m-0 text-body-01">Черновик «Скидка выходного дня» пропадёт у всех. Вернуть нельзя.</p>
        <Notification tone="error" scope="row" title="Не получилось">
          VK не ответил. Попробуйте ещё раз.
        </Notification>
      </Stack>
    ),
    actions: (
      <ActionArea label="Подтверждение">
        <Button variant="danger">Удалить</Button>
        <Button>Отмена</Button>
      </ActionArea>
    ),
  },
}

function WithHook() {
  const confirm = useConfirm()
  const [said, setSaid] = useState('пока не спрашивали')
  return (
    <Stack gap="03">
      <Button
        variant="danger"
        onClick={async () => setSaid((await confirm({ title: 'Удалить пост?', body: 'Пост пропадёт из сообщества.', danger: true })) ? 'удалить' : 'не удалять')}
      >
        Удалить пост
      </Button>
      <p className="m-0 text-body-01 text-text-secondary">Ответ: {said}</p>
    </Stack>
  )
}

/** `useConfirm()` — подтверждение одной строкой: `if (await confirm({…}))`. */
export const ОднойСтрокой: S = {
  parameters: { layout: 'padded' },
  render: () => (
    <ConfirmProvider>
      <WithHook />
    </ConfirmProvider>
  ),
}
