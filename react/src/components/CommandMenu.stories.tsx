import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { commands } from '../stories/agent-fixtures'
import { CommandMenu, type CommandMenuHandle } from './CommandMenu'

const meta = {
  title: 'Компоненты/Меню команд',
  component: CommandMenu,
  parameters: { layout: 'padded' },
  args: { items: commands, query: '', onPick: () => {}, label: 'Команды и скиллы' },
} satisfies Meta<typeof CommandMenu>
export default meta
type S = StoryObj<typeof meta>

/** Напечатано «/k»: команды и скиллы группами, стрелки ведут по списку, Enter вставляет. */
export const Обычное: S = {
  render: function Menu(args) {
    const [text, setText] = useState('/')
    const menu = useRef<CommandMenuHandle>(null)
    return (
      <div className="flex max-w-lg flex-col gap-2">
        <CommandMenu ref={menu} items={args.items} query={text.slice(1)} label={args.label} onPick={(c) => setText(c.value + ' ')} />
        <label className="text-label-01 text-text-secondary" htmlFor="cm-field">Сообщение</label>
        <input
          id="cm-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => menu.current?.press(e) && e.preventDefault()}
          className="min-h-10 border-b border-border-strong-01 bg-field-01 px-4 text-body-01 text-text-primary"
        />
      </div>
    )
  },
}
