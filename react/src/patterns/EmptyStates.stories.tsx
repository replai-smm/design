import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/empty-states.md?raw'
import { ActionArea, Button } from '../components/Button'
import { StateView } from '../components/StateView'
import { Stack } from '../components/layout'
import { pattern } from './story'

function Example() {
  return (
    <Stack gap="blocks" className="p-blocks">
      <StateView kind="первый запуск" title="Создайте первый проект" description="Задачи и отчёты проекта появятся здесь." action={<ActionArea primary={{ label: 'Создать проект' }} />} />
      <StateView kind="всё сделано" title="Все задачи закрыты" description="Новые появятся здесь сами." />
      <StateView kind="ничего не найдено" title="По фильтру ничего" action={<Button>Сбросить фильтры</Button>} />
      <StateView kind="нет доступа" title="Нет доступа к проекту" description="Попросите владельца проекта добавить вас в команду." />
      <StateView kind="ошибка" title="Список не загрузился" description="Сервер не ответил за 30 с." action={<Button>Повторить</Button>} />
    </Stack>
  )
}

const Doc = pattern(md, Example)
const meta = { title: 'Паттерны/Пустые состояния', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Нет данных, после действия, ошибка: что здесь будет и один следующий шаг. */
export const Обычное: S = {}
