import type { Meta, StoryObj } from '@storybook/react-vite'
import { Combobox, type ComboboxOption } from './Combobox'

const communities: ComboboxOption[] = [
  { value: 'c1', label: 'Кофейня «Зерно»', description: 'Самара' },
  { value: 'c2', label: 'Пекарня «Колос»', description: 'Тольятти' },
  { value: 'c3', label: 'Цветы «Флокс»', description: 'Сызрань' },
  { value: 'c4', label: 'Фитнес «Атлет»', description: 'Самара' },
]
const many: ComboboxOption[] = Array.from({ length: 300 }, (_, i) => ({ value: `m${i}`, label: `Сообщество ${i + 1}` }))
const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  canvasElement.querySelector<HTMLInputElement>('input[role=combobox]')?.click()
}

const meta = {
  title: 'Поля/Выбор с поиском',
  component: Combobox,
  parameters: { layout: 'padded' },
  args: { label: 'Сообщество', placeholder: 'Поиск сообщества', options: communities, defaultValue: 'c2', className: 'max-w-sm' },
} satisfies Meta<typeof Combobox>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Список открыт: выбранный — «выбрано» и галочка. */
export const Открыт: S = { play: open }
export const Загрузка: S = { tags: ['state:загрузка'], args: { loading: true }, play: open }
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: 'Сообщества не загрузились' } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { options: [], defaultValue: null }, play: open }
/** Много: первые 60 и «уточните поиск». */
export const Много: S = { tags: ['state:много'], args: { options: many, defaultValue: null, limit: 60 }, play: open }
