import type { StorybookConfig } from '@storybook/react-vite'

/** Истории ДС-React: каждое состояние каждого компонента — своя история с тегом `state:<состояние>` (матрица облика). */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
}

export default config
