import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/search.md?raw'
import { Button } from '../components/Button'
import { List } from '../components/Collection'
import { Search } from '../components/Search'
import { StateView } from '../components/StateView'
import { Heading } from '../components/Heading'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

const DOCS = ['Договор поставки', 'Отчёт за март', 'Отчёт за апрель', 'План проекта', 'Счёт № 18'].map((name) => ({ id: name, name }))

/** Поиск по документам: поле, найденное списком, «ничего не найдено» со сбросом. */
function Example({ query = '' }: { query?: string }) {
  const [q, setQ] = useState(query)
  const found = DOCS.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <Section as={Stack} gap={5} className="p-blocks">
      <Heading>Документы</Heading>
      <Search labelText="Поиск по документам" placeholder="Название документа" value={q} onChange={(e) => setQ(e.target.value)} />
      {found.length ? (
        <List label="Найдено" rows={found} getKey={(r) => r.id} renderRow={(r) => r.name} />
      ) : (
        <StateView kind="ничего не найдено" title={`По запросу «${q}» ничего`} action={<Button kind="secondary" onClick={() => setQ('')}>
              Сбросить поиск
            </Button>} />
      )}
    </Section>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Поиск', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Найдено: только подходящие документы. */
export const Обычное: S = { args: { query: 'отчёт' } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { query: 'смета' } }
