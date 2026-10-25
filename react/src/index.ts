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
export { ContentSwitcher, Switch, type ContentSwitcherProps, type SwitchProps, type SwitchEventHandlersParams } from './components/ContentSwitcher'
export { Delta, deltaText, type DeltaProps, type DeltaUnit } from './components/Delta'
export { SkeletonText, SkeletonPlaceholder, type SkeletonTextProps, type SkeletonPlaceholderProps } from './components/SkeletonText'
export { Prose, ProseHtml, type ProseProps } from './components/Prose'
export { Chart, chartHasData, niceMax, ticksOf, tickIndexes, SERIES, type ChartProps, type ChartSeries, type SeriesLine } from './components/Chart'

// Поля
export { TextInput, PasswordInput, TextArea, type TextInputProps, type PasswordInputProps, type TextAreaProps } from './components/TextInput'
export { NumberInput, type NumberInputProps } from './components/NumberInput'
export { Select, SelectItem, SelectItemGroup, type SelectProps, type SelectItemProps, type SelectItemGroupProps } from './components/Select'
export { Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps } from './components/Checkbox'
export { RadioButton, RadioButtonGroup, type RadioButtonProps, type RadioButtonGroupProps } from './components/RadioButton'
export { Toggle, type ToggleProps } from './components/Toggle'
export { ComboBox, type ComboBoxProps } from './components/ComboBox'
export { FileUploader, FileUploaderItem, type FileUploaderProps, type FileUploaderItemProps, type FileUploaderHandle } from './components/FileUploader'
export { Search, type SearchProps } from './components/Search'
export { Form, FormGroup, type FormProps, type FormGroupProps } from './components/Form'

// Поверхности
export { Tile, ClickableTile, ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent, type TileProps, type ClickableTileProps, type ExpandableTileProps, type TileAboveTheFoldContentProps, type TileBelowTheFoldContentProps } from './components/Tile'
export { StatTile, type StatTileProps, type StatTileCompare } from './components/StatTile'
export { InlineNotification, ActionableNotification, type InlineNotificationProps, type ActionableNotificationProps, type NotificationCloseHandler } from './components/InlineNotification'
export { StateView, type StateViewProps } from './components/StateView'
export { CodeSnippet, type CodeSnippetProps } from './components/CodeSnippet'
export { ChartFrame, type ChartFrameProps, type LegendItem } from './components/ChartFrame'

// Коллекции
export { DataTable, Table, TableContainer, TableHead, TableRow, TableHeader, TableBody, TableCell, DataTableSkeleton, type DataTableProps, type DataTableRenderProps, type DataTableHeader, type DataTableRow, type DataTableCell, type DataTableInputRow, type SortRowFn, type SortRowParams, type TableProps, type TableContainerProps, type TableHeadProps, type TableRowProps, type TableHeaderProps, type TableBodyProps, type TableCellProps, type DataTableSkeletonProps } from './components/DataTable'
export { ContainedList, ContainedListItem, type ContainedListProps, type ContainedListItemProps } from './components/ContainedList'
export { Pagination, type PaginationProps, type PaginationPageSize } from './components/Pagination'

// Слои
export { Modal, ConfirmProvider, useConfirm, type ModalProps, type ConfirmOptions } from './components/Modal'
export { OverflowMenu, OverflowMenuItem, type OverflowMenuProps, type OverflowMenuItemProps } from './components/OverflowMenu'
export { Toaster, useToast, type ToasterProps, type ToastNotificationProps } from './components/Toaster'

// Составные
export { Tabs, TabList, Tab, TabPanels, TabPanel, type TabsProps, type TabListProps, type TabProps, type TabPanelsProps, type TabPanelProps } from './components/Tabs'
export { FilterBar, useUrlFilters, type FilterDef, type FilterOption, type FilterValue, type FilterBarProps } from './components/FilterBar'
export { ThreeColumn, type ThreeColumnProps, type ColumnIndex } from './components/ThreeColumn'
export { ChatThread, type ChatMessage, type ChatThreadProps } from './components/ChatThread'
export { ReplyBox, type ReplyBoxProps, type ReplyBoxHandle } from './components/ReplyBox'

// Словари
export { TONES, TONE_ORDER, BUTTON_KINDS, SIZES, TAG_TYPES, ICON_INDICATOR_KINDS, FILENAME_STATUSES, NOTIFICATION_KINDS, MODAL_SIZES, SORT_STATES, CONTAINED_LIST_KINDS, type Tone, type Progress, type StateKind, type DataState, type EmptyView, type ErrorView, type ButtonKind, type IconButtonKind, type Size, type InlineLoadingStatus, type TagType, type IconIndicatorKind, type PopoverAlignment, type ProgressStepState, type ToggleSize, type FilenameStatus, type NotificationKind, type ModalSize, type DataTableSortState, type ContainedListKind } from './lib/vocab'
