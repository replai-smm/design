import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUp } from '../lib/icons.gen'
import { Link } from './Link'
import { Stack } from './layout'

const meta = {
  title: 'Компоненты/Элементы/Link',
  component: Link,
  parameters: { layout: 'padded' },
  args: { href: '#reset', children: 'Забыли пароль?' },
} satisfies Meta<typeof Link>
export default meta
type S = StoryObj<typeof meta>

/** Отдельная ссылка, ссылка в тексте, со значком, выключенная. */
export const Обычное: S = {
  render: (args) => (
    <Stack gap={4}>
      <Link {...args} />
      <p className="m-0 max-w-prose text-body text-fg">
        Отчёт лежит в разделе{' '}
        <Link inline href="#reports">
          «Отчёты»
        </Link>
        , копия ушла на почту.
      </p>
      <Link href="#top" size="sm" renderIcon={ArrowUp}>
        Наверх
      </Link>
      <Link href="#archive" disabled>
        Архив недоступен
      </Link>
    </Stack>
  ),
}
