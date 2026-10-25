# ДС-React

Компоненты дизайн-системы: Radix, раскрашенный только ролями и шкалами. Полки Storybook: «Основы», «Компоненты/<уровень>», «Паттерны» (правило из `patterns/*.md` и пример — `src/patterns/`). Уровни, смысл и анатомия каждого — в
`src/registry.json`; основа и правила — в корневом `README.md`.

## Компоненты

| Уровень | Компонент | Смысл |
|---|---|---|
| Раскладка | `Page`, `PageHeader`, `Section` | страница, шапка (заголовок, строка «о чём экран» — `description`, тихие действия), раздел с заголовком |
| | `BottomBar` | липкая полоса низа страницы, одна на страницу: кнопки группой слева, на телефоне одним рядом; над нижней панелью продукта — `--ds-bottom-inset` |
| | `Stack`, `Inline`, `Grid` | блоки столбиком, в строку, сеткой; отступ — роль (`gap="items"`) |
| | `SurfaceProvider` | область одной главной кнопки (своя область продукта) |
| Элементы | `Icon` | значок набора по имени или знак тона (`tone="опасно"`) |
| | `Button`, `ActionArea` | действие; главная — только `ActionArea primary`, одна; `secondary` · `ghost` · `tone="опасно"`; `dense` — 32 px; `icon` |
| | `StatusBadge`, `CountBadge` | статус из закрытого списка или тон со словом; число у строки и вкладки |
| | `Avatar`, `Tooltip` | лицо 32 px; подсказка у элемента, который берёт фокус |
| | `Toggletip`, `Accordion` | справка «i» по нажатию (Carbon: Toggletip); раскрытие строкой с заголовком (Carbon: Accordion) |
| | `InlineLoading`, `Meter`, `Steps` | ход в строке, сколько взято из предела, путь из шагов — словарь хода |
| | `Delta`, `Skeleton`/`Loading`, `Prose`/`ProseHtml`, `Chart` | разница двух чисел, загрузка той же формы, текст ответа (роль «чтение»), рисунок рядов данных (`area` — заливка под одной линией) |
| Поля | `TextField`, `TextArea`, `Select`, `NumberField`, `Checkbox`/`CheckboxGroup`, `Combobox`, `FileField`, `SearchField` | одна рамка и один каркас: подпись, подсказка, ошибка знаком и словом; `dense` — 32 px; `help` — справка «i» у подписи; `inline` · `unit` (текст, число, выбор, выбор с поиском) — поле настройки одной строкой с 1024 px, ошибка у поля |
| Поверхности | `Surface` | слой, рамка, угол 6, поля 16; `mark` — метка тона слева; `inset` — утопленная |
| | `Card`, `StatTile`, `Notification`, `StateView`, `CodeBlock`, `ChartFrame` | построены на `Surface`; заголовок — роль `heading` |
| Коллекции | `DataTable`, `List` | строки: срочное сверху, норма свёрнута, много — «показать ещё»; `selectedKey` и `onSelect`; сортировка, подсказка у заголовка, `nowrap`, `rowMuted` у таблицы |
| Слои | `Dialog`, `ConfirmProvider`/`useConfirm`, `Toaster`/`useToast` | окно (шторка снизу на телефоне, `side="left"` — слева, `size`: `sm` · `md` · `full`), подтверждение, «готово» |
| Составные | `Tabs`, `FilterBar`/`useUrlFilters` | один ряд сегментов: панели и фильтры в адресе; не влезает — вкладки одной строкой с прокруткой, фильтры переносятся |
| | `ThreeColumn`, `ChatThread`, `ReplyBox` | список → лента → карточка; переписка; поле ответа (`send`: `enter` · `ctrl-enter` · `button`) |

Общие имена: `state` (`ready` · `loading` · `error`), `empty`, `error`, `selectedKey`, `onSelect`, `tone` (словарь
тонов), `progress` (словарь хода), `dense`, `label` — подпись для читалки.

## Проверки

```
npm run check          # из корня: сборка, типы, сторож, тесты, облик
npm run storybook
```

- `src/__tests__/` — поведение компонентов, правила API, истории на каждое состояние, a11y axe в обеих темах, образцы
  для `showcase.html` (`npm run showcase`, потом `npm run build`).
- `visual/` — облик: `npm run visual` сверяет каждую историю в обеих темах на 390 и 1280 с `visual/baseline/` и анатомию с
  реестром; `npm run visual:update` — новые эталоны (после `npm run storybook:build`). Разница — в `visual/out/`.
