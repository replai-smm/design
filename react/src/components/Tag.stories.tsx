import type { Meta, StoryObj } from '@storybook/react-vite'
import { TAG_TYPES } from '../lib/vocab'
import { Inline, Stack } from './layout'
import { DismissibleTag, Tag } from './Tag'

const meta = {
  title: 'Компоненты/Элементы/Tag',
  component: Tag,
  parameters: { layout: 'padded' },
  args: { children: 'черновик' },
} satisfies Meta<typeof Tag>
export default meta
type S = StoryObj<typeof meta>

/** Цвета, у которых в ролях есть проверенная пара текста; размеры sm · md · lg. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={5}>
      <Inline gap={3}>
        {TAG_TYPES.map((t) => (
          <Tag key={t} type={t}>
            {t}
          </Tag>
        ))}
      </Inline>
      <Inline gap={3}>
        <Tag {...args} size="sm" />
        <Tag {...args} />
        <Tag {...args} size="lg" />
        <Tag {...args} disabled>
          в архиве
        </Tag>
      </Inline>
    </Stack>
  ),
}

/** Выбранные фильтры: метка с кнопкой «убрать». */
export const Убираемая: S = {
  render: () => (
    <Inline gap={3}>
      <DismissibleTag text="Казань" onClose={() => {}} />
      <DismissibleTag text="в пути" type="purple" onClose={() => {}} />
    </Inline>
  ),
}
