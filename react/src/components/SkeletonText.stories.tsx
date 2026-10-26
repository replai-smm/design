import type { Meta, StoryObj } from '@storybook/react-vite'
import { SkeletonPlaceholder, SkeletonText } from './SkeletonText'

const meta = {
  title: 'Компоненты/Элементы/SkeletonText',
  component: SkeletonText,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SkeletonText>
export default meta
type S = StoryObj<typeof meta>

/** Скелет той же формы, что содержимое: без прыжка, когда данные придут; «загрузка» для читалки — у области. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <div role="status" aria-busy="true" className="flex max-w-form flex-col gap-blocks">
      <span className="sr-only">Сводка: загрузка</span>
      <SkeletonText heading width="33%" />
      <SkeletonText paragraph lineCount={3} />
      <div className="flex items-center gap-compact">
        <SkeletonPlaceholder />
        <SkeletonText width="50%" />
      </div>
    </div>
  ),
}
