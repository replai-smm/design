import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountBadge } from './CountBadge'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './Tabs'

const panel = (t: string) => <p className="m-0 text-body text-fg-muted">{t}</p>

const meta = {
  title: 'Компоненты/Составные/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  args: {
    children: (
      <>
        <TabList aria-label="Разделы">
          <Tab>
            Ждут ответа <CountBadge count={7} tone="опасно" />
          </Tab>
          <Tab>
            Новые <CountBadge count={3} tone="инфо" />
          </Tab>
          <Tab>
            Отвечено <CountBadge count={120} />
          </Tab>
          <Tab>Все</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{panel('Семь сообщений без ответа больше часа.')}</TabPanel>
          <TabPanel>{panel('Три новых.')}</TabPanel>
          <TabPanel>{panel('Отвеченные за неделю.')}</TabPanel>
          <TabPanel>{panel('Все переписки.')}</TabPanel>
        </TabPanels>
      </>
    ),
  },
} satisfies Meta<typeof Tabs>
export default meta
type S = StoryObj<typeof meta>

/** Линейные вкладки (по умолчанию): выбранная подчёркнута; счётчик — CountBadge в слове вкладки. */
export const Обычное: S = {}

const sections = ['Обзор', 'Сообщения', 'Задачи', 'Файлы', 'Отчёты', 'Заказы', 'Оплата', 'Команда', 'Профиль', 'Настройки']

/** Много разделов: на телефоне — одна строка с прокруткой без полосы, выбранная вкладка в поле зрения. */
export const Много: S = {
  tags: ['state:много'],
  args: {
    defaultSelectedIndex: 8,
    children: (
      <>
        <TabList aria-label="Разделы">
          {sections.map((v) => (
            <Tab key={v}>
              {v}
              {v === 'Сообщения' && <CountBadge count={12} tone="опасно" />}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {sections.map((v) => (
            <TabPanel key={v}>{panel(`Раздел «${v}».`)}</TabPanel>
          ))}
        </TabPanels>
      </>
    ),
  },
}

/** `contained` — ряд сегментов в рамке (как у ContentSwitcher): вкладки внутри содержимого, а не под заголовком страницы. */
export const Contained: S = {
  render: () => (
    <Tabs>
      <TabList aria-label="Разделы" contained>
        <Tab>Ждут ответа</Tab>
        <Tab>Новые</Tab>
        <Tab>Отвечено</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>{panel('Ждут ответа.')}</TabPanel>
        <TabPanel>{panel('Новые.')}</TabPanel>
        <TabPanel>{panel('Отвечено.')}</TabPanel>
      </TabPanels>
    </Tabs>
  ),
}
