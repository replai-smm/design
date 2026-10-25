import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/read-only-states.md?raw'
import { NumberField } from '../components/NumberField'
import { TextField } from '../components/TextField'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="blocks" className="max-w-form p-blocks">
      <TextField label="Имя" defaultValue="Анна Петрова" readOnly />
      <TextField label="Почта" type="email" defaultValue="anna@example.com" readOnly helperText="Почту меняют в настройках входа." />
      <NumberField label="Мест в команде" defaultValue={12} readOnly />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Только чтение', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Значения видны и копируются, правок нет. */
export const Обычное: S = {}
