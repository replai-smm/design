/**
 * Склеить классы. Без tailwind-merge нарочно: он не знает наборов текста Carbon (text-body-01) и молча выкидывает
 * цвет текста рядом с ними. Классы компонентов не спорят друг с другом — склеиваем как есть.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** В разработке правило API нарушено — бросить ошибку с понятной фразой; в сборке — промолчать. */
export const DEV: boolean = import.meta.env?.DEV ?? true

export function rule(ok: boolean, message: string): void {
  if (!ok && DEV) throw new Error(`ДС-React: ${message}`)
}
