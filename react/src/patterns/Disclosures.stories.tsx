import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/disclosures.md?raw'
import { Accordion, AccordionItem } from '../components/Accordion'
import { Card } from '../components/Card'
import { Heading } from '../components/Heading'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from '../components/Toggletip'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <Section as={Stack} gap={5}>
        <Heading>Справка у подписи</Heading>
        <span className="inline-flex items-center gap-tight text-body text-fg">
          <ToggletipLabel>Лимит хранилища</ToggletipLabel>
          <Toggletip>
            <ToggletipButton label="Подробнее: лимит хранилища" />
            <ToggletipContent>Сколько места занимают файлы всех проектов команды.</ToggletipContent>
          </Toggletip>
        </span>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>Подробности по требованию</Heading>
        <Accordion>
          <AccordionItem title="Как считается лимит">Учитываются все версии файлов, корзина — нет.</AccordionItem>
          <AccordionItem title="Что будет при превышении">Новые файлы не загрузятся, старые останутся на месте.</AccordionItem>
        </Accordion>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>Карточка: три факта на лице, остальное в «подробнее»</Heading>
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
