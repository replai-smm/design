/**
 * Раскрытие — одна механика на всю ДС (Carbon: Disclosures): кнопка с `aria-expanded` и `aria-controls`, панель высотой от 0
 * до содержимого за 0,6 с (`ds-expand` в ds.css), закрытая панель недоступна фокусу и читалке (`inert`), знак — chevron-down,
 * поворот на 180°. Компоненты берут её отсюда, своей копии нет (устройство: `expand/own`).
 */
import { useId, useState, type ReactNode } from 'react'
import { cx } from './cx'

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial)
  const id = useId()
  return { open, setOpen, id, trigger: { 'aria-expanded': open, 'aria-controls': id, onClick: () => setOpen((o) => !o) } }
}

/** Панель раскрытия: ребёнок — один блок содержимого. */
export function Expand({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div id={id} className="ds-expand" data-open={open} inert={!open}>
      <div>{children}</div>
    </div>
  )
}

/** Класс знака раскрытия (`Icon name="chevron-down"`): повёрнут, пока открыто. */
export const chevron = (open: boolean) => cx('transition-transform duration-move ease-standard', open && 'rotate-180')
