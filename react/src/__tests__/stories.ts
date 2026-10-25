/** Все истории пакета — для тестов a11y, правил и образцов. Тема — глобал `theme`, как у Storybook и съёмки облика. */
import { composeStories } from '@storybook/react-vite'

type Mod = Record<string, any> & { default: { title: string; tags?: string[] } }
const mods = import.meta.glob<Mod>(['../components/*.stories.tsx', '../patterns/*.stories.tsx'], { eager: true })

export type Theme = 'light' | 'dark'
export interface Entry {
  file: string
  title: string
  name: string
  tags: string[]
  Story: any
}

/** Файл историй: `Button.stories.tsx` у компонента, `patterns/Forms.stories.tsx` у паттерна. */
const fileOf = (p: string) => p.replace('../components/', '').replace('../', '')
export const STORY_FILES = Object.keys(mods).map(fileOf)

export function stories(theme: Theme = 'light'): Entry[] {
  return Object.entries(mods).flatMap(([path, mod]) => {
    const composed = composeStories(mod as any, { initialGlobals: { theme } } as any) as Record<string, any>
    return Object.entries(composed).map(([name, Story]) => ({
      file: fileOf(path),
      title: mod.default.title,
      name,
      tags: [...(mod.default.tags ?? []), ...((mod as any)[name]?.tags ?? [])],
      Story,
    }))
  })
}

/** Состояние истории по тегу `state:<состояние>`; без тега — «обычное» (как у съёмки облика). */
export const stateOf = (e: Entry) => e.tags.find((t) => t.startsWith('state:'))?.slice(6) ?? 'обычное'
