/**
 * Переходник VKUI ← Carbon (CONCEPT §3.4, Arena): каждая переменная темы VKUI либо берёт значение из токена Carbon,
 * либо оставлена VKUI с причиной; всё, что читает Арена, закрыто; токены, на которые ссылается переходник, есть в обеих
 * темах; в dist только ссылки var(--cds-…); пары «текст на фоне» VKUI держат контраст после замены.
 * Что читает Арена — fixtures/arena-vkui-used.json (снято с arena/web; там же этот скан гоняет свой тест).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VKUI_CLASSES, COLORS, SPACING, LEFT, colorsFor, common, cssValue, referencedTokens, vkuiOutputs } from '../lib/vkui.mjs'
import { load, scaleVars } from '../lib/generate.mjs'
import { over, ratio, TEXT, NON_TEXT } from '../lib/contrast.mjs'
import { scan } from '../lint/scan.mjs'

const design = resolve(import.meta.dirname, '..')
const read = (p: string) => readFileSync(resolve(design, p), 'utf8')
const all = load()
const { tokens, scale } = all
const arena = JSON.parse(read('__tests__/fixtures/arena-vkui-used.json'))
const THEME = { light: 'светлая', dark: 'тёмная' } as const
const scaleNames = new Set(scaleVars(scale).map(([k]: [string, string]) => k))
const left = LEFT.map(([re, why]: [string, string]) => [new RegExp(re), why] as const)
const commonMap: Record<string, string> = common()
const colorMaps = { light: colorsFor('light'), dark: colorsFor('dark') } as Record<'light' | 'dark', Record<string, string>>

const isLeft = (v: string) => left.some(([re]) => re.test(v))
const isMapped = (v: string) => v in commonMap || (v in colorMaps.light && v in colorMaps.dark)

describe('переходник VKUI', () => {
  it('каждая переменная темы VKUI: токен Carbon или оставлена VKUI с причиной — не то и другое сразу', () => {
    const none = arena.defined.filter((v: string) => !isMapped(v) && !isLeft(v))
    const both = arena.defined.filter((v: string) => isMapped(v) && isLeft(v))
    expect(none, 'ничем не закрыты').toEqual([])
    expect(both, 'и в таблице, и в «оставлено»').toEqual([])
  })

  it('все цвета VKUI — из Carbon (ни один цвет не оставлен VKUI)', () => {
    const colors = arena.defined.filter((v: string) => v.startsWith('--vkui--color_'))
    expect(colors.length).toBeGreaterThan(300)
    for (const v of colors) expect(v in colorMaps.light && v in colorMaps.dark, v).toBe(true)
  })

  it('всё, что читает Арена (её код и компоненты VKUI, которые она подключает), закрыто', () => {
    const none = arena.used.filter((v: string) => !isMapped(v) && !isLeft(v))
    expect(none).toEqual([])
    // цвета, шрифт, текст, отступы, углы — только Carbon, без «оставлено»
    const looks = arena.used.filter((v: string) =>
      /^--vkui--(color_|font_family|spacing_|size_border_radius|size_card_border_radius|elevation)/.test(v),
    )
    for (const v of looks) expect(isMapped(v), v).toBe(true)
  })

  it('каждый токен, на который ссылается переходник, есть в tokens.json или scale.json — в обеих темах', () => {
    const missing: string[] = []
    for (const t of referencedTokens()) {
      if (scaleNames.has(t)) continue
      for (const th of Object.values(THEME)) if (!(t in tokens.themes[th].colors)) missing.push(`${th}: ${t}`)
    }
    expect(missing).toEqual([])
    // цвета берутся только из цветов, остальное — только из шкал
    for (const th of ['light', 'dark'] as const)
      for (const [v, t] of Object.entries(colorMaps[th]))
        if (t !== 'transparent') expect(t in tokens.themes[THEME[th]].colors, `${v} → ${t}`).toBe(true)
    for (const [v, t] of Object.entries(commonMap)) expect(scaleNames.has(t), `${v} → ${t}`).toBe(true)
  })

  it('тона статусов VKUI — из закрытого списка Carbon (palettes.product)', () => {
    const tones = Object.values(tokens.palettes.product) as string[]
    const family = (t: string) => tones.find((x) => t === x || t === `${x}-text` || t === `${x}-background`)
    for (const th of ['light', 'dark'] as const) {
      for (const [v, t] of Object.entries(colorMaps[th])) {
        if (/_(negative|positive|warning)(_tint)?(--|$)/.test(v) && !/background_negative(--|$)/.test(v))
          expect(family(t), `${v} → ${t}`).toBeTruthy()
        if (t.startsWith('status-')) expect(family(t), `${v} → ${t}`).toBeTruthy()
      }
    }
    expect(colorMaps.light['--vkui--color_text_negative']).toBe('status-error-text')
    expect(colorMaps.dark['--vkui--color_icon_warning']).toBe('status-warning')
    expect(colorMaps.light['--vkui--color_background_positive_tint']).toBe('status-success-background')
  })

  it('отступ VKUI — ближайший шаг Carbon (на равном расстоянии — больший)', () => {
    const px = (rem: string) => parseFloat(rem) * 16
    const steps = Object.entries(scale.spacing)
      .filter(([k]) => !k.startsWith('$'))
      .map(([k, v]: [string, any]) => [k, px(v.$value)] as const)
    for (const [name, [vk, step]] of Object.entries(SPACING) as [string, [number, string]][]) {
      const best = steps.reduce((a, b) => {
        const da = Math.abs(a[1] - vk)
        const db = Math.abs(b[1] - vk)
        return db < da || (db === da && b[1] > a[1]) ? b : a
      })
      expect(step, `${name} = ${vk}px`).toBe(best[0])
    }
  })

  it('высота строки VKUI — длина (кегль × число Carbon): VKUI вычитает её в calc', () => {
    expect(cssValue('body-compact-02-line-height')).toBe(
      'calc(var(--cds-body-compact-02-font-size) * var(--cds-body-compact-02-line-height))',
    )
    expect(commonMap['--vkui--font_text--line_height--regular']).toBe('body-compact-02-line-height')
    expect(commonMap['--vkui--font_family_base']).toBe('font-sans')
  })

  it('dist: обе темы на классах VKUI 8, только ссылки на токены, сторож «только токены» чист', () => {
    const out = vkuiOutputs(all)
    const css = out['dist/vkui-adapter.css']
    expect(css).toContain(`:root,\n${VKUI_CLASSES.light.map((c: string) => `.${c}`).join(',\n')} {`)
    expect(css).toContain(`${VKUI_CLASSES.dark.map((c: string) => `.${c}`).join(',\n')} {`)
    for (const m of css.matchAll(/^\s+(--vkui--[\w-]+): (.+);$/gm))
      expect(m[2], m[1]).toMatch(/^(transparent|var\(--cds-[a-z0-9-]+\)|calc\(var\(--cds-[a-z0-9-]+\) \* var\(--cds-[a-z0-9-]+\)\))$/)
    expect(scan(css, 'vkui-adapter.css')).toEqual([])
    expect(scan(out['dist/vkui-adapter.ts'], 'vkui-adapter.ts')).toEqual([])
    expect(scan(read('lib/vkui.mjs'), 'vkui.mjs')).toEqual([])
  })

  it('vkui-adapter.ts: та же таблица, что в CSS', async () => {
    const m = await import('../dist/vkui-adapter.ts')
    expect(m.common).toEqual(commonMap)
    expect(m.colors).toEqual(colorMaps)
    expect(m.coverage('--vkui--color_text_primary')).toBe('carbon')
    expect(m.coverage('--vkui--z_index_modal')).toBe('vkui')
    expect(m.coverage('--vkui--нет_такой')).toBeNull()
    expect(Object.keys(COLORS).length * 3).toBeLessThanOrEqual(Object.keys(m.colors.light).length)
  })

  it('контраст после замены: текст на фонах VKUI ≥ 4,5 : 1, значки и рамки ≥ 3 : 1, обе темы', () => {
    const v = (n: string) => `--vkui--color_${n}`
    const pairs: [string, string, number][] = []
    for (const bg of ['background_content', 'background_secondary', 'background']) {
      for (const fg of ['text_primary', 'text_secondary', 'text_subhead', 'text_tertiary', 'text_accent', 'text_link', 'text_negative', 'text_positive'])
        pairs.push([fg, bg, TEXT])
      for (const fg of ['icon_accent', 'icon_negative', 'icon_positive', 'icon_warning', 'stroke_accent'])
        pairs.push([fg, bg, NON_TEXT])
    }
    // рамка поля — как у Carbon: на странице и на карточке (на втором слое Carbon берёт другую рамку)
    for (const bg of ['background_content', 'background']) pairs.push(['field_border_alpha', bg, NON_TEXT])
    for (const bg of ['background_accent', 'background_negative', 'background_positive']) pairs.push(['text_contrast', bg, TEXT])
    pairs.push(['text_negative', 'background_negative_tint', TEXT], ['text_positive', 'background_positive_tint', TEXT])
    // текст на заливках VKUI так, как их ставят компоненты (vkui.css 8.3.1): главная кнопка и счётчик —
    // text_contrast_themed на background_accent_themed; «нейтральная главная» — на background_content_inverse;
    // подсказка «inversion» — на background_modal_inverse, «black» — text_contrast на background_contrast_inverse
    for (const bg of ['background_accent_themed', 'background_content_inverse', 'background_modal_inverse'])
      pairs.push(['text_contrast_themed', bg, TEXT])
    pairs.push(['icon_contrast_themed', 'background_accent_themed', NON_TEXT], ['text_contrast', 'background_contrast_inverse', TEXT])
    // SimpleCell пишет текст цветом значка (after, badge): icon_accent держит и текст
    for (const bg of ['background_content', 'background_secondary', 'background']) pairs.push(['icon_accent', bg, TEXT])
    // вторичная кнопка: text_accent_themed на полупрозрачной background_secondary_alpha поверх карточки и страницы
    const onTop: [string, string, string][] = [
      ['text_accent_themed', 'background_secondary_alpha', 'background_content'],
      ['text_accent_themed', 'background_secondary_alpha', 'background'],
    ]
    const low: string[] = []
    for (const th of ['light', 'dark'] as const) {
      const hex = (n: string) => tokens.themes[THEME[th]].colors[colorMaps[th][v(n)]]
      for (const [fg, bg, min] of pairs) {
        const r = ratio(hex(fg), hex(bg))
        if (r < min) low.push(`${th}: ${fg} на ${bg} — ${r} < ${min}`)
      }
      for (const [fg, tint, under] of onTop) {
        const r = ratio(hex(fg), over(hex(tint), hex(under)))
        if (r < TEXT) low.push(`${th}: ${fg} на ${tint} поверх ${under} — ${r} < ${TEXT}`)
      }
    }
    expect(low).toEqual([])
  })
})
