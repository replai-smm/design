import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search } from './Search'

function Demo({ initial }: { initial: string }) {
  const [v, set] = useState(initial)
  return <Search labelText="Поиск по группам" placeholder="Название группы" value={v} onChange={(e) => set(e.target.value)} className="max-w-popup" />
}

const meta = {
  title: 'Компоненты/Поля/Search',
  component: Demo,
  parameters: { layout: 'padded' },
  args: { initial: '' },
} satisfies Meta<typeof Demo>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Набрано — «очистить»; Esc тоже стирает. */
export const Набрано: S = { args: { initial: 'склад' } }
