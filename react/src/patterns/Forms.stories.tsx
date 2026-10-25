import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/forms.md?raw'
import { Accordion, AccordionItem } from '../components/Accordion'
import { Button, ButtonSet } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import { Form } from '../components/Form'
import { Heading } from '../components/Heading'
import { Icon } from '../components/Icon'
import { NumberInput } from '../components/NumberInput'
import { RadioButton, RadioButtonGroup } from '../components/RadioButton'
import { Select, SelectItem } from '../components/Select'
import { TextInput } from '../components/TextInput'
import { Toggle } from '../components/Toggle'
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipLabel } from '../components/Toggletip'
import { BottomBar, Page, PageHeader, Section, Stack } from '../components/layout'
import { pattern } from './story'

/** Настройки уведомлений: группы полей, поле настройки строкой, пустое — пустое, подсказка под полем, одна полоса сохранения. */
function Settings({ error }: { error?: string }) {
  const [days, setDays] = useState<number | string>(3)
  const [limit, setLimit] = useState<number | string>('')
  const changes = (days !== 2 ? 1 : 0) + (limit !== '' ? 1 : 0)
  return (
    <Page header={<PageHeader title="Уведомления" subtitle="Когда и как напоминать о сроках задач." />}>
      <Form id="notify" aria-label="Уведомления" onSubmit={(e) => e.preventDefault()}>
        <Stack gap={6}>
          <Section as={Stack} gap={5}>
            <Heading>Почта</Heading>
            <TextInput id="notify-email" labelText="Адрес для уведомлений" type="email" defaultValue="anna@example.com" helperText="Сюда придут напоминания и отчёты." />
            <Checkbox
              id="notify-digest"
              defaultChecked
              labelText={
                <>
                  <ToggletipLabel>Присылать сводку по понедельникам</ToggletipLabel>
                  <Toggletip>
                    <ToggletipButton label="Подробнее: сводка по понедельникам" />
                    <ToggletipContent>Сводка — список задач со сроком на этой неделе.</ToggletipContent>
                  </Toggletip>
                </>
              }
            />
          </Section>
          <Section as={Stack} gap={5}>
            <Heading>Напоминания</Heading>
            <NumberInput id="notify-days" inline label="Напоминать о сроке за" unit="дня" min={0} value={days} onChange={(_, { value }) => setDays(value)} />
            <NumberInput id="notify-limit" inline label="Не больше писем в день" unit="писем" helperText="Например, 10. Пусто — без предела." min={1} allowEmpty value={limit} onChange={(_, { value }) => setLimit(value)} />
            <Select id="notify-lang" inline labelText="Язык писем" defaultValue="ru">
              <SelectItem value="ru" text="Русский" />
              <SelectItem value="en" text="English" />
            </Select>
            <RadioButtonGroup name="notify-time" legendText="Когда присылать" defaultSelected="morning">
              <RadioButton labelText="Утром" value="morning" />
              <RadioButton labelText="Днём" value="day" />
              <RadioButton labelText="Вечером" value="evening" />
            </RadioButtonGroup>
            <Toggle id="notify-weekend" labelText="Напоминать в выходные" />
          </Section>
        </Stack>
      </Form>
      <Accordion>
        <AccordionItem title="Как работают напоминания">Письмо уходит в 9:00 по вашему поясу. Задача без срока не напоминает о себе.</AccordionItem>
      </Accordion>
      {(changes > 0 || error) && (
        <BottomBar>
          <ButtonSet aria-label="Сохранение">
            <Button kind="ghost">Отменить</Button>
            <Button type="submit" form="notify">
              {error ? 'Повторить' : 'Сохранить'}
            </Button>
          </ButtonSet>
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
