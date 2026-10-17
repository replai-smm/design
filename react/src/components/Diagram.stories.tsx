import type { Meta, StoryObj } from '@storybook/react-vite'
import { Diagram } from './Diagram'
import { ringEdges, ringNodes } from '../stories/agent-fixtures'

const meta = {
  title: 'Поверхности/Схема',
  component: Diagram,
  parameters: { layout: 'padded' },
  args: { label: 'Круг orbit', nodes: ringNodes, edges: ringEdges, ring: [0.5, 0.47], aspect: 'fit', onSelect: () => {}, className: 'max-w-xl' },
} satisfies Meta<typeof Diagram>
export default meta
type S = StoryObj<typeof meta>

/** Узлы-поверхности, тихие связи дугой, знак тона у строки и точки. */
export const Обычное: S = {}
/** Указатель агента: подсветка мерцает на месте, главное — кольцом фокуса, остальное приглушено. */
export const Указатель: S = { args: { highlight: ['input/probe', 'k8w1qa'], focus: 'execution', dim: true } }
