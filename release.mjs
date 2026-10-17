#!/usr/bin/env node
// Выпуск ДС — одно место (orbit.yaml: deploy · watch · version · rollback). Прод ДС — теги vX.Y.Z на GitHub: тег — коммит-потомок
// коммита main с собранным dist/ (продукт ставит пакет по архиву тега без сборки и без devDependencies; в main dist/ нет).
// Команды идут из корня клона orbit; ORBIT_SHA — выпускаемый коммит main, ORBIT_DEPLOY_KEY — путь к ключу выкатки (деплой-ключ
// репо: он умеет только создать тег — правила репо на GitHub, orbit infra/github). Теги читаются с origin клона.
//   node release.mjs deploy    выпуск ORBIT_SHA: dist/ собран из его дерева, коммит поверх него, тег → GitHub ключом; ORBIT_SHA уже
//                              выпущен последним тегом — ничего (повтор после перезапуска не выпускает второй раз)
//   node release.mjs watch     последний тег на origin — выпуск ORBIT_SHA, и архив тега ставится как пакет: каждый путь exports есть
//   node release.mjs version   коммит main последнего выпуска (родитель последнего тега)
//   node release.mjs rollback  последний выпуск — ORBIT_SHA: заново выпустить origin/main следующим номером; нет — ничего
// Флаги — для тестов: --push <url> (куда тег), --archive <шаблон с {tag}> (откуда архив тега).
//
// Номер — одно правило (next): patch после последнего тега; minor или major Изменение ставит само — version в package.json выше
// последнего тега (X.Y.0, X.0.0), тогда номер — он. Номер выводится из кода и тегов, его проверяет тест; поле Изменения deploy не видит.
// Тег не двигается и не удаляется (правило репо): выпуск не отзывается. Откат — новый выпуск содержимого main следующим номером, номер
// отката сгорает; так последний тег всегда выпуск main (main = прод), а номера только растут.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const PUSH = 'git@github.com:replai-smm/design.git'
const ARCHIVE = 'https://codeload.github.com/replai-smm/design/tar.gz/refs/tags/{tag}'
// ключ хоста GitHub (api.github.com/meta, ssh_keys): ssh выкатки не верит первому встречному
const GITHUB_HOST = 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n'
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/

/** parse — X.Y.Z → [X, Y, Z]; не номер — ошибка. */
export function parse(v) {
  const m = SEMVER.exec(v)
  if (!m) throw new Error(`номер — X.Y.Z, получено «${v}»`)
  return m.slice(1).map(Number)
}
/** cmp — порядок номеров. */
export const cmp = (a, b) => { const x = parse(a), y = parse(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2] }

/** next — номер выпуска: `version` из package.json выпускаемого коммита выше последнего тега — он; иначе patch после последнего. */
export function next(version, released) {
  parse(version)
  const last = [...released].sort(cmp).at(-1)
  if (!last || cmp(version, last) > 0) return version
  const [x, y, z] = parse(last)
  return `${x}.${y}.${z + 1}`
}

const git = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim()
const need = (name) => process.env[name] || fail(`нет ${name}: команду зовёт orbit`)
const short = (sha) => sha.slice(0, 7)
function fail(why) { console.error(`release: ${why}`); process.exit(1) }

/** releases — выпуски на origin: теги vX.Y.Z (локальные приведены к origin), по возрастанию, с коммитом и его родителем. */
function releases() {
  git(['fetch', '-q', '--prune', 'origin', '+refs/tags/v*:refs/tags/v*'])
  return git(['tag', '-l', 'v*']).split('\n').map((t) => t.slice(1)).filter((v) => SEMVER.test(v)).sort(cmp)
    .map((v) => ({ v, commit: git(['rev-parse', `v${v}^{commit}`]), parent: git(['rev-parse', `v${v}^{commit}^1`]) }))
}

/** cut — коммит выпуска `v` поверх `sha`: дерево sha, dist/ собран из него (во временной копии, node_modules клона), version в
 * package.json и package-lock.json — v. Рабочее дерево и индекс клона не трогаются. */
function cut(sha, v) {
  const tmp = mkdtempSync(join(tmpdir(), 'ds-release-')), tree = join(tmp, 'tree'), index = join(tmp, 'index')
  try {
    mkdirSync(tree)
    execFileSync('sh', ['-c', 'git archive "$1" | tar -x -C "$2"', 'sh', sha, tree], { stdio: ['ignore', 'pipe', 'inherit'] })
    for (const d of ['node_modules', 'react/node_modules']) if (existsSync(d) && existsSync(join(tree, dirname(d)))) symlinkSync(join(process.cwd(), d), join(tree, d))
    execFileSync('node', ['build.mjs'], { cwd: tree, stdio: ['ignore', 'ignore', 'inherit'] })
    const env = { ...process.env, GIT_INDEX_FILE: index }
    const add = (path, text) => git(['update-index', '--add', '--cacheinfo', `100644,${git(['hash-object', '-w', '--stdin'], { input: text })},${path}`], { env })
    git(['read-tree', sha], { env })
    const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
    for (const f of walk(join(tree, 'dist'))) add(relative(tree, f), readFileSync(f))
    const pkg = readFileSync(join(tree, 'package.json'), 'utf8')
    if (!/^ {2}"version": "[^"]*",$/m.test(pkg)) throw new Error('package.json: нет строки version')
    add('package.json', pkg.replace(/^ {2}"version": "[^"]*",$/m, `  "version": "${v}",`))
    const lock = JSON.parse(readFileSync(join(tree, 'package-lock.json'), 'utf8'))
    lock.version = v
    lock.packages[''].version = v
    add('package-lock.json', JSON.stringify(lock, null, 2) + '\n')
    const who = { GIT_AUTHOR_NAME: 'orbit', GIT_AUTHOR_EMAIL: 'orbit@replai-smm.invalid', GIT_COMMITTER_NAME: 'orbit', GIT_COMMITTER_EMAIL: 'orbit@replai-smm.invalid' }
    return git(['commit-tree', git(['write-tree'], { env }), '-p', sha, '-m', `Выпуск v${v}: dist/ собран из main ${short(sha)}`], { env: { ...process.env, ...who } })
  } finally { rmSync(tmp, { recursive: true, force: true }) }
}

/** ship — коммит выпуска тегом v<v> на GitHub ключом выкатки; тег не перезаписывается (push без силы). */
function ship(commit, v, key, url) {
  const tmp = mkdtempSync(join(tmpdir(), 'ds-ship-')), hosts = join(tmp, 'known_hosts')
  try {
    writeFileSync(hosts, GITHUB_HOST)
    const ssh = `ssh -i '${key}' -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile='${hosts}'`
    git(['push', '-q', url, `${commit}:refs/tags/v${v}`], { env: { ...process.env, GIT_SSH_COMMAND: ssh }, stdio: ['ignore', 'pipe', 'inherit'] })
  } finally { rmSync(tmp, { recursive: true, force: true }) }
}

/** release — выпуск коммита main `sha` следующим номером → номер. */
function release(sha, all, key, url) {
  const v = next(JSON.parse(git(['show', `${sha}:package.json`])).version, all.map((r) => r.v))
  ship(cut(sha, v), v, key, url)
  return v
}

/** installs — архив тега ставится как пакет (без скриптов, без peer): версия — v, каждый путь exports (без *) на месте. */
function installs(v, archive) {
  const tmp = mkdtempSync(join(tmpdir(), 'ds-watch-'))
  try {
    writeFileSync(join(tmp, 'package.json'), '{"name":"ds-watch","private":true}\n')
    execFileSync('npm', ['install', '--no-package-lock', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', '--prefer-offline', archive.replace('{tag}', `v${v}`)], { cwd: tmp, stdio: ['ignore', 'ignore', 'pipe'] })
    const dir = join(tmp, 'node_modules/@replai-smm/design'), pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    if (pkg.version !== v) return `архив v${v}: version ${pkg.version}`
    const gone = Object.values(pkg.exports).filter((t) => !t.includes('*') && !existsSync(join(dir, t)))
    return gone.length ? `архив v${v}: нет ${gone.join(', ')}` : ''
  } finally { rmSync(tmp, { recursive: true, force: true }) }
}

function main([verb, ...argv]) {
  const flag = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def }
  const url = flag('--push', PUSH), archive = flag('--archive', ARCHIVE)
  if (verb === 'version') {
    const last = releases().at(-1)
    return last ? console.log(last.parent) : fail('выпусков нет')
  }
  if (!['deploy', 'watch', 'rollback'].includes(verb)) fail('release.mjs deploy | watch | version | rollback')
  const sha = need('ORBIT_SHA'), all = releases(), last = all.at(-1)
  if (verb === 'watch') {
    if (last?.parent !== sha) fail(`последний тег ${last ? 'v' + last.v : '—'} — не выпуск ${short(sha)}`)
    const bad = installs(last.v, archive)
    return bad ? fail(bad) : console.log(`v${last.v} = main ${short(sha)}: тег на origin, архив ставится`)
  }
  const key = need('ORBIT_DEPLOY_KEY')
  if (verb === 'deploy') {
    if (last?.parent === sha) return console.log(`v${last.v} — уже выпуск ${short(sha)}`)
    return console.log(`v${release(sha, all, key, url)} = main ${short(sha)}`)
  }
  if (last?.parent !== sha) return console.log(`откатывать нечего: последний выпуск ${last ? 'v' + last.v + ' = main ' + short(last.parent) : '—'}, не ${short(sha)}`)
  git(['fetch', '-q', 'origin', 'main'])
  const main = git(['rev-parse', 'origin/main'])
  console.log(`откат: v${release(main, all, key, url)} = main ${short(main)}; v${last.v} не отозван, его номер сгорел`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main(process.argv.slice(2))
