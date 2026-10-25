import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ReplyBox } from './ReplyBox'

const meta = {
  title: 'Компоненты/Составные/Поле ответа',
  component: ReplyBox,
  parameters: { layout: 'padded' },
  args: {
    label: 'Ответ от имени команды',
    placeholder: 'Ответ от имени команды',
    onSend: () => {},
    tools: (
      <>
        <Button variant="ghost" icon="add">
          Черновик ИИ
        </Button>
        <Button variant="ghost">Ответ не нужен</Button>
      </>
    ),
    className: 'max-w-window',
  },
} satisfies Meta<typeof ReplyBox>
export default meta
type S = StoryObj<typeof meta>

/** «Отправить» — главная; рядом тихие; подсказка о клавишах. */
export const Обычное: S = {}
export const Загрузка: S = { tags: ['state:загрузка'], args: { value: 'Да, с 9 до 21.', sending: true } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { value: 'Да, с 9 до 21.', error: 'Сервер не принял ответ: нет доступа к диалогу' } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { disabled: 'Только просмотр: отвечает админ команды' } }
/** Разговор с агентом: кнопки в ряд, «Стоп» пока агент работает. */
export const Агент: S = {
  args: {
    label: 'Сообщение агенту',
    placeholder: 'Сообщение агенту',
    layout: 'row',
    stop: { onStop: () => {} },
    tools: undefined,
  },
}
