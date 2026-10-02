/**
 * ДС-React со стороны процесса (без зависимостей пакета: они ставятся в design/react и гоняются задачей CI «ДС-React»).
 * Здесь — то, что видно без React: исходники пакета проходят сторож «только токены», Carbon React не стоит,
 * у каждого компонента есть истории, образцы для showcase.html лежат и вошли в страницу.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { scan } from '../lint/scan.mjs'
import { outputs } from '../lib/generate.mjs'

const react = resolve(import.meta.dirname, '..', 'react')
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))

describe('ДС-React', () => {
  it('исходники и истории — только токены', () => {
    const found = [...walk(join(react, 'src')), ...walk(join(react, '.storybook'))]
      .filter((f) => /\.(tsx?|css)$/.test(f))
      .flatMap((f) => scan(readFileSync(f, 'utf8'), f).map((x: any) => `${f}:${x.line} ${x.rule} ${x.value}`))
    expect(found).toEqual([])
  })

  it('на Radix и токенах, без Carbon React; зависимости закреплены замком', () => {
    const pkg = JSON.parse(readFileSync(join(react, 'package.json'), 'utf8'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies })
    expect(deps.filter((d) => d.startsWith('@carbon/'))).toEqual([])
    expect(deps).toContain('radix-ui')
    expect(existsSync(join(react, 'package-lock.json'))).toBe(true)
  })

  it('у каждого компонента — истории', () => {
    const dir = join(react, 'src', 'components')
    const files = readdirSync(dir)
    const comps = files.filter((f) => f.endsWith('.tsx') && !f.includes('.stories.') && !['layout.tsx', 'Collection.tsx'].includes(f))
    for (const c of comps) expect(files, c).toContain(c.replace('.tsx', '.stories.tsx'))
  })

  it('образцы компонентов вошли в showcase.html', () => {
    expect(existsSync(join(react, 'dist', 'showcase-components.html'))).toBe(true)
    const html = outputs()['dist/showcase.html']
    expect(html).toContain('<h2>Компоненты ДС-React</h2>')
    expect(html).toContain('data-ds-react')
  })
})
