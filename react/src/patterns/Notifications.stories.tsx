import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/notifications.md?raw'
import { Button } from '../components/Button'
import { Notification } from '../components/Notification'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="groups" className="p-blocks">
      <Notification tone="опасно" scope="page" title="Сервис оплаты не отвечает">
        Счета не уходят с 14:20. Мы уже чиним.
      </Notification>
      <Section title="Файлы проекта">
        <Notification tone="внимание" scope="list" title="Два файла не загрузились" action={<Button variant="ghost" dense>Повторить</Button>}>
          Остальные файлы на месте.
        </Notification>
      </Section>
      <Notification tone="инфо" scope="page" title="Режим просмотра">
        Вы видите проект глазами наблюдателя; правки выключены.
      </Notification>
      <Notification tone="хорошо" title="Отчёт отправлен">
        Копия лежит в разделе «Отчёты».
      </Notification>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Уведомления', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** По размаху: беда системы — над страницей, беда списка — над списком, итог действия, режим работы. */
export const Обычное: S = {}
