import { useEffect, useRef, useState } from 'react'
import { A, ASSETS } from './assets'
import { PRELOADER_MIN_MS } from './config'

const MAX_MS = 15000 // страховка: если что-то не загрузилось, всё равно открываем страницу

type Props = { onReady: () => void; leaving: boolean }

/** Четырёхконечная звезда — та же форма, что в оформлении приглашения. */
const STAR_PATH =
  'M0,-34 C2.6,-9 9,-2.6 34,0 C9,2.6 2.6,9 0,34 C-2.6,9 -9,2.6 -34,0 C-9,-2.6 -2.6,-9 0,-34Z'

const RAYS = Array.from({ length: 24 }, (_, i) => ({ a: i * 15, long: i % 2 === 0 }))
const ORBIT = [45, 135, 225, 315]

function Emblem() {
  return (
    <svg className="pl-emblem" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="pl-gold" x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor="#f8e2a4" />
          <stop offset="0.55" stopColor="#d9b259" />
          <stop offset="1" stopColor="#b08430" />
        </linearGradient>
        <filter id="pl-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="pl-star" d={STAR_PATH} />
      </defs>

      {/* лучи солнца */}
      <g className="pl-rays">
        {RAYS.map((r) => (
          <line
            key={r.a}
            x1="0" y1="-62" x2="0" y2={r.long ? -80 : -71}
            transform={`rotate(${r.a})`}
            stroke={r.long ? '#f0d58a' : '#d9b259'}
            strokeWidth={r.long ? 1.5 : 1}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* кольца-«арка» */}
      <circle className="pl-ring pl-ring-a" r="56" fill="none" stroke="#d9b259" strokeWidth="0.8" strokeDasharray="1.5 5" />
      <circle className="pl-ring pl-ring-b" r="47" fill="none" stroke="#d9b259" strokeWidth="0.6" opacity="0.55" />

      {/* малые звёздочки по кругу */}
      {ORBIT.map((deg, i) => (
        <g key={deg} transform={`rotate(${deg}) translate(0 -52) rotate(${-deg}) scale(0.2)`}>
          <use className="pl-spark" href="#pl-star" fill="url(#pl-gold)" style={{ animationDelay: `${i * 0.45}s` }} />
        </g>
      ))}

      {/* главная звезда */}
      <g className="pl-star" filter="url(#pl-glow)">
        <use href="#pl-star" fill="url(#pl-gold)" transform="scale(0.95)" />
      </g>
    </svg>
  )
}

export default function Preloader({ onReady, leaving }: Props) {
  const total = ASSETS.length
  const [loaded, setLoaded] = useState(0)
  const [fontsOk, setFontsOk] = useState(false)
  const [minOk, setMinOk] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    let alive = true
    let done = 0
    const bump = () => {
      done += 1
      if (alive) setLoaded(done)
    }
    ASSETS.forEach((name) => {
      const img = new Image()
      img.onload = bump
      img.onerror = bump // битый файл не должен вешать прелоадер
      img.src = A(name)
    })

    const fonts = document.fonts
    Promise.all([
      fonts.load('66px "Great Vibes"', 'ДенисАлиса&'),
      fonts.load('14px "Playfair Display"', 'Детали05.01.2027'),
      fonts.load('24px "Playfair Display"', 'Детали'),
    ])
      .catch(() => undefined)
      .then(() => alive && setFontsOk(true))

    const t1 = window.setTimeout(() => alive && setMinOk(true), PRELOADER_MIN_MS)
    const t2 = window.setTimeout(() => {
      if (!alive) return
      setLoaded(total)
      setFontsOk(true)
      setMinOk(true)
    }, MAX_MS)

    return () => {
      alive = false
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [total])

  useEffect(() => {
    if (!fired.current && loaded >= total && fontsOk && minOk) {
      fired.current = true
      onReady()
    }
  }, [loaded, total, fontsOk, minOk, onReady])

  const p = total ? Math.min(1, loaded / total) : 1

  return (
    <div className={`pl${leaving ? ' leaving' : ''}`} role="status" aria-live="polite" aria-label="Загрузка приглашения">
      <div className="pl-glow" />
      <div className="pl-content">
        <Emblem />
        <p className={`pl-names gv${fontsOk ? ' show' : ''}`}>
          Денис <span>&amp;</span> Алиса
        </p>
        <p className={`pl-date pf${fontsOk ? ' show' : ''}`}>05.01.2027</p>
        <div className="pl-bar">
          <i style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>
    </div>
  )
}
