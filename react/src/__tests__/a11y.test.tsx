/**
 * a11y (признак облика look.axe): каждая история в светлой и тёмной теме — ноль нарушений axe.
 * Контраст цвета jsdom не считает (нет отрисовки) — его держит тест токенов design/__tests__/contrast.test.ts
 * по всем парам обеих тем, а компоненты берут цвета только из проверенных пар (сторож «только токены»).
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type axe from 'axe-core'
import { runAxe } from './axe'
import { stories, type Theme } from './stories'
import { many } from '../stories/fixtures'
import { DataTable } from '../components/Collection'

/**
 * Один набор опций axe на все проверки. `resultTypes: ['violations']` — скорость, не послабление: правила те же
 * и бегут по каждому узлу, нарушения приходят целиком (все узлы, селекторы). Срезаются только подробности
 * passes/incomplete/inapplicable, которые тест не читает. Без этого axe строит CSS-селектор для каждого прошедшего
 * узла — на историях «много» (≈800 узлов) это 2/3 времени: 1,5 с вместо 0,45 с на машине, 6–7 с вместо таймаута
 * 5 с на загруженном раннере CI.
 */
const check = (page: boolean): axe.RunOptions => ({
  rules: { 'color-contrast': { enabled: false }, region: { enabled: page } },
  resultTypes: ['violations'],
})

/**
 * Таймаут теста под прогон axe — одно место на файл. Историю «много» axe проходит за ~0,5 с на машине и за 6–7 с
 * на раннере под нагрузкой (3 ядра); 5 с vitest по умолчанию — впритык. 30 с — запас, но зависший тест всё равно
 * упадёт сам, а не съест таймаут задачи CI. Прогоны axe идут строго по одному (очередь в ./axe), а describe.sequential
 * не даёт включить тестам параллель даже настройкой sequence.concurrent.
 */
const AXE_TEST = { timeout: 30_000 } as const

const violations = async (page: boolean) => {
  const res = await runAxe(document.body, check(page))
  return res.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

describe.sequential('a11y: истории × темы — ноль нарушений axe', AXE_TEST, () => {
  for (const theme of ['light', 'dark'] as Theme[])
    for (const e of stories(theme))
      it(`${e.title} / ${e.name} · ${theme}`, async () => {
        render(<e.Story />)
        expect(document.documentElement.getAttribute('data-theme')).toBe(theme)
        // «всё внутри ориентиров» (region) — правило страницы: проверяем у историй-страниц, у отдельного компонента ориентиры даёт продукт
        expect(await violations(Boolean(document.querySelector('[data-slot=page]')))).toEqual([])
      })
})

describe.sequential('a11y: опции axe не глушат нарушения', AXE_TEST, () => {
  // Сторож опций: в большом дереве (150 строк) нарушение в последней строке находится, и его селектор ведёт к узлу.
  it('кнопка без имени в 150 строках — нарушение button-name с селектором узла', async () => {
    render(
      <DataTable
        label="Группы"
        rows={many}
        columns={[{ key: 'name', header: 'Группа', cell: (r) => r.name, face: true }]}
        getKey={(r) => r.id}
        pageSize={many.length}
        rowAction={(r) => (r.id === 'm149' ? <button type="button" data-bad="" /> : null)}
      />,
    )
    const res = await runAxe(document.body, check(false))
    expect(res.violations.map((v) => v.id)).toEqual(['button-name'])
    const targets = res.violations[0].nodes.map((n) => n.target.join(' '))
    expect(targets).toHaveLength(1)
    expect(document.querySelector(targets[0])?.hasAttribute('data-bad')).toBe(true)
  })
})

describe('a11y: axe — только через очередь', () => {
  // Сторож очереди: прямой вызов axe.run мимо ./axe снова открыл бы «Axe is already running» под нагрузкой.
  const src = resolve(import.meta.dirname, '..')
  const door = resolve(src, '__tests__', 'axe.ts')
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]))
  it('axe.run зовёт только src/__tests__/axe.ts (runAxe)', () => {
    const direct = files(src)
      .filter((f) => /\.(ts|tsx)$/.test(f) && resolve(f) !== door)
      .filter((f) => /\baxe\s*\.\s*run\s*\(/.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(src.length + 1))
    expect(direct).toEqual([])
  })
})
