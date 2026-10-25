import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'
import { Section, Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/Heading',
  component: Heading,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Heading>
export default meta
type S = StoryObj<typeof meta>

/** Уровень — из вложенности разделов: вне раздела h1, в разделе h2, глубже — h3. */
export const Обычное: S = {
  render: () => (
    <Stack gap={5}>
      <Heading>Настройки проекта</Heading>
      <Section as={Stack} gap={4}>
        <Heading>Уведомления</Heading>
        <p className="m-0 text-body text-fg-muted">Раздел поднимает уровень заголовка на один.</p>
        <Section as={Stack} gap={3}>
          <Heading>Почта</Heading>
          <p className="m-0 text-body text-fg-muted">Раздел в разделе — третий уровень.</p>
        </Section>
      </Section>
    </Stack>
  ),
}
