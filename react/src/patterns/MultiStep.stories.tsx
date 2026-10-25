import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/MultiStep.md?raw'
import { ActionArea, Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { NumberField } from '../components/NumberField'
import { Steps } from '../components/Steps'
import { BottomBar, Page, PageHeader, Section } from '../components/layout'
import { PatternDoc } from './doc'

const STEPS = ['Баллы', 'Уровни', 'Виджет', 'Запуск']

/** Подключение сообщества Арены: шаги, содержимое шага, внизу «Назад» и «Далее». */
function Connect({ start = 0, error }: { start?: number; error?: string }) {
  const [step, setStep] = useState(start)
  const last = step === STEPS.length - 1
  return (
    <Page header={<PageHeader title="Подключение сообщества" description="Четыре шага — и участники начнут получать баллы." />}>
      <Steps label="Шаги подключения" steps={STEPS} current={step} errorAt={error ? step : undefined} onStepClick={setStep} />
      <Section title={STEPS[step]} description="Сколько баллов за каждое действие. Потом можно поменять.">
        <NumberField inline label="За лайк" unit="балл" defaultValue={1} min={0} />
        <NumberField inline label="За комментарий" unit="балла" defaultValue={3} min={0} />
      </Section>
      <BottomBar>
        <ActionArea label="Шаги" primary={{ label: last ? 'Подключить' : 'Далее', onClick: () => setStep(Math.min(step + 1, STEPS.length - 1)) }}>
          {step > 0 && (
            <Button variant="ghost" icon="arrow-left" onClick={() => setStep(step - 1)}>
              Назад
            </Button>
          )}
        </ActionArea>
        {error && (
          <p role="alert" className="m-0 flex min-w-0 items-start gap-items text-body text-danger-fg">
            <Icon tone="опасно" />
            <span className="min-w-0">{error}</span>
          </p>
        )}
      </BottomBar>
    </Page>
  )
}

function Doc(props: Parameters<typeof Connect>[0]) {
  return (
    <PatternDoc md={md} page>
      <Connect {...props} />
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Пошаговое создание', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

/** Середина пути: пройденный шаг — галочкой и нажимается, «Назад» и «Далее». */
export const Обычное: S = { args: { start: 1 } }
/** Дальше нельзя: причина словом у кнопки, шаг со знаком «опасно». */
export const Ошибка: S = { tags: ['state:ошибка'], args: { start: 2, error: 'Виджет не включился: у приложения нет права на виджет сообщества.' } }
