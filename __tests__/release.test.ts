/**
 * Выпуск (release.mjs) — правило номера и весь путь на песочнице: origin — голый репо во временной папке, клон — как у того, кто
 * выпускает, пакет — маленький, со своей сборкой dist/. Сеть и ключ не нужны: тег уходит в путь --push, архив тега — по --archive.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { next } from '../release.mjs'

const script = resolve(import.meta.dirname, '../release.mjs')

describe('номер выпуска', () => {
  it.each([
    ['1.1.0', [], '1.1.0'], // первый выпуск — номер из package.json
    ['1.1.0', ['1.1.0'], '1.1.1'], // по умолчанию patch
    ['1.1.0', ['1.0.0', '1.1.0', '1.1.1'], '1.1.2'],
    ['1.2.0', ['1.1.2'], '1.2.0'], // minor: Изменение подняло version выше последнего тега
    ['2.0.0', ['1.10.3'], '2.0.0'], // major; порядок номеров — числами, не строками
    ['1.1.0', ['1.2.0'], '1.2.1'], // version ниже последнего тега (сгоревший номер отката) — patch после него: номера только растут
  ])('version %s, теги %j → %s', (version, tags, want) => expect(next(version, tags)).toBe(want))

  it('не номер — ошибка', () => {
    expect(() => next('1.1', [])).toThrow()
    expect(() => next('1.1.0', ['latest'])).toThrow()
  })
})

describe('выпуск на песочнице', () => {
  let tmp: string, origin: string, clone: string, archives: string
  const sh = (cmd: string, args: string[], cwd = clone) => execFileSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } }).trim()
  const git = (...args: string[]) => sh('git', args)
  const who = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' }
  const release = (verb: string, sha = '') =>
    spawnSync('node', [script, verb, ...(sha ? [sha] : []), '--push', origin, '--archive', join(archives, '{tag}.tgz')], { cwd: clone, encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME, ...who } })
  const tags = () => git('ls-remote', '--tags', '--refs', origin).split('\n').filter(Boolean).map((l) => l.split('refs/tags/')[1]).sort()
  const commit = (msg: string, files: Record<string, string>) => {
    for (const [f, text] of Object.entries(files)) writeFileSync(join(clone, f), text)
    git('add', '-A'); git('commit', '-qm', msg)
    return git('rev-parse', 'HEAD')
  }
  const pkg = (version: string) => JSON.stringify({ name: '@replai-smm/design', version, private: true, type: 'module', exports: { './tokens.css': './dist/tokens.css', './fonts/*': './fonts/*', './package.json': './package.json' } }, null, 2) + '\n'
  const lock = (version: string) => JSON.stringify({ name: '@replai-smm/design', version, lockfileVersion: 3, requires: true, packages: { '': { name: '@replai-smm/design', version } } }, null, 2) + '\n'
  const pack = (tag: string, name = tag) => sh('git', ['archive', '--format=tar.gz', '--prefix=package/', '-o', join(archives, `${name}.tgz`), tag])
  let s1: string, s2: string

  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), 'ds-release-test-'))
    origin = join(tmp, 'origin.git'); clone = join(tmp, 'clone'); archives = join(tmp, 'archives')
    mkdirSync(archives)
    sh('git', ['init', '-q', '--bare', '-b', 'main', origin], tmp)
    sh('git', ['clone', '-q', origin, clone], tmp)
    writeFileSync(join(clone, '.gitignore'), '/dist/\n')
    writeFileSync(join(clone, 'build.mjs'), "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'\nmkdirSync('dist', { recursive: true })\nwriteFileSync('dist/tokens.css', `:root { --ds-fg: ${JSON.parse(readFileSync('tokens.json', 'utf8')).fg}; }\\n`)\n")
    s1 = commit('ДС', { 'package.json': pkg('1.1.0'), 'package-lock.json': lock('1.1.0'), 'tokens.json': '{"fg":"#111"}\n' })
    git('push', '-q', 'origin', 'main')
  })
  afterAll(() => rmSync(tmp, { recursive: true, force: true }))

  it('deploy: тег — коммит поверх выпускаемого коммита с dist/ из его дерева и номером в package.json; main не тронут; повтор — ничего', () => {
    const r = release('deploy', s1)
    expect(r.status, r.stderr).toBe(0)
    expect(tags()).toEqual(['v1.1.0'])
    git('fetch', '-q', 'origin', 'refs/tags/v1.1.0')
    expect(git('rev-parse', 'FETCH_HEAD^1')).toBe(s1)
    expect(git('show', 'FETCH_HEAD:dist/tokens.css')).toBe(':root { --ds-fg: #111; }')
    expect(JSON.parse(git('show', 'FETCH_HEAD:package.json')).version).toBe('1.1.0')
    expect(git('ls-remote', origin, 'refs/heads/main').split('\t')[0]).toBe(s1)
    expect(git('status', '--porcelain')).toBe('') // рабочее дерево клона не тронуто
    const again = release('deploy', s1)
    expect(again.status, again.stderr).toBe(0)
    expect(again.stdout).toContain('уже выпуск')
    expect(tags()).toEqual(['v1.1.0'])
  })

  it('deploy без коммита — выпуск origin/main следующим номером (patch), version и lock — номер выпуска; ключ не нужен', () => {
    s2 = commit('цвет', { 'tokens.json': '{"fg":"#222"}\n' })
    git('push', '-q', 'origin', 'main')
    const r = release('deploy')
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toContain(`= main ${s2.slice(0, 7)}`)
    expect(tags()).toEqual(['v1.1.0', 'v1.1.1'])
    git('fetch', '-q', 'origin', 'refs/tags/v1.1.1')
    expect(JSON.parse(git('show', 'FETCH_HEAD:package.json')).version).toBe('1.1.1')
    const l = JSON.parse(git('show', 'FETCH_HEAD:package-lock.json'))
    expect([l.version, l.packages[''].version]).toEqual(['1.1.1', '1.1.1'])
    expect(git('show', 'FETCH_HEAD:dist/tokens.css')).toContain('#222')
  })

  it('version — коммит main последнего выпуска', () => {
    const r = release('version')
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout.trim()).toBe(s2)
  })

  it('watch: последний тег — выпуск этого коммита и его архив ставится; чужой выпуск или архив без exports — красное', () => {
    pack('v1.1.1')
    const r = release('watch', s2)
    expect(r.status, r.stderr).toBe(0)
    expect(release('watch', s1).status).not.toBe(0) // последний выпуск — не s1
    git('checkout', '-qb', 'bait')
    pack(commit('без dist/', { 'package.json': pkg('1.1.1') }), 'v1.1.1') // номер тот, а dist/ нет: exports ./tokens.css не на месте
    git('checkout', '-q', 'main')
    const bad = release('watch', s2)
    expect(bad.status).not.toBe(0)
    expect(bad.stderr).toContain('dist/tokens.css')
  })

  it('rollback: последний выпуск — кандидат → заново выпущен main следующим номером, version = main; иначе — ничего', () => {
    const s3 = commit('кандидат', { 'tokens.json': '{"fg":"#333"}\n' }) // в main не попал: его watch красный
    expect(release('deploy', s3).status).toBe(0)
    expect(tags()).toEqual(['v1.1.0', 'v1.1.1', 'v1.1.2'])
    const r = release('rollback', s3)
    expect(r.status, r.stderr).toBe(0)
    expect(tags()).toEqual(['v1.1.0', 'v1.1.1', 'v1.1.2', 'v1.1.3'])
    git('fetch', '-q', 'origin', 'refs/tags/v1.1.3')
    expect(git('rev-parse', 'FETCH_HEAD^1')).toBe(s2)
    expect(git('show', 'FETCH_HEAD:dist/tokens.css')).toContain('#222')
    expect(release('version').stdout.trim()).toBe(s2)
    const again = release('rollback', s3)
    expect(again.status).toBe(0)
    expect(again.stdout).toContain('откатывать нечего')
    expect(tags()).toHaveLength(4)
  })
})
