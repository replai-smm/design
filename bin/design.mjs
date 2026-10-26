#!/usr/bin/env node
// design — дизайн-система в продукте одной командой (как karta): навык для сессии, шаг CI, напоминание хука и сторожа.
//   node node_modules/@replai-smm/design/bin/design.mjs init [--check]  пишет в репо продукта то, что ДС держит сама (идемпотентно):
//        .claude/skills/design/SKILL.md      навык — включается, когда сессия трогает интерфейс
//        .github/workflows/design.yml        шаг CI: `check` и `widths` — красные блокируют слив
//        .claude/settings.json               хук PreToolUse на правку интерфейса: напоминание про навык (не блок)
//        package.json (корень)               скрипт `design` — `check` против origin/main
//      --check ничего не пишет: красный, если файлы ДС в репо отличаются от пакета (правка руками)
//   … design.mjs check [--base <ref>]   сторож «только роли и шкалы, полки, свои компоненты» (lint/principles.mjs --kind product)
//   … design.mjs widths [--storybook <папка>]   сторож ширин (lint/widths.mjs): `design.require` из package.json приложения
//   … design.mjs hook                    хук Claude Code (JSON на stdin): напоминание один раз за сессию
// Приложение — папка, где стоит node_modules с этим пакетом (у продукта с `frontend/` — она); репо — корень git, откуда запущено.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(HERE, '..')
const SKILL_DIR = join(PKG, 'skill')
const NAME = '@replai-smm/design'
const SETTINGS = '.claude/settings.json'

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined)
const posix = (p) => p.split(sep).join('/')

/** Приложение по месту пакета: <app>/node_modules/@replai-smm/design/bin/design.mjs. */
export const appOfPackage = () => resolve(PKG, '..', '..', '..')

/** Корень git, откуда запущено (или переданная папка). */
export function repoRoot(from = process.cwd()) {
  return execFileSync('git', ['-C', from, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
}

/** Путь к этому скрипту от корня репо — так его зовут хук, скрипты и шаг CI. */
const binFrom = (repo, app) => posix(relative(repo, join(app, 'node_modules', NAME, 'bin', 'design.mjs'))) || 'design.mjs'

/** Файлы ДС в репо продукта: путь → текст. */
export function ownFiles({ repo, app }) {
  const rel = posix(relative(repo, app)) || '.'
  let workflow = read(join(SKILL_DIR, 'design.yml')).replaceAll('__APP__', rel)
  // Корень репо со своим package.json (там Playwright e2e продукта) — ставится отдельным шагом, браузер сторожа берётся оттуда;
  // нет корня — приложение само (`rel`).
  const rootPkg = rel !== '.' && existsSync(join(repo, 'package.json'))
  workflow = rootPkg ? workflow.replaceAll('__ROOT__', '.') : workflow.replace(/ {6}# root-ci:begin[\s\S]*?# root-ci:end\n/, '').replaceAll('__ROOT__', rel)
  // `"design": { "widths": false }` в package.json приложения — сторож ширин в CI пока не включён (продукт сам называет почему)
  if (appConfig(app).widths === false) workflow = workflow.replace(/ {6}# widths:begin[\s\S]*?# widths:end\n/, '')
  return {
    '.claude/skills/design/SKILL.md': read(join(SKILL_DIR, 'SKILL.md')),
    '.github/workflows/design.yml': workflow,
  }
}

/** Настройки сторожа в package.json приложения: `"design": { "require": [...], "storybook": "storybook-static", "widths": false }`. */
export function appConfig(app) {
  try {
    return JSON.parse(read(join(app, 'package.json')) ?? '{}').design ?? {}
  } catch {
    return {}
  }
}

/** Хук правки интерфейса: напоминание, не блок; пакета нет — молчит (ложный блок дороже). */
export const hookCommand = (bin) => `cd "\${CLAUDE_PROJECT_DIR:-.}" && [ -e ${bin} ] && exec node ${bin} hook; exit 0`
const isOurs = (entry) => JSON.stringify(entry).includes('design.mjs hook')

/** settings.json с хуком ДС на PreToolUse правки файлов; bad — не JSON нужной формы (не перезаписываем). */
export function withHook(text, bin) {
  let s
  try {
    s = text === undefined ? {} : JSON.parse(text)
  } catch {
    return { bad: true }
  }
  const hooks = s && typeof s === 'object' && !Array.isArray(s) ? (s.hooks ?? {}) : undefined
  const pre = hooks && typeof hooks === 'object' && !Array.isArray(hooks) ? (hooks.PreToolUse ?? []) : undefined
  if (!hooks || !Array.isArray(pre)) return { bad: true }
  const entry = { matcher: 'Edit|Write|MultiEdit', hooks: [{ type: 'command', command: hookCommand(bin), timeout: 10, statusMessage: 'design hook' }] }
  const now = [...pre.filter((e) => !isOurs(e)), entry]
  return JSON.stringify(now) === JSON.stringify(pre) ? {} : { text: JSON.stringify({ ...s, hooks: { ...hooks, PreToolUse: now } }, null, 2) + '\n' }
}

/** package.json репо с скриптом `design` (нет или старая форма — сторож напрямую): `check` против origin/main. */
export function withScript(text, bin) {
  let p
  try {
    p = JSON.parse(text)
  } catch {
    return {}
  }
  if (!p || typeof p !== 'object' || Array.isArray(p)) return {}
  const want = `node ${bin} check --base origin/main`
  const now = p.scripts?.design
  if (now === want || (now !== undefined && !/principles\.mjs|check-design/.test(now))) return {}
  return { text: JSON.stringify({ ...p, scripts: { ...p.scripts, design: want } }, null, 2) + '\n' }
}

/**
 * init — что записано (или, с `check`, что отличается). Файлы ДС переписываются, если отличаются; хук добавляется рядом с чужими;
 * чужие файлы не трогаются. Возвращает строки для лога.
 */
export function init({ repo, app, check = false }) {
  const bin = binFrom(repo, app)
  const files = Object.fromEntries(Object.entries(ownFiles({ repo, app })).filter(([path, text]) => read(join(repo, path)) !== text))
  const settings = withHook(read(join(repo, SETTINGS)), bin)
  if (settings.text) files[SETTINGS] = settings.text
  const pkgText = read(join(repo, 'package.json'))
  const script = pkgText === undefined ? {} : withScript(pkgText, bin)
  if (script.text) files['package.json'] = script.text
  if (!check) {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(repo, path)), { recursive: true })
      writeFileSync(join(repo, path), text)
    }
  }
  return { lines: [...Object.keys(files).map((p) => (check ? `отличается от пакета: ${p}` : `записано: ${p}`)), ...(settings.bad ? [`${SETTINGS} не JSON нужной формы — хук добавьте руками: ${hookCommand(bin)}`] : [])], differs: Object.keys(files) }
}

const REMINDER =
  'design: правишь интерфейс — сначала навык design (.claude/skills/design/SKILL.md): паттерн из node_modules/@replai-smm/design/patterns/*.md → экран из компонентов ДС; ' +
  'нет нужного куска — правка сначала в ДС (новый тег), потом в продукт; до «готово» — `npm run design`, сторож ширин и снимки под самой тяжёлой ролью на 360 · 1024 · 1280 (+ тёмная).'

/**
 * hookMessage — что сказать сессии на правку файла: напоминание один раз за сессию (метка во временной папке), только для интерфейса приложения
 * (`<app>/src/**` .ts .tsx .css .mdx). Не интерфейс, чужая правка, повтор в той же сессии — ничего.
 */
export function hookMessage(input, { app, tmp = tmpdir() }) {
  let e
  try {
    e = JSON.parse(input)
  } catch {
    return null
  }
  const file = e?.tool_input?.file_path
  if (typeof file !== 'string') return null
  const inSrc = relative(join(app, 'src'), resolve(file))
  if (inSrc.startsWith('..') || !/\.(tsx?|css|mdx)$/.test(file)) return null
  const mark = join(tmp, `design-hook-${String(e.session_id ?? 'session').replace(/[^\w-]/g, '')}`)
  if (existsSync(mark)) return null
  try {
    writeFileSync(mark, '')
  } catch {
    /* нет временной папки — напомним ещё раз, это не страшно */
  }
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: REMINDER } })
}

function run(script, args, cwd) {
  return spawnSync(process.execPath, [join(PKG, 'lint', script), ...args], { stdio: 'inherit', cwd }).status ?? 2
}

async function main(argv) {
  const [command, ...rest] = argv
  const opt = (name) => rest.flatMap((a, i) => (a === name ? [rest[i + 1]] : []))
  const app = resolve(opt('--app')[0] ?? appOfPackage())
  if (command === 'init') {
    const repo = resolve(opt('--repo')[0] ?? repoRoot())
    const r = init({ repo, app, check: rest.includes('--check') })
    r.lines.forEach((l) => console.log(l))
    if (rest.includes('--check')) {
      console.log(r.differs.length ? '✗ design init --check: файлы ДС в репо правили руками или пакет новее — `node …/design.mjs init`' : '✓ файлы ДС в репо совпадают с пакетом')
      return r.differs.length ? 1 : 0
    }
    return 0
  }
  if (command === 'check') {
    const repo = resolve(opt('--repo')[0] ?? repoRoot())
    const base = opt('--base')[0]
    return run('principles.mjs', ['--kind', 'product', ...(base ? ['--base', base] : []), '--repo', repo, posix(relative(repo, join(app, 'src')))], repo)
  }
  if (command === 'widths') {
    const cfg = appConfig(app)
    const storybook = opt('--storybook')[0] ?? join(app, cfg.storybook ?? 'storybook-static')
    return run('widths.mjs', ['--storybook', storybook, ...(cfg.require ?? []).flatMap((r) => ['--require', r])], app)
  }
  if (command === 'hook') {
    const msg = hookMessage(readFileSync(0, 'utf8'), { app })
    if (msg) console.log(msg)
    return 0
  }
  console.error('design init [--check] | check [--base <ref>] | widths [--storybook <папка>] | hook')
  return 2
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main(process.argv.slice(2)))
