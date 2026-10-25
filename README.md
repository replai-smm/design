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
| Цвет | 36 ролей: поверхности (`canvas`, `surface`, `inverse`), текст (`fg`, `fg-muted`, `fg-disabled`, `fg-inverse`), рамки (`line`, `line-strong`), взаимодействие (`hover`, `selected`, `accent`), глубина (`scrim`, `shadow`), тоны (`danger`, `decision`, `warning`, `success` + текст и подложка у срочных), заливки статуса (`*-fill`, только в файлах из `registry.json → fill`), ряды данных `series-1…6` | `tokens.json → colors` |
| Тон | один словарь на все компоненты: опасно · решение · внимание · инфо · нейтрально · хорошо. Подложка — только у «опасно», «решение» (ждёт решения человека, фиолетовый) и «внимание»; «хорошо» — зелёный знак без подложки. Заливка у каждого тона (`tones.*.fill`) — исключение по смыслу для сетки статуса, где смысл клетки — сам статус; только в файлах из `registry.json → fill` (в ДС таких нет) | `tokens.json → tones`, `react/src/lib/vocab.ts` |
| Ход работы | один словарь: `idle` впереди · `running` идёт · `done` готово · `error` ошибка — у шагов, хода в строке, отправки сообщения | `vocab.ts → Progress` |
| Текст | 7 ролей: `caption` 12 · `body` 14 · `heading` 14/600 · `reading` 16 · `code` 13 моно · `title` 20 · `page` 28 | `scale.json → text` |
| Отступ | 6 ролей: `tight` 4 · `items` 8 · `compact` 12 · `blocks` 16 · `groups` 24 · `sections` 32 — и в классах (`gap-items`, `p-blocks`), и в `Stack gap="items"` | `scale.json → space` |
| Высота | `icon` 16 · `dense` 32 · `control` 40 · `touch` 48: контрол — 48 на телефоне и 40 на ноутбуке, плотный — 32 | `scale.json → size` |
| Ширина | предел колонки, окна, страницы: `number` 10rem (поле числа) · `rail` 16rem · `hint` · `narrow` · `popup` · `form` · `panel` · `wide` · `window` · `page` 80rem — `max-w-window`, `w-rail`; размеров контейнеров Tailwind (`max-w-md`) нет | `scale.json → measure` |
| Угол | `control` 4 · `surface` 6 · `full` — только метка, счётчик, аватар, точка | `scale.json → radius` |
| Глубина | плоско (рамка) · всплывает (`shadow-raised`) · поверх (`shadow-overlay` и затемнение `scrim`) | `scale.json → elevation` |
| Движение | `duration-fast` 110 мс (отклик) · `duration-move` 0,6 с (раскрытие, выезд), одна кривая; «уменьшить движение» — обе 0 | `scale.json → motion` |
| Шрифт | IBM Plex Sans 400/600, IBM Plex Mono 400 — в пакете, с кириллицей | `fonts/` |
| Значки | один набор (IBM Carbon, 16 px) через один `Icon`; знаков-значков символами (◀ ▶ ×) нет | `lib/icons.mjs` → `react/src/lib/icons.gen.ts` |

Облик: главное действие — инверсия (чёрное в светлой, белое в тёмной), синий — только ссылка и фокус, цвет тона —
только смысл. Тёмная тема — почти чёрный холст, слои отделяет рамка.

Тема — атрибут `<html data-theme="light|dark">`; без него — как в системе. Атрибут можно поставить и куску страницы.

## Уровни

Компонент живёт на одном уровне и берёт только нижние. Полки Storybook — как у Carbon: «Основы» → «Компоненты/<уровень>»
→ «Паттерны». Экраны и сборки — только в продуктах.

| Уровень | Компоненты |
|---|---|
| Основы | роли и шкалы (без компонентов) |
| Раскладка | Stack, Inline, Grid, Page, PageHeader, Section, SurfaceProvider, BottomBar |
| Элементы | Icon, Button, ActionArea, StatusBadge, CountBadge, Avatar, InlineLoading, Meter, Steps, Tooltip, Toggletip, Accordion, Delta, Skeleton, Loading, Prose, ProseHtml, Chart |
| Поля | TextField, TextArea, Select, NumberField, Checkbox, CheckboxGroup, Combobox, FileField, SearchField |
| Поверхности | Surface, Card, StatTile, Notification, StateView, CodeBlock, ChartFrame |
| Коллекции | DataTable, List |
| Слои | Dialog (окно и шторка), ConfirmProvider, Toaster |
| Составные | Tabs, FilterBar, ThreeColumn, ChatThread, ReplyBox |

Уровень, смысл и анатомия (поверхность, поля, роль заголовка, метка, форма) каждого компонента — в
`react/src/registry.json`. ДС ничья: компонентов одного продукта в ней нет.

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

Пошаговый путь — раздел «Формы → длинные формы» и компонент шагов (`Steps`). Текучих полей и панели правки текста в ДС
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
| Одна главная кнопка на область и поверхность; опасное не рядом с главной; в строке списка — только ghost; на лице карточки ≤ 3 фактов, раскрытие ≤ 2 уровней; одна липкая полоса на страницу; шагов — от трёх; справка «i» — у подписи строкой | сами компоненты (`rule()` бросает в разработке), тесты `react/src/__tests__` | — |
| История на каждое обещанное состояние, теги состояний — из `matrix.yaml`; a11y axe в обеих темах | `rules.test.tsx`, `a11y.test.tsx` | — |
| Продукт: экраны только на полке `Экраны/SCR-NN …`; своего компонента с именем компонента ДС нет; новое нарушение «только роли» — красное, старое — долг | `lint/principles.mjs --kind product --base origin/main` в `check` продукта | `principles.test.ts` |

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

Главный CSS:

```css
@import "tailwindcss";
@import "@replai-smm/design/tokens.css";
@import "@replai-smm/design/tailwind.css";
@import "@replai-smm/design/styles.css";
@source "../node_modules/@replai-smm/design/react/src";
```

Компоненты — `import { Button, Page } from '@replai-smm/design'` (исходники TypeScript, сборщик продукта транспилирует их
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
| `tokens.json`, `scale.json`, `statuses.json` (+ `*.schema.json`) | роли и тоны, шкалы, закрытый список статусов |
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
