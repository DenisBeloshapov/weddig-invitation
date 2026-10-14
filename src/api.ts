import { SHEET_WEBHOOK_URL } from './config'

export type ChoicePayload = {
  /** кто заполняет форму */
  submittedBy: string
  submittedAt: string
  choices: Array<{
    /** для кого выбор */
    forName: string
    forSelf: boolean
    setId: string
    setLabel: string
    /** выбранное основное блюдо (если в сете есть выбор) */
    main: string
  }>
}

/**
 * Отправка выбора.
 * Пока SHEET_WEBHOOK_URL пуст — это ЗАГЛУШКА: данные никуда не уходят (страница лишь показывает «Спасибо»).
 * Когда подключим Google-таблицу, достаточно будет вписать адрес в src/config.ts.
 */
export async function submitChoices(payload: ChoicePayload): Promise<void> {
  if (!SHEET_WEBHOOK_URL) {
    await new Promise((r) => setTimeout(r, 900))
    return
  }
  const res = await fetch(SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // так Google Apps Script принимает запрос без предварительной проверки (CORS)
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
