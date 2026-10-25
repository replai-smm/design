import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Notifications.md?raw'
import { Button } from '../components/Button'
import { Notification } from '../components/Notification'
import { Section, Stack } from '../components/layout'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Notification tone="опасно" scope="page" title="ВКонтакте не отвечает">
          Ответы стоят у всех клиентов с 14:20.
        </Notification>
        <Section title="Группы клиента">
          <Notification tone="внимание" scope="list" title="Две группы без доступа" action={<Button variant="ghost" dense>Переподключить</Button>}>
            Комментарии этих групп не приходят.
          </Notification>
        </Section>
        <Notification tone="инфо" scope="page" title="Режим просмотра">
          Вы видите кабинет от имени менеджера; правки выключены.
        </Notification>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Уведомления', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** По размаху: беда системы — над страницей, беда списка — над списком, режим работы — инфо. */
export const Обычное: S = {}
