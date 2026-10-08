import { useEffect } from 'react'

/**
 * Случайная пульсация яркости у звёзд.
 * Все элементы с атрибутом data-twinkle время от времени «вспыхивают» или «притухают»
 * (случайный момент, длительность и сила). Элементы с data-hit дополнительно
 * вспыхивают сильнее при наведении и касании.
 */
export function useTwinkle(active: boolean) {
  useEffect(() => {
    if (!active) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-twinkle]'))
    const busy = new WeakSet<HTMLElement>()
    const timers = new Map<HTMLElement, number>()
    const cleanups: Array<() => void> = []

    const play = (el: HTMLElement, frames: Keyframe[], duration: number) => {
      if (!el.animate || busy.has(el)) return
      busy.add(el)
      const anim = el.animate(frames, { duration, easing: 'ease-in-out' })
      const end = () => busy.delete(el)
      anim.onfinish = end
      anim.oncancel = end
    }

    const soft = (el: HTMLElement) => {
      const duration = 1300 + Math.random() * 2300
      if (Math.random() < 0.4) {
        // яркая вспышка
        play(el, [
          { opacity: 1, filter: 'brightness(1)' },
          { opacity: 1, filter: 'brightness(1.9) drop-shadow(0 0 5px rgba(255, 214, 130, 0.9))', offset: 0.5 },
          { opacity: 1, filter: 'brightness(1)' },
        ], duration)
      } else {
        // мягкое притухание
        const low = 0.18 + Math.random() * 0.4
        play(el, [
          { opacity: 1, filter: 'brightness(1)' },
          { opacity: low, filter: 'brightness(0.8)', offset: 0.5 },
          { opacity: 1, filter: 'brightness(1)' },
        ], duration)
      }
    }

    const loop = (el: HTMLElement, first = false) => {
      const wait = first ? Math.random() * 2500 : 600 + Math.random() * 4200
      timers.set(
        el,
        window.setTimeout(() => {
          soft(el)
          loop(el)
        }, wait)
      )
    }

    const strong = (el: HTMLElement) => {
      if (!el.animate) return
      el.getAnimations().forEach((a) => a.cancel())
      busy.delete(el)
      play(el, [
        { filter: 'brightness(1)', transform: 'scale(1)' },
        { filter: 'brightness(2.4) drop-shadow(0 0 7px rgba(255, 214, 130, 1))', transform: 'scale(1.45)', offset: 0.35 },
        { filter: 'brightness(1)', transform: 'scale(1)' },
      ], 900)
    }

    els.forEach((el) => {
      loop(el, true)
      if (el.hasAttribute('data-hit')) {
        const on = () => strong(el)
        el.addEventListener('pointerenter', on)
        el.addEventListener('pointerdown', on)
        cleanups.push(() => {
          el.removeEventListener('pointerenter', on)
          el.removeEventListener('pointerdown', on)
        })
      }
    })

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      cleanups.forEach((c) => c())
      els.forEach((el) => el.getAnimations?.().forEach((a) => a.cancel()))
    }
  }, [active])
}
