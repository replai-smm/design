import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Combobox, type ComboboxOption } from './Combobox'
import { groups, many } from '../stories/fixtures'

const options: ComboboxOption[] = groups.map((g) => ({ value: g.id, label: g.name, description: `клиент «${g.client}»` }))
const manyOptions: ComboboxOption[] = many.map((g) => ({ value: g.id, label: g.name }))

function Demo({ initial = 'g1', open }: { initial?: string | null; open?: boolean }) {
  const [v, setV] = useState<string | null>(initial)
  return (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={options} value={v} onChange={setV} placeholder="Начните печатать название" defaultOpen={open} helperText="Куда опубликовать пост" />
    </div>
  )
}

const meta = {
  title: 'ДС/Выбор с поиском',
  component: Combobox,
  parameters: { layout: 'padded' },
  args: { label: 'Сообщество', options },
} satisfies Meta<typeof Combobox>
export default meta
type S = StoryObj<typeof meta>

/** Выбрано; печать сужает список, стрелки ходят, Enter выбирает, Esc закрывает. */
export const Обычное: S = { render: () => <Demo /> }

/** Список открыт: выбранный пункт отмечен галкой, активный — подсветкой. */
export const Открыт: S = { render: () => <Demo open /> }

export const НичегоНеНайдено: S = {
  tags: ['state:ничего не найдено'],
  render: () => (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={[]} defaultOpen emptyText="Таких сообществ нет — проверьте название" />
    </div>
  ),
}

export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={[]} loading defaultOpen />
    </div>
  ),
}

export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={options} error="Выберите сообщество" placeholder="Начните печатать название" />
    </div>
  ),
}

/** 150 сообществ: высота списка ограничена, список прокручивается, поиск — главный путь. */
export const Много: S = {
  tags: ['state:много'],
  render: () => (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={manyOptions} defaultOpen defaultValue="m3" />
    </div>
  ),
}

export const Недоступно: S = {
  render: () => (
    <div className="max-w-md">
      <Combobox label="Сообщество" options={options} defaultValue="g2" disabled helperText="Сообщество поста не меняется после публикации" />
    </div>
  ),
}
