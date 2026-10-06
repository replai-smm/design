#!/usr/bin/env node
// Сторож «только токены» из командной строки — для любого продукта, с ESLint или без (CSS, HTML, ванильный JS).
//
//   node node_modules/@replai-smm/design/lint/cli.mjs <папки или файлы…>                       — все нарушения; есть — выход 1
//   node node_modules/@replai-smm/design/lint/cli.mjs --baseline ds-baseline.json <папки…>      — храповик: по файлу нарушений не больше,
//                                                                        чем записано; новых файлов с нарушениями нет
//   node node_modules/@replai-smm/design/lint/cli.mjs --baseline ds-baseline.json --write <…>   — записать нынешние числа (только вниз —
//                                                                        поднять число этим ключом нельзя)
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { scan, message } from './scan.mjs'

const EXT = /\.(jsx?|tsx?|mjs|cjs|css|scss|pcss|html?|vue|svelte)$/i
const SKIP_DIR = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', 'storybook-static', '__screenshots__'])
// сами токены — источник цветов, их сторож не проверяет
const SKIP_FILE = /(^|[\\/])(tokens\.(css|ts)|tailwind\.css)$/

export function files(paths) {
  const out = []
  const walk = (p) => {
    const st = statSync(p)
    if (st.isDirectory()) {
      for (const n of readdirSync(p)) if (!SKIP_DIR.has(n)) walk(join(p, n))
    } else if (EXT.test(p) && !SKIP_FILE.test(p) && !/\.min\./.test(p)) out.push(p)
  }
  for (const p of paths) walk(p)
  return out.sort()
}

/** { файл: [нарушения] } — пути от cwd, с прямыми слешами. */
export function lint(paths, cwd = process.cwd()) {
  const res = {}
  for (const f of files(paths)) {
    const found = scan(readFileSync(f, 'utf8'), f)
    if (found.length) res[relative(cwd, f).split(sep).join('/')] = found
  }
  return res
}

/** Сравнить с храповиком: что выросло (красное) и что упало (можно опустить). */
export function ratchet(found, baseline) {
  const grew = []
  const fell = []
  for (const [file, list] of Object.entries(found)) {
    const was = baseline[file] ?? 0
    if (list.length > was) grew.push({ file, was, now: list.length })
    else if (list.length < was) fell.push({ file, was, now: list.length })
  }
  for (const [file, was] of Object.entries(baseline)) if (!found[file] && was > 0) fell.push({ file, was, now: 0 })
  return { grew, fell }
}

function main(argv) {
  const args = argv.slice(2)
  const bi = args.indexOf('--baseline')
  const baselineFile = bi >= 0 ? args[bi + 1] : null
  const write = args.includes('--write')
  const paths = args.filter((a, i) => !a.startsWith('--') && (bi < 0 || i !== bi + 1))
  if (!paths.length) {
    console.error('укажи папки или файлы: node node_modules/@replai-smm/design/lint/cli.mjs src [--baseline ds-baseline.json [--write]]')
    return 2
  }
  const found = lint(paths)
  const total = Object.values(found).reduce((n, l) => n + l.length, 0)
  const print = (file) => {
    for (const f of found[file]) console.log(`${file}:${f.line}:${f.column}  ${f.rule}  ${message(f)}`)
  }
  if (!baselineFile) {
    Object.keys(found).forEach(print)
    console.log(total ? `✗ нарушений: ${total}` : '✓ только токены')
    return total ? 1 : 0
  }
  const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, 'utf8')) : {}
  const { grew, fell } = ratchet(found, baseline)
  if (write) {
    if (grew.length && existsSync(baselineFile)) {
      grew.forEach((g) => print(g.file))
      console.error(`✗ храповик только вниз: выросло в ${grew.map((g) => `${g.file} (${g.was} → ${g.now})`).join(', ')}`)
      return 1
    }
    const next = Object.fromEntries(Object.entries(found).map(([f, l]) => [f, l.length]))
    writeFileSync(baselineFile, JSON.stringify(next, null, 2) + '\n')
    console.log(`записан храповик: ${baselineFile}, нарушений ${total}`)
    return 0
  }
  for (const g of grew) {
    print(g.file)
    console.log(`✗ ${g.file}: было ${g.was}, стало ${g.now}`)
  }
  for (const f of fell) console.log(`↓ ${f.file}: было ${f.was}, стало ${f.now} — опусти храповик: --write`)
  console.log(grew.length ? `✗ нарушений стало больше (всего ${total})` : `✓ храповик держит (всего ${total})`)
  return grew.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv))
}

export { main }
