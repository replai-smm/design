import type { Meta, StoryObj } from '@storybook/react-vite'
import { ICON_INDICATOR_KINDS } from '../lib/vocab'
import { IconIndicator } from './IconIndicator'

const meta = {
  title: 'Компоненты/Элементы/IconIndicator',
  component: IconIndicator,
  parameters: { layout: 'padded' },
  args: { kind: 'failed', label: 'падает' },
} satisfies Meta<typeof IconIndicator>
export default meta
type S = StoryObj<typeof meta>

const WORD: Record<(typeof ICON_INDICATOR_KINDS)[number], string> = {
  failed: 'падает',
  'caution-major': 'серьёзное предупреждение',
  'caution-minor': 'предупреждение',
  undefined: 'не определено',
  succeeded: 'готово',
  normal: 'в норме',
  'in-progress': 'идёт',
  incomplete: 'не закончено',
  'not-started': 'не начато',
  pending: 'ждёт',
  unknown: 'неизвестно',
  informative: 'к сведению',
}

/** Все виды Carbon: знак своей формы и слово. */
export const Обычное: S = {
  render: () => (
    <ul className="m-0 grid list-none gap-items p-0 md:grid-cols-2">
      {ICON_INDICATOR_KINDS.map((k) => (
        <li key={k}>
          <IconIndicator kind={k} label={WORD[k]} />
        </li>
      ))}
    </ul>
  ),
}
