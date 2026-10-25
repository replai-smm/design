import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/status-indicators.md?raw'
import { CountBadge } from '../components/CountBadge'
import { Icon } from '../components/Icon'
import { StatusBadge } from '../components/StatusBadge'
import { Inline, Section, Stack } from '../components/layout'
import { TONE_ORDER } from '../lib/vocab'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="groups" className="p-blocks">
      <Section title="Знак: форма и цвет">
        <Inline gap="compact">
          {TONE_ORDER.map((t) => (
            <Icon key={t} tone={t} label={t} />
          ))}
        </Inline>
      </Section>
      <Section title="Метка: знак и слово">
        <Inline gap="compact">
          {TONE_ORDER.map((t) => (
            <StatusBadge key={t} tone={t} label={t} />
          ))}
        </Inline>
      </Section>
      <Section title="Бейдж с числом">
        <Inline gap="compact">
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
