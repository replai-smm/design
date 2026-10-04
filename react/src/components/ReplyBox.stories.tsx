import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ReplyBox } from './ReplyBox'

const meta = {
  title: 'Компоненты/Поле ответа',
  component: ReplyBox,
  parameters: { layout: 'padded' },
  args: {
    label: 'Ответ клиенту',
    placeholder: 'Напишите ответ…',
    onSend: () => new Promise((r) => setTimeout(r, 800)),
    emptyMessage: 'Напишите текст сообщения',
    tools: (
      <>
        <Button variant="ghost">✨ Черновик ИИ</Button>
        <Button variant="ghost">⚡ Шаблоны</Button>
        <Button variant="tertiary">Ответ не нужен</Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReplyBox>
export default meta
type S = StoryObj<typeof meta>

/** «Сообщения»: Enter — новая строка, отправка кнопкой или Ctrl+Enter. */
export const Обычное: S = { args: { enterToSend: false, defaultValue: 'Здравствуйте, Анна! Да, к субботе успеем.' } }

/** Ответ, который уходит необратимо (DF: в ВК): с клавиатуры не уходит ничего — только кнопкой. */
export const ТолькоКнопкой: S = { args: { enterToSend: false, sendShortcut: false, defaultValue: 'Спасибо за отзыв! Передали повару.' } }

/** «ИИ» и «Чаты»: Enter отправляет, Shift+Enter — новая строка; приложен файл. */
export const EnterОтправляет: S = {
  args: {
    label: 'Вопрос ИИ',
    placeholder: 'Спросите про проект…',
    enterToSend: true,
    allowEmpty: true,
    sendLabel: 'Спросить',
    tools: <Button variant="ghost">📎 Файл</Button>,
    attachment: (
      <Button variant="tertiary" size="sm" aria-label="Убрать файл отчёт.pdf">
        📎 отчёт.pdf ✕
      </Button>
    ),
  },
}

export const Отправляется: S = { tags: ['state:загрузка'], args: { sending: true, defaultValue: 'Можно! Напишите, какой вкус и на сколько человек.' } }

export const Ошибка: S = {
  tags: ['state:ошибка'],
  args: { defaultValue: 'Можно! Напишите, какой вкус и на сколько человек.', error: 'ВК не принял сообщение: клиент запретил писать сообществу.' },
}

export const Выключено: S = { tags: ['state:нет доступа'], args: { disabled: true, disabledReason: 'Нет ключа сообщества — ответить нельзя. Подключите ключ в «Рабочих страницах ВК».' } }

/** Несколько полей на экране (карточки «Разбора» в «Чатах»): отправка — не главная кнопка. */
export const Вторичное: S = { args: { emphasis: 'secondary', label: 'Ответ в беседу', sendLabel: 'Отправить в беседу', tools: undefined, defaultValue: 'Поставили задачу дизайнеру, макет будет завтра.' } }
