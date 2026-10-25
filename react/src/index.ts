// ДС-React: компоненты по уровням (registry.json). Импорт — из корня пакета.

// Раскладка
export { Stack, Inline, Grid, Column, Page, PageHeader, Section, SurfaceProvider, BottomBar, useHeadingLevel, type SpacingStep, type StackProps, type InlineProps, type GridProps, type ColumnProps, type ColumnSpan, type PageProps, type PageHeaderProps, type SectionProps, type HeadingLevel, type BottomBarProps } from './components/layout'

// Элементы
export { Icon, type IconName } from './components/Icon'
export { Button, ButtonSet, IconButton, type ButtonProps, type ButtonSetProps, type IconButtonProps } from './components/Button'
export { Heading, type HeadingProps } from './components/Heading'
export { Link, type LinkProps } from './components/Link'
export { Tag, DismissibleTag, type TagProps, type DismissibleTagProps } from './components/Tag'
export { IconIndicator, type IconIndicatorProps } from './components/IconIndicator'
export { CountBadge, countText, type CountBadgeProps } from './components/CountBadge'
export { Avatar, type AvatarProps } from './components/Avatar'
export { InlineLoading, type InlineLoadingProps } from './components/InlineLoading'
export { Meter, meterTone, type MeterProps } from './components/Meter'
export { ProgressIndicator, ProgressStep, type ProgressIndicatorProps, type ProgressStepProps } from './components/ProgressIndicator'
export { Tooltip, type TooltipProps } from './components/Tooltip'
export { Toggletip, ToggletipLabel, ToggletipButton, ToggletipContent, type ToggletipProps, type ToggletipLabelProps, type ToggletipButtonProps, type ToggletipContentProps } from './components/Toggletip'
export { Accordion, AccordionItem, type AccordionProps, type AccordionItemProps } from './components/Accordion'
export { Delta, deltaText, type DeltaProps, type DeltaUnit } from './components/Delta'
export { SkeletonText, SkeletonPlaceholder, type SkeletonTextProps, type SkeletonPlaceholderProps } from './components/SkeletonText'
export { Prose, ProseHtml, type ProseProps } from './components/Prose'
export { Chart, chartHasData, niceMax, ticksOf, tickIndexes, SERIES, type ChartProps, type ChartSeries, type SeriesLine } from './components/Chart'

// Поля
export { TextField, TextArea, type TextFieldProps, type TextAreaProps, type FieldBaseProps, type FieldRowProps } from './components/TextField'
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

// Коллекции
export { DataTable, List, compareSortValues, type DataTableColumn, type SortDirection, type SortState, type DataTableProps, type ListProps, type CollectionProps } from './components/Collection'

// Слои
export { Dialog, ConfirmProvider, useConfirm, type DialogProps, type DialogSize, type ConfirmOptions } from './components/Dialog'
export { Toaster, useToast, type ToasterProps } from './components/Toast'

// Составные
export { Tabs, type TabItem, type TabsProps } from './components/Tabs'
export { FilterBar, useUrlFilters, type FilterDef, type FilterOption, type FilterValue, type FilterBarProps } from './components/FilterBar'
export { ThreeColumn, type ThreeColumnProps, type ColumnIndex } from './components/ThreeColumn'
export { ChatThread, type ChatMessage, type ChatThreadProps } from './components/ChatThread'
export { ReplyBox, type ReplyBoxProps, type ReplyBoxHandle } from './components/ReplyBox'

// Словари
export { TONES, TONE_ORDER, BUTTON_KINDS, SIZES, TAG_TYPES, ICON_INDICATOR_KINDS, type Tone, type Progress, type StateKind, type DataState, type EmptyView, type ErrorView, type ButtonKind, type IconButtonKind, type Size, type InlineLoadingStatus, type TagType, type IconIndicatorKind, type PopoverAlignment, type ProgressStepState } from './lib/vocab'
