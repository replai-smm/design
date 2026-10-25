import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const here = import.meta.dirname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // B берёт ДС из исходников корня worktree — как продукт из пакета (README «Как продукт берёт ДС»)
    alias: { '@ds': resolve(here, '../../react/src/index.ts') },
    dedupe: ['react', 'react-dom', 'radix-ui'],
  },
  server: { fs: { allow: [resolve(here, '../..')] } },
  build: {
    rolldownOptions: {
      input: { a: resolve(here, 'a.html'), b: resolve(here, 'b.html') },
    },
  },
})
