import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/login.md?raw'
import { Button, ButtonSet } from '../components/Button'
import { Link } from '../components/Link'
import { Form } from '../components/Form'
import { InlineNotification } from '../components/InlineNotification'
import { PasswordInput, TextInput } from '../components/TextInput'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example({ error = false }: { error?: boolean }) {
  return (
    <div className="flex justify-center p-groups">
      <Form aria-label="Вход" className="w-full max-w-popup" onSubmit={(e) => e.preventDefault()}>
        <Stack gap={5}>
          <p className="m-0 text-title text-fg">Вход</p>
          {error && (
            <InlineNotification kind="error" role="alert" title="Не вышло войти" subtitle="Почта или пароль не подходят. Проверьте раскладку или восстановите пароль." hideCloseButton />
          )}
          <TextInput id="login-email" labelText="Почта" type="email" autoComplete="email" defaultValue={error ? 'anna@example.com' : undefined} />
          <PasswordInput id="login-password" labelText="Пароль" autoComplete="current-password" />
          <ButtonSet>
            <Button type="submit">Войти</Button>
          </ButtonSet>
          <Link href="#reset" className="self-start">
            Забыли пароль?
          </Link>
        </Stack>
      </Form>
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
