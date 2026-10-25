import type { Meta, StoryObj } from '@storybook/react-vite'
import md from '../../../patterns/Disclosures.md?raw'
import { Accordion } from '../components/Accordion'
import { Card } from '../components/Card'
import { Toggletip } from '../components/Toggletip'
import { Section, Stack } from '../components/layout'
import { PatternDoc } from './doc'

function Doc() {
  return (
    <PatternDoc md={md}>
      <Stack gap="groups" className="p-blocks">
        <Section title="Правила экрана — свёрнутой стопкой">
          <div>
            <Accordion title="Как это работает">Баллы приходят в течение минуты после действия.</Accordion>
            <Accordion title="Что не считается">Повторный лайк той же записи и комментарий короче десяти символов.</Accordion>
          </div>
        </Section>
        <Section title="Карточка — три факта на лице, остальное в «подробнее»">
          <Card title="Food Band" status="work.failing" facts={['Комментарии не приходят с 14:20', 'Ключ доступа истёк']} more="Переподключите группу: окно ВКонтакте попросит выдать права заново." />
        </Section>
        <Section title="Объяснение одного поля — «i» у подписи">
          <span className="inline-flex items-center gap-tight text-body text-fg">
            Окно записей
            <Toggletip label="Окно записей">Участвуют только последние N записей сообщества.</Toggletip>
          </span>
        </Section>
      </Stack>
    </PatternDoc>
  )
}

const meta = { title: 'Паттерны/Раскрытие подробностей', component: Doc, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Doc>
export default meta
type S = StoryObj<typeof meta>

export const Обычное: S = {}
