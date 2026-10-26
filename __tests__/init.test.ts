/** design init (bin/design.mjs): записывает навык, шаг CI, хук и скрипт — идемпотентно; хук — напоминание один раз за сессию, не блок. */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
    const settings = JSON.parse(readFileSync(join(repo, '.claude/settings.json'), 'utf8'))
    expect(settings.hooks.PreToolUse[0].matcher).toBe('Edit|Write|MultiEdit')
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toContain('web/node_modules/@replai-smm/design/bin/design.mjs hook')
    expect(JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).scripts.design).toBe('node web/node_modules/@replai-smm/design/bin/design.mjs check --base origin/main')
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
