import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/forms.md?raw'
import { Accordion } from '../components/Accordion'
import { ActionArea, Button } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import { Icon } from '../components/Icon'
import { NumberField } from '../components/NumberField'
import { Select } from '../components/Select'
import { TextField } from '../components/TextField'
import { BottomBar, Page, PageHeader, Section } from '../components/layout'
import { pattern } from './story'

/** Настройки уведомлений: группы полей, поле настройки строкой, пустое — пустое, подсказка под полем, одна полоса сохранения. */
function Settings({ error }: { error?: string }) {
  const [days, setDays] = useState<number | null>(3)
  const [limit, setLimit] = useState<number | null>(null)
  const changes = (days !== 2 ? 1 : 0) + (limit !== null ? 1 : 0)
  return (
    <Page header={<PageHeader title="Уведомления" description="Когда и как напоминать о сроках задач." />}>
      <Section title="Почта">
        <TextField label="Адрес для уведомлений" type="email" defaultValue="anna@example.com" helperText="Сюда придут напоминания и отчёты." />
        <Checkbox label="Присылать сводку по понедельникам" defaultChecked help="Сводка — список задач со сроком на этой неделе." />
      </Section>
      <Section title="Напоминания">
        <NumberField inline label="Напоминать о сроке за" unit="дня" min={0} value={days} onChange={setDays} />
        <NumberField inline label="Не больше писем в день" unit="писем" helperText="Например, 10. Пусто — без предела." min={1} value={limit} onChange={setLimit} />
        <Select inline label="Язык писем" defaultValue="ru" options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]} />
      </Section>
      <div>
        <Accordion title="Как работают напоминания">Письмо уходит в 9:00 по вашему поясу. Задача без срока не напоминает о себе.</Accordion>
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

const Doc = pattern(md, Settings, true)
const meta = { title: 'Паттерны/Формы', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Есть правка: полоса внизу — «Сохранить», «Отменить» и сколько не сохранено. */
export const Обычное: S = {}
/** Не сохранилось: причина словами, главная — «Повторить», правки на месте. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { error: 'сервер не ответил за 30 с.' } }
