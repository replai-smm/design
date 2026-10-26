import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ButtonSet } from './Button'
import { Form, FormGroup } from './Form'
import { Stack } from './layout'
import { TextInput } from './TextInput'

const meta = {
  title: 'Компоненты/Поля/Form',
  component: FormGroup,
  parameters: { layout: 'padded' },
  args: { legendText: 'Адрес доставки', children: null },
} satisfies Meta<typeof FormGroup>
export default meta
type S = StoryObj<typeof meta>

/** Форма и группа полей одной подписью: читалка называет группу у каждого поля; Enter отправляет форму. */
export const Обычное: S = {
  render: (args) => (
    <Form aria-label="Доставка" className="max-w-form" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6}>
        <FormGroup legendText={args.legendText}>
          <Stack gap={5}>
            <TextInput id="street" labelText="Улица и дом" defaultValue="ул. Садовая, 12" />
            <TextInput id="flat" labelText="Квартира или офис" />
          </Stack>
        </FormGroup>
        <ButtonSet>
          <Button type="submit">Сохранить</Button>
        </ButtonSet>
      </Stack>
    </Form>
  ),
}

/** Группа с ошибкой: слово под группой. */
export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: (args) => (
    <FormGroup legendText={args.legendText} invalid message messageText="Заполните адрес целиком" className="max-w-form">
      <Stack gap={5}>
        <TextInput id="street-e" labelText="Улица и дом" />
        <TextInput id="flat-e" labelText="Квартира или офис" />
      </Stack>
    </FormGroup>
  ),
}
