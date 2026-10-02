/**
 * Токены — форма и единый набор имён (G46, CONCEPT §3.4).
 * tokens.json и scale.json — договор schema/defs/tokens.json (корень и $defs/scale) через общий загрузчик договоров;
 * G46 — tokenProblems() оттуда же. statuses.json — своей схемой рядом.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
// @ts-ignore — .mjs без типов
import { contract, tokenProblems } from '../../schema/defs/index.mjs'

const design = resolve(import.meta.dirname, '..')
const repo = resolve(design, '..')
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const tokens = json(resolve(design, 'tokens.json'))
const errors = (v: any, data: unknown) => (v(data) ? [] : (v.errors ?? []).map((e: any) => `${e.instancePath} ${e.message}`))

const validate = (schema: object, data: unknown) => {
  // allowMatchingProperties: обязательные «sans», «move» объявлены и в properties, и подходят под шаблон имён шкалы
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true, allowMatchingProperties: true })
  const ok = ajv.validate(schema, data)
  return ok ? [] : (ajv.errors ?? []).map((e) => `${e.instancePath} ${e.message}`)
}

describe('tokens.json', () => {
  it('проходит договор schema/defs/tokens.json — форма 3.1: палитры, без старых шкал в корне', () => {
    expect(errors(contract('tokens'), tokens)).toEqual([])
    expect(Object.keys(tokens).filter((k) => ['status', 'spacing', 'type', 'motion', 'radius'].includes(k))).toEqual([])
  })

  it('G46 договора: имена тем, цвета обеих палитр в обеих темах, знаки ≥ 3:1, текст ≥ 4,5:1', () => {
    expect(tokenProblems(tokens)).toEqual([])
  })

  it('источник — Carbon под Apache-2.0, светлая = g10, тёмная = g100', () => {
    expect(tokens.source).toMatchObject({ name: 'carbon', license: 'Apache-2.0' })
    expect(tokens.themes['светлая'].carbon).toBe('g10')
    expect(tokens.themes['тёмная'].carbon).toBe('g100')
    expect(existsSync(resolve(design, 'licenses/carbon-LICENSE.txt'))).toBe(true)
  })

  it('у обеих тем один набор имён, значения — #rrggbb или #rrggbbaa строчными', () => {
    const light = Object.keys(tokens.themes['светлая'].colors).sort()
    const dark = Object.keys(tokens.themes['тёмная'].colors).sort()
    expect(dark).toEqual(light)
    for (const t of Object.values<any>(tokens.themes)) {
      for (const [k, v] of Object.entries(t.colors)) expect(v, k).toMatch(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/)
    }
  })

  it('палитра Карты — три цвета C-SCR-3: синий «без изменений», жёлтый «хотят изменить», красный «падает»', () => {
    // оттенок светлой и тёмной темы: синий 200–260°, жёлтый 35–60°, красный 340–10°
    const hue = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      const max = Math.max(r, g, b)
      const d = max - Math.min(r, g, b)
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
      return (h * 60 + 360) % 360
    }
    const want: Record<string, (h: number) => boolean> = {
      'без изменений': (h) => h >= 200 && h <= 260,
      'хотят изменить': (h) => h >= 35 && h <= 60,
      'падает': (h) => h >= 340 || h <= 10,
    }
    expect(Object.keys(tokens.palettes.karta)).toEqual(Object.keys(want))
    for (const [state, t] of Object.entries<string>(tokens.palettes.karta)) {
      for (const [theme, { colors }] of Object.entries<any>(tokens.themes)) {
        expect(want[state](hue(colors[t])), `${theme}: ${state} = ${t} ${colors[t]}`).toBe(true)
      }
    }
  })

  it('палитра продуктов — четыре тона; у каждого есть знак, -text и -background в обеих темах', () => {
    expect(Object.keys(tokens.palettes.product)).toEqual(['опасно', 'внимание', 'хорошо', 'нейтрально'])
    for (const t of Object.values<string>(tokens.palettes.product)) {
      for (const theme of Object.values<any>(tokens.themes)) {
        for (const name of [t, `${t}-text`, `${t}-background`]) expect(theme.colors[name], name).toBeDefined()
      }
    }
  })

  it('шрифт IBM Plex Sans: файлы лежат в репозитории, лицензия OFL рядом', () => {
    expect(tokens.font.family).toBe('IBM Plex Sans')
    for (const f of tokens.font.files) expect(existsSync(resolve(design, f)), f).toBe(true)
    expect(readFileSync(resolve(design, 'fonts/OFL.txt'), 'utf8')).toMatch(/SIL Open Font License, Version 1\.1/)
  })
})

describe('scale.json и statuses.json', () => {
  const scaleContract = contract('tokens', 'scale')

  it('scale.json проходит договор schema/defs/tokens.json → $defs/scale', () => {
    expect(errors(scaleContract, json(resolve(design, 'scale.json')))).toEqual([])
  })

  it('договор шкал ловит неправильное: отступ в em, длительность в секундах, нет «move»', () => {
    const scale = json(resolve(design, 'scale.json'))
    const bad1 = structuredClone(scale)
    bad1.spacing['05'].$value = '1em'
    const bad2 = structuredClone(scale)
    bad2.duration['fast-01'].$value = '0.07s'
    const bad3 = structuredClone(scale)
    delete bad3.duration.move
    for (const bad of [bad1, bad2, bad3]) expect(errors(scaleContract, bad)).not.toEqual([])
  })

  it('правило 0,6 с: duration-move = 600ms', () => {
    expect(json(resolve(design, 'scale.json')).duration.move.$value).toBe('600ms')
  })

  it('statuses.json проходит statuses.schema.json', () => {
    expect(validate(json(resolve(design, 'statuses.schema.json')), json(resolve(design, 'statuses.json')))).toEqual([])
  })
})
