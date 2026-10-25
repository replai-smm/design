import type { Meta, StoryObj } from '@storybook/react-vite'
import { Menu } from '../lib/icons.gen'
import { Button, IconButton } from './Button'
import { Heading } from './Heading'
import { Column, Grid, Inline, Page, PageHeader, Section, Stack } from './layout'
import { Surface } from './Surface'

const meta = {
  title: 'Компоненты/Раскладка/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Page>
export default meta
type S = StoryObj<typeof meta>

/** Страница → шапка → раздел с заголовком → блоки: отступы — шаги шкалы, сетка — 16 колонок Carbon. */
export const Обычное: S = {
  args: {
    header: (
      <PageHeader
        title="Обзор команды"
        subtitle="Что изменилось за неделю по всем проектам."
        pageActions={
          <IconButton kind="ghost" size="sm" label="Ещё действия">
            <Menu />
          </IconButton>
        }
      />
    ),
    children: (
      <>
        <Section as={Stack} gap={5}>
          <Heading>Ключевые показатели</Heading>
          <Grid narrow withRowGap>
            {['17 проектов', '42 ответа', '3 без доступа'].map((t) => (
              <Column key={t} sm={4} md={4} lg={5}>
                <Surface className="text-body">{t}</Surface>
              </Column>
            ))}
          </Grid>
        </Section>
        <Section as={Stack} gap={5}>
          <Heading>Блоки в строку и столбиком</Heading>
          <Stack gap={3}>
            <Inline gap={3}>
              <Button kind="secondary" size="sm">
                Неделя
              </Button>
              <Button kind="secondary" size="sm">
                Месяц
              </Button>
            </Inline>
            <p className="m-0 text-body text-fg-muted">Stack — блоки друг под другом, Inline — в строку, Grid и Column — сетка.</p>
          </Stack>
        </Section>
      </>
    ),
  },
}
