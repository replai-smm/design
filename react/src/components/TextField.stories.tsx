import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from './layout'
import { TextArea, TextField } from './TextField'

const meta = {
  title: 'Компоненты/Поля/Поле ввода',
  component: TextField,
  parameters: { layout: 'padded' },
  args: { label: 'Сайт компании', placeholder: 'https://example.com/…', helperText: 'Адрес из строки браузера' },
} satisfies Meta<typeof TextField>
export default meta
type S = StoryObj<typeof meta>

/** Подпись над полем, подсказка под ним; дата — выбор системы; плотное — 32 px; многострочное. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={5} className="max-w-form">
      <TextField {...args} />
      <TextField label="Дата и время" type="datetime-local" defaultValue="2026-10-08T12:00" />
      <TextField label="Фильтр по имени" dense placeholder="Имя" />
      <TextField label="Логин" defaultValue="anna" disabled />
      <TextArea label="Текст письма" placeholder="Текст письма…" helperText="Переменные подставятся для каждого получателя." />
    </Stack>
  ),
}

/** Ошибка вместо подсказки: рамка «опасно», под полем — знак и слово. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { defaultValue: 'example.com/team', error: 'Нужна полная ссылка: https://example.com/…' } }
