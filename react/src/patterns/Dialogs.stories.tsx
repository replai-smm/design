import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/dialogs.md?raw'
import { ActionArea, Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { TextField } from '../components/TextField'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Опасное подтверждение и короткий ввод в окне. */
function Example({ open = false }: { open?: boolean }) {
  return (
    <Stack gap="items" className="p-blocks">
      <Dialog
        open={open || undefined}
        trigger={<Button tone="опасно">Удалить проект</Button>}
        title="Удалить проект «Сайт»?"
        description="Проект и его задачи пропадут у всей команды. Вернуть нельзя."
        actions={
          <ActionArea label="Действия окна">
            <Button variant="ghost" data-autofocus>
              Отмена
            </Button>
            <Button tone="опасно">Удалить</Button>
          </ActionArea>
        }
      />
      <Dialog trigger={<Button>Переименовать</Button>} title="Новое имя проекта" persistent actions={<ActionArea primary={{ label: 'Сохранить' }} label="Действия окна" />}>
        <TextField label="Имя проекта" defaultValue="Сайт" />
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
