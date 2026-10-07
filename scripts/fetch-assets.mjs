// Скачивает картинки из Figma в public/assets.
// Уже скачанные файлы пропускаются, поэтому после первого успешного запуска
// (и коммита папки public/assets) сеть больше не нужна.
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

const missing = []
for (const [name, url] of Object.entries(manifest)) {
  const file = path.join(outDir, name)
  if (await exists(file)) continue
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 50) throw new Error('пустой ответ')
    await writeFile(file, buf)
    console.log(`✓ ${name} (${Math.round(buf.length / 1024)} КБ)`)
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`)
    missing.push(name)
  }
}

if (missing.length) {
  console.error(
    `\nНе удалось скачать ${missing.length} файл(ов). Ссылки Figma действуют 7 дней — ` +
      `возможно, срок истёк. Попросите обновить scripts/assets-manifest.json.`
  )
  process.exit(1)
}
console.log('Все ассеты на месте.')
