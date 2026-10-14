// Скачивает картинки из Figma в public/assets.
// Уже лежащие в папке файлы пропускаются, поэтому когда картинки закоммичены в репозиторий,
// сеть и ссылки Figma больше не нужны (ссылки Figma живут всего 7 дней).
// Значение null в манифесте = файл нужно положить в public/assets вручную (экспорт из Figma).
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'assets')
const manifest = JSON.parse(await readFile(path.join(root, 'scripts', 'assets-manifest.json'), 'utf8'))

await mkdir(outDir, { recursive: true })

const exists = async (p) => {
  try { return (await stat(p)).size > 0 } catch { return false }
}

const expired = []
const manual = []
for (const [name, url] of Object.entries(manifest)) {
  const file = path.join(outDir, name)
  if (await exists(file)) continue
  if (!url) { manual.push(name); continue }
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 50) throw new Error('пустой ответ')
    await writeFile(file, buf)
    console.log(`✓ ${name} (${Math.round(buf.length / 1024)} КБ)`)
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`)
    expired.push(name)
  }
}

if (manual.length) {
  console.error(`\nНет файлов, которые нужно добавить в public/assets вручную: ${manual.join(', ')}`)
}
if (expired.length) {
  console.error(
    `\nНе удалось скачать ${expired.length} файл(ов): ссылки Figma действуют 7 дней, срок мог истечь. ` +
      `Нужны свежие ссылки в scripts/assets-manifest.json.\n` +
      `Чтобы это не повторялось, один раз скачайте картинки и закоммитьте папку public/assets.`
  )
}
if (manual.length || expired.length) process.exit(1)
console.log('Все ассеты на месте.')
