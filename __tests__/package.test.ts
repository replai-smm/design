/**
 * Пакет как его ставит продукт (`github:replai-smm/design#vX`): каждый путь из `exports` существует после сборки и входит
 * в состав пакета (`npm pack`), а тесты и истории в состав не лезут. Ловит забытый файл в `files` до выпуска тега.
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const packed: string[] = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' }),
)[0].files.map((f: { path: string }) => f.path)

describe('пакет @replai-smm/design', () => {
  const targets = Object.entries<string>(pkg.exports).filter(([, t]) => !t.includes('*'))

  it.each(targets)('exports %s → %s есть на диске и в составе пакета', (_k, target) => {
    expect(existsSync(resolve(root, target)), `${target} не собран (npm run build)`).toBe(true)
    expect(packed).toContain(target.replace(/^\.\//, ''))
  })

  it('в составе нет тестов, историй, генератора и dev-конфигов', () => {
    expect(packed.filter((p) => /__tests__|\.stories\.|^react\/src\/stories\/|^lib\/|^build\.mjs|\.storybook|vite\.config|vitest\.config/.test(p))).toEqual([])
  })

  it('нет скриптов установки: продукт ставит пакет без сборки и без devDependencies (dist лежит в теге)', () => {
    for (const k of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack']) expect(pkg.scripts?.[k], k).toBeUndefined()
  })

  it('у пакета нет своих dependencies: React и Radix приходят из продукта', () => {
    expect(Object.keys(pkg.dependencies ?? {})).toEqual([])
  })
})
