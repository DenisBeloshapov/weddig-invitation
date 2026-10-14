import { useEffect, useState } from 'react'

export type Route = 'home' | 'menu'

const parse = (): Route => (window.location.hash.replace(/^#\/?/, '').startsWith('menu') ? 'menu' : 'home')

/** Простая маршрутизация по «#»: ничего не нужно настраивать на сервере. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
