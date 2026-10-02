// Страница образцов основы (showcase.html): одна статичная страница без сборки и без сети (шрифты и токены внутри файла).
// Открывается с телефона и ноутбука: темы светлая и тёмная, ширины 390 и 1280.

import { tokenEntries } from './entries.mjs'
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const num = (x) => String(x).replace('.', ',')

/** status-error → error: короткое имя тона для классов и значков. */
const short = (token) => token.replace(/^status-/, '')

const ICONS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <mask id="m-error"><rect width="16" height="16" fill="white"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="black" stroke-width="1.6" stroke-linecap="round"/></mask>
    <mask id="m-warning"><rect width="16" height="16" fill="white"/><path d="M8 6.2v3.6" stroke="black" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="12" r="0.95" fill="black"/></mask>
    <mask id="m-success"><rect width="16" height="16" fill="white"/><path d="M4.9 8.2l2.1 2.1 4.1-4.5" stroke="black" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></mask>
  </defs>
  <symbol id="i-error" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor" mask="url(#m-error)"/></symbol>
  <symbol id="i-warning" viewBox="0 0 16 16"><path d="M8 1.3l7 13.2H1z" fill="currentColor" mask="url(#m-warning)"/></symbol>
  <symbol id="i-success" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor" mask="url(#m-success)"/></symbol>
  <symbol id="i-neutral" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
</svg>`

const icon = (t) => `<svg class="ic" aria-hidden="true"><use href="#i-${t}"/></svg>`

const PAGE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--cds-background);color:var(--cds-text-primary);font-family:var(--cds-font-sans);
  font-size:var(--cds-body-01-font-size);line-height:var(--cds-body-01-line-height);letter-spacing:var(--cds-body-01-letter-spacing)}
.page{max-width:1280px;margin:0 auto;padding:var(--cds-spacing-06) var(--cds-spacing-05) var(--cds-spacing-10)}
h1{font-size:var(--cds-heading-04-font-size);line-height:var(--cds-heading-04-line-height);font-weight:400;margin:0 0 var(--cds-spacing-03)}
h2{font-size:var(--cds-heading-03-font-size);line-height:var(--cds-heading-03-line-height);font-weight:400;margin:var(--cds-spacing-09) 0 var(--cds-spacing-03)}
h3{font-size:var(--cds-heading-compact-01-font-size);line-height:var(--cds-heading-compact-01-line-height);font-weight:600;margin:var(--cds-spacing-06) 0 var(--cds-spacing-03)}
p{margin:0 0 var(--cds-spacing-03);max-width:70ch}
.lead{color:var(--cds-text-secondary)}
code{font-family:var(--cds-font-mono);font-size:var(--cds-code-01-font-size);letter-spacing:var(--cds-code-01-letter-spacing)}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:2;display:flex;flex-wrap:wrap;gap:var(--cds-spacing-05);padding:var(--cds-spacing-03) 0;
  background:var(--cds-background);border-bottom:1px solid var(--cds-border-subtle-01)}
.seg{display:inline-flex;align-items:center;gap:var(--cds-spacing-03)}
.seg span{color:var(--cds-text-secondary);font-size:var(--cds-label-01-font-size);letter-spacing:var(--cds-label-01-letter-spacing)}
.seg button{min-height:var(--cds-size-lg);min-width:var(--cds-size-lg);padding:0 var(--cds-spacing-05);border:1px solid var(--cds-border-strong-01);
  background:var(--cds-layer-01);color:var(--cds-text-primary);font:inherit;cursor:pointer;border-radius:var(--cds-radius-none)}
.seg button[aria-pressed="true"]{background:var(--cds-button-primary);border-color:var(--cds-button-primary);color:var(--cds-text-on-color)}
.seg button:focus-visible,.demo button:focus-visible{outline:2px solid var(--cds-focus);outline-offset:-2px}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.frame{margin:0 auto;width:100%}
.frame[data-width="390"]{max-width:390px;outline:1px dashed var(--cds-border-strong-01)}
.frame[data-width="1280"]{width:1280px}
.panels{display:grid;grid-template-columns:1fr;gap:var(--cds-spacing-05)}
@media (min-width:900px){.frame:not([data-width="390"]) .panels{grid-template-columns:1fr 1fr}}
.panel{min-width:0;background:var(--cds-background);color:var(--cds-text-primary);border:1px solid var(--cds-border-subtle-01);padding:var(--cds-spacing-05)}
.panel>h3:first-child{margin-top:0}
.on-layer{background:var(--cds-layer-01);padding:var(--cds-spacing-05);margin-top:var(--cds-spacing-05)}
.row{display:flex;flex-wrap:wrap;gap:var(--cds-spacing-03);margin-bottom:var(--cds-spacing-03)}
.ic{width:var(--cds-icon-size-01);height:var(--cds-icon-size-01);flex:none}
.kcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:var(--cds-spacing-03)}
.kcard{display:flex;flex-direction:column;gap:var(--cds-spacing-02);padding:var(--cds-spacing-04);background:var(--cds-layer-01);color:var(--cds-text-primary);border:1px solid;border-left-width:var(--cds-spacing-02)}
.kcard small{color:var(--cds-text-secondary)}
.tag{display:inline-flex;align-items:center;gap:var(--cds-spacing-02);min-height:var(--cds-size-xs);padding:0 var(--cds-spacing-03);
  border-radius:var(--cds-radius-full);background:var(--tone-bg);color:var(--tone-text);
  font-size:var(--cds-label-01-font-size);line-height:var(--cds-label-01-line-height);letter-spacing:var(--cds-label-01-letter-spacing)}
.plain{display:inline-flex;align-items:center;gap:var(--cds-spacing-02);min-height:var(--cds-size-xs)}
.plain .ic{color:var(--tone-mark)}
.plain.colored{color:var(--tone-text)}
TONES
table{border-collapse:collapse;width:100%;font-size:var(--cds-body-compact-01-font-size)}
th,td{text-align:left;padding:var(--cds-spacing-03) var(--cds-spacing-04);border-bottom:1px solid var(--cds-border-subtle-01);vertical-align:top}
th{font-weight:600;background:var(--cds-layer-01)}
td code{white-space:nowrap}
td.n{white-space:nowrap;font-variant-numeric:tabular-nums}
.ok{color:var(--cds-text-primary)}
.bad{color:var(--cds-text-error);font-weight:600}
.sw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--cds-spacing-03)}
.sw{border:1px solid var(--cds-border-subtle-01);background:var(--cds-layer-01)}
.sw i{display:block;height:var(--cds-size-lg);border-bottom:1px solid var(--cds-border-subtle-01)}
.sw div{padding:var(--cds-spacing-03);font-size:var(--cds-label-01-font-size);line-height:var(--cds-label-01-line-height);letter-spacing:var(--cds-label-01-letter-spacing);overflow-wrap:anywhere}
.sw b{font-weight:600;display:block}
.sw small{color:var(--cds-text-secondary);font-family:var(--cds-font-mono);font-size:inherit}
.type-row{padding:var(--cds-spacing-04) 0;border-bottom:1px solid var(--cds-border-subtle-01)}
.type-row small{display:block;color:var(--cds-text-secondary);font-size:var(--cds-label-01-font-size);letter-spacing:var(--cds-label-01-letter-spacing);margin-bottom:var(--cds-spacing-02)}
.sp{display:flex;align-items:center;gap:var(--cds-spacing-04);margin-bottom:var(--cds-spacing-02)}
.sp code{width:9em;flex:none}
.sp i{display:block;height:var(--cds-spacing-05);background:var(--cds-interactive)}
.boxes{display:flex;flex-wrap:wrap;gap:var(--cds-spacing-05);align-items:flex-end}
.box{background:var(--cds-layer-02);border:1px solid var(--cds-border-strong-01);display:flex;align-items:center;justify-content:center;padding:0 var(--cds-spacing-03);font-size:var(--cds-label-01-font-size)}
.demo{display:grid;gap:var(--cds-spacing-05)}
.demo button{min-height:var(--cds-size-lg);padding:0 var(--cds-spacing-05);border:0;background:var(--cds-button-primary);color:var(--cds-text-on-color);font:inherit;cursor:pointer}
.track{background:var(--cds-layer-01);padding:var(--cds-spacing-03);overflow:hidden}
.mover{width:96px;height:var(--cds-size-lg);background:var(--cds-interactive);transition:transform var(--cds-duration-move) var(--cds-easing-move)}
.track.go .mover{transform:translateX(200%)}
.fold{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--cds-duration-move) var(--cds-easing-move);background:var(--cds-layer-01)}
.fold>div{overflow:hidden}
.fold.open{grid-template-rows:1fr}
.fold p{padding:var(--cds-spacing-05);margin:0}
.layers{background:var(--cds-background);padding:var(--cds-spacing-05);border:1px solid var(--cds-border-subtle-01)}
.layers .l1{background:var(--cds-layer-01);padding:var(--cds-spacing-05)}
.layers .l2{background:var(--cds-layer-02);padding:var(--cds-spacing-05)}
.layers .l3{background:var(--cds-layer-03);padding:var(--cds-spacing-05)}
.layers .pop{background:var(--cds-layer-01);box-shadow:var(--cds-shadow-raised);padding:var(--cds-spacing-04);margin-top:var(--cds-spacing-05);max-width:240px}
`

export function showcase({ tokens, scale, statuses, law, css, contrast, THEME_ATTR }) {
  const tones = tokens.palettes.product // тон → токен
  const toneCss = Object.values(tones)
    .map((t) => `.tone-${short(t)}{--tone-mark:var(--cds-${t});--tone-text:var(--cds-${t}-text);--tone-bg:var(--cds-${t}-background)}`)
    .join('\n')
  const axes = [...new Set(statuses.statuses.map((s) => s.axis))]
  const title = (axis) => law.$defs?.[axis]?.['x-title'] ?? axis

  const statusBlock = (themeName) => {
    const attr = THEME_ATTR[themeName]
    const groups = axes
      .map((axis) => {
        const list = statuses.statuses.filter((s) => s.axis === axis)
        const tags = list.map((s) => `<span class="tag tone-${short(tones[s.tone])}">${icon(short(tones[s.tone]))}${esc(s.say)}</span>`).join('')
        const plain = list.map((s) => `<span class="plain tone-${short(tones[s.tone])}">${icon(short(tones[s.tone]))}<span>${esc(s.say)}</span></span>`).join('')
        return `<h3>${esc(title(axis))}</h3><div class="row">${tags}</div><div class="row">${plain}</div>`
      })
      .join('')
    const onLayer = statuses.statuses
      .map((s) => `<span class="plain colored tone-${short(tones[s.tone])}">${icon(short(tones[s.tone]))}<span>${esc(s.say)}</span></span>`)
      .join('')
    return `<div class="panel" data-theme="${attr}"><h3>${esc(themeName)} · Carbon ${esc(tokens.themes[themeName].carbon)}</h3>${groups}
<div class="on-layer"><h3>Текст цветом тона — на слое</h3><div class="row">${onLayer}</div></div></div>`
  }

  const toneRows = Object.entries(tones)
    .map(([tone, t]) => {
      const used = statuses.statuses.filter((s) => s.tone === tone).map((s) => s.say)
      return `<tr><td><span class="tag tone-${short(t)}">${icon(short(t))}${esc(tone)}</span></td><td><code>${esc(t)}</code><br><code>${esc(t)}-text</code><br><code>${esc(t)}-background</code></td><td>${esc(used.join(' · ') || '—')}</td></tr>`
    })
    .join('')

  // палитра Карты (C-SCR-3): рамка и полоса карточки цветом состояния; слова — обычным текстом
  const karta = tokens.palettes.karta
  const kartaBlock = (themeName) => {
    const cards = Object.entries(karta)
      .map(([state, t]) => {
        const used = statuses.statuses.filter((x) => x.karta === state).map((x) => x.say)
        return `<div class="kcard" style="border-color:var(--cds-${t});border-left-color:var(--cds-${t})"><b>${esc(state)}</b><small>${esc(used.join(' · '))}</small></div>`
      })
      .join('')
    return `<div class="panel" data-theme="${THEME_ATTR[themeName]}"><h3>${esc(themeName)}</h3><div class="kcards">${cards}</div></div>`
  }
  const kartaRows = Object.entries(karta)
    .map(([state, t]) => `<tr><td>${esc(state)}</td><td><code>${esc(t)}</code></td><td>${esc(statuses.statuses.filter((x) => x.karta === state).map((x) => x.say).join(' · '))}</td></tr>`)
    .join('')

  // контраст: строка на пару, колонки — темы
  const themesList = Object.keys(tokens.themes)
  const byPair = new Map()
  for (const r of contrast) {
    const key = `${r.fg}|${r.bg}|${r.min}`
    if (!byPair.has(key)) byPair.set(key, { fg: r.fg, bg: r.bg, min: r.min, why: r.why, cells: {} })
    byPair.get(key).cells[r.theme] = r
  }
  const failed = contrast.filter((r) => !r.ok).length
  const contrastRows = [...byPair.values()]
    .map((p) => {
      const cells = themesList
        .map((t) => {
          const r = p.cells[t]
          return `<td class="n ${r.ok ? 'ok' : 'bad'}">${r.ok ? '✓' : '✗'} ${num(r.ratio.toFixed(2))}</td>`
        })
        .join('')
      return `<tr><td>${esc(p.why)}</td><td><code>${esc(p.fg)}</code> на <code>${esc(p.bg)}</code></td><td class="n">≥ ${num(p.min)}</td>${cells}</tr>`
    })
    .join('')

  const light = tokens.themes['светлая'].colors
  const dark = tokens.themes['тёмная'].colors
  const groups = new Map()
  for (const name of Object.keys(light)) {
    const g = name.split('-')[0]
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g).push(name)
  }
  const swatches = [...groups.entries()]
    .map(
      ([g, names]) =>
        `<h3>${esc(g)}</h3><div class="sw-grid">${names
          .map((n) => `<div class="sw"><i style="background:var(--cds-${n})"></i><div><b>${esc(n)}</b><small>☀ ${esc(light[n])}<br>☾ ${esc(dark[n])}</small></div></div>`)
          .join('')}</div>`,
    )
    .join('')

  const sample = 'Карта показывает, что работает, а что падает. Съешь же ещё этих мягких французских булок — 0123456789'
  const typeRows = tokenEntries(scale.type)
    .map(([k, v]) => {
      const t = v.$value
      const style = `font-size:var(--cds-${k}-font-size);line-height:var(--cds-${k}-line-height);letter-spacing:var(--cds-${k}-letter-spacing);font-weight:var(--cds-${k}-font-weight)${k.startsWith('code') ? ';font-family:var(--cds-font-mono)' : ''}`
      return `<div class="type-row"><small>${esc(k)} · ${esc(t.fontSize)} / ${num(t.lineHeight)} · ${esc(t.letterSpacing)} · ${t.fontWeight}</small><div style="${style}">${esc(sample)}</div></div>`
    })
    .join('')

  const px = (rem) => (rem.endsWith('rem') ? `${parseFloat(rem) * 16}px` : rem)
  const spacingRows = tokenEntries(scale.spacing)
    .map(([k, v]) => `<div class="sp"><code>spacing-${esc(k)}</code><i style="width:var(--cds-spacing-${k})"></i><span>${esc(px(v.$value))}</span></div>`)
    .join('')
  const sizeBoxes = tokenEntries(scale.size)
    .map(([k, v]) => `<div class="box" style="height:var(--cds-size-${k})">size-${esc(k)} · ${esc(px(v.$value))}</div>`)
    .join('')
  const radiusBoxes = tokenEntries(scale.radius)
    .map(([k, v]) => `<div class="box" style="height:var(--cds-size-lg);min-width:96px;border-radius:var(--cds-radius-${k})">radius-${esc(k)} · ${esc(v.$value)}</div>`)
    .join('')
  const durationRows = tokenEntries(scale.duration)
    .map(([k, v]) => `<tr><td><code>duration-${esc(k)}</code></td><td class="n">${esc(v.$value)}</td><td>${esc(v.$description ?? '')}</td></tr>`)
    .join('')

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Основа дизайн-системы</title>
<!-- Сгенерировано design/build.mjs из tokens.json, scale.json и statuses.json. Руками не править. -->
<style>
${css}
${PAGE_CSS.replace('TONES', toneCss)}
</style>
</head>
<body>
${ICONS}
<div class="page">
<h1>Основа дизайн-системы</h1>
<p class="lead">Цвета IBM Carbon ${esc(tokens.source.version)} — светлая тема ${esc(tokens.themes['светлая'].carbon)}, тёмная ${esc(tokens.themes['тёмная'].carbon)}. Шрифт ${esc(tokens.font.family)} с кириллицей. Страница собрана из <code>design/tokens.json</code>; руками её не правят.</p>
<div class="bar" role="toolbar" aria-label="Тема и ширина">
  <div class="seg"><span>Тема</span>
    <button type="button" data-set-theme="auto" aria-pressed="true">как в системе</button>
    <button type="button" data-set-theme="light" aria-pressed="false">светлая</button>
    <button type="button" data-set-theme="dark" aria-pressed="false">тёмная</button></div>
  <div class="seg"><span>Ширина</span>
    <button type="button" data-set-width="auto" aria-pressed="true">как у экрана</button>
    <button type="button" data-set-width="390" aria-pressed="false">390</button>
    <button type="button" data-set-width="1280" aria-pressed="false">1280</button></div>
</div>
<div class="scroll"><div class="frame" id="frame">

<h2>Статусы</h2>
<p>Закрытый список: слово — из закона Карты, цвет — тон. Тонов четыре. Цвет никогда не один: у каждого тона своя форма значка и слово.</p>
<div class="panels">${themesList.map(statusBlock).join('')}</div>

<h3>Тоны</h3>
<div class="scroll"><table><thead><tr><th>Тон</th><th>Токены: знак, текст, фон метки</th><th>Статусы</th></tr></thead><tbody>${toneRows}</tbody></table></div>

<h2>Карта</h2>
<p>У экранов Карты и дашборда своя палитра (KARTA-VIEW C-SCR-3): синий — без изменений, жёлтый — хотят изменить, красный — падает. Цвет — у рамки и полосы карточки, слова — обычным текстом. Серый — не цвет состояния. Продукты красят статусы четырьмя тонами выше.</p>
<div class="panels">${themesList.map(kartaBlock).join('')}</div>
<div class="scroll"><table><thead><tr><th>Цвет Карты</th><th>Токен</th><th>Статусы</th></tr></thead><tbody>${kartaRows}</tbody></table></div>

<h2>Контраст</h2>
<p>Текст — не меньше 4,5 : 1, значки и рамки — не меньше 3 : 1, в обеих темах. Это же считает тест; ниже нормы — PR красный. Сейчас ниже нормы: ${failed}.</p>
<div class="scroll"><table><thead><tr><th>Что</th><th>Пара</th><th>Норма</th>${themesList.map((t) => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${contrastRows}</tbody></table></div>

<h2>Слои</h2>
<div class="panels">${themesList
    .map(
      (t) => `<div class="panel" data-theme="${THEME_ATTR[t]}"><div class="layers">background<div class="l1">layer-01<div class="l2">layer-02<div class="l3">layer-03</div></div></div><div class="pop">Всплывающий слой: layer-01 и тень shadow-raised</div></div></div>`,
    )
    .join('')}</div>

<h2>Цвета</h2>
<p>Квадрат — в выбранной теме; ☀ — значение светлой, ☾ — тёмной. Статусы (status-*) — наши, остальное — Carbon как есть.</p>
${swatches}

<h2>Текст</h2>
<p>Наборы Carbon. В Tailwind — <code>text-body-01</code>, <code>text-heading-03</code> и так далее.</p>
${typeRows}

<h2>Отступы</h2>
${spacingRows}

<h2>Размеры и углы</h2>
<div class="boxes">${sizeBoxes}</div>
<h3>Углы</h3>
<div class="boxes">${radiusBoxes}</div>

<h2>Движение</h2>
<div class="scroll"><table><thead><tr><th>Токен</th><th>Сколько</th><th>Зачем</th></tr></thead><tbody>${durationRows}</tbody></table></div>
<h3>0,6 с без прыжка</h3>
<div class="demo">
  <button type="button" id="go">Подвинуть</button>
  <div class="track" id="track"><div class="mover"></div></div>
  <button type="button" id="fold-btn" aria-expanded="false" aria-controls="fold">Раскрыть</button>
  <div class="fold" id="fold"><div><p>Раскрытие идёт 0,6 с: высота растёт плавно, текст под ним не прыгает. Если в системе включено «уменьшить движение», длительность — 0.</p></div></div>
</div>

</div></div>
</div>
<script>
(function () {
  var root = document.documentElement, frame = document.getElementById('frame');
  function press(attr, v) {
    document.querySelectorAll('[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === v)); });
  }
  function theme(v) {
    if (v === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', v);
    press('data-set-theme', v);
    try { localStorage.setItem('ds-theme', v); } catch (e) {}
  }
  function width(v) {
    if (v === 'auto') frame.removeAttribute('data-width'); else frame.setAttribute('data-width', v);
    press('data-set-width', v);
  }
  document.querySelectorAll('[data-set-theme]').forEach(function (b) { b.onclick = function () { theme(b.getAttribute('data-set-theme')); }; });
  document.querySelectorAll('[data-set-width]').forEach(function (b) { b.onclick = function () { width(b.getAttribute('data-set-width')); }; });
  try { var saved = localStorage.getItem('ds-theme'); if (saved) theme(saved); } catch (e) {}
  document.getElementById('go').onclick = function () { document.getElementById('track').classList.toggle('go'); };
  var fb = document.getElementById('fold-btn');
  fb.onclick = function () {
    var open = document.getElementById('fold').classList.toggle('open');
    fb.setAttribute('aria-expanded', String(open)); fb.textContent = open ? 'Свернуть' : 'Раскрыть';
  };
})();
</script>
</body>
</html>
`
}
