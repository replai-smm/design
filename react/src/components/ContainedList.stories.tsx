import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { allWorking, many, projects, type ProjectRow } from '../stories/fixtures'
import { Add, Close } from '../lib/icons.gen'
import { Button, IconButton } from './Button'
import { ContainedList, ContainedListItem } from './ContainedList'
import { SkeletonText } from './SkeletonText'
import { StateView } from './StateView'

const line = (r: ProjectRow) => (
  <span className="flex min-w-0 flex-col gap-tight">
    <span className="truncate text-fg">{r.name}</span>
    <span className="truncate text-caption text-fg-muted">
      {r.team} · {r.reason}
    </span>
  </span>
)

/** Проекты: подпись и «Добавить» у неё, строка — кнопка во всю ширину, открытая — `aria-current`. */
function Projects({ rows = projects, selected }: { rows?: ProjectRow[]; selected?: string }) {
  return (
    <ContainedList
      label="Проекты"
      className="max-w-wide"
      action={
        <Button kind="ghost" size="sm" renderIcon={Add}>
          Добавить
        </Button>
      }
    >
      {rows.map((r) => (
        <ContainedListItem
          key={r.id}
          onClick={() => {}}
          aria-current={r.id === selected || undefined}
          action={
            <IconButton kind="ghost" size="sm" label={`Убрать «${r.name}»`}>
              <Close />
            </IconButton>
          }
        >
          {line(r)}
        </ContainedListItem>
      ))}
    </ContainedList>
  )
}

const meta = {
  title: 'Компоненты/Коллекции/ContainedList',
  component: Projects,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Projects>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
/** Открытая строка — «выбрано» и aria-current (её карточка видна рядом). */
export const Выбрана: S = { args: { selected: 'p6' } }
/** Загрузка — скелет строк той же высоты; `aria-busy` — у области, которая грузит. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  render: () => (
    <div role="status" aria-busy="true" className="max-w-wide">
      <span className="sr-only">Проекты: загрузка</span>
      <ContainedList label="Проекты">
        {Array.from({ length: 5 }, (_, i) => (
          <ContainedListItem key={i}>
            <SkeletonText width={i % 2 ? '50%' : '75%'} />
          </ContainedListItem>
        ))}
      </ContainedList>
    </div>
  ),
}
/** Ошибка и пусто — StateView на месте строк. */
export const Ошибка: S = { tags: ['state:ошибка'], render: () => <StateView kind="ошибка" title="Список не загрузился" action={<Button kind="secondary">Повторить</Button>} /> }
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], render: () => <StateView kind="первый запуск" title="Проектов пока нет" /> }
export const ВсёСделано: S = { tags: ['state:всё сделано'], args: { rows: allWorking } }
export const НичегоНеНайдено: S = { tags: ['state:ничего не найдено'], render: () => <StateView kind="ничего не найдено" title="Ничего не найдено" action={<Button kind="secondary">Сбросить поиск</Button>} /> }
export const НетДоступа: S = { tags: ['state:нет доступа'], render: () => <StateView kind="нет доступа" title="Нет доступа к проектам" /> }

function ShowMore() {
  const [limit, setLimit] = useState(50)
  return (
    <div className="flex max-w-wide flex-col gap-items">
      <Projects rows={many.slice(0, limit)} />
      {limit < many.length && (
        <div>
          <Button kind="ghost" onClick={() => setLimit(limit + 50)}>
            Показать ещё · {many.length - limit}
          </Button>
        </div>
      )}
    </div>
  )
}
/** 150 строк: первые 50 и «Показать ещё» (паттерн «Обрезка содержимого»). */
export const Много: S = { tags: ['state:много'], render: () => <ShowMore /> }
