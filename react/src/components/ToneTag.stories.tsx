import type { Meta, StoryObj } from '@storybook/react-vite'
import { ToneTag } from './ToneTag'
import { Inline, Stack } from './layout'

const meta = {
  title: 'Компоненты/Метка тона',
  component: ToneTag,
  parameters: { layout: 'padded' },
  args: { tone: 'опасно', children: 'встало' },
} satisfies Meta<typeof ToneTag>
export default meta
type S = StoryObj<typeof meta>

/** Четыре тона продукта со словами продукта: у каждого тона своя форма значка, цвет никогда не один. */
export const Обычное: S = {
  render: () => (
    <Stack gap="05">
      <Inline gap="03">
        <ToneTag tone="опасно">встало</ToneTag>
        <ToneTag tone="внимание">хватит на 3 дня</ToneTag>
        <ToneTag tone="хорошо">крутится</ToneTag>
        <ToneTag tone="нейтрально">не запускался</ToneTag>
      </Inline>
      <Inline gap="03">
        <ToneTag tone="хорошо">отправлен</ToneTag>
        <ToneTag tone="нейтрально">черновик</ToneTag>
      </Inline>
    </Stack>
  ),
}

/** Одна метка — для пробы тона и слова в панели Storybook. */
export const Одна: S = {}
