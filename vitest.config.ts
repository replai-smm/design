import { defineConfig } from 'vitest/config'

// Тесты источника и сборки (tokens.json → dist/, контраст, шрифт, сторож «только токены») — без браузера и React.
// Тесты компонентов — react/ (свой конфиг: jsdom, Storybook).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    exclude: ['__tests__/fixtures/**', '**/node_modules/**'],
  },
})
