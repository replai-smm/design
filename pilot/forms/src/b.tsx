import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Accordion, ActionArea, BottomBar, Button, Checkbox, Notification, NumberField, Page, PageHeader, Section, Select, TextField } from '@ds'
import { T } from './content'
import './b.css'

// ?theme=dark|light — тема явно; без него tokens.css сам следует prefers-color-scheme
const theme = new URLSearchParams(location.search).get('theme')
if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme

function App() {
  return (
    <Page header={<PageHeader title={T.title} description={T.description} />} notice={<Notification scope="page" tone="опасно" title={T.error} />}>
      <Section title={T.mail}>
        <TextField type="email" label={T.email} helperText={T.emailHelp} defaultValue={T.emailValue} className="max-w-form" />
        <Checkbox label={T.digest} help={T.digestInfo} defaultChecked />
      </Section>
      <Section title={T.reminders}>
        <NumberField inline label={T.days} unit={T.daysUnit} min={0} defaultValue={3} />
        <NumberField inline label={T.limit} unit={T.limitUnit} helperText={T.limitHelp} min={1} />
        <Select inline label={T.lang} options={T.langs} defaultValue="ru" />
      </Section>
      <div>
        <Accordion title={T.how}>{T.howText}</Accordion>
      </div>
      <BottomBar>
        <ActionArea label="Сохранение" primary={{ label: T.save }}>
          <Button variant="secondary">{T.cancel}</Button>
        </ActionArea>
        <p className="m-0 text-body text-fg-muted">{T.unsaved}</p>
      </BottomBar>
    </Page>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
