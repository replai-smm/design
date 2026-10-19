// Сгенерировано build.mjs из tokens.json, scale.json и statuses.json. Руками не править: правка — в источнике, потом `npm run build`.

/** Роли цвета обеих тем: ключ — значение атрибута data-theme. */
export const colors = {
  "light": {
    "canvas": "#f4f4f4",
    "surface": "#ffffff",
    "inverse": "#161616",
    "inverse-hover": "#393939",
    "fg": "#161616",
    "fg-muted": "#525252",
    "fg-disabled": "#a8a8a8",
    "fg-inverse": "#ffffff",
    "line": "#e0e0e0",
    "line-strong": "#8d8d8d",
    "hover": "#8d8d8d1f",
    "selected": "#8d8d8d33",
    "accent": "#0f62fe",
    "scrim": "#16161680",
    "shadow": "#0000002e",
    "danger": "#da1e28",
    "danger-fg": "#a2191f",
    "danger-bg": "#fff1f1",
    "warning": "#b28600",
    "warning-fg": "#684e00",
    "warning-bg": "#fcf4d6",
    "success": "#198038",
    "danger-fill": "#ffd7d9",
    "warning-fill": "#fcf4d6",
    "neutral-fill": "#e0e0e0",
    "success-fill": "#a7f0ba",
    "series-1": "#6929c4",
    "series-2": "#1192e8",
    "series-3": "#005d5d",
    "series-4": "#9f1853",
    "series-5": "#8a3800",
    "series-6": "#6f6f6f"
  },
  "dark": {
    "canvas": "#0f0f11",
    "surface": "#17171a",
    "inverse": "#ececec",
    "inverse-hover": "#c6c6c6",
    "fg": "#ececec",
    "fg-muted": "#a1a1aa",
    "fg-disabled": "#5a5a60",
    "fg-inverse": "#0f0f11",
    "line": "#2a2a2f",
    "line-strong": "#6f6f76",
    "hover": "#8d8d8d29",
    "selected": "#8d8d8d3d",
    "accent": "#78a9ff",
    "scrim": "#000000b3",
    "shadow": "#000000a6",
    "danger": "#fa4d56",
    "danger-fg": "#ffb3b8",
    "danger-bg": "#331417",
    "warning": "#f1c21b",
    "warning-fg": "#fddc69",
    "warning-bg": "#2e2608",
    "success": "#42be65",
    "danger-fill": "#5a1d22",
    "warning-fill": "#433609",
    "neutral-fill": "#35353b",
    "success-fill": "#133e23",
    "series-1": "#a56eff",
    "series-2": "#33b1ff",
    "series-3": "#08bdba",
    "series-4": "#ff7eb6",
    "series-5": "#ba4e00",
    "series-6": "#8d8d8d"
  }
} as const

export type Theme = keyof typeof colors
export type Role = keyof typeof colors.light

/** Словарь тонов: слово → роли знака, текста, подложки и заливки сетки статуса (null — у тона её нет). */
export const tones = {
  "опасно": {
    "key": "danger",
    "mark": "danger",
    "text": "danger-fg",
    "bg": "danger-bg",
    "fill": "danger-fill"
  },
  "внимание": {
    "key": "warning",
    "mark": "warning",
    "text": "warning-fg",
    "bg": "warning-bg",
    "fill": "warning-fill"
  },
  "инфо": {
    "key": "info",
    "mark": "fg",
    "text": "fg",
    "bg": null,
    "fill": null
  },
  "нейтрально": {
    "key": "neutral",
    "mark": "fg-muted",
    "text": "fg",
    "bg": null,
    "fill": "neutral-fill"
  },
  "хорошо": {
    "key": "success",
    "mark": "success",
    "text": "fg",
    "bg": null,
    "fill": "success-fill"
  }
} as const

export type Tone = keyof typeof tones

/** Закрытый список статусов: слово на экране (`say`) — из закона Карты, тон — из словаря тонов. */
export const statuses = [
  {
    "id": "work.working",
    "axis": "work",
    "value": "работает",
    "say": "работает",
    "tone": "хорошо"
  },
  {
    "id": "work.failing",
    "axis": "work",
    "value": "падает",
    "say": "падает",
    "tone": "опасно"
  },
  {
    "id": "work.unchecked",
    "axis": "work",
    "value": "не проверено",
    "say": "не проверено",
    "tone": "нейтрально"
  },
  {
    "id": "work.awaiting-run",
    "axis": "work",
    "value": "ждёт прогона",
    "say": "ждёт прогона тестов",
    "tone": "нейтрально"
  },
  {
    "id": "work.not-on-prod",
    "axis": "work",
    "value": "не на проде",
    "say": "не на проде",
    "tone": "нейтрально"
  },
  {
    "id": "work.off",
    "axis": "work",
    "value": "выключено",
    "say": "выключено",
    "tone": "нейтрально"
  },
  {
    "id": "change.changing",
    "axis": "change",
    "value": "меняется",
    "say": "хотят изменить",
    "tone": "внимание"
  },
  {
    "id": "change.removing",
    "axis": "change",
    "value": "удаляется",
    "say": "хотят удалить",
    "tone": "внимание"
  },
  {
    "id": "change.adding",
    "axis": "change",
    "value": "добавляется",
    "say": "хотят добавить",
    "tone": "внимание"
  }
] as const

export type StatusId = (typeof statuses)[number]['id']

/** Шкалы: имя CSS-переменной без `--ds-` → значение. */
export const scale = {
  "space-tight": "0.25rem",
  "space-items": "0.5rem",
  "space-compact": "0.75rem",
  "space-blocks": "1rem",
  "space-groups": "1.5rem",
  "space-sections": "2rem",
  "size-icon": "1rem",
  "size-dense": "2rem",
  "size-control": "2.5rem",
  "size-touch": "3rem",
  "measure-rail": "16rem",
  "measure-hint": "18rem",
  "measure-narrow": "20rem",
  "measure-popup": "24rem",
  "measure-form": "28rem",
  "measure-panel": "32rem",
  "measure-wide": "36rem",
  "measure-window": "42rem",
  "measure-page": "80rem",
  "font-sans": "'IBM Plex Sans', system-ui, sans-serif",
  "font-mono": "'IBM Plex Mono', ui-monospace, monospace",
  "text-caption-size": "0.75rem",
  "text-caption-line": "1rem",
  "text-caption-weight": "400",
  "text-body-size": "0.875rem",
  "text-body-line": "1.25rem",
  "text-body-weight": "400",
  "text-heading-size": "0.875rem",
  "text-heading-line": "1.25rem",
  "text-heading-weight": "600",
  "text-reading-size": "1rem",
  "text-reading-line": "1.5rem",
  "text-reading-weight": "400",
  "text-code-size": "0.8125rem",
  "text-code-line": "1.25rem",
  "text-code-weight": "400",
  "text-title-size": "1.25rem",
  "text-title-line": "1.75rem",
  "text-title-weight": "400",
  "text-page-size": "1.75rem",
  "text-page-line": "2.25rem",
  "text-page-weight": "400",
  "radius-control": "4px",
  "radius-surface": "6px",
  "radius-full": "9999px",
  "elevation-flat": "none",
  "elevation-raised": "0 2px 6px 0 var(--ds-shadow)",
  "elevation-overlay": "0 8px 24px 0 var(--ds-shadow)",
  "motion-fast": "110ms",
  "motion-move": "600ms",
  "ease": "cubic-bezier(0.4, 0.14, 0.3, 1)"
} as const

export type ScaleToken = keyof typeof scale

/** Ссылка на роль или шаг для style и SVG: var(--ds-…). */
export const cssVar = <N extends Role | ScaleToken>(name: N) => `var(--ds-${name})` as const
