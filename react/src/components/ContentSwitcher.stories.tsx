import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContentSwitcher, Switch } from './ContentSwitcher'

function Demo({ selectedIndex = 0 }: { selectedIndex?: number }) {
  const [view, setView] = useState(selectedIndex)
  const panels = ['Список проектов.', 'Доска проектов.', 'Проекты по срокам.']
  return (
    <div className="flex flex-col gap-blocks">
      <ContentSwitcher aria-label="Вид проектов" selectedIndex={view} onChange={({ index }) => setView(index ?? 0)}>
        <Switch name="list" text="Список" />
        <Switch name="board" text="Доска" />
        <Switch name="timeline" text="Сроки" />
      </ContentSwitcher>
      <p className="m-0 text-body text-fg-muted">{panels[view]}</p>
    </div>
  )
}

const meta = {
  title: 'Компоненты/Элементы/ContentSwitcher',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>
export default meta
type S = StoryObj<typeof meta>

/** Выбран ровно один; стрелки ходят по ряду и выбирают. */
export const Обычное: S = {}
export const ВыбранВторой: S = { args: { selectedIndex: 1 } }
