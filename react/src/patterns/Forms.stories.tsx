import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Forms.md?raw'
import { Accordion } from '../components/Accordion'
import { ActionArea, Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { NumberField } from '../components/NumberField'
import { Select } from '../components/Select'
import { BottomBar, Page, PageHeader, Section } from '../components/layout'
import { PatternDoc } from './doc'

const points = (n: number | null) => {
  const v = n ?? 0
  const d = v % 10
  const h = v % 100
  return d === 1 && h !== 11 ? 'балл' : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'балла' : 'баллов'
}

/** «Условия начисления» Арены: группы, поля в строку, «i», пустое — пустое, «Как это работает», одна полоса сохранения. */
function Conditions({ edited = false, error }: { edited?: boolean; error?: string }) {
  const [like, setLike] = useState<number | null>(1)
  const [comment, setComment] = useState<number | null>(edited ? 4 : 3)
  const [firstLikes, setFirstLikes] = useState<number | null>(null)
  const changes = (comment !== 3 ? 1 : 0) + (like !== 1 ? 1 : 0) + (firstLikes !== null ? 1 : 0)
  return (
    <Page header={<PageHeader title="Условия начисления" description="За что участник получает баллы и сколько." />}>
      <Section title="Активность" description="Баллы за действия с записями сообщества.">
        <NumberField inline label="За лайк" unit={points(like)} min={0} value={like} onChange={setLike} />
        <NumberField inline label="За комментарий" unit={points(comment)} help="Засчитывается комментарий длиннее 10 символов. Удалённый комментарий снимает баллы." min={0} value={comment} onChange={setComment} />
        <NumberField inline label="Первых лайков у поста" unit="лайков" helperText="Например, 10. Пусто — все лайки." min={1} value={firstLikes} onChange={setFirstLikes} />
      </Section>
      <Section title="Период">
        <Select inline label="Длительность" defaultValue="month" options={[{ value: 'open', label: 'Бессрочно' }, { value: 'month', label: 'Месяц' }, { value: 'week', label: 'Неделя' }]} />
      </Section>
      <div>
        <Accordion title="Как это работает">Баллы приходят в течение минуты после действия. Правки действуют с момента сохранения: прошлые баллы не пересчитываются.</Accordion>
      </div>
      {(changes > 0 || error) && (
        <BottomBar>
          <ActionArea label="Сохранение" primary={{ label: error ? 'Повторить' : 'Сохранить' }}>
            <Button variant="ghost">Отменить</Button>
          </ActionArea>
          {error ? (
            <p role="alert" className="m-0 flex min-w-0 items-start gap-items text-body text-danger-fg">
              <Icon tone="опасно" />
              <span className="min-w-0">Не сохранилось: {error}</span>
            </p>
          ) : (
            <p className="m-0 text-body text-fg-muted">Не сохранено: {changes}</p>
          )}
        </BottomBar>
      )}
    </Page>
  )
}

function Doc(props: Parameters<typeof Conditions>[0]) {
  return (
    <PatternDoc md={md} page>
      <Conditions {...props} />
    </PatternDoc>
  )
}

const meta = {
  title: 'Паттерны/Формы',
  component: Doc,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Есть правка: полоса внизу — «Сохранить», «Отменить» и сколько не сохранено. */
export const Обычное: S = { args: { edited: true } }
/** Не сохранилось: причина словами, главная — «Повторить», правки на месте. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { edited: true, error: 'сервер не ответил за 30 с.' } }
