/** Путь к файлу из public/assets (учитывает base Vite). */
export const A = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

/** Все картинки страницы — прелоадер ждёт их, прежде чем показать приглашение. */
export const ASSETS = [
  'kiss-1.png', 'kiss-2.png', 'kiss-3.png', 'kiss-4.png', 'heart.png',
  'bg-image18.png', 'field.png', 'sun.png',
  'star.png', 'star-line.png', 'wing-left.png', 'wing-right.png',
  'corner-tl.png', 'corner-tr.png', 'corner-bl.png', 'corner-br.png',
  'cover-top.webp', 'cover-bottom.webp', 'line-top.svg',
  'sep-1.png', 'sep-2.png', 'sep-3.png', 'sep-4.png',
  'bg-grain.png',
]
