import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/EmptyStates.md?raw'
import { ActionArea, Button } from '../components/Button'
import { StateView } from '../components/StateView'
import { Stack } from '../components/layout'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="blocks" className="p-blocks">
        <StateView kind="первый запуск" title="Подключите первую группу" description="Комментарии группы начнут приходить сюда." action={<ActionArea primary={{ label: 'Подключить группу' }} />} />
        <StateView kind="всё сделано" title="Все комментарии отвечены" description="Новые появятся здесь сами." />
        <StateView kind="ничего не найдено" title="По фильтру ничего" action={<Button>Сбросить фильтры</Button>} />
        <StateView kind="нет доступа" title="Нет доступа к клиенту" description="Попросите владельца агентства добавить вас к клиенту." />
        <StateView kind="ошибка" title="Список не загрузился" description="Сервер не ответил за 30 с." action={<Button>Повторить</Button>} />
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Пустые состояния', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Пять состояний вместо данных: у каждого — что здесь будет и один следующий шаг. */
export const Обычное: S = {}
