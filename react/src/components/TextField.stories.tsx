import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextArea, TextField } from './TextField'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Поле ввода',
  component: TextField,
  parameters: { layout: 'padded' },
  args: { label: 'Название поста' },
} satisfies Meta<typeof TextField>
export default meta
type S = StoryObj<typeof meta>

/** Подпись над полем, подсказка под ним. Фокус — обводка внутрь поля. */
export const Обычное: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextField label="Название поста" placeholder="Например, «Скидка выходного дня»" />
      <TextField label="Ссылка на сообщество" type="url" defaultValue="https://vk.com/zerno_coffee" helperText="Адрес из строки браузера" />
      <TextField label="ПИН" type="password" inputMode="numeric" autoComplete="off" helperText="Четыре цифры" />
    </Stack>
  ),
}

/** Ошибка заменяет подсказку: обводка цвета ошибки, значок и текст — читалка слышит текст вместе с полем. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextField label="Ссылка на сообщество" defaultValue="vk.com/" error="Это не ссылка на сообщество VK" helperText="Адрес из строки браузера" />
      <TextArea label="Текст поста" defaultValue="" error="Пустой пост не опубликовать" />
    </Stack>
  ),
}

/** Недоступно (нет права) и только для чтения (видно, но не меняется). */
export const Недоступно: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextField label="Токен сообщества" disabled defaultValue="скрыт" helperText="Меняет только админ" />
      <TextField label="Создан" readOnly defaultValue="4 октября, 10:20" />
    </Stack>
  ),
}

/** Высота sm 32 · md 40 · lg 48 px; на телефоне md — 48 px. */
export const Размеры: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextField label="Маленькое (sm)" size="sm" placeholder="sm" />
      <TextField label="Обычное (md)" placeholder="md" />
      <TextField label="Большое (lg)" size="lg" placeholder="lg" />
    </Stack>
  ),
}

/** Дата, время, месяц — родной выбор системы в том же виде поля. */
export const ДатаИВремя: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextField label="Дата публикации" type="date" defaultValue="2026-10-05" />
      <TextField label="Время" type="time" defaultValue="10:30" />
      <TextField label="Месяц отчёта" type="month" defaultValue="2026-09" />
      <TextField label="Когда опубликовать" type="datetime-local" defaultValue="2026-10-05T10:30" />
    </Stack>
  ),
}

/** Многострочное поле со счётчиком знаков у подписи. */
export const Многострочное: S = {
  render: () => (
    <Stack gap="06" className="max-w-md">
      <TextArea label="Текст поста" defaultValue="Сегодня до 20:00 — капучино за полцены." maxLength={280} showCount helperText="Хештеги — в конце" />
      <TextArea label="Ответ подписчику" placeholder="Напишите ответ" rows={3} />
    </Stack>
  ),
}
