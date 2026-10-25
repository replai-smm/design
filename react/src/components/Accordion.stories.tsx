import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'

const meta = {
  title: 'Компоненты/Элементы/Раскрытие',
  component: Accordion,
  parameters: { layout: 'padded' },
  args: {
    title: 'Как это работает',
    children: 'Уведомления приходят в течение минуты после события. Правки действуют с момента сохранения: прошлые уведомления не меняются.',
  },
} satisfies Meta<typeof Accordion>
export default meta
type S = StoryObj<typeof meta>

/** Свёрнуто: строка с заголовком и знаком справа. */
export const Обычное: S = {}
/** Открыто: содержимое под строкой, тише заголовка. */
export const Открыто: S = { args: { defaultOpen: true } }
/** Несколько подряд — одна стопка с общими линиями. */
export const Много: S = {
  tags: ['state:много'],
  render: (args) => (
    <div>
      <Accordion {...args} />
      <Accordion title="Что не приходит">Повторное событие того же заказа и комментарий короче десяти символов.</Accordion>
      <Accordion title="Когда очищается история">В конце периода, если период задан датами.</Accordion>
    </div>
  ),
}
