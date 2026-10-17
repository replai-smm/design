// Страница образцов (dist/showcase.html): одна статичная страница без сборки и без сети (шрифты и роли внутри файла).
// Основы — из tokens.json и scale.json; компоненты — истории ДС-React, отрисованные в react/dist/showcase-components.html.
// Темы светлая и тёмная, ширины 390 и 1280.

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const COMPONENTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'react', 'dist', 'showcase-components.html')
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const num = (x) => String(x).replace('.', ',')

function componentsFrame(css) {
  if (!existsSync(COMPONENTS)) return ''
  const doc = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ДС-React</title><style>${css}</style></head><body>${readFileSync(COMPONENTS, 'utf8')}</body></html>`
  return `
<h2>Компоненты</h2>
<p>Каждый образец — история Storybook ДС-React, по уровням: элементы, поля, поверхности, коллекции, слои, паттерны. Ширина 390 — телефон, 1280 — ноутбук; тема общая со страницей.</p>
<iframe id="ds-react" data-ds-react title="Компоненты ДС-React" class="ds-react" loading="eager" srcdoc="${esc(doc)}"></iframe>
`
}

export const PAGE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ds-canvas);color:var(--ds-fg);font-family:var(--ds-font-sans);font-size:var(--ds-text-body-size);line-height:var(--ds-text-body-line)}
.page{max-width:1280px;margin:0 auto;padding:var(--ds-space-groups) var(--ds-space-blocks) var(--ds-space-sections)}
h1{font-size:var(--ds-text-page-size);line-height:var(--ds-text-page-line);font-weight:400;margin:0 0 var(--ds-space-items)}
h2{font-size:var(--ds-text-title-size);line-height:var(--ds-text-title-line);font-weight:400;margin:var(--ds-space-sections) 0 var(--ds-space-items)}
h3{font-size:var(--ds-text-heading-size);line-height:var(--ds-text-heading-line);font-weight:600;margin:var(--ds-space-groups) 0 var(--ds-space-items)}
p{margin:0 0 var(--ds-space-items);max-width:72ch}
.lead,.muted{color:var(--ds-fg-muted)}
code{font-family:var(--ds-font-mono);font-size:var(--ds-text-code-size)}
.bar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:var(--ds-space-blocks);padding:var(--ds-space-items) 0;background:var(--ds-canvas);border-bottom:1px solid var(--ds-line)}
.seg{display:inline-flex;align-items:center;gap:var(--ds-space-tight);padding:var(--ds-space-tight);border:1px solid var(--ds-line);border-radius:var(--ds-radius-control);background:var(--ds-surface)}
.seg span{color:var(--ds-fg-muted);font-size:var(--ds-text-caption-size);padding:0 var(--ds-space-items)}
.seg button{min-height:var(--ds-size-dense);padding:0 var(--ds-space-compact);border:0;border-radius:var(--ds-radius-control);background:transparent;color:var(--ds-fg);font:inherit;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--ds-selected);font-weight:600}
.seg button:focus-visible{outline:2px solid var(--ds-accent);outline-offset:-2px}
.scroll{overflow-x:auto}
.frame{margin:0 auto;width:100%}
.frame[data-width="390"]{max-width:390px;outline:1px dashed var(--ds-line-strong)}
.frame[data-width="1280"]{width:1280px} /* ds-allow: ширина кадра — ширина экрана, которую выбрал человек */
table{border-collapse:collapse;width:100%;background:var(--ds-surface);border:1px solid var(--ds-line);border-radius:var(--ds-radius-surface)}
th,td{text-align:left;padding:var(--ds-space-items) var(--ds-space-compact);border-bottom:1px solid var(--ds-line);vertical-align:middle}
th{font-weight:600}
td.n{white-space:nowrap;font-variant-numeric:tabular-nums}
.bad{color:var(--ds-danger-fg);font-weight:600}
.sw{display:inline-flex;gap:var(--ds-space-tight)}
.sw i{display:block;width:var(--ds-size-control);height:var(--ds-size-dense);border:1px solid var(--ds-line);border-radius:var(--ds-radius-control)}
.type-row{padding:var(--ds-space-compact) 0;border-bottom:1px solid var(--ds-line)}
.type-row small{display:block;color:var(--ds-fg-muted);font-size:var(--ds-text-caption-size);line-height:var(--ds-text-caption-line);margin-bottom:var(--ds-space-tight)}
.steps{display:flex;flex-wrap:wrap;gap:var(--ds-space-blocks);align-items:flex-end}
.steps div{display:flex;flex-direction:column;gap:var(--ds-space-tight);align-items:flex-start;font-size:var(--ds-text-caption-size);color:var(--ds-fg-muted)}
.steps b{display:block;background:var(--ds-fg);border-radius:var(--ds-radius-control)}
.cards{display:flex;flex-wrap:wrap;gap:var(--ds-space-blocks)}
.card{min-width:var(--ds-measure-rail);padding:var(--ds-space-blocks);background:var(--ds-surface);border:1px solid var(--ds-line);display:flex;flex-direction:column;gap:var(--ds-space-tight)}
.ds-react{display:block;width:100%;border:1px solid var(--ds-line);border-radius:var(--ds-radius-surface);background:var(--ds-canvas)}
.demo{display:grid;gap:var(--ds-space-blocks)}
.demo button{justify-self:start;min-height:var(--ds-size-control);padding:0 var(--ds-space-blocks);border:0;border-radius:var(--ds-radius-control);background:var(--ds-inverse);color:var(--ds-fg-inverse);font:inherit;cursor:pointer}
.track{background:var(--ds-surface);border:1px solid var(--ds-line);border-radius:var(--ds-radius-surface);padding:var(--ds-space-items);overflow:hidden}
.mover{width:calc(var(--ds-size-touch) * 2);height:var(--ds-size-dense);background:var(--ds-fg);border-radius:var(--ds-radius-control);transition:transform var(--ds-motion-move) var(--ds-ease)}
.track.go .mover{transform:translateX(200%)}
`

export function showcase({ tokens, scale, statuses, css, contrast }) {
  const roleRows = Object.entries(tokens.colors)
    .map(
      ([k, v]) =>
        `<tr><td><code>${esc(k)}</code></td><td><span class="sw"><i data-theme="light" style="background:var(--ds-${k})"></i><i data-theme="dark" style="background:var(--ds-${k})"></i></span></td><td class="n"><code>${esc(v.light)}</code><br><code>${esc(v.dark)}</code></td><td>${esc(v.role)}</td></tr>`,
    )
    .join('')
  const toneRows = Object.entries(tokens.tones)
    .map(([word, t]) => {
      const used = statuses.statuses.filter((s) => s.tone === word).map((s) => s.say)
      return `<tr><td>${esc(word)}</td><td><code>${esc(t.mark)}</code> · <code>${esc(t.text)}</code> · ${t.bg ? `<code>${esc(t.bg)}</code>` : 'без подложки'}${t.fill ? ` · сетка статуса <code>${esc(t.fill)}</code>` : ''}</td><td>${esc(used.join(' · ') || '—')}</td></tr>`
    })
    .join('')
  const failed = contrast.filter((r) => !r.ok).length
  const byPair = new Map()
  for (const r of contrast) {
    const key = `${r.fg}|${r.bg}|${r.on ?? ''}`
    if (!byPair.has(key)) byPair.set(key, { ...r, cells: {} })
    byPair.get(key).cells[r.theme] = r
  }
  const contrastRows = [...byPair.values()]
    .map(
      (p) =>
        `<tr><td>${esc(p.why)}</td><td><code>${esc(p.fg)}</code> на <code>${esc(p.bg)}</code>${p.on ? ` (поверх <code>${esc(p.on)}</code>)` : ''}</td><td class="n">≥ ${num(p.min)}</td>${['light', 'dark']
          .map((t) => `<td class="n${p.cells[t].ok ? '' : ' bad'}">${num(p.cells[t].ratio.toFixed(2))}</td>`)
          .join('')}</tr>`,
    )
    .join('')
  const sample = 'Съешь же ещё этих мягких французских булок — 0123456789'
  const typeRows = Object.entries(scale.text)
    .map(
      ([k, v]) =>
        `<div class="type-row"><small>${esc(k)} · ${esc(v.size)} / ${esc(v.line)} · ${v.weight}${v.family ? ' · моно' : ''} — ${esc(v.role)}</small><div style="font-size:var(--ds-text-${k}-size);line-height:var(--ds-text-${k}-line);font-weight:var(--ds-text-${k}-weight)${v.family ? ';font-family:var(--ds-font-mono)' : ''}">${esc(sample)}</div></div>`,
    )
    .join('')
  const steps = (group, prefix) =>
    Object.entries(scale[group])
      .map(([k, v]) => `<div><b style="width:var(--ds-${prefix}-${k});height:var(--ds-${prefix}-${k})"></b><code>${esc(k)}</code>${esc(v.value)}</div>`)
      .join('')
  const stepRows = (group) =>
    Object.entries(scale[group])
      .map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td class="n">${esc(Array.isArray(v.value) ? v.value.join(', ') : v.value)}</td><td>${esc(v.role)}</td></tr>`)
      .join('')
  const depth = Object.entries(scale.elevation)
    .map(([k, v]) => `<div class="card" style="border-radius:var(--ds-radius-surface);box-shadow:${k === 'flat' ? 'none' : `var(--ds-elevation-${k})`}"><b>${esc(k)}</b><span class="muted">${esc(v.role)}</span></div>`)
    .join('')
  const radii = Object.entries(scale.radius)
    .map(([k, v]) => `<div class="card" style="border-radius:var(--ds-radius-${k})"><b>${esc(k)} · ${esc(v.value)}</b><span class="muted">${esc(v.role)}</span></div>`)
    .join('')

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Основа дизайн-системы</title>
<!-- Сгенерировано build.mjs из tokens.json, scale.json и statuses.json. Руками не править. -->
<style>
${css}
${PAGE_CSS}
</style>
</head>
<body>
<div class="page">
<h1>Основа дизайн-системы</h1>
<p class="lead">Один язык: ${Object.keys(tokens.colors).length} ролей цвета, ${Object.keys(tokens.tones).length} тонов, ${Object.keys(scale.text).length} ролей текста, ${Object.keys(scale.space).length} шагов отступа, три высоты контролов, три глубины, два движения. Страница собрана из <code>tokens.json</code> и <code>scale.json</code>.</p>
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

<h2>Роли цвета</h2>
<p>Квадраты — светлая и тёмная тема. Главное действие — инверсия, синий — только ссылка и фокус, цвет тона — только смысл.</p>
<div class="scroll"><table><thead><tr><th>Роль</th><th>Образец</th><th>Светлая · тёмная</th><th>Зачем</th></tr></thead><tbody>${roleRows}</tbody></table></div>

<h2>Тоны</h2>
<p>Один словарь на все компоненты. Подложка — только у того, что просит внимания; норма не кричит.</p>
<div class="scroll"><table><thead><tr><th>Тон</th><th>Знак · текст · подложка · заливка</th><th>Статусы</th></tr></thead><tbody>${toneRows}</tbody></table></div>

<h2>Контраст</h2>
<p>Текст — не меньше 4,5 : 1, знаки и границы — не меньше 3 : 1, в обеих темах. Ниже нормы сейчас: ${failed}.</p>
<div class="scroll"><table><thead><tr><th>Что</th><th>Пара</th><th>Норма</th><th>Светлая</th><th>Тёмная</th></tr></thead><tbody>${contrastRows}</tbody></table></div>

<h2>Текст</h2>
${typeRows}

<h2>Отступы</h2>
<div class="steps">${steps('space', 'space')}</div>
<div class="scroll"><table><tbody>${stepRows('space')}</tbody></table></div>

<h2>Высоты</h2>
<div class="steps">${steps('size', 'size')}</div>
<div class="scroll"><table><tbody>${stepRows('size')}</tbody></table></div>

<h2>Ширины</h2>
<p>Предел колонки, окна и страницы: <code>max-w-window</code>, <code>w-rail</code>. Размеров контейнеров Tailwind (<code>max-w-md</code>) нет.</p>
<div class="scroll"><table><tbody>${stepRows('measure')}</tbody></table></div>

<h2>Углы и глубина</h2>
<div class="cards">${radii}</div>
<h3>Глубина</h3>
<div class="cards">${depth}</div>

<h2>Движение</h2>
<div class="scroll"><table><tbody>${stepRows('motion')}</tbody></table></div>
<div class="demo">
  <button type="button" id="go">Подвинуть за 0,6 с</button>
  <div class="track" id="track"><div class="mover"></div></div>
</div>
${componentsFrame(css)}
</div></div>
</div>
<script>
(function () {
  var root = document.documentElement, frame = document.getElementById('frame'), ifr = document.getElementById('ds-react'), current = 'auto';
  function press(attr, v) { document.querySelectorAll('[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === v)); }); }
  function inner() { try { return ifr && ifr.contentDocument; } catch (e) { return null; } }
  function fit() { var d = inner(); if (d && d.documentElement) ifr.style.height = d.documentElement.scrollHeight + 'px'; }
  function themeInner() { var d = inner(); if (!d || !d.documentElement) return; if (current === 'auto') d.documentElement.removeAttribute('data-theme'); else d.documentElement.setAttribute('data-theme', current); }
  if (ifr) {
    ifr.addEventListener('load', function () { themeInner(); fit(); var d = inner(); if (d && window.ResizeObserver) new ResizeObserver(fit).observe(d.body); });
    window.addEventListener('resize', fit);
  }
  function theme(v) { current = v; if (v === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', v); themeInner(); press('data-set-theme', v); try { localStorage.setItem('ds-theme', v); } catch (e) {} }
  function width(v) { if (v === 'auto') frame.removeAttribute('data-width'); else frame.setAttribute('data-width', v); setTimeout(fit, 0); press('data-set-width', v); }
  document.querySelectorAll('[data-set-theme]').forEach(function (b) { b.onclick = function () { theme(b.getAttribute('data-set-theme')); }; });
  document.querySelectorAll('[data-set-width]').forEach(function (b) { b.onclick = function () { width(b.getAttribute('data-set-width')); }; });
  try { var saved = localStorage.getItem('ds-theme'); if (saved) theme(saved); } catch (e) {}
  document.getElementById('go').onclick = function () { document.getElementById('track').classList.toggle('go'); };
})();
</script>
</body>
</html>
`
}
