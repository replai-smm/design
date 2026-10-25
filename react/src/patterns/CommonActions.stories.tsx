import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/common-actions.md?raw'
import { Button, ButtonSet } from '../components/Button'
import { ContainedList, ContainedListItem } from '../components/ContainedList'
import { ActionableNotification } from '../components/InlineNotification'
import { OverflowMenu, OverflowMenuItem } from '../components/OverflowMenu'
import { Stack } from '../components/layout'
import { Add } from '../lib/icons.gen'
import { pattern } from './story'

const files = [
  { id: 'brief', name: 'Бриф.pdf' },
  { id: 'plan', name: 'План работ.xlsx' },
  { id: 'logo', name: 'Логотип.svg' },
]

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <ContainedList
        label="Файлы проекта"
        action={
          <Button kind="secondary" renderIcon={Add}>
            Добавить
          </Button>
        }
      >
        {files.map((f) => (
          <ContainedListItem
            key={f.id}
            action={
              <OverflowMenu iconDescription={`Действия с «${f.name}»`} flipped>
                <OverflowMenuItem itemText="Переименовать" />
                <OverflowMenuItem itemText="Скачать" />
                <OverflowMenuItem itemText="Удалить" isDelete hasDivider />
              </OverflowMenu>
            }
          >
            {f.name}
          </ContainedListItem>
        ))}
      </ContainedList>
      <ActionableNotification inline hasFocus={false} hideCloseButton kind="error" title="Список не загрузился" subtitle="Сервер не ответил за 30 с." actionButtonLabel="Повторить" />
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

/** «Добавить» у списка, действия строки — меню «…» (удаление — опасным пунктом), «Повторить» у причины, «Сохранить» и «Отменить» у формы. */
export const Обычное: S = {}
