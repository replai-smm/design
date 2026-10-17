import type { Meta, StoryObj } from '@storybook/react-vite'
import { communities, manyCommunities, monthColumns, proofCell, type Community } from '../stories/df-fixtures'
import { GridLegend, ProofreadGrid, StatusRow, type GridColumn } from './ProofreadGrid'

const legend = (
  <GridLegend
    items={[
      { tone: 'опасно', label: 'пропуск' },
      { tone: 'внимание', label: 'недобор' },
      { tone: 'хорошо', label: 'в норме' },
      { tone: 'нейтрально', label: 'сверх плана' },
      { quiet: true, label: 'впереди' },
    ]}
    note="возможен перенос"
  />
)

const meta = {
  title: 'Коллекции/Сетка сверки',
  component: ProofreadGrid<Community>,
  parameters: { layout: 'padded' },
  args: {
    label: 'Посты по дням, октябрь',
    rowHeader: 'Сообщество',
    columns: monthColumns,
    rows: communities,
    getKey: (r: Community) => r.id,
    renderRowHeader: (r: Community) => r.name,
    getCell: proofCell,
    onSelect: () => {},
    legend,
  },
} satisfies Meta<typeof ProofreadGrid<Community>>
export default meta
type S = StoryObj<typeof meta>

/** Сетка статуса: клетка залита тоном статуса — читается с одного взгляда; слово — для читалки. */
export const Обычное: S = { args: { selectedKey: 'c2' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Сверка не загрузилась', onRetry: () => {} } } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'Сообществ по фильтру нет' } } }
export const Много: S = { tags: ['state:много'], args: { rows: manyCommunities } }

interface Project {
  id: string
  name: string
  money: number[]
}
const months: GridColumn[] = ['янв', 'фев', 'мар', 'апр', 'май', 'июн'].map((m) => ({ key: m, label: m, plain: true, money: true }))
const projects: Project[] = communities.map((c, i) => ({ id: c.id, name: c.name, money: months.map((_, m) => 120000 + i * 35000 + m * 9000) }))
const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

/** Матрица денег (Статистика): значения вправо в одну строку, разница без тона, итог-строка. */
export const Деньги: S = {
  render: () => (
    <ProofreadGrid<Project>
      label="Выручка по месяцам"
      rowHeader="Проект"
      columns={months}
      rows={projects}
      getKey={(r) => r.id}
      renderRowHeader={(r) => r.name}
      getCell={(r, c) => {
        const i = months.indexOf(c)
        return { value: rub(r.money[i]!), delta: i ? { value: ((r.money[i]! - r.money[i - 1]!) / r.money[i - 1]!) * 100 } : undefined }
      }}
      totals={{ label: 'Итого', getCell: (c) => ({ value: rub(projects.reduce((n, p) => n + p.money[months.indexOf(c)]!, 0)) }) }}
    />
  ),
}

/** День сетки развёрнутым (DF «Вычитка», посты по дням): строка залита тем же тоном, что клетка дня. */
export const СтрокиСтатуса: S = {
  render: () => (
    <div className="flex max-w-page flex-col gap-items">
      <StatusRow tone="хорошо" title={<><b>1-е</b> · план выполнен · вышло 2 из 2</>}>
        <p className="m-0 pl-blocks text-body">12:00 · Акция · Пост 1</p>
        <p className="m-0 pl-blocks text-body">
          18:30 · <span className="text-caption text-fg-muted">рубрика не распознана</span>
        </p>
      </StatusRow>
      <StatusRow tone="опасно" title={<><b>2-е</b> · пропуск - постов не было · вышло 0 из 2</>} />
      <StatusRow tone="внимание" title={<><b>3-е</b> · недобор · вышло 1 из 2 · возможен перенос</>} />
      <StatusRow tone="нейтрально" title={<><b>5-е</b> · сверх плана · вышло 3 из 2</>} />
      <StatusRow title={<><b>4-е</b> · нет нормы в плане</>} />
    </div>
  ),
}
