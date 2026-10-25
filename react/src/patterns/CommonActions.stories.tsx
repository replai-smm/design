import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/common-actions.md?raw'
import { ActionArea, Button } from '../components/Button'
import { List } from '../components/Collection'
import { Notification } from '../components/Notification'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

const files = [
  { id: 'brief', name: 'Бриф.pdf' },
  { id: 'plan', name: 'План работ.xlsx' },
  { id: 'logo', name: 'Логотип.svg' },
]

function Example() {
  return (
    <Stack gap="groups" className="p-blocks">
      <Section title="Файлы проекта" tools={<Button icon="add">Добавить</Button>}>
        <List label="Файлы" rows={files} getKey={(r) => r.id} renderRow={(r) => r.name} rowAction={(r) => <Button variant="ghost" dense icon="close" aria-label={`Удалить «${r.name}»`} />} />
      </Section>
      <Notification tone="опасно" scope="list" title="Список не загрузился" action={<Button variant="ghost" dense>Повторить</Button>}>
        Сервер не ответил за 30 с.
      </Notification>
      <ActionArea label="Действия формы" primary={{ label: 'Сохранить' }}>
        <Button variant="ghost">Отменить</Button>
      </ActionArea>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Общие действия', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** «Добавить» у списка, удаление значком в строке, «Повторить» у причины, «Сохранить» и «Отменить» у формы. */
export const Обычное: S = {}
