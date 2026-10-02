/** Все истории пакета — для тестов a11y, правил и образцов. Тема — глобал `theme`, как у Storybook и съёмки П7. */
import { composeStories } from '@storybook/react-vite'

type Mod = Record<string, any> & { default: { title: string; tags?: string[] } }
const mods = import.meta.glob<Mod>('../components/*.stories.tsx', { eager: true })

export type Theme = 'light' | 'dark'
export interface Entry {
  file: string
  title: string
  name: string
  tags: string[]
  Story: any
}

export const STORY_FILES = Object.keys(mods).map((p) => p.replace('../components/', ''))

export function stories(theme: Theme = 'light'): Entry[] {
  return Object.entries(mods).flatMap(([path, mod]) => {
    const composed = composeStories(mod as any, { initialGlobals: { theme } } as any) as Record<string, any>
    return Object.entries(composed).map(([name, Story]) => ({
      file: path.replace('../components/', ''),
      title: mod.default.title,
      name,
      tags: [...(mod.default.tags ?? []), ...((mod as any)[name]?.tags ?? [])],
      Story,
    }))
  })
}

/** Состояние истории по тегу `state:<состояние>`; без тега — «обычное» (как у задачи скриншотов П7). */
export const stateOf = (e: Entry) => e.tags.find((t) => t.startsWith('state:'))?.slice(6) ?? 'обычное'
