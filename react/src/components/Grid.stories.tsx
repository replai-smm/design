import type { Meta, StoryObj } from '@storybook/react-vite'
import { Column, Grid } from './layout'
import { Surface } from './Surface'

const meta = {
  title: 'Компоненты/Раскладка/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  args: { withRowGap: true },
} satisfies Meta<typeof Grid>
export default meta
type S = StoryObj<typeof meta>

/** 16 колонок: 4 на телефоне, 8 с 768 px, 16 с 1024 px. Ширина колонки — числом или долей; без неё — во всю строку. */
export const Обычное: S = {
  render: (args) => (
    <Grid {...args}>
      <Column>
        <Surface className="text-body">Во всю строку</Surface>
      </Column>
      <Column sm={4} md={4} lg={8}>
        <Surface className="text-body">sm 4 · md 4 · lg 8</Surface>
      </Column>
      <Column sm={4} md={4} lg={8}>
        <Surface className="text-body">sm 4 · md 4 · lg 8</Surface>
      </Column>
      {[1, 2, 3, 4].map((i) => (
        <Column key={i} span="25%">
          <Surface className="text-body">25%</Surface>
        </Column>
      ))}
    </Grid>
  ),
}

/** Узкий промежуток — 16 px: плотные плитки. */
export const Узкая: S = { ...Обычное, args: { narrow: true, withRowGap: true } }
