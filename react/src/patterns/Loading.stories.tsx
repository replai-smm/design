import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Loading.md?raw'
import { ActionArea } from '../components/Button'
import { InlineLoading } from '../components/InlineLoading'
import { Loading, Skeleton } from '../components/Skeleton'
import { Section, Stack } from '../components/layout'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Section title="Список грузится — скелет той же формы">
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
        <Section title="Действие идёт — кнопка занята, ход словами">
          <ActionArea primary={{ label: 'Сохранить', loading: true }} />
          <InlineLoading progress="running" label="Сохраняем…" />
        </Section>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Загрузка', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
