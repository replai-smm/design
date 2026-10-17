import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Grid, Inline, Page, PageHeader, Section, Stack } from './layout'
import { Surface } from './Surface'

const meta = {
  title: 'Раскладка/Страница и блоки',
  component: Page,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Page>
export default meta
type S = StoryObj<typeof meta>

/** Страница → шапка → раздел → блоки: отступы — роли, сетка — одна колонка на телефоне. */
export const Обычное: S = {
  args: {
    header: <PageHeader title="Дашборд агентства" tools={<Button variant="ghost" dense icon="menu" aria-label="ещё действия" />} />,
    children: (
      <>
        <Section title="Ключевые показатели" description="За неделю, по всем сообществам.">
          <Grid columns={3}>
            {['17 сообществ', '42 ответа', '3 без доступа'].map((t) => (
              <Surface key={t} className="text-body">
                {t}
              </Surface>
            ))}
          </Grid>
        </Section>
        <Section title="Блоки в строку и столбиком">
          <Stack gap="items">
            <Inline gap="items">
              <Button dense>Неделя</Button>
              <Button dense>Месяц</Button>
            </Inline>
            <p className="m-0 text-body text-fg-muted">Stack — блоки друг под другом, Inline — в строку, Grid — сетка.</p>
          </Stack>
        </Section>
      </>
    ),
  },
}
