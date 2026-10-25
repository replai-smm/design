import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/CommonActions.md?raw'
import { ActionArea, Button } from '../components/Button'
import { List } from '../components/Collection'
import { Notification } from '../components/Notification'
import { Section, Stack } from '../components/layout'
import { groups } from '../stories/fixtures'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Section title="Группы клиента" tools={<Button icon="add">Добавить</Button>}>
          <List label="Группы" rows={groups.slice(0, 3)} getKey={(r) => r.id} getStatus={(r) => r.status} renderRow={(r) => r.name} rowAction={() => <Button variant="ghost" dense icon="close" aria-label="Удалить" />} />
        </Section>
        <Notification tone="опасно" scope="list" title="Список не загрузился" action={<Button variant="ghost" dense>Повторить</Button>}>
          Сервер не ответил за 30 с.
        </Notification>
        <ActionArea label="Действия формы" primary={{ label: 'Сохранить' }}>
          <Button variant="ghost">Отменить</Button>
        </ActionArea>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Общие действия', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** «Добавить» у списка, удаление в строке значком, «Повторить» у причины, «Сохранить» и «Отменить» у формы. */
export const Обычное: S = {}
