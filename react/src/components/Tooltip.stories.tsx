import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Tooltip } from './Tooltip'
import { ToneIcon } from './StatusBadge'
import { Inline } from './layout'

const warn = <ToneIcon tone="warning" className="text-status-warning" />

const meta = {
  title: 'Компоненты/Подсказка',
  component: Tooltip,
  parameters: { layout: 'padded' },
  args: {
    content: 'Нет доступа к сообщению: ключ сообщества отозван',
    children: <Button variant="ghost" size="sm" icon={warn} aria-label="нет доступа" />,
  },
  decorators: [
    (Story) => (
      <div className="pt-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>
export default meta
type S = StoryObj<typeof meta>

/** Наведение или фокус с клавиатуры — подсказка; Esc прячет. Значок-кнопка понятна и без неё (`aria-label`). */
export const Обычное: S = { args: { defaultOpen: true } }

/** Сторона — снизу, справа, слева; у края экрана подсказка сама переезжает на свободную сторону. */
export const Снизу: S = { args: { defaultOpen: true, side: 'bottom' } }

/** Закрыта: наведите или перейдите табом. */
export const Закрыта: S = {
  render: (args) => (
    <Inline gap="04">
      <Tooltip {...args} />
      <Tooltip content="Опубликовано 4 октября в 10:20">
        <Button variant="ghost" size="sm">
          Вчера
        </Button>
      </Tooltip>
    </Inline>
  ),
}
