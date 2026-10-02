/**
 * a11y (признак облика look.axe): каждая история в светлой и тёмной теме — ноль нарушений axe.
 * Контраст цвета jsdom не считает (нет отрисовки) — его держит тест токенов design/__tests__/contrast.test.ts
 * по всем парам обеих тем, а компоненты берут цвета только из проверенных пар (сторож «только токены»).
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import axe from 'axe-core'
import { stories, type Theme } from './stories'

describe('a11y: истории × темы — ноль нарушений axe', () => {
  for (const theme of ['light', 'dark'] as Theme[])
    for (const e of stories(theme))
      it(`${e.title} / ${e.name} · ${theme}`, async () => {
        render(<e.Story />)
        expect(document.documentElement.getAttribute('data-theme')).toBe(theme)
        // «всё внутри ориентиров» (region) — правило страницы: проверяем у историй-страниц, у отдельного компонента ориентиры даёт продукт
        const page = Boolean(document.querySelector('[data-slot=page]'))
        const res = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: page } } })
        const msg = res.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
        expect(msg).toEqual([])
      })
})
