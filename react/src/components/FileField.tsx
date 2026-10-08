/**
 * Выбор файла (Carbon File uploader): подпись над полем, кнопка «Выбрать файл», под ней — выбранные файлы с «убрать»,
 * подсказка с ограничениями (тип, размер) и ошибка словами вместо подсказки — тем же каркасом, что у полей (`FieldShell`).
 * Свой `<input type="file">` в продукте не нужен: он спрятан здесь, видна только кнопка ДС.
 * Файл не того типа или больше `maxSize` не принимается: ошибка называет файл и что не так («можно: PDF, PNG»,
 * «больше 10 МБ»). Управляемый (`value` + `onChange`) и свой (`defaultValue`).
 */
import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { Button, type ButtonVariant, type ButtonSize } from './Button'
import { FieldShell, fieldAria, useFieldIds, type FieldBaseProps } from './TextField'

export interface FileFieldProps extends Omit<FieldBaseProps, 'size'> {
  /** Типы, как у `<input accept>`: `.pdf,.docx`, `image/*`, `application/pdf`. Нет — любой. */
  accept?: string
  /** Слова для типов в подсказке и ошибке («фото», «PDF или Word»). Нет — из `accept`: «PDF, DOCX», «картинки». */
  acceptLabel?: string
  /** Наибольший размер одного файла, байты. */
  maxSize?: number
  /** Несколько файлов. */
  multiple?: boolean
  /** Сколько файлов можно выбрать всего (с `multiple`). */
  maxFiles?: number
  value?: File[]
  defaultValue?: File[]
  onChange?: (files: File[]) => void
  /** Слово кнопки. */
  buttonLabel?: ReactNode
  /** Вид кнопки — тихие варианты (по умолчанию tertiary, как у Carbon). Главная кнопка здесь не бывает. */
  buttonVariant?: Exclude<ButtonVariant, 'danger'>
  size?: ButtonSize
  /** Показать выбранные файлы под кнопкой (по умолчанию да). Нет — продукт показывает их сам (вложение в поле ответа). */
  showFiles?: boolean
  disabled?: boolean
  id?: string
  name?: string
}

export interface FileFieldHandle {
  /** Открыть выбор файла (например, по кнопке в другом месте). */
  open: () => void
}

const KB = 1024
const MB = KB * 1024

/** Размер словами: «850 КБ», «12,3 МБ». */
export function fileSizeText(bytes: number): string {
  const n = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: v < 10 ? 1 : 0 })
  if (bytes >= MB) return `${n(bytes / MB)} МБ`
  if (bytes >= KB) return `${n(bytes / KB)} КБ`
  return `${bytes} Б`
}

const MIME_WORD: Record<string, string> = { 'image/*': 'картинки', 'video/*': 'видео', 'audio/*': 'звук', 'text/*': 'текст' }

/** Типы словами из `accept`: `.pdf,image/*` → «PDF, картинки». */
export function acceptText(accept: string): string {
  return accept
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => MIME_WORD[t] ?? (t.startsWith('.') ? t.slice(1).toUpperCase() : (t.split('/')[1] ?? t).toUpperCase()))
    .join(', ')
}

/** Подходит ли файл под `accept` (по расширению, типу или группе `image/*`). */
export function fileMatches(file: File, accept?: string): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((t) => (t.startsWith('.') ? name.endsWith(t) : t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t))
}

export const FileField = forwardRef<FileFieldHandle, FileFieldProps>(function FileField(
  {
    label,
    hideLabel,
    helperText,
    error,
    className,
    accept,
    acceptLabel,
    maxSize,
    multiple,
    maxFiles,
    value,
    defaultValue,
    onChange,
    buttonLabel,
    buttonVariant = 'tertiary',
    size = 'md',
    showFiles = true,
    disabled,
    id,
    name,
  },
  ref,
) {
  const ids = useFieldIds(id)
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useControllable<File[]>(value, defaultValue ?? [], onChange)
  const [rejected, setRejected] = useState<string | null>(null)
  useImperativeHandle(ref, () => ({ open: () => input.current?.click() }), [])

  const types = accept ? (acceptLabel ?? acceptText(accept)) : null
  const limits = [types && `можно: ${types}`, maxSize && `до ${fileSizeText(maxSize)}`, multiple && maxFiles && `не больше ${maxFiles}`].filter(Boolean).join(' · ')
  const help = helperText ?? (limits ? limits[0].toUpperCase() + limits.slice(1) : undefined)
  const shownError = error ?? rejected

  const pick = (list: FileList | null) => {
    const picked = Array.from(list ?? [])
    if (!picked.length) return
    const problems: string[] = []
    const ok = picked.filter((f) => {
      if (!fileMatches(f, accept)) return problems.push(`«${f.name}» — не тот тип, можно: ${types}`), false
      if (maxSize && f.size > maxSize) return problems.push(`«${f.name}» больше ${fileSizeText(maxSize)} (${fileSizeText(f.size)})`), false
      return true
    })
    let next = multiple ? [...files, ...ok] : ok.slice(0, 1)
    if (multiple && maxFiles && next.length > maxFiles) {
      problems.push(`файлов больше ${maxFiles} — лишние не взяты`)
      next = next.slice(0, maxFiles)
    }
    setRejected(problems.length ? problems.map((p, i) => (i === 0 ? p[0].toUpperCase() + p.slice(1) : p)).join('; ') : null)
    if (ok.length) setFiles(next)
    // тот же файл можно выбрать снова (после «убрать»)
    if (input.current) input.current.value = ''
  }

  const remove = (i: number) => {
    setRejected(null)
    setFiles(files.filter((_, j) => j !== i))
  }

  const btnTextId = `${ids.id}-btn`
  return (
    <FieldShell slot="file-field" ids={ids} label={label} hideLabel={hideLabel} helperText={help} error={shownError} disabled={disabled} className={className}>
      <input
        ref={input}
        id={ids.id}
        name={name}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => pick(e.target.files)}
      />
      <div className="flex">
        <Button
          variant={buttonVariant}
          size={size}
          disabled={disabled}
          onClick={() => input.current?.click()}
          aria-labelledby={`${ids.labelId} ${btnTextId}`}
          aria-describedby={fieldAria(ids, { helperText: help, error: shownError })['aria-describedby']}
          icon={
            <svg viewBox="0 0 16 16" focusable="false" className="size-4">
              <path d="M8 11V2.5M4.5 6 8 2.5 11.5 6M2.5 10.5v3h11v-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
        >
          <span id={btnTextId}>{buttonLabel ?? (multiple ? 'Выбрать файлы' : 'Выбрать файл')}</span>
        </Button>
      </div>
      {showFiles && files.length > 0 && (
        <ul aria-label="Выбранные файлы" className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={cx('flex min-h-8 items-center justify-between gap-2 bg-layer-01 pl-4 text-body-compact-01', disabled ? 'text-text-disabled' : 'text-text-primary')}>
              <span className="min-w-0 truncate">{f.name}</span>
              <span className="flex shrink-0 items-center gap-1">
                <span className="text-label-01 text-text-secondary">{fileSizeText(f.size)}</span>
                <Button variant="ghost" size="sm" disabled={disabled} aria-label={`Убрать «${f.name}»`} onClick={() => remove(i)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4">
                    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  )
})
