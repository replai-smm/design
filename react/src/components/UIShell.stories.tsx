import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Information, User } from '../lib/icons.gen'
import { Button } from './Button'
import { CountBadge } from './CountBadge'
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, HeaderName, HeaderPanel, SideNav, SideNavDivider, SideNavItems, SideNavLink, SkipToContent } from './UIShell'

const meta = {
  title: 'Компоненты/Составные/UI Shell',
  component: Header,
  args: { 'aria-label': 'Пример' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Header>
export default meta
type S = StoryObj<typeof meta>

const SECTIONS = ['Входящие', 'Отправленные', 'Отчёты', 'Статус', 'Контакты']

/** Шапка с левой панелью: одна строка на любой ширине; панель постоянна от 1024 px, уже — по кнопке меню поверх страницы. */
function Demo({ menu = false, profile = false, many = false }: { menu?: boolean; profile?: boolean; many?: boolean }) {
  const [side, setSide] = useState(menu)
  const [panel, setPanel] = useState(profile)
  const [active, setActive] = useState(SECTIONS[0])
  const items = many ? [...SECTIONS, 'Архив', 'Шаблоны', 'Интеграции', 'Права', 'Журнал', 'Помощь'] : SECTIONS
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipToContent />
      <Header aria-label="Пример">
        <HeaderMenuButton aria-label={side ? 'Закрыть меню' : 'Меню'} isActive={side} isCollapsible onClick={() => setSide(!side)} />
        <HeaderName href="#home">Пример</HeaderName>
        <Button kind="secondary" size="sm" className="min-w-0 max-w-popup truncate">
          Тестовая организация с длинным названием
        </Button>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Профиль" isActive={panel} onClick={() => setPanel(!panel)}>
            <User />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <HeaderPanel aria-label="Профиль" expanded={panel} onClose={() => setPanel(false)}>
        <p className="m-0 text-heading">Иван Петров</p>
        <p className="m-0 text-body text-fg-muted">Владелец · Тестовая организация</p>
      </HeaderPanel>
      <div className="flex min-h-0 flex-1">
        <SideNav aria-label="Разделы" expanded={side} onOverlayClick={() => setSide(false)}>
          <SideNavItems>
            {items.slice(0, 3).map((name) => (
              <SideNavLink key={name} isActive={active === name} onClick={() => (setActive(name), setSide(false))} renderIcon={Information}>
                {name}
                {name === 'Входящие' && <CountBadge count={12} label="ждут" />}
              </SideNavLink>
            ))}
            <SideNavDivider />
            {items.slice(3).map((name) => (
              <SideNavLink key={name} isActive={active === name} onClick={() => (setActive(name), setSide(false))}>
                {name}
              </SideNavLink>
            ))}
          </SideNavItems>
        </SideNav>
        <main id="main-content" className="min-w-0 flex-1 p-blocks">
          <h1 className="m-0 text-page">{active}</h1>
          <p className="text-body text-fg-muted">Содержимое страницы: рядом с постоянной левой панелью, на узком окне — под шапкой, меню — по кнопке.</p>
        </main>
      </div>
    </div>
  )
}

export const Обычное: S = { render: () => <Demo /> }

/** Меню открыто: на узком окне панель поверх страницы с затемнением, на широком — как обычно. */
export const МенюОткрыто: S = { render: () => <Demo menu /> }

/** Панель профиля открыта кнопкой справа: имя, роль, организация. */
export const ПанельПрофиляОткрыта: S = { render: () => <Demo profile /> }

/** Много пунктов: панель прокручивается, шапка остаётся одной строкой. */
export const Много: S = { render: () => <Demo many menu />, tags: ['state:много'] }
