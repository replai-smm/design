import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from './layout'
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
    <Grid columns={3}>
      <Surface>
        <p className="m-0 text-heading">Поверхность</p>
        <p className="m-0 text-body text-fg-muted">Своё содержимое продукта.</p>
      </Surface>
      <Surface mark="опасно">
        <p className="m-0 text-heading">Метка «опасно»</p>
      </Surface>
      <Surface mark="внимание">
        <p className="m-0 text-heading">Метка «внимание»</p>
      </Surface>
      <Surface mark="инфо">
        <p className="m-0 text-heading">Метка «инфо» — ждёт тебя</p>
      </Surface>
      <Surface mark="хорошо">
        <p className="m-0 text-heading">Метка «хорошо»</p>
      </Surface>
      <Surface inset>
        <p className="m-0 font-mono text-code">утопленная: код</p>
      </Surface>
    </Grid>
  ),
}
