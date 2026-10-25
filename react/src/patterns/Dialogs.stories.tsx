import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/dialogs.md?raw'
import { Button, ButtonSet } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { TextInput } from '../components/TextInput'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Опасное подтверждение и короткий ввод в окне. */
function Example({ open = false }: { open?: boolean }) {
  return (
    <Stack gap={3} className="p-blocks">
      <Dialog
        open={open || undefined}
        trigger={<Button kind="danger--tertiary">Удалить проект</Button>}
        title="Удалить проект «Сайт»?"
        description="Проект и его задачи пропадут у всей команды. Вернуть нельзя."
        actions={
          <ButtonSet aria-label="Действия окна">
            <Button kind="ghost" data-autofocus>
              Отмена
            </Button>
            <Button kind="danger">Удалить</Button>
          </ButtonSet>
        }
      />
      <Dialog
        trigger={<Button kind="secondary">Переименовать</Button>}
        title="Новое имя проекта"
        persistent
        actions={
          <ButtonSet aria-label="Действия окна">
            <Button>Сохранить</Button>
          </ButtonSet>
        }
      >
        <TextInput id="project-name" labelText="Имя проекта" defaultValue="Сайт" />
      </Dialog>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Окна', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Подтверждение открыто: вопрос, что будет, «Удалить» — опасная, фокус на «Отмена». */
export const Открыто: S = { args: { open: true } }
