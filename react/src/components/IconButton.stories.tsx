import type { Meta, StoryObj } from '@storybook/react-vite'
import { Add, Close, Menu, Upload } from '../lib/icons.gen'
import { IconButton } from './Button'
import { Inline } from './layout'

const meta = {
  title: 'Компоненты/Элементы/IconButton',
  component: IconButton,
  parameters: { layout: 'padded' },
  args: { label: 'Прикрепить файл', kind: 'ghost', children: <Upload /> },
} satisfies Meta<typeof IconButton>
export default meta
type S = StoryObj<typeof meta>

/** Значок без слова: подпись — подсказкой при наведении и фокусе и именем для читалки. */
export const Обычное: S = {
  render: (args) => (
    <Inline gap={3}>
      <IconButton {...args} />
      <IconButton kind="ghost" size="sm" label="Закрыть">
        <Close />
      </IconButton>
      <IconButton kind="secondary" label="Добавить">
        <Add />
      </IconButton>
      <IconButton kind="tertiary" size="lg" label="Ещё действия">
        <Menu />
      </IconButton>
    </Inline>
  ),
}
