import { useEffect, useLayoutEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { MENU_URL } from './config'

/* Все координаты — из Figma (кадр 430×2505, node 4084:179). */

const A = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

type BoxProps = { style?: CSSProperties; className?: string; children?: ReactNode }

const Abs = ({ style, className, children }: BoxProps) => (
  <div className={className} style={{ position: 'absolute', ...style }}>
    {children}
  </div>
)

/** Блок с центрированием + внутренняя обёртка с transform (как flex-none rotate-… в макете). */
const Tf = ({ style, tf, children }: BoxProps & { tf: string }) => (
  <Abs style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    <div style={{ flex: 'none', transform: tf }}>{children}</div>
  </Abs>
)

/** Часть спрайта внутри обрезающего контейнера (как в макете: overflow-hidden + смещённая картинка). */
type CropSpec = { h: string; l: string; t: string; w: string }
const STAR: CropSpec = { h: '1570.97%', l: '-2561.82%', t: '-535.48%', w: '2701.82%' }
const SPARK: CropSpec = { h: '2117.39%', l: '-4114.29%', t: '-504.35%', w: '4245.71%' }
const LINE_STAR: CropSpec = { h: '1708.77%', l: '-2229.09%', t: '-217.54%', w: '2701.82%' }

const Crop = ({ src, c, radius }: { src: string; c: CropSpec; radius?: number }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      borderRadius: radius,
    }}
  >
    <img
      alt=""
      src={src}
      style={{ position: 'absolute', height: c.h, left: c.l, top: c.t, width: c.w }}
    />
  </div>
)

/* ---------- Мелкие декоративные элементы ---------- */

const Star = ({ x, y }: { x: number; y: number }) => (
  <Abs style={{ left: x, top: y, width: 16.855, height: 19 }}>
    <Abs style={{ inset: 0, filter: 'blur(4.5px)' }}>
      <Crop src={A('star.png')} c={STAR} />
    </Abs>
    <Abs style={{ inset: 0 }}>
      <Crop src={A('star.png')} c={STAR} />
    </Abs>
  </Abs>
)

const SparkleImg = ({ blur }: { blur?: boolean }) => (
  <div
    style={{
      position: 'relative',
      width: 11.667,
      height: 15,
      filter: blur ? 'blur(4.5px)' : undefined,
    }}
  >
    <Crop src={A('star.png')} c={SPARK} />
  </div>
)

/** Пара «размытая + резкая» искорка, повёрнутая как в макете. */
const Sparkle = ({ style, tf }: { style: CSSProperties; tf: string }) => (
  <>
    <Tf style={{ width: 15, height: 11.667, ...style }} tf={tf}>
      <SparkleImg blur />
    </Tf>
    <Tf style={{ width: 15, height: 11.667, ...style }} tf={tf}>
      <SparkleImg />
    </Tf>
  </>
)

/** Орнамент-«крылья» над подписями. */
const Wings = ({ style }: { style: CSSProperties }) => (
  <Tf style={{ height: 35.303, width: 146.314, ...style }} tf="scaleY(-1)">
    <div style={{ position: 'relative', width: 146.314, height: 35.303 }}>
      <Tf
        style={{ height: 76.215, width: 76.957, left: 7, top: -17.94 }}
        tf="rotate(-133.37deg) scaleY(-1)"
      >
        <img alt="" src={A('wing-left.png')} width={44.979} height={63.375} />
      </Tf>
      <Tf style={{ height: 76.215, width: 76.957, left: 61.14, top: -18 }} tf="rotate(-46.63deg)">
        <img alt="" src={A('wing-right.png')} width={44.979} height={63.375} />
      </Tf>
    </div>
  </Tf>
)

/* ---------- Коты: покадровая анимация ---------- */

const KISS_IMAGES = ['kiss-1.png', 'kiss-2.png', 'kiss-3.png', 'kiss-4.png', 'heart.png']

function Kiss({ style }: { style: CSSProperties }) {
  const [ready, setReady] = useState(false)

  // Запускаем цикл только когда все кадры загружены — иначе тайминги съедут.
  useEffect(() => {
    let alive = true
    Promise.all(
      KISS_IMAGES.map(
        (n) =>
          new Promise<void>((res) => {
            const img = new Image()
            img.onload = () => res()
            img.onerror = () => res()
            img.src = A(n)
          })
      )
    ).then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  const frame = { left: 0, top: 0, width: 332, height: 497 }
  return (
    <Abs className={`kiss${ready ? ' ready' : ''}`} style={{ width: 332, height: 497, ...style }}>
      {/* Default */}
      <div className="kiss-frame f1" style={frame}>
        <img
          alt=""
          src={A('kiss-1.png')}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {/* Variant2 */}
      <div className="kiss-frame f2" style={frame}>
        <img alt="" src={A('kiss-2.png')} style={{ position: 'absolute', left: 36, top: 26, width: 295.983, height: 470.829 }} />
      </div>
      {/* Variant3 */}
      <div className="kiss-frame f3" style={frame}>
        <img alt="" src={A('kiss-3.png')} style={{ position: 'absolute', left: 80, top: 40, width: 252.039, height: 441.998 }} />
      </div>
      {/* Variant4: поцелуй + сердечко (выходит за верхний край на 12 px) */}
      <div className="kiss-frame f4" style={frame}>
        <img alt="" src={A('kiss-4.png')} style={{ position: 'absolute', left: 52.96, top: 52, width: 246.032, height: 444.861 }} />
        <img alt="" src={A('heart.png')} style={{ position: 'absolute', left: 137, top: -12, width: 123.118, height: 110 }} />
      </div>
    </Abs>
  )
}

/* ---------- Солнце ---------- */

const Sun = () => (
  <Abs style={{ left: '50%', transform: 'translateX(-50%)', top: 779, width: 112, height: 112 }}>
    <Abs className="sun-rot" style={{ left: 0, top: 0, width: 112, height: 112, borderRadius: 56 }}>
      <Crop
        src={A('sun.png')}
        radius={56}
        c={{ h: '263.92%', l: '-151.8%', t: '-79.12%', w: '395.88%' }}
      />
    </Abs>
    <Abs
      style={{
        left: '50%', transform: 'translateX(-50%)', top: 34.46, width: 46.048, height: 44.513,
        borderRadius: 59.862, filter: 'blur(17.59px)',
      }}
    >
      <Crop
        src={A('sun.png')}
        radius={59.862}
        c={{ h: '709.85%', l: '-474.69%', t: '-299.02%', w: '1029.28%' }}
      />
    </Abs>
    <Abs
      style={{
        left: '50%', transform: 'translateX(-50%)', top: 34.46, width: 46.048, height: 44.513,
        borderRadius: 59.862,
      }}
    >
      <Crop
        src={A('sun.png')}
        radius={59.862}
        c={{ h: '709.85%', l: '-474.69%', t: '-299.02%', w: '1029.28%' }}
      />
    </Abs>
  </Abs>
)

/* ---------- Секции ---------- */

const R = 'rotate(180deg)'

function Hero() {
  return (
    <Abs
      style={{
        left: '50%', transform: 'translateX(-50%)', top: 0,
        width: 430, height: 1578, background: '#e5f6f7', overflow: 'hidden',
      }}
    >
      {/* тёплое свечение */}
      <Abs
        style={{
          left: '50%', transform: 'translateX(-50%)', top: 670, width: 430, height: 324,
          background: '#ffcf81', borderRadius: 300, filter: 'blur(150px)',
        }}
      />

      {/* ФОН */}
      <Abs style={{ height: 959, left: -30.75, top: -210, width: 491.502 }}>
        <Abs style={{ height: 338, left: 20.75, top: 774, width: 447 }}>
          <img alt="" src={A('bg-image18.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </Abs>
        <Abs style={{ height: 720.086, left: 30.75, top: 140, width: 430 }}>
          <Abs style={{ inset: '-4.17% -6.98%' }}>
            <img alt="" src={A('subtract-a.svg')} style={{ width: '100%', height: '100%' }} />
          </Abs>
        </Abs>
        <Abs style={{ height: 720.086, left: 30.75, top: 130, width: 430 }}>
          <Abs style={{ inset: '0 -0.12% -0.15% -0.12%' }}>
            <img alt="" src={A('subtract-b.svg')} style={{ width: '100%', height: '100%' }} />
          </Abs>
        </Abs>
      </Abs>

      <Sun />

      {/* Имена */}
      <Abs className="gv" style={{ height: 123, left: 125, top: 218, width: 170 }}>
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', height: 64, left: 90, top: 59, width: 160, fontSize: 66, letterSpacing: 1.98, color: '#f7f5e5', whiteSpace: 'nowrap' }}>Алиса</p>
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', left: 90, top: 56, fontSize: 26, color: '#d9b259', whiteSpace: 'nowrap' }}>&amp;</p>
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', left: 85, top: 0, fontSize: 66, letterSpacing: 1.98, color: '#f7f5e5', whiteSpace: 'nowrap' }}>Денис</p>
      </Abs>

      <p className="pf" style={{ position: 'absolute', transform: 'translateX(-50%)', left: '50%', top: 371, width: 214, fontSize: 14, textAlign: 'center' }}>
        Приглашаем вас разделить с нами самый важный день в нашей жизни
      </p>
      <p className="pf" style={{ position: 'absolute', transform: 'translateX(-50%)', left: 'calc(50% - 1px)', top: 464, fontSize: 26, textAlign: 'center', whiteSpace: 'nowrap' }}>
        05.01.2027
      </p>

      {/* звёзды */}
      <Star x={157} y={48} />
      <Star x={347} y={102} />
      <Star x={33} y={543} />
      <Star x={313} y={493} />
      <Star x={386} y={390} />
      <Star x={84} y={340} />
      <Star x={50} y={189} />
      <Star x={322} y={267} />

      {/* «Мы женимся!» */}
      <Abs style={{ height: 27.578, left: 123.51, top: 161, width: 183.473 }}>
        <p className="pf" style={{ position: 'absolute', transform: 'translateX(-50%)', left: 'calc(50% + 0.26px)', top: 5, fontSize: 14, textAlign: 'center', whiteSpace: 'nowrap' }}>
          Мы женимся!
        </p>
        <Sparkle style={{ left: 30.16, top: 8.32 }} tf="rotate(-90deg)" />
        <Sparkle style={{ left: 138.49, top: 7.65 }} tf="rotate(-90deg) scaleY(-1)" />
        <Wings style={{ left: 'calc(50% - 0.08px)', transform: 'translateX(-50%)', top: -24 }} />
      </Abs>

      {/* линия со звездой */}
      <Abs style={{ height: 25, left: 140, top: 429, width: 150 }}>
        <Abs style={{ height: 0, left: '50%', transform: 'translateX(-50%)', top: 12, width: 150 }}>
          <Abs style={{ inset: '-0.96px 0' }}>
            <img alt="" src={A('line-top.svg')} style={{ width: '100%', height: '100%' }} />
          </Abs>
        </Abs>
        <Abs style={{ height: 25, left: 'calc(50% + 0.06px)', transform: 'translateX(-50%)', top: 0, width: 24.123 }}>
          <Crop src={A('star-line.png')} c={LINE_STAR} />
        </Abs>
      </Abs>

      {/* поле с цветами + коты */}
      <Abs style={{ height: 634.938, left: 'calc(50% - 0.5px)', transform: 'translateX(-50%)', top: 949.02, width: 697 }}>
        <img alt="" src={A('field.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </Abs>
      <Kiss style={{ left: '50%', transform: 'translateX(-50%)', top: 1170 }} />
    </Abs>
  )
}

const Corners = () => (
  <>
    <Tf style={{ height: 121.597, left: 1, top: -5.77, width: 156.855 }} tf="scaleY(-1)">
      <img alt="" src={A('corner-tl.png')} width={156.855} height={121.597} />
    </Tf>
    <Tf style={{ height: 121.597, left: 272.14, top: -5.6, width: 156.855 }} tf={R}>
      <img alt="" src={A('corner-tr.png')} width={156.855} height={121.597} />
    </Tf>
  </>
)

/* ---------- Нижняя часть: фон-«чаша» и блок «Детали» ---------- */

const GOLD = '#d9b259'
const BASE_BLUE = '#062e6f' // цвет фона под блоком «Детали» (замер по макету)

/** Нижняя «обложка» (повёрнута на 180°), в ней только форма — без контента. */
const COVER_TOP = 1402 // позиция «чаши» не менялась после увеличения кадра
function Cover() {
  return (
    <Abs style={{ left: '50%', transform: 'translateX(-50%)', top: COVER_TOP, width: 491.502, height: 959, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ flex: 'none', transform: R }}>
        <div style={{ position: 'relative', width: 491.502, height: 959 }}>
          <Abs style={{ height: 720.086, left: 30.75, top: 150, width: 430 }}>
            <img alt="" src={A('subtract-c.svg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          </Abs>
          <Abs style={{ height: 720.086, left: 30.75, top: 140, width: 430 }}>
            <Abs style={{ inset: '0 -0.12% -0.15% -0.12%' }}>
              <img alt="" src={A('subtract-b.svg')} style={{ width: '100%', height: '100%' }} />
            </Abs>
          </Abs>
        </div>
      </div>
    </Abs>
  )
}

/** Тонкое зерно фона под блоком «Детали» (плитка 200×150, вырезана из макета). */
const Grain = () => (
  <Abs
    style={{
      left: 0, top: 1592, width: 430, height: DESIGN_H - 1592,
      backgroundColor: BASE_BLUE,
      backgroundImage: `url(${A('bg-grain.png')})`,
      backgroundSize: '200px 150px',
      pointerEvents: 'none',
    }}
  />
)

/** Строка по центру кадра (x = 215). `top` — верх строки, как в Figma. */
const Gold = ({ children }: { children: ReactNode }) => <span style={{ color: GOLD }}>{children}</span>

const Line = ({ top, size = 14, children }: { top: number; size?: number; children: ReactNode }) => (
  <div
    className="pf"
    style={{ position: 'absolute', left: 0, width: DESIGN_W, top, fontSize: size, textAlign: 'center', whiteSpace: 'nowrap' }}
  >
    {children}
  </div>
)

/** Рукописный золотой разделитель (вырезан из макета, 2x). */
const Sep = ({ name, left, top, w }: { name: string; left: number; top: number; w: number }) => (
  <img alt="" src={A(name)} style={{ position: 'absolute', left, top, width: w, height: 5 }} />
)

const Dot = ({ left, color }: { left: number; color: string }) => (
  <Abs style={{ left, top: 2036, width: 20, height: 20, borderRadius: 10, background: color }} />
)

function Details() {
  return (
    <>
      {/* Заголовок «Детали» с искорками */}
      <Abs style={{ left: 153, top: 1631.8, width: 124, height: 28 }}>
        <Sparkle style={{ left: 0, top: 4.33 }} tf="rotate(90deg) scaleY(-1)" />
        <Sparkle style={{ left: 109.5, top: 4.33 }} tf="rotate(90deg) scaleY(-1)" />
      </Abs>
      <Line top={1624.3} size={24}>Детали</Line>

      {/* 16:30 — Сбор гостей */}
      <Line top={1687}>
        <Gold>16:30</Gold>
        <br />
        Сбор гостей
      </Line>
      <Line top={1728.7} size={10}>
        Phuket Marriott Resort and Spa
        <br />
        Nai Yang Beach
      </Line>
      <Sep name="sep-1.png" left={172.5} top={1762.5} w={85} />

      {/* 17:00 — Церемония */}
      <Line top={1781.6}>
        <Gold>17:00</Gold>
        <br />
        Церемония
      </Line>
      <Sep name="sep-2.png" left={188.5} top={1824.5} w={53} />

      {/* 18:00 — Фуршет */}
      <Line top={1843.6}>
        <Gold>18:00</Gold>
        <br />
        Фуршет
      </Line>
      <Sep name="sep-3.png" left={188.5} top={1886.5} w={53} />

      {/* 19:00 — Начало банкета */}
      <Line top={1905.6}>
        <Gold>19:00</Gold>
        <br />
        Начало банкета
      </Line>
      <Sep name="sep-4.png" left={172.5} top={1950.5} w={85} />

      {/* Дресс-код */}
      <Line top={1968}>Дресс-код</Line>
      <Line top={1993.2} size={10}>
        Будем признательны, если
        <br />
        воздержитесь от белого
        <br />
        цвета в своих нарядах
      </Line>
      <Dot left={169} color="#849532" />
      <Dot left={204} color="#fff6c1" />
      <Dot left={239} color="#f4e8cc" />
    </>
  )
}

const BottomCorners = () => (
  <Tf style={{ bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 428, height: 121.767 }} tf={R}>
    <div style={{ position: 'relative', width: 428, height: 121.767 }}>
      <Tf style={{ height: 121.597, left: 271.15, top: 0, width: 156.855 }} tf={R}>
        <img alt="" src={A('corner-br.png')} width={156.855} height={121.597} />
      </Tf>
      <Tf style={{ height: 121.597, left: 0, top: 0.17, width: 156.855 }} tf="scaleY(-1)">
        <img alt="" src={A('corner-bl.png')} width={156.855} height={121.597} />
      </Tf>
    </div>
  </Tf>
)

const Menu = () => (
  <Abs style={{ height: 129, left: 82, top: 2091, width: 266 }}>
    <p className="pf" style={{ position: 'absolute', transform: 'translateX(-50%)', left: '50%', top: 35, width: 266, fontSize: 14, textAlign: 'center' }}>
      Предлагаем вам заранее ознакомиться с меню и выбрать то, что вам приглянулось больше!
    </p>
    <Wings style={{ left: 'calc(50% + 0.16px)', transform: 'translateX(-50%)', top: 0 }} />
    <a
      className="pf gold menu-link"
      href={MENU_URL}
      style={{ position: 'absolute', transform: 'translateX(-50%)', left: 'calc(50% - 0.5px)', top: 113, fontSize: 14, textAlign: 'center', whiteSpace: 'nowrap', color: '#d9b259' }}
    >
      {'{ ОТКРЫТЬ МЕНЮ }'}
    </a>
  </Abs>
)

/* ---------- Масштаб под ширину экрана ---------- */

const DESIGN_W = 430
const DESIGN_H = 2505
const getScale = () => Math.min(1, document.documentElement.clientWidth / DESIGN_W)

function useScale() {
  const [k, setK] = useState(getScale)
  useLayoutEffect(() => {
    const on = () => setK(getScale())
    on()
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
    }
  }, [])
  return k
}

export default function App() {
  const k = useScale()
  return (
    <div className="stage-wrap">
      <div className="stage-box" style={{ width: DESIGN_W * k, height: DESIGN_H * k }}>
        <div className="stage" style={{ transform: `scale(${k})`, width: DESIGN_W, height: DESIGN_H }}>
          <Abs style={{ left: 0, top: 1500, width: 430, height: 1005, background: BASE_BLUE }} />
          <Hero />
          <Corners />
          <Cover />
          <Grain />
          <Details />
          <BottomCorners />
          <Menu />
        </div>
      </div>
    </div>
  )
}
