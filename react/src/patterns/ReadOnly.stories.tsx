import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/ReadOnly.md?raw'
import { ActionArea } from '../components/Button'
import { Notification } from '../components/Notification'
import { TextField } from '../components/TextField'
import { Section, Stack } from '../components/layout'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Notification tone="инфо" scope="page" title="Режим просмотра">
          Вы видите кабинет от имени менеджера; правки выключены.
        </Notification>
        <Section title="Только чтение — значение видно и копируется">
          <TextField label="Название клиента" defaultValue="Food Band" readOnly className="max-w-form" />
        </Section>
        <Section title="Выключено — и рядом сказано почему">
          <TextField label="Токен группы" disabled helperText="Меняет только владелец агентства." className="max-w-form" />
          <ActionArea primary={{ label: 'Разослать', disabled: true }} />
          <p className="m-0 text-caption text-fg-muted">Разослать можно, когда выбран хотя бы один получатель.</p>
        </Section>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Только чтение и выключено', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
