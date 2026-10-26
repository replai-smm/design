# Дизайн-система replai-smm

Один источник облика для всех продуктов, по образцу IBM Carbon: **основы** (роли и шкалы), **компоненты** (ДС-React по
уровням) и **паттерны** — правила, как собрать типовую ситуацию из компонентов (формы, пустые состояния, окна…). Продукт
берёт пакет по тегу и строит из него экраны и свои сборки (страница настроек, панель сохранения, мастер, каркас с
навигацией): сборка — в продукте, правило её сборки — паттерн здесь (слово Саши 25.10).

Посмотреть: `npm ci && npm run build` → `dist/showcase.html` (обе темы, 390 и 1280, без сети) или `npm run storybook`.
Облик каждой истории в обеих темах на 390 и 1280 — снимки `react/visual/baseline/` (в репо, открываются на GitHub).

## Один язык

| Шкала | Что есть | Источник |
|---|---|---|
| Цвет | 36 ролей: поверхности (`canvas`, `surface`, `inverse`), текст (`fg`, `fg-muted`, `fg-disabled`, `fg-inverse`), рамки (`line`, `line-strong`), взаимодействие (`hover`, `selected`, `accent`), глубина (`scrim`, `shadow`), тоны (`danger`, `decision`, `warning`, `success` + текст и подложка у срочных), заливки (`*-fill`, только в файлах из `registry.json → fill`: цвет метки `Tag`), ряды данных `series-1…6` | `tokens.json → colors` |
| Тон | у наших компонентов без пары в Carbon (`Icon tone`, `CountBadge`, `Meter`, `StateView`…) — один словарь: опасно · решение · внимание · инфо · нейтрально · хорошо. Подложка — только у «опасно», «решение» (ждёт решения человека, фиолетовый) и «внимание»; «хорошо» — зелёный знак без подложки. У компонентов с парой — значения Carbon (`Button kind`, `Tag type`, `IconIndicator kind`, `InlineLoading status`, `InlineNotification kind`, `Modal size`), тоже из `vocab.ts`. Заливка тона (`tones.*.fill`) — фон, где цвет и есть смысл: метка `Tag` (`registry.json → fill`) | `tokens.json → tones`, `react/src/lib/vocab.ts` |
| Ход работы | наш словарь `idle` впереди · `running` идёт · `done` готово · `error` ошибка — у отправки сообщения; у пар Carbon — их слова: `InlineLoading status` (`inactive` · `active` · `finished` · `error`), `ProgressStep` (`complete` · `current` · `invalid`) | `vocab.ts` |
| Текст | 7 ролей: `caption` 12 · `body` 14 · `heading` 14/600 · `reading` 16 · `code` 13 моно · `title` 20 · `page` 28 | `scale.json → text` |
| Отступ | 6 ролей: `tight` 4 · `items` 8 · `compact` 12 · `blocks` 16 · `groups` 24 · `sections` 32 — в классах (`gap-items`, `p-blocks`); у `Stack` и `Inline` — шаг шкалы Carbon spacing того же размера: `gap={2}` 4 · `3` 8 · `4` 12 · `5` 16 · `6` 24 · `7` 32 | `scale.json → space` |
| Высота | `icon` 16 · `dense` 32 · `control` 40 · `touch` 48: у кнопок, полей и раскрытия — `size` Carbon: `sm` 32 · `md` 40 · `lg` 48 постоянно; без `size` — 48 на телефоне и 40 на ноутбуке | `scale.json → size` |
| Ширина | меры содержимого, не страницы (строка, форма, окно): `number` 10rem (поле числа) · `rail` 16rem · `hint` · `narrow` · `popup` · `form` · `panel` · `wide` · `window` — `max-w-window`, `w-rail`; размеров контейнеров Tailwind (`max-w-md`) нет. **Страница резиновая всегда:** предела ширины страницы нет, содержимое занимает всё место справа от левой панели на любой ширине; поля — 16 px на узком, 32 px от md | `scale.json → measure` |
| Угол | `control` 4 · `surface` 6 · `full` — только метка, счётчик, аватар, точка | `scale.json → radius` |
| Глубина | плоско (рамка) · всплывает (`shadow-raised`) · поверх (`shadow-overlay` и затемнение `scrim`) | `scale.json → elevation` |
| Движение | `duration-fast` 110 мс (отклик) · `duration-move` 0,6 с (раскрытие, выезд), одна кривая; «уменьшить движение» — обе 0 | `scale.json → motion` |
| Шрифт | IBM Plex Sans 400/600, IBM Plex Mono 400 — в пакете, с кириллицей | `fonts/` |
| Значки | один набор (IBM Carbon, 16 px): `Icon` по имени и компоненты с именами Carbon для `renderIcon` (`import { Add } from '@replai-smm/design/icons'`); знаков-значков символами (◀ ▶ ×) нет | `lib/icons.mjs` → `react/src/lib/icons.gen.ts` |

Облик: главное действие — инверсия (чёрное в светлой, белое в тёмной), синий — только ссылка и фокус, цвет тона —
только смысл. Тёмная тема — почти чёрный холст, слои отделяет рамка.

Тема — атрибут `<html data-theme="light|dark">`; без него — как в системе. Атрибут можно поставить и куску страницы.

## Уровни

Компонент живёт на одном уровне и берёт только нижние. Полки Storybook — как у Carbon: «Основы» → «Компоненты/<уровень>»
→ «Паттерны». Экраны и сборки — только в продуктах.

| Уровень | Компоненты |
|---|---|
| Основы | роли и шкалы (без компонентов) |
| Раскладка | Stack, Inline, Grid, Column, Page, PageHeader, Section, SurfaceProvider, BottomBar |
| Элементы | Icon, Button, ButtonSet, IconButton, Heading, Link, Tag, DismissibleTag, IconIndicator, CountBadge, Avatar, InlineLoading, Meter, ProgressIndicator, ProgressStep, Tooltip, Toggletip, ToggletipLabel, ToggletipButton, ToggletipContent, Accordion, AccordionItem, ContentSwitcher, Switch, Delta, SkeletonText, SkeletonPlaceholder, Prose, ProseHtml, Chart |
| Поля | TextInput, PasswordInput, TextArea, NumberInput, Select, SelectItem, SelectItemGroup, Checkbox, CheckboxGroup, RadioButton, RadioButtonGroup, Toggle, ComboBox, FileUploader, FileUploaderItem, Search, Form, FormGroup |
| Поверхности | Tile, ClickableTile, ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent, StatTile, InlineNotification, ActionableNotification, StateView, CodeSnippet, ChartFrame |
| Коллекции | DataTable, Table, TableContainer, TableHead, TableRow, TableHeader, TableBody, TableCell, DataTableSkeleton, ContainedList, ContainedListItem, Pagination |
| Слои | Modal (окно и шторка), ConfirmProvider, OverflowMenu, OverflowMenuItem, Toaster |
| Составные | Tabs, TabList, Tab, TabPanels, TabPanel, FilterBar, ThreeColumn, ChatThread, ReplyBox, Header, HeaderMenuButton, HeaderName, HeaderGlobalBar, HeaderGlobalAction, HeaderPanel, SideNav, SideNavItems, SideNavLink, SideNavDivider, SkipToContent |

Уровень, смысл и анатомия (поверхность, поля, роль заголовка, метка, форма) каждого компонента — в
`react/src/registry.json`. ДС ничья: компонентов одного продукта в ней нет.

## Договор Carbon

Компоненты свои (Radix + Tailwind + роли ДС), а имя, свойства, значения и поведение — как у `@carbon/react` 1.119.0
(решение Саши: «принципы Carbon, компоненты свои»): агент, который знает Carbon, пишет Carbon-код — он работает. Свойства
Carbon, которые не нужны, не сделаны; сделанные называются и работают как у Carbon. Ниже — всё, что не так.

### Расходится с Carbon

| Что | Как у нас | Почему |
|---|---|---|
| `size` по умолчанию | без `size` — 48 на телефоне и 40 на ноутбуке; `sm` 32 · `md` 40 · `lg` 48 — постоянно; `xs`, `xl`, `2xl` нет | цель пальца на телефоне; меньше 32 — мимо пальца |
| `Stack gap`, `Inline gap` | только шаги 2–7 (4–32 px), своей строки-размера нет | только роли и шкалы |
| `Grid` + `Column` | 4 колонки до 768 px, 8 до 1024 px, 16 шире (у Carbon — 672 и 1056); промежуток 32, `narrow` — 16; `condensed`, `fullWidth`, `xlg`, `max` нет | точки перелома Tailwind — одни на всю ДС |
| `Section` | `level` и вложенность — как у Carbon; описание и инструменты раздела — детьми (`<Inline>`), своего облика нет | — |
| `Button kind` | главная — инверсия (не синяя): синий у нас — только ссылка и фокус; `secondary` — рамка, `tertiary` — рамка цвета главной | облик ДС |
| `Button`, `IconButton` | значок только компонентом (`renderIcon={Add}`); у `Button` без слова значка нет — это `IconButton` | один способ на один смысл |
| `Tag type` | только `red` · `purple` · `green` · `gray` · `high-contrast` · `outline`; `magenta`, `blue`, `cyan`, `teal`, `cool-gray`, `warm-gray` нет | у этих цветов нет ролей с проверенной парой текста |
| `IconIndicator` | синих видов нет: `normal` · `in-progress` · `incomplete` · `informative` — цвет текста; `caution-major` — цвет «внимание» (оранжевого нет, различает форма); `size` 20 и `compact` нет | синий — только ссылка и фокус |
| `ProgressIndicator` | на телефоне — строка «Шаг 2 из 4 · Куда» вместо ряда шагов; шагов — от трёх (меньше — ошибка в разработке) | ряд шагов не влезает в 390 px |
| `Tooltip`, `Toggletip` | `align` — стороны Carbon; `autoAlign`, `highContrast`, `dropShadow`, `leaveDelayMs` нет; `ToggletipActions` нет | Radix ставит сам у края экрана; одна тень и одна инверсия |
| `DismissibleTag` | «убрать» — кнопка с подписью без всплывающей подсказки | метка — элемент, ему подсказка не нужна |
| Подпись поля со справкой «i» | `Toggletip` кладут в `labelText` (`TextInput`, `Select`, `Checkbox`…) — без предупреждения; Carbon 1.119 в разработке предупреждает «labelText must have no interactive content», в v12 обещает запрет | решение договора: справка — у подписи, своего свойства `help` нет |
| Поля: что не сделано | `TextInput`, `TextArea`: `enableCounter`, `maxCount`, `decorator`; `Select`: `readOnly`, `noLabel`; `ComboBox`: `typeahead`, `allowCustomValue`, `downshiftProps`, `autoAlign`; `Search`: `isExpanded`, `onExpand`, `renderIcon`; `FileUploader`: `FileUploaderButton`, `FileUploaderDropContainer`, `Filename`, `getCurrentFiles` | не нужны примерам и продуктам |
| `NumberInput` | поле `role="spinbutton"`, не `<input type="number">`: PageUp/PageDown — десять шагов, Home/End — к границам; без `invalidText` вне границ — «Число от … до …», пусто без `allowEmpty` — «Введите число»; `type`, `locale`, `formatOptions`, `validate`, `disableWheel`, `stepStartValue` нет | родное поле числа меняет значение колесом и не держит ввод «-»; ошибка — словами |
| `FileUploader` | `labelTitle` — строка роли `heading`, не `<h3>`; не тот тип (`accept`) или больше `maxFileSize` — строка `FileUploaderItem invalid` с причиной (у Carbon — только `invalidFileType` в `onAddFiles`, тип не проверяется) | уровень заголовка даёт `Section`; не взятый молча файл — потеря без слова |
| `Toggle` | включено — инверсия (у Carbon — зелёный); слова по умолчанию «Выкл» · «Вкл» | цвет тона — только смысл |
| `Form`, `FormGroup` | своих отступов нет: поля внутри ставит `Stack` | только роли и шкалы, как у `Section` |
| `Tile`, `ClickableTile` | `light`, `decorator`, `slug`, `hasRoundedCorners`, `clicked` нет; `ClickableTile` без `href` — `<button>` (у Carbon — `<a>` без адреса с `tabIndex`) | у плитки-действия роль кнопки; угол у плитки один |
| `ExpandableTile` | раскрывает всегда кнопка со знаком под лицом (вид Carbon «interactive»); есть `tileCollapsedLabel` — слово на кнопке, иначе имя для читалки — `tileCollapsedIconText`; `tileMaxHeight`, `tilePadding` нет — высоту ведёт раскрытие ДС (0,6 с); П7 — проверкой в разработке: детей `TileAboveTheFoldContent` ≤ 4 (заголовок и три факта), вложенных раскрытий ≤ 2 | раскрытие — одна механика ДС; плитка-кнопка с заголовком и кнопками внутри читалке не прочесть |
| Глубина (Carbon: `Layer`) | нет: слоёв в ролях два — холст и плитка; утопленное (код, своё сообщение) — анатомия `SUNKEN` | нет потребителя |
| `InlineNotification`, `ActionableNotification`, всплывашка | `kind` — `error` · `warning` · `info` · `success` (`info-square`, `warning-alt` нет); облик один — как `lowContrast` у Carbon (плитка с меткой вида), `lowContrast` нет; `ActionableNotification` без `inline` — плашка с тенью и кнопкой с рамкой | высококонтрастный вид — инверсия, знаков тонов на ней нет среди проверенных пар ролей |
| `CodeSnippet` | `type` — `single` · `multi` (`inline` нет); «Показать ещё» — по числу строк (у Carbon — по высоте в пикселях); `align`, `autoAlign`, `light`, `minCollapsedNumberOfRows`, `minExpandedNumberOfRows` нет | строки кода одной высоты; jsdom не меряет |
| `DataTable` | геттеры не отдают `key` — ключ ставят сами (`key={row.id}`); выбора строк, раскрытия строк, панели инструментов (`TableToolbar…`), `TableBatchActions`, `filterRows`, `stickyHeader`, `useZebraStyles`, `experimentalAutoAlign` нет; `size` — `sm` · `md` · `lg`; первая колонка стоит при прокрутке вбок; `sortRow` по умолчанию — как у Carbon (`locale` `en`) | React 19 ругается на `key` в разворачивании; остальное не нужно примерам и продуктам |
| `ContainedList` | `size` — `sm` · `md` · `lg` (`xl` нет); строки — в рамке с углом поверхности; открытая строка — `aria-current` на `ContainedListItem` (роль «выбрано») | одно «выбрано» на всю ДС |
| `Pagination` | слова по умолчанию — русские; `renderPageSelect`, `backwardTextTooltipPosition`, `forwardTextTooltipPosition` нет | не нужны |
| `Modal` | на телефоне — шторка снизу (у Carbon — окно); `size` по умолчанию `md`; `secondaryButtons`, `isFullWidth`, `alert`, `shouldSubmitOnEnter`, `launcherButtonRef`, `selectorsFloatingMenus`, `hasScrollingContent` нет — фокус после закрытия возвращает слой сам; шторки слева в API нет (её берёт только `ThreeColumn`) | на телефоне окно по центру закрывает палец; шторка слева — колонка раскладки, не окно |
| `OverflowMenu` | кнопка — всегда `kind="ghost"`; `focusTrap`, `menuOffset`, `menuOffsetFlip`, `selectorPrimaryFocus`, `light` нет; пункты — `itemText` (дети не берутся) | меню стоит в строке списка (П5) |
| `ContentSwitcher`, `Switch` | `size`, `lowContrast`, `light`, `IconSwitch` нет; ряд переносится по `className` (фильтры) | ряд сегментов один на ДС — тот же, что у вкладок |
| `Tabs` | линейные по умолчанию, `contained` — сегменты в рамке (Carbon); все панели смонтированы, неактивные `hidden` (как у Carbon); `fullWidth`, `dismissable`, `IconTab`, `TabsVertical`, `secondaryLabel` нет — счётчик — `CountBadge` в слове вкладки; ряд не влезает — прокрутка без полосы, без стрелок прокрутки | счётчик тона — наш компонент |
| П5 | «одна главная на поверхность», «опасное не рядом с главной», «в строке — только ghost» (`TableRow`, `ContainedListItem action`) — проверка в разработке (`rule()`), у Carbon её нет | правило ДС |

### Расширения сверх Carbon

| Что | Зачем |
|---|---|
| `ButtonSet` на телефоне — одним рядом поровну | столбец кнопок съел бы четверть экрана |
| `unit` у `TextInput`, `NumberInput`, `Select` с `inline` — единица после поля («дней»); `NumberInput inline` — узкое (роль ширины `number`) | поле настройки одной строкой: `Подпись ……… [ 10 ] дней`, ошибка — у поля |
| `Toaster` без `timeout` — гаснет за 5 с (у Carbon `timeout` 0 — висит); `timeout={0}` — висит; `role` всплывашки — как объявить (`alert` — сразу) | «готово» не копится на экране |

### Без пары в Carbon

| Компонент | Почему пары нет |
|---|---|
| `Inline` | ряд с переносом и выравниванием: Carbon Stack в ряд не переносится |
| `Page` | шапка, плашка беды и содержимое — наша сборка (`Content` Carbon — только `<main>`) |
| `SurfaceProvider` | область одной главной кнопки — наше правило П5 |
| `BottomBar` | липкий низ страницы (у Carbon — только футеры в ibm-products) |
| `Icon` | значок по имени и знак тона; у Carbon значки — отдельный пакет компонентов (у нас — `/icons`) |
| `CountBadge` | счётчик строки и вкладки (BadgeIndicator Carbon не экспортирован) |
| `Avatar` | лицо (у Carbon — только ibm-products `UserAvatar`) |
| `Delta` | разница двух чисел |
| `Meter` | сколько взято из предела: ProgressBar Carbon — ход процесса; имена свойств — как у ProgressBar |
| `Prose`, `ProseHtml` | длинный текст ответа ролью «чтение» |
| `Chart` | рисунок рядов данных (у Carbon — отдельный пакет `@carbon/charts`) |
| `StatTile` | одно число с подписью и сравнением периодов (у Carbon — только ibm-products `BigNumber`) |
| `StateView` | что показать вместо данных: первый запуск, всё сделано, ничего не найдено, нет доступа, ошибка (у Carbon — ibm-products `EmptyState`) |
| `ChartFrame` | рамка графика: заголовок, легенда словом и видом линии, вывод словами для читалки, состояния той же высоты |
| `ConfirmProvider` / `useConfirm` | `await confirm({ modalHeading, danger })` вместо `window.confirm` — на том же `Modal` (у Carbon — только сам `Modal danger`) |
| `Toaster` / `useToast` | очередь всплывашек, место и свайп; одна всплывашка — поля Carbon `ToastNotification` (`kind`, `title`, `subtitle`, `caption`, `timeout`), отдельного компонента нет |
| `FilterBar` / `useUrlFilters` | фильтры списка рядами `ContentSwitcher` и поиск — в адресе страницы (у Carbon — ibm-products `FilterPanel`) |
| `ThreeColumn` | список → лента → карточка рядом, на телефоне — по одной или шторками |
| `ChatThread` | лента переписки (у Carbon — отдельный пакет `@carbon/ai-chat`) |
| `ReplyBox` | поле ответа с отправкой по клавишам; свойства поля — как у `TextArea` (`labelText`, `invalid`, `invalidText`, `helperText`) |
| UI Shell (`Header`, `SideNav`, `HeaderPanel`…) | конфигурация «шапка с левой панелью» (паттерн «Шапка и навигация»); не сделаны `HeaderNavigation`, `HeaderMenu`, `HeaderMenuItem`, `HeaderSideNavItems`, `SideNavMenu`, `SideNavMenuItem`, `SideNavHeader`, `SideNavFooter`, `Switcher`, `HeaderSwitcher`, `isRail`, `isFixedNav`; `HeaderName`, `SideNavLink` без `href` — `<button>`; точка перелома левой панели — `lg` Tailwind (1024), не 1056; `HeaderPanel` закрыта — в странице её нет, Esc закрывает (`onClose`); `SideNav` закрывает Esc (`onOverlayClick`) | точки перелома одни на ДС; продукт сам решает, что открывается |
| «Показать ещё» | не компонент, а сборка паттерна «Обрезка содержимого»: `ContainedList` + `Button kind="ghost"`; страницы таблицы — `Pagination` |

## Паттерны

Паттерны — 17 паттернов ядра IBM Carbon **их же текстом в переводе** (решение Саши 25.10, RSMM-60): своих текстов правил
нет. Источник — репо `carbon-design-system/carbon-website` (Apache-2.0, коммит `5e9cd1d`), что изменено — `NOTICE.md`.
Каждый — файл `patterns/<имя>.md` в пакете: заголовок, строка «Carbon: … · Источник: … · Перевод с английского», строка
«Компоненты примера» и дальше разделы Carbon в их порядке. В Storybook — полка «Паттерны»: правило и под ним живой
пример из компонентов этой ДС (`react/src/patterns/`), примеры нейтральные — без слов наших продуктов.

| Паттерн | Carbon | Файл |
|---|---|---|
| Общие действия | Common actions | `patterns/common-actions.md` |
| Окна | Dialogs | `patterns/dialogs.md` |
| Выключенное состояние | Disabled states | `patterns/disabled-states.md` |
| Раскрытие | Disclosures | `patterns/disclosures.md` |
| Пустые состояния | Empty states | `patterns/empty-states.md` |
| Фильтры | Filtering | `patterns/filtering.md` |
| Текучие поля | Fluid styles | `patterns/fluid-styles.md` |
| Формы | Forms | `patterns/forms.md` |
| Шапка и навигация | Global header | `patterns/global-header.md` |
| Загрузка | Loading | `patterns/loading.md` |
| Вход | Login | `patterns/login.md` |
| Уведомления | Notifications | `patterns/notifications.md` |
| Обрезка содержимого | Overflow content | `patterns/overflow-content.md` |
| Только чтение | Read-only states | `patterns/read-only-states.md` |
| Поиск | Search | `patterns/search.md` |
| Индикаторы статуса | Status indicators | `patterns/status-indicators.md` |
| Панель правки текста | Text toolbar | `patterns/text-toolbar.md` |

Пошаговый путь — раздел «Формы → длинные формы» и компонент шагов (`ProgressIndicator`). Текучих полей и панели правки текста в ДС
пока нет — их примеры честно говорят об этом.

## Правила — держит машина

| Правило | Чем держится | Приманка (обязана быть красной) |
|---|---|---|
| Только роли и шкалы: нет сырых цветов и размеров, произвольных значений, палитры Tailwind и классов вне шкал (`pl-5`, `gap-1.5`, `text-sm`, `h-12`, `rounded-lg`, `max-w-md`) | тема Tailwind (`dist/tailwind.css`) таких классов не создаёт; `lint/scan.mjs` (`ds/off-scale` и др.) — в ДС `npm run lint`, в продукте `lint/cli.mjs` и `lint/principles.mjs` | `__tests__/bait/off-scale.tsx` |
| Устройство: у каждого экспорта — запись в реестре; уровень из списка; импорт только нижних уровней (своего — только база уровня или исключение с «почему»); один смысл — один компонент; пары-соседи — с «почему»; полка — «Компоненты/<уровень>/…», пример паттерна — «Паттерны/…»; тон и ход — только из словарей; значки — только `Icon`; таблетки, свои `<svg>` и заливка статуса (`*-fill`) — только в названных файлах; контейнер прокрутки (`overflow-auto`, `overflow-y-auto`) — с `relative`; раскрытие — одна механика `lib/disclosure.tsx` (`ds-expand` в компоненте — красное) | `lib/architecture.mjs`, тест `architecture.test.ts` | `__tests__/bait/architecture/` |
| Паттерны — ровно 17 паттернов Carbon в переводе: строка источника и коммит, узкая разметка, пример на полке «Паттерны/<название>», «Компоненты примера» = импорты примера | `__tests__/patterns.test.ts` | правило без источника, со ссылкой, цитатой, тегом и `Drawer` |
| ДС ничья: в правилах, компонентах, историях, примерах, фикстурах и реестре нет слов наших продуктов и номеров задач | `__tests__/domain-words.test.ts` | строка со всеми запретными словами |
| Облик и анатомия: каждая история × светлая и тёмная × 390 и 1280 против эталона; поля, роль заголовка, угол и метка — по реестру; текст, углы и высоты контролов — только из шкал | `react/visual/run.mjs` (`npm run test:visual`), эталоны `react/visual/baseline/` | `__tests__/visual.test.ts`: кадр со сдвигом на 1 px, снимок с полями 12 вместо 16 |
| Контраст: текст ≥ 4,5 : 1 (и на заливке статуса), знаки, границы контролов, фокус и ряды данных ≥ 3 : 1 — обе темы | `lib/contrast.mjs`, `contrast.test.ts` | пара светло-серого текста на белом |
| Форма ролей, шкал и матрицы облика — закрытые списки | `tokens.schema.json`, `matrix.schema.json`, `schemas.test.ts` | `__tests__/fixtures/schemas/*/invalid` |
| Одна `kind="primary"` на поверхность и в наборе; опасное (`danger…`) не в одном `ButtonSet` с главной; в строке списка — только `kind="ghost"`; на лице `ExpandableTile` — заголовок и ≤ 3 фактов, раскрытие ≤ 2 уровней; одна липкая полоса на страницу; шагов — от трёх | сами компоненты (`rule()` бросает в разработке), тесты `react/src/__tests__` | `elements.test.tsx`: вторая главная на странице, `danger` рядом с главной, не-ghost в строке — красные |
| История на каждое обещанное состояние, теги состояний — из `matrix.yaml`; a11y axe в обеих темах | `rules.test.tsx`, `a11y.test.tsx` | — |
| Продукт: экраны только на полке `Экраны/SCR-NN …`; своего компонента с именем компонента ДС нет; новое нарушение «только роли» — красное, старое — долг | `lint/principles.mjs --kind product --base origin/main` в `check` продукта | `principles.test.ts` |
| Ширины: каждая история `Экраны/SCR-NN …` на 360 · 1024 · 1280 · 1920 — страница не шире окна, текст не за краем, самая тяжёлая роль продукта обязана быть среди историй | `lint/widths.mjs` (`design widths`) в CI продукта, `__tests__/widths.test.ts` | экран шире окна, текст за левым краем, история не отрисовалась |

## Правила словами (машина не держит)

- Редизайн перекрашивает утверждённую структуру экрана, а не строит заново: экраны, порядок и поведение, которые Саша
  утвердил, остаются; переделка структуры — отдельное слово хозяина. Держит глаз хозяина: правка облика переписывает снимки
  `react/visual/baseline/`, и новые кадры хозяин смотрит в PR до слияния (список — `git diff --name-only origin/main --
  react/visual/baseline`).
- Экран отвечает на один вопрос; всё для решения — рядом; действие — у причины.
- В ДС — основы, компоненты и паттерны-правила; сборка из компонентов под задачу продукта (страница настроек, панель
  сохранения, мастер, каркас с навигацией) — в продукте. Повторилась у второго продукта — разговор о компоненте, не копия.
  Граница — решение хозяина: реестр проверяет уровень и смысл, но не «основа это или сборка».

## Как продукт берёт ДС

```json
"dependencies": { "@replai-smm/design": "github:replai-smm/design#v1.2.0" }
```

Второй вид ссылки — архив тега через https (codeload):

```json
"dependencies": { "@replai-smm/design": "https://codeload.github.com/replai-smm/design/tar.gz/refs/tags/v1.2.0" }
```

Общий вид: `https://codeload.github.com/<org>/<repo>/tar.gz/refs/tags/<тег>`. Прежний вид `github:<org>/<repo>#<тег>` берите
по умолчанию; архив через https — там, где git-ссылка не проходит (среда без git или ssh, только https). Пакет и тег
в обоих видах одни и те же.

Одной командой в продукт ставится и то, что ДС держит сама — навык для сессии, шаг CI и хук-напоминание:
`node node_modules/@replai-smm/design/bin/design.mjs init` (идемпотентно; `init --check` в CI краснеет на правке этих файлов руками). Приложение — папка,
где стоит `node_modules` с пакетом; настройки сторожа ширин — `"design": { "require": ["<часть заголовка самой тяжёлой истории>"] }` в её `package.json`.

Главный CSS:

```css
@import "tailwindcss";
@import "@replai-smm/design/tokens.css";
@import "@replai-smm/design/tailwind.css";
@import "@replai-smm/design/styles.css";
@source "../node_modules/@replai-smm/design/react/src";
```

Компоненты — `import { Button, Page } from '@replai-smm/design'`, значки для `renderIcon` — `import { Add } from '@replai-smm/design/icons'` (исходники TypeScript, сборщик продукта транспилирует их
сам; `resolve.dedupe: ['react', 'react-dom', 'radix-ui']`). Пакету нужны только React и Radix из продукта. Вокруг
приложения — `<Toaster>` и `<ConfirmProvider>` один раз. Сторож в `check` продукта:
`node node_modules/@replai-smm/design/lint/principles.mjs --kind product --base origin/main src`; правило ESLint —
`@replai-smm/design/lint/eslint-plugin` (`ds/no-raw-values`); старые нарушения — храповиком `lint/cli.mjs --baseline`.

Репо публичное: `npm ci` ставит пакет по тегу без токена. В теге лежит собранный `dist/`, скриптов установки нет.
Версию ДС в продукте поднимает PR этого продукта: вышел выпуск — каждый продукт, который берёт ДС прежним тегом, поднимает
тег своим PR, когда готов.

Правила сборки (`patterns/*.md`) лежат в пакете: `node_modules/@replai-smm/design/patterns/` — их читают люди и агенты
продукта перед экраном.

## Выпуск

Как у пакета karta: PR в design → CI (`npm run check:ci` в облаке GitHub) и `npm run check` на ПК (со сверкой облика) зелёные → слияние → `npm run release`
из клона под своей учёткой GitHub. Прод ДС — теги `vX.Y.Z`: тег — коммит поверх коммита main с собранным `dist/`, main = прод
(родитель последнего тега — main). Выпуск, номер и откат — одно место, `release.mjs` (`deploy` · `watch` · `version` ·
`rollback`), его держит `__tests__/release.test.ts`.

- **Номер.** По умолчанию patch после последнего тега. Minor (новый компонент, свойство, роль) и major (снят или переименован
  экспорт, роль, класс) PR ставит сам: `version` в `package.json` — следующий minor или major выше последнего тега.
- **Тег.** Обычный `git push` тега под учёткой того, кто выпускает; ключа выкатки нет. Правило репо на GitHub: теги не двигает
  и не удаляет никто.
- **Откат.** Выпущенный тег не отзывается. Не прошёл `watch` (тег не виден или архив не ставится) — `node release.mjs rollback`
  заново выпускает содержимое main следующим номером, номер неудачного выпуска сгорает; main не тронут.

## Как поменять основу или компонент

1. Роль или шаг — `tokens.json` / `scale.json` и закрытый список в `tokens.schema.json`; компонент — `react/src` и его
   запись в `registry.json`.
2. `npm run build` → `npm run check`: типы, сторож, тесты, облик. Облик поменялся намеренно —
   `npm run storybook:build && npm run visual:update -w react`: переписаны только кадры, ушедшие за допуск, они — в том же
   PR и на глазах хозяина.
3. Посмотреть `dist/showcase.html` и Storybook в обеих темах на 390 и 1280.

## Что где лежит

| Файл | Что это |
|---|---|
| `tokens.json`, `scale.json` (+ `*.schema.json`) | роли и тоны, шкалы |
| `matrix.yaml` | матрица облика: темы × ширины × состояния, допуск сверки снимков |
| `patterns/` | паттерны — правила сборки типовых ситуаций (формат Carbon), идут в пакете |
| `INSIGHTS.md` | ВРЕМЕННО: что ломалось и какие правила может держать машина — до «машинного контроля» |
| `fonts/`, `licenses/`, `NOTICE.md` | шрифты и откуда что взято |
| `build.mjs`, `lib/` | генератор `dist/` и значков, контраст, устройство |
| `lint/` | сторож «только роли и шкалы», полки и свои компоненты |
| `react/` | ДС-React: компоненты, реестр, истории, тесты, облик (`react/README.md`) |
| `react/dist/showcase-components.html` | образцы компонентов для `dist/showcase.html`: пишет `npm run showcase -w react`, тест сверяет с историями и с поясом; в коммите, в пакет не входит |
| `dist/` | вывод `npm run build`; в ветке его нет, в тег кладёт выпуск (`release.mjs`) |
| `release.mjs` | выпуск, номер, откат (`npm run release`) |
