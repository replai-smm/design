import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/overflow-content.md?raw'
import { Button } from '../components/Button'
import { ContainedList, ContainedListItem } from '../components/ContainedList'
import { Tooltip } from '../components/Tooltip'
import { Heading } from '../components/Heading'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

const TASKS = Array.from({ length: 24 }, (_, i) => ({ id: String(i + 1), name: `Задача ${i + 1}: подготовить материалы к встрече с подрядчиком и согласовать сроки` }))
const long = 'Квартальный отчёт по проектам направления «Новые офисы» с приложениями и протоколами встреч'

function Example() {
  const [limit, setLimit] = useState(5)
  return (
    <Stack gap={6} className="p-blocks">
      <Section as={Stack} gap={5}>
        <Heading>Обрезка с подсказкой</Heading>
        <Tooltip description={long}>
          <button type="button" className="max-w-narrow cursor-default truncate text-start text-body text-fg">
            {long}
          </button>
        </Tooltip>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>«Показать ещё» у длинного списка</Heading>
        <ContainedList label="Задачи">
          {TASKS.slice(0, limit).map((t) => (
            <ContainedListItem key={t.id}>
              <span className="block truncate">{t.name}</span>
            </ContainedListItem>
          ))}
        </ContainedList>
        {limit < TASKS.length && (
          <div>
            <Button kind="ghost" onClick={() => setLimit(limit + 5)}>
              Показать ещё · {TASKS.length - limit}
            </Button>
          </div>
        )}
      </Section>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Обрезка содержимого', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
