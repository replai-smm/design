import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordInput } from './TextInput'

const meta = {
  title: 'Компоненты/Поля/PasswordInput',
  component: PasswordInput,
  parameters: { layout: 'padded' },
  args: { id: 'password', labelText: 'Пароль', autoComplete: 'current-password', defaultValue: 'secret-42', className: 'max-w-form' },
} satisfies Meta<typeof PasswordInput>
export default meta
type S = StoryObj<typeof meta>

/** Ввод скрыт; значок в поле показывает и прячет пароль. */
export const Обычное: S = {}
export const Ошибка: S = { tags: ['state:ошибка'], args: { invalid: true, invalidText: 'Пароль не подходит' } }
