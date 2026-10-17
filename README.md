# Дизайн-система replai-smm

Один источник облика для всех продуктов: роли и шкалы, ДС-React по уровням, правила,
которые держит машина. Продукт берёт пакет по тегу и строит из него только экраны.

Посмотреть: `npm ci && npm run build` → `dist/showcase.html` (обе темы, 390 и 1280, без сети) или `npm run storybook`.
Облик каждой истории в обеих темах на 390 и 1280 — снимки `react/visual/baseline/` (в репо, открываются на GitHub).

## Один язык

| Шкала | Что есть | Источник |
|---|---|---|
| Цвет | 32 роли: поверхности (`canvas`, `surface`, `inverse`), текст (`fg`, `fg-muted`, `fg-disabled`, `fg-inverse`), рамки (`line`, `line-strong`), взаимодействие (`hover`, `selected`, `accent`), глубина (`scrim`, `shadow`), тоны (`danger`, `warning`, `success` + текст и подложка у срочных), заливки статуса (`*-fill`, только сетка статуса), ряды данных `series-1…6` | `tokens.json → colors` |
| Тон | один словарь на все компоненты: опасно · внимание · инфо · нейтрально · хорошо. Подложка — только у «опасно» и «внимание»; «хорошо» — зелёный знак без подложки. Исключение по смыслу — сетка статуса (клетка и строка дня, чей смысл — сам статус): там заливка у каждого тона (`tones.*.fill`), только в `ProofreadGrid.tsx` (`registry.json → fill`) | `tokens.json → tones`, `react/src/lib/vocab.ts` |
| Ход работы | один словарь: `idle` впереди · `running` идёт · `done` готово · `error` ошибка — у шагов, шага агента, хода в строке, отправки сообщения | `vocab.ts → Progress` |
| Текст | 7 ролей: `caption` 12 · `body` 14 · `heading` 14/600 · `reading` 16 · `code` 13 моно · `title` 20 · `page` 28 | `scale.json → text` |
| Отступ | 6 ролей: `tight` 4 · `items` 8 · `compact` 12 · `blocks` 16 · `groups` 24 · `sections` 32 — и в классах (`gap-items`, `p-blocks`), и в `Stack gap="items"` | `scale.json → space` |
| Высота | `icon` 16 · `dense` 32 · `control` 40 · `touch` 48: контрол — 48 на телефоне и 40 на ноутбуке, плотный — 32 | `scale.json → size` |
| Ширина | предел колонки, окна, страницы: `rail` 16rem · `hint` · `narrow` · `popup` · `form` · `panel` · `wide` · `window` · `page` 80rem — `max-w-window`, `w-rail`; размеров контейнеров Tailwind (`max-w-md`) нет | `scale.json → measure` |
| Угол | `control` 4 · `surface` 6 · `full` — только метка, счётчик, аватар, точка | `scale.json → radius` |
| Глубина | плоско (рамка) · всплывает (`shadow-raised`) · поверх (`shadow-overlay` и затемнение `scrim`) | `scale.json → elevation` |
| Движение | `duration-fast` 110 мс (отклик) · `duration-move` 0,6 с (раскрытие, выезд), одна кривая; «уменьшить движение» — обе 0 | `scale.json → motion` |
| Шрифт | IBM Plex Sans 400/600, IBM Plex Mono 400 — в пакете, с кириллицей | `fonts/` |
| Значки | один набор (IBM Carbon, 16 px) через один `Icon`; знаков-значков символами (◀ ▶ ×) нет | `lib/icons.mjs` → `react/src/lib/icons.gen.ts` |

Облик: главное действие — инверсия (чёрное в светлой, белое в тёмной), синий — только ссылка и фокус, цвет тона —
только смысл. Тёмная тема — почти чёрный холст, слои отделяет рамка.

Тема — атрибут `<html data-theme="light|dark">`; без него — как в системе. Атрибут можно поставить и куску страницы.

## Уровни

Компонент живёт на одном уровне и берёт только нижние; полка Storybook = уровень. Экраны — только в продуктах.

| Уровень | Компоненты |
|---|---|
| Основы | роли и шкалы (без компонентов) |
| Раскладка | Stack, Inline, Grid, Page, PageHeader, Section, SurfaceProvider |
| Элементы | Icon, Button, ActionArea, StatusBadge, CountBadge, Avatar, InlineLoading, Meter, Steps, Tooltip, Delta, Skeleton, Loading, Prose, ProseHtml, Chart |
| Поля | TextField, TextArea, Select, NumberField, Checkbox, CheckboxGroup, Combobox, FileField, SearchField |
| Поверхности | Surface, Card, StatTile, Notification, StateView, CodeBlock, ChartFrame; DecisionCard, Diagram — чат |
| Коллекции | DataTable, List; ProofreadGrid, GridLegend, StatusRow, WeekCalendar — DF |
| Слои | Dialog (окно и шторка), ConfirmProvider, Toaster; CommandMenu — чат |
| Паттерны | Tabs, FilterBar, ThreeColumn, ChatThread, ReplyBox; AgentStep — чат |

Уровень, смысл, анатомия (поверхность, поля, роль заголовка, метка, форма) и продукт каждого компонента — в
`react/src/registry.json`. Компоненты одного продукта помечены `product` и строятся только из ролей.

## Правила — держит машина

| Правило | Чем держится | Приманка (обязана быть красной) |
|---|---|---|
| Только роли и шкалы: нет сырых цветов и размеров, произвольных значений, палитры Tailwind и классов вне шкал (`pl-5`, `gap-1.5`, `text-sm`, `h-12`, `rounded-lg`, `max-w-md`) | тема Tailwind (`dist/tailwind.css`) таких классов не создаёт; `lint/scan.mjs` (`ds/off-scale` и др.) — в ДС `npm run lint`, в продукте `lint/cli.mjs` и `lint/principles.mjs` | `__tests__/bait/off-scale.tsx` |
| Устройство: у каждого экспорта — запись в реестре; уровень из списка; импорт только нижних уровней (своего — только база уровня или исключение с «почему»); один смысл — один компонент; пары-соседи — с «почему»; полка = уровень; тон и ход — только из словарей; значки — только `Icon`; таблетки, свои `<svg>` и заливка статуса (`*-fill`) — только в названных файлах | `lib/architecture.mjs`, тест `architecture.test.ts` | `__tests__/bait/architecture/` |
| Облик и анатомия: каждая история × светлая и тёмная × 390 и 1280 против эталона; поля, роль заголовка, угол и метка — по реестру; текст, углы и высоты контролов — только из шкал | `react/visual/run.mjs` (`npm run test:visual`), эталоны `react/visual/baseline/` | `__tests__/visual.test.ts`: кадр со сдвигом на 1 px, снимок с полями 12 вместо 16 |
| Контраст: текст ≥ 4,5 : 1 (и на заливке статуса), знаки, границы контролов, фокус и ряды данных ≥ 3 : 1 — обе темы | `lib/contrast.mjs`, `contrast.test.ts` | пара светло-серого текста на белом |
| Форма ролей, шкал и матрицы облика — закрытые списки | `tokens.schema.json`, `matrix.schema.json`, `schemas.test.ts` | `__tests__/fixtures/schemas/*/invalid` |
| Одна главная кнопка на область и поверхность; опасное не рядом с главной; в строке списка — только ghost; на лице карточки ≤ 3 фактов, раскрытие ≤ 2 уровней | сами компоненты (`rule()` бросает в разработке), тесты `react/src/__tests__` | — |
| История на каждое обещанное состояние, теги состояний — из `matrix.yaml`; a11y axe в обеих темах | `rules.test.tsx`, `a11y.test.tsx` | — |
| Продукт: экраны только на полке `Экраны/SCR-NN …`; своего компонента с именем компонента ДС нет; новое нарушение «только роли» — красное, старое — долг | `lint/principles.mjs --kind product --base origin/main` в CI продукта | `principles.test.ts` |

## Правила словами (машина не держит)

- Редизайн перекрашивает утверждённую структуру экрана, а не строит заново: экраны, порядок и поведение, которые Саша
  утвердил, остаются; переделка структуры — отдельное слово хозяина. Держит глаз хозяина: правка облика переписывает снимки
  `react/visual/baseline/`, и orbit показывает их хозяину до выпуска (`orbit.yaml` → `eyes`, ссылки — `look`).
- Экран отвечает на один вопрос; всё для решения — рядом; действие — у причины.

## Как продукт берёт ДС

```json
"dependencies": { "@replai-smm/design": "github:replai-smm/design#v1.1.0" }
```

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
приложения — `<Toaster>` и `<ConfirmProvider>` один раз. Сторож в CI продукта:
`node node_modules/@replai-smm/design/lint/principles.mjs --kind product --base origin/main src`; правило ESLint —
`@replai-smm/design/lint/eslint-plugin` (`ds/no-raw-values`); старые нарушения — храповиком `lint/cli.mjs --baseline`.

Репо публичное: `npm ci` ставит пакет по тегу без токена. В теге лежит собранный `dist/`, скриптов установки нет.
Версию ДС в продукте поднимает только Изменение этого продукта: вышел выпуск — orbit предлагает каждому продукту, который
берёт ДС прежним тегом, «поднять до vX», и оно идёт по слову хозяина «делаем».

## Выпуск

ДС — продукт orbit (`orbit.yaml`): Изменение ДС по слову «делаем» → стройка → проверки → выпуск. Прод ДС — теги `vX.Y.Z`:
тег — коммит поверх коммита main с собранным `dist/`, main = прод (родитель последнего тега — main). Выпуск, номер и откат —
одно место, `release.mjs` (`deploy` · `watch` · `version` · `rollback`), его держит `__tests__/release.test.ts`.

- **Номер.** По умолчанию patch после последнего тега. Minor (новый компонент, свойство, роль) и major (снят или переименован
  экспорт, роль, класс) Изменение ставит само: `version` в `package.json` — следующий minor или major выше последнего тега.
- **Ключ.** Тег ставит деплой-ключ репо (orbit `~/.config/orbit/keys/design`); правила репо на GitHub дают ему только создать
  тег — ветки создаёт и двигает только админ (main двигает orbit), теги не двигает и не удаляет никто.
- **Откат.** Выпущенный тег не отзывается. Не прошёл `watch` (тег не виден или архив не ставится) — orbit заново выпускает
  содержимое main следующим номером, номер неудачного выпуска сгорает; main не тронут.

## Как поменять основу или компонент

1. Роль или шаг — `tokens.json` / `scale.json` и закрытый список в `tokens.schema.json`; компонент — `react/src` и его
   запись в `registry.json`.
2. `npm run build` → `npm run check`: типы, сторож, тесты, облик. Облик поменялся намеренно —
   `npm run storybook:build && npm run visual:update -w react` (orbit: `snapshot`): переписаны только кадры, ушедшие за
   допуск, они — в том же Изменении и на глазах хозяина.
3. Посмотреть `dist/showcase.html` и Storybook в обеих темах на 390 и 1280.

## Что где лежит

| Файл | Что это |
|---|---|
| `tokens.json`, `scale.json`, `statuses.json` (+ `*.schema.json`) | роли и тоны, шкалы, закрытый список статусов |
| `matrix.yaml` | матрица облика: темы × ширины × состояния, допуск сверки снимков |
| `fonts/`, `licenses/`, `NOTICE.md` | шрифты и откуда что взято |
| `build.mjs`, `lib/` | генератор `dist/` и значков, контраст, устройство |
| `lint/` | сторож «только роли и шкалы», полки и свои компоненты |
| `react/` | ДС-React: компоненты, реестр, истории, тесты, облик (`react/README.md`) |
| `react/dist/showcase-components.html` | образцы компонентов для `dist/showcase.html`: пишет `npm run showcase -w react`, тест сверяет с историями и с поясом; в коммите, в пакет не входит |
| `dist/` | вывод `npm run build`; в ветке его нет, в тег кладёт выпуск (`release.mjs`) |
| `orbit.yaml`, `release.mjs` | договор с orbit; выпуск, номер, откат |
