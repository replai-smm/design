# ДС-React

Компоненты дизайн-системы: Radix, раскрашенный только ролями и шкалами. Уровни, смысл и анатомия каждого — в
`src/registry.json`; основа и правила — в корневом `README.md`.

## Компоненты

| Уровень | Компонент | Смысл |
|---|---|---|
| Раскладка | `Page`, `PageHeader`, `Section` | страница, шапка (заголовок и тихие действия), раздел с заголовком |
| | `Stack`, `Inline`, `Grid` | блоки столбиком, в строку, сеткой; отступ — роль (`gap="items"`) |
| | `SurfaceProvider` | область одной главной кнопки (своя область продукта) |
| Элементы | `Icon` | значок набора по имени или знак тона (`tone="опасно"`) |
| | `Button`, `ActionArea` | действие; главная — только `ActionArea primary`, одна; `secondary` · `ghost` · `tone="опасно"`; `dense` — 32 px; `icon` |
| | `StatusBadge`, `CountBadge` | статус из закрытого списка или тон со словом; число у строки и вкладки |
| | `Avatar`, `Tooltip` | лицо 32 px; подсказка у элемента, который берёт фокус |
| | `InlineLoading`, `Meter`, `Steps` | ход в строке, сколько взято из предела, путь из шагов — словарь хода |
| | `Delta`, `Skeleton`/`Loading`, `Prose`/`ProseHtml`, `Chart` | разница двух чисел, загрузка той же формы, текст ответа (роль «чтение»), рисунок рядов данных (`area` — заливка под одной линией) |
| Поля | `TextField`, `TextArea`, `Select`, `NumberField`, `Checkbox`/`CheckboxGroup`, `Combobox`, `FileField`, `SearchField` | одна рамка и один каркас: подпись, подсказка, ошибка знаком и словом; `dense` — 32 px |
| Поверхности | `Surface` | слой, рамка, угол 6, поля 16; `mark` — метка тона слева; `inset` — утопленная |
| | `Card`, `StatTile`, `Notification`, `StateView`, `CodeBlock`, `ChartFrame` | построены на `Surface`; заголовок — роль `heading` |
| | `DecisionCard`, `Diagram` | чат orbit |
| Коллекции | `DataTable`, `List` | строки: срочное сверху, норма свёрнута, много — «показать ещё»; `selectedKey` и `onSelect`; сортировка, подсказка у заголовка, `nowrap`, `rowMuted` у таблицы |
| | `ProofreadGrid`, `GridLegend`, `StatusRow`, `WeekCalendar` | DF; сетка статуса — клетка и развёрнутый день (`StatusRow`) залиты тоном статуса |
| Слои | `Dialog`, `ConfirmProvider`/`useConfirm`, `Toaster`/`useToast` | окно (шторка снизу на телефоне, `side="left"` — слева, `size`: `sm` · `md` · `full`), подтверждение, «готово» |
| | `CommandMenu` | чат orbit |
| Паттерны | `Tabs`, `FilterBar`/`useUrlFilters` | один ряд сегментов: панели и фильтры в адресе; не влезает — вкладки одной строкой с прокруткой, фильтры переносятся |
| | `ThreeColumn`, `ChatThread`, `ReplyBox` | список → лента → карточка; переписка; поле ответа (`send`: `enter` · `ctrl-enter` · `button`) |
| | `AgentStep` | чат orbit |

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
