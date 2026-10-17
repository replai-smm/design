import type { Meta, StoryObj } from '@storybook/react-vite'
import { ringEdges, ringNodes } from '../stories/agent-fixtures'
import { Diagram } from './Diagram'

const meta = {
  title: 'Компоненты/Схема',
  component: Diagram,
  parameters: { layout: 'padded' },
  args: { nodes: ringNodes, edges: ringEdges, ring: [0.5, 0.48], label: 'Круг (пример)' },
  decorators: [(Story) => <div className="max-w-lg p-8"><Story /></div>],
} satisfies Meta<typeof Diagram>
export default meta
type S = StoryObj<typeof meta>

/** Указатель агента: подсвечены датчик прода и работа n5t2vd (рамка мерцает на месте), остальное приглушено. */
export const Обычное: S = { args: { highlight: ['input/probe', 'n5t2vd'], focus: 'n5t2vd', dim: true } }

/** Без указателя: ничего не горит и не приглушено — круг как есть. */
export const БезУказателя: S = { tags: ['state:ничего не найдено'] }

/** Агент спрятал лишнее (`hide`): ядро и адаптеры Выхода убраны, связи к ним тоже. */
export const СоСпрятанным: S = { args: { highlight: ['input/probe'], dim: true, hide: ['core', 'output/shtab', 'output/chat'] } }

/** `aspect="fit"` в рамке 360 px: выше квадрата (3:4), узлы не налезают друг на друга. */
export const УзкаяРамка: S = {
  args: { aspect: 'fit', highlight: ['n5t2vd'], focus: 'n5t2vd', dim: true },
  decorators: [(Story) => <div className="w-90 border border-border-subtle-01 p-2"><Story /></div>],
}
