// jsdom не знает matchMedia и ResizeObserver, а Radix их зовёт.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

if (!window.matchMedia)
  window.matchMedia = (q: string) =>
    ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList
if (!('ResizeObserver' in window))
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

// истории в тестах — с теми же декораторами, что в Storybook (тема)
import { setProjectAnnotations } from '@storybook/react-vite'
import * as preview from '../../.storybook/preview'
setProjectAnnotations(preview)
