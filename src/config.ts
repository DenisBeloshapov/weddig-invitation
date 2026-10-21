// Страница меню открывается по кнопке «Открыть меню» (адрес вида ваш-сайт/#/menu).
export const MENU_URL = '#/menu'

// Минимальное время показа прелоадера, мс (чтобы он не мигал на быстром интернете).
export const PRELOADER_MIN_MS = 1800

// Адрес веб-приложения Google Apps Script (оканчивается на /exec), куда уходят выбранные сеты.
// Задаётся в Vercel: Settings → Environment Variables → VITE_SHEET_WEBHOOK_URL (затем Redeploy).
// Пока не задан — отправка работает как заглушка.
export const SHEET_WEBHOOK_URL: string = (import.meta.env.VITE_SHEET_WEBHOOK_URL as string | undefined)?.trim() || ''
