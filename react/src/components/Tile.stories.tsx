import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronRight } from '../lib/icons.gen'
import { Column, Grid } from './layout'
import { ClickableTile, Tile } from './Tile'

const meta = {
  title: 'Компоненты/Поверхности/Tile',
  component: Tile,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tile>
export default meta
type S = StoryObj<typeof meta>

/** Одна анатомия: слой, рамка, угол, поля; ClickableTile — вся плитка ведёт по адресу или делает действие. */
export const Обычное: S = {
  render: () => (
    <Grid narrow withRowGap>
      <Column sm={4} md={4} lg={5}>
        <Tile>
          <p className="m-0 text-heading">Плитка</p>
          <p className="m-0 text-body text-fg-muted">Своё содержимое продукта.</p>
        </Tile>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <ClickableTile href="#reports" renderIcon={ChevronRight}>
          <p className="m-0 text-heading">Отчёты</p>
          <p className="m-0 text-body text-fg-muted">Переход по адресу.</p>
        </ClickableTile>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <ClickableTile onClick={() => {}}>
          <p className="m-0 text-heading">Новый проект</p>
          <p className="m-0 text-body text-fg-muted">Действие по нажатию.</p>
        </ClickableTile>
      </Column>
      <Column sm={4} md={4} lg={5}>
        <ClickableTile href="#archive" disabled>
          <p className="m-0 text-heading">Архив</p>
          <p className="m-0 text-body">Выключено.</p>
        </ClickableTile>
      </Column>
    </Grid>
  ),
}

/** Тон плитки — метка слева цвета вида (как у уведомления); слово состояния называет заголовок, цвет не один. */
export const СТоном: S = {
  render: () => (
    <Grid narrow withRowGap>
      {(['error', 'warning', 'info', 'success'] as const).map((kind) => (
        <Column key={kind} sm={4} md={4} lg={4}>
          <Tile kind={kind}>
            <p className="m-0 text-heading">{{ error: 'Критичные', warning: 'Плановые', info: 'Сведения', success: 'Готово' }[kind]}</p>
            <p className="m-0 text-body text-fg-muted">Раздел списка с тоном: {kind}.</p>
          </Tile>
        </Column>
      ))}
    </Grid>
  ),
}
