// Генератор: tokens.json + scale.json + statuses.json → dist/tokens.css, dist/tailwind.css, dist/tokens.ts,
// dist/showcase.html; набор значков → react/src/lib/icons.gen.ts. Тот же код зовут `npm run build` и тест «dist свежий».
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkAll } from './contrast.mjs'
import { showcase } from './showcase.mjs'
import { iconsTs } from './icons.mjs'

export const DESIGN = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => JSON.parse(readFileSync(join(DESIGN, f), 'utf8'))

export const THEMES = ['light', 'dark']

export function load() {
  return { tokens: read('tokens.json'), scale: read('scale.json'), statuses: read('statuses.json') }
}

const HEAD = (src) => `Сгенерировано build.mjs из ${src}. Руками не править: правка — в источнике, потом \`npm run build\`.`
const quote = (f) => (/\s/.test(f) ? `'${f}'` : f)

/** Переменные шкал (без цвета): [имя без --ds-, значение]. */
export function scaleVars(scale) {
  const out = []
  for (const [k, v] of Object.entries(scale.space)) out.push([`space-${k}`, v.value])
  for (const [k, v] of Object.entries(scale.size)) out.push([`size-${k}`, v.value])
  for (const [k, v] of Object.entries(scale.measure)) out.push([`measure-${k}`, v.value])
  for (const [k, v] of Object.entries(scale.font)) out.push([`font-${k}`, v.value.map(quote).join(', ')])
  for (const [k, v] of Object.entries(scale.text)) {
    out.push([`text-${k}-size`, v.size], [`text-${k}-line`, v.line], [`text-${k}-weight`, String(v.weight)])
  }
  for (const [k, v] of Object.entries(scale.radius)) out.push([`radius-${k}`, v.value])
  for (const [k, v] of Object.entries(scale.elevation)) out.push([`elevation-${k}`, v.value.replace('{shadow}', 'var(--ds-shadow)')])
  out.push(['motion-fast', scale.motion.fast.value], ['motion-move', scale.motion.move.value])
  out.push(['ease', `cubic-bezier(${scale.motion.ease.value.join(', ')})`])
  return out
}

const block = (selector, pairs, extra = '') => `${selector} {\n${extra}${pairs.map(([k, v]) => `  --ds-${k}: ${v};`).join('\n')}\n}\n`
const indent = (s) =>
  s
    .split('\n')
    .map((l) => (l ? '  ' + l : l))
    .join('\n')

const WEIGHT = { Regular: 400, SemiBold: 600 }

/** tokens.css — роли обеих тем, шкалы, шрифты. fontUrl(file) — путь к .woff2 из css. */
export function css({ tokens, scale }, fontUrl = (f) => `../${f}`) {
  const colors = (theme) => Object.entries(tokens.colors).map(([k, v]) => [k, v[theme]])
  const faces = Object.values(tokens.font).flatMap(({ family, files }) =>
    files.map(
      (f) =>
        `@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-weight: ${WEIGHT[/-(\w+)\.woff2$/.exec(f)[1]]};\n  font-display: swap;\n  src: url('${fontUrl(f)}') format('woff2');\n}\n`,
    ),
  )
  return [
    `/* ${HEAD('tokens.json и scale.json')}\n   Тема: <html data-theme="light|dark">; без атрибута — как в системе (prefers-color-scheme). */\n`,
    ...faces,
    block(':root', scaleVars(scale)),
    block(':root,\n[data-theme="light"]', colors('light'), '  color-scheme: light;\n'),
    block('[data-theme="dark"]', colors('dark'), '  color-scheme: dark;\n'),
    `@media (prefers-color-scheme: dark) {\n${indent(block(':root:not([data-theme="light"])', colors('dark'), '  color-scheme: dark;\n'))}}\n`,
    `/* Система просит меньше движения — движения нет. */\n@media (prefers-reduced-motion: reduce) {\n${indent(block(':root', [['motion-fast', '0ms'], ['motion-move', '0ms']]))}}\n`,
  ].join('\n')
}

/**
 * tailwind.css — тема Tailwind 4 из ролей и шкал. Всё своё Tailwind сброшено: палитра, числовые отступы и размеры,
 * наборы текста, размеры контейнеров, углы, тени, кривые. Класс существует, только если он — роль или шаг шкалы: `p-4`, `gap-1.5`,
 * `text-sm`, `rounded-lg`, `max-w-md` в теме нет вовсе.
 */
export function tailwind({ tokens, scale }) {
  const v = (n) => `var(--ds-${n})`
  const L = []
  L.push(`/* ${HEAD('tokens.json и scale.json')}`)
  L.push('   Подключение: @import "tailwindcss"; @import "@replai-smm/design/tokens.css"; @import "@replai-smm/design/tailwind.css"; */')
  L.push('@theme {')
  for (const ns of ['color', 'spacing', 'radius', 'shadow', 'inset-shadow', 'drop-shadow', 'text-shadow', 'text', 'font', 'font-weight', 'leading', 'tracking', 'ease', 'animate', 'container'])
    L.push(`  --${ns}-*: initial;`)
  L.push('  --spacing: initial;')
  L.push('}')
  L.push('')
  L.push('@theme inline {')
  for (const n of Object.keys(tokens.colors)) L.push(`  --color-${n}: ${v(n)};`)
  L.push('  --color-transparent: transparent;')
  L.push('  --color-current: currentColor;')
  L.push('  --spacing-0: 0px;')
  for (const k of Object.keys(scale.space)) L.push(`  --spacing-${k}: ${v(`space-${k}`)};`)
  for (const k of Object.keys(scale.size)) L.push(`  --spacing-${k}: ${v(`size-${k}`)};`)
  // числом, не var(): из ширины контейнера Tailwind строит условие @container (`@form:`), а в условии var() не читается
  for (const [k, m] of Object.entries(scale.measure)) L.push(`  --container-${k}: ${m.value};`)
  for (const k of Object.keys(scale.font)) L.push(`  --font-${k}: ${v(`font-${k}`)};`)
  L.push('  --font-weight-normal: 400;')
  L.push('  --font-weight-semibold: 600;')
  for (const k of Object.keys(scale.text)) {
    L.push(`  --text-${k}: ${v(`text-${k}-size`)};`)
    L.push(`  --text-${k}--line-height: ${v(`text-${k}-line`)};`)
    L.push(`  --text-${k}--font-weight: ${v(`text-${k}-weight`)};`)
  }
  for (const k of Object.keys(scale.radius)) L.push(`  --radius-${k}: ${v(`radius-${k}`)};`)
  for (const k of Object.keys(scale.elevation)) if (k !== 'flat') L.push(`  --shadow-${k}: ${v(`elevation-${k}`)};`)
  L.push(`  --ease-standard: ${v('ease')};`)
  L.push('}')
  for (const k of ['fast', 'move']) {
    L.push('')
    L.push(`@utility duration-${k} {`)
    L.push(`  transition-duration: ${v(`motion-${k}`)};`)
    L.push(`  --tw-duration: ${v(`motion-${k}`)};`)
    L.push('}')
  }
  return L.join('\n') + '\n'
}

/** tokens.ts — роли, тоны, статусы и шкалы для TypeScript. */
export function ts({ tokens, scale, statuses }) {
  const j = (x) => JSON.stringify(x, null, 2)
  const colors = Object.fromEntries(THEMES.map((t) => [t, Object.fromEntries(Object.entries(tokens.colors).map(([k, x]) => [k, x[t]]))]))
  return `// ${HEAD('tokens.json, scale.json и statuses.json')}

/** Роли цвета обеих тем: ключ — значение атрибута data-theme. */
export const colors = ${j(colors)} as const

export type Theme = keyof typeof colors
export type Role = keyof typeof colors.light

/** Словарь тонов: слово → роли знака, текста, подложки и заливки сетки статуса (null — у тона её нет). */
export const tones = ${j(tokens.tones)} as const

export type Tone = keyof typeof tones

/** Закрытый список статусов: слово на экране (\`say\`) — из закона Карты, тон — из словаря тонов. */
export const statuses = ${j(statuses.statuses)} as const

export type StatusId = (typeof statuses)[number]['id']

/** Шкалы: имя CSS-переменной без \`--ds-\` → значение. */
export const scale = ${j(Object.fromEntries(scaleVars(scale)))} as const

export type ScaleToken = keyof typeof scale

/** Ссылка на роль или шаг для style и SVG: var(--ds-…). */
export const cssVar = <N extends Role | ScaleToken>(name: N) => \`var(--ds-\${name})\` as const
`
}

/** Всё, что пишет build.mjs: путь от корня репо → содержимое. */
export function outputs() {
  const all = load()
  const fontData = (f) => `data:font/woff2;base64,${readFileSync(join(DESIGN, f)).toString('base64')}`
  return {
    'dist/tokens.css': css(all),
    'dist/tailwind.css': tailwind(all),
    'dist/tokens.ts': ts(all),
    'dist/showcase.html': showcase({ ...all, css: css(all, fontData), contrast: checkAll(all.tokens) }),
    'react/src/lib/icons.gen.ts': iconsTs(),
  }
}
