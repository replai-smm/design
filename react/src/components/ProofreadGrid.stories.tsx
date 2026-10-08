import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { communities, manyCommunities, monthColumns, proofCell, type Community } from '../stories/df-fixtures'
import { GridLegend, ProofreadGrid, type GridColumn, type ProofreadGridProps } from './ProofreadGrid'

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

/* ——— Широкая матрица (Статистика) ——— */

const rub = (n: number | null) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
interface Project {
  id: string
  name: string
  spend: Array<number | null>
}
const projects: Project[] = ['Кофейня «Зерно»', 'Студия йоги', 'Автосервис «Ключ»', 'Детский клуб', 'Барбершоп', 'Цветы на Ленина', 'Пекарня у дома'].map((name, p) => ({
  id: `p${p}`,
  name,
  spend: MONTHS.map((_, m) => (m > 8 || (p === 4 && m < 3) ? null : Math.round((40 + p * 7 + ((m * (p + 3)) % 11) * 3) * 1000))),
}))
const monthCols: GridColumn[] = MONTHS.map((m, i) => ({ key: String(i), label: m, title: `${m} 2026`, plain: true, width: 'money' }))
const pct = (a: number | null, b: number | null) => (a == null || b == null || b === 0 ? undefined : ((a - b) / b) * 100)

/**
 * «Динамика по месяцам»: проект × месяц, деньги вправо, Δ к прошлому месяцу рядом с числом без тона, итог-строка
 * внизу — стоит при прокрутке вместе с шапкой; первая колонка закреплена.
 */
const matrix: ProofreadGridProps<Project> = {
  label: 'Динамика по месяцам, 2026, без НДС',
  rowHeader: 'Проект',
  columns: monthCols,
  rows: projects,
  getKey: (p: Project) => p.id,
  renderRowHeader: (p: Project) => p.name,
  getCell: (p: Project, c: GridColumn) => {
    const i = Number(c.key)
    const v = p.spend[i]
    const d = i > 0 ? pct(v, p.spend[i - 1]) : undefined
    return { value: rub(v), delta: d === undefined ? undefined : { value: d } }
  },
  totals: {
    label: 'Итого',
    getCell: (c: GridColumn) => {
      const sum = projects.reduce((a, p) => a + (p.spend[Number(c.key)] ?? 0), 0)
      return { value: sum ? rub(sum) : '—' }
    },
  },
}

const dayCols: GridColumn[] = [
  ...Array.from({ length: 30 }, (_, i): GridColumn => ({ key: `d${i}`, label: `${String(i + 1).padStart(2, '0')}.09`, plain: true })),
  { key: 'sum', label: 'Итого', plain: true },
]
const ads = (p: number, d: number) => ((p * 7 + d * 3) % 5 === 0 ? 0 : (p + d) % 4)

/** «Объявления по дням»: проект × 30 дней, «—» за ноль, колонка «Итого» и строка «Итого по дню». */
const byDay: ProofreadGridProps<Project> = {
  label: 'Создано объявлений, последние 30 дней',
  rowHeader: 'Проект',
  columns: dayCols,
  rows: projects,
  getKey: (p: Project) => p.id,
  renderRowHeader: (p: Project) => p.name,
  getCell: (p: Project, c: GridColumn) => {
    const pi = Number(p.id.slice(1))
    const n = c.key === 'sum' ? Array.from({ length: 30 }, (_, d) => ads(pi, d)).reduce((a, b) => a + b, 0) : ads(pi, Number(c.key.slice(1)))
    return { value: n || '—' }
  },
  totals: {
    label: 'Итого по дню',
    getCell: (c: GridColumn) => {
      const day = (d: number) => projects.reduce((a, _, pi) => a + ads(pi, d), 0)
      return { value: c.key === 'sum' ? Array.from({ length: 30 }, (_, d) => day(d)).reduce((a, b) => a + b, 0) : day(Number(c.key.slice(1))) || '—' }
    },
  },
}

/** Широкая матрица «Динамика по месяцам»: деньги вправо, Δ без тона рядом с числом, итог-строка стоит внизу. */
export const Матрица: S = { render: () => <ProofreadGrid<Project> {...matrix} /> }

/** Широкая матрица «Объявления по дням»: 30 дней и «Итого», строка «Итого по дню». */
export const МатрицаПоДням: S = { render: () => <ProofreadGrid<Project> {...byDay} /> }
