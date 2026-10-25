import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/text-toolbar.md?raw'
import { TextArea } from '../components/TextField'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Панели правки текста в ДС пока нет (CHANGELOG 2.0.0 → «нет пары»): пример — поле текста без панели. */
function Example() {
  return (
    <Stack gap="blocks" className="max-w-window p-blocks">
      <p className="m-0 text-body text-fg-muted">Панели правки текста в ДС пока нет — поле текста без панели.</p>
      <TextArea label="Описание проекта" defaultValue="Новый сайт компании: каталог, корзина и личный кабинет." />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Панель правки текста', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
