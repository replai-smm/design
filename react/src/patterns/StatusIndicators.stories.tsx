import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/status-indicators.md?raw'
import { CountBadge } from '../components/CountBadge'
import { Heading } from '../components/Heading'
import { IconIndicator } from '../components/IconIndicator'
import { Tag } from '../components/Tag'
import { Inline, Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap={6} className="p-blocks">
      <Section as={Stack} gap={5}>
        <Heading>Знак: форма и цвет</Heading>
        <Inline gap={5}>
          <IconIndicator kind="failed" label="Ошибка" />
          <IconIndicator kind="caution-major" label="Серьёзное предупреждение" />
          <IconIndicator kind="caution-minor" label="Предупреждение" />
          <IconIndicator kind="succeeded" label="Готово" />
          <IconIndicator kind="in-progress" label="Идёт" />
          <IconIndicator kind="pending" label="Ждёт" />
          <IconIndicator kind="not-started" label="Не начато" />
        </Inline>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>Метка: слово в цвете</Heading>
        <Inline gap={4}>
          <Tag type="red">просрочено</Tag>
          <Tag type="purple">ждёт решения</Tag>
          <Tag type="green">оплачено</Tag>
          <Tag type="gray">черновик</Tag>
          <Tag type="outline">в архиве</Tag>
        </Inline>
      </Section>
      <Section as={Stack} gap={5}>
        <Heading>Бейдж с числом</Heading>
        <Inline gap={4}>
          <CountBadge count={3} tone="опасно" label="3 просрочено" />
          <CountBadge count={12} label="12 задач" />
        </Inline>
      </Section>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Индикаторы статуса', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
