import type { Meta, StoryObj } from '@storybook/react-vite'
import { STATUS_IDS } from '../lib/vocab'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Элементы/Метка статуса',
  component: StatusBadge,
  parameters: { layout: 'padded' },
  args: { status: 'work.failing' },
} satisfies Meta<typeof StatusBadge>
export default meta
type S = StoryObj<typeof meta>

/** Закрытый список: слово закона, знак тона. Подложка — только у «опасно» и «внимание». */
export const Статусы: S = {
  render: () => (
    <div className="flex flex-wrap gap-items">
      {STATUS_IDS.map((id) => (
        <StatusBadge key={id} status={id} />
      ))}
    </div>
  ),
}

/** Тон со своим словом: светофор, оценка поста. */
export const Тон: S = {
  render: () => (
    <div className="flex flex-wrap gap-items">
      <StatusBadge tone="опасно" label="горит" />
      <StatusBadge tone="внимание" label="ниже среднего" />
      <StatusBadge tone="инфо" label="лёгкий режим" />
      <StatusBadge tone="нейтрально" label="не запускался" />
      <StatusBadge tone="хорошо" label="ключ работает" />
    </div>
  ),
}
