import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Dialogs.md?raw'
import { ActionArea, Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { PatternDoc } from './doc'

function Doc({ open = false }: { open?: boolean }) {
  return (
    <PatternDoc md={md}>
      <div className="p-blocks">
        <Dialog
          open={open || undefined}
          trigger={<Button tone="опасно">Удалить черновик</Button>}
          title="Удалить черновик?"
          description="Черновик пропадёт у всех. Вернуть нельзя."
          actions={
            <ActionArea label="Действия окна">
              <Button variant="ghost" data-autofocus>
                Отмена
              </Button>
              <Button tone="опасно">Удалить</Button>
            </ActionArea>
          }
        />
      </div>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Окна и подтверждения', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Кнопка опасного действия открывает подтверждение. */
export const Обычное: S = {}
/** Подтверждение открыто: вопрос, что будет, «Удалить» тоном «опасно», фокус на «Отмена». */
export const Открыто: S = { args: { open: true } }
