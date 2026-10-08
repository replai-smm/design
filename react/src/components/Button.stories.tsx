import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionArea, Button } from './Button'
import { Page, PageHeader, Stack } from './layout'

const meta = {
  title: 'Компоненты/Кнопка и область действий',
  component: ActionArea,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ActionArea>
export default meta
type S = StoryObj<typeof meta>

/** Все варианты: главная — только в области действий, одна; рядом — второстепенные и тихие. */
export const Варианты: S = {
  args: { primary: { label: 'Сохранить' } },
  render: (args) => (
    <Stack gap="06">
      <ActionArea {...args} label="Действия формы">
        <Button>Отменить</Button>
        <Button variant="tertiary">Черновик</Button>
        <Button variant="ghost">Подробнее</Button>
      </ActionArea>
      <ActionArea label="Опасное — без главной рядом">
        <Button variant="danger">Удалить группу</Button>
      </ActionArea>
      <ActionArea label="Размеры">
        <Button size="sm">Маленькая</Button>
        <Button size="md">Средняя</Button>
        <Button size="lg">Большая</Button>
        <Button disabled>Недоступна</Button>
      </ActionArea>
    </Stack>
  ),
}

/** Идёт действие: главная кнопка занята. */
export const Загрузка: S = {
  tags: ['state:загрузка'],
  args: { primary: { label: 'Сохраняем…', loading: true } },
  render: (args) => (
    <ActionArea {...args} label="Действия формы">
      <Button>Отменить</Button>
    </ActionArea>
  ),
}

/** Действия страницы: на телефоне — нижняя полоса во всю ширину (П6), на ноутбуке — под шапкой слева. */
export const НаСтранице: S = {
  args: { primary: { label: 'Подключить группу', rule: 'R-12' }, placement: 'bottom' },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <Page
      header={<PageHeader title="Группы" description="Какие группы клиентов отвечают и где чинить." />}
      actions={
        <ActionArea {...args} label="Действия страницы">
          <Button variant="ghost">Как подключить</Button>
        </ActionArea>
      }
    >
      <p className="m-0 text-body-01 text-text-secondary">Содержимое страницы.</p>
    </Page>
  ),
}
