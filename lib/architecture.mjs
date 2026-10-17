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
//   product/unknown   — продукт не df и не chat
//   vocab/own         — своё перечисление тона или хода вместо словаря (lib/vocab.ts)
//   glyph/unicode     — знак-значок символом (◀ ▶ × ⇡ …) вместо Icon
//   svg/own           — свой <svg> вне файлов, названных в реестре
//   shape/pill        — таблетка (rounded-full) вне файлов, названных в реестре
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { maskComments } from '../lint/scan.mjs'
import { storyTitle } from '../lint/principles.mjs'

export const PRODUCTS = ['df', 'chat']

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
const GLYPH = /[←-⇿⌀-⏿■-◿☀-➿⬀-⯿×\u{1F300}-\u{1FAFF}]/u

/** Проблемы исходника одного компонента (словари, знаки, svg, таблетки). */
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
    if (c.product && !PRODUCTS.includes(c.product)) put('product/unknown', `«${name}»: продукт «${c.product}» — только ${PRODUCTS.join(' или ')}`)
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
