// Примеры чата с агентом для историй ДС: команда, ответ, шаги, решения, схема. Всё — «пример», не живые данные.
import type { CommandItem } from '../components/CommandMenu'
import type { DiagramEdge, DiagramNode } from '../components/Diagram'

export const testRun = `$ npm test

 ✓ src/export/csv.test.ts (6)
 ✓ src/comments/list.test.ts (14)

 Test Files  2 passed (2)
      Tests  20 passed (20)
   Duration  3.21s`

export const csvCode = `export function toCsv(rows: Comment[]): string {
  const head = ['id', 'автор', 'текст', 'дата']
  const lines = rows.map((r) => [r.id, r.author, quote(r.text), r.date.toISOString()])
  return [head, ...lines].map((l) => l.join(';')).join('\\n')
}`

export const commands: CommandItem[] = [
  { value: '/clear', group: 'Команды', description: 'начать разговор заново' },
  { value: '/compact', group: 'Команды', description: 'сжать историю сессии' },
  { value: '/model', group: 'Команды', description: 'сменить модель' },
  { value: '/review', group: 'Команды', description: 'ревью изменений ветки' },
  { value: '/intent', group: 'Скиллы', description: 'интент из «хочу» человека' },
  { value: '/event', group: 'Скиллы', description: 'событие в приёмную orbit' },
  { value: '/karta-build', group: 'Скиллы', description: 'построить Карту продукта' },
]

export const ringNodes: DiagramNode[] = [
  { id: 'input', label: 'Вход', kind: 'group', at: [0.22, 0.16], items: [{ id: 'input/people', label: 'люди', value: '2' }, { id: 'input/probe', label: 'датчик прода', value: '5 мин', tone: 'warning' }] },
  { id: 'event', label: 'Событие', value: '3', at: [0.7, 0.13] },
  { id: 'process', label: 'Обработка', value: '1', at: [0.86, 0.5] },
  { id: 'execution', label: 'Исполнение', value: '4', at: [0.66, 0.85], dots: [{ id: 'n5t2vd', label: 'n5t2vd · экспорт в CSV' }, { id: 'k8w1qa', label: 'k8w1qa · фильтр по дате', tone: 'error' }] },
  { id: 'output', label: 'Выход', kind: 'group', at: [0.22, 0.76], items: [{ id: 'output/shtab', label: 'Штаб', value: '0' }, { id: 'output/chat', label: 'Чат', value: '1' }] },
  { id: 'core', label: 'replai', kind: 'core', at: [0.5, 0.47], items: [{ id: 'core/karta', label: 'Карта' }, { id: 'core/memory', label: 'Память' }] },
]
export const ringEdges: DiagramEdge[] = [
  { from: 'input', to: 'event' },
  { from: 'event', to: 'process' },
  { from: 'process', to: 'execution' },
  { from: 'execution', to: 'output' },
  { from: 'output', to: 'event' },
]
