/** Шрифты пакета: в каждом .woff2 — вся русская азбука и знаки русского текста (по таблице cmap самих файлов). */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { covers } from '../lib/woff2.mjs'

const design = resolve(import.meta.dirname, '..')
const tokens = JSON.parse(readFileSync(resolve(design, 'tokens.json'), 'utf8'))
const RU = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя«»—–…№₽'
const files: string[] = [...tokens.font.sans.files, ...tokens.font.mono.files]

describe('шрифты', () => {
  for (const f of files) {
    it(`${f}: кириллица и знаки русского текста есть`, () => {
      expect(covers(resolve(design, f), RU).missing).toEqual([])
    })
  }

  it('проверка не пустая: иероглифа в шрифте нет — и она это видит', () => {
    expect(covers(resolve(design, files[0]), '中').ok).toBe(false)
  })
})
