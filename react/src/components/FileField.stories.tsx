import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileField } from './FileField'
import { Stack } from './layout'

const MB = 1024 * 1024
/** Файл-образец нужного размера (содержимое не важно — показываем имя и размер). */
const sample = (name: string, size: number, type: string) => new File([new Uint8Array(size)], name, { type })

const meta = {
  title: 'Компоненты/Выбор файла',
  component: FileField,
  parameters: { layout: 'padded' },
  args: { label: 'Вложение для ИИ', accept: '.pdf,.docx,.xlsx,image/*', maxSize: 10 * MB },
} satisfies Meta<typeof FileField>
export default meta
type S = StoryObj<typeof meta>

/** Кнопка и ограничения словами под ней; выбранный файл — с размером и «убрать». */
export const Обычное: S = {
  render: (args) => (
    <Stack gap="06" className="max-w-md">
      <FileField {...args} />
      <FileField {...args} label="Отчёт клиента" defaultValue={[sample('Отчёт за сентябрь.pdf', 870 * 1024, 'application/pdf')]} />
      <FileField label="Фото поста" accept="image/*" acceptLabel="фото" multiple maxFiles={10} maxSize={5 * MB} defaultValue={[sample('витрина.jpg', 1.4 * MB, 'image/jpeg'), sample('меню.png', 640 * 1024, 'image/png')]} />
    </Stack>
  ),
}

/** Не тот тип или больше предела — файл не взят, ошибка называет файл и что не так. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { error: '«отчёт.exe» — не тот тип, можно: PDF, DOCX, XLSX, картинки' },
  render: (args) => (
    <Stack gap="06" className="max-w-md">
      <FileField {...args} />
    </Stack>
  ),
}

/** Недоступно: кнопка и файлы видны, но не меняются. */
export const Недоступно: S = {
  args: { disabled: true, helperText: 'Вложения добавляет только менеджер', defaultValue: [sample('бриф.docx', 52 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')] },
}
