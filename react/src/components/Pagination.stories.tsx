import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './Pagination'

const meta = {
  title: 'Компоненты/Коллекции/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
  args: { totalItems: 150, pageSize: 25, pageSizes: [10, 25, 50], className: 'max-w-window' },
} satisfies Meta<typeof Pagination>
export default meta
type S = StoryObj<typeof meta>

/** Сколько строк на странице, какие видны, выбор страницы и стрелки. */
export const Обычное: S = {}

function Unknown() {
  const [page, setPage] = useState(3)
  return <Pagination pagesUnknown page={page} pageSize={25} pageSizes={[25, 50]} isLastPage={page >= 5} onChange={(d) => setPage(d.page)} className="max-w-window" />
}
/** Число строк неизвестно: «страница N», вперёд — пока есть ещё. */
export const ЧислоНеизвестно: S = { render: () => <Unknown /> }
/** 2000 строк: выбор страницы — список номеров. */
export const Много: S = { tags: ['state:много'], args: { totalItems: 2000, page: 40 } }
