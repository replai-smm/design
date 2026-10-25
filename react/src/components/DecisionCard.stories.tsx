import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { CodeBlock } from './CodeBlock'
import { DecisionCard } from './DecisionCard'
import { Notification } from './Notification'

const meta = {
  title: 'Компоненты/Поверхности/Карточка решения',
  component: DecisionCard,
  parameters: { layout: 'padded' },
  args: {
    kicker: 'Разрешение',
    title: 'Агент хочет запустить команду',
    facts: ['Папка replai', 'Пишет в базу разработки'],
    detail: <CodeBlock code="npm run db:migrate" label="bash" copy={false} />,
    question: 'Разрешить?',
    primary: { label: 'Разрешить' },
    actions: <Button>Не сейчас</Button>,
    className: 'max-w-wide',
  },
} satisfies Meta<typeof DecisionCard>
export default meta
type S = StoryObj<typeof meta>

/** Ждёт тебя: метка «инфо», одна главная и тихие. */
export const Обычное: S = {}
/** Ответ уходит. */
export const Загрузка: S = { tags: ['state:загрузка'], args: { primary: { label: 'Разрешить', loading: true } } }
/** Ответ не ушёл — уведомление у места беды, кнопки остаются. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { detail: <Notification tone="опасно" scope="row" title="Ответ не ушёл: окно orbit не отвечает" /> },
}
/** Отвечено: метки и кнопок нет, слово ответа и время. */
export const Отвечено: S = { args: { answered: { word: 'Разрешено', time: '14:20', tone: 'хорошо' } } }
