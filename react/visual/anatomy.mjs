// Анатомия на собранном Storybook: вычисленные стили каждой истории против реестра (registry.json) и шкал (scale.json).
// Чистая функция над снимком страницы — тест зовёт её и на приманке (снимок с отступом 12 вместо 16 — обязана поймать).
//   anatomy/padding — поля компонента не равны роли отступа из реестра
//   anatomy/title   — заголовок компонента не той роли текста
//   anatomy/shape   — угол не тот: контрол 4, поверхность 6, таблетка
//   anatomy/mark    — метка слева не той ширины (одна на систему)
//   scale/text      — размер текста вне ролей текста
//   scale/radius    — угол вне шкалы углов
//   scale/density   — кнопка или поле не 32, 40 или 48 px высотой
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const px = (v) => (String(v).endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v))

/** Числа шкал в пикселях. */
export function scalePx(scale = JSON.parse(readFileSync(join(ROOT, 'scale.json'), 'utf8'))) {
  return {
    space: Object.fromEntries(Object.entries(scale.space).map(([k, v]) => [k, px(v.value)])),
    text: Object.fromEntries(Object.entries(scale.text).map(([k, v]) => [k, { size: px(v.size), weight: v.weight }])),
    radius: Object.fromEntries(Object.entries(scale.radius).map(([k, v]) => [k, px(v.value)])),
    density: ['dense', 'control', 'touch'].map((k) => px(scale.size[k].value)),
    mark: 2,
  }
}

/**
 * Снять снимок страницы — эту функцию Playwright выполняет в окне истории (без замыканий).
 * Возвращает { slots: [{ slot, padding, radius, markWidth, hasMark, title }], fonts: [px], radii: [px], controls: [{ what, height }] }.
 */
export function snapshotInPage() {
  const root = document.querySelector('#storybook-root') ?? document.body
  const all = [root, ...root.querySelectorAll('*'), ...document.querySelectorAll('[data-radix-popper-content-wrapper] *, [role=dialog], [role=dialog] *, [data-slot=toast], [data-slot=toast] *')]
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('.sr-only,[inert],[aria-hidden=true]')
  }
  const n = (v) => Math.round(parseFloat(v) * 100) / 100
  const slots = []
  for (const el of new Set(all)) {
    if (!(el instanceof HTMLElement) || !el.dataset.slot || !visible(el)) continue
    const cs = getComputedStyle(el)
    const body = [...el.children].find((c) => c instanceof HTMLElement && c.dataset.part === 'body') ?? el
    const title = el.querySelector('[data-part=title]')
    const tcs = title && visible(title) ? getComputedStyle(title) : null
    slots.push({
      slot: el.dataset.slot,
      padding: n(getComputedStyle(body).paddingLeft),
      radius: n(cs.borderTopRightRadius),
      height: n(el.getBoundingClientRect().height),
      markWidth: n(cs.borderLeftWidth),
      hasMark: Boolean(el.dataset.mark),
      title: tcs ? { size: n(tcs.fontSize), weight: Number(tcs.fontWeight) } : null,
    })
  }
  const fonts = new Set()
  const radii = new Set()
  const controls = []
  for (const el of new Set(all)) {
    if (!(el instanceof HTMLElement) || !visible(el)) continue
    const cs = getComputedStyle(el)
    if ([...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) fonts.add(n(cs.fontSize))
    for (const side of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']) radii.add(n(cs[side]))
    const textInput = el.matches('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]), select') && !el.closest('[data-slot=number-field],[data-slot=combobox]')
    if (el.dataset.slot === 'button' || textInput) controls.push({ what: el.dataset.slot === 'button' ? `кнопка «${el.textContent.trim().slice(0, 24) || el.getAttribute('aria-label')}»` : `поле ${el.tagName.toLowerCase()}`, height: n(el.getBoundingClientRect().height) })
  }
  return { slots, fonts: [...fonts], radii: [...radii], controls }
}

/** Проблемы снимка: [{ rule, text }]. */
export function anatomyProblems(snap, registry, s = scalePx()) {
  const out = []
  const bySlot = {}
  for (const [name, c] of Object.entries(registry.components)) if (c.anatomy?.slot) bySlot[c.anatomy.slot] = { name, ...c.anatomy }
  const seen = new Set()
  const once = (rule, text) => {
    const k = `${rule} ${text}`
    if (!seen.has(k)) (seen.add(k), out.push({ rule, text }))
  }
  for (const x of snap.slots) {
    const a = bySlot[x.slot]
    if (!a) continue
    if (a.padding && x.padding !== s.space[a.padding]) once('anatomy/padding', `${a.name}: поля ${x.padding}px, а роль «${a.padding}» — ${s.space[a.padding]}px`)
    if (a.title && x.title && (x.title.size !== s.text[a.title].size || x.title.weight !== s.text[a.title].weight))
      once('anatomy/title', `${a.name}: заголовок ${x.title.size}px/${x.title.weight}, а роль «${a.title}» — ${s.text[a.title].size}px/${s.text[a.title].weight}`)
    if (a.shape === 'surface' && x.radius !== s.radius.surface && x.radius !== 0) once('anatomy/shape', `${a.name}: угол ${x.radius}px, у поверхности — ${s.radius.surface}px`)
    if (a.shape === 'control' && x.radius !== s.radius.control) once('anatomy/shape', `${a.name}: угол ${x.radius}px, у контрола — ${s.radius.control}px`)
    if (a.shape === 'pill' && x.radius < x.height / 2) once('anatomy/shape', `${a.name}: не таблетка (угол ${x.radius}px при высоте ${x.height}px)`)
    if ((a.mark || x.hasMark) && x.markWidth !== s.mark) once('anatomy/mark', `${a.name}: метка ${x.markWidth}px, одна ширина метки — ${s.mark}px`)
  }
  const sizes = new Set(Object.values(s.text).map((t) => t.size))
  for (const f of snap.fonts) if (!sizes.has(f)) once('scale/text', `текст ${f}px — вне ролей текста (${[...sizes].join(', ')})`)
  const radii = new Set([0, ...Object.values(s.radius)])
  for (const r of snap.radii) if (!radii.has(r) && r < 999) once('scale/radius', `угол ${r}px — вне шкалы углов (${[...radii].join(', ')})`)
  for (const c of snap.controls) if (!s.density.includes(c.height)) once('scale/density', `${c.what}: высота ${c.height}px — не ${s.density.join(' / ')}`)
  return out
}
