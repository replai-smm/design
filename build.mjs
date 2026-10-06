#!/usr/bin/env node
// Собрать dist/ из tokens.json, scale.json, statuses.json.
//   npm run build          — записать dist/
//   node build.mjs --check  — только сверить: dist/ совпадает с источником? нет — выход 1 (так же проверяет тест)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { DESIGN, outputs } from './lib/generate.mjs'

const check = process.argv.includes('--check')
const stale = []
for (const [rel, content] of Object.entries(outputs())) {
  const file = join(DESIGN, rel)
  const now = existsSync(file) ? readFileSync(file, 'utf8') : null
  if (now === content) continue
  if (check) stale.push(rel)
  else {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    console.log(`записано: design/${rel}`)
  }
}
if (check && stale.length) {
  console.error(`✗ dist/ отстал от источника: ${stale.join(', ')}. Собрать: npm run build`)
  process.exit(1)
}
if (check) console.log('✓ dist/ совпадает с tokens.json, scale.json, statuses.json')
