import type { Meta, StoryObj } from '@storybook/react-vite'
import { SaveBar } from './SaveBar'
import { Page, PageHeader } from './layout'

const meta = {
  title: 'Паттерны/Панель сохранения',
  component: SaveBar,
  parameters: { layout: 'fullscreen' },
  args: { changes: 2, onSave: () => {}, onReset: () => {} },
  render: (args) => (
    <Page header={<PageHeader title="Период конкурса" />}>
      <SaveBar {...args} />
    </Page>
  ),
} satisfies Meta<typeof SaveBar>
export default meta
type S = StoryObj<typeof meta>

/** Есть правки: счётчик словами, «Отменить» и главная «Сохранить». */
export const Обычное: S = {}
/** Всё сохранено: тихая строка на ноутбуке; на телефоне полосы нет. */
export const Сохранено: S = { tags: ['state:всё сделано'], args: { changes: 0 } }
export const Сохраняется: S = { tags: ['state:загрузка'], args: { saving: true } }
/** Не сохранилось: знак и слово, причина строкой, главная — «Повторить». */
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: 'Сервер не ответил за 30 с. Правки на месте — попробуйте ещё раз.' } }
