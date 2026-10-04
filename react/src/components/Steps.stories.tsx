import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Steps } from './Steps'
import { Stack } from './layout'

const PUBLISH = ['Текст', 'Куда', 'Предпросмотр', 'Итог']

const meta = {
  title: 'Компоненты/Шаги',
  component: Steps,
  parameters: { layout: 'padded' },
  args: { steps: PUBLISH, current: 1, label: 'Шаги публикации' },
} satisfies Meta<typeof Steps>
export default meta
type S = StoryObj<typeof meta>

/** Публикация в DF: текст готов, выбираем, куда. На телефоне — «Шаг 2 из 4 · Куда». */
export const Обычное: S = { args: { details: { 0: '312 знаков', 1: 'выбрано 12' } } }

/** Назад к пройденному шагу — кнопкой; шаги впереди не нажимаются. */
export const СВозвратом: S = {
  render: function Back(args) {
    const [cur, setCur] = useState(2)
    return (
      <Stack gap="04">
        <Steps {...args} current={cur} onStepClick={setCur} />
        <p className="m-0 text-body-compact-01 text-text-secondary">Сейчас: {PUBLISH[cur]}</p>
      </Stack>
    )
  },
}

/** Итог с ошибками: последний шаг — знак «опасно» и слово. */
export const Ошибка: S = { tags: ['state:ошибка'], args: { current: 3, errorAt: 3, details: { 3: '✓ 10 · ✗ 2' } } }

/** Всё пройдено: итог без ошибок. */
export const Готово: S = { tags: ['state:всё сделано'], args: { current: 3 } }
