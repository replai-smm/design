// Проба (не входит в сборку A/B, гоняется на dev-сервере): меняет ли утилита Tailwind 4 (в @layer utilities) облик
// компонента Carbon и своего div рядом со сбросом Carbon. ?carbon=plain — CSS Carbon без слоя (как по умолчанию), ?carbon=layered — Carbon в слое `carbon`
// ниже utilities (как в A). Тройки: без класса — с утилитой — с утилитой и `!` (важность у Tailwind 4).
// У TextInput className ложится на обёртку .cds--form-item, а не на <input>: до поля утилита дотягивается только
// вариантом-потомком [&_input]:…
import { createRoot } from 'react-dom/client'
import { Button, TextInput } from '@carbon/react'
import './probe.css'

const CASES = [
  { id: 'own-div-padding', kind: 'div', cls: 'px-4', imp: 'px-4!', prop: 'padding-left' },
  { id: 'input-classname-direct', kind: 'input', cls: 'rounded-sm', imp: 'rounded-sm!', prop: 'border-top-left-radius' },
  { id: 'input-height', kind: 'input', cls: '[&_input]:h-12', imp: '[&_input]:h-12!', prop: 'height' },
  { id: 'input-radius', kind: 'input', cls: '[&_input]:rounded-sm', imp: '[&_input]:rounded-sm!', prop: 'border-top-left-radius' },
  { id: 'input-border', kind: 'input', cls: '[&_input]:border-t', imp: '[&_input]:border-t!', prop: 'border-top-width' },
  { id: 'input-padding', kind: 'input', cls: '[&_input]:px-6', imp: '[&_input]:px-6!', prop: 'padding-left' },
  { id: 'input-bg', kind: 'input', cls: '[&_input]:bg-red-500', imp: '[&_input]:bg-red-500!', prop: 'background-color' },
  { id: 'button-radius', kind: 'button', cls: 'rounded-sm', imp: 'rounded-sm!', prop: 'border-top-right-radius' },
  { id: 'button-padding', kind: 'button', cls: 'pr-4', imp: 'pr-4!', prop: 'padding-right' },
  { id: 'button-bg', kind: 'button', cls: 'bg-black', imp: 'bg-black!', prop: 'background-color' },
  { id: 'button-height', kind: 'button', cls: 'min-h-8', imp: 'min-h-8!', prop: 'min-height' },
  { id: 'button-justify', kind: 'button', cls: 'justify-center', imp: 'justify-center!', prop: 'justify-content' },
] as const
;(window as unknown as { CASES: typeof CASES }).CASES = CASES

function One({ kind, id, cls }: { kind: string; id: string; cls?: string }) {
  if (kind === 'div') return <div id={id} className={cls}>{id}</div>
  return kind === 'input' ? <TextInput id={id} labelText={id} className={cls} /> : <Button id={id} className={cls}>{id}</Button>
}

const layered = new URLSearchParams(location.search).get('carbon') === 'layered'
await (layered ? import('./carbon-layered.scss') : import('./carbon-plain.scss'))

createRoot(document.getElementById('root')!).render(
  <div>
    {CASES.map((c) => (
      <div key={c.id}>
        <One kind={c.kind} id={`${c.id}--base`} />
        <One kind={c.kind} id={`${c.id}--tw`} cls={c.cls} />
        <One kind={c.kind} id={`${c.id}--imp`} cls={c.imp} />
      </div>
    ))}
  </div>,
)
