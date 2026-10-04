/**
 * Единственная дверь к axe в тестах ДС-React: прогоны axe строго по одному.
 *
 * axe-core держит один флаг «идёт прогон» на модуль: второй `axe.run`, начатый до конца первого, падает с
 * «Axe is already running». Под нагрузкой (3 ядра, игровой режим) тест упирался в таймаут, vitest шёл к следующему,
 * а прогон из упавшего теста ещё бежал — и дальше каскад «already running» по всем историям. Здесь каждый прогон
 * встаёт в общую очередь и начинается только после конца предыдущего — успешного, упавшего или брошенного тестом
 * по таймауту. Поэтому прогоны не пересекаются физически, как бы ни звали `runAxe`. Прямой `axe.run` в тестах
 * запрещён сторожем в a11y.test.tsx.
 */
import axe from 'axe-core'

let tail: Promise<unknown> = Promise.resolve()

export function runAxe(context: axe.ElementContext, options: axe.RunOptions): Promise<axe.AxeResults> {
  const run = tail.then(() => axe.run(context, options))
  // очередь ждёт конца прогона, но не наследует его ошибку — следующий прогон всё равно начнётся
  tail = run.catch(() => undefined)
  return run
}
