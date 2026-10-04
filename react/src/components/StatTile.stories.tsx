import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inline } from './layout'
import { StatTile } from './StatTile'

const meta = {
  title: 'Компоненты/Плитка с цифрой',
  component: StatTile,
  parameters: { layout: 'padded' },
  args: { value: '17', label: 'сообществ' },
} satisfies Meta<typeof StatTile>
export default meta
type S = StoryObj<typeof meta>

/** Пульс: плитки-переходы в строку; плитка здоровья не нажимается; беда — знаком и словом. */
export const Обычное: S = {
  render: () => (
    <Inline gap="03">
      <StatTile value="17" label="сообществ" detail="· не ведём 2" alert={{ tone: 'error', text: '2 без доступа' }} onClick={() => {}} />
      <StatTile value="12" label="неотв. диалогов" onClick={() => {}} />
      <StatTile value="48" label="ответов/нед" detail="· 3,1 ч" onClick={() => {}} />
      <StatTile value="2/3" label="событий нет" alert={{ tone: 'error', text: 'лёгкий режим' }} />
    </Inline>
  ),
}

/** Ключевые показатели: подпись сверху, число крупно. */
export const Показатели: S = {
  render: () => (
    <Inline gap="03">
      <StatTile variant="metric" label="Постов/нед" value="12,5" />
      <StatTile variant="metric" label="Ср. просмотры" value="1 840" />
      <StatTile variant="metric" label="ER поста, %" value="0.412" />
    </Inline>
  ),
}

/** Сравнение периодов: строки А и Б с меткой цвета ряда графика, разница ▲▼ в % (слово — для читалки). */
export const Сравнение: S = {
  render: () => (
    <Inline gap="03">
      <StatTile variant="metric" label="Ср. лайки" value="30" compare={{ value: '10', delta: 200 }} />
      <StatTile variant="metric" label="Ср. репосты" value="2,1" compare={{ value: '2,6', delta: -19.2 }} />
      <StatTile variant="metric" label="Постов/нед" value="7" compare={{ value: '0', delta: null }} />
    </Inline>
  ),
}

/** Ссылка вместо кнопки: переход на другой экран адресом. */
export const Ссылкой: S = { args: { value: '3', label: 'кабинета крутится', detail: '· встало 1', href: '#target' } }
