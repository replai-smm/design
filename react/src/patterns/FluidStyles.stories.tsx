import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/fluid-styles.md?raw'
import { TextInput } from '../components/TextInput'
import { Select, SelectItem } from '../components/Select'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Текучих полей в ДС пока нет (CHANGELOG 2.0.0 → «нет пары»): пример — та же форма адреса обычными полями. */
function Example() {
  return (
    <Stack gap={5} className="max-w-form p-blocks">
      <p className="m-0 text-body text-fg-muted">Текучих полей в ДС пока нет — та же форма адреса обычными полями.</p>
      <TextInput id="street" labelText="Улица и дом" defaultValue="ул. Садовая, 12" />
      <TextInput id="flat" labelText="Квартира или офис" />
      <Select id="city" labelText="Город" defaultValue="kzn">
        <SelectItem value="kzn" text="Казань" />
        <SelectItem value="prm" text="Пермь" />
      </Select>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Текучие поля', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
