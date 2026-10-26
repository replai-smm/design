# Что поменялось

## 2.3.3

- `SideNav`: фон и рамка левой панели — на всю высоту колонки под шапкой (`self-stretch`), пункты внутри липнут под шапкой и прокручиваются сами (раньше панель кончалась на высоте своих пунктов).
- `lint/widths.mjs`: строже к контейнеру — текст обязан лежать внутри первого предка с прокруткой или обрезкой, если тот не называет свою прокрутку (`overflow-x-auto`, `ds-scroll-row`, `text-overflow: ellipsis`); панель, прокручивающаяся вбок сама из-за `overflow-y-auto`, — нарушение.

## 2.3.2

- `design init`: имя шага «npm ci (корень репо…)» без двоеточия — в 2.3.1 YAML шага CI был невалиден. Тест разбирает шаг как YAML при всех настройках.

## 2.3.1

- `design init`: в шаге CI — отдельный `npm ci` корня репо (если у корня свой `package.json` и приложение в подпапке) и установка браузера сторожа ширин оттуда: без корневых зависимостей `playwright` не находился.

## 2.3.0

Минор: ничего не снято и не переименовано. Оболочка продукта (Carbon: UI Shell) — конфигурация «шапка с левой панелью».

### Добавлено

- `Header`, `HeaderMenuButton`, `HeaderName`, `HeaderGlobalBar`, `HeaderGlobalAction`, `HeaderPanel`, `SideNav`, `SideNavItems`, `SideNavLink`, `SideNavDivider`,
  `SkipToContent` (уровень «Составные», файл `UIShell.tsx`): шапка 48 px одной строкой, кнопка меню, название (ссылка или действие), правая панель профиля/утилит
  (`isActive`, Esc → `onClose`), левая панель постоянна от `lg` и поверх страницы уже (`expanded`, `onOverlayClick`), пункт — ссылка или действие (`isActive` → `aria-current`).
  Не сделаны: `HeaderNavigation`, `HeaderMenu`, `HeaderMenuItem`, `SideNavMenu`, `SideNavMenuItem`, `SideNavHeader`, `SideNavFooter`, `Switcher`, `isRail`, `isFixedNav`.
  Истории «UI Shell» (обычное, меню открыто, панель профиля, много пунктов), тесты, README → «Договор Carbon».
- `patterns/global-header.md`: раздел «Ширины в ДС» — что куда уходит от 1024 px и уже, до 360.

## 2.2.1

- `design init`: `"design": { "widths": false }` в `package.json` приложения — в шаге CI нет сторожа ширин (продукт включает его, когда экраны проходят); без настройки — как в 2.2.0.

## 2.2.0

Минор: ничего не снято и не переименовано. ДС ставится в продукт одной командой, как karta, и держит ширины машиной.

### Добавлено

- `bin/design.mjs` (`bin: design`): `init` пишет в репо продукта навык `.claude/skills/design/SKILL.md` (паттерн сначала → экран из компонентов ДС → нет куска —
  правка в ДС → снимки под самой тяжёлой ролью на 360 · 1024 · 1280 до «готово»), шаг CI `.github/workflows/design.yml`, хук напоминания на правку интерфейса
  (`.claude/settings.json`, PreToolUse Edit|Write|MultiEdit: напоминание один раз за сессию, не блок) и скрипт `design` в корневом `package.json`;
  идемпотентен, `init --check` красный, если файлы ДС в репо правили руками. `check` — сторож «только роли и шкалы» против базы, `widths` — сторож ширин, `hook` — хук.
- `lint/widths.mjs` — сторож ширин: каждая история полки `Экраны/SCR-NN …` собранного Storybook на 360 · 1024 · 1280 · 1920 (светлая): страница не шире окна
  (`scrollWidth`), видимый текст не за краем окна (ряды со своей прокруткой не считаются), история отрисовалась; `--require` — обязательная история
  (самая тяжёлая роль продукта), `--only` — часть заголовка. В логе — таблица «история × ширина»; выход 1 на нарушении.

## 2.1.0

Минор: ничего не снято и не переименовано. Правки по просьбе первого продукта на 2.x (слово Саши 26.10).

### Добавлено

- `Tile kind="error·warning·info·success"` — тон плитки: метка слева цвета вида, ширина и цвета — те же, что у уведомлений
  (`KIND_MARK` в `lib/anatomy.ts`, общий с `InlineNotification`); `data-kind`, `data-mark`. Без `kind` плитка тихая, как была.
  Цвет не один: слово состояния называет заголовок плитки (раздел списка «Критичные», «Плановые»). История «Tile → С тоном».
- Липкая полоса низа (`BottomBar`) при коротком содержимом стоит у нижнего края колонки: `.ds-bottom-bar { margin-top: auto }`;
  `Page fill` растягивает страницу на высоту окна (`min-h-dvh`, содержимое `flex-1`) — тогда полоса держится у низа окна и на
  короткой странице. Продукт со своей оболочкой делает свою колонку на высоту окна сам (flex-колонка, содержимое растёт).

## 2.0.0

ДС ничья и устроена как IBM Carbon (решение Саши 25.10, RSMM-60): основы → компоненты → паттерны. Паттерны — 17 паттернов
ядра Carbon их текстом в переводе; продуктовых компонентов в ДС больше нет. Мажорная версия: сняты экспорты.

### Ушло из ДС

| Что | Куда | Почему |
|---|---|---|
| `ProofreadGrid`, `GridLegend`, `StatusRow`, `WeekCalendar` (+ `mondayOf`, `addWeeks`, `weekTitle`) | в продукт DF: DF остаётся на 1.2.0, пока не перенесёт их к себе своим PR | компоненты одного продукта |
| `DecisionCard`, `Diagram` (+ `edgePath`, `litSet`), `CommandMenu` (+ `matchCommands`), `AgentStep` | удалены | брали только архивные репо; живые продукты не берут |
| `ReplyBox`: команды через «/» (`menu`, `onKeyDown`, `activeDescendant`) | удалено | фича удалённого чата, держалась на `CommandMenu` |
| поле `products` в `registry.json` | удалено | продуктового в ДС нет по построению |
| `orbit.yaml`, ключ выкатки в `release.mjs` | удалены | выпуск как у karta: `npm run release`, тег обычным `git push` |

### Переименовано

| Было | Стало |
|---|---|
| полки Storybook `<Уровень>/…` | `Компоненты/<Уровень>/…`; новые полки — `Основы/…` и `Паттерны/…` |
| уровень реестра «Паттерны» (Tabs, FilterBar, ThreeColumn, ChatThread, ReplyBox) | «Составные» — по Carbon это компоненты, а «Паттерны» — правила |
| свои 13 паттернов-правил | 17 паттернов Carbon в переводе: `patterns/*.md` (список — README → «Паттерны») |

### Компоненты по договору Carbon

Решение Саши (пилот A/B 25.10, ветка `pilot/carbon-forms`): компоненты свои (Radix + Tailwind + роли), но имя, свойства,
значения и поведение — как у `@carbon/react` 1.119.0. Старых имён и свойств нет — псевдонимов совместимости нет. Что не
как у Carbon и почему — README → «Договор Carbon».

#### Этап 1 — «Раскладка» и «Элементы»

| Было | Стало | Что ещё поменялось |
|---|---|---|
| `Stack gap="tight·items·compact·blocks·groups·sections"` | `Stack gap={2·3·4·5·6·7}` (шаг Carbon spacing) | + `orientation="horizontal"`; без `gap` — без отступа (было `blocks`); тип `Space` → `SpacingStep` |
| `Inline gap="…"` | `Inline gap={2…7}` | по умолчанию 3 (8 px), как было `items`; пары в Carbon нет |
| `Grid columns={2·3} gap` | `Grid` + `Column sm md lg span` | 16 колонок Carbon (4 · 8 · 16); `narrow` (16 px), `withRowGap`; `columns`, `gap` удалены |
| `Section title description tools notice` | `Section` (Carbon) + `Heading` | `Section` только поднимает уровень заголовка (`level`), облика нет; заголовок — `<Heading>`, описание и инструменты — детьми (`as={Stack} gap={5}`) |
| — | `Heading` (новый) | `h1`–`h6` по вложенности `Section`; роль текста: 1 `page`, 2 `title`, 3+ `heading` |
| `PageHeader description tools` | `PageHeader subtitle pageActions` | — |
| `Button variant="secondary·ghost"` | `Button kind="secondary·ghost"` | `kind` по умолчанию `primary` (было: главной у Button нет); + `tertiary` |
| `Button tone="опасно"` | `Button kind="danger·danger--tertiary·danger--ghost"` | `danger` — заливка тона (Carbon), прежний облик (рамка) — `danger--tertiary` |
| `Button dense` | `Button size="sm"` | + `size="md·lg"` (постоянные 40 · 48); без `size` — 48/40 как было |
| `Button icon="add"` | `Button renderIcon={Add}` | значок — компонент из `@replai-smm/design/icons`, стоит после слова (Carbon) |
| `Button icon="close" aria-label` (без слова) | `IconButton label kind size` + `<Close />` ребёнком | подпись — подсказкой (Tooltip) и именем для читалки; `label` обязателен |
| `Button loading` | удалено | занятость — `InlineLoading` на месте кнопки (паттерн «Загрузка») |
| `Button asChild` | `Button href` | ссылка видом кнопки — `<a>` |
| `Button rule` (data-rule) | удалено | слово продукта; продукт ставит `data-rule` сам (любой `data-*` проходит) |
| `ActionArea primary label layout` | `ButtonSet` (Carbon) с детьми-кнопками | главная — `<Button>` последней; `layout` → `stacked`; `label` → `aria-label`; П5/П10 — проверкой `rule()`: две главные в наборе, `danger…` рядом с главной, набор в наборе, набор в строке списка — ошибка |
| `PrimaryAction`, `ButtonVariant` (типы) | `ButtonKind`, `IconButtonKind`, `Size` | — |
| `StatusBadge status` (закрытый список) | `IconIndicator kind label` | `kind` — 12 видов Carbon (`failed` … `informative`); знак своей формы и слово |
| `StatusBadge tone label` | `Tag type` (+ `DismissibleTag text onClose`) | `type`: `red` · `purple` · `green` · `gray` · `high-contrast` · `outline`; `size` sm · md · lg; `renderIcon` |
| `statuses.json`, `statuses.schema.json`, `STATUS_IDS`, `statusOf`, `toneOf`, `StatusId`, экспорт `./statuses.json` | удалены | слова продукта karta — из ДС ушли |
| `DataTable`/`List` `getStatus`, `statusLabel` (группы «срочное сверху», свёрнутая норма) | удалены | логика продукта; строки — в порядке данных |
| `Column<T>` (тип колонки таблицы) | `DataTableColumn<T>` | имя `Column` занято Carbon-колонкой сетки |
| `Card status={StatusId}` | `Card status={<IconIndicator…/>}` | слот `ReactNode` вместо id статуса |
| `InlineLoading label progress="running·done·error" hideLabel` | `InlineLoading description status="active·finished·error·inactive" iconDescription` | + `onSuccess`, `successDelay` (1500); `aria-live` вместо `role="status"` |
| `Steps steps current onStepClick errorAt compact label` | `ProgressIndicator currentIndex onChange vertical spaceEqually` + `ProgressStep label invalid disabled secondaryLabel description` | нажимаются все шаги, кроме текущего и выключенных (Carbon); `compact` → `vertical`; `label` → `aria-label`; `stepProgress` удалён |
| `Tooltip content` | `Tooltip label` (имя, aria-labelledby) / `description` (описание, aria-describedby) | + `align` (Carbon PopoverAlignment), `enterDelayMs`, `defaultOpen` |
| `Toggletip label children` | `Toggletip` + `ToggletipLabel` + `ToggletipButton label` + `ToggletipContent` | + `align`, `defaultOpen`; «i» — ребёнок `ToggletipButton` по умолчанию |
| `Accordion title defaultOpen` | `Accordion` + `AccordionItem title open onHeadingClick disabled` | `Accordion align size isFlush disabled ordered`; несколько пунктов — в одном `Accordion` |
| `Skeleton width="full·3/4·1/2·1/3"` | `SkeletonText width="100%"… paragraph lineCount heading` | + `SkeletonPlaceholder` (место блока, размер — `className`) |
| `Loading label` | удалено (коллизия с Carbon `Loading`) | область загрузки — `role="status" aria-busy="true"` и слово для читалки у того, кто грузит |
| `Meter valueText inline` | `Meter helperText type="inline" hideLabel` | имена — как у Carbon ProgressBar; пары нет |
| полки `Компоненты/<уровень>/<русское имя>` | `Компоненты/<уровень>/<ИмяCarbon>` | этап 1 — Раскладка и Элементы; + полки Stack, Grid, Heading, ButtonSet, IconButton, Link, Tag, IconIndicator |
| — | `@replai-smm/design/icons` (новый вход) | компоненты значков с именами Carbon (`Add`, `Close`, `ChevronDown`…) для `renderIcon`; + значки видов IconIndicator |

#### Расхождения и расширения (этап 1)

- `size`: без `size` — 48 на телефоне и 40 на ноутбуке (у Carbon — постоянный дефолт); `xs`, `xl`, `2xl` нет — ошибка в разработке.
- `Stack`/`Inline gap` — только шаги 2–7 (роли шкалы); строки-размера Carbon нет.
- `Grid`/`Column`: точки перелома Tailwind (768 и 1024 px вместо 672 и 1056); `condensed`, `fullWidth`, `xlg`, `max`, объект `{ span, offset }` не сделаны.
- `Button`: главная — инверсия, не синяя; `secondary` — рамка (у Carbon — серая заливка), `tertiary` — рамка цвета главной; `hasIconOnly`, `iconDescription`, `isExpressive`, `as` не сделаны — значок без слова только `IconButton`.
- `IconButton`: `kind` по умолчанию `primary`, как у Carbon (считается главной на поверхности); `badgeCount`, `autoAlign`, `highContrast`, `dropShadow`, `leaveDelayMs` нет.
- `ButtonSet`: на телефоне кнопки ряда — поровну во всю ширину (расширение); `fluid` нет.
- П5/П10/«в строке только ghost» — проверка `rule()` в разработке, у Carbon её нет.
- `Tag type`: нет `magenta`, `blue`, `cyan`, `teal`, `cool-gray`, `warm-gray` — нет ролей с проверенной парой текста; `green`/`gray` — заливки `success-fill`/`neutral-fill` (`Tag.tsx` в `registry.json → fill`).
- `DismissibleTag`: «убрать» без всплывающей подсказки; `dismissTooltipAlignment`, `decorator` нет.
- `IconIndicator`: синих цветов нет (синий — только ссылка и фокус) — `normal`, `in-progress`, `incomplete`, `informative` цветом текста; `caution-major` — цветом «внимание» (оранжевого нет); `size={20}`, `compact` нет.
- `ProgressIndicator`: на телефоне — строка «Шаг N из M · …»; шагов меньше трёх — ошибка в разработке.
- `Tooltip`/`Toggletip`: `autoAlign`, `highContrast`, `dropShadow`, `closeOnActivation`, `leaveDelayMs`, `ToggletipActions` нет.
- `Accordion`: `renderToggle`, `handleAnimationEnd` нет.
- `Link`: `visited` нет (цвет посещённой не проверен контрастом); `inline` берёт размер текста вокруг.
- `InlineLoading`: дуга — свой `<svg>` (у Carbon — `Loading small`).
- `Section`: облика нет, как у Carbon; отступы раздела — `as={Stack} gap={5}`.
- Контраст: + пары «текст опасной кнопки» (`fg-inverse` на `danger` и `danger-fg`).

#### Этап 2 — «Поля»

| Было | Стало | Что ещё поменялось |
|---|---|---|
| `TextField label error dense help` | `TextInput id labelText invalid invalidText warn warnText size` | `id` обязателен; + `warn`/`warnText`; `dense` → `size="sm"` (+ `md`, `lg`); `inline` — Carbon, `unit` — расширение; `type="password"` → `PasswordInput` |
| — | `PasswordInput` (новый) | кнопка-значок «Показать пароль» / «Скрыть пароль» (`showPasswordLabel`, `hidePasswordLabel`, `onTogglePasswordVisibility`, `type` для начала); + значки `View`, `ViewOff` |
| `TextArea label error help` | `TextArea labelText invalid invalidText warn warnText` | `id` необязателен (как у Carbon) |
| `NumberField label error dense help`, `value: number \| null`, `onChange(value)` | `NumberInput id label invalid invalidText warn warnText size`, `value: number \| string`, `onChange(event, { value, direction })` | подпись — `label` (Carbon); по умолчанию `0` (было пусто); пусто — ошибка «Введите число», с `allowEmpty` — `''`; + `hideSteppers`; дробь с точностью шага |
| `Select label options placeholder onChange(value) error dense help` | `Select id labelText … onChange(event)` + `SelectItem value text disabled hidden` + `SelectItemGroup label` | «Выберите…» — `<SelectItem value="" disabled hidden>` и `defaultValue=""`; тип `SelectOption` удалён |
| `Checkbox label checked:'indeterminate' onCheckedChange(c) error help` | `Checkbox id labelText indeterminate onChange(event, { checked, id }) invalid invalidText warn warnText readOnly` | родной `<input type="checkbox">` (было Radix-кнопка); тип `CheckedState` удалён |
| `CheckboxGroup legend error` | `CheckboxGroup legendText legendId invalid invalidText warn warnText` | ошибка группы красит рамку каждой галочки |
| — | `RadioButton labelText value name onChange(value, name, event)` + `RadioButtonGroup name legendText valueSelected defaultSelected onChange orientation readOnly` (новые) | по умолчанию в ряд (Carbon) |
| — | `Toggle id labelText labelA labelB toggled defaultToggled onToggle size readOnly hideLabel` (новый) | `role="switch"`; `size` только `sm` · `md` (`ToggleSize`) |
| — | `Form`, `FormGroup legendText legendId invalid message messageText` (новые) | своих отступов нет — `Stack` внутри |
| `Combobox options value defaultValue onChange(value) label loading empty limit clearable` | `ComboBox id titleText items itemToString itemToElement selectedItem initialSelectedItem onChange({ selectedItem }) shouldFilterItem onInputChange direction size readOnly` | `onChange` обязателен; печать не сужает список, а ставит на первый подходящий (Carbon); сужает `shouldFilterItem`; «очистить» — всегда при выбранном; `loading`, `empty`, `limit`, `clearable`, `inline`, `unit`, `description` пункта удалены (второй строкой — `itemToElement`); тип `ComboboxOption` удалён |
| `FileField label helperText accept: string maxSize value defaultValue onChange(files) showFiles ref.open()` | `FileUploader labelTitle labelDescription buttonLabel buttonKind accept: string[] maxFileSize filenameStatus onAddFiles(event, { addedFiles }) onChange(event) onDelete(event) ref.clearFiles()` + `FileUploaderItem name status invalid errorSubject errorBody onDelete(event, { uuid })` | список ведёт сам (неуправляемый, Carbon); `buttonKind` по умолчанию `primary`; ограничения словами — сам продукт в `labelDescription`; `fileSizeText`, `acceptText`, `fileMatches`, `FileFieldHandle`, `showFiles`, `open()` удалены; `FilenameStatus` — в словаре |
| `SearchField label value onChange(v)` | `Search labelText value defaultValue onChange(event) onClear closeButtonLabelText size` | обёртка `role="search"`; Esc стирает; `placeholder` по умолчанию «Поиск» (было — подпись) |
| `help` у всех полей и `Checkbox` | удалено | справка «i» — `Toggletip` в `labelText` (`ToggletipLabel` + `Toggletip`); правило «справка — у подписи строкой» снято |
| `error` у полей | `invalid` + `invalidText` | + `warn` + `warnText`; у выключенного и «только чтение» ошибки и предупреждения нет (Carbon) |
| типы `FieldBaseProps`, `FieldRowProps` (экспорт) | удалены из экспорта | общий каркас — внутренний (`TextInput.tsx`, база уровня «Поля») |
| полки `Компоненты/Поля/Поле ввода · Выбор · Число · Галочка · Выбор с поиском · Выбор файла · Поиск` | `Компоненты/Поля/TextInput · PasswordInput · TextArea · NumberInput · Select · Checkbox · RadioButton · Toggle · ComboBox · FileUploader · Search · Form` | data-slot: `text-input`, `password-input`, `number-input`, `combo-box`, `file-uploader`, `toggle`, `radio-button-group`, `form-group` |
| `Tooltip` с `label` стирал своё `aria-describedby` ребёнка | своё описание ребёнка остаётся | нужно `FileUploaderItem`: «убрать» описано ошибкой строки |

#### Расхождения и расширения (этап 2)

- Справка «i» в `labelText`: Carbon 1.119 в разработке предупреждает «labelText must have no interactive content» (`useNoInteractiveChildrenForLabel` у TextInput, Select, NumberInput, Checkbox, ComboBox, Search…), в v12 обещает запрет — у нас без предупреждения, по правилу 5 договора. Имя поля для читалки включает имя кнопки «i».
- `id`: обязателен там, где обязателен в .d.ts (TextInput, PasswordInput, NumberInput, Select, Checkbox, ComboBox, Toggle); у TextArea, Search, RadioButton — необязателен, как у Carbon.
- `NumberInput`: поле `role="spinbutton"`, не `<input type="number">`; PageUp/PageDown, Home/End — наши; слова ошибки по умолчанию («Число от … до …», «Введите число»); `type`, `locale`, `formatOptions`, `validate`, `disableWheel`, `stepStartValue`, `iconDescription` нет.
- `FileUploader`: `labelTitle` — строка роли `heading`, не `<h3>`; тип (`accept`) проверяется и не подошедший файл стоит строкой `FileUploaderItem invalid` с причиной (у Carbon — только `invalidFileType` в `onAddFiles`); `FileUploaderButton`, `FileUploaderDropContainer`, `Filename`, `getCurrentFiles`, `setCurrentFiles` нет.
- `Toggle`: включено — инверсия (у Carbon — зелёный); слова «Выкл» · «Вкл»; ряд 48/40 на телефоне/ноутбуке.
- `Form`/`FormGroup`: своих отступов нет (поля — `Stack` внутри).
- Не сделано: `enableCounter`, `maxCount`, `decorator`, `slug`, `light` у всех; `Select readOnly`, `noLabel`; `ComboBox typeahead`, `allowCustomValue`, `downshiftProps`, `autoAlign`; `Search isExpanded`, `onExpand`, `renderIcon`; `RadioButton labelPosition`, одиночные `invalid`/`warn` у кружка; `CheckboxGroup readOnly`.
- Расширение: `unit` у `TextInput`, `NumberInput`, `Select` (при `inline`) и узкое число в строке (`NumberInput inline` — роль ширины `number`). У `ComboBox` `inline` нет (нет в .d.ts) — `inline`/`unit` у него удалены.
- Слова по умолчанию — русские: «Показать пароль», «Очистить поиск», «Поиск», «Добавить файл», «Убрать файл», «Очистить выбор», «Выберите пункт».

#### Этап 3 — «Поверхности», «Коллекции», «Слои», «Составные»

| Было | Стало | Что ещё поменялось |
|---|---|---|
| `Surface as mark inset flush onClick` | `Tile` (+ `ClickableTile href onClick disabled renderIcon`) | `as`, `mark`, `inset`, `flush` удалены; плитка-переход/действие — `ClickableTile` (`href` — `<a>`, без него — `<button>`); метка тона — только у уведомлений; утопленное — анатомия `SUNKEN`; `Layer` не заведён (потребителя нет); база уровня — `Tile.tsx` |
| `Card title status facts action more` | `ExpandableTile expanded onClick tileCollapsedLabel tileExpandedLabel tileCollapsedIconText tileExpandedIconText` + `TileAboveTheFoldContent` + `TileBelowTheFoldContent` | всё лицо — детьми; П7: детей лица ≤ 4 (заголовок и 3 факта), вложенных `ExpandableTile` ≤ 2 — `rule()`; кнопка раскрытия всегда отдельная (вид Carbon «interactive») |
| `Notification tone title children action scope onClose` | `InlineNotification kind title subtitle children role hideCloseButton onClose onCloseButtonClick statusIconDescription aria-label` | `tone` → `kind` (`опасно` → `error`, `внимание` → `warning`, `инфо` → `info`, `хорошо` → `success`; `решение` — нет); `kind` по умолчанию `error`; «закрыть» — по умолчанию (было — только с `onClose`); `onClose` вернул `false` — остаётся; `role` по умолчанию `status` (было: опасно → `alert`); `scope` удалён — место решает разметка; тип `NotificationTone` удалён |
| `Notification action` | `ActionableNotification actionButtonLabel onActionButtonClick inline caption role hasFocus closeOnEscape` | `role="alertdialog"` по умолчанию: фокус на действие, Tab по кругу, Esc закрывает; `inline` — тихая кнопка, без него — плашка с тенью и кнопкой `tertiary` |
| `Toaster` / `useToast().show({ tone, title, description, action })` | `useToast().show({ kind, title, subtitle, caption, timeout, hideCloseButton, role, onClose })` (поля Carbon `ToastNotificationProps`) | `kind` по умолчанию `error` (было `хорошо`); `description` → `subtitle`; `action` удалён (у Carbon Toast его нет); `timeout` (по умолчанию 5000, `0` — висит); `role` → `type` Radix; файл `Toast.tsx` → `Toaster.tsx`; тип `ToastNotificationProps` в экспорте |
| `CodeBlock code label copy maxLines` | `CodeSnippet type="single·multi" children aria-label copyButtonDescription copyText feedback feedbackTimeout hideCopyButton maxCollapsedNumberOfRows maxExpandedNumberOfRows showMoreText showLessText wrapText disabled onClick` | `code` → дети; `copy` → `hideCopyButton` (наоборот); `maxLines` 12 → `maxCollapsedNumberOfRows` 15 и «Показать ещё»; подпись над кодом (`label`) удалена — имя поля `aria-label`; «Копировать» — кнопка-значок `Copy`; `type` по умолчанию `single` |
| `DataTable rows getKey columns[{key header cell face grow align nowrap sortValue sortFirst hint}] state error empty pageSize onSelect selectedKey rowAction rowMuted sort defaultSort onSortChange label` | `DataTable rows[{id …}] headers[{key header isSortable}] isSortable sortRow locale size` + дети-функция `{ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps, getCellProps, sortBy }` + `TableContainer title description`, `Table size`, `TableHead`, `TableRow isSelected`, `TableHeader isSortable isSortHeader sortDirection`, `TableBody`, `TableCell` | сортировка по кругу NONE → ASC → DESC → NONE (было: две стороны), сравнение Carbon (пустое — как ''); состояния — сборкой: `DataTableSkeleton` (новый), `StateView`; «показать ещё» → `Pagination`; `face`, `grow`, `nowrap`, `align`, `hint`, `rowMuted`, `onSelect` удалены (ширина и выравнивание — `className` ячейки); таблица — настоящая `<table>`, первая колонка стоит; `compareSortValues`, `SortState`, `SortDirection`, `CollectionProps`, `DataTableColumn` удалены; `TableRow` держит «в строке — только ghost»; файл `Collection.tsx` → `DataTable.tsx` |
| `List rows getKey renderRow label state error empty pageSize onSelect selectedKey rowAction` | `ContainedList label action kind="on-page·disclosed" isInset size` + `ContainedListItem onClick action disabled renderIcon` | строки — детьми; выбранная — `aria-current` на строке; состояния и «Показать ещё» — сборкой (паттерн «Обрезка содержимого»); `ListProps` удалён |
| — | `Pagination page pageSize pageSizes totalItems onChange({ page, pageSize }) pagesUnknown isLastPage size …` (новый, Коллекции) | слова по умолчанию — русские; + значки `CaretLeft`, `CaretRight` |
| `Dialog open onOpenChange trigger title description size="sm·md·full" side="left" actions persistent` | `Modal open modalHeading modalLabel children primaryButtonText secondaryButtonText primaryButtonDisabled onRequestSubmit onSecondarySubmit onRequestClose danger passiveModal preventCloseOnClickOutside size="xs·sm·md·lg" closeButtonLabel selectorPrimaryFocus loadingStatus loadingDescription onLoadingSuccess` | низ — кнопки свойствами (было `actions`); `trigger` удалён — `open` из состояния; `description` → дети; нажатие мимо закрывает только `passiveModal` (было: всё, кроме `persistent`); первый фокус — `[data-modal-primary-focus]` → у `danger` второстепенная → главная (было: `data-autofocus` → первое поле); `size` по умолчанию `md` (было `sm`), `full` удалён; `side="left"` — из API удалён, внутренняя `LeftSheet` только для `ThreeColumn`; data-slot `dialog` → `modal`; типы `DialogProps`, `DialogSize` → `ModalProps`, `ModalSize` |
| `ConfirmProvider` / `confirm({ title, body, confirmLabel, cancelLabel, danger, rule })` | `confirm({ modalHeading, modalLabel, children, primaryButtonText, secondaryButtonText, danger, size })` | поля — того же `Modal`; `rule` (data-rule) удалён — слово продукта |
| — | `OverflowMenu iconDescription aria-label direction flipped open onOpen onClose onClick renderIcon size align` + `OverflowMenuItem itemText onClick disabled isDelete hasDivider href requireTitle title` (новые, Слои) | кнопка — всегда `kind="ghost"`; + значок `OverflowMenuVertical` |
| `Tabs items[{value label count tone content keepMounted}] label value defaultValue onValueChange` | `Tabs selectedIndex defaultSelectedIndex onChange({ selectedIndex })` + `TabList aria-label activation` + `Tab disabled renderIcon` + `TabPanels` + `TabPanel` | номер вместо строки; все панели смонтированы, неактивные `hidden` (было — размонтирование, `keepMounted`); `count`/`tone` → `<CountBadge>` в слове вкладки; типы `TabItem`, `TabsProps` прежний — удалены |
| — | `ContentSwitcher selectedIndex selectionMode onChange({ index, name, text })` + `Switch name text disabled` (новые, Элементы) | ряд сегментов `FilterBar` — на нём (было Radix ToggleGroup, `role="radio"` → `role="tab"`); выбранный не снимается повторным нажатием |
| `FilterBar search={{ label }}` | `FilterBar search={{ labelText }}` | ряды — `ContentSwitcher`; «все» — сегмент со значением `''` |
| `ReplyBox label error disabled={слова} hint emphasis` | `ReplyBox labelText invalid invalidText disabled={boolean} helperText buttonKind` | почему нельзя — в `helperText`; подсказка о клавишах — `helperText` по умолчанию (`null` — без строки) |
| `StatTile onClick` | без смены API | плитка-действие — `ClickableTile`, без `onClick` — `Tile` |
| `ThreeColumn phone="sheets"` | без смены API | шторки — `Modal passiveModal` и внутренняя `LeftSheet`; «закрыть» — «Закрыть» |
| `ChatThread` `variant="notice"` | без смены API | весть — `Tile` с меткой (`data-mark="info"`) |
| полки `Компоненты/Поверхности/Поверхность · Карточка · Плитка с цифрой · Уведомление · Состояние · Блок кода · Рамка графика`, `Компоненты/Коллекции/Таблица · Список`, `Компоненты/Слои/Окно · Всплывашка`, `Компоненты/Составные/Вкладки · Фильтры · Три колонки · Переписка · Поле ответа` | `Компоненты/Поверхности/Tile · ExpandableTile · StatTile · InlineNotification · StateView · CodeSnippet · ChartFrame`, `Компоненты/Коллекции/DataTable · ContainedList · Pagination`, `Компоненты/Слои/Modal · OverflowMenu · Toaster`, `Компоненты/Составные/Tabs · FilterBar · ThreeColumn · ChatThread · ReplyBox`, `Компоненты/Элементы/ContentSwitcher` | data-slot: `tile`, `clickable-tile`, `expandable-tile`, `inline-notification`, `actionable-notification`, `code-snippet`, `table`, `table-container`, `data-table-skeleton`, `contained-list`, `contained-list-item`, `pagination`, `modal`, `content-switcher` |
| словари | + `NOTIFICATION_KINDS`/`NotificationKind` (+ `NOTIFICATION_TONE`), `MODAL_SIZES`/`ModalSize`, `SORT_STATES`/`DataTableSortState`, `CONTAINED_LIST_KINDS`/`ContainedListKind` | + значок `Copy` |

#### Расхождения и расширения (этап 3)

- Карточка: выбрана `ExpandableTile` ядра, не `preview__Card` — у preview Card нет сгиба, правило «раскрытие ≤ 2 уровней» стало бы пустым, и API preview меняется; у ExpandableTile «лицо» и «под сгибом» — ровно П7: факты считаются детьми `TileAboveTheFoldContent` (≤ 4 = заголовок + 3), глубина — вложенностью ExpandableTile.
- `ExpandableTile`: всегда вид «interactive» (кнопка со знаком отдельно, а не вся плитка-кнопка); `tileMaxHeight`, `tilePadding`, `light`, `decorator` нет.
- `Tile`/`ClickableTile`: `ClickableTile` без `href` — `<button>`; `light`, `decorator`, `slug`, `hasRoundedCorners`, `clicked` нет; `Layer` нет.
- Уведомления: облик — как `lowContrast` Carbon, самого `lowContrast` нет (на инверсии нет проверенных пар знаков тонов); `info-square`, `warning-alt` нет; знак — картинка со словом вида по-русски.
- `ToastNotification` — не компонент, а поля `useToast().show`; без `timeout` гаснет за 5 с (у Carbon 0); `role` → объявление Radix (`alert` — сразу).
- `CodeSnippet`: «Показать ещё» по числу строк, не по пикселям; `type="inline"`, `align`, `autoAlign`, `min*NumberOfRows` нет.
- `DataTable`: геттеры без `key` (React 19); нет выбора строк, раскрытия строк, `TableToolbar…`, `TableBatchActions`, `filterRows`, `stickyHeader`, `useZebraStyles`; `size` только sm · md · lg; первая колонка стоит.
- `ContainedList`: `size` без `xl`; выбранная строка — `aria-current` (своего свойства у Carbon нет).
- `Modal`: шторка снизу на телефоне; `size` по умолчанию `md`; `secondaryButtons`, `isFullWidth`, `alert`, `shouldSubmitOnEnter`, `launcherButtonRef` нет; шторка слева — только внутри `ThreeColumn`.
- `OverflowMenu`: кнопка всегда ghost; `focusTrap`, `menuOffset`, `selectorPrimaryFocus` нет.
- `ContentSwitcher`: `size`, `lowContrast`, `IconSwitch` нет.
- `Tabs`: `contained`, `dismissable`, `IconTab`, `TabsVertical`, `secondaryLabel` нет — счётчик `CountBadge` в слове вкладки.
- «Показать ещё» компонентом не осталось: таблица — `Pagination`, список — сборка паттерна «Обрезка содержимого» (`ContainedList` + `Button kind="ghost"`).
- Без пары (README «Без пары в Carbon»): `StatTile`, `StateView`, `ChartFrame`, `ConfirmProvider`/`useConfirm`, `Toaster`/`useToast`, `FilterBar`/`useUrlFilters`, `ThreeColumn`, `ChatThread`, `ReplyBox`.

### Добавлено вне переименований

- `BottomBar` — липкая полоса низа страницы, одна на страницу, последним блоком; кнопки по Carbon слева, на телефоне одним рядом.
- Поле настройки строкой: `inline` (Carbon) и наше расширение `unit` + узкое число в строке.
- Роль ширины `number` (10rem); значки — компонентами `@replai-smm/design/icons`.
- Паттерны в пакете: `@replai-smm/design/patterns/*.md`.
- CI: `.github/workflows/check.yml` — `npm run check:ci` в облаке GitHub (`ubuntu-latest`, без секретов); сверка облика — `npm run check` на ПК.
- Цели нажатия на телефоне — 48 (раскрытие, справка «i»).

### Как поднять продукт

Мажор: у всех компонентов с парой в Carbon новые имена и свойства (таблица выше). DF: сначала перенести 4 компонента к
себе (задача в Linear), затем переписать импорты и свойства по таблице и поднять тег одним PR; replai и Арена начинают
сразу с 2.x.
