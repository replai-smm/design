# ДС-React

Компоненты дизайн-системы: Radix, раскрашенный только ролями и шкалами. Полки Storybook: «Основы», «Компоненты/<уровень>», «Паттерны» (правило из `patterns/*.md` и пример — `src/patterns/`). Уровни, смысл и анатомия каждого — в
`src/registry.json`; основа и правила — в корневом `README.md`.

## Компоненты

| Уровень | Компонент | Смысл |
|---|---|---|
| Раскладка | `Page`, `PageHeader`, `Section` | страница; шапка (`title`, строка «о чём экран» — `subtitle`, тихие действия — `pageActions`); раздел поднимает уровень `Heading` внутри (Carbon: Section) |
| | `BottomBar` | липкая полоса низа страницы, одна на страницу: `ButtonSet` группой слева, на телефоне одним рядом; над нижней панелью продукта — `--ds-bottom-inset` |
| | `Stack`, `Inline`, `Grid` + `Column` | блоки столбиком или в ряд (`orientation`), в строку с переносом, сеткой 16 колонок; отступ — шаг шкалы (`gap={3}`) |
| | `SurfaceProvider` | область одной главной кнопки (своя область продукта) |
| Элементы | `Icon` | значок набора по имени или знак тона (`tone="опасно"`); значки для `renderIcon` — `@replai-smm/design/icons` |
| | `Button`, `ButtonSet`, `IconButton` | действие (Carbon): `kind` `primary` (по умолчанию, одна на поверхность) · `secondary` · `tertiary` · `ghost` · `danger` · `danger--tertiary` · `danger--ghost`; `size` `sm` · `md` · `lg`; `renderIcon`; `href`; набор кнопок — главная последней; значок без слова — `IconButton label` |
| | `Heading`, `Link` | заголовок уровня своего раздела; ссылка (`inline` — в тексте) |
| | `Tag`/`DismissibleTag`, `IconIndicator`, `CountBadge` | слово в цветной таблетке (`type`), с «убрать»; состояние знаком своей формы и словом (`kind`); число у строки и вкладки |
| | `Avatar`, `Tooltip` | лицо 32 px; подсказка у элемента, который берёт фокус (`label` — имя, `description` — описание, `align`) |
| | `Toggletip` (+ `ToggletipLabel`, `ToggletipButton`, `ToggletipContent`), `Accordion` + `AccordionItem` | справка «i» по нажатию; раскрытие строкой с заголовком (`open`, `onHeadingClick`, `size`, `align`) |
| | `InlineLoading`, `Meter`, `ProgressIndicator` + `ProgressStep` | ход в строке (`status`, `description`, `onSuccess`); сколько взято из предела; путь из шагов (`currentIndex`, `onChange`) |
| | `ContentSwitcher` + `Switch` | ряд сегментов: один вид из нескольких (`selectedIndex`, `onChange({ index, name, text })`) |
| | `Delta`, `SkeletonText`/`SkeletonPlaceholder`, `Prose`/`ProseHtml`, `Chart` | разница двух чисел, место будущего текста и блока (`aria-busy` — у области), текст ответа (роль «чтение»), рисунок рядов данных (`area` — заливка под одной линией) |
| Поля | `TextInput`, `PasswordInput`, `TextArea`, `NumberInput`, `Select` + `SelectItem`/`SelectItemGroup`, `ComboBox`, `Search` | одна рамка и один каркас (Carbon): подпись (`labelText`; у числа — `label`, у выбора с поиском — `titleText`), `helperText`, `invalid` + `invalidText` и `warn` + `warnText` — знаком и словом; `size` `sm` · `md` · `lg`; `id` обязателен; справка «i» — `Toggletip` в подписи; `inline` (+ `unit` — наше) — поле настройки одной строкой с 1024 px, ошибка у поля |
| | `Checkbox`/`CheckboxGroup`, `RadioButton`/`RadioButtonGroup`, `Toggle` | галочка (`onChange(event, { checked, id })`, `indeterminate`), один из 2–5 (`name`, `valueSelected`, `onChange(value, name, event)`), переключатель сразу (`toggled`, `onToggle`); группа — `legendText` |
| | `FileUploader`, `FileUploaderItem`, `Form`, `FormGroup` | выбор файла (`labelTitle`, `labelDescription`, `filenameStatus`, `onAddFiles`; не подошедший — строкой с ошибкой); форма и группа полей одной подписью (`legendText`) |
| Поверхности | `Tile`, `ClickableTile` | плитка (Carbon: Tile): слой, рамка, угол 6, поля 16; вся плитка — переход (`href`) или действие (`onClick`) |
| | `ExpandableTile` + `TileAboveTheFoldContent`/`TileBelowTheFoldContent` | лицо объекта: заголовок и до трёх фактов, подробности под сгибом (`expanded`, `tileCollapsedLabel`); не глубже двух уровней |
| | `InlineNotification`, `ActionableNotification` | беда или новость у места (`kind` `error` · `warning` · `info` · `success`, `title`, `subtitle`, `hideCloseButton`, `onClose`); с действием у причины — `actionButtonLabel`, `onActionButtonClick`, `inline` |
| | `CodeSnippet`, `StatTile`, `StateView`, `ChartFrame` | код с копированием (`type` `single` · `multi`, «Показать ещё»); одно число; что вместо данных; рамка графика — все на плитке, заголовок — роль `heading` |
| Коллекции | `DataTable` + `TableContainer`, `Table`, `TableHead`, `TableRow`, `TableHeader`, `TableBody`, `TableCell` | таблица Carbon: строки и сортировка — `DataTable` (дети-функция: `rows`, `headers`, `getHeaderProps`…), вид — частями; `isSortable` по кругу; выбранная строка — `isSelected`; в строке — только ghost и меню «…»; прокрутка вбок, первая колонка стоит |
| | `DataTableSkeleton`, `Pagination` | место таблицы при загрузке; страницы длинного набора (`page`, `pageSize`, `pageSizes`, `totalItems`, `onChange({ page, pageSize })`) |
| | `ContainedList` + `ContainedListItem` | строки своего вида с подписью (`label`, `action`); строка — кнопка (`onClick`), действие строки — `action`; открытая — `aria-current` |
| Слои | `Modal`, `ConfirmProvider`/`useConfirm` | окно Carbon (`open`, `modalHeading`, `primaryButtonText`, `secondaryButtonText`, `onRequestSubmit`, `onRequestClose`, `danger`, `passiveModal`, `size` `xs` · `sm` · `md` · `lg`; шторка снизу на телефоне); подтверждение на нём (`await confirm({ modalHeading, danger })`) |
| | `OverflowMenu` + `OverflowMenuItem`, `Toaster`/`useToast` | меню «…» (`iconDescription`, `itemText`, `isDelete`, `hasDivider`); «готово» всплывашкой (поля Carbon ToastNotification: `kind`, `title`, `subtitle`, `caption`, `timeout`) |
| Составные | `Tabs` + `TabList`/`Tab`/`TabPanels`/`TabPanel`, `FilterBar`/`useUrlFilters` | один ряд сегментов: вкладки по номеру (`selectedIndex`, `onChange({ selectedIndex })`, все панели смонтированы), фильтры рядами `ContentSwitcher` в адресе; не влезает — вкладки одной строкой с прокруткой, фильтры переносятся |
| | `ThreeColumn`, `ChatThread`, `ReplyBox` | список → лента → карточка; переписка; поле ответа (`labelText`, `invalid` + `invalidText`, `helperText`; `send`: `enter` · `ctrl-enter` · `button`) |
| | `Header` + `HeaderMenuButton`/`HeaderName`/`HeaderGlobalBar`/`HeaderGlobalAction`/`HeaderPanel`, `SideNav` + `SideNavItems`/`SideNavLink`/`SideNavDivider`, `SkipToContent` | оболочка продукта «шапка с левой панелью»: одна строка шапки на любой ширине (кнопка меню · название · контекст · справа системные кнопки → панель); левая панель постоянна от `lg`, уже — поверх страницы (`expanded`, `onOverlayClick`) |

Общие имена: у компонентов с парой в Carbon — имена и значения Carbon (`kind`, `size`, `renderIcon`, `label`,
`description`, `status`); у наших — `state` (`ready` · `loading` · `error`), `empty`, `error` (у `ChartFrame`, `ChatThread`),
`tone` (словарь тонов), `label` — подпись для читалки. Что не как у Carbon — корневой README → «Договор Carbon».

## Проверки

```
npm run check          # из корня: сборка, типы, сторож, тесты, облик
npm run storybook
```

- `src/__tests__/` — поведение компонентов, правила API, истории на каждое состояние, a11y axe в обеих темах, образцы
  для `showcase.html` (`npm run showcase`, потом `npm run build`).
- `visual/` — облик: `npm run visual` сверяет каждую историю в обеих темах на 390 и 1280 с `visual/baseline/` и анатомию с
  реестром; `npm run visual:update` — новые эталоны (после `npm run storybook:build`). Разница — в `visual/out/`.
