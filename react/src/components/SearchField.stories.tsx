import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchField } from './SearchField'

function Demo({ initial }: { initial: string }) {
  const [v, set] = useState(initial)
  return <SearchField label="Поиск по группам" value={v} onChange={set} className="max-w-popup" />
}

const meta = {
  title: 'Компоненты/Поля/Поиск',
  component: Demo,
  parameters: { layout: 'padded' },
  args: { initial: '' },
} satisfies Meta<typeof Demo>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Набрано — «очистить». */
export const Набрано: S = { args: { initial: 'склад' } }
