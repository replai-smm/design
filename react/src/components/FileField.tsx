/**
 * Выбор файла: подпись, тихая кнопка «Выбрать файл», выбранные файлы с размером и «убрать», ограничения словами в
 * подсказке («Можно: PDF, картинки · до 10 МБ»). Не тот тип или больше `maxSize` — файл не взят, ошибка называет файл
 * и причину. Свой `<input type="file">` в продукте не нужен. `showFiles={false}` — список показывает продукт
 * (вложение в поле ответа); `ref.open()` — открыть выбор из другого места.
 */
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useControllable } from '../lib/controllable'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { FieldShell, fieldAria, useFieldIds, type FieldBaseProps } from './TextField'

export interface FileFieldProps extends Omit<FieldBaseProps, 'dense'> {
  /** Типы, как у `<input accept>`: `.pdf,.docx`, `image/*`. Нет — любой. */
  accept?: string
  /** Наибольший размер одного файла, байты. */
  maxSize?: number
  multiple?: boolean
  value?: File[]
  defaultValue?: File[]
  onChange?: (files: File[]) => void
  /** Показать выбранные файлы под кнопкой (по умолчанию да). */
  showFiles?: boolean
  disabled?: boolean
  id?: string
  name?: string
}

export interface FileFieldHandle {
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

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1)

export const FileField = forwardRef<FileFieldHandle, FileFieldProps>(function FileField(
  { label, hideLabel, helperText, error, className, accept, maxSize, multiple, value, defaultValue, onChange, showFiles = true, disabled, id, name },
  ref,
) {
  const ids = useFieldIds(id)
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useControllable<File[]>(value, defaultValue ?? [], onChange)
  const [rejected, setRejected] = useState<string | null>(null)
  useImperativeHandle(ref, () => ({ open: () => input.current?.click() }), [])

  const types = accept ? acceptText(accept) : null
  const limits = [types && `можно: ${types}`, maxSize && `до ${fileSizeText(maxSize)}`].filter(Boolean).join(' · ')
  const help = helperText ?? (limits ? cap(limits) : undefined)
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
    setRejected(problems.length ? cap(problems.join('; ')) : null)
    if (ok.length) setFiles(multiple ? [...files, ...ok] : ok.slice(0, 1))
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
      <input ref={input} id={ids.id} name={name} type="file" hidden accept={accept} multiple={multiple} disabled={disabled} onChange={(e) => pick(e.target.files)} />
      <div className="flex">
        <Button
          icon="upload"
          disabled={disabled}
          onClick={() => input.current?.click()}
          aria-labelledby={`${ids.labelId} ${btnTextId}`}
          aria-describedby={fieldAria(ids, { helperText: help, error: shownError })['aria-describedby']}
        >
          <span id={btnTextId}>{multiple ? 'Выбрать файлы' : 'Выбрать файл'}</span>
        </Button>
      </div>
      {showFiles && files.length > 0 && (
        <ul aria-label="Выбранные файлы" className="m-0 flex list-none flex-col gap-tight p-0">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={cx('flex min-h-dense items-center justify-between gap-items rounded-control border border-line bg-surface pl-compact text-body', disabled ? 'text-fg-disabled' : 'text-fg')}>
              <span className="min-w-0 truncate">{f.name}</span>
              <span className="flex shrink-0 items-center gap-tight">
                <span className="text-caption text-fg-muted">{fileSizeText(f.size)}</span>
                <Button variant="ghost" dense icon="close" disabled={disabled} aria-label={`Убрать «${f.name}»`} onClick={() => remove(i)} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  )
})
