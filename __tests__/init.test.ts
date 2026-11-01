/** design init (bin/design.mjs): записывает навык, шаг CI, хук и скрипт — идемпотентно; хук — напоминание один раз за сессию, не блок. */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import YAML from 'yaml'
// @ts-expect-error — .mjs без типов
import { hookMessage, init, ownFiles, withHook, withScript } from '../bin/design.mjs'

let repo = ''
let app = ''
beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'design-init-'))
  execFileSync('git', ['init', '-q', repo])
  app = join(repo, 'web')
  mkdirSync(join(app, 'src'), { recursive: true })
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ name: 'product', scripts: { design: 'node web/node_modules/@replai-smm/design/lint/principles.mjs --kind product --base origin/main web/src', check: 'x' } }, null, 2))
})
afterEach(() => rmSync(repo, { recursive: true, force: true }))

describe('design init', () => {
  it('пишет навык, шаг CI, хук и скрипт', () => {
    const r = init({ repo, app })
    expect(r.differs.sort()).toEqual(['.claude/settings.json', '.claude/skills/design/SKILL.md', '.github/workflows/design.yml', 'package.json'])
    const skill = readFileSync(join(repo, '.claude/skills/design/SKILL.md'), 'utf8')
    expect(skill).toContain('name: design')
    expect(skill).toContain('360, 1024 и 1280')
    const wf = readFileSync(join(repo, '.github/workflows/design.yml'), 'utf8')
    expect(wf).toContain('node web/node_modules/@replai-smm/design/bin/design.mjs check')
    expect(wf).toContain('working-directory: web')
    expect(wf).not.toContain('__APP__')
    expect(wf).not.toContain('__ROOT__')
    // корень репо со своим package.json: ставится отдельным шагом, браузер сторожа — из корня
    expect(wf).toContain('npm ci (корень репо')
    const settings = JSON.parse(readFileSync(join(repo, '.claude/settings.json'), 'utf8'))
    expect(settings.hooks.PreToolUse[0].matcher).toBe('Edit|Write|MultiEdit')
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toContain('web/node_modules/@replai-smm/design/bin/design.mjs hook')
    expect(JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).scripts.design).toBe('node web/node_modules/@replai-smm/design/bin/design.mjs check --base origin/main')
  })

  it('нет корневого package.json: шага корня нет, браузер ставится из приложения', () => {
    rmSync(join(repo, 'package.json'))
    const wf = ownFiles({ repo, app })['.github/workflows/design.yml']
    expect(wf).not.toContain('npm ci (корень репо')
    expect(wf).toMatch(/playwright[^\n]*\n\s+working-directory: web/)
  })

  it('шаг CI — валидный YAML при любых настройках (корень, без корня, без сторожа ширин)', () => {
    const parse = () => YAML.parse(ownFiles({ repo, app })['.github/workflows/design.yml'])
    expect(parse().jobs.design.steps.length).toBeGreaterThan(5)
    writeFileSync(join(app, 'package.json'), JSON.stringify({ design: { widths: false } }))
    expect(parse().jobs.design.steps.map((x: { name?: string }) => x.name)).not.toContain('design widths')
    rmSync(join(repo, 'package.json'))
    expect(parse().jobs.design.steps.length).toBeGreaterThan(4)
  })

  it('идемпотентен: второй запуск ничего не пишет', () => {
    init({ repo, app })
    expect(init({ repo, app }).differs).toEqual([])
  })

  it('--check: правка файла ДС руками — красная, ничего не пишет', () => {
    init({ repo, app })
    writeFileSync(join(repo, '.claude/skills/design/SKILL.md'), 'своё')
    const r = init({ repo, app, check: true })
    expect(r.differs).toEqual(['.claude/skills/design/SKILL.md'])
    expect(readFileSync(join(repo, '.claude/skills/design/SKILL.md'), 'utf8')).toBe('своё')
    init({ repo, app })
    expect(init({ repo, app, check: true }).differs).toEqual([])
  })

  it('хук встаёт рядом с чужими и переписывается без дублей; чужой скрипт design не трогается', () => {
    const other = { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo чужой' }] }] }, permissions: { allow: [] } }
    const first = withHook(JSON.stringify(other), 'web/node_modules/@replai-smm/design/bin/design.mjs')
    const again = withHook(first.text, 'web/node_modules/@replai-smm/design/bin/design.mjs')
    expect(again.text).toBeUndefined()
    const s = JSON.parse(first.text)
    expect(s.hooks.PreToolUse).toHaveLength(2)
    expect(s.permissions).toEqual({ allow: [] })
    expect(withHook('не json', 'x').bad).toBe(true)
    expect(withScript(JSON.stringify({ scripts: { design: 'свой сторож' } }), 'x').text).toBeUndefined()
  })

  it('"design": { "widths": false } — в шаге CI нет сторожа ширин (включают вместе с правкой экранов)', () => {
    writeFileSync(join(app, 'package.json'), JSON.stringify({ design: { widths: false } }))
    const wf = ownFiles({ repo, app })['.github/workflows/design.yml']
    expect(wf).toContain('design.mjs check')
    expect(wf).not.toContain('design.mjs widths')
    expect(wf).not.toContain('storybook:build')
    expect(wf).not.toContain('playwright')
    writeFileSync(join(app, 'package.json'), JSON.stringify({ design: { require: ['Кабинет'] } }))
    expect(ownFiles({ repo, app })['.github/workflows/design.yml']).toContain('design.mjs widths')
  })

  it('файлы ДС сходятся с пакетом: skill/ лежит в публикуемых', () => {
    const own = ownFiles({ repo, app })
    expect(Object.keys(own)).toEqual(['.claude/skills/design/SKILL.md', '.github/workflows/design.yml'])
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'))
    expect(pkg.bin.design).toBe('./bin/design.mjs')
    expect(pkg.files).toEqual(expect.arrayContaining(['bin', 'skill', 'lint']))
    expect(existsSync(join(__dirname, '..', 'skill', 'SKILL.md'))).toBe(true)
  })
})

describe('design hook', () => {
  const input = (file: string, session = 's1') => JSON.stringify({ session_id: session, tool_name: 'Edit', tool_input: { file_path: file } })
  it('напоминание на правку интерфейса — один раз за сессию, не блок', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'design-hook-'))
    const first = hookMessage(input(join(app, 'src', 'Screen.tsx')), { app, tmp })
    expect(JSON.parse(first).hookSpecificOutput.additionalContext).toContain('навык design')
    expect(hookMessage(input(join(app, 'src', 'Other.tsx')), { app, tmp })).toBeNull()
    expect(hookMessage(input(join(app, 'src', 'Other.tsx'), 's2'), { app, tmp })).not.toBeNull()
    rmSync(tmp, { recursive: true, force: true })
  })

  it('не интерфейс и чужие файлы — молчит', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'design-hook-'))
    expect(hookMessage(input(join(app, 'README.md')), { app, tmp })).toBeNull()
    expect(hookMessage(input(join(repo, 'backend', 'src', 'a.ts')), { app, tmp })).toBeNull()
    expect(hookMessage('не json', { app, tmp })).toBeNull()
    rmSync(tmp, { recursive: true, force: true })
  })
})

/**
 * Задание `changes` шага CI (RSMM-141): исполняем НАСТОЯЩИЙ скрипт из сгенерированного workflow на подставных github,
 * context и core — так проверяется ровно то, что уедет в продукт, а не пересказ.
 */
describe('шаг CI: design идёт только когда задето приложение', () => {
  type Run = { app?: string; files?: string[] | Error; event?: string }
  async function decide({ app: rel, files = [], event = 'pull_request' }: Run) {
    const target = rel === '.' ? repo : app
    const wf = YAML.parse(ownFiles({ repo, app: target })['.github/workflows/design.yml'])
    const script: string = wf.jobs.changes.steps[0].with.script
    const out: Record<string, string> = {}
    const list = () => (files instanceof Error ? Promise.reject(files) : Promise.resolve(files.map((filename) => ({ filename }))))
    const github = {
      paginate: list,
      rest: { pulls: { listFiles: {} }, repos: { compareCommitsWithBasehead: () => list().then((f) => ({ data: { files: f } })) } },
    }
    const context = { repo: { owner: 'o', repo: 'r' }, eventName: event, sha: 'b'.repeat(40), payload: { pull_request: { number: 1 }, before: 'a'.repeat(40) } }
    const core = { setOutput: (k: string, v: string) => (out[k] = v), notice: () => {}, warning: () => {} }
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
    await new AsyncFunction('github', 'context', 'core', script)(github, context, core)
    return { app: out.app, wf }
  }

  it('PR только бэка — design пропущен; условие задания design читает этот ответ', async () => {
    const r = await decide({ files: ['backend/src/a.ts', 'karta/x.yaml'] })
    expect(r.app).toBe('false')
    expect(r.wf.jobs.design.needs).toBe('changes')
    expect(r.wf.jobs.design.if).toContain("needs.changes.outputs.app != 'false'")
    expect(r.wf.jobs.design.if).toContain("needs.changes.result != 'success'")
  })

  it('задето приложение, корневой package*.json или сам workflow — design идёт (и на push в main)', async () => {
    for (const f of ['web/src/App.tsx', 'package-lock.json', '.github/workflows/design.yml']) {
      expect((await decide({ files: [f] })).app, f).toBe('true')
      expect((await decide({ files: [f], event: 'push' })).app, f).toBe('true')
    }
  })

  it('приманки fail-closed: список не прочитан или пуст — design идёт; похожее имя — не приложение', async () => {
    expect((await decide({ files: new Error('API молчит') })).app).toBe('true')
    expect((await decide({ files: [] })).app).toBe('true')
    expect((await decide({ files: ['web-old/a.ts'] })).app).toBe('false')
  })

  it('приложение — корень репо: задето всегда', async () => {
    expect((await decide({ app: '.', files: ['backend/src/a.ts'] })).app).toBe('true')
  })
})
