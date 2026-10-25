import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/fluid-styles.md?raw'
import { TextField } from '../components/TextField'
import { Select } from '../components/Select'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Текучих полей в ДС пока нет (CHANGELOG 2.0.0 → «нет пары»): пример — та же форма адреса обычными полями. */
function Example() {
  return (
    <Stack gap={5} className="max-w-form p-blocks">
      <p className="m-0 text-body text-fg-muted">Текучих полей в ДС пока нет — та же форма адреса обычными полями.</p>
      <TextField label="Улица и дом" defaultValue="ул. Садовая, 12" />
      <TextField label="Квартира или офис" />
      <Select label="Город" defaultValue="kzn" options={[{ value: 'kzn', label: 'Казань' }, { value: 'prm', label: 'Пермь' }]} />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Текучие поля', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
