#!/usr/bin/env node
// Правила дизайн-системы для продуктов и самой ДС — машиной. Четыре проверки:
//
//   полки   — полка Storybook. ДС: полка = уровень компонента (react/src/registry.json → levels). Продукт: только
//             `Экраны/SCR-NN <экран>/…` — продукт строит экраны, а компоненты берёт из ДС и не дублирует их полки.
//   токены  — только роли и шкалы (scan.mjs: сырые цвета и размеры, произвольные значения, палитра и классы вне шкал).
//   свои    — продукт не заводит свой компонент с именем компонента ДС: недостающее добавляют в ДС.
//   импорт  — продукт берёт из ДС только то, что названо в `exports` её package.json: `@replai-smm/design/react/src/…`
//             мимо index.ts и реестра — глубокий импорт (ds/deep-import).
//
// Новое держит, старое — долг (против базы PR, без файла чисел): новый файл историй или файл, чья полка была верной, —
// красный; нарушений «только токены» в файле стало больше — красный; новый свой компонент с именем ДС и новый
// глубокий импорт — красные.
// Строка с `ds-allow: <причина>` не считается (причина обязательна).
//
//   node node_modules/@replai-smm/design/lint/principles.mjs --kind product --base origin/main src   — продукт на PR
//   node node_modules/@replai-smm/design/lint/principles.mjs --kind ds --strict react/src            — сама ДС: держит всё
// Без --base и --strict — только отчёт (выход 0). Пути — от --repo (по умолчанию cwd).
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { scan, message, maskComments } from './scan.mjs'
import { files as walk } from './cli.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))

/** Уровни ДС — полки её Storybook (registry.json). */
export const LEVELS = JSON.parse(readFileSync(join(HERE, '../react/src/registry.json'), 'utf8')).levels
export const SHELVES = {
  ds: { ok: new RegExp(`^(${LEVELS.join('|')})\\/[^/\\s][^]*$`), say: LEVELS.map((l) => `\`${l}/…\``).join(' · ') },
  product: { ok: /^Экраны\/SCR-\d+(?: [^/]+)?(?:\/[^/]+)*$/, say: '`Экраны/SCR-NN <экран>` (истории — состояния и части экрана)' },
}
const DS_SHELF = new RegExp(`^(${[...LEVELS, 'Компоненты', 'ДС', 'Дизайн-система', 'Design System', 'Примитивы'].join('|')})\\/`, 'i')

const STORY = /\.stories\.(?:[jt]sx?|mdx)$/
const CODE = /\.(?:[jt]sx?|mjs|cjs|vue|svelte)$/
// не код экранов: тесты, фикстуры и чужое
const NOT_UI = /(^|\/)(__tests__|__mocks__|tests?|e2e|fixtures|vendor|node_modules|dist|build|storybook-static|\.process|\.storybook)\/|\.(test|spec)\.[^/]+$/
const ALLOW = /ds-allow:\s*\S/

/** Имена компонентов ДС-React (с большой буквы, не типы) — из react/src/index.ts. */
export function dsNames(index = join(HERE, '../react/src/index.ts')) {
  const src = readFileSync(index, 'utf8')
  const out = new Set()
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim()
      if (/^type\s/.test(name)) continue
      const id = name.split(/\s+as\s+/).pop()?.trim()
      if (id && /^[A-Z][A-Za-z0-9]*$/.test(id) && /[a-z]/.test(id)) out.add(id)
    }
  }
  for (const m of src.matchAll(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9]*)/g)) out.add(m[1])
  return out
}

const PACKAGE = '@replai-smm/design'
/** Пути пакета, которые продукт может импортировать: ключи `exports` его package.json (`./fonts/*` — любой файл папки). */
export function publicPaths(pkg = join(HERE, '../package.json')) {
  return Object.keys(JSON.parse(readFileSync(pkg, 'utf8')).exports).map((k) => new RegExp(`^${k.slice(2).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace('*', '.+')}$`))
}

/** Импорты из пакета ДС не по `exports`: [{ spec, line }]. Глубокий путь — мимо index.ts и реестра (ds/deep-import). */
export function deepImports(text, paths = publicPaths()) {
  const out = []
  const re = new RegExp(`(?:\\bfrom\\s*|\\bimport\\s*\\(?\\s*|\\brequire\\s*\\(\\s*)(["'\`])${PACKAGE}/([^"'\`]+)\\1`, 'g')
  const code = maskComments(text, 'js')
  const lines = text.split('\n')
  for (const m of code.matchAll(re)) {
    const line = code.slice(0, m.index).split('\n').length
    if (!paths.some((r) => r.test(m[2])) && !ALLOW.test(lines[line - 1])) out.push({ spec: `${PACKAGE}/${m[2]}`, line })
  }
  return out
}

/** Название полки из файла историй: title объекта `export default` (CSF) или `<Meta title>` (MDX); нет — null. */
export function storyTitle(text) {
  const mdx = text.match(/<Meta\b[^>]*\btitle=(["'])([^"']+)\1/)
  if (mdx) return mdx[2]
  let start = -1
  const direct = /export\s+default\s*\{/.exec(text)
  if (direct) start = direct.index + direct[0].length - 1
  else {
    const named = /export\s+default\s+([A-Za-z_$][\w$]*)/.exec(text)
    if (named) {
      const decl = new RegExp(`(?:const|let|var)\\s+${named[1]}\\b[^=]*=\\s*\\{`).exec(text)
      if (decl) start = decl.index + decl[0].length - 1
    }
  }
  if (start < 0) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (c === '"' || c === "'" || c === '`') {
      const end = text.indexOf(c, i + 1)
      if (end < 0) return null
      i = end
    } else if (c === '{' || c === '(' || c === '[') depth++
    else if (c === '}' || c === ')' || c === ']') {
      if (--depth === 0) return null
    } else if (depth === 1 && text.startsWith('title', i) && /[\s,{]/.test(text[i - 1])) {
      const key = /title\s*:/y
      key.lastIndex = i
      if (!key.test(text)) continue
      const lit = /title\s*:\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/y
      lit.lastIndex = i
      const t = lit.exec(text)
      return t ? t[2] : null
    }
  }
  return null
}

/** Нарушение полки: null — полка верная. */
export function shelfProblem(title, kind) {
  const rule = SHELVES[kind === 'ds' ? 'ds' : 'product']
  if (title === null) return `у файла историй нет title — назови полку явно: ${rule.say}`
  if (rule.ok.test(title)) return null
  if (kind !== 'ds' && DS_SHELF.test(title))
    return `«${title}» — это полка дизайн-системы: в Storybook продукта ДС не дублируется. Полка продукта — ${rule.say}`
  return `«${title}» — не полка: ${rule.say}`
}

/** Объявления компонентов с именами ДС: [{ name, line }]. */
export function ownComponents(text, names) {
  const out = []
  const lines = text.split('\n')
  const re = /(?<![\w$.])(?:function\s*\*?\s*|class\s+|(?:const|let|var)\s+)([A-Z][A-Za-z0-9]*)\b(?=\s*[(<:={]|\s+extends\b)/g
  for (const m of text.matchAll(re)) {
    if (!names.has(m[1])) continue
    const line = text.slice(0, m.index).split('\n').length
    if (ALLOW.test(lines[line - 1])) continue
    out.push({ name: m[1], line })
  }
  return out
}

const git = (repo, args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] })
const show = (repo, ref, path) => {
  try {
    return git(repo, ['show', `${ref}:${path}`])
  } catch {
    return null
  }
}

/** Файлы для проверки: [{ path, was }] — was — путь на базе (null — файла не было). */
export function changed(repo, base, roots) {
  const mb = git(repo, ['merge-base', base, 'HEAD']).trim()
  const out = new Map()
  const diff = git(repo, ['diff', '--name-status', '-M', '-z', mb, '--', ...roots]).split('\0').filter(Boolean)
  for (let i = 0; i < diff.length; ) {
    const st = diff[i++]
    if (/^[RC]/.test(st)) {
      const from = diff[i++]
      const to = diff[i++]
      out.set(to, st[0] === 'R' ? from : null)
    } else {
      const p = diff[i++]
      if (st === 'D') continue
      out.set(p, st === 'A' ? null : p)
    }
  }
  for (const p of git(repo, ['ls-files', '--others', '--exclude-standard', '-z', '--', ...roots]).split('\0').filter(Boolean)) out.set(p, null)
  return { mb, list: [...out].map(([path, was]) => ({ path, was })).sort((a, b) => a.path.localeCompare(b.path)) }
}

/** Сравнить нарушения головы и базы как мультимножества (правило + значение): что прибавилось. */
function added(now, before) {
  const left = new Map()
  for (const f of before) left.set(`${f.rule} ${f.value}`, (left.get(`${f.rule} ${f.value}`) ?? 0) + 1)
  return now.filter((f) => {
    const k = `${f.rule} ${f.value}`
    const n = left.get(k) ?? 0
    if (n > 0) {
      left.set(k, n - 1)
      return false
    }
    return true
  })
}

/**
 * Проверить: { block: [], warn: [] } — элемент { file, line, check, text }.
 * mode: 'strict' — всё держит; 'ratchet' — новое держит, старое — предупреждение; 'report' — всё предупреждение.
 */
export function check({ repo, kind, roots, base, strict, names = dsNames(), paths = publicPaths() }) {
  const mode = strict ? 'strict' : base ? 'ratchet' : 'report'
  const block = []
  const warn = []
  const put = (hard, item) => (hard ? block : warn).push(item)
  let entries
  let mb = null
  if (base) ({ mb, list: entries } = changed(repo, base, roots))
  else entries = walk(roots.map((r) => resolve(repo, r))).map((f) => ({ path: relative(repo, f).split(sep).join('/'), was: null }))
  const before = (e) => (mode !== 'ratchet' || e.was === null ? null : show(repo, mb, e.was))

  for (const e of entries) {
    const abs = resolve(repo, e.path)
    if (!existsSync(abs)) continue
    const text = readFileSync(abs, 'utf8')
    const story = STORY.test(e.path)
    const old = before(e)

    if (story && !/(^|\/)(node_modules|dist|storybook-static|\.process)\//.test(e.path)) {
      const p = shelfProblem(storyTitle(text), kind)
      if (p) {
        const wasOk = old !== null && !shelfProblem(storyTitle(old), kind)
        const hard = mode === 'strict' || (mode === 'ratchet' && (e.was === null || wasOk))
        const line = Math.max(1, text.slice(0, text.search(/\btitle\s*[:=]/) + 1 || 0).split('\n').length)
        put(hard, { file: e.path, line, check: 'полки', text: hard || mode !== 'ratchet' ? p : `${p} (долг: файл был на старой полке до этого PR)` })
      }
    }

    const ui = kind === 'ds' || !NOT_UI.test(e.path)
    if (ui && /\.(jsx?|tsx?|mjs|cjs|css|scss|pcss|html?|vue|svelte)$/i.test(e.path) && !/(^|\/)(tokens\.(css|ts)|tailwind\.css)$/.test(e.path) && !/\.min\./.test(e.path)) {
      const now = scan(text, e.path)
      const fresh = mode === 'ratchet' ? (old === null ? now : added(now, scan(old, e.path))) : now
      const hard = mode === 'strict' || mode === 'ratchet'
      for (const f of fresh) put(hard, { file: e.path, line: f.line, check: 'токены', text: `${f.rule}: ${message(f)}` })
      if (mode === 'ratchet') {
        const debt = now.length - fresh.length
        if (debt > 0) warn.push({ file: e.path, line: 1, check: 'токены', text: `долг: ${debt} старых нарушений «только токены» в этом файле — почини, раз уж трогаешь` })
      }
    }

    if (kind !== 'ds' && ui && !story && CODE.test(e.path)) {
      const now = ownComponents(text, names)
      const had = new Set(mode === 'ratchet' && old !== null ? ownComponents(old, names).map((c) => c.name) : [])
      for (const c of now) {
        const where = 'возьми его из ДС (`@replai-smm/design`); не хватает — добавь в ДС, а не в продукт'
        const hard = mode === 'strict' || (mode === 'ratchet' && !had.has(c.name))
        put(hard, { file: e.path, line: c.line, check: 'свои', text: `свой компонент «${c.name}» — такой есть в дизайн-системе: ${where}${hard ? '' : ' (долг: был до этого PR)'}` })
      }
    }

    if (kind !== 'ds' && ui && CODE.test(e.path)) {
      const had = new Set(mode === 'ratchet' && old !== null ? deepImports(old, paths).map((d) => d.spec) : [])
      for (const d of deepImports(text, paths)) {
        const hard = mode === 'strict' || (mode === 'ratchet' && !had.has(d.spec))
        put(hard, { file: e.path, line: d.line, check: 'импорт', text: `ds/deep-import: «${d.spec}» мимо index.ts и реестра — бери из '${PACKAGE}'; не хватает — добавь в ДС${hard ? '' : ' (долг: был до этого PR)'}` })
      }
    }
  }
  return { mode, block, warn, files: entries.length }
}

function main(argv) {
  const args = argv.slice(2)
  const opt = (k) => {
    const i = args.indexOf(k)
    return i >= 0 ? args[i + 1] : undefined
  }
  const kind = opt('--kind')
  const repo = resolve(opt('--repo') ?? '.')
  const base = opt('--base')
  const strict = args.includes('--strict')
  const valued = new Set(['--kind', '--repo', '--base'])
  const roots = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]))
  if (!['ds', 'product'].includes(kind ?? '') || !roots.length) {
    console.error('node node_modules/@replai-smm/design/lint/principles.mjs --kind ds|product [--base <ref>] [--strict] [--repo <папка>] <пути…>')
    return 2
  }
  let r
  try {
    r = check({ repo, kind, roots, base, strict })
  } catch (e) {
    const why = String(e.stderr || e.message).trim().split('\n')[0]
    console.error(`✗ дизайн-система не проверена: ${why}${base ? ` (нужна история git до базы ${base}: fetch-depth: 0 и git fetch origin <база>)` : ''}`)
    return 2
  }
  const gh = !!process.env.GITHUB_ACTIONS
  const say = (level, x) => {
    console.log(`${x.file}:${x.line}  ${x.check}  ${x.text}`)
    if (gh) console.log(`::${level} file=${x.file},line=${x.line},title=дизайн-система · ${x.check}::${x.text.replace(/\n/g, ' ')}`)
  }
  if (r.block.length) console.log('Держит (новое):')
  r.block.forEach((x) => say('error', x))
  if (r.warn.length) console.log(r.mode === 'report' ? 'Нарушения (отчёт, без базы PR не держит):' : 'Долг (не держит):')
  r.warn.forEach((x) => say('warning', x))
  const by = (l) => ['полки', 'токены', 'свои', 'импорт'].map((c) => `${c} ${l.filter((x) => x.check === c).length}`).join(' · ')
  console.log(
    r.block.length
      ? `✗ дизайн-система: новое нарушение (${by(r.block)}); долг ${r.warn.length}. Правила — README.md пакета @replai-smm/design`
      : `✓ дизайн-система: нового нарушения нет (файлов ${r.files}; долг ${r.warn.length}${r.warn.length ? `: ${by(r.warn)}` : ''})`,
  )
  return r.block.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv))
}

export { main }
