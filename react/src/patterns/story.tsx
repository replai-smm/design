/**
 * Обвязка истории паттерна: правило (перевод Carbon) сверху, пример снизу. Каждая история паттерна — `pattern(md, Example)`
 * в своём файле `<Имя>.stories.tsx`; полка — «Паттерны/<заголовок правила>» (держит __tests__/patterns.test.ts).
 */
import type { ComponentType } from 'react'
import { PatternDoc } from './doc'

/** Страница паттерна: `page` — пример сам страница со своей областью `main`. */
export function pattern<P extends object>(md: string, Example: ComponentType<P>, page = false) {
  return function Doc(props: P) {
    return (
      <PatternDoc md={md} page={page}>
        <Example {...props} />
      </PatternDoc>
    )
  }
}
