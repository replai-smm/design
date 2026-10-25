import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComboBox } from './ComboBox'

interface Person {
  id: string
  label: string
  team: string
  disabled?: boolean
}
const people: Person[] = [
  { id: 'c1', label: 'Анна Петрова', team: 'Продажи' },
  { id: 'c2', label: 'Борис Смирнов', team: 'Логистика' },
  { id: 'c3', label: 'Вера Иванова', team: 'Поддержка' },
  { id: 'c4', label: 'Глеб Орлов', team: 'Продажи', disabled: true },
]
const many: Person[] = Array.from({ length: 120 }, (_, i) => ({ id: `m${i}`, label: `Сотрудник ${i + 1}`, team: `Отдел ${(i % 7) + 1}` }))
const twoLines = (p: Person) => (
  <>
    <span className="truncate">{p.label}</span>
    <span className="truncate text-caption text-fg-muted">{p.team}</span>
  </>
)
const byText = ({ item, inputValue }: { item: Person; inputValue: string | null }) => !inputValue || item.label.toLowerCase().includes(inputValue.toLowerCase())
const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  canvasElement.querySelector<HTMLInputElement>('input[role=combobox]')?.click()
}

const meta = {
  title: 'Компоненты/Поля/ComboBox',
  component: ComboBox<Person>,
  parameters: { layout: 'padded' },
  args: { id: 'owner', titleText: 'Ответственный', placeholder: 'Поиск сотрудника', items: people, itemToElement: twoLines, initialSelectedItem: people[1], onChange: () => {}, className: 'max-w-popup' },
} satisfies Meta<typeof ComboBox<Person>>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Список открыт: выбранный — «выбрано» и галочка, выключенный — серым. */
export const Открыт: S = { play: open }
export const Ошибка: S = { tags: ['state:ошибка'], args: { invalid: true, invalidText: 'Выберите ответственного' } }
/** Много: набор сужает список (`shouldFilterItem`), список прокручивается. */
export const Много: S = { tags: ['state:много'], args: { items: many, initialSelectedItem: undefined, shouldFilterItem: byText }, play: open }
