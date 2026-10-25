import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionItem } from './Accordion'

const meta = {
  title: 'Компоненты/Элементы/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Accordion>
export default meta
type S = StoryObj<typeof meta>

const first = 'Уведомления приходят в течение минуты после события. Правки действуют с момента сохранения: прошлые уведомления не меняются.'

/** Свёрнуто: строка с заголовком и знаком справа. */
export const Обычное: S = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem title="Как это работает">{first}</AccordionItem>
    </Accordion>
  ),
}
/** Открыто: содержимое под строкой, тише заголовка. */
export const Открыто: S = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem title="Как это работает" open>
        {first}
      </AccordionItem>
    </Accordion>
  ),
}
/** Несколько подряд — одна стопка с общими линиями; знак слева — `align="start"`. */
export const Много: S = {
  tags: ['state:много'],
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem title="Как это работает">{first}</AccordionItem>
      <AccordionItem title="Что не приходит">Повторное событие того же заказа и комментарий короче десяти символов.</AccordionItem>
      <AccordionItem title="Когда очищается история">В конце периода, если период задан датами.</AccordionItem>
    </Accordion>
  ),
}
export const ЗнакСлева: S = { ...Много, tags: [], args: { align: 'start', size: 'sm' } }
