import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from './layout'
import { TextInput } from './TextInput'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from './Toggletip'

const meta = {
  title: 'Компоненты/Поля/TextInput',
  component: TextInput,
  parameters: { layout: 'padded' },
  args: { id: 'site', labelText: 'Сайт компании', placeholder: 'https://example.com/…', helperText: 'Адрес из строки браузера' },
} satisfies Meta<typeof TextInput>
export default meta
type S = StoryObj<typeof meta>

/** Подпись над полем, подсказка под ним; справка «i» — в подписи; дата — выбор системы; sm — 32 px; выключено и только чтение. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={5} className="max-w-form">
      <TextInput {...args} />
      <TextInput
        id="window"
        labelText={
          <>
            <ToggletipLabel>Окно записей</ToggletipLabel>
            <Toggletip>
              <ToggletipButton label="Подробнее: окно записей" />
              <ToggletipContent>Считаются только последние N записей.</ToggletipContent>
            </Toggletip>
          </>
        }
        defaultValue="30"
      />
      <TextInput id="when" labelText="Дата и время" type="datetime-local" defaultValue="2026-10-08T12:00" />
      <TextInput id="filter" labelText="Фильтр по имени" size="sm" placeholder="Имя" />
      <TextInput id="login" labelText="Логин" defaultValue="anna" disabled />
      <TextInput id="code" labelText="Код проекта" defaultValue="P-0042" readOnly />
    </Stack>
  ),
}

/** Ошибка вместо подсказки: рамка «опасно», под полем — знак и слово. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { defaultValue: 'example.com/team', invalid: true, invalidText: 'Нужна полная ссылка: https://example.com/…' } }

/** Предупреждение: знак «внимание» и слово, рамка обычная — сохранить можно. */
export const Предупреждение: S = { args: { defaultValue: 'http://example.com', warn: true, warnText: 'Без https браузер покажет «небезопасно».' } }
