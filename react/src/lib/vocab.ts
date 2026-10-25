/**
 * Словари ДС — одни на все компоненты. Тон, ход работы и состояние матрицы пишутся только этими словами:
 * своего перечисления «тона» или «хода» в компоненте нет (держит тест словарей). Русский словарь тонов — у наших
 * компонентов без пары в Carbon; у компонентов с парой — значения Carbon (низ файла), тоже только отсюда.
 */
import type { ReactNode } from 'react'
import { tones, type Tone } from '../../../dist/tokens.ts'
import type { IconName } from './icons.gen'

export type { Tone }

/** Тон: опасно · решение · внимание · инфо · нейтрально · хорошо (tokens.json → tones). */
export const TONES = Object.keys(tones) as Tone[]

/** Порядок внимания: срочное сверху, норма — внизу (П2, П3); «решение» — сразу за бедой: ждёт человека. */
export const TONE_ORDER: readonly Tone[] = ['опасно', 'решение', 'внимание', 'инфо', 'нейтрально', 'хорошо']

/** Облик тона: классы ролей знака, текста и подложки (у спокойных тонов подложки нет) и форма значка. Классы — словами
 * целиком (Tailwind видит только целые имена); что они те же, что в tokens.json → tones, сверяет тест словарей. */
export interface ToneLook {
  key: (typeof tones)[Tone]['key']
  mark: string
  text: string
  bg: string | null
  icon: IconName
}
export const TONE: Record<Tone, ToneLook> = {
  опасно: { key: 'danger', mark: 'text-danger', text: 'text-danger-fg', bg: 'bg-danger-bg', icon: 'tone-danger' },
  решение: { key: 'decision', mark: 'text-decision', text: 'text-decision-fg', bg: 'bg-decision-bg', icon: 'tone-decision' },
  внимание: { key: 'warning', mark: 'text-warning', text: 'text-warning-fg', bg: 'bg-warning-bg', icon: 'tone-warning' },
  инфо: { key: 'info', mark: 'text-fg', text: 'text-fg', bg: null, icon: 'tone-info' },
  нейтрально: { key: 'neutral', mark: 'text-fg-muted', text: 'text-fg', bg: null, icon: 'tone-neutral' },
  хорошо: { key: 'success', mark: 'text-success', text: 'text-fg', bg: null, icon: 'tone-success' },
}

/** Ход работы: впереди · идёт · готово · ошибка — у шагов, хода в строке и отправки сообщения одни слова. */
export type Progress = 'idle' | 'running' | 'done' | 'error'
export const PROGRESS_WORD: Record<Progress, string> = { idle: 'впереди', running: 'идёт', done: 'готово', error: 'ошибка' }

/** Что показать вместо данных — слова матрицы облика (matrix.yaml → states). */
export type StateKind = 'первый запуск' | 'всё сделано' | 'ничего не найдено' | 'нет доступа' | 'ошибка'
/** Знак состояния — тон словаря. */
export const STATE_TONE: Record<StateKind, Tone> = {
  'первый запуск': 'инфо',
  'всё сделано': 'хорошо',
  'ничего не найдено': 'нейтрально',
  'нет доступа': 'внимание',
  ошибка: 'опасно',
}

/** Данные: готовы, грузятся, не загрузились — одно слово `state` у всего, что показывает данные. */
export type DataState = 'ready' | 'loading' | 'error'

/** Пусто и ошибка — одни имена `empty` и `error` у всего, что показывает данные. */
export interface EmptyView {
  kind: Exclude<StateKind, 'ошибка'>
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}
export interface ErrorView {
  title: ReactNode
  description?: ReactNode
  onRetry?: () => void
}

/* ——— значения Carbon у компонентов с парой (@carbon/react 1.119.0) ——— */

/** Button `kind` (Carbon ButtonKinds); `danger--primary` — то же, что `danger`. */
export const BUTTON_KINDS = ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'danger--primary', 'danger--tertiary', 'danger--ghost'] as const
export type ButtonKind = (typeof BUTTON_KINDS)[number]
/** IconButton `kind` (Carbon IconButtonKinds). */
export type IconButtonKind = Extract<ButtonKind, 'primary' | 'secondary' | 'ghost' | 'tertiary'>
/** Опасные виды кнопки: рядом с главной не стоят (П10). */
export const isDangerKind = (kind: ButtonKind) => kind.startsWith('danger')

/** `size` кнопок, полей, меток, ссылок: sm 32 · md 40 · lg 48 постоянно; без `size` — 48 на телефоне и 40 на ноутбуке. */
export const SIZES = ['sm', 'md', 'lg'] as const
export type Size = (typeof SIZES)[number]

/** Toggle `size` (Carbon: sm · md): дорожка 32 × 16 и 48 × 24. */
export type ToggleSize = Extract<Size, 'sm' | 'md'>

/** Состояние файла в FileUploader и FileUploaderItem (Carbon: edit — можно убрать · complete — загружен · uploading — идёт). */
export const FILENAME_STATUSES = ['edit', 'complete', 'uploading'] as const
export type FilenameStatus = (typeof FILENAME_STATUSES)[number]

/** Где всплывающее относительно элемента — Tooltip, IconButton, Toggletip (Carbon: PopoverAlignment). */
export type PopoverAlignment = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'

/** Состояние шага ProgressStep (Carbon: complete · current · invalid · incomplete). */
export type ProgressStepState = 'complete' | 'current' | 'invalid' | 'incomplete'

/** InlineLoading `status` (Carbon InlineLoadingStatuses). */
export type InlineLoadingStatus = 'inactive' | 'active' | 'finished' | 'error'

/** Tag `type` — те из Carbon TYPES, у которых в ролях есть пара цвета, проверенная контрастом (README «Расходится с Carbon»). */
export const TAG_TYPES = ['red', 'purple', 'green', 'gray', 'high-contrast', 'outline'] as const
export type TagType = (typeof TAG_TYPES)[number]

/** IconIndicator `kind` (Carbon IconIndicatorKinds): знак и роль его цвета. Синего у Carbon нет — синий только ссылка и фокус. */
export const ICON_INDICATOR: Record<
  'failed' | 'caution-major' | 'caution-minor' | 'undefined' | 'succeeded' | 'normal' | 'in-progress' | 'incomplete' | 'not-started' | 'pending' | 'unknown' | 'informative',
  { icon: IconName; mark: string }
> = {
  failed: { icon: 'tone-danger', mark: 'text-danger' },
  'caution-major': { icon: 'warning-alt-inverted-filled', mark: 'text-warning' },
  'caution-minor': { icon: 'tone-warning', mark: 'text-warning' },
  undefined: { icon: 'undefined-filled', mark: 'text-decision' },
  succeeded: { icon: 'tone-success', mark: 'text-success' },
  normal: { icon: 'checkmark-outline', mark: 'text-fg' },
  'in-progress': { icon: 'in-progress', mark: 'text-fg' },
  incomplete: { icon: 'incomplete', mark: 'text-fg' },
  'not-started': { icon: 'tone-neutral', mark: 'text-fg-muted' },
  pending: { icon: 'pending-filled', mark: 'text-fg-muted' },
  unknown: { icon: 'unknown-filled', mark: 'text-fg-muted' },
  informative: { icon: 'warning-square-filled', mark: 'text-fg' },
}
export type IconIndicatorKind = keyof typeof ICON_INDICATOR
export const ICON_INDICATOR_KINDS = Object.keys(ICON_INDICATOR) as IconIndicatorKind[]

/** InlineNotification, ActionableNotification, ToastNotification `kind` (Carbon; `info-square`, `warning-alt` не сделаны) и тон
 * словаря, которым он нарисован: метка слева и знак своей формы. Тона «решение» у Carbon нет. */
export const NOTIFICATION_TONE = { error: 'опасно', warning: 'внимание', info: 'инфо', success: 'хорошо' } as const satisfies Record<string, Tone>
export type NotificationKind = keyof typeof NOTIFICATION_TONE
export const NOTIFICATION_KINDS = Object.keys(NOTIFICATION_TONE) as NotificationKind[]

/** Modal `size` (Carbon ModalSizes): ширина окна на ноутбуке. */
export const MODAL_SIZES = ['xs', 'sm', 'md', 'lg'] as const
export type ModalSize = (typeof MODAL_SIZES)[number]

/** Направление сортировки DataTable (Carbon DataTableSortState): по кругу NONE → ASC → DESC → NONE. */
export const SORT_STATES = { NONE: 'NONE', ASC: 'ASC', DESC: 'DESC' } as const
export type DataTableSortState = keyof typeof SORT_STATES

/** ContainedList `kind` (Carbon): на странице · раскрытый внутри другого слоя. */
export const CONTAINED_LIST_KINDS = ['on-page', 'disclosed'] as const
export type ContainedListKind = (typeof CONTAINED_LIST_KINDS)[number]
