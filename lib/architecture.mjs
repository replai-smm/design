// Устройство ДС — машиной: реестр компонентов (react/src/registry.json) против исходников и историй.
// Чистые функции: тест зовёт их на настоящей ДС (нарушений ноль) и на приманке (__tests__/bait/architecture — каждое
// правило обязано сработать). Правила:
//   anatomy/missing   — у экспорта нет записи в реестре или запись без экспорта
//   anatomy/index     — в index.ts не `export { … }`: `export *`, `export default`, `export const` прячут экспорты от реестра
//   level/unknown     — уровень не из списка уровней
//   level/file        — в одном файле компоненты разных уровней
//   level/import      — файл берёт компонент своего или верхнего уровня (свой — только база уровня или исключение с «почему»)
//   meaning/duplicate — смысл уже занят другим компонентом: один смысл — один компонент
//   near/unknown      — пара «рядом» без второго компонента или без «почему»
//   shelf/level       — полка истории не равна уровню компонента
//   product/unknown   — продукт не из registry.products
//   vocab/own         — своё перечисление тона или хода вместо словаря (lib/vocab.ts)
//   glyph/unicode     — знак-значок символом (◀ ▶ × ⇡ …) вместо Icon
//   svg/own           — свой <svg> вне файлов, названных в реестре
//   shape/pill        — таблетка (rounded-full) вне файлов, названных в реестре
//   tone/fill         — заливка статуса (роль `*-fill`) вне файлов, названных в реестре: вне сетки статуса подложка — только
//                       у «опасно» и «внимание»
//   readme/levels     — таблица уровней в README расходится с реестром (readmeProblems)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { maskComments } from '../lint/scan.mjs'
import { storyTitle } from '../lint/principles.mjs'

/** Экспортированные компоненты index.ts: имена с большой буквы, не типы. */
export function exportedComponents(index) {
  const out = new Set()
  for (const m of index.matchAll(/export\s*\{([^}]*)\}/g))
    for (const part of m[1].split(',')) {
      const name = part.trim()
      if (!name || /^type\s/.test(name)) continue
      if (/^[A-Z][A-Za-z0-9]*$/.test(name) && /[a-z]/.test(name) && !/^[A-Z0-9_]+$/.test(name)) out.add(name)
    }
  return out
}

/** Файлы компонентов, которые берёт файл: ['Icon.tsx', …] — './Icon', './Icon.tsx', '../components/Icon', import('./Icon'). */
export function importsOf(src) {
  return [...maskComments(src, 'js').matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"](?:\.\.?\/)+(?:components\/)?([A-Za-z]+)(?:\.tsx?)?['"]/g)].map((m) => `${m[1]}.tsx`)
}

/** Утверждения index.ts, не похожие на `export { … }` / `export type { … }`: их имена реестр не видит. */
export function indexProblems(index) {
  return [...maskComments(index, 'js').matchAll(/^[ \t]*export\b(?!\s*\{|\s+type\s*\{).*/gm)].map((m) => m[0].trim().slice(0, 80))
}

const TONE_WORDS = /'(?:error|warning|success|info|danger|neutral|active|finished|complete|incomplete|current|running|done|опасно|внимание|хорошо|инфо|нейтрально)'/
const FILL = /(?<![\w-])(?:[a-z0-9-]+:)*[a-z]+-[a-z]+-fill(?![\w-])/
const GLYPH = /[←-⇿⌀-⏿■-◿☀-➿⬀-⯿×\u{1F300}-\u{1FAFF}]/u

/** Проблемы исходника одного компонента (словари, знаки, svg, таблетки, заливка статуса). */
export function sourceProblems(file, src, registry) {
  const out = []
  const code = maskComments(src, 'js')
  const typed = code.replace(/(?:Extract|Exclude)<(?:Tone|Progress)\s*,[^>]*>/g, '')
  for (const m of code.matchAll(/\btype\s+(\w*(?:Tone|Progress)\w*)\s*=\s*(?!\s|(?:Extract|Exclude)<(?:Tone|Progress)\b)/g))
    out.push({ rule: 'vocab/own', file, text: `своё перечисление «${m[1]}» — тон и ход берутся из словаря lib/vocab.ts` })
  for (const line of typed.split('\n'))
    if (/(?:\btype\s+\w+\s*=|\??:)\s*'[^']*'\s*\|(?!\|)/.test(line) && TONE_WORDS.test(line)) out.push({ rule: 'vocab/own', file, text: `слова тона или хода своим списком: ${line.trim().slice(0, 80)}` })
  const strings = code.replace(/\/[^/\n]+\/[gimsuy]*/g, '')
  for (const [i, line] of strings.split('\n').entries()) {
    const g = GLYPH.exec(line)
    if (g) out.push({ rule: 'glyph/unicode', file, text: `строка ${i + 1}: знак «${g[0]}» символом — значок берётся из Icon` })
  }
  if (/<svg\b/.test(code) && !registry.svg?.[file]) out.push({ rule: 'svg/own', file, text: 'свой <svg>: значок — Icon, рисунок — Chart или Diagram' })
  if (/\brounded-full\b/.test(code) && !registry.pill?.[file]) out.push({ rule: 'shape/pill', file, text: 'таблетка (rounded-full) — только у метки, счётчика, аватара и точек (решение Б2)' })
  const fill = FILL.exec(code)
  if (fill && !registry.fill?.[file]) out.push({ rule: 'tone/fill', file, text: `заливка статуса «${fill[0]}» — только в сетке статуса (registry.json → fill); вне её подложка — только у «опасно» и «внимание»` })
  return out
}

/**
 * Проверить устройство: { registry, index — текст index.ts, sources — { 'Button.tsx': текст }, stories — { 'Button.stories.tsx': текст } }.
 * Возвращает [{ rule, file?, text }].
 */
export function checkArchitecture({ registry, index, sources, stories }) {
  const out = []
  const put = (rule, text, file) => out.push({ rule, text, ...(file ? { file } : {}) })
  const levels = registry.levels
  const comps = registry.components
  const exported = exportedComponents(index)
  for (const line of indexProblems(index)) put('anatomy/index', `index.ts: «${line}» — только \`export { … }\`: иначе экспорт не виден реестру`)
  for (const name of exported) if (!comps[name]) put('anatomy/missing', `«${name}» экспортирован, а в реестре его нет: уровень, смысл, анатомия`)
  for (const name of Object.keys(comps)) if (!exported.has(name)) put('anatomy/missing', `«${name}» в реестре, а в index.ts его нет`)

  const levelOfFile = {}
  for (const [name, c] of Object.entries(comps)) {
    if (!levels.includes(c.level) || c.level === 'Основы') put('level/unknown', `«${name}»: уровня «${c.level}» нет (уровни компонентов: ${levels.slice(1).join(' · ')})`)
    if (c.product && !registry.products.includes(c.product)) put('product/unknown', `«${name}»: продукт «${c.product}» — только ${registry.products.join(' или ')}`)
    if (!sources[c.file]) put('anatomy/missing', `«${name}»: файла ${c.file} нет`, c.file)
    if (levelOfFile[c.file] && levelOfFile[c.file] !== c.level) put('level/file', `в ${c.file} компоненты двух уровней: ${levelOfFile[c.file]} и ${c.level} — раздели файл`, c.file)
    levelOfFile[c.file] ??= c.level
    for (const [other, why] of Object.entries(c.near ?? {})) if (!comps[other] || !String(why).trim()) put('near/unknown', `«${name}» рядом с «${other}»: ${comps[other] ? 'нет «почему»' : 'такого компонента нет'}`)
  }

  const seen = new Map()
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  for (const [name, c] of Object.entries(comps)) {
    const key = norm(c.meaning ?? '')
    if (!key) put('meaning/duplicate', `«${name}»: смысл не назван`)
    else if (seen.has(key)) put('meaning/duplicate', `«${name}» и «${seen.get(key)}» — один смысл «${c.meaning}»: один смысл — один компонент`)
    else seen.set(key, name)
  }

  const rank = (file) => levels.indexOf(levelOfFile[file])
  for (const [file, src] of Object.entries(sources)) {
    if (!levelOfFile[file]) continue
    for (const dep of importsOf(src)) {
      if (!levelOfFile[dep]) continue
      const exc = registry.sameLevel?.[`${file} → ${dep}`]
      if (rank(dep) > rank(file)) put('level/import', `${file} (${levelOfFile[file]}) берёт ${dep} (${levelOfFile[dep]}) — уровень выше`, file)
      else if (rank(dep) === rank(file) && !registry.base?.[dep] && !exc) put('level/import', `${file} берёт ${dep} своего уровня «${levelOfFile[file]}»: только база уровня или исключение с «почему» в реестре`, file)
    }
    out.push(...sourceProblems(file, src, registry))
  }

  for (const [file, text] of Object.entries(stories)) {
    const base = file.replace('.stories.tsx', '')
    const level = levelOfFile[`${base}.tsx`] ?? comps[base]?.level
    const title = storyTitle(text)
    const shelf = title?.split('/')[0]
    if (!title || !levels.includes(shelf)) put('shelf/level', `${file}: полка «${title}» — не уровень (${levels.join(' · ')})`, file)
    else if (level && shelf !== level) put('shelf/level', `${file}: полка «${shelf}», а уровень компонента — «${level}»`, file)
  }
  return out
}

/** Таблица «Уровни» корневого README против реестра: у каждого уровня те же компоненты — [{ rule: 'readme/levels', text }]. */
export function readmeProblems(readme, registry) {
  const section = readme.split(/^## Уровни\s*$/m)[1]?.split(/^## /m)[0] ?? ''
  const listed = {}
  for (const row of section.split('\n').filter((l) => l.startsWith('|')).slice(2)) {
    const [level, names = ''] = row.split('|').slice(1, -1).map((c) => c.trim())
    listed[level] = new Set(names.match(/\b[A-Z][a-z][A-Za-z0-9]*\b/g) ?? [])
  }
  const out = []
  const put = (text) => out.push({ rule: 'readme/levels', text })
  for (const level of registry.levels) if (!listed[level]) put(`в README таблицы «Уровни» нет строки «${level}»`)
  for (const [name, c] of Object.entries(registry.components)) if (!listed[c.level]?.has(name)) put(`«${name}» (${c.level}) в реестре, а в README в строке уровня его нет`)
  for (const [level, names] of Object.entries(listed))
    for (const name of names) if (registry.components[name]?.level !== level) put(`«${name}» в README в строке «${level}», а в реестре его там нет`)
  return out
}

/** Прочитать папку ДС-React (react/src) или приманки той же формы. */
export function readTree(src) {
  const dir = join(src, 'components')
  const files = existsSync(dir) ? readdirSync(dir) : []
  const pick = (re) => Object.fromEntries(files.filter((f) => re.test(f)).map((f) => [f, readFileSync(join(dir, f), 'utf8')]))
  return {
    registry: JSON.parse(readFileSync(join(src, 'registry.json'), 'utf8')),
    index: readFileSync(join(src, 'index.ts'), 'utf8'),
    sources: pick(/^(?!.*\.stories\.)[A-Za-z]+\.tsx$/),
    stories: pick(/\.stories\.tsx$/),
  }
}
