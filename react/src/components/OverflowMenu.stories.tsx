import type { Meta, StoryObj } from '@storybook/react-vite'
import { OverflowMenu, OverflowMenuItem } from './OverflowMenu'

const meta = {
  title: 'Компоненты/Слои/OverflowMenu',
  component: OverflowMenu,
  parameters: { layout: 'padded' },
  args: {
    iconDescription: 'Действия с файлом',
    children: (
      <>
        <OverflowMenuItem itemText="Переименовать" />
        <OverflowMenuItem itemText="Скачать" />
        <OverflowMenuItem itemText="Переместить в архив" disabled />
        <OverflowMenuItem itemText="Удалить" isDelete hasDivider />
      </>
    ),
  },
} satisfies Meta<typeof OverflowMenu>
export default meta
type S = StoryObj<typeof meta>

/** Кнопка «⋮» без слова: подпись — подсказкой и для читалки. */
export const Обычное: S = {}
/** Открыто: редкое и опасное — подальше от главной; опасное — под чертой. */
export const Открыто: S = { args: { open: true } }
