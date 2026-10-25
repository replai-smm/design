import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberField } from './NumberField'
import { SettingsSection } from './Settings'
import { Wizard } from './Wizard'
import { Page, PageHeader } from './layout'

const STEPS = ['Баллы', 'Уровни', 'Виджет', 'Запуск']

/** Мастер подключения сообщества Арены: шаги, содержимое шага, низ «Назад — Далее». */
function ConnectWizard({ start = 0, error }: { start?: number; error?: string }) {
  const [step, setStep] = useState(start)
  return (
    <Page header={<PageHeader title="Подключение сообщества" description="Четыре шага — и участники начнут получать баллы." />}>
      <Wizard label="Шаги подключения" steps={STEPS} current={step} error={error} onBack={() => setStep(step - 1)} onNext={() => setStep(Math.min(step + 1, STEPS.length - 1))}>
        <SettingsSection title={STEPS[step]} description={step === 0 ? 'Сколько баллов за каждое действие. Потом можно поменять.' : 'Содержимое шага рисует продукт.'}>
          <NumberField inline label="За лайк" unit="балл" defaultValue={1} min={0} />
          <NumberField inline label="За комментарий" unit="балла" defaultValue={3} min={0} />
        </SettingsSection>
      </Wizard>
    </Page>
  )
}

const meta = {
  title: 'Паттерны/Мастер',
  component: ConnectWizard,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConnectWizard>
export default meta
type S = StoryObj<typeof meta>

/** Первый шаг: «Назад» нет, одна главная «Далее». */
export const Обычное: S = {}
/** Середина пути: «Назад» и «Далее»; на телефоне шаги — одной строкой «Шаг 2 из 4 · Уровни». */
export const Середина: S = { args: { start: 1 } }
/** Дальше нельзя: причина словом у кнопки, шаг со знаком «опасно». */
export const Ошибка: S = { tags: ['state:ошибка'], args: { start: 2, error: 'Виджет не включился: у приложения нет права на виджет сообщества.' } }
