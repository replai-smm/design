// Генератор: tokens.json + scale.json + statuses.json → dist/tokens.css, dist/tokens.ts, dist/tailwind.css,
// dist/showcase.html. Маленький скрипт вместо Style Dictionary: вход — договор schema/defs/tokens.json (не формат SD),
// выходов четыре, зависимостей ноль. Тот же код зовут `node design/build.mjs` и тест «dist свежий».
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkAll } from './contrast.mjs'
import { showcase } from './showcase.mjs'
import { tokenEntries } from './entries.mjs'
import { vkuiOutputs } from './vkui.mjs'

export const DESIGN = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => JSON.parse(readFileSync(join(DESIGN, f), 'utf8'))

/** Имя темы в tokens.json → значение data-theme. */
export const THEME_ATTR = { светлая: 'light', тёмная: 'dark' }

export function load() {
  const tokens = read('tokens.json')
  const scale = read('scale.json')
  const statuses = read('statuses.json')
  const law = read('../schema/karta.schema.json')
  return { tokens, scale, statuses, law }
}

const HEAD = (src) =>
  `Сгенерировано design/build.mjs из ${src}. Руками не править: правка — в источнике, потом \`node design/build.mjs\`.`


/** Плоский список переменных без цвета: [имя без --cds-, значение]. */
export function scaleVars(scale) {
  const out = []
  for (const [k, v] of tokenEntries(scale.spacing)) out.push([`spacing-${k}`, v.$value])
  for (const [k, v] of tokenEntries(scale.size)) out.push([`size-${k}`, v.$value])
  for (const [k, v] of tokenEntries(scale['icon-size'])) out.push([`icon-size-${k}`, v.$value])
  for (const [k, v] of tokenEntries(scale['font-family'])) {
    out.push([`font-${k}`, v.$value.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')])
  }
  for (const [k, v] of tokenEntries(scale['font-weight'])) out.push([`font-weight-${k}`, String(v.$value)])
  for (const [k, v] of tokenEntries(scale.type)) {
    const t = v.$value
    out.push([`${k}-font-size`, t.fontSize], [`${k}-line-height`, String(t.lineHeight)])
    out.push([`${k}-letter-spacing`, t.letterSpacing], [`${k}-font-weight`, String(t.fontWeight)])
  }
  for (const [k, v] of tokenEntries(scale.radius)) out.push([`radius-${k}`, v.$value])
  for (const [k, v] of tokenEntries(scale.duration)) out.push([`duration-${k}`, v.$value])
  for (const [k, v] of tokenEntries(scale.easing)) out.push([`easing-${k}`, `cubic-bezier(${v.$value.join(', ')})`])
  for (const [k, v] of tokenEntries(scale.shadow)) {
    const s = v.$value
    const color = s.color.replace(/^\{color\.(.+)\}$/, 'var(--cds-$1)')
    out.push([`shadow-${k}`, `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${color}`])
  }
  return out
}

const block = (selector, pairs, extra = '') =>
  `${selector} {\n${extra}${pairs.map(([k, v]) => `  --cds-${k}: ${v};`).join('\n')}\n}\n`

/** tokens.css — ДС-основа: переменные обеих тем, шкалы, шрифт. fontUrl(file) — путь к .woff2 из css. */
export function css({ tokens, scale }, fontUrl = (f) => `../${f}`) {
  const light = Object.entries(tokens.themes['светлая'].colors)
  const dark = Object.entries(tokens.themes['тёмная'].colors)
  const weights = { Regular: 400, SemiBold: 600, Light: 300, Medium: 500, Bold: 700 }
  const faces = tokens.font.files.map((f) => {
    const w = weights[/-(\w+)\.woff2$/.exec(f)?.[1]] ?? 400
    return `@font-face {\n  font-family: '${tokens.font.family}';\n  font-style: normal;\n  font-weight: ${w};\n  font-display: swap;\n  src: url('${fontUrl(f)}') format('woff2');\n}\n`
  })
  const durations = tokenEntries(scale.duration).map(([k]) => [`duration-${k}`, '0ms'])
  return [
    `/* ${HEAD('tokens.json и scale.json')}\n   Цвета — IBM Carbon ${tokens.source.version} (${tokens.source.license}): светлая = ${tokens.themes['светлая'].carbon}, тёмная = ${tokens.themes['тёмная'].carbon}.\n   Тема: <html data-theme="light|dark"> (или класс .dark); без атрибута — как в системе (prefers-color-scheme). */\n`,
    ...faces,
    block(':root', scaleVars(scale)),
    block(':root,\n[data-theme="light"]', light, '  color-scheme: light;\n'),
    block('[data-theme="dark"],\n.dark', dark, '  color-scheme: dark;\n'),
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, '  color-scheme: dark;\n')
      .split('\n')
      .map((l) => (l ? '  ' + l : l))
      .join('\n')}}\n`,
    `/* Система просит меньше движения — движения нет. */\n@media (prefers-reduced-motion: reduce) {\n${block(':root', durations)
      .split('\n')
      .map((l) => (l ? '  ' + l : l))
      .join('\n')}}\n`,
  ].join('\n')
}

/** Псевдонимы shadcn → токены Carbon (имена, которые ждут компоненты shadcn/ui). */
export const SHADCN = {
  background: 'background',
  foreground: 'text-primary',
  card: 'layer-01',
  'card-foreground': 'text-primary',
  popover: 'layer-01',
  'popover-foreground': 'text-primary',
  primary: 'button-primary',
  'primary-foreground': 'text-on-color',
  secondary: 'button-secondary',
  'secondary-foreground': 'text-on-color',
  muted: 'layer-02',
  'muted-foreground': 'text-secondary',
  accent: 'layer-hover-01',
  'accent-foreground': 'text-primary',
  destructive: 'button-danger-primary',
  'destructive-foreground': 'text-on-color',
  border: 'border-subtle-01',
  input: 'border-strong-01',
  ring: 'focus',
}

/** tailwind.css — тема Tailwind 4: палитра и углы Tailwind сброшены, остаются только токены. */
export function tailwind({ tokens, scale }) {
  const names = Object.keys(tokens.themes['светлая'].colors)
  const v = (n) => `var(--cds-${n})`
  const lines = []
  lines.push(`/* ${HEAD('tokens.json и scale.json')}`)
  lines.push(`   Подключение (Tailwind 4): @import "tailwindcss"; @import "<путь>/design/dist/tokens.css"; @import "<путь>/design/dist/tailwind.css";`)
  lines.push(`   Палитра Tailwind (bg-red-500 …) и его углы сброшены: есть только цвета Carbon, статусы и псевдонимы shadcn.`)
  lines.push(`   Отступы — шаг Tailwind 0.25rem; шкала Carbon = p-0.5 · 1 · 2 · 3 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 40. */`)
  lines.push('@theme {')
  lines.push('  --color-*: initial;')
  lines.push('  --radius-*: initial;')
  lines.push('}')
  lines.push('')
  lines.push('@theme inline {')
  lines.push('  /* цвета Carbon и статусов — меняются вместе с темой */')
  for (const n of names) lines.push(`  --color-${n}: ${v(n)};`)
  lines.push('  --color-transparent: transparent;')
  lines.push('  --color-current: currentColor;')
  lines.push('  /* псевдонимы shadcn/ui */')
  for (const [k, n] of Object.entries(SHADCN)) lines.push(`  --color-${k}: ${v(n)};`)
  lines.push('  /* шрифт */')
  lines.push(`  --font-sans: ${v('font-sans')};`)
  lines.push(`  --font-mono: ${v('font-mono')};`)
  lines.push('  /* наборы текста Carbon: text-body-01, text-heading-03 … */')
  for (const [k] of tokenEntries(scale.type)) {
    lines.push(`  --text-${k}: ${v(`${k}-font-size`)};`)
    lines.push(`  --text-${k}--line-height: ${v(`${k}-line-height`)};`)
    lines.push(`  --text-${k}--letter-spacing: ${v(`${k}-letter-spacing`)};`)
    lines.push(`  --text-${k}--font-weight: ${v(`${k}-font-weight`)};`)
  }
  lines.push('  /* углы: у Carbon прямые; sm и md, lg, xl для shadcn — см. scale.json → radius */')
  lines.push(`  --radius-sm: ${v('radius-sm')};`)
  for (const k of ['md', 'lg', 'xl']) lines.push(`  --radius-${k}: ${v('radius-none')};`)
  lines.push(`  --radius-full: ${v('radius-full')};`)
  lines.push('  /* движение: duration-move, ease-move — наше правило 0,6 с */')
  for (const [k] of tokenEntries(scale.easing)) lines.push(`  --ease-${k}: ${v(`easing-${k}`)};`)
  lines.push(`  --shadow-raised: ${v('shadow-raised')};`)
  lines.push('}')
  lines.push('')
  lines.push('/* duration-move → 0,6 с из токена (Tailwind сам длительности из темы не берёт) */')
  lines.push('@utility duration-move {')
  lines.push(`  transition-duration: ${v('duration-move')};`)
  lines.push(`  --tw-duration: ${v('duration-move')};`)
  lines.push('}')
  return lines.join('\n') + '\n'
}

/** tokens.ts — то же для кода TypeScript (ДС-React, дашборд, тесты). */
export function ts({ tokens, scale, statuses }) {
  const themes = {}
  for (const [name, t] of Object.entries(tokens.themes)) themes[THEME_ATTR[name]] = t.colors
  const scaleObj = Object.fromEntries(scaleVars(scale))
  const j = (x) => JSON.stringify(x, null, 2)
  return `// ${HEAD('tokens.json, scale.json и statuses.json')}
// Цвета — IBM Carbon ${tokens.source.version} (${tokens.source.license}); шрифт — ${tokens.font.family} (OFL-1.1).

/** Цвета обеих тем: ключ — значение атрибута data-theme. */
export const themes = ${j(themes)} as const

export type Theme = keyof typeof themes
export type ColorToken = keyof typeof themes.light

/** Палитра продуктов: тон статуса (закрытый список) → токен знака; к нему есть \`-text\` и \`-background\`. */
export const tones = ${j(tokens.palettes.product)} as const

export type Tone = keyof typeof tones

/** Палитра Карты и дашборда (KARTA-VIEW C-SCR-3): цвет состояния → токен рамки и полосы карточки. Серый — не цвет состояния. */
export const kartaTones = ${j(tokens.palettes.karta)} as const

export type KartaTone = keyof typeof kartaTones

/** Закрытый список статусов: слово на экране (\`say\`) — из закона; тон продукта (\`tone\`) и цвет Карты (\`karta\`, null — без цвета) — отсюда. */
export const statuses = ${j(statuses.statuses)} as const

export type StatusId = (typeof statuses)[number]['id']

/** Шкалы без цвета: имя CSS-переменной без \`--cds-\` → значение. */
export const scale = ${j(scaleObj)} as const

export type ScaleToken = keyof typeof scale

/** Ссылка на токен для style и CSS-in-JS: var(--cds-…). */
export const cssVar = <N extends ColorToken | ScaleToken>(name: N) => \`var(--cds-\${name})\` as const

/** Три цвета тона: знак (значок, точка, рамка), текст и фон метки. */
export function toneColors(tone: Tone) {
  const t = tones[tone]
  return { mark: cssVar(t), text: cssVar(\`\${t}-text\`), background: cssVar(\`\${t}-background\`) }
}

/** Цвет состояния на Карте: var(--cds-…) или null (без цвета). */
export function kartaColor(id: StatusId) {
  const k = statusById(id).karta
  return k === null ? null : cssVar(kartaTones[k])
}

export function statusById(id: StatusId) {
  const s = statuses.find((x) => x.id === id)
  if (!s) throw new Error(\`нет статуса \${id}\`)
  return s
}
`
}

/** Всё, что пишет build.mjs: путь от design/ → содержимое. */
export function outputs() {
  const all = load()
  const fontData = (f) => `data:font/woff2;base64,${readFileSync(join(DESIGN, f)).toString('base64')}`
  return {
    'dist/tokens.css': css(all),
    'dist/tailwind.css': tailwind(all),
    'dist/tokens.ts': ts(all),
    'dist/showcase.html': showcase({ ...all, css: css(all, fontData), contrast: checkAll(all.tokens), THEME_ATTR }),
    ...vkuiOutputs(all),
  }
}
