import { createContext, useCallback, useContext, useState } from 'react'

/**
 * Значение «управляемое или своё»: передали `value` — компонент показывает его и зовёт `onChange`; не передали —
 * держит своё, начиная с `defaultValue`. `null` — управляемое «пусто», а не «своё».
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (v: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue)
  const controlled = value !== undefined
  const set = useCallback(
    (v: T) => {
      if (!controlled) setInner(v)
      onChange?.(v)
    },
    [controlled, onChange],
  )
  return [controlled ? (value as T) : inner, set]
}

/**
 * Слой поверхности (Carbon Layer): поле на странице — `field-01`, поле в окне или панели (они сами — слой 01) —
 * `field-02`, чтобы поле не сливалось с фоном. Окно и панель ставят слой 2 сами.
 */
export type Layer = 1 | 2
export const LayerContext = createContext<Layer>(1)
export const useLayer = () => useContext(LayerContext)
