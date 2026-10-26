/**
 * Анатомия — общие куски облика из ролей и шкал. Компонент берёт их отсюда, а не собирает своё: одна поверхность,
 * один фокус, одно «выбрано», одна плотность. Что у какого компонента — registry.json; на собранном Storybook
 * вычисленные стили сверяет с реестром тест облика.
 */

/** Фокус — кольцо цвета ссылки внутрь: синий — только ссылка и фокус. */
export const FOCUS = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent'

/** Высота контрола: 48 на телефоне (палец), 40 на ноутбуке; плотный — 32 везде. */
export const CONTROL = 'min-h-touch md:min-h-control'
export const DENSE = 'min-h-dense'

/** Поверхность: слой, тихая рамка, угол поверхности. Поля — у компонента (роль отступа — в реестре). */
export const SURFACE = 'border border-line bg-surface rounded-surface text-fg'
/** Утопленное на поверхности: код, выходной день. */
export const SUNKEN = 'border border-line bg-canvas rounded-surface text-fg'
/** Метка слева — знак тона или «ждёт тебя»: одна ширина на всю систему. */
export const MARK = 'border-l-2'
/** Цвет метки слева по виду уведомления (Carbon kind): те же четыре вида у уведомлений, всплывашек и плитки. */
export const KIND_MARK = {
  error: 'border-l-danger',
  warning: 'border-l-warning',
  info: 'border-l-fg',
  success: 'border-l-success',
} as const

/** Отклик — быстро; раскрытие и выезд — 0,6 с (ds.css). */
export const FAST = 'transition-colors duration-fast ease-standard'

/** Ряд вариантов (вкладки, фильтры): сегменты на тихой подложке, выбранный — роль «выбрано». */
export const SEGMENTS = 'inline-flex self-start max-w-full min-w-0 items-center gap-tight rounded-control border border-line bg-surface p-tight'
/** Не влезает в ширину — фильтры переносятся: все варианты видны сразу. */
export const SEGMENTS_WRAP = 'flex-wrap'
/** Не влезает — вкладки одной строкой с прокруткой без полосы (ds.css): ряд разделов не съедает экран телефона. */
export const SEGMENTS_SCROLL = 'ds-scroll-row overflow-x-auto'
export const SEGMENT = `inline-flex min-h-control md:min-h-dense shrink-0 cursor-pointer items-center gap-items rounded-control px-compact text-body text-fg-muted ${FAST} hover:bg-hover hover:text-fg ${FOCUS}`
export const SEGMENT_ON = 'data-[state=active]:bg-selected data-[state=active]:font-semibold data-[state=active]:text-fg data-[state=on]:bg-selected data-[state=on]:font-semibold data-[state=on]:text-fg'
