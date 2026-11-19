import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ButtonSet } from './Button'
import { BottomBar, Page, PageHeader } from './layout'
import { Toaster } from './Toaster'

const meta = {
  title: 'Компоненты/Слои/Toaster',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  args: {
    initial: [
      { kind: 'success', title: 'Отчёт отправлен', subtitle: 'Интернет-магазин', caption: '14:20', timeout: 0 },
      { kind: 'info', title: 'Черновик сохранён', timeout: 0 },
    ],
  },
} satisfies Meta<typeof Toaster>
export default meta
type S = StoryObj<typeof meta>

/** «Готово» всплывает внизу справа и гаснет само через 5 с (`timeout`); на телефоне — во всю ширину. */
export const Обычное: S = {}
/** Длинная страница: липкая полоса (`BottomBar`) прижата к низу, всплывашки встают над ней — кнопки полосы не закрыты. */
export const НадПолосой: S = {
  args: {
    initial: [{ kind: 'success', title: 'Добавлено в корзину', timeout: 0 }],
    children: (
      <Page header={<PageHeader title="Корзина" />}>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i} className="m-0 text-body">
            Позиция {i + 1} × 1 — 450 ₽
          </p>
        ))}
        <BottomBar>
          <ButtonSet aria-label="Корзина">
            <Button>Оформить корзину</Button>
          </ButtonSet>
        </BottomBar>
      </Page>
    ),
  },
}
