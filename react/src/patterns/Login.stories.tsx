import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/login.md?raw'
import { ActionArea } from '../components/Button'
import { Notification } from '../components/Notification'
import { TextField } from '../components/TextField'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example({ error = false }: { error?: boolean }) {
  return (
    <div className="flex justify-center p-groups">
      <Stack as="form" gap="blocks" className="w-full max-w-popup" aria-label="Вход">
        <p className="m-0 text-title text-fg">Вход</p>
        {error && (
          <Notification tone="опасно" title="Не вышло войти">
            Почта или пароль не подходят. Проверьте раскладку или восстановите пароль.
          </Notification>
        )}
        <TextField label="Почта" type="email" autoComplete="email" defaultValue={error ? 'anna@example.com' : undefined} />
        <TextField label="Пароль" type="password" autoComplete="current-password" />
        <ActionArea primary={{ label: 'Войти', type: 'submit' }} />
        <a href="#reset" className="self-start text-body text-accent">
          Забыли пароль?
        </a>
      </Stack>
    </div>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Вход', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Вход не вышел: плашкой над формой, почта осталась. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: true } }
