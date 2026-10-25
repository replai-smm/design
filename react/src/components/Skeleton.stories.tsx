import type { Meta, StoryObj } from '@storybook/react-vite'
import { Loading, Skeleton } from './Skeleton'

const meta = {
  title: 'Компоненты/Элементы/Скелет',
  component: Loading,
  parameters: { layout: 'padded' },
  args: { label: 'Сводка: загрузка', children: null },
} satisfies Meta<typeof Loading>
export default meta
type S = StoryObj<typeof meta>

/** Скелет той же формы, что содержимое: без прыжка, когда данные придут. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: (args) => (
    <Loading label={args.label}>
      <div className="flex max-w-form flex-col gap-items">
        <Skeleton width="1/3" />
        <Skeleton />
        <Skeleton width="3/4" />
      </div>
    </Loading>
  ),
}
