import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/disclosures.md?raw'
import { Accordion } from '../components/Accordion'
import { Card } from '../components/Card'
import { Toggletip } from '../components/Toggletip'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="groups" className="p-blocks">
      <Section title="Справка у подписи">
        <span className="inline-flex items-center gap-tight text-body text-fg">
          Лимит хранилища
          <Toggletip label="Лимит хранилища">Сколько места занимают файлы всех проектов команды.</Toggletip>
        </span>
      </Section>
      <Section title="Подробности по требованию">
        <div>
          <Accordion title="Как считается лимит">Учитываются все версии файлов, корзина — нет.</Accordion>
          <Accordion title="Что будет при превышении">Новые файлы не загрузятся, старые останутся на месте.</Accordion>
        </div>
      </Section>
      <Section title="Карточка: три факта на лице, остальное в «подробнее»">
        <Card title="Проект «Сайт»" facts={['12 задач открыто', 'Срок — 30 ноября']} more="Последнее изменение — вчера, 18:40. Владелец — Анна Петрова." />
      </Section>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Раскрытие', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
