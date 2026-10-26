import type { Meta, StoryObj } from '@storybook/react-vite'
import { TONES } from '../lib/vocab'
import { Icon } from './Icon'

const meta = {
  title: 'Компоненты/Элементы/Icon',
  component: Icon,
  parameters: { layout: 'padded' },
  args: { name: 'close' },
} satisfies Meta<typeof Icon>
export default meta
type S = StoryObj<typeof meta>

/** Знаки тонов: форма отличает тон без цвета. */
export const Тоны: S = {
  render: () => (
    <ul className="m-0 flex list-none flex-wrap gap-blocks p-0 text-body">
      {TONES.map((t) => (
        <li key={t} className="inline-flex items-center gap-items">
          <Icon tone={t} />
          {t}
        </li>
      ))}
    </ul>
  ),
}

/** Значок с подписью для читалки — когда слова рядом нет. */
export const СПодписью: S = { args: { name: 'search', label: 'поиск' } }
