// Контраст по WCAG 2.x: текст ≥ 4,5 : 1, знаки, рамки контролов, фокус и ряды данных ≥ 3 : 1 — в обеих темах.
// Пары строятся из ролей tokens.json, а не пишутся руками: новая роль тона или ряда сразу под проверкой.

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

/** Где живут текст и знаки: холст и поверхность. */
export const GROUNDS = ['canvas', 'surface']

/**
 * Все пары: { fg, bg, on?, min, why }. `on` — непрозрачная роль под полупрозрачным фоном (наведение, выбрано).
 * - текст: основной, второй, ссылка, текст «опасно» — на холсте и поверхности; второй и основной — под наведением
 *   и на выбранном (приглушённая строка, открытая строка);
 * - инверсия: текст на главном действии и под указателем; текст опасной кнопки на заливке тона «опасно»;
 * - текст тона на его подложке (метка);
 * - основной и второй текст на заливке (метка Tag green и gray);
 * - знаки ≥ 3 : 1: знаки тонов, фокус, граница контрола, ряды данных.
 */
export function pairsFor(tokens) {
  const pairs = []
  for (const fg of ['fg', 'fg-muted', 'accent', 'danger-fg']) for (const bg of GROUNDS) pairs.push({ fg, bg, min: TEXT, why: 'текст' })
  for (const fg of ['fg', 'fg-muted']) for (const bg of ['hover', 'selected']) pairs.push({ fg, bg, on: 'surface', min: TEXT, why: 'текст под наведением и на выбранном' })
  for (const bg of ['inverse', 'inverse-hover']) pairs.push({ fg: 'fg-inverse', bg, min: TEXT, why: 'текст главного действия' })
  for (const bg of ['danger', 'danger-fg']) pairs.push({ fg: 'fg-inverse', bg, min: TEXT, why: 'текст опасной кнопки (Button kind="danger") и под указателем' })
  for (const t of Object.values(tokens.tones)) if (t.bg) pairs.push({ fg: t.text, bg: t.bg, min: TEXT, why: `текст тона «${t.key}» на подложке` })
  for (const t of Object.values(tokens.tones)) if (t.fill) for (const fg of ['fg', 'fg-muted']) pairs.push({ fg, bg: t.fill, min: TEXT, why: `текст на заливке статуса «${t.key}»` })
  const marks = new Set([...Object.values(tokens.tones).map((t) => t.mark), 'accent', 'line-strong'])
  for (const name of Object.keys(tokens.colors)) if (name.startsWith('series-')) marks.add(name)
  for (const fg of marks) for (const bg of GROUNDS) pairs.push({ fg, bg, min: NON_TEXT, why: 'знак, фокус, граница контрола, ряд данных' })
  return pairs
}

/** Посчитать все пары обеих тем: строки { theme, fg, bg, min, why, ratio, ok }. */
export function checkAll(tokens) {
  const rows = []
  for (const theme of ['light', 'dark']) {
    const c = (n) => tokens.colors[n]?.[theme]
    for (const p of pairsFor(tokens)) {
      const fg = c(p.fg)
      const raw = c(p.bg)
      if (!fg || !raw || (p.on && !c(p.on))) {
        rows.push({ theme, ...p, ratio: 0, ok: false, missing: !fg ? p.fg : !raw ? p.bg : p.on })
        continue
      }
      const bg = p.on ? over(raw, c(p.on)) : raw
      const r = ratio(fg, bg)
      rows.push({ theme, ...p, fgHex: fg, bgHex: bg, ratio: r, ok: r >= p.min })
    }
  }
  return rows
}
