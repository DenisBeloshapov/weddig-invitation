import { useEffect, useLayoutEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { MENU_URL } from './config'

/* Все координаты — из Figma (кадр 430×2345, node 4084:179). */

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
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', height: 64, left: 90, top: 59, width: 160, fontSize: 66, letterSpacing: 1.98, color: '#f7f5e5' }}>Алиса</p>
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', left: 90, top: 56, fontSize: 26, color: '#d9b259', whiteSpace: 'nowrap' }}>&amp;</p>
        <p style={{ position: 'absolute', transform: 'translateX(-50%)', height: 64, left: 80, top: 0, width: 160, fontSize: 66, letterSpacing: 1.98, color: '#f7f5e5' }}>Денис</p>
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

const PfR = ({ style, size, align, children }: { style: CSSProperties; size: number; align?: 'right'; children: ReactNode }) => (
  <Tf style={style} tf={R}>
    <p className="pf" style={{ position: 'relative', fontSize: size, textAlign: align, whiteSpace: 'nowrap' }}>{children}</p>
  </Tf>
)

const TimeLabel = ({ time, title, align }: { time: string; title: string; align?: 'right' }) => (
  <div className="pf" style={{ position: 'relative', fontSize: 14, whiteSpace: 'nowrap', textAlign: align, lineHeight: 0 }}>
    <p className="gold" style={{ lineHeight: 1.15 }}>{time}</p>
    <p style={{ lineHeight: 1.15 }}>{title}</p>
  </div>
)

const Diamond = ({ top }: { top: number }) => (
  <Tf style={{ height: 24.123, left: '50%', transform: 'translateX(-50%)', top, width: 25 }} tf="rotate(90deg)">
    <div style={{ position: 'relative', width: 24.123, height: 25 }}>
      <Crop src={A('star-line.png')} c={LINE_STAR} />
    </div>
  </Tf>
)

function DetailsCover() {
  const full = 'translateX(-100%)'
  return (
    <Abs style={{ left: '50%', transform: 'translateX(-50%)', bottom: -16, width: 491.502, height: 959, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

          {/* блок деталей */}
          <Abs style={{ height: 262, left: 113, top: 412, width: 268 }}>
            <Tf style={{ height: 28.609, left: 45.58, top: 64.39, width: 47.418 }} tf={R}>
              <img alt="" src={A('icon-hanger.png')} width={47.418} height={28.609} />
            </Tf>

            <Abs style={{ height: 32, left: 173, top: 64, width: 95 }}>
              <PfR style={{ transform: full, left: 67, top: 16 }} size={14} align="right">Дресс-код</PfR>
              <PfR style={{ transform: full, left: 95, top: 0 }} size={10} align="right">Текст под дресс-код</PfR>
            </Abs>

            <Tf style={{ height: 36.824, left: 173.87, top: 132.18, width: 41.133 }} tf={R}>
              <img alt="" src={A('icon-glasses.png')} width={41.133} height={36.824} />
            </Tf>

            <Abs style={{ height: 48, left: 0, top: 131, width: 93 }}>
              <Tf style={{ left: 28, top: 16 }} tf={R}>
                <TimeLabel time="17:00" title="Праздник" />
              </Tf>
              <PfR style={{ left: 0, top: 0 }} size={10}>Текст под праздник</PfR>
            </Abs>

            <Tf style={{ height: 30.98, right: 175, top: 219.02, width: 53.424 }} tf={R}>
              <img alt="" src={A('icon-landscape.png')} width={53.424} height={30.98} />
            </Tf>

            <Abs style={{ height: 48, left: 173, top: 214, width: 76 }}>
              <Tf style={{ transform: full, left: 76, top: 16 }} tf={R}>
                <TimeLabel time="15:00" title="Церемония" align="right" />
              </Tf>
              <PfR style={{ transform: full, left: 72, top: 0 }} size={10} align="right">Такое то место</PfR>
            </Abs>

            {/* линия таймлайна */}
            <Abs style={{ height: 257, left: 119, top: 0, width: 25 }}>
              <Tf style={{ height: 225, left: 'calc(50% + 1.5px)', transform: 'translateX(-50%)', top: 32, width: 0 }} tf="rotate(-90deg)">
                <div style={{ position: 'relative', height: 0, width: 225 }}>
                  <Abs style={{ inset: '-1.96px 0 0.04px 0' }}>
                    <img alt="" src={A('line-timeline.svg')} style={{ width: '100%', height: '100%' }} />
                  </Abs>
                </div>
              </Tf>
              <Diamond top={220.88} />
              <Diamond top={137.88} />
              <Diamond top={65.88} />
            </Abs>
          </Abs>

          {/* заголовок «Детали» */}
          <Abs style={{ height: 28, left: 185, top: 709, width: 121 }}>
            <Tf style={{ left: '50%', transform: 'translateX(-50%)', top: 0 }} tf={R}>
              <p className="pf" style={{ position: 'relative', fontSize: 24, textAlign: 'center', whiteSpace: 'nowrap' }}>Детали</p>
            </Tf>
            <Abs style={{ height: 11.667, left: 0, top: 4.33, width: 15 }}>
              <Sparkle style={{ left: 0, top: 0 }} tf="rotate(90deg) scaleY(-1)" />
            </Abs>
            <Tf style={{ height: 11.667, left: 106, top: 4.33, width: 15 }} tf="rotate(180deg) scaleY(-1)">
              <div style={{ position: 'relative', height: 11.667, width: 15 }}>
                <Sparkle style={{ left: 0, top: 0 }} tf="rotate(90deg) scaleY(-1)" />
              </div>
            </Tf>
          </Abs>
        </div>
      </div>
    </Abs>
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
  <Abs style={{ height: 129, left: 82, top: 1976, width: 266 }}>
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
const DESIGN_H = 2345
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
        <div className="stage" style={{ transform: `scale(${k})` }}>
          <Hero />
          <Corners />
          <DetailsCover />
          <Abs style={{ left: '50%', transform: 'translateX(-50%)', bottom: 0, width: 430, height: 340, background: '#07347e' }} />
          <BottomCorners />
          <Menu />
        </div>
      </div>
    </div>
  )
}
