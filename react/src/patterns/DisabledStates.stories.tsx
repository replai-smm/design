import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/disabled-states.md?raw'
import { Button, ButtonSet } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import { TextField } from '../components/TextField'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={5} className="max-w-form p-blocks">
      <TextField label="Платёжный счёт" disabled helperText="Меняет только владелец проекта." />
      <Checkbox label="Списывать оплату каждый месяц" disabled helperText="Сначала добавьте карту." />
      <ButtonSet>
        <Button disabled>Оплатить</Button>
      </ButtonSet>
      <p className="m-0 text-caption text-fg-muted">Оплатить можно, когда выбран хотя бы один счёт.</p>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Выключенное состояние', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Выключено — и рядом сказано почему и что сделать. */
export const Обычное: S = {}
