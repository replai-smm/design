/**
 * Панель деталей (шаблон CONCEPT §3.4) на Radix Dialog: справа на ноутбуке, снизу на телефоне.
 * Открытая панель — отдельное состояние экрана со своей главной кнопкой (П5): у панели своя поверхность,
 * её `actions` — `<ActionArea>` в нижней полосе панели. Выезд — 0,6 с (ds.css → .ds-drawer), без прыжка страницы.
 */
import type { ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { cx } from '../lib/cx'
import { SurfaceProvider } from './layout'

export interface DrawerProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Кнопка, которая открывает панель (необязательно: строка таблицы открывает панель сама). */
  trigger?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Метка статуса объекта рядом с заголовком. */
  status?: ReactNode
  /** `<ActionArea primary={…}>` — нижняя полоса панели. */
  actions?: ReactNode
  children?: ReactNode
}

export function Drawer({ open, defaultOpen, onOpenChange, trigger, title, description, status, actions, children }: DrawerProps) {
  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="ds-overlay fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          data-slot="drawer"
          className={cx(
            'ds-drawer fixed z-50 flex flex-col bg-layer-01 text-text-primary shadow-raised focus-visible:outline-none',
            'inset-x-0 bottom-0 max-h-11/12',
            'md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md',
          )}
        >
          <SurfaceProvider name="панель">
            <div data-ds-surface="панель" className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-border-subtle-01 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Dialog.Title className="m-0 text-heading-03">{title}</Dialog.Title>
                    {status}
                  </div>
                  {description ? (
                    <Dialog.Description className="m-0 text-body-01 text-text-secondary">{description}</Dialog.Description>
                  ) : null}
                </div>
                <Dialog.Close
                  aria-label="закрыть"
                  className="inline-flex size-12 shrink-0 cursor-pointer items-center justify-center text-icon-primary hover:bg-layer-hover-01 focus-visible:outline-2 focus-visible:outline-focus md:size-10"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Dialog.Close>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">{children}</div>
              {actions && <div className="border-t border-border-subtle-01 p-4">{actions}</div>}
            </div>
          </SurfaceProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
