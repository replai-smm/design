// Сравнение двух снимков PNG: сколько пикселей отличается (pixelmatch, порог цвета 0,1) и картинка разницы.
// Размер разный — отличаются все пиксели большего: сдвиг высоты страницы — тоже изменение облика.
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

export function compare(a, b) {
  const A = PNG.sync.read(a)
  const B = PNG.sync.read(b)
  if (A.width !== B.width || A.height !== B.height) return { pixels: Math.max(A.width * A.height, B.width * B.height), size: `${A.width}×${A.height} → ${B.width}×${B.height}` }
  const diff = new PNG({ width: A.width, height: A.height })
  const pixels = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.1 })
  return { pixels, diff: PNG.sync.write(diff) }
}
