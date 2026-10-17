/**
 * Статусы — закрытый список. Слово на экране — из закона Карты (сверяет process); здесь — то, что видно без закона:
 * тон — слово словаря тонов, id не повторяются, красное — только «падает», «работает» — «хорошо».
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'

const design = resolve(import.meta.dirname, '..')
const json = (p: string) => JSON.parse(readFileSync(resolve(design, p), 'utf8'))
const doc = json('statuses.json')
const tokens = json('tokens.json')

describe('статусы', () => {
  it('statuses.json проходит statuses.schema.json; тон — слово словаря тонов', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    expect(ajv.validate(json('statuses.schema.json'), doc), JSON.stringify(ajv.errors)).toBe(true)
    for (const s of doc.statuses) expect(Object.keys(tokens.tones), s.id).toContain(s.tone)
  })

  it('id и пары (ось, значение) не повторяются', () => {
    expect(new Set(doc.statuses.map((s: any) => s.id)).size).toBe(doc.statuses.length)
    expect(new Set(doc.statuses.map((s: any) => `${s.axis}|${s.value}`)).size).toBe(doc.statuses.length)
  })

  it('красное — только «падает»; «работает» — один тон «хорошо» везде', () => {
    const by = (t: string) => doc.statuses.filter((s: any) => s.tone === t).map((s: any) => s.say)
    expect(by('опасно')).toEqual(['падает'])
    expect(by('хорошо')).toEqual(['работает'])
  })
})
