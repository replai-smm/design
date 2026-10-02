// Сборщик историй и тестов ДС-React. Tailwind 4 — плагином, как у Replai и дашборда.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  // dist/tokens.ts и lint/ лежат выше пакета (design/) — разрешаем их читать
  server: { fs: { allow: ['..'] } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.tsx'],
    setupFiles: ['src/__tests__/setup.ts'],
    css: false,
  },
})
