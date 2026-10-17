// ДС-React: компоненты по уровням (registry.json). Импорт: `@replai-smm/design`.

// Раскладка
export { Stack, Inline, Grid, Page, PageHeader, Section, SurfaceProvider, type Space, type StackProps, type InlineProps, type GridProps, type PageProps, type PageHeaderProps, type SectionProps } from './components/layout'

// Элементы
export { Icon, type IconName } from './components/Icon'
export { Button, ActionArea, type ButtonProps, type ButtonVariant, type ActionAreaProps, type PrimaryAction } from './components/Button'
export { StatusBadge, type StatusBadgeProps } from './components/StatusBadge'
export { CountBadge, countText, type CountBadgeProps } from './components/CountBadge'
export { Avatar, type AvatarProps } from './components/Avatar'
export { InlineLoading, type InlineLoadingProps } from './components/InlineLoading'
export { Meter, meterTone, type MeterProps } from './components/Meter'
export { Steps, stepProgress, type StepsProps } from './components/Steps'
export { Tooltip, type TooltipProps } from './components/Tooltip'
export { Delta, deltaText, type DeltaProps, type DeltaUnit } from './components/Delta'
export { Skeleton, Loading } from './components/Skeleton'
export { Prose, ProseHtml, type ProseProps } from './components/Prose'
export { Chart, chartHasData, niceMax, ticksOf, tickIndexes, SERIES, type ChartProps, type ChartSeries, type SeriesLine } from './components/Chart'

// Поля
export { TextField, TextArea, type TextFieldProps, type TextAreaProps, type FieldBaseProps } from './components/TextField'
export { Select, type SelectProps, type SelectOption } from './components/Select'
export { NumberField, type NumberFieldProps } from './components/NumberField'
export { Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps, type CheckedState } from './components/Checkbox'
export { Combobox, type ComboboxProps, type ComboboxOption } from './components/Combobox'
export { FileField, fileSizeText, acceptText, fileMatches, type FileFieldProps, type FileFieldHandle } from './components/FileField'
export { SearchField, type SearchFieldProps } from './components/SearchField'

// Поверхности
export { Surface, type SurfaceProps } from './components/Surface'
export { Card, type CardProps } from './components/Card'
export { StatTile, type StatTileProps, type StatTileCompare } from './components/StatTile'
export { Notification, type NotificationProps, type NotificationTone } from './components/Notification'
export { StateView, type StateViewProps } from './components/StateView'
export { CodeBlock, type CodeBlockProps } from './components/CodeBlock'
export { ChartFrame, type ChartFrameProps, type LegendItem } from './components/ChartFrame'
export { DecisionCard, type DecisionCardProps, type DecisionAnswer } from './components/DecisionCard'
export { Diagram, edgePath, litSet, type DiagramProps, type DiagramNode, type DiagramItem, type DiagramDot, type DiagramEdge } from './components/Diagram'

// Коллекции
export { DataTable, List, compareSortValues, type Column, type SortDirection, type SortState, type DataTableProps, type ListProps, type CollectionProps } from './components/Collection'
export { ProofreadGrid, GridLegend, StatusRow, type ProofreadGridProps, type GridColumn, type GridCell, type GridLegendProps, type StatusRowProps } from './components/ProofreadGrid'
export { WeekCalendar, mondayOf, addWeeks, weekTitle, type WeekCalendarProps } from './components/WeekCalendar'

// Слои
export { Dialog, ConfirmProvider, useConfirm, type DialogProps, type DialogSize, type ConfirmOptions } from './components/Dialog'
export { Toaster, useToast, type ToasterProps } from './components/Toast'
export { CommandMenu, matchCommands, type CommandMenuProps, type CommandMenuHandle, type CommandItem } from './components/CommandMenu'

// Паттерны
export { Tabs, type TabItem, type TabsProps } from './components/Tabs'
export { FilterBar, useUrlFilters, type FilterDef, type FilterOption, type FilterValue, type FilterBarProps } from './components/FilterBar'
export { ThreeColumn, type ThreeColumnProps, type ColumnIndex } from './components/ThreeColumn'
export { ChatThread, type ChatMessage, type ChatThreadProps } from './components/ChatThread'
export { ReplyBox, type ReplyBoxProps, type ReplyBoxHandle } from './components/ReplyBox'
export { AgentStep, type AgentStepProps } from './components/AgentStep'

// Словари
export { TONES, TONE_ORDER, STATUS_IDS, statusOf, toneOf, type Tone, type Progress, type StateKind, type StatusId, type DataState, type EmptyView, type ErrorView } from './lib/vocab'
