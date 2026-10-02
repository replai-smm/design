/**
 * Шрифт IBM Plex Sans: в файлах из репозитория есть вся русская азбука и знаки русского текста.
 * Проверка по таблице cmap самих .woff2 — не по описанию шрифта.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { covers } from '../lib/woff2.mjs'

const design = resolve(import.meta.dirname, '..')
const tokens = JSON.parse(readFileSync(resolve(design, 'tokens.json'), 'utf8'))
const RU = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя«»—–…№₽'

describe('IBM Plex Sans', () => {
  for (const f of tokens.font.files) {
    it(`${f}: кириллица и знаки русского текста есть`, () => {
      expect(covers(resolve(design, f), RU).missing).toEqual([])
    })
  }

  it('проверка не пустая: иероглифа в шрифте нет — и она это видит', () => {
    expect(covers(resolve(design, tokens.font.files[0]), '中').ok).toBe(false)
  })
})
