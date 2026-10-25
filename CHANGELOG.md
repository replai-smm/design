# Что поменялось

## 2.0.0

ДС ничья и устроена как IBM Carbon (решение Саши 25.10, RSMM-60): основы → компоненты → паттерны. Паттерны — 17 паттернов
ядра Carbon их текстом в переводе; продуктовых компонентов в ДС больше нет. Мажорная версия: сняты экспорты.

### Ушло из ДС

| Что | Куда | Почему |
|---|---|---|
| `ProofreadGrid`, `GridLegend`, `StatusRow`, `WeekCalendar` (+ `mondayOf`, `addWeeks`, `weekTitle`) | в продукт DF: DF остаётся на 1.2.0, пока не перенесёт их к себе своим PR | компоненты одного продукта |
| `DecisionCard`, `Diagram` (+ `edgePath`, `litSet`), `CommandMenu` (+ `matchCommands`), `AgentStep` | удалены | брали только архивные репо; живые продукты не берут |
| `ReplyBox`: команды через «/» (свойство `commands`) | удалено | фича удалённого чата, держалась на `CommandMenu` |
| поле `products` в `registry.json` | удалено | продуктового в ДС нет по построению |
| `orbit.yaml`, ключ выкатки в `release.mjs` | удалены | выпуск как у karta: `npm run release`, тег обычным `git push` |

### Переименовано

| Было | Стало |
|---|---|
| полки Storybook `<Уровень>/…` | `Компоненты/<Уровень>/…`; новые полки — `Основы/…` и `Паттерны/…` |
| уровень реестра «Паттерны» (Tabs, FilterBar, ThreeColumn, ChatThread, ReplyBox) | «Составные» — по Carbon это компоненты, а «Паттерны» — правила |
| свои 13 паттернов-правил | 17 паттернов Carbon в переводе: `patterns/*.md` (список — README → «Паттерны») |

### Добавлено

- `Toggletip` — справка «i» по нажатию (Carbon: Toggletip); `help` у всех полей и `Checkbox`.
- `Accordion` — раскрытие (Carbon: Accordion); одна механика раскрытия `lib/disclosure.tsx` у `Card`, `DataTable`, `List`.
- `BottomBar` — липкая полоса низа страницы, одна на страницу, последним блоком; кнопки по Carbon слева.
- `PageHeader.description` — строка «о чём экран».
- Поле настройки одной строкой: `inline` и `unit` у `TextField`, `NumberField`, `Select`, `Combobox`; число в строке узкое.
- Роль ширины `number` (10rem), значок `information`.
- Паттерны в пакете: `@replai-smm/design/patterns/*.md`.
- CI: `.github/workflows/check.yml` — `npm run check` на раннере `rsmm-pool` (не для PR из форков).

### Изменено поведение

- `Steps` — от трёх шагов (Carbon: Progress indicator); меньше — ошибка в разработке.
- Всплывашки и липкий низ встают над нижней панелью продукта (`--ds-bottom-inset`).

### Как поднять продукт

DF: сначала перенести 4 компонента к себе (задача в Linear), потом поднять тег. Остальным продуктам ничего не ломается,
если они не брали ушедшие компоненты.
