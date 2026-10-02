import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/storybook.css'

/**
 * Тема — атрибут data-theme на корне (как в tokens.css), глобал `theme` — тот же, что ставит задача скриншотов П7
 * (`?globals=theme:light|dark`). Ставим в теле декоратора, до отрисовки кадра, чтобы не мигала старая тема.
 * Ширины 390 и 1280 — клетки матрицы облика (design/matrix.yaml); их задаёт окно съёмки, здесь — для глаза.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  document.body.style.background = 'var(--cds-background)'
  return <Story />
}

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Тема (data-theme на корне)',
      toolbar: {
        title: 'Тема',
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Светлая' },
          { value: 'dark', icon: 'moon', title: 'Тёмная' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        phone: { name: 'Телефон 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        laptop: { name: 'Ноутбук 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
  },
}

export default preview
