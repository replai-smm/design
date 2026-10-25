// Набор значков ДС — один: IBM Carbon (@carbon/icons, Apache-2.0), размер 16. Сюда входят только значки, которые
// рисуют компоненты и примеры; новый — строкой в ICONS. Выход — react/src/lib/icons.gen.ts: данные путей (их рисует `Icon`
// по имени) и по компоненту на значок с именем Carbon (`Add`, `ChevronDown` — как в @carbon/icons-react) для `renderIcon`;
// продукт берёт их из `@replai-smm/design/icons`. У продукта зависимости нет: данные лежат в пакете.
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
  view: 'view',
  'view-off': 'view--off',
  'tone-danger': 'error--filled',
  'tone-decision': 'help--filled',
  'tone-warning': 'warning--alt--filled',
  'tone-success': 'checkmark--filled',
  'tone-info': 'information--filled',
  'tone-neutral': 'circle-dash',
  'checkmark-outline': 'checkmark--outline',
  'in-progress': 'in-progress',
  incomplete: 'incomplete',
  'pending-filled': 'pending--filled',
  'unknown-filled': 'unknown--filled',
  'undefined-filled': 'undefined--filled',
  'warning-alt-inverted-filled': 'warning--alt-inverted--filled',
  'warning-square-filled': 'warning-square--filled',
}

/** Имя компонента значка — как в @carbon/icons-react: `arrow--down` → `ArrowDown`, `stop--filled--alt` → `StopFilledAlt`. */
export const componentName = (carbon) =>
  carbon
    .split(/-+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')

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
  const comps = Object.entries(ICONS).map(([name, carbon]) => `export const ${componentName(carbon)} = icon(${JSON.stringify(name)}, '${componentName(carbon)}')`)
  return `// Сгенерировано build.mjs (lib/icons.mjs) из @carbon/icons — Copyright IBM Corp., Apache-2.0. Руками не править.
import { createElement, type ReactElement, type SVGProps } from 'react'

export const ICONS = {
${lines.join('\n')}
} as const

export type IconName = keyof typeof ICONS

/** Свойства значка-компонента: атрибуты svg; с \`aria-label\` значок — картинка для читалки, без него — скрыт от читалки. */
export type CarbonIconProps = Omit<SVGProps<SVGSVGElement>, 'children'>
/** Значок-компонент, как в @carbon/icons-react: его ждёт \`renderIcon\`. */
export type CarbonIconType = ((props: CarbonIconProps) => ReactElement) & { displayName: string }

/** Нарисовать значок набора: 16 px, цвет — текущий цвет текста. */
export function glyph(name: IconName, { className, ...props }: CarbonIconProps = {}): ReactElement {
  const icon = ICONS[name]
  return createElement(
    'svg',
    { viewBox: icon.viewBox, fill: 'currentColor', focusable: 'false', 'data-icon': name, 'aria-hidden': props['aria-label'] ? undefined : true, ...props, className: ['size-icon shrink-0', className].filter(Boolean).join(' ') },
    ...icon.parts.map(([elem, attrs], i) => createElement(elem, { key: i, ...attrs })),
  )
}

const icon = (name: IconName, displayName: string): CarbonIconType => Object.assign((props: CarbonIconProps) => glyph(name, props), { displayName })

${comps.join('\n')}
`
}
