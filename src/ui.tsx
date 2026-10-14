import type { CSSProperties, ReactNode } from 'react'
import { A } from './assets'

/* Общие «кирпичики» оформления: приглашение (абсолютная вёрстка) и страница меню. */

export type BoxProps = {
  style?: CSSProperties
  className?: string
  children?: ReactNode
  /** участвует в случайной пульсации яркости */
  twinkle?: boolean
  /** дополнительно вспыхивает при наведении/касании */
  hit?: boolean
}

export const Abs = ({ style, className, children, twinkle, hit }: BoxProps) => (
  <div
    className={className}
    data-twinkle={twinkle ? '' : undefined}
    data-hit={hit ? '' : undefined}
    style={{ position: 'absolute', ...style }}
  >
    {children}
  </div>
)

/** Блок с центрированием + внутренняя обёртка с transform (как flex-none rotate-… в макете). */
export const Tf = ({ style, tf, children }: BoxProps & { tf: string }) => (
  <Abs style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    <div style={{ flex: 'none', transform: tf }}>{children}</div>
  </Abs>
)

/** Часть спрайта внутри обрезающего контейнера (как в макете: overflow-hidden + смещённая картинка). */
export type CropSpec = { h: string; l: string; t: string; w: string }
export const STAR: CropSpec = { h: '1570.97%', l: '-2561.82%', t: '-535.48%', w: '2701.82%' }
export const SPARK: CropSpec = { h: '2117.39%', l: '-4114.29%', t: '-504.35%', w: '4245.71%' }
export const LINE_STAR: CropSpec = { h: '1708.77%', l: '-2229.09%', t: '-217.54%', w: '2701.82%' }

export const Crop = ({ src, c, radius }: { src: string; c: CropSpec; radius?: number }) => (
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

export const Star = ({ x, y }: { x: number; y: number }) => (
  <Abs twinkle hit style={{ left: x, top: y, width: 16.855, height: 19 }}>
    {/* невидимая зона касания побольше самой звезды */}
    <span style={{ position: 'absolute', inset: -12 }} />
    <Abs style={{ inset: 0, filter: 'blur(4.5px)' }}>
      <Crop src={A('star.png')} c={STAR} />
    </Abs>
    <Abs style={{ inset: 0 }}>
      <Crop src={A('star.png')} c={STAR} />
    </Abs>
  </Abs>
)

export const SparkleImg = ({ blur }: { blur?: boolean }) => (
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
export const Sparkle = ({ style, tf }: { style: CSSProperties; tf: string }) => (
  <Abs twinkle style={{ inset: 0, pointerEvents: 'none' }}>
    <Tf style={{ width: 15, height: 11.667, ...style }} tf={tf}>
      <SparkleImg blur />
    </Tf>
    <Tf style={{ width: 15, height: 11.667, ...style }} tf={tf}>
      <SparkleImg />
    </Tf>
  </Abs>
)

/** Орнамент-«крылья» над подписями. */
export const Wings = ({ style }: { style: CSSProperties }) => (
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

