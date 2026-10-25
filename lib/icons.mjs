// Набор значков ДС — один: IBM Carbon (@carbon/icons, Apache-2.0), размер 16. Сюда входят только значки, которые
// рисуют компоненты; новый — строкой в ICONS. Выход — react/src/lib/icons.gen.ts (данные путей), рисует их `Icon`.
// У продукта зависимости нет: данные лежат в пакете.
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Имя значка ДС → имя в Carbon. */
export const ICONS = {
  add: 'add',
  'arrow-down': 'arrow--down',
  'arrow-left': 'arrow--left',
  'arrow-up': 'arrow--up',
  'caret-down': 'caret--down',
  'caret-up': 'caret--up',
  check: 'checkmark',
  'chevron-down': 'chevron--down',
  'chevron-left': 'chevron--left',
  'chevron-right': 'chevron--right',
  close: 'close',
  information: 'information',
  menu: 'menu',
  minus: 'subtract',
  search: 'search',
  sort: 'arrows--vertical',
  stop: 'stop--filled--alt',
  upload: 'upload',
  user: 'user',
  'tone-danger': 'error--filled',
  'tone-decision': 'help--filled',
  'tone-warning': 'warning--alt--filled',
  'tone-success': 'checkmark--filled',
  'tone-info': 'information--filled',
  'tone-neutral': 'circle-dash',
}

/** Данные одного значка: viewBox и элементы без невидимых «внутренних» путей Carbon. */
function data(carbon) {
  const icon = require(`@carbon/icons/lib/${carbon}/16.js`)
  const parts = icon.content
    .filter((c) => c.attrs['data-icon-path'] !== 'inner-path')
    .map((c) => {
      const { fill, ...attrs } = c.attrs
      if (fill && fill !== 'currentColor') throw new Error(`${carbon}: свой цвет у части значка`)
      return [c.elem, attrs]
    })
  return { viewBox: icon.attrs.viewBox, parts }
}

export function iconsTs() {
  const lines = Object.entries(ICONS).map(([name, carbon]) => `  ${JSON.stringify(name)}: ${JSON.stringify(data(carbon))},`)
  return `// Сгенерировано build.mjs (lib/icons.mjs) из @carbon/icons — Copyright IBM Corp., Apache-2.0. Руками не править.
export const ICONS = {
${lines.join('\n')}
} as const

export type IconName = keyof typeof ICONS
`
}
