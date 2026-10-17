import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { CodeBlock } from './CodeBlock'
import { DecisionCard } from './DecisionCard'
import { Notification } from './Notification'
import { Stack } from './layout'

const meta = {
  title: 'Паттерны/Карточка решения',
  component: DecisionCard,
  parameters: { layout: 'padded' },
  args: { title: 'Bash: npm test', primary: { label: 'Разрешить' } },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof DecisionCard>
export default meta
type S = StoryObj<typeof meta>

/** Разрешение агенту и решение по изменению: главная — одна, рядом тихие; отвеченная — слово и время, кнопок нет. */
export const Обычное: S = {
  render: () => (
    <Stack gap="05">
      <DecisionCard
        kicker="Разрешение"
        title="Bash: npm test"
        detail={<CodeBlock code="npm test -- --run src/export" label="команда" copy={false} />}
        question="Агент хочет запустить команду в replai."
        primary={{ label: 'Разрешить' }}
        actions={<Button variant="tertiary">Запретить</Button>}
      />
      <DecisionCard
        kicker="Изменение n5t2vd"
        title="Экспорт комментариев в CSV"
        facts={['собрано и проверено: 20 тестов, приёмка пройдена', 'PR 418 · CI зелёный']}
        question="На прод?"
        primary={{ label: 'На прод' }}
        actions={
          <>
            <Button variant="tertiary">Назад</Button>
            <Button variant="ghost">Не делаем</Button>
          </>
        }
      />
      <DecisionCard kicker="Разрешение" title="Bash: rm -rf dist" primary={{ label: 'Разрешить' }} answered={{ word: 'Запрещено', time: '14:02', tone: 'error' }} />
    </Stack>
  ),
}

/** Ответ уходит: главная занята и не нажимается второй раз, остальные кнопки на месте. */
export const ОтветУходит: S = {
  tags: ['state:загрузка'],
  args: { kicker: 'Изменение n5t2vd', title: 'Экспорт комментариев в CSV', question: 'На прод?', primary: { label: 'На прод', loading: true }, actions: <Button variant="tertiary">Назад</Button> },
}

/** Ответ не ушёл: над карточкой плашка с причиной, кнопки живы — можно нажать ещё раз. */
export const ОтветНеУшёл: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="03">
      <Notification tone="error" scope="list" title="Ответ не ушёл">
        orbit не отвечает: решение не записано, нажмите ещё раз.
      </Notification>
      <DecisionCard kicker="Изменение n5t2vd" title="Экспорт комментариев в CSV" question="На прод?" primary={{ label: 'На прод' }} actions={<Button variant="tertiary">Назад</Button>} />
    </Stack>
  ),
}
