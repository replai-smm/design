/**
 * Схемы ролей, шкал и матрицы облика: живые файлы (`tokens.json`, `scale.json`, `matrix.yaml`) и примеры — ≥ 2
 * правильных и ≥ 3 неправильных на схему, у каждой неправильной названа ошибка, ради которой она написана
 * (`invalid/_expect.yaml`). Контраст — `contrast.test.ts`.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import YAML from 'yaml'

const design = resolve(import.meta.dirname, '..')
const FIX = resolve(import.meta.dirname, 'fixtures', 'schemas')
const read = (p: string) => (p.endsWith('.json') ? JSON.parse(readFileSync(p, 'utf8')) : YAML.parse(readFileSync(p, 'utf8')))

const compile = (file: string, def?: string) => {
  const schema = read(resolve(design, file))
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true })
  ajv.addSchema(schema)
  const v = ajv.getSchema(schema.$id + (def ? `#/$defs/${def}` : ''))
  if (!v) throw new Error(`нет схемы ${file}${def ? '#' + def : ''}`)
  return v
}
const files = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => /\.(json|ya?ml)$/.test(f) && !f.startsWith('_')).sort() : [])

const SETS: [folder: string, schema: string, def?: string][] = [
  ['tokens', 'tokens.schema.json'],
  ['tokens.scale', 'tokens.schema.json', 'scale'],
  ['matrix', 'matrix.schema.json'],
]

describe('примеры к схемам', () => {
  for (const [folder, schema, def] of SETS) {
    const validate = compile(schema, def)
    const valid = files(resolve(FIX, folder, 'valid'))
    const invalid = files(resolve(FIX, folder, 'invalid'))
    const expected = YAML.parse(readFileSync(resolve(FIX, folder, 'invalid', '_expect.yaml'), 'utf8'))
    it(`${folder}: ≥ 2 правильных и ≥ 3 неправильных; у каждой неправильной названа ошибка, лишних названий нет`, () => {
      expect(valid.length).toBeGreaterThanOrEqual(2)
      expect(invalid.length).toBeGreaterThanOrEqual(3)
      expect(Object.keys(expected).sort()).toEqual(invalid)
    })
    for (const f of valid) {
      it(`${folder}: правильная ${f} проходит`, () => {
        expect(validate(read(resolve(FIX, folder, 'valid', f))), JSON.stringify(validate.errors?.slice(0, 3))).toBe(true)
      })
    }
    for (const f of invalid) {
      it(`${folder}: неправильная ${f} падает на своей ошибке`, () => {
        expect(validate(read(resolve(FIX, folder, 'invalid', f)))).toBe(false)
        const want = expected[f]
        const got = (validate.errors ?? []).map((e: any) => ({ path: e.instancePath, keyword: e.keyword, missing: e.params?.missingProperty }))
        const hit = got.some((e) => e.path === want.path && e.keyword === want.keyword && (!want.missing || e.missing === want.missing))
        expect(hit, `ждали ${JSON.stringify(want)}, получили ${JSON.stringify(got.slice(0, 5))}`).toBe(true)
      })
    }
  }
})

describe('живые файлы проходят свои схемы', () => {
  it('tokens.json — tokens.schema.json', () => {
    const v = compile('tokens.schema.json')
    expect(v(read(resolve(design, 'tokens.json'))), JSON.stringify(v.errors?.slice(0, 3))).toBe(true)
  })

  it('scale.json — tokens.schema.json → $defs/scale', () => {
    const v = compile('tokens.schema.json', 'scale')
    expect(v(read(resolve(design, 'scale.json'))), JSON.stringify(v.errors?.slice(0, 3))).toBe(true)
  })

  it('matrix.yaml — matrix.schema.json', () => {
    const v = compile('matrix.schema.json')
    expect(v(read(resolve(design, 'matrix.yaml'))), JSON.stringify(v.errors?.slice(0, 3))).toBe(true)
  })
})
