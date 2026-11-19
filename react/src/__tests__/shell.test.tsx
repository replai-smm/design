/** Оболочка продукта (Carbon: UI Shell): шапка, левая панель, правая панель, пункты, «перейти к содержимому». */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, HeaderName, HeaderPanel, SideNav, SideNavDivider, SideNavItems, SideNavLink, SkipToContent } from '../index'
import { User as UserIcon } from '../lib/icons.gen'

describe('шапка', () => {
  it('ориентир banner с именем; одна строка 48 px, липкая', () => {
    render(<Header aria-label="Продукт">содержимое</Header>)
    const h = screen.getByRole('banner', { name: 'Продукт' })
    expect(h.className).toContain('h-touch')
    expect(h.className).toContain('sticky')
  })

  it('кнопка меню: имя, aria-expanded, прячется от lg, если панель постоянна', () => {
    const onClick = vi.fn()
    const { rerender } = render(<HeaderMenuButton aria-label="Меню" isCollapsible onClick={onClick} />)
    const b = screen.getByRole('button', { name: 'Меню' })
    expect(b.getAttribute('aria-expanded')).toBe('false')
    expect(b.className).toContain('lg:hidden')
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(<HeaderMenuButton aria-label="Закрыть меню" isActive onClick={onClick} />)
    expect(screen.getByRole('button', { name: 'Закрыть меню' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('название: с href — ссылка на главную, без него — действие', () => {
    const onClick = vi.fn()
    const { rerender } = render(<HeaderName href="/main" prefix="Мой">Продукт</HeaderName>)
    expect(screen.getByRole('link', { name: /Мой\s*Продукт/ }).getAttribute('href')).toBe('/main')
    rerender(<HeaderName onClick={onClick}>Продукт</HeaderName>)
    fireEvent.click(screen.getByRole('button', { name: 'Продукт' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('системная кнопка: имя и «нажата», открывает панель, а не ведёт в раздел', () => {
    render(
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Профиль" isActive>
          <UserIcon />
        </HeaderGlobalAction>
      </HeaderGlobalBar>,
    )
    const b = screen.getByRole('button', { name: 'Профиль' })
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(b.className).toContain('bg-selected')
  })

  it('правая панель: закрытой в странице нет; Esc закрывает через onClose', () => {
    const onClose = vi.fn()
    const { rerender } = render(<HeaderPanel aria-label="Профиль" onClose={onClose}>тело</HeaderPanel>)
    expect(screen.queryByRole('region', { name: 'Профиль' })).toBeNull()
    rerender(
      <HeaderPanel aria-label="Профиль" expanded onClose={onClose}>
        тело
      </HeaderPanel>,
    )
    const panel = screen.getByRole('region', { name: 'Профиль' })
    expect(panel.textContent).toContain('тело')
    fireEvent.keyDown(panel, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('левая панель', () => {
  it('закрытая на узком — скрыта, от lg — постоянная; открытая — поверх страницы с затемнением, клик по нему и Esc закрывают', () => {
    const close = vi.fn()
    const { rerender, container } = render(
      <SideNav aria-label="Разделы" onOverlayClick={close}>
        <SideNavItems>
          <SideNavLink onClick={() => {}}>Раздел</SideNavLink>
        </SideNavItems>
      </SideNav>,
    )
    const nav = container.querySelector('[data-slot=side-nav]') as HTMLElement
    expect(nav.className).toContain('hidden')
    expect(nav.className).toContain('lg:flex')
    expect(nav.className).toContain('lg:self-stretch')
    expect(container.querySelector('[data-slot=side-nav-overlay]')).toBeNull()
    rerender(
      <SideNav aria-label="Разделы" expanded onOverlayClick={close}>
        <SideNavItems>
          <SideNavLink onClick={() => {}}>Раздел</SideNavLink>
        </SideNavItems>
      </SideNav>,
    )
    expect(nav.className).toContain('fixed')
    const overlay = container.querySelector('[data-slot=side-nav-overlay]') as HTMLElement
    fireEvent.click(overlay)
    expect(close).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Разделы' }), { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(2)
  })

  it('пункт: href — ссылка, без него — кнопка; открытый — aria-current="page"; разделитель — separator', () => {
    const onClick = vi.fn()
    render(
      <SideNav aria-label="Разделы" expanded>
        <SideNavItems>
          <SideNavLink href="#a" isActive>
            Первый
          </SideNavLink>
          <SideNavLink onClick={onClick}>Второй</SideNavLink>
          <SideNavDivider />
        </SideNavItems>
      </SideNav>,
    )
    const first = screen.getByRole('link', { name: 'Первый' })
    expect(first.getAttribute('aria-current')).toBe('page')
    expect(first.className).toContain('bg-selected')
    const second = screen.getByRole('button', { name: 'Второй' })
    expect(second.hasAttribute('aria-current')).toBe(false)
    fireEvent.click(second)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-slot=side-nav-divider]')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('левая панель поверх страницы — как окно', () => {
  function Shell({ open }: { open: boolean }) {
    return (
      <>
        <button type="button">Меню</button>
        <SideNav aria-label="Разделы" expanded={open}>
          <SideNavItems>
            <SideNavLink onClick={() => {}}>Первый</SideNavLink>
            <SideNavLink onClick={() => {}}>Второй</SideNavLink>
          </SideNavItems>
        </SideNav>
      </>
    )
  }

  it('открылась — фокус на первом пункте, Tab по кругу внутри; закрылась — фокус обратно на кнопке', () => {
    const { rerender } = render(<Shell open={false} />)
    const menu = screen.getByRole('button', { name: 'Меню' })
    menu.focus()
    rerender(<Shell open />)
    const first = screen.getByRole('button', { name: 'Первый' })
    const second = screen.getByRole('button', { name: 'Второй' })
    expect(document.activeElement).toBe(first)
    second.focus()
    fireEvent.keyDown(second, { key: 'Tab' })
    expect(document.activeElement, 'наживка: Tab с последнего пункта не уходит из панели').toBe(first)
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(second)
    rerender(<Shell open={false} />)
    expect(document.activeElement).toBe(menu)
  })
})

describe('перейти к содержимому', () => {
  it('переводит фокус на содержимое и не меняет адрес — годится для роутера на хэше', () => {
    window.location.hash = '#/admin'
    render(
      <>
        <SkipToContent />
        <main id="main-content">содержимое</main>
      </>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Перейти к основному содержимому' }))
    expect(window.location.hash, 'наживка: адрес остался маршрутом').toBe('#/admin')
    expect(document.activeElement).toBe(screen.getByRole('main'))
  })

  it('первая ссылка страницы: по умолчанию на #main-content, видна только по фокусу', () => {
    render(<SkipToContent />)
    const a = screen.getByRole('link', { name: 'Перейти к основному содержимому' })
    expect(a.getAttribute('href')).toBe('#main-content')
    expect(a.className).toContain('sr-only')
    expect(a.className).toContain('focus:not-sr-only')
  })
})
