import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/read-only-states.md?raw'
import { NumberInput } from '../components/NumberInput'
import { RadioButton, RadioButtonGroup } from '../components/RadioButton'
import { TextInput } from '../components/TextInput'
import { Toggle } from '../components/Toggle'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={5} className="max-w-form p-blocks">
      <TextInput id="ro-name" labelText="Имя" defaultValue="Анна Петрова" readOnly />
      <TextInput id="ro-email" labelText="Почта" type="email" defaultValue="anna@example.com" readOnly helperText="Почту меняют в настройках входа." />
      <NumberInput id="ro-seats" label="Мест в команде" defaultValue={12} readOnly />
      <RadioButtonGroup name="ro-plan" legendText="Тариф" valueSelected="team" readOnly>
        <RadioButton labelText="Личный" value="solo" />
        <RadioButton labelText="Команда" value="team" />
      </RadioButtonGroup>
      <Toggle id="ro-2fa" labelText="Вход с кодом" toggled readOnly />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Только чтение', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Значения видны и копируются, правок нет. */
export const Обычное: S = {}
