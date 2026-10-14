import { useEffect, useRef, useState } from 'react'
import Invitation from './Invitation'
import MenuPage from './MenuPage'
import { useHashRoute } from './router'
import type { Route } from './router'

/**
 * Две страницы на одном адресе: приглашение (/) и меню (/#/menu).
 * Приглашение остаётся в памяти (скрыто), поэтому при возврате оно не загружается заново,
 * а прокрутка возвращается на то место, где была кнопка «ОТКРЫТЬ МЕНЮ».
 */
export default function App() {
  const route = useHashRoute()
  const [shown, setShown] = useState<Route>(route)
  const [out, setOut] = useState(false)
  const homeScroll = useRef(0)

  useEffect(() => {
    if (route === shown) return
    setOut(true) // текущая страница плавно гаснет
    const t = window.setTimeout(() => {
      if (shown === 'home') homeScroll.current = window.scrollY
      setShown(route)
      setOut(false)
    }, 320)
    return () => window.clearTimeout(t)
  }, [route, shown])

  // вернулись на приглашение — на то же место
  useEffect(() => {
    if (shown === 'home') window.scrollTo(0, homeScroll.current)
  }, [shown])

  return (
    <div className={`view${out ? ' out' : ' in'}`}>
      <Invitation visible={shown === 'home'} menuRoute={shown === 'menu'} />
      {shown === 'menu' && <MenuPage />}
    </div>
  )
}
