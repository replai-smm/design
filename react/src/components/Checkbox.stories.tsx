import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox, CheckboxGroup, type CheckedState } from './Checkbox'
import { Stack } from './layout'

const meta = {
  title: 'ДС/Галочка',
  component: Checkbox,
  parameters: { layout: 'padded' },
  args: { label: 'Лёгкий режим' },
} satisfies Meta<typeof Checkbox>
export default meta
type S = StoryObj<typeof meta>

/** Не отмечено, отмечено, частично. Нажимается вся строка с подписью. */
export const Обычное: S = {
  render: () => (
    <Stack gap="02">
      <Checkbox label="Лёгкий режим" />
      <Checkbox label="Отвечать на комментарии" defaultChecked helperText="Ответы уходят от имени сообщества" />
      <Checkbox label="Все сообщества" checked="indeterminate" />
    </Stack>
  ),
}

const groups = ['Кофейня «Зерно»', 'Студия йоги', 'Пекарня у дома', 'Цветы на Ленина']

function Group() {
  const [on, setOn] = useState<string[]>(groups.slice(0, 2))
  const all: CheckedState = on.length === groups.length ? true : on.length ? 'indeterminate' : false
  return (
    <CheckboxGroup legend="Куда опубликовать" helperText="Пост уйдёт во все отмеченные сообщества">
      <Checkbox label="Все сообщества" checked={all} onCheckedChange={(c) => setOn(c === true ? groups : [])} />
      {groups.map((g) => (
        <Checkbox key={g} label={g} checked={on.includes(g)} onCheckedChange={(c) => setOn((xs) => (c === true ? [...xs, g] : xs.filter((x) => x !== g)))} />
      ))}
    </CheckboxGroup>
  )
}

/** Группа: общая подпись (legend) — читалка называет её у каждой галочки; «все» — частично, пока отмечена не вся группа. */
export const Группа: S = { render: () => <Group /> }

export const Ошибка: S = {
  tags: ['state:ошибка'],
  render: () => (
    <Stack gap="06">
      <CheckboxGroup legend="Куда опубликовать" error="Отметьте хотя бы одно сообщество">
        {groups.slice(0, 2).map((g) => (
          <Checkbox key={g} label={g} />
        ))}
      </CheckboxGroup>
      <Checkbox label="Я проверил текст поста" error="Без проверки пост не уйдёт" />
    </Stack>
  ),
}

export const Недоступно: S = {
  render: () => (
    <Stack gap="06">
      <Checkbox label="Отвечать на комментарии" defaultChecked disabled helperText="Включает админ" />
      <CheckboxGroup legend="Права" disabled orientation="horizontal">
        <Checkbox label="Вычитка" defaultChecked />
        <Checkbox label="Чаты" />
      </CheckboxGroup>
    </Stack>
  ),
}
