import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { communities, manyCommunities, monthColumns, proofCell, type Community } from '../stories/df-fixtures'
import { GridLegend, ProofreadGrid, type ProofreadGridProps } from './ProofreadGrid'

const legend = (
  <GridLegend
    items={[{ tone: 'success', label: 'норма' }, { tone: 'neutral', label: 'сверх плана' }, { tone: 'warning', label: 'недобор' }, { tone: 'error', label: 'пропуск' }, { tone: 'future', label: 'впереди' }]}
    note="возможен перенос"
  />
)

const base: ProofreadGridProps<Community> = {
  label: 'Посты по дням, октябрь 2026',
  rowHeader: 'Сообщество',
  columns: monthColumns,
  rows: communities,
  getKey: (c) => c.id,
  renderRowHeader: (c) => c.name,
  getCell: proofCell,
  toneLabels: { success: 'норма' },
  legend,
}

function Selectable(props: Partial<ProofreadGridProps<Community>>) {
  const [sel, setSel] = useState<string | undefined>('c2')
  return <ProofreadGrid {...base} {...props} selectedKey={sel} onRowClick={(c) => setSel(c.id === sel ? undefined : c.id)} />
}

const meta = {
  title: 'Компоненты/Сетка сверки',
  component: ProofreadGrid<Community>,
  parameters: { layout: 'padded' },
  args: base,
} satisfies Meta<typeof ProofreadGrid<Community>>
export default meta
type S = StoryObj<typeof meta>

/** Сообщество × день: в клетке «вышло/норма», тон — токен статуса, жёлтая черта — «возможен перенос». */
export const Обычное: S = { render: (a) => <Selectable {...a} /> }

export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }

export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error', error: { title: 'Сверка не посчиталась', description: 'Таблица плана недоступна.', onRetry: () => {} } } }

export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], args: { rows: [], empty: { kind: 'ничего не найдено', title: 'По выбранному фильтру проектов нет' } } }

/** 70 сообществ: первые 20 и «показать ещё» (в продукте шаг — 50). Шапка дней стоит при прокрутке рамки вниз. */
export const Много: S = { tags: ['state:много'], args: { rows: manyCommunities, pageSize: 20 } }

const KM = ['Алёна', 'Борис', 'Вера']
/** Колонки без тона: КМ слева и итоги справа («план», «вышло») — просто значения, без цвета и слова тона. */
export const СКолонкамиИтогов: S = {
  args: {
    rows: manyCommunities.slice(0, 30),
    columns: [{ key: 'km', label: 'КМ', plain: true }, ...monthColumns, { key: 'plan', label: 'план', plain: true }, { key: 'fact', label: 'вышло', plain: true }],
    getCell: (c, col) => {
      const i = Number(c.id.replace(/\D/g, ''))
      if (col.key === 'km') return { value: KM[i % 3] }
      const past = c.out.slice(0, 4)
      if (col.key === 'plan') return { value: c.norm * past.length, hint: 'сумма норм за прошедшие дни' }
      if (col.key === 'fact') return { value: past.reduce((a, b) => a + b, 0) }
      return proofCell(c, col)
    },
  },
}
