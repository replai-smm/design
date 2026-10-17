import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandMenu } from './CommandMenu'
import { commands, manyCommands } from '../stories/agent-fixtures'

const meta = {
  title: 'Слои/Меню команд',
  component: CommandMenu,
  parameters: { layout: 'padded' },
  args: { label: 'Команды и скиллы', items: commands, query: '', onPick: () => {}, className: 'max-w-md' },
} satisfies Meta<typeof CommandMenu>
export default meta
type S = StoryObj<typeof meta>

/** Группами; печать сужает; активная — «выбрано». */
export const Обычное: S = {}
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { query: 'zz' } }
export const Много: S = { tags: ['state:много'], args: { items: manyCommands } }
