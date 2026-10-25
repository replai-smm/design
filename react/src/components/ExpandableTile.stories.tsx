import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { IconIndicator } from './IconIndicator'
import { Column, Grid, Inline } from './layout'
import { ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent } from './Tile'

const meta = {
  title: 'Компоненты/Поверхности/ExpandableTile',
  component: ExpandableTile,
  parameters: { layout: 'padded' },
  args: { tileCollapsedLabel: 'Подробнее', tileExpandedLabel: 'Свернуть', className: 'max-w-form' },
  render: (args) => (
    <ExpandableTile {...args}>
      <TileAboveTheFoldContent>
        <Inline justify="between">
          <p className="m-0 text-heading">Ответы на отзывы</p>
          <IconIndicator kind="failed" label="падает" />
        </Inline>
        <p className="m-0 text-body text-fg-muted">Падает с 14:20</p>
        <p className="m-0 text-body text-fg-muted">Ключ доступа отозван</p>
        <div>
          <Button kind="secondary" size="sm">
            Починить
          </Button>
        </div>
      </TileAboveTheFoldContent>
      <TileBelowTheFoldContent>
        <p className="m-0 text-body text-fg-muted">Тесты: 12 из 14 зелёные. Последний прогон — 5 минут назад.</p>
      </TileBelowTheFoldContent>
    </ExpandableTile>
  ),
} satisfies Meta<typeof ExpandableTile>
export default meta
type S = StoryObj<typeof meta>

/** Лицо: заголовок и не больше трёх фактов; остальное — под сгибом. */
export const Обычное: S = {}
/** Раскрыто. */
export const Раскрыто: S = { args: { expanded: true } }

/** Матрёшка: под сгибом такие же плитки, не глубже двух уровней. */
export const Сетка: S = {
  render: () => (
    <Grid narrow withRowGap>
      <Column sm={4} md={4} lg={5}>
        <ExpandableTile tileCollapsedLabel="Подробнее" tileExpandedLabel="Свернуть">
          <TileAboveTheFoldContent>
            <Inline justify="between">
              <p className="m-0 text-heading">Рассылка</p>
              <IconIndicator kind="caution-minor" label="меняется" />
            </Inline>
            <p className="m-0 text-body text-fg-muted">Хотят изменить текст</p>
          </TileAboveTheFoldContent>
          <TileBelowTheFoldContent>
            <p className="m-0 text-body">Черновик — у редактора.</p>
          </TileBelowTheFoldContent>
        </ExpandableTile>
      </Column>
      <Column sm={4} md={8} lg={6}>
        <ExpandableTile expanded tileCollapsedLabel="Подробнее" tileExpandedLabel="Свернуть">
          <TileAboveTheFoldContent>
            <Inline justify="between">
              <p className="m-0 text-heading">Интернет-магазин</p>
              <IconIndicator kind="not-started" label="не проверено" />
            </Inline>
            <p className="m-0 text-body text-fg-muted">2 модуля</p>
            <p className="m-0 text-body text-fg-muted">1 задача ждёт решения</p>
          </TileAboveTheFoldContent>
          <TileBelowTheFoldContent>
            <Grid narrow withRowGap>
              <Column sm={4} md={4} lg={8}>
                <ExpandableTile tileCollapsedIconText="Подробнее: сообщения">
                  <TileAboveTheFoldContent>
                    <Inline justify="between">
                      <p className="m-0 text-heading">Сообщения</p>
                      <IconIndicator kind="failed" label="падает" />
                    </Inline>
                  </TileAboveTheFoldContent>
                  <TileBelowTheFoldContent>
                    <p className="m-0 text-body">Подробности модуля.</p>
                  </TileBelowTheFoldContent>
                </ExpandableTile>
              </Column>
              <Column sm={4} md={4} lg={8}>
                <ExpandableTile tileCollapsedIconText="Подробнее: отзывы">
                  <TileAboveTheFoldContent>
                    <Inline justify="between">
                      <p className="m-0 text-heading">Отзывы</p>
                      <IconIndicator kind="succeeded" label="работает" />
                    </Inline>
                  </TileAboveTheFoldContent>
                  <TileBelowTheFoldContent>
                    <p className="m-0 text-body">Отвечено всё.</p>
                  </TileBelowTheFoldContent>
                </ExpandableTile>
              </Column>
            </Grid>
          </TileBelowTheFoldContent>
        </ExpandableTile>
      </Column>
    </Grid>
  ),
}
