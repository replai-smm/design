/**
 * Облик машиной (react/visual): сверка снимков и анатомия на собранном Storybook. Здесь — что сторож ловит, без
 * браузера: эталон и тот же кадр со сдвигом на 1 px — разница больше допуска матрицы; снимок страницы с полями 12 вместо
 * 16, заголовком не той роли, меткой 4 px, текстом 15 px, углом 10 px и кнопкой 36 px — каждое нарушение названо.
 * Сам прогон всех историй × тем × ширин — `npm run test:visual` (в `npm run check`).
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PNG } from 'pngjs'
import YAML from 'yaml'
import { compare } from '../react/visual/compare.mjs'
import { anatomyProblems } from '../react/visual/anatomy.mjs'

const design = resolve(import.meta.dirname, '..')
const base = resolve(design, 'react/visual/baseline')
const registry = JSON.parse(readFileSync(resolve(design, 'react/src/registry.json'), 'utf8'))
const { max_diff_pixels } = YAML.parse(readFileSync(resolve(design, 'matrix.yaml'), 'utf8'))

describe('сверка снимков', () => {
  const file = readdirSync(base).find((f) => f.startsWith('элементы-кнопка--виды.light.1280'))!
  const png = readFileSync(resolve(base, file))

  it('тот же кадр — разницы нет', () => {
    expect(compare(png, png).pixels).toBe(0)
  })

  it('приманка: кадр со сдвигом на 1 px — разница больше допуска матрицы', () => {
    const img = PNG.sync.read(png)
    const shifted = new PNG({ width: img.width, height: img.height })
    img.data.copy(shifted.data, 4, 0, img.data.length - 4)
    expect(compare(png, PNG.sync.write(shifted)).pixels).toBeGreaterThan(max_diff_pixels)
  })

  it('у каждой истории — эталоны обеих тем и обеих ширин', () => {
    const files = readdirSync(base)
    const ids = new Set(files.map((f) => f.split('.')[0]))
    for (const id of ids) for (const t of ['light', 'dark']) for (const w of [390, 1280]) expect(files, id).toContain(`${id}.${t}.${w}.png`)
  })
})

describe('анатомия по реестру', () => {
  const good = {
    slots: [{ slot: 'card', padding: 16, radius: 6, height: 120, markWidth: 1, hasMark: false, title: { size: 14, weight: 600 } }],
    fonts: [12, 14],
    radii: [0, 4, 6],
    controls: [{ what: 'кнопка «Да»', height: 40 }],
  }

  it('снимок по ролям — нарушений нет', () => {
    expect(anatomyProblems(good, registry)).toEqual([])
  })

  it('приманка: поля, заголовок, метка, угол, текст, плотность — каждое названо', () => {
    const bait = {
      slots: [
        { slot: 'card', padding: 12, radius: 6, height: 120, markWidth: 1, hasMark: false, title: { size: 16, weight: 600 } },
        { slot: 'notification', padding: 16, radius: 6, height: 60, markWidth: 4, hasMark: true, title: { size: 14, weight: 600 } },
        { slot: 'button', padding: 16, radius: 0, height: 40, markWidth: 1, hasMark: false, title: null },
      ],
      fonts: [14, 15],
      radii: [0, 10],
      controls: [{ what: 'кнопка «Нет»', height: 36 }],
    }
    expect(anatomyProblems(bait, registry).map((p: { rule: string }) => p.rule).sort()).toEqual(
      ['anatomy/mark', 'anatomy/padding', 'anatomy/shape', 'anatomy/title', 'scale/density', 'scale/radius', 'scale/text'].sort(),
    )
  })
})
