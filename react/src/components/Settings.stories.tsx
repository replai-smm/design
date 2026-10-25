import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { NumberField } from './NumberField'
import { SaveBar } from './SaveBar'
import { Select } from './Select'
import { HowItWorks, SettingsSection } from './Settings'
import { Loading, Skeleton } from './Skeleton'
import { StateView } from './StateView'
import { Page, PageHeader, Stack } from './layout'

const points = (n: number | null) => {
  const v = n ?? 0
  const d = v % 10
  const h = v % 100
  return d === 1 && h !== 11 ? 'балл' : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'балла' : 'баллов'
}

interface Form {
  like: number | null
  comment: number | null
  repost: number | null
  perDay: number | null
  minLength: number | null
  period: string
}
const SAVED: Form = { like: 1, comment: 3, repost: 5, perDay: 100, minLength: 10, period: 'month' }
const diff = (a: Form, b: Form) => (Object.keys(a) as (keyof Form)[]).filter((k) => a[k] !== b[k]).length

/** «Условия начисления» админки Арены: лист разделов, поля в строку, подробности по «?», одна панель сохранения. */
function ConditionsScreen({ draft = {}, error, loading, empty }: { draft?: Partial<Form>; error?: string; loading?: boolean; empty?: boolean }) {
  const [saved, setSaved] = useState(SAVED)
  const [form, setForm] = useState<Form>({ ...SAVED, ...draft })
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch })
  const skeleton = (
    <Loading>
      <Stack gap="items">
        <Skeleton width="1/3" />
        <Skeleton />
        <Skeleton />
      </Stack>
    </Loading>
  )
  return (
    <Page header={<PageHeader title="Условия начисления" description="За что участник получает баллы и сколько." />}>
      <SettingsSection title="Активность" description="Баллы за действия с записями сообщества." help="Действие засчитывается один раз на запись: второй лайк той же записи баллов не даёт.">
        {loading ? (
          skeleton
        ) : empty ? (
          <StateView kind="первый запуск" title="Баллы пока ни за что не начисляются" description="Добавьте первое действие — участники начнут получать баллы." action={<Button icon="add">Добавить действие</Button>} />
        ) : (
          <>
            <NumberField inline label="За лайк" unit={points(form.like)} min={0} value={form.like} onChange={(like) => set({ like })} />
            <NumberField
              inline
              label="За комментарий"
              unit={points(form.comment)}
              help="Засчитывается комментарий длиннее минимальной длины. Удалённый комментарий снимает баллы."
              min={0}
              value={form.comment}
              onChange={(comment) => set({ comment })}
            />
            <NumberField inline label="За репост" unit={points(form.repost)} min={0} value={form.repost} onChange={(repost) => set({ repost })} />
          </>
        )}
      </SettingsSection>
      <SettingsSection title="Период" description="Сколько длится конкурс.">
        {loading ? (
          skeleton
        ) : (
          <Select
            inline
            label="Длительность"
            options={[
              { value: 'open', label: 'Бессрочно' },
              { value: 'month', label: 'Месяц' },
              { value: 'week', label: 'Неделя' },
            ]}
            value={form.period}
            onChange={(period) => set({ period })}
          />
        )}
      </SettingsSection>
      <SettingsSection quiet title="Ограничения" description="Защита от накрутки.">
        {loading ? (
          skeleton
        ) : (
          <>
            <NumberField inline label="Не больше в сутки" unit={points(form.perDay)} help="Сверх предела действия за сутки баллов не дают. Пусто — без предела." min={1} value={form.perDay} onChange={(perDay) => set({ perDay })} />
            <NumberField inline label="Комментарий не короче" unit="символов" min={1} value={form.minLength} onChange={(minLength) => set({ minLength })} />
          </>
        )}
      </SettingsSection>
      <HowItWorks
        items={[
          'Баллы приходят в течение минуты после действия.',
          'Правки действуют с момента сохранения: прошлые баллы не пересчитываются.',
          'Участник видит свои баллы и место в рейтинге в приложении сообщества.',
        ]}
      />
      <SaveBar changes={diff(form, saved)} error={error} onSave={() => setSaved(form)} onReset={() => setForm(saved)} />
    </Page>
  )
}

const meta = {
  title: 'Паттерны/Страница настроек',
  component: ConditionsScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConditionsScreen>
export default meta
type S = StoryObj<typeof meta>

/** Всё сохранено: на ноутбуке тихая строка внизу, на телефоне полосы нет. */
export const Обычное: S = {}
/** Есть правки: счётчик, «Отменить» и главная «Сохранить». */
export const ЕстьПравки: S = { args: { draft: { comment: 4, perDay: 150 } } }
/** Не сохранилось: причина у кнопки, главная — «Повторить», правки на месте. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { draft: { comment: 4 }, error: 'Сервер не ответил за 30 с. Правки на месте — попробуйте ещё раз.' } }
export const Загрузка: S = { tags: ['state:загрузка'], args: { loading: true } }
/** Раздел пуст: что это и одно действие. */
export const ПервыйЗапуск: S = { tags: ['state:первый запуск'], args: { empty: true } }
