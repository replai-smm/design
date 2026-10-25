import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/common-actions.md?raw'
import { Button, ButtonSet, IconButton } from '../components/Button'
import { List } from '../components/Collection'
import { Heading } from '../components/Heading'
import { Notification } from '../components/Notification'
import { Inline, Section, Stack } from '../components/layout'
import { Add, Close } from '../lib/icons.gen'
import { pattern } from './story'

const files = [
  { id: 'brief', name: 'Бриф.pdf' },
  { id: 'plan', name: 'План работ.xlsx' },
  { id: 'logo', name: 'Логотип.svg' },
]

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <Section as={Stack} gap={5}>
        <Inline justify="between">
          <Heading>Файлы проекта</Heading>
          <Button kind="secondary" renderIcon={Add}>
            Добавить
          </Button>
        </Inline>
        <List
          label="Файлы"
          rows={files}
          getKey={(r) => r.id}
          renderRow={(r) => r.name}
          rowAction={(r) => (
            <IconButton kind="ghost" size="sm" label={`Удалить «${r.name}»`}>
              <Close />
            </IconButton>
          )}
        />
      </Section>
      <Notification
        tone="опасно"
        scope="list"
        title="Список не загрузился"
        action={
          <Button kind="ghost" size="sm">
            Повторить
          </Button>
        }
      >
        Сервер не ответил за 30 с.
      </Notification>
      <ButtonSet aria-label="Действия формы">
        <Button kind="ghost">Отменить</Button>
        <Button>Сохранить</Button>
      </ButtonSet>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Общие действия', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** «Добавить» у списка, удаление значком в строке, «Повторить» у причины, «Сохранить» и «Отменить» у формы. */
export const Обычное: S = {}
