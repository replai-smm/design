// Сторож «только токены» (признак облика look.tokens, CONCEPT §3.4): в коде экранов нет сырых цветов и
// произвольных значений Tailwind. Один сканер текста на всё — JS/TS/JSX, CSS, HTML, ванильный JS DF-Agency:
// ему не нужен разборщик, поэтому он же работает и правилом ESLint (eslint-plugin.mjs), и сам по себе (cli.mjs).
//
// Что ловит:
//   ds/raw-color      — #fff, #12345678, rgb(…), rgba(…), hsl(…), hwb(…), lab(…), lch(…), oklab(…), oklch(…)
//   ds/arbitrary      — произвольное значение Tailwind: w-[24rem], text-[15px], bg-[#fff], [mask-type:alpha]
//   ds/palette        — класс палитры Tailwind: bg-red-500, text-slate-700, border-white (палитра сброшена)
//   ds/raw-size       — сырой размер у отступа, места, размера, шрифта, угла: `padding: 12px`, `font-size: .8rem`,
//                       `style="width:240px"`, `style={{ gap: 12 }}` — в CSS, в <style> и в атрибуте style
//                       (у Tailwind то же ловит ds/arbitrary). 0 и 1px (волосяная линия), %, vw/vh, ch, fr — можно; max-width и
//                       max-height — предел меры колонки, не шаг шкалы, — тоже можно;
//                       @media и @container — не объявления, их не трогает
// Что можно:
//   ссылка на токен в скобках — bg-[var(--cds-layer-01)]; варианты — data-[state=open]:, aria-[x]:, [&_svg]:;
//   строка с пометкой `ds-allow: <причина>` (причина обязательна) — исключение видно в ревью.

export const RULES = {
  'ds/raw-color': 'сырой цвет «{v}» — возьми токен: var(--cds-…) или класс Tailwind из темы дизайн-системы',
  'ds/arbitrary': 'произвольное значение «{v}» — возьми шаг шкалы или токен (var(--cds-…))',
  'ds/palette': 'класс палитры Tailwind «{v}» — палитры нет, есть токены Carbon (bg-layer-01, text-text-secondary, …)',
  'ds/raw-size': 'сырой размер «{v}» — возьми токен шкалы: var(--cds-spacing-…), набор текста, или компонент ДС',
}

// Свойства, у которых размер берётся из шкалы ДС (отступы, места, размеры, текст, углы).
const SIZE_PROP_CSS =
  '(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|(?:row-|column-)?gap|inset(?:-(?:block|inline)(?:-(?:start|end))?)?|top|right|bottom|left|(?:min-)?(?:width|height|block-size|inline-size)|font-size|line-height|letter-spacing|border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius|flex-basis'
// объявление: перед свойством — начало блока, «;», начало строки или кавычка атрибута style; у @media перед ним «(»
const CSS_DECL = new RegExp(`(?<=(?:^|[{;"'])\\s*)(${SIZE_PROP_CSS})\\s*:\\s*([^;{}"'\\n]+)`, 'gim')
const SIZE_PROP_JS =
  '(?:margin|padding)(?:Top|Right|Bottom|Left|Block|Inline)?(?:Start|End)?|(?:row|column)?[gG]ap|inset|top|right|bottom|left|(?:min)?(?:[wW]idth|[hH]eight)|fontSize|lineHeight|letterSpacing|border(?:Top|Bottom)?(?:Left|Right)?Radius|flexBasis'
const JS_DECL = new RegExp(`(?<![\\w$.])(${SIZE_PROP_JS})\\s*:\\s*(-?\\d*\\.?\\d+(?![\\w.])|(['"\`])[^'"\`\\n]*\\3)`, 'g')
const SIZE_UNIT = /(?<![\w.#-])-?(\d*\.?\d+)(px|rem|em|pt)(?![\w-])/g

/** Сырые размеры в тексте значения CSS: «12px», «.8rem» (кроме 0 и 1px; внутри var(…) — запасное значение токена). */
function rawSizes(value) {
  const bare = value.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, (m) => ' '.repeat(m.length))
  const out = []
  for (const m of bare.matchAll(SIZE_UNIT)) {
    const n = Number(m[1])
    if (n === 0 || (n === 1 && m[2] === 'px')) continue
    out.push({ value: m[0], at: m.index })
  }
  return out
}

const HEX = /(?<![\w&#/.-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g
const FN = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g
const PALETTE_NAMES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const PALETTE_UTIL =
  'bg|text|border|border-(?:x|y|t|r|b|l)|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow|inset-shadow|drop-shadow'
const PALETTE = new RegExp(
  `(?<![\\w-])(?:[a-z0-9-]+:)*(?:${PALETTE_UTIL})-(?:(?:${PALETTE_NAMES})-(?:50|[1-9]00|950)|white|black)(?:\\/\\d+)?(?![\\w-])`,
  'g',
)
// утилита-[значение], не вариант (у варианта после скобки — двоеточие или /имя:)
const ARBITRARY = /(?<![\w-])(?:[a-z0-9-]+:)*-?[a-z][a-z0-9-]*-\[([^\]\s]+)\](?![:\w]|\/[\w-]+:)/g
// произвольное свойство [prop:value] целиком
const ARBITRARY_PROP = /(?<=^|[\s"'`{])\[[a-z-]+:[^\]\s]+\](?=$|[\s"'`}])/g

const ALLOW = /ds-allow:\s*\S/

/** Закрыть комментарии пробелами той же длины (координаты не съезжают). */
export function maskComments(text, kind) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  let out = text.replace(/\/\*[\s\S]*?\*\//g, (m) => (ALLOW.test(m) ? m : blank(m)))
  if (kind === 'js') out = out.replace(/(^|[^:\\'"`])\/\/[^\n]*/g, (m, p) => (ALLOW.test(m) ? m : p + blank(m.slice(p.length))))
  if (kind === 'html') out = out.replace(/<!--[\s\S]*?-->/g, blank)
  return out
}

export function kindOf(file) {
  if (/\.(css|scss|pcss)$/i.test(file)) return 'css'
  if (/\.(html?|vue|svelte)$/i.test(file)) return 'html'
  return 'js'
}

/** Куски текста, где пишут CSS: весь файл стилей; в HTML и JS — <style>…</style> и атрибут style="…". [[текст, начало]] */
function cssRegions(src, kind) {
  if (kind === 'css') return [[src, 0]]
  const out = []
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) out.push([m[1], m.index + m[0].indexOf('>') + 1])
  for (const m of src.matchAll(/(?<![\w-])style\s*=\s*(["'])([^"'\n]*)\1/g)) out.push([m[1] + m[2], m.index + m[0].indexOf(m[1])])
  return out
}

/** Найти нарушения в тексте файла: [{ rule, value, line, column, index }]. */
export function scan(text, file = 'x.tsx') {
  const kind = kindOf(file)
  const src = maskComments(text, kind)
  const lines = text.split('\n')
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1)
  const pos = (index) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= index) lo = mid
      else hi = mid - 1
    }
    return { line: lo + 1, column: index - starts[lo] + 1 }
  }
  const found = []
  const push = (rule, value, index) => {
    const p = pos(index)
    if (ALLOW.test(lines[p.line - 1])) return
    found.push({ rule, value, index, ...p })
  }
  for (const m of src.matchAll(HEX)) {
    // в CSS «#abc {» и «#abc,» — селектор id, не цвет
    const after = src.slice(m.index + m[0].length, m.index + m[0].length + 8)
    if (kind === 'css' && /^\s*[{,]/.test(after)) continue
    // в JS «#abc = 1» и «#abc(» — приватное поле или метод класса
    if (kind === 'js' && /^\s*[=(]/.test(after)) continue
    push('ds/raw-color', m[0], m.index)
  }
  for (const m of src.matchAll(FN)) push('ds/raw-color', m[0] + '…)', m.index)
  if (kind !== 'css' || /@apply/.test(src)) {
    for (const m of src.matchAll(ARBITRARY)) {
      if (/^var\(--cds-[a-z0-9-]+\)$/.test(m[1])) continue
      push('ds/arbitrary', m[0], m.index)
    }
    for (const m of src.matchAll(ARBITRARY_PROP)) push('ds/arbitrary', m[0], m.index)
    for (const m of src.matchAll(PALETTE)) push('ds/palette', m[0], m.index)
  }
  for (const [text, at] of cssRegions(src, kind)) {
    for (const d of text.matchAll(CSS_DECL)) {
      const v0 = d.index + d[0].length - d[2].length
      for (const r of rawSizes(d[2])) push('ds/raw-size', `${d[1]}: ${r.value}`, at + v0 + r.at)
    }
  }
  if (kind === 'js') {
    const decl = (text, at) => {
      for (const d of text.matchAll(JS_DECL)) {
        const v0 = d.index + d[0].length - d[2].length
        if (d[3]) {
          for (const r of rawSizes(d[2].slice(1, -1))) push('ds/raw-size', `${d[1]}: ${r.value}`, at + v0 + 1 + r.at)
        } else if (Number(d[2]) !== 0 && d[1] !== 'lineHeight') push('ds/raw-size', `${d[1]}: ${d[2]}`, at + v0)
      }
    }
    // React: style={{ … }}
    for (const m of src.matchAll(/style=\{\{([^{}]*)\}\}/g)) decl(m[1], m.index + 'style={{'.length)
    // ванильный JS: el.style.padding = '12px'
    for (const m of src.matchAll(new RegExp(`\\.style\\.(${SIZE_PROP_JS})\\s*=\\s*(['"\`])([^'"\`\\n]*)\\2`, 'g'))) {
      const v0 = m.index + m[0].length - 1 - m[3].length
      for (const r of rawSizes(m[3])) push('ds/raw-size', `${m[1]}: ${r.value}`, v0 + r.at)
    }
  }
  return found.sort((a, b) => a.index - b.index)
}

export const message = (f) => RULES[f.rule].replace('{v}', f.value)
