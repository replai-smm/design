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
