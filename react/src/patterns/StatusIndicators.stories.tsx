import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/StatusIndicators.md?raw'
import { List } from '../components/Collection'
import { StatusBadge } from '../components/StatusBadge'
import { Inline, Section, Stack } from '../components/layout'
import { STATUS_IDS, TONE_ORDER } from '../lib/vocab'
import { groups } from '../stories/fixtures'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Section title="Тоны: знак своей формы и слово">
          <Inline gap="compact">
            {TONE_ORDER.map((t) => (
              <StatusBadge key={t} tone={t} label={t} />
            ))}
          </Inline>
        </Section>
        <Section title="Статусы — закрытый список">
          <Inline gap="compact">
            {STATUS_IDS.map((id) => (
              <StatusBadge key={id} status={id} />
            ))}
          </Inline>
        </Section>
        <Section title="В списке срочное сверху, норма свёрнута">
          <List label="Группы" rows={groups} getKey={(r) => r.id} getStatus={(r) => r.status} renderRow={(r) => r.name} />
        </Section>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Статусы', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
