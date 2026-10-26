import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/notifications.md?raw'
import { ActionableNotification, InlineNotification } from '../components/InlineNotification'
import { Heading } from '../components/Heading'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <InlineNotification kind="error" title="Сервис оплаты не отвечает" subtitle="Счета не уходят с 14:20. Мы уже чиним." hideCloseButton />
      <Section as={Stack} gap={5}>
        <Heading>Файлы проекта</Heading>
        <ActionableNotification inline hasFocus={false} kind="warning" title="Два файла не загрузились" subtitle="Остальные файлы на месте." actionButtonLabel="Повторить" />
      </Section>
      <InlineNotification kind="info" title="Режим просмотра" subtitle="Вы видите проект глазами наблюдателя; правки выключены." hideCloseButton />
      <InlineNotification kind="success" title="Отчёт отправлен" subtitle="Копия лежит в разделе «Отчёты»." />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Уведомления', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** По размаху: беда системы — над страницей, беда списка — над списком (с действием у причины), режим работы, итог действия. */
export const Обычное: S = {}
