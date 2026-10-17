import { useCallback, useState } from 'react'

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
