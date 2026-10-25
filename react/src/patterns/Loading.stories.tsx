import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/loading.md?raw'
import { Button, ButtonSet } from '../components/Button'
import { Heading } from '../components/Heading'
import { InlineLoading } from '../components/InlineLoading'
import { SkeletonText } from '../components/SkeletonText'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <Section as={Stack} gap={5}>
        <Heading>Скелет той же формы</Heading>
        <Stack gap={4} role="status" aria-busy="true">
          <span className="sr-only">загрузка</span>
          {[0, 1, 2].map((i) => (
            <Stack key={i} gap={2}>
              <SkeletonText width="33%" />
              <SkeletonText />
            </Stack>
          ))}
        </Stack>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>Загрузка в строке</Heading>
        <ButtonSet aria-label="Действия формы">
          <Button kind="secondary" disabled>
            Отменить
          </Button>
          <InlineLoading description="Сохраняем…" />
        </ButtonSet>
        <InlineLoading status="finished" description="Сохранено" />
      </Section>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Загрузка', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
