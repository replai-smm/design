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
| | `Delta`, `SkeletonText`/`SkeletonPlaceholder`, `Prose`/`ProseHtml`, `Chart` | разница двух чисел, место будущего текста и блока (`aria-busy` — у области), текст ответа (роль «чтение»), рисунок рядов данных (`area` — заливка под одной линией) |
| Поля | `TextInput`, `PasswordInput`, `TextArea`, `NumberInput`, `Select` + `SelectItem`/`SelectItemGroup`, `ComboBox`, `Search` | одна рамка и один каркас (Carbon): подпись (`labelText`; у числа — `label`, у выбора с поиском — `titleText`), `helperText`, `invalid` + `invalidText` и `warn` + `warnText` — знаком и словом; `size` `sm` · `md` · `lg`; `id` обязателен; справка «i» — `Toggletip` в подписи; `inline` (+ `unit` — наше) — поле настройки одной строкой с 1024 px, ошибка у поля |
| | `Checkbox`/`CheckboxGroup`, `RadioButton`/`RadioButtonGroup`, `Toggle` | галочка (`onChange(event, { checked, id })`, `indeterminate`), один из 2–5 (`name`, `valueSelected`, `onChange(value, name, event)`), переключатель сразу (`toggled`, `onToggle`); группа — `legendText` |
| | `FileUploader`, `FileUploaderItem`, `Form`, `FormGroup` | выбор файла (`labelTitle`, `labelDescription`, `filenameStatus`, `onAddFiles`; не подошедший — строкой с ошибкой); форма и группа полей одной подписью (`legendText`) |
| Поверхности | `Surface` | слой, рамка, угол 6, поля 16; `mark` — метка тона слева; `inset` — утопленная |
| | `Card`, `StatTile`, `Notification`, `StateView`, `CodeBlock`, `ChartFrame` | построены на `Surface`; заголовок — роль `heading` |
| Коллекции | `DataTable`, `List` | строки в порядке данных, много — «показать ещё»; `selectedKey` и `onSelect`; сортировка, подсказка у заголовка, `nowrap`, `rowMuted` у таблицы |
| Слои | `Dialog`, `ConfirmProvider`/`useConfirm`, `Toaster`/`useToast` | окно (шторка снизу на телефоне, `side="left"` — слева, `size`: `sm` · `md` · `full`), подтверждение, «готово» |
| Составные | `Tabs`, `FilterBar`/`useUrlFilters` | один ряд сегментов: панели и фильтры в адресе; не влезает — вкладки одной строкой с прокруткой, фильтры переносятся |
| | `ThreeColumn`, `ChatThread`, `ReplyBox` | список → лента → карточка; переписка; поле ответа (`send`: `enter` · `ctrl-enter` · `button`) |

Общие имена: у компонентов с парой в Carbon — имена и значения Carbon (`kind`, `size`, `renderIcon`, `label`,
`description`, `status`); у наших — `state` (`ready` · `loading` · `error`), `empty`, `error`, `selectedKey`, `onSelect`,
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
