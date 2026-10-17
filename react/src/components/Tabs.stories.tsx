import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const panel = (t: string) => <p className="m-0 text-body text-fg-muted">{t}</p>

const meta = {
  title: 'Паттерны/Вкладки',
  component: Tabs,
  parameters: { layout: 'padded' },
  args: {
    label: 'Разделы',
    defaultValue: 'inbox',
    items: [
      { value: 'inbox', label: 'Ждут ответа', count: 7, tone: 'опасно', content: panel('Семь сообщений без ответа больше часа.') },
      { value: 'new', label: 'Новые', count: 3, tone: 'инфо', content: panel('Три новых.') },
      { value: 'done', label: 'Отвечено', count: 120, content: panel('Отвеченные за неделю.') },
      { value: 'all', label: 'Все', content: panel('Все переписки.') },
    ],
  },
} satisfies Meta<typeof Tabs>
export default meta
type S = StoryObj<typeof meta>

/** Тот же ряд сегментов, что у фильтров; выбранная — «выбрано»; счётчик тоном словаря. */
export const Обычное: S = {}
