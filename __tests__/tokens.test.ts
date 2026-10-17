/**
 * Основа — один язык: роли цвета (закрытый список, обе темы), словарь тонов из ролей, шкалы, шрифты в пакете.
 * Форма — tokens.schema.json (schemas.test.ts), контраст — contrast.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const design = resolve(import.meta.dirname, '..')
const json = (p: string) => JSON.parse(readFileSync(resolve(design, p), 'utf8'))
const tokens = json('tokens.json')
const scale = json('scale.json')

describe('роли цвета', () => {
  it('у каждой роли — значение обеих тем (#rrggbb или #rrggbbaa строчными) и «зачем»', () => {
    for (const [k, v] of Object.entries<any>(tokens.colors)) {
      expect(Object.keys(v).sort(), k).toEqual(['dark', 'light', 'role'])
      for (const t of ['light', 'dark']) expect(v[t], `${k}.${t}`).toMatch(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/)
      expect(v.role.length, k).toBeGreaterThan(3)
    }
  })

  it('ролей не больше 32: поверхности, текст, рамки, взаимодействие, тоны, ряды данных', () => {
    expect(Object.keys(tokens.colors).length).toBeLessThanOrEqual(32)
  })

  it('синий — только ссылка и фокус: одна роль accent; главное действие — инверсия', () => {
    const blue = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
      return b > 180 && b - r > 60 && b - g > 30
    }
    const blues = Object.entries<any>(tokens.colors).filter(([k, v]) => !k.startsWith('series-') && (blue(v.light) || blue(v.dark))).map(([k]) => k)
    expect(blues).toEqual(['accent'])
    expect(tokens.colors.inverse.light).toBe(tokens.colors.fg.light)
  })

  it('ряды данных 1–6 — не цвета тонов: линия графика не выглядит бедой', () => {
    const tones = new Set(['danger', 'warning', 'success'].flatMap((r) => [tokens.colors[r].light, tokens.colors[r].dark]))
    for (let i = 1; i <= 6; i++) for (const t of ['light', 'dark']) expect(tones.has(tokens.colors[`series-${i}`][t]), `series-${i}`).toBe(false)
  })
})

describe('словарь тонов', () => {
  it('пять тонов; знак, текст и подложка — роли; подложка — только у «опасно» и «внимание»', () => {
    expect(Object.keys(tokens.tones)).toEqual(['опасно', 'внимание', 'инфо', 'нейтрально', 'хорошо'])
    for (const [t, x] of Object.entries<any>(tokens.tones)) for (const r of [x.mark, x.text, x.bg].filter(Boolean)) expect(tokens.colors[r], `${t}: ${r}`).toBeDefined()
    expect(Object.entries<any>(tokens.tones).filter(([, x]) => x.bg).map(([t]) => t)).toEqual(['опасно', 'внимание'])
  })

  it('заливка статуса (сетка статуса) — роль `<тон>-fill` у всех тонов, кроме «инфо»', () => {
    for (const [t, x] of Object.entries<any>(tokens.tones)) expect(x.fill, t).toBe(t === 'инфо' ? null : `${x.key}-fill`)
    for (const [t, x] of Object.entries<any>(tokens.tones)) if (x.fill) expect(tokens.colors[x.fill], `${t}: ${x.fill}`).toBeDefined()
  })

  it('«хорошо» — зелёный знак без подложки (норма не кричит)', () => {
    const t = tokens.tones['хорошо']
    expect(t.bg).toBeNull()
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(tokens.colors[t.mark].light.slice(i, i + 2), 16))
    expect(g > r && g > b).toBe(true)
  })
})

describe('шкалы', () => {
  it('отступы — шесть ролей кратно 4 px; высоты контролов — 32 · 40 · 48', () => {
    const px = (v: string) => parseFloat(v) * 16
    expect(Object.values<any>(scale.space).map((s) => px(s.value))).toEqual([4, 8, 12, 16, 24, 32])
    expect(['dense', 'control', 'touch'].map((k) => px(scale.size[k].value))).toEqual([32, 40, 48])
  })

  it('семь ролей текста; углы — контрол 4, поверхность 6; три глубины; движение — 110 мс и 0,6 с', () => {
    expect(Object.keys(scale.text)).toHaveLength(7)
    expect([scale.radius.control.value, scale.radius.surface.value]).toEqual(['4px', '6px'])
    expect(Object.keys(scale.elevation)).toEqual(['flat', 'raised', 'overlay'])
    expect([scale.motion.fast.value, scale.motion.move.value]).toEqual(['110ms', '600ms'])
  })

  it('шрифты — в пакете: Plex Sans 400 и 600, Plex Mono 400; лицензия OFL рядом', () => {
    expect([tokens.font.sans.family, tokens.font.mono.family]).toEqual(['IBM Plex Sans', 'IBM Plex Mono'])
    for (const f of [...tokens.font.sans.files, ...tokens.font.mono.files]) expect(existsSync(resolve(design, f)), f).toBe(true)
    expect(readFileSync(resolve(design, 'fonts/OFL.txt'), 'utf8')).toMatch(/SIL Open Font License, Version 1\.1/)
    expect(scale.font.mono.value[0]).toBe('IBM Plex Mono')
  })
})
