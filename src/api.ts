import { SHEET_WEBHOOK_URL } from './config'

export type ChoicePayload = {
  /** постоянный номер заявки в этом браузере: повторная отправка заменяет прежние строки, а не дублирует */
  submissionId: string
  /** кто заполняет форму */
  submittedBy: string
  submittedAt: string
  choices: Array<{
    /** для кого выбор */
    forName: string
    forSelf: boolean
    setId: string
    /** для страницы: «Western Set Dinner — Menu A» */
    setLabel: string
    /** для таблицы: «Western» / «Thai» и «A» / «B» / «C» */
    cuisine: string
    menu: string
    /** выбранное основное блюдо (если в сете есть выбор) */
    main: string
  }>
}

/** true, пока адрес таблицы не подключён: отправка — заглушка, данные никуда не уходят. */
export const DEMO_MODE = !SHEET_WEBHOOK_URL

/**
 * Отправка выбора в Google-таблицу (через Google Apps Script, см. apps-script/Code.gs).
 * Бросает ошибку, если сервер не подтвердил запись: тогда страница покажет «Не получилось отправить».
 */
export async function submitChoices(payload: ChoicePayload): Promise<void> {
  if (!SHEET_WEBHOOK_URL) {
    console.warn('SHEET_WEBHOOK_URL не задан: выбор не отправляется (тестовый режим).')
    await new Promise((r) => setTimeout(r, 900))
    return
  }
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      // text/plain: так Google Apps Script принимает запрос из браузера без предварительной CORS-проверки
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const out = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (!out?.ok) throw new Error(out?.error || 'Сервер не подтвердил запись')
  } finally {
    window.clearTimeout(timer)
  }
}
