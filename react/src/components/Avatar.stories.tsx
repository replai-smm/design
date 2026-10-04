import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'
import { Inline, Stack } from './layout'

// образец картинки без сети: круги на сером (ds-allow: картинка-образец, не цвет интерфейса)
const PHOTO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect width='48' height='48' fill='slategray'/><circle cx='24' cy='19' r='9' fill='lightgray'/><path d='M8 46c2-10 8-15 16-15s14 5 16 15z' fill='lightgray'/></svg>" // ds-allow: картинка-образец

const meta = {
  title: 'Компоненты/Аватар',
  component: Avatar,
  parameters: { layout: 'padded' },
  args: { name: 'Кофейня «Зерно»' },
} satisfies Meta<typeof Avatar>
export default meta
type S = StoryObj<typeof meta>

/** Картинка; нет картинки — буквы; нет и имени — значок человека. Размеры sm 24 · md 32 · lg 48 px. */
export const Обычное: S = {
  render: () => (
    <Stack gap="05">
      <Inline gap="04">
        <Avatar src={PHOTO} name="Анна Петрова" size="sm" />
        <Avatar src={PHOTO} name="Анна Петрова" />
        <Avatar src={PHOTO} name="Анна Петрова" size="lg" />
      </Inline>
      <Inline gap="04">
        <Avatar name="Кофейня «Зерно»" size="sm" />
        <Avatar name="Кофейня «Зерно»" />
        <Avatar name="Кофейня «Зерно»" size="lg" />
      </Inline>
      <Inline gap="04">
        <Avatar size="sm" />
        <Avatar />
        <Avatar size="lg" />
      </Inline>
    </Stack>
  ),
}

/** В строке списка рядом с именем — украшение: читалка не повторяет имя. */
export const ВСтроке: S = {
  render: () => (
    <Inline gap="03">
      <Avatar name="Студия йоги" decorative />
      <span className="text-body-compact-01 text-text-primary">Студия йоги</span>
    </Inline>
  ),
}

/** Картинка не загрузилась — замена сама, без пустого квадрата. */
export const ОшибкаКартинки: S = {
  tags: ['state:ошибка'],
  args: { src: 'нет-такой-картинки.png', name: 'Пекарня у дома', size: 'lg' },
}
