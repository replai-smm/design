import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionNav, type NavItem } from './SectionNav'
import { Page, PageHeader } from './layout'

const MAIN: NavItem[] = [
  { id: 'health', label: 'Состояние', count: 2 },
  { id: 'accrual', label: 'Основные' },
  { id: 'conditions', label: 'Условия' },
  { id: 'levels', label: 'Уровни' },
]
const MORE: NavItem[] = [
  { id: 'market', label: 'Маркет' },
  { id: 'users', label: 'Пользователи' },
  { id: 'codes', label: 'Коды' },
  { id: 'invite', label: 'Инвайты' },
  { id: 'history', label: 'История' },
  { id: 'bot', label: 'Бот-сообщения' },
  { id: 'mailings', label: 'Рассылки' },
  { id: 'tags', label: 'Метки' },
]

/** Админка Арены: 4 основных раздела на виду, 8 редких — в «Ещё». */
function Admin({ start = 'conditions', more = MORE }: { start?: string; more?: NavItem[] }) {
  const [selected, setSelected] = useState(start)
  const title = [...MAIN, ...more].find((i) => i.id === selected)?.label ?? ''
  return (
    <SectionNav label="Разделы" main={MAIN} more={more} selected={selected} onSelect={setSelected}>
      <Page header={<PageHeader title={title} />}>
        <p className="m-0 text-body text-fg-muted">Страница раздела «{title}».</p>
      </Page>
    </SectionNav>
  )
}

const meta = {
  title: 'Паттерны/Разделы',
  component: Admin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Admin>
export default meta
type S = StoryObj<typeof meta>

/** Выбран основной раздел: «Ещё» свёрнуто. Телефон — панель внизу: 4 основных и «Ещё». */
export const Обычное: S = { args: { more: MORE.slice(0, 3) } }
/** Выбран редкий раздел: «Ещё» раскрыто на месте, на телефоне отмечено «Ещё». */
export const Много: S = { tags: ['state:много'], args: { start: 'history' } }
