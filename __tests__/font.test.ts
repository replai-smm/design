/** Шрифты пакета: в каждом .woff2 — вся русская азбука и знаки русского текста (по таблице cmap самих файлов). */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { covers } from '../lib/woff2.mjs'
import { maskComments, kindOf } from '../lint/scan.mjs'

const design = resolve(import.meta.dirname, '..')
const tokens = JSON.parse(readFileSync(resolve(design, 'tokens.json'), 'utf8'))
const RU = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя«»—–…№₽'
const files: string[] = [...tokens.font.sans.files, ...tokens.font.mono.files]

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.name === '__tests__' ? [] : d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
/** Знаки вне ASCII в коде, который рисуется (комментарии и тесты не в счёт), не покрытые хоть одним шрифтом пакета: { файл: знаки }. */
function uncovered(sources: string[]): Record<string, string[]> {
  const chars = new Map(sources.map((f) => [f, new Set([...maskComments(readFileSync(f, 'utf8'), kindOf(f))].filter((ch) => ch.codePointAt(0)! > 127))]))
  // каждый шрифт распаковывается один раз на все знаки сразу, а не на каждый файл
  const all = [...new Set([...chars.values()].flatMap((s) => [...s]))].join('')
  const missing = new Set(files.flatMap((font) => covers(resolve(design, font), all).missing))
  const out: Record<string, string[]> = {}
  for (const [f, set] of chars) {
    const own = [...set].filter((ch) => missing.has(ch))
    if (own.length) out[f] = own
  }
  return out
}

describe('шрифты', () => {
  for (const f of files) {
    it(`${f}: кириллица и знаки русского текста есть`, () => {
      expect(covers(resolve(design, f), RU).missing).toEqual([])
    })
  }

  it('проверка не пустая: иероглифа в шрифте нет — и она это видит', () => {
    expect(covers(resolve(design, files[0]), '中').ok).toBe(false)
  })

  it('знаки в react/src и .storybook (компоненты, истории, фикстуры) есть во всех шрифтах пакета: запасной шрифт системы снимок не держит', () => {
    const sources = [...walk(resolve(design, 'react', 'src')), ...walk(resolve(design, 'react', '.storybook'))].filter((f) => /\.(tsx?|css)$/.test(f))
    expect(uncovered(sources)).toEqual({})
  })

  it('приманка: знак вне Plex (⠋) в исходнике — красный', () => {
    const bait = resolve(import.meta.dirname, 'bait', 'glyph.tsx')
    expect(uncovered([bait])).toEqual({ [bait]: ['⠋'] })
  })
})
