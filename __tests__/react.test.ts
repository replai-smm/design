/**
 * ДС-React со стороны пакета (без React): исходники — только роли и шкалы, рабочее пространство не повторяет пакет,
 * образцы компонентов вошли в страницу образцов.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { scan } from '../lint/scan.mjs'
import { outputs } from '../lib/generate.mjs'

const react = resolve(import.meta.dirname, '..', 'react')
const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))

describe('ДС-React', () => {
  it('исходники и истории — только роли и шкалы', () => {
    const found = [...walk(join(react, 'src')), ...walk(join(react, '.storybook'))]
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .flatMap((f) => scan(readFileSync(f, 'utf8'), f).map((x: { line: number; rule: string; value: string }) => `${f}:${x.line} ${x.rule} ${x.value}`))
    expect(found).toEqual([])
  })

  it('рабочее пространство react не повторяет пакет: peerDependencies только у корня; значки — данные в пакете, Carbon React не ставим', () => {
    const workspace = JSON.parse(readFileSync(join(react, 'package.json'), 'utf8'))
    expect(workspace.peerDependencies).toBeUndefined()
    expect(Object.keys(workspace.dependencies ?? {})).toEqual([])
    expect(Object.keys(workspace.devDependencies).filter((d) => d.startsWith('@carbon/'))).toEqual(['@carbon/icons'])
    expect(existsSync(join(react, '..', 'package-lock.json'))).toBe(true)
  })

  it('образцы компонентов вошли в showcase.html', () => {
    expect(existsSync(join(react, 'dist', 'showcase-components.html'))).toBe(true)
    expect(outputs()['dist/showcase.html']).toContain('data-ds-react')
  })
})
