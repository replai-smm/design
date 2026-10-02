// Какие символы есть в шрифте .woff2 — без зависимостей: brotli есть в node:zlib, таблица cmap в WOFF2 не
// преобразуется, её достаточно найти в распакованном потоке. Нужно тесту «у IBM Plex Sans есть кириллица».
import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ',
  'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB',
  'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar',
  'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf',
  'Glat', 'Gloc', 'Feat', 'Sill']

function base128(buf, pos) {
  let v = 0
  for (let i = 0; i < 5; i++) {
    const b = buf[pos.at++]
    v = (v << 7) | (b & 0x7f)
    if (!(b & 0x80)) return v >>> 0
  }
  throw new Error('woff2: длина UIntBase128 больше 5 байт')
}

/** Таблицы шрифта: { tag: Buffer } (glyf/loca — в преобразованном виде, нам не нужны). */
export function woff2Tables(file) {
  const buf = readFileSync(file)
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file}: не WOFF2`)
  const numTables = buf.readUInt16BE(12)
  const compressed = buf.readUInt32BE(20)
  const pos = { at: 48 }
  const dir = []
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos.at++]
    const idx = flags & 0x3f
    const tag = idx === 63 ? buf.toString('latin1', pos.at, (pos.at += 4)) : KNOWN[idx]
    const version = flags >> 6
    const orig = base128(buf, pos)
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0
    const length = transformed ? base128(buf, pos) : orig
    dir.push({ tag, length })
  }
  const data = brotliDecompressSync(buf.subarray(pos.at, pos.at + compressed))
  const tables = {}
  let at = 0
  for (const t of dir) {
    tables[t.tag] = data.subarray(at, at + t.length)
    at += t.length
  }
  return tables
}

/** Есть ли у шрифта глиф для каждой буквы строки (по cmap: форматы 4 и 12). */
export function covers(file, text) {
  const cmap = woff2Tables(file).cmap
  if (!cmap) throw new Error(`${file}: нет таблицы cmap`)
  const ranges = []
  const n = cmap.readUInt16BE(2)
  for (let i = 0; i < n; i++) {
    const off = cmap.readUInt32BE(4 + i * 8 + 4)
    const format = cmap.readUInt16BE(off)
    if (format === 4) {
      const segX2 = cmap.readUInt16BE(off + 6)
      for (let s = 0; s < segX2; s += 2) {
        const end = cmap.readUInt16BE(off + 14 + s)
        const start = cmap.readUInt16BE(off + 16 + segX2 + s)
        if (start !== 0xffff) ranges.push([start, end])
      }
    } else if (format === 12) {
      const groups = cmap.readUInt32BE(off + 12)
      for (let g = 0; g < groups; g++) ranges.push([cmap.readUInt32BE(off + 16 + g * 12), cmap.readUInt32BE(off + 20 + g * 12)])
    }
  }
  const missing = [...text].filter((ch) => {
    const cp = ch.codePointAt(0)
    return !ranges.some(([a, b]) => cp >= a && cp <= b)
  })
  return { ok: missing.length === 0, missing }
}
