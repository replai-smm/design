import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/loading.md?raw'
import { ActionArea } from '../components/Button'
import { InlineLoading } from '../components/InlineLoading'
import { Loading, Skeleton } from '../components/Skeleton'
import { Section, Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="groups" className="p-blocks">
      <Section title="Скелет той же формы">
        <Loading>
          <Stack gap="compact">
            {[0, 1, 2].map((i) => (
              <Stack key={i} gap="tight">
                <Skeleton width="1/3" />
                <Skeleton />
              </Stack>
            ))}
          </Stack>
        </Loading>
      </Section>
      <Section title="Загрузка в строке">
        <ActionArea primary={{ label: 'Сохранить', loading: true }} />
        <InlineLoading progress="running" label="Сохраняем…" />
        <InlineLoading progress="done" label="Сохранено" />
      </Section>
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Загрузка', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
