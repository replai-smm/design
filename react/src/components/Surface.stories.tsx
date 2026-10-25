import type { Meta, StoryObj } from '@storybook/react-vite'
import { Column, Grid } from './layout'
import { Surface } from './Surface'

const meta = {
  title: 'Компоненты/Поверхности/Поверхность',
  component: Surface,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Surface>
export default meta
type S = StoryObj<typeof meta>

/** Одна анатомия: слой, рамка, угол, поля; метка слева — знак тона одной ширины; утопленная — для кода. */
export const Обычное: S = {
  render: () => (
    <Grid narrow withRowGap>
      <Column sm={4} md={4} lg={5}>
        <Surface>
          <p className="m-0 text-heading">Поверхность</p>
          <p className="m-0 text-body text-fg-muted">Своё содержимое продукта.</p>
        </Surface>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Surface mark="опасно">
          <p className="m-0 text-heading">Метка «опасно»</p>
        </Surface>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Surface mark="внимание">
          <p className="m-0 text-heading">Метка «внимание»</p>
        </Surface>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Surface mark="инфо">
          <p className="m-0 text-heading">Метка «инфо» — ждёт тебя</p>
        </Surface>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Surface mark="хорошо">
          <p className="m-0 text-heading">Метка «хорошо»</p>
        </Surface>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <Surface inset>
          <p className="m-0 font-mono text-code">утопленная: код</p>
        </Surface>
      </Column>
    </Grid>
  ),
}
