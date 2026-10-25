import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/dialogs.md?raw'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { TextInput } from '../components/TextInput'
import { Stack } from '../components/layout'
import { pattern } from './story'

/** Опасное подтверждение и короткий ввод в окне. */
function Example({ open = false }: { open?: boolean }) {
  const [remove, setRemove] = useState(open)
  const [rename, setRename] = useState(false)
  return (
    <Stack gap={3} orientation="horizontal" className="p-blocks">
      <Button kind="danger--tertiary" onClick={() => setRemove(true)}>
        Удалить проект
      </Button>
      <Button kind="secondary" onClick={() => setRename(true)}>
        Переименовать
      </Button>
      <Modal
        open={remove}
        danger
        size="sm"
        modalHeading="Удалить проект «Сайт»?"
        primaryButtonText="Удалить"
        secondaryButtonText="Отмена"
        onRequestSubmit={() => setRemove(false)}
        onRequestClose={() => setRemove(false)}
      >
        <p className="m-0 text-body">Проект и его задачи пропадут у всей команды. Вернуть нельзя.</p>
      </Modal>
      <Modal
        open={rename}
        size="sm"
        modalHeading="Новое имя проекта"
        primaryButtonText="Сохранить"
        secondaryButtonText="Отмена"
        onRequestSubmit={() => setRename(false)}
        onRequestClose={() => setRename(false)}
      >
        <TextInput id="project-name" labelText="Имя проекта" defaultValue="Сайт" data-modal-primary-focus />
      </Modal>
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
