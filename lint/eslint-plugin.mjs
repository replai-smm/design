// Правило ESLint «ds/no-raw-values» — тот же сканер, что у cli.mjs (scan.mjs), без своего разбора AST:
// идёт по тексту файла, комментарии закрыты. Подключение в продукте (eslint.config.js, flat config):
//
//   import ds from '@replai-smm/design/lint/eslint-plugin'
//   export default [{ files: ['src/**/*.{ts,tsx,js,jsx}'], plugins: { ds }, rules: { 'ds/no-raw-values': 'error' } }]
//
// Старые нарушения при включении — храповиком (cli.mjs --baseline), а не выключением правила.
import { scan, message } from './scan.mjs'

const rule = {
  meta: {
    type: 'problem',
    docs: { description: 'только роли и шкалы дизайн-системы: без сырых цветов, произвольных значений, палитры и классов вне шкал' },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode ?? context.getSourceCode()
    const filename = context.filename ?? context.getFilename?.() ?? 'x.tsx'
    return {
      Program() {
        for (const f of scan(source.text, filename)) {
          context.report({
            loc: { start: { line: f.line, column: f.column - 1 }, end: { line: f.line, column: f.column - 1 + f.value.length } },
            message: `${f.rule}: ${message(f)}`,
          })
        }
      },
    }
  },
}

export default { meta: { name: 'ds', version: '1.0.0' }, rules: { 'no-raw-values': rule } }
