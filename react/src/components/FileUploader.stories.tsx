import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileUploader, FileUploaderItem } from './FileUploader'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Поля/FileUploader',
  component: FileUploader,
  parameters: { layout: 'padded' },
  args: {
    labelTitle: 'Документы заказа',
    labelDescription: 'PDF и картинки, до 10 МБ',
    buttonLabel: 'Добавить файлы',
    buttonKind: 'tertiary',
    accept: ['.pdf', 'image/*'],
    maxFileSize: 10 * 1024 * 1024,
    multiple: true,
    filenameStatus: 'edit',
    className: 'max-w-form',
  },
} satisfies Meta<typeof FileUploader>
export default meta
type S = StoryObj<typeof meta>

/** Заголовок, ограничения словами, кнопка; выбранное — строками: можно убрать, идёт, загружен. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={3} className="max-w-form">
      <FileUploader {...args} />
      <FileUploaderItem name="счёт-1024.pdf" status="edit" />
      <FileUploaderItem name="акт-сверки.pdf" status="uploading" />
      <FileUploaderItem name="схема-проезда.png" status="complete" />
    </Stack>
  ),
}

/** Не тот тип или размер — файл не взят: строка с ошибкой говорит, что не так и что сделать. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: (args) => (
    <Stack gap={3} className="max-w-form">
      <FileUploader {...args} />
      <FileUploaderItem name="отчёт.xlsx" status="edit" invalid errorSubject="Не тот тип файла" errorBody="PDF и картинки, до 10 МБ" />
    </Stack>
  ),
}
