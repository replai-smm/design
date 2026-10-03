// Переходник VKUI ← токены Carbon (CONCEPT §3.4, «Arena»): Арена остаётся на VKUI, но цвета, шрифт, наборы текста,
// отступы, углы, тень и движение берёт отсюда — второго источника облика нет. Выход — dist/vkui-adapter.css
// (переменные VKUI = ссылки var(--cds-…)) и dist/vkui-adapter.ts (та же таблица для тестов Арены).
//
// Как VKUI 8 красит тему: AppRoot (и корень порталов) получает класс `vkui--<платформа>--<тема>`:
// vkBase — Android, vkIOS — iOS, vkCom — vk.com; тема light или dark (lib/tokens/constants.js VKUI). vkui.css
// объявляет переменные `--vkui--…` на этих классах и на :root. Переходник объявляет те же переменные на тех же
// классах — подключать его после vkui.css (одинаковый вес селектора, побеждает поздний).
//
// Таблицы ниже сняты с VKUI 8.3.1 (тема vkBase: 571 переменная). Каждая переменная — либо здесь (токен Carbon), либо
// в LEFT с причиной, почему остаётся у VKUI. Тест сверяет это с тем, что читает Арена (fixtures/arena-vkui-used.json).

export const VKUI_VERSION = '8.3.1'

/** Классы темы VKUI 8: платформа × тема. */
export const VKUI_CLASSES = {
  light: ['vkui--vkBase--light', 'vkui--vkIOS--light', 'vkui--vkCom--light'],
  dark: ['vkui--vkBase--dark', 'vkui--vkIOS--dark', 'vkui--vkCom--dark'],
}

// ── Цвета ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// У каждого цвета VKUI три переменные: сам цвет, --hover и --active. Запись: 'токен' (все три одинаковые),
// [обычный, hover, active] или { light, dark }, когда теме нужен свой токен.

const S = (base, hover = base, active = hover) => [base, hover, active]
const layer1 = S('layer-01', 'layer-hover-01', 'layer-active-01')
const layer2 = S('layer-02', 'layer-hover-02', 'layer-active-02')
const accentLayer = S('layer-accent-01', 'layer-accent-hover-01', 'layer-accent-active-01')
const inverse = S('background-inverse', 'background-inverse-hover')
const tint = S('background-hover', 'background-selected', 'background-selected-hover')
const field = S('field-02', 'field-hover-02')
const accent = S('button-primary', 'button-primary-hover', 'button-primary-active')
const danger = S('button-danger-primary', 'button-danger-hover', 'button-danger-active')
const link = S('link-primary', 'link-primary-hover')
// Тёмная заливка под белым текстом в обеих темах (кнопка «нейтральная главная» VKUI = вторичная кнопка Carbon).
const secondaryButton = S('button-secondary', 'button-secondary-hover', 'button-secondary-active')

/** Цвет VKUI (без `--vkui--color_`) → токен Carbon. Тона статусов — только из закрытого списка palettes.product. */
export const COLORS = {
  // фоны и слои: страница — background, карточка и шапка — layer-01, вторичный фон — layer-02
  background: S('background', 'background-hover', 'background-active'),
  background_content: layer1,
  background_content_alpha: layer1,
  background_modal: layer1,
  background_contrast_themed: layer1,
  header_background: layer1,
  avatar_overlay_inverse_alpha: layer1,
  background_secondary: layer2,
  background_tertiary: layer2,
  background_secondary_alpha: tint,
  background_tertiary_alpha: tint,
  background_contrast_secondary_alpha: tint,
  // «обратные» фоны VKUI несут белый текст (text_contrast, text_contrast_themed) в обеих темах: в тёмной
  // background-inverse светлый (#f4f4f4) и белый на нём не читается — там слой-акцент (11,5 : 1)
  background_content_inverse: secondaryButton,
  background_modal_inverse: { light: inverse, dark: accentLayer },
  background_contrast_inverse: { light: inverse, dark: accentLayer },
  // «контрастный» у VKUI — белый в обеих темах, то, что лежит на цветной заливке
  background_contrast: 'icon-on-color',
  // акцент VKUI (синий) — интерактивный цвет Carbon; это не статус
  background_accent: accent,
  background_accent_themed: accent,
  background_accent_alternative: accent,
  background_accent_tint: accent,
  background_accent_themed_alpha: 'highlight',
  background_info_tint: 'notification-background-info',
  // тона статусов: опасно · хорошо · внимание
  background_negative: danger,
  background_negative_tint: 'status-error-background',
  // заливка «хорошо» под белым текстом: тёмный зелёный тона (зелёный-80 в обеих темах), чтобы текст держал 4,5 : 1
  background_positive: { light: 'status-success-text', dark: 'status-success-background' },
  background_positive_tint: 'status-success-background',
  background_warning: 'status-warning-background',
  // поля ввода, поиск, строка сообщения
  field_background: field,
  search_field_background: field,
  write_bar_input_background: field,
  field_border_alpha: 'border-strong-01',
  write_bar_input_border: 'border-subtle-01',
  write_bar_input_border_alpha: 'border-subtle-01',
  // переключатель вкладок: бегунок светлее дорожки
  segmented_control: { light: layer1, dark: accentLayer },
  track_background: accentLayer,
  track_buffer: 'highlight',
  skeleton_from: 'skeleton-background',
  skeleton_to: 'skeleton-element',
  image_placeholder: accentLayer,
  image_placeholder_alpha: accentLayer,
  image_border_alpha: 'border-subtle-01',
  overlay_primary: 'overlay',
  overlay_secondary: 'overlay',
  avatar_overlay: 'overlay',
  transparent: ['transparent', 'background-hover', 'background-active'],
  // текст
  text_primary: 'text-primary',
  text_primary_alpha: 'text-primary',
  text_muted: 'text-primary',
  // «всегда тёмный» — тёмный текст в обеих темах
  text_primary_invariably: { light: 'text-primary', dark: 'text-inverse' },
  text_secondary: 'text-secondary',
  text_secondary_alpha: 'text-secondary',
  text_subhead: 'text-secondary',
  tabbar_text_inactive: 'text-secondary',
  text_tertiary: 'text-helper',
  text_contrast: 'text-on-color',
  link_contrast: 'text-on-color',
  // «контрастный по теме» у VKUI лежит на background_accent_themed — у нас это синяя кнопка Carbon в обеих
  // темах, поэтому текст на ней белый (с text-inverse тёмная тема давала 3,6 : 1)
  text_contrast_themed: 'text-on-color',
  text_accent: link,
  // текст вторичной и третичной кнопки VKUI лежит на полупрозрачной заливке background_secondary_alpha: в светлой
  // link-primary на ней 4,0–4,4 : 1, поэтому темнее — link-primary-hover (6,3–6,9 : 1); в тёмной link-primary — 5,0 : 1
  text_accent_themed: { light: S('link-primary-hover'), dark: link },
  text_link: link,
  text_link_themed: link,
  text_link_tint: link,
  action_sheet_text: link,
  button_text: link,
  text_link_visited: 'link-visited',
  text_negative: 'status-error-text',
  text_positive: 'status-success-text',
  // значки
  icon_primary: 'icon-primary',
  icon_primary_invariably: { light: 'icon-primary', dark: 'icon-inverse' },
  icon_medium: 'icon-secondary',
  icon_medium_alpha: 'icon-secondary',
  icon_secondary: 'icon-secondary',
  icon_secondary_alpha: 'icon-secondary',
  icon_tertiary: 'icon-secondary',
  icon_tertiary_alpha: 'icon-secondary',
  // VKUI красит этим цветом и текст (SimpleCell: after, badge), поэтому — цвет ссылки, а не interactive:
  // в светлой это тот же синий, в тёмной interactive на втором слое — 3,45 : 1, link-primary — 4,9 : 1
  icon_accent: link,
  icon_accent_themed: link,
  button_icon: 'interactive',
  panel_header_icon: 'interactive',
  write_bar_icon: 'interactive',
  icon_contrast: 'icon-on-color',
  icon_contrast_secondary: 'icon-on-color',
  icon_contrast_themed: 'icon-on-color',
  icon_negative: 'status-error',
  icon_positive: 'status-success',
  icon_warning: 'status-warning',
  // линии и рамки
  separator_primary: 'border-subtle-01',
  separator_primary2x: 'border-subtle-01',
  separator_primary3x: 'border-subtle-01',
  separator_primary_alpha: 'border-subtle-01',
  separator_secondary: 'border-subtle-01',
  stroke_accent: 'border-interactive',
  stroke_accent_themed: 'border-interactive',
  button_stroke: 'border-interactive',
  stroke_primary: 'border-inverse',
  stroke_contrast: 'icon-on-color',
  stroke_negative: 'status-error',
  stroke_positive: 'status-success',
  // цвета-метки VKUI (аватары, бейджи): ближайший тон из токенов; розового у Carbon в токенах нет — фиолетовый
  accent_blue: 'interactive',
  accent_azure: 'interactive',
  accent_secondary: 'interactive',
  accent_cyan: 'support-info',
  accent_red: 'status-error',
  accent_orange: 'status-warning',
  accent_orange_fire: 'support-caution-major',
  accent_orange_peach: 'support-caution-minor',
  accent_green: 'status-success',
  accent_lime: 'status-success',
  accent_gray: 'status-neutral',
  accent_purple: 'support-caution-undefined',
  accent_violet: 'support-caution-undefined',
  accent_pink: 'support-caution-undefined',
  accent_raspberry_pink: 'support-caution-undefined',
}

/**
 * Читает Арена, а VKUI такой переменной не объявляет (web/src/pages/admin/sections/LevelsSection.tsx: рамка карточки
 * уровня). Без объявления рамка не рисуется; переходник даёт ей цвет рамки поля.
 */
export const ARENA_EXTRA = { color_field_border: 'border-strong-01' }

/** Цвета одной темы: полное имя переменной VKUI → токен Carbon. */
export function colorsFor(theme) {
  const out = {}
  for (const [name, spec] of Object.entries(COLORS)) {
    const s = Array.isArray(spec) || typeof spec === 'string' ? spec : spec[theme]
    const [base, hover, active] = typeof s === 'string' ? [s, s, s] : s
    out[`--vkui--color_${name}`] = base
    out[`--vkui--color_${name}--hover`] = hover
    out[`--vkui--color_${name}--active`] = active
  }
  for (const [name, t] of Object.entries(ARENA_EXTRA)) out[`--vkui--${name}`] = t
  return out
}

// ── Текст ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Набор VKUI → набор Carbon (productive). Кегль VKUI в комментарии. Мельче 12px у Carbon нет — подписи идут в label-01.
// У VKUI высота строки — длина (её вычитают в calc), у Carbon — число: переходник отдаёт кегль × число.

export const TYPE = {
  display_title1: 'heading-04', // 23
  display_title2: 'heading-03', // 21
  display_title3: 'heading-03', // 19
  display_title4: 'heading-compact-02', // 17
  title1: 'heading-04', // 24
  title2: 'heading-03', // 20
  title3: 'heading-compact-02', // 17
  headline: 'heading-compact-02', // 16
  headline1: 'heading-compact-02', // 16
  headline2: 'heading-compact-01', // 15
  text: 'body-compact-02', // 16
  paragraph: 'body-02', // 15, многострочный
  subhead: 'body-compact-01', // 14
  footnote: 'helper-text-01', // 13
  footnote_caps: 'helper-text-01',
  caption1: 'label-01', // 12
  caption1_caps: 'label-01',
  caption2: 'label-01', // 11
  caption2_caps: 'label-01',
  caption3: 'label-01', // 9
  caption3_caps: 'label-01',
}

// ── Отступы ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Отступ VKUI → ближайший шаг Carbon (на равном расстоянии — больший). [пиксели VKUI, шаг spacing-NN]; правило
// «ближайший» проверяет тест.

export const SPACING = {
  spacing_size_3xs: [2, '01'],
  spacing_size_2xs: [2, '01'],
  spacing_size_xs: [4, '02'],
  spacing_size_s: [6, '03'],
  spacing_size_m: [8, '03'],
  spacing_size_l: [10, '04'],
  spacing_size_xl: [12, '04'],
  spacing_size_2xl: [16, '05'],
  spacing_size_3xl: [20, '06'],
  spacing_size_4xl: [24, '06'],
  'size_base_padding_horizontal--regular': [16, '05'],
  'size_base_padding_vertical--regular': [12, '04'],
  'size_split_col_padding_horizontal--regular': [16, '05'],
  'size_cardgrid_padding--regular': [8, '03'],
  'size_cardgrid_padding_vertical--regular': [8, '03'],
  'size_form_item_padding_vertical--regular': [12, '04'],
  'size_field_horizontal_padding--regular': [12, '04'],
  'size_button_padding_horizontal--regular': [12, '04'],
  'size_button_group_gap_small--regular': [8, '03'],
  'size_button_group_gap_medium--regular': [12, '04'],
  'size_button_base_small_padding_horizontal--regular': [16, '05'],
  'size_button_base_medium_padding_horizontal--regular': [16, '05'],
  'size_button_base_large_padding_horizontal--regular': [20, '06'],
  'size_button_base_small_padding_horizontal_icon--regular': [12, '04'],
  'size_button_base_medium_padding_horizontal_icon--regular': [12, '04'],
  'size_button_base_large_padding_horizontal_icon--regular': [16, '05'],
  'size_button_tertiary_small_padding_horizontal--regular': [12, '04'],
  'size_button_tertiary_medium_padding_horizontal--regular': [12, '04'],
  'size_button_tertiary_large_padding_horizontal--regular': [16, '05'],
  'size_button_tertiary_small_padding_horizontal_icon--regular': [8, '03'],
  'size_button_tertiary_medium_padding_horizontal_icon--regular': [8, '03'],
  'size_button_tertiary_large_padding_horizontal_icon--regular': [12, '04'],
  'size_popup_base_padding--regular': [32, '07'],
  'size_popup_base_padding--compact': [20, '06'],
  'size_popup_header_padding--regular': [24, '06'],
  'size_popup_header_padding--compact': [16, '05'],
  'size_subnavigation_bar_gap--regular': [8, '03'],
  'size_subnavigation_bar_padding_vertical--regular': [12, '04'],
  'size_label_horizontal_margin--regular': [16, '05'],
  'size_tooltip_margin--regular': [8, '03'],
  'size_arrow_padding--regular': [12, '04'],
  'size_select_icon_padding--regular': [6, '03'],
  'size_select_icon_padding--compact': [7, '03'],
}

/** Всё, что не цвет и не зависит от темы: полное имя переменной VKUI → токен Carbon. */
export function common() {
  const out = {}
  const put = (name, token) => (out[`--vkui--${name}`] = token)
  for (const n of ['font_family_base', 'font_family_accent', 'font_family_fallbacks']) put(n, 'font-sans')
  for (const n of ['accent1', 'accent2', 'base1', 'base2']) put(`font_weight_${n}`, 'font-weight-semibold')
  for (const n of ['accent3', 'base3']) put(`font_weight_${n}`, 'font-weight-regular')
  for (const [style, set] of Object.entries(TYPE)) {
    for (const d of ['regular', 'compact']) {
      put(`font_${style}--font_family--${d}`, 'font-sans')
      put(`font_${style}--font_size--${d}`, `${set}-font-size`)
      put(`font_${style}--line_height--${d}`, `${set}-line-height`)
      put(`font_${style}--font_weight--${d}`, `${set}-font-weight`)
    }
  }
  for (const [name, [, step]] of Object.entries(SPACING)) put(name, `spacing-${step}`)
  // углы Carbon прямые; флажок — sm, «скруглённое» VKUI (таблетка) — full
  for (const n of ['size_border_radius', 'size_border_radius_paper', 'size_border_radius_promo', 'size_card_border_radius'])
    put(`${n}--regular`, 'radius-none')
  put('size_check_border_radius--regular', 'radius-sm')
  put('size_border_radius_rounded--regular', 'radius-full')
  // одна тень Carbon — у всего, что VKUI поднимает над слоем
  for (const n of ['elevation1', 'elevation1_invert_y', 'elevation2', 'elevation3', 'elevation4']) put(n, 'shadow-raised')
  // движение: 0,1 с · 0,2 с · 0,4 с → ближайшие длительности Carbon; «уменьшить движение» обнуляет их в tokens.css
  put('animation_duration_s', 'duration-fast-02')
  put('animation_duration_m', 'duration-moderate-02')
  put('animation_duration_l', 'duration-slow-01')
  put('animation_easing_default', 'easing-standard-productive')
  put('animation_easing_platform', 'easing-standard-productive')
  return out
}

/** Что остаётся у VKUI: [шаблон имени, почему]. Всё остальное, что объявляет тема VKUI, обязано быть в таблицах выше. */
export const LEFT = [
  [
    '^--vkui--size_(button_(extra_small|small|medium|large)_height|button_minimum_width|field_height|search_height|cell_height|panel_header_height|popup_(small|medium|large)|switch_|checkbox|avatar_|badge_|arrow--|arrow_promo|icon_u_i|option_hierarchy)',
    'размер детали VKUI (высота кнопки, поля, шапки; ширина окна; аватар, значок): у Carbon для этих мест токена нет, высоты меняются отдельным решением вместе с экранами',
  ],
  ['^--vkui--size_border(1x|2x|3x)?--', 'толщина линии под плотность экрана (1px, 0,5px) — у Carbon токена нет'],
  ['^--vkui--size_button_group_gap_space--', 'стык кнопок в группе (1px) — толщина линии, не отступ'],
  ['^--vkui--opacity_', 'прозрачность выключенного и нажатого — у Carbon токена нет (у него свои цвета выключенного)'],
  ['^--vkui--z_index_', 'порядок слоёв окна — не облик'],
  ['^--vkui--colors_scheme$', 'слово light или dark для color-scheme — ставит сам VKUI по теме'],
  ['^--vkui--(gradient|blur_)', 'градиент из нескольких точек и размытие фона — у Carbon таких токенов нет'],
  ['^--vkui--theme_', 'служебное имя темы VKUI'],
  ['^--vkui--font_\\w+--text_transform--', 'ПРОПИСНЫЕ у подписей _caps — правило набора VKUI, не токен'],
]

/** Строка CSS для токена Carbon. */
export function cssValue(token) {
  if (token === 'transparent') return 'transparent'
  // высота строки VKUI — длина: кегль набора × число Carbon
  const lh = /^(.+)-line-height$/.exec(token)
  if (lh) return `calc(var(--cds-${lh[1]}-font-size) * var(--cds-${token}))`
  return `var(--cds-${token})`
}

const HEAD = 'Сгенерировано design/build.mjs (design/lib/vkui.mjs) из tokens.json и scale.json. Руками не править.'

function block(selectors, map) {
  return `${selectors.join(',\n')} {\n${Object.entries(map)
    .map(([k, t]) => `  ${k}: ${cssValue(t)};`)
    .join('\n')}\n}\n`
}

/** dist/vkui-adapter.css */
export function vkuiCss({ tokens }) {
  const cls = (list) => list.map((c) => `.${c}`)
  return [
    `/* ${HEAD}
   Переходник VKUI ${VKUI_VERSION} ← IBM Carbon ${tokens.source.version}: переменные VKUI берут значения из токенов дизайн-системы.
   Подключение (после VKUI и токенов):
     import '@vkontakte/vkui/dist/vkui.css'
     import '<путь>/design/dist/tokens.css'
     import '<путь>/vkui-adapter.css'
   Тема: классы VKUI vkui--<платформа>--light|dark выбирают таблицу ниже, а значения var(--cds-…) — тема Carbon
   (data-theme или тема системы, см. tokens.css). Темы должны совпадать: data-theme ставится по той же теме, что и у VKUI. */\n`,
    `/* шрифт, наборы текста, отступы, углы, тень, движение — общие для обеих тем */`,
    block([':root', ...cls(VKUI_CLASSES.light), ...cls(VKUI_CLASSES.dark)], common()),
    `/* светлая тема (Carbon ${tokens.themes['светлая'].carbon}) */`,
    block([':root', ...cls(VKUI_CLASSES.light)], colorsFor('light')),
    `/* тёмная тема (Carbon ${tokens.themes['тёмная'].carbon}) */`,
    block(cls(VKUI_CLASSES.dark), colorsFor('dark')),
  ].join('\n')
}

/** dist/vkui-adapter.ts */
export function vkuiTs({ tokens }) {
  const j = (x) => JSON.stringify(x, null, 2)
  return `// ${HEAD}
// Переходник VKUI ${VKUI_VERSION} ← IBM Carbon ${tokens.source.version}: та же таблица, что в vkui-adapter.css, для тестов и кода.
// Значение — имя токена Carbon без \`--cds-\` (или transparent); строка CSS — cssValue().

export const vkuiVersion = '${VKUI_VERSION}'

/** Классы темы VKUI 8: платформа (vkBase — Android, vkIOS — iOS, vkCom — vk.com) × тема. */
export const vkuiClasses = ${j(VKUI_CLASSES)} as const

/** Шрифт, наборы текста, отступы, углы, тень, движение: переменная VKUI → токен Carbon. Одинаково в обеих темах. */
export const common: Record<string, string> = ${j(common())}

/** Цвета по темам: переменная VKUI → токен Carbon. */
export const colors: Record<'light' | 'dark', Record<string, string>> = ${j({ light: colorsFor('light'), dark: colorsFor('dark') })}

/** Что оставлено VKUI: [шаблон имени, почему]. */
export const left: ReadonlyArray<readonly [RegExp, string]> = [
${LEFT.map(([re, why]) => `  [new RegExp(${JSON.stringify(re)}), ${JSON.stringify(why)}],`).join('\n')}
]

/** Строка CSS для токена Carbon. */
export function cssValue(token: string): string {
  if (token === 'transparent') return 'transparent'
  const lh = /^(.+)-line-height$/.exec(token)
  if (lh) return \`calc(var(--cds-\${lh[1]}-font-size) * var(--cds-\${token}))\`
  return \`var(--cds-\${token})\`
}

/** Чем закрыта переменная VKUI: 'carbon' — токеном (в обеих темах), 'vkui' — оставлена VKUI с причиной, null — ничем. */
export function coverage(name: string): 'carbon' | 'vkui' | null {
  if (name in common || (name in colors.light && name in colors.dark)) return 'carbon'
  if (left.some(([re]) => re.test(name))) return 'vkui'
  return null
}
`
}

/** Выходы переходника для outputs() генератора. */
export function vkuiOutputs(all) {
  return { 'dist/vkui-adapter.css': vkuiCss(all), 'dist/vkui-adapter.ts': vkuiTs(all) }
}

/** Все токены Carbon, на которые ссылается переходник (для теста: каждый есть в tokens.json или scale.json). */
export function referencedTokens() {
  const names = new Set(Object.values(common()))
  for (const t of ['light', 'dark']) for (const v of Object.values(colorsFor(t))) names.add(v)
  names.delete('transparent')
  for (const n of [...names]) {
    const lh = /^(.+)-line-height$/.exec(n)
    if (lh) names.add(`${lh[1]}-font-size`)
  }
  return [...names].sort()
}
