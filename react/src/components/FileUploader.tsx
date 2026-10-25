/**
 * Выбор файла (Carbon: FileUploader, FileUploaderItem): заголовок (`labelTitle`), строка об ограничениях
 * (`labelDescription`: «PDF и картинки, до 10 МБ»), кнопка (`buttonLabel`, вид `buttonKind` — по умолчанию главная, как у
 * Carbon) и выбранные файлы строками. Список ведёт сам компонент (Carbon: неуправляемый): `onAddFiles(event, { addedFiles })`
 * — все взятые, у не подошедших `invalidFileType`; `onChange(event)` — после добавления, `onDelete(event)` — после
 * «убрать»; `ref.clearFiles()` — очистить. Состояние строк — `filenameStatus`: `edit` — «убрать», `uploading` — идёт,
 * `complete` — загружен. Не тот тип (`accept`) или больше `maxFileSize` — файл не взят и стоит строкой с ошибкой.
 */
import { forwardRef, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type HTMLAttributes, type SyntheticEvent } from 'react'
import { cx } from '../lib/cx'
import { Close } from '../lib/icons.gen'
import type { ButtonKind, FilenameStatus, Size } from '../lib/vocab'
import { Button, IconButton } from './Button'
import { Icon } from './Icon'
import { InlineLoading } from './InlineLoading'
import { checkFieldSize } from './TextInput'

type AddedFile = File & { invalidFileType?: boolean }

const KB = 1024
const MB = KB * 1024
/** Размер словами: «850 КБ», «12 МБ». */
const sizeText = (bytes: number) => {
  const n = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: v < 10 ? 1 : 0 })
  return bytes >= MB ? `${n(bytes / MB)} МБ` : bytes >= KB ? `${n(bytes / KB)} КБ` : `${bytes} Б`
}
/** Подходит ли файл под `accept` (расширение, тип или группа `image/*`). */
const matches = (file: File, accept?: string[]) => {
  if (!accept?.length) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return accept.map((t) => t.trim().toLowerCase()).some((t) => (t.startsWith('.') ? name.endsWith(t) : t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t))
}

export interface FileUploaderItemProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name?: string
  /** `edit` — «убрать» · `uploading` — идёт · `complete` — загружен; по умолчанию `uploading` (Carbon). */
  status?: FilenameStatus
  /** Слово кнопки «убрать» и знака для читалки. */
  iconDescription?: string
  onDelete?: (event: SyntheticEvent<HTMLElement>, opts: { uuid: string }) => void
  invalid?: boolean
  /** Что не так: «Файл больше 10 МБ». */
  errorSubject?: string
  /** Что сделать: «Выберите файл меньше и попробуйте снова». */
  errorBody?: string
  size?: Size
  disabled?: boolean
  uuid?: string
}

/** Строка выбранного файла (Carbon: FileUploaderItem): имя и состояние; с ошибкой — что не так и что сделать. */
export function FileUploaderItem({ uuid, name, status = 'uploading', iconDescription, onDelete, invalid, errorSubject, errorBody, size, disabled, className, ...rest }: FileUploaderItemProps) {
  const auto = useId()
  const id = uuid ?? auto
  const errId = `${id}-error`
  return (
    <span
      data-slot="file-uploader-item"
      data-invalid={invalid ? 'true' : undefined}
      className={cx('flex min-w-0 flex-col rounded-control border bg-surface text-body', invalid ? 'border-danger' : 'border-line', disabled ? 'text-fg-disabled' : 'text-fg', className)}
      {...rest}
    >
      <span className={cx('flex items-center justify-between gap-items pl-compact', size === 'sm' ? 'min-h-dense' : size === 'lg' ? 'min-h-touch' : 'min-h-control')}>
        <span className="min-w-0 truncate" title={name}>
          {name}
        </span>
        <span className="flex shrink-0 items-center gap-tight pr-tight">
          {invalid && <Icon tone="опасно" />}
          {status === 'edit' && (
            <IconButton kind="ghost" size="sm" disabled={disabled} label={`${iconDescription ?? 'Убрать файл'}: ${name ?? ''}`} aria-describedby={invalid && errorSubject ? errId : undefined} onClick={(e) => onDelete?.(e, { uuid: id })}>
              <Close />
            </IconButton>
          )}
          {status === 'uploading' && <InlineLoading status="active" iconDescription={iconDescription ?? 'Загружается'} />}
          {status === 'complete' && <Icon tone="хорошо" label={iconDescription ?? 'Загружен'} />}
        </span>
      </span>
      {invalid && errorSubject && (
        <span id={errId} className="flex flex-col gap-tight border-t border-line px-compact py-items text-caption">
          <span className="text-danger-fg">{errorSubject}</span>
          {errorBody && <span className="text-fg-muted">{errorBody}</span>}
        </span>
      )}
    </span>
  )
}

export interface FileUploaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onClick' | 'children'> {
  /** Типы, как у `<input accept>`: `['.pdf', 'image/*']`. Нет — любой. */
  accept?: string[]
  /** Вид кнопки; по умолчанию `primary` (Carbon) — рядом с другой главной ставьте `tertiary` или `secondary`. */
  buttonKind?: ButtonKind
  /** Слово кнопки; по умолчанию «Добавить файл». */
  buttonLabel?: string
  disabled?: boolean
  /** Состояние строк выбранных файлов. */
  filenameStatus: FilenameStatus
  /** Слово кнопки «убрать» и знака состояния для читалки. */
  iconDescription?: string
  /** Строка об ограничениях под заголовком. */
  labelDescription?: string
  /** Заголовок поля. */
  labelTitle?: string
  /** Наибольший размер одного файла, байты. */
  maxFileSize?: number
  multiple?: boolean
  name?: string
  onAddFiles?: (event: SyntheticEvent<HTMLElement>, content: { addedFiles: AddedFile[] }) => void
  onChange?: (event: SyntheticEvent<HTMLElement>) => void
  onDelete?: (event: SyntheticEvent<HTMLElement>) => void
  size?: Size
}

export interface FileUploaderHandle {
  /** Убрать все выбранные файлы. */
  clearFiles: () => void
}

interface Row {
  uuid: string
  file: AddedFile
  /** Почему не взят. */
  reason?: string
}

/** Выбор файла (Carbon: FileUploader). */
export const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(function FileUploader(
  { accept, buttonKind = 'primary', buttonLabel = 'Добавить файл', disabled, filenameStatus, iconDescription, labelDescription, labelTitle, maxFileSize, multiple, name, onAddFiles, onChange, onDelete, size, className, ...rest },
  ref,
) {
  checkFieldSize(size)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const input = useRef<HTMLInputElement>(null)
  const button = useRef<HTMLButtonElement & HTMLAnchorElement>(null)
  const [rows, setRows] = useState<Row[]>([])
  const seq = useRef(0)
  useImperativeHandle(ref, () => ({ clearFiles: () => setRows([]) }), [])

  const titleId = `ds-file-${uid}-title`
  const descId = `ds-file-${uid}-desc`
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const incoming = Array.from(e.target.files ?? []) as AddedFile[]
    const picked = multiple ? incoming : incoming.slice(0, 1)
    if (!picked.length) return
    const checked = picked.map((file) => {
      const reason = !matches(file, accept) ? 'Не тот тип файла' : maxFileSize && file.size > maxFileSize ? `Файл больше ${sizeText(maxFileSize)}` : undefined
      if (reason) file.invalidFileType = true
      return { uuid: `${uid}-${seq.current++}`, file, reason }
    })
    onAddFiles?.(e, { addedFiles: checked.map((r) => r.file) })
    setRows((prev) => {
      const kept = multiple ? prev.filter((r) => !r.reason) : []
      const names = new Set(kept.map((r) => r.file.name))
      return [...kept, ...checked.filter((r) => r.reason || !names.has(r.file.name))]
    })
    if (checked.some((r) => !r.reason)) onChange?.(e)
    // тот же файл можно выбрать снова (после «убрать»)
    e.target.value = ''
  }
  const remove = (e: SyntheticEvent<HTMLElement>, uuid: string) => {
    const row = rows.find((r) => r.uuid === uuid)
    setRows((prev) => prev.filter((r) => r.uuid !== uuid))
    if (row && !row.reason) onDelete?.(e)
    button.current?.focus()
  }

  return (
    <div data-slot="file-uploader" className={cx('flex min-w-0 flex-col gap-items', className)} {...rest}>
      {(labelTitle || labelDescription) && (
        <div className="flex min-w-0 flex-col gap-tight">
          {labelTitle && (
            <p id={titleId} className={cx('m-0 text-heading', disabled ? 'text-fg-disabled' : 'text-fg')}>
              {labelTitle}
            </p>
          )}
          {labelDescription && (
            <p id={descId} className={cx('m-0 text-body', disabled ? 'text-fg-disabled' : 'text-fg-muted')}>
              {labelDescription}
            </p>
          )}
        </div>
      )}
      <input ref={input} name={name} type="file" hidden tabIndex={-1} accept={accept?.join(',')} multiple={multiple} disabled={disabled} onChange={pick} />
      <div className="flex">
        <Button
          ref={button}
          kind={buttonKind}
          size={size}
          disabled={disabled}
          onClick={() => input.current?.click()}
          aria-describedby={labelDescription ? descId : undefined}
          aria-labelledby={labelTitle ? `${titleId} ${titleId}-btn` : undefined}
        >
          <span id={`${titleId}-btn`}>{buttonLabel}</span>
        </Button>
      </div>
      {rows.length > 0 && (
        <ul aria-label={labelTitle ? `${labelTitle}: выбранные файлы` : 'Выбранные файлы'} className="m-0 flex list-none flex-col gap-tight p-0">
          {rows.map((r) => (
            <li key={r.uuid} className="min-w-0">
              <FileUploaderItem
                uuid={r.uuid}
                name={r.file.name}
                status={r.reason ? 'edit' : filenameStatus}
                iconDescription={iconDescription}
                size={size}
                disabled={disabled}
                invalid={Boolean(r.reason)}
                errorSubject={r.reason}
                errorBody={r.reason ? (labelDescription ?? 'Выберите другой файл.') : undefined}
                onDelete={(e) => remove(e, r.uuid)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
