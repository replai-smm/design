// Контраст по WCAG 2.x и список пар, которые дизайн-система обязана держать (G46, CONCEPT §3.4):
// текст ≥ 4,5:1, значки и рамки ≥ 3:1 — в обеих темах. Пары строятся из tokens.json, а не пишутся руками:
// новый тон статуса сразу попадает под проверку.

export const TEXT = 4.5
export const NON_TEXT = 3

/** '#rrggbb' или '#rrggbbaa' → [r, g, b, a] (0–255, a 0–1). */
export function parseHex(hex) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex)
  if (!m) throw new Error(`не цвет: ${hex}`)
  const n = parseInt(m[1], 16)
  return [n >> 16, (n >> 8) & 255, n & 255, m[2] ? parseInt(m[2], 16) / 255 : 1]
}

/** Полупрозрачный цвет поверх непрозрачного фона → непрозрачный. */
export function over(fg, bg) {
  const [r, g, b, a] = parseHex(fg)
  const [R, G, B] = parseHex(bg)
  const mix = (x, y) => Math.round(x * a + y * (1 - a))
  return '#' + [mix(r, R), mix(g, G), mix(b, B)].map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => v / 255)
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Отношение контраста, округлённое вниз до сотых (4,499 — не 4,5). */
export function ratio(fg, bg) {
  const solid = parseHex(fg)[3] < 1 ? over(fg, bg) : fg
  const a = luminance(solid)
  const b = luminance(bg)
  const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  return Math.floor(r * 100) / 100
}

/** Поверхности, на которых живут текст и значки страницы. */
export const SURFACES = ['background', 'layer-01', 'layer-02']

/**
 * Все пары одной темы: { fg, bg, min, why }.
 * - статусы продуктов (palettes.product): текст тона на поверхностях и на фоне метки; знак тона (точка, значок, рамка)
 *   на поверхностях;
 * - цвета Карты (palettes.karta, C-SCR-3: синий, жёлтый, красный): рамка и полоса карточки на поверхностях;
 * - основа: основной и второй текст, ссылка, текст ошибки на поверхностях; второй текст при наведении (приглушённая
 *   строка таблицы); текст на кнопках; фокус и рамка поля.
 */
export function pairsFor(tokens) {
  const pairs = []
  for (const t of Object.values(tokens.palettes.product).filter(Boolean)) {
    for (const s of [...SURFACES, `${t}-background`]) pairs.push({ fg: `${t}-text`, bg: s, min: TEXT, why: 'текст статуса' })
    for (const s of SURFACES) pairs.push({ fg: t, bg: s, min: NON_TEXT, why: 'знак статуса' })
  }
  for (const [state, t] of Object.entries(tokens.palettes.karta)) {
    for (const s of SURFACES) pairs.push({ fg: t, bg: s, min: NON_TEXT, why: `Карта: ${state}` })
  }
  for (const fg of ['text-primary', 'text-secondary', 'link-primary', 'text-error']) {
    for (const s of SURFACES) pairs.push({ fg, bg: s, min: TEXT, why: 'текст' })
  }
  // приглушённая строка таблицы (DataTable rowMuted): второй текст и при наведении на строку
  pairs.push({ fg: 'text-secondary', bg: 'layer-hover-01', min: TEXT, why: 'приглушённая строка' })
  for (const bg of ['button-primary', 'button-secondary', 'button-danger-primary']) {
    pairs.push({ fg: 'text-on-color', bg, min: TEXT, why: 'текст на кнопке' })
  }
  for (const s of SURFACES) pairs.push({ fg: 'focus', bg: s, min: NON_TEXT, why: 'рамка фокуса' })
  // рамка поля по слою Carbon: на фоне и первом слое — border-strong-01, на втором — border-strong-02
  pairs.push({ fg: 'border-strong-01', bg: 'background', min: NON_TEXT, why: 'рамка поля' })
  pairs.push({ fg: 'border-strong-01', bg: 'layer-01', min: NON_TEXT, why: 'рамка поля' })
  pairs.push({ fg: 'border-strong-02', bg: 'layer-02', min: NON_TEXT, why: 'рамка поля' })
  return pairs
}

/** Посчитать все пары обеих тем. */
export function checkAll(tokens) {
  const rows = []
  for (const [theme, { colors }] of Object.entries(tokens.themes)) {
    for (const p of pairsFor(tokens)) {
      const fg = colors[p.fg]
      const bg = colors[p.bg]
      if (!fg || !bg) {
        rows.push({ theme, ...p, ratio: 0, ok: false, missing: !fg ? p.fg : p.bg })
        continue
      }
      const r = ratio(fg, bg)
      rows.push({ theme, ...p, fgHex: fg, bgHex: bg, ratio: r, ok: r >= p.min })
    }
  }
  return rows
}
