// Сторож «только токены» (признак облика look.tokens, CONCEPT §3.4): в коде экранов нет сырых цветов и
// произвольных значений Tailwind. Один сканер текста на всё — JS/TS/JSX, CSS, HTML, ванильный JS DF-Agency:
// ему не нужен разборщик, поэтому он же работает и правилом ESLint (eslint-plugin.mjs), и сам по себе (cli.mjs).
//
// Что ловит:
//   ds/raw-color      — #fff, #12345678, rgb(…), rgba(…), hsl(…), hwb(…), lab(…), lch(…), oklab(…), oklch(…)
//   ds/arbitrary      — произвольное значение Tailwind: w-[24rem], text-[15px], bg-[#fff], [mask-type:alpha]
//   ds/palette        — класс палитры Tailwind: bg-red-500, text-slate-700, border-white (палитра сброшена)
// Что можно:
//   ссылка на токен в скобках — bg-[var(--cds-layer-01)]; варианты — data-[state=open]:, aria-[x]:, [&_svg]:;
//   строка с пометкой `ds-allow: <причина>` (причина обязательна) — исключение видно в ревью.

export const RULES = {
  'ds/raw-color': 'сырой цвет «{v}» — возьми токен: var(--cds-…) или класс Tailwind из темы дизайн-системы',
  'ds/arbitrary': 'произвольное значение «{v}» — возьми шаг шкалы или токен (var(--cds-…))',
  'ds/palette': 'класс палитры Tailwind «{v}» — палитры нет, есть токены Carbon (bg-layer-01, text-text-secondary, …)',
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
  return found.sort((a, b) => a.index - b.index)
}

export const message = (f) => RULES[f.rule].replace('{v}', f.value)
