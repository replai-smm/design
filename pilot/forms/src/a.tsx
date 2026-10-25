import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Accordion, AccordionItem, Button, Checkbox, GlobalTheme, InlineNotification, NumberInput, Select, SelectItem, Stack, TextInput, Theme, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react'
import { Information } from '@carbon/icons-react'
import { T } from './content'
import './a.css'
import './carbon-layered.scss'

function useMedia(query: string) {
  const [on, setOn] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const change = () => setOn(mq.matches)
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [query])
  return on
}

const steps = (id: string) => ({ 'increment.number': 'увеличить', 'decrement.number': 'уменьшить' })[id] ?? id

function App() {
  // ?theme=dark|light — тема явно; без него — как в системе
  const forced = new URLSearchParams(location.search).get('theme')
  const systemDark = useMedia('(prefers-color-scheme: dark)')
  const theme = (forced ? forced === 'dark' : systemDark) ? 'g100' : 'g10'
  // телефон: контролы 48 (Carbon size="lg"), шире — 40 (md)
  const size = useMedia('(max-width: 47.98rem)') ? 'lg' : 'md'
  return (
    <GlobalTheme theme={theme}>
      <Theme theme={theme} className="min-h-dvh">
        <div className="app mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 md:px-8">
          <header className="flex flex-col gap-1">
            <h1 className="page-title">{T.title}</h1>
            <p className="page-description">{T.description}</p>
          </header>
          <main className="flex flex-col gap-6 pb-8">
            <InlineNotification kind="error" lowContrast hideCloseButton title={T.error} />
            <section>
              <Stack gap={5}>
                <h2 className="section-title">{T.mail}</h2>
                <div className="max-w-md">
                  <TextInput id="email" type="email" size={size} labelText={T.email} helperText={T.emailHelp} defaultValue={T.emailValue} />
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox id="digest" className="flex-none" labelText={T.digest} defaultChecked />
                  <Toggletip align="bottom-left">
                    <ToggletipButton label={`Подробнее: ${T.digest}`}>
                      <Information />
                    </ToggletipButton>
                    <ToggletipContent>
                      <p>{T.digestInfo}</p>
                    </ToggletipContent>
                  </Toggletip>
                </div>
              </Stack>
            </section>
            <section>
              <Stack gap={5}>
                <h2 className="section-title">{T.reminders}</h2>
                <div className="setting">
                  <NumberInput id="days" size={size} label={T.days} translateWithId={steps} min={0} defaultValue={3} />
                  <span className="unit">{T.daysUnit}</span>
                </div>
                <div className="setting">
                  <NumberInput id="limit" size={size} label={T.limit} translateWithId={steps} helperText={T.limitHelp} min={1} allowEmpty defaultValue="" />
                  <span className="unit">{T.limitUnit}</span>
                </div>
                <div className="setting">
                  <Select id="lang" size={size} labelText={T.lang} defaultValue="ru">
                    {T.langs.map((l) => (
                      <SelectItem key={l.value} value={l.value} text={l.label} />
                    ))}
                  </Select>
                </div>
              </Stack>
            </section>
            <Accordion size={size}>
              <AccordionItem title={T.how}>
                <p>{T.howText}</p>
              </AccordionItem>
            </Accordion>
            <div className="bottom-bar sticky bottom-0 z-10 flex flex-col gap-3 px-4 pt-3 pb-3 md:flex-row md:items-center md:gap-4">
              <div className="flex gap-2 max-md:[&>*]:flex-1" role="group" aria-label="Сохранение">
                <Button kind="secondary" size={size}>
                  {T.cancel}
                </Button>
                <Button kind="primary" size={size}>
                  {T.save}
                </Button>
              </div>
              <p className="bar-text">{T.unsaved}</p>
            </div>
          </main>
        </div>
      </Theme>
    </GlobalTheme>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
