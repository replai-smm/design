import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta = {
  title: 'Компоненты/Вкладки',
  component: Tabs,
  parameters: { layout: 'padded' },
  args: {
    label: 'Обращения',
    items: [
      { value: 'now', label: 'Что ждёт ответа', count: 4, tone: 'error', content: <p className="m-0 text-body-01">Четыре обращения ждут ответа.</p> },
      { value: 'mine', label: 'Что взял я', count: 2, tone: 'warning', content: <p className="m-0 text-body-01">Два в работе у вас.</p> },
      { value: 'done', label: 'Что сделано', count: 128, content: <p className="m-0 text-body-01">Сделанное за неделю.</p> },
    ],
  },
} satisfies Meta<typeof Tabs>
export default meta
type S = StoryObj<typeof meta>

/** Вкладки названы вопросами человека; у срочного счётчика — знак тона, не только цвет. */
export const Обычное: S = {}
export const ВтораяВкладка: S = { args: { defaultValue: 'mine' } }
