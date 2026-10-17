import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { groups, many, type GroupRow } from '../stories/fixtures'
import { ActionArea, Button } from './Button'
import { DataTable, type Column } from './Collection'
import { Dialog } from './Dialog'
import { FilterBar, type FilterValue } from './FilterBar'
import { Notification } from './Notification'
import { Page, PageHeader, Section, Stack } from './layout'
import type { DataState } from '../lib/vocab'

const columns: Column<GroupRow>[] = [
  { key: 'name', header: 'Группа', cell: (r) => r.name, face: true, grow: 2 },
  { key: 'reason', header: 'Что случилось', cell: (r) => r.reason, face: true, grow: 2 },
  { key: 'client', header: 'Клиент', cell: (r) => r.client },
]

/** Страница списка «Все группы»: шапка, плашка беды, главная, фильтры, таблица, окно строки. */
function GroupsScreen({ state = 'ready', rows = groups, notice = false }: { state?: DataState; rows?: GroupRow[]; notice?: boolean }) {
  const [filter, setFilter] = useState<FilterValue>({})
  const [open, setOpen] = useState<GroupRow | null>(null)
  return (
    <Page
      header={<PageHeader title="Все группы" tools={<Button variant="ghost" dense icon="menu" aria-label="ещё действия" />} />}
      notice={
        notice ? (
          <Notification tone="опасно" scope="page" title="VK не отвечает">
            Ответы стоят у всех клиентов с 14:20.
          </Notification>
        ) : undefined
      }
    >
      <ActionArea primary={{ label: 'Подключить группу', rule: 'R-12' }} label="Действия страницы" />
      <Section title="Группы клиентов">
        <Stack>
          <FilterBar filters={[{ key: 'клиент', label: 'Клиент', options: [{ value: 'зерно', label: 'Зерно' }, { value: 'асана', label: 'Асана' }] }]} value={filter} onChange={setFilter} search={{ label: 'Поиск по группам' }} />
          <DataTable
            label="Группы клиентов"
            rows={rows}
            columns={columns}
            state={state}
            error={{ title: 'Список не загрузился', onRetry: () => {} }}
            getKey={(r) => r.id}
            getStatus={(r) => r.status}
            onSelect={setOpen}
            selectedKey={open?.id}
            rowAction={(r) => (r.status === 'work.failing' ? <Button variant="ghost" dense>Починить</Button> : null)}
          />
        </Stack>
      </Section>
      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)} title={open?.name ?? ''} actions={<ActionArea primary={{ label: 'Обновить ключ' }} label="Действия окна" />}>
        <p className="m-0 text-body">{open?.reason}</p>
      </Dialog>
    </Page>
  )
}

const meta = {
  title: 'Паттерны/Страница списка',
  component: GroupsScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GroupsScreen>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
export const БедаСистемы: S = { args: { notice: true } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { state: 'loading' } }
export const Ошибка: S = { tags: ['state:ошибка'], args: { state: 'error' } }
export const Много: S = { tags: ['state:много'], args: { rows: many } }
