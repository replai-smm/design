import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { CommandMenu } from './CommandMenu'
import { ReplyBox } from './ReplyBox'
import { commands } from '../stories/agent-fixtures'

const meta = {
  title: 'Компоненты/Составные/Поле ответа',
  component: ReplyBox,
  parameters: { layout: 'padded' },
  args: {
    label: 'Ответ от имени сообщества',
    placeholder: 'Ответ от имени сообщества',
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
export const Ошибка: S = { tags: ['state:ошибка'], args: { value: 'Да, с 9 до 21.', error: 'ВК не принял ответ: нет доступа к сообществу' } }
export const НетДоступа: S = { tags: ['state:нет доступа'], args: { disabled: 'Только просмотр: отвечает админ сообщества' } }
/** Чат агента: кнопки в ряд, «Стоп» пока агент работает, меню «/» над полем. */
export const Агент: S = {
  args: {
    label: 'Сообщение агенту',
    placeholder: 'Сообщение агенту',
    value: '/re',
    layout: 'row',
    stop: { onStop: () => {} },
    tools: undefined,
    menu: <CommandMenu label="Команды и скиллы" items={commands} query="re" onPick={() => {}} />,
  },
}
