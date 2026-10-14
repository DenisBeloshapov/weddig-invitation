import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { A } from './assets'
import { Wings } from './ui'
import { MENU_SETS, CUISINES, setsOf, getSet, setLabel, mainChoices } from './menuData'
import type { Cuisine, MenuSet } from './menuData'
import { submitChoices } from './api'
import type { ChoicePayload } from './api'

/* ------------------------------------------------------------------ */
/* Мелкие декоративные элементы                                        */
/* ------------------------------------------------------------------ */

const STAR_PATH =
  'M0,-34 C2.6,-9 9,-2.6 34,0 C9,2.6 2.6,9 0,34 C-2.6,9 -9,2.6 -34,0 C-9,-2.6 -2.6,-9 0,-34Z'

/** Четырёхконечная золотая звезда, случайно пульсирует яркостью (CSS), вспыхивает при наведении. */
function Star4({ size = 14, className = '' }: { size?: number; className?: string }) {
  const r = useMemo(() => ({ d: 2.6 + Math.random() * 3.4, dl: -Math.random() * 6 }), [])
  return (
    <svg
      className={`mp-star ${className}`}
      viewBox="-40 -40 80 80"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ animationDuration: `${r.d}s`, animationDelay: `${r.dl}s` }}
    >
      <path d={STAR_PATH} fill="url(#mp-gold)" filter="url(#mp-glow)" />
    </svg>
  )
}

/** Золотой разделитель (те же файлы, что и в приглашении). */
const Sep = ({ wide = true }: { wide?: boolean }) => (
  <img
    className="mp-sep"
    alt=""
    src={A(wide ? 'sep-1.png' : 'sep-2.png')}
    width={wide ? 85 : 53}
    height={5}
  />
)

/** Появление при прокрутке. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`mp-reveal${seen ? ' in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Просмотр меню                                                       */
/* ------------------------------------------------------------------ */

function MenuCard({ set, onChoose }: { set: MenuSet; onChoose: (id: string) => void }) {
  return (
    <article className="mp-card" aria-label={setLabel(set)}>
      <div className="mp-card-head">
        <Star4 size={16} />
        <p className="mp-cuisine">{set.cuisine.toUpperCase()}</p>
        <h2 className="mp-setdinner">SET DINNER</h2>
        <p className="mp-letter">MENU {set.letter}</p>
      </div>
      <Sep />
      {set.sections.map((sec, i) => (
        <Fragment key={sec.title}>
          <section className="mp-sec" style={{ '--i': i } as CSSProperties}>
            <h3 className="mp-sec-title">{sec.title}</h3>
            {sec.hint && <p className="mp-hint">{sec.hint}</p>}
            {sec.dishes.map((d, j) => (
              <Fragment key={d.name}>
                {sec.either && j > 0 && (
                  <div className="mp-or" aria-hidden="true">
                    <i />
                    <span>or</span>
                    <i />
                  </div>
                )}
                <div className="mp-dish">
                  <p className="mp-name">{d.name}</p>
                  {d.note && <p className="mp-note">{d.note}</p>}
                </div>
              </Fragment>
            ))}
          </section>
          {i < set.sections.length - 1 && <Sep wide={i % 2 === 1} />}
        </Fragment>
      ))}
      <button type="button" className="mp-btn ghost" onClick={() => onChoose(set.id)}>
        Выбрать этот сет
      </button>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Форма выбора                                                        */
/* ------------------------------------------------------------------ */

type Entry = { id: string; forSelf: boolean; guest: string; setId: string; main: string }
type Draft = { submittedBy: string; entries: Entry[] }
type Saved = { draft: Draft; submitted?: ChoicePayload }

const STORAGE_KEY = 'wedding-menu-v1'
const MAX_ENTRIES = 10

const uid = () => Math.random().toString(36).slice(2, 9)
const newEntry = (forSelf: boolean): Entry => ({ id: uid(), forSelf, guest: '', setId: '', main: '' })
const emptyDraft = (): Draft => ({ submittedBy: '', entries: [newEntry(true)] })

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Saved
      if (s?.draft && Array.isArray(s.draft.entries) && s.draft.entries.length) return s
    }
  } catch {
    /* хранилище недоступно — работаем без него */
  }
  return { draft: emptyDraft() }
}

function persist(s: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

type EntryErr = { guest?: string; set?: string; main?: string; self?: string }
type Errors = { name?: string; entries: Record<string, EntryErr>; count: number }

const nameOk = (v: string) => v.trim().length >= 2 && /\p{L}/u.test(v)

function validate(d: Draft): Errors {
  const out: Errors = { entries: {}, count: 0 }
  if (!nameOk(d.submittedBy)) {
    out.name = 'Введите ваше ФИО'
    out.count++
  }
  let selfSeen = false
  for (const e of d.entries) {
    const er: EntryErr = {}
    if (e.forSelf) {
      if (selfSeen) er.self = 'Выбор для себя уже добавлен — для другого человека выберите «Для другого гостя»'
      selfSeen = true
    } else if (!nameOk(e.guest)) er.guest = 'Введите ФИО гостя'
    const set = getSet(e.setId)
    if (!set) er.set = 'Выберите сет'
    else if (mainChoices(set).length && !e.main) er.main = 'Выберите основное блюдо'
    if (Object.keys(er).length) {
      out.entries[e.id] = er
      out.count += Object.keys(er).length
    }
  }
  return out
}

function buildPayload(d: Draft): ChoicePayload {
  const by = d.submittedBy.trim()
  return {
    submittedBy: by,
    submittedAt: new Date().toISOString(),
    choices: d.entries.map((e) => {
      const set = getSet(e.setId)!
      return {
        forName: e.forSelf ? by : e.guest.trim(),
        forSelf: e.forSelf,
        setId: set.id,
        setLabel: setLabel(set),
        main: mainChoices(set).length ? e.main : '',
      }
    }),
  }
}

type FormProps = {
  draft: Draft
  setDraft: (fn: (d: Draft) => Draft) => void
  showErrors: boolean
  errors: Errors
  onPreview: (setId: string) => void
}

function EntryCard({
  entry,
  index,
  total,
  err,
  showErrors,
  patch,
  onRemove,
  onPreview,
}: {
  entry: Entry
  index: number
  total: number
  err: EntryErr
  showErrors: boolean
  patch: (p: Partial<Entry>) => void
  onRemove: () => void
  onPreview: (setId: string) => void
}) {
  const set = getSet(entry.setId)
  const mains = set ? mainChoices(set) : []
  const family = set?.sections.some((s) => !s.either && s.title.includes('Family Style'))

  return (
    <fieldset className="mp-entry" aria-label={`Выбор №${index + 1}`}>
      <div className="mp-entry-top">
        <p className="mp-legend">Выбор{total > 1 ? ` №${index + 1}` : ''}</p>
        {total > 1 && (
          <button type="button" className="mp-x" onClick={onRemove} aria-label={`Удалить выбор №${index + 1}`}>
            ×
          </button>
        )}
      </div>

      <div className="mp-toggle" role="group" aria-label="Для кого этот выбор">
        <button type="button" className={entry.forSelf ? 'on' : ''} aria-pressed={entry.forSelf} onClick={() => patch({ forSelf: true })}>
          Для меня
        </button>
        <button type="button" className={!entry.forSelf ? 'on' : ''} aria-pressed={!entry.forSelf} onClick={() => patch({ forSelf: false })}>
          Для другого гостя
        </button>
      </div>
      {showErrors && err.self && <p className="mp-err" data-err>{err.self}</p>}

      {!entry.forSelf && (
        <div className="mp-field">
          <label className="mp-label" htmlFor={`g-${entry.id}`}>ФИО гостя, за которого вы выбираете</label>
          <input
            id={`g-${entry.id}`}
            className={`mp-input${showErrors && err.guest ? ' invalid' : ''}`}
            value={entry.guest}
            onChange={(e) => patch({ guest: e.target.value })}
            placeholder="Фамилия Имя Отчество"
            autoComplete="off"
          />
          {showErrors && err.guest && <p className="mp-err" data-err>{err.guest}</p>}
        </div>
      )}

      <p className="mp-label">Сет</p>
      <div className="mp-sets" role="radiogroup" aria-label="Выберите сет">
        {CUISINES.map((c) => (
          <div className="mp-group" key={c}>
            <p className="mp-group-title">{c}</p>
            <div className="mp-pills">
              {setsOf(c).map((s) => {
                const on = entry.setId === s.id
                return (
                  <label key={s.id} className={`mp-pill${on ? ' on' : ''}`}>
                    <input
                      type="radio"
                      name={`set-${entry.id}`}
                      value={s.id}
                      checked={on}
                      onChange={() => patch({ setId: s.id, main: '' })}
                    />
                    <span>Menu {s.letter}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {showErrors && err.set && <p className="mp-err" data-err>{err.set}</p>}

      {set && (
        <p className="mp-picked">
          <Star4 size={11} /> {setLabel(set)}
          <button type="button" className="mp-link" onClick={() => onPreview(set.id)}>
            посмотреть меню
          </button>
        </p>
      )}

      {set && mains.length > 0 && (
        <div className="mp-main" role="radiogroup" aria-label="Основное блюдо">
          <p className="mp-label">Основное блюдо</p>
          {mains.map((d) => (
            <label key={d.name} className={`mp-opt${entry.main === d.name ? ' on' : ''}`}>
              <input type="radio" name={`main-${entry.id}`} value={d.name} checked={entry.main === d.name} onChange={() => patch({ main: d.name })} />
              <span className="mp-dot" aria-hidden="true" />
              <span>{d.name.replace(/,$/, '')}</span>
            </label>
          ))}
          {showErrors && err.main && <p className="mp-err" data-err>{err.main}</p>}
        </div>
      )}
      {family && <p className="mp-info">Основные блюда подаются на стол для всех (Family Style) — выбирать отдельное блюдо не нужно.</p>}
    </fieldset>
  )
}

function ChoiceForm({ draft, setDraft, showErrors, errors, onPreview }: FormProps) {
  const patchEntry = (id: string, p: Partial<Entry>) =>
    setDraft((d) => ({ ...d, entries: d.entries.map((e) => (e.id === id ? { ...e, ...p } : e)) }))

  return (
    <>
      <div className="mp-field big">
        <label className="mp-label" htmlFor="mp-name">Введите ваше ФИО</label>
        <input
          id="mp-name"
          className={`mp-input${showErrors && errors.name ? ' invalid' : ''}`}
          value={draft.submittedBy}
          onChange={(e) => setDraft((d) => ({ ...d, submittedBy: e.target.value }))}
          placeholder="Фамилия Имя Отчество"
          autoComplete="name"
        />
        <p className="mp-hintline">Так мы будем знать, кто сделал выбор.</p>
        {showErrors && errors.name && <p className="mp-err" data-err>{errors.name}</p>}
      </div>

      {draft.entries.map((e, i) => (
        <EntryCard
          key={e.id}
          entry={e}
          index={i}
          total={draft.entries.length}
          err={errors.entries[e.id] ?? {}}
          showErrors={showErrors}
          patch={(p) => patchEntry(e.id, p)}
          onRemove={() => setDraft((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== e.id) }))}
          onPreview={onPreview}
        />
      ))}

      {draft.entries.length < MAX_ENTRIES && (
        <button
          type="button"
          className="mp-btn ghost wide"
          onClick={() => setDraft((d) => ({ ...d, entries: [...d.entries, newEntry(false)] }))}
        >
          + Добавить выбор за другого гостя
        </button>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Страница                                                            */
/* ------------------------------------------------------------------ */

export default function MenuPage() {
  const [viewId, setViewId] = useState(MENU_SETS[0].id)
  const view = getSet(viewId)!
  const [saved, setSaved] = useState<Saved>(loadSaved)
  const [showErrors, setShowErrors] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [submitted, setSubmitted] = useState<ChoicePayload | undefined>(saved.submitted)
  const formRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const draft = saved.draft
  const setDraft = useCallback((fn: (d: Draft) => Draft) => {
    setSaved((s) => {
      const next = { ...s, draft: fn(s.draft) }
      persist(next)
      return next
    })
  }, [])

  const errors = useMemo(() => validate(draft), [draft])

  useEffect(() => {
    window.scrollTo(0, 0)
    const prev = document.title
    document.title = 'Меню — Денис & Алиса'
    return () => {
      document.title = prev
    }
  }, [])

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  /** «Выбрать этот сет»: подставляем в первый выбор без сета и прокручиваем к форме. */
  const chooseSet = (id: string) => {
    setSubmitted(undefined)
    setDraft((d) => {
      const idx = Math.max(0, d.entries.findIndex((e) => !e.setId))
      return { ...d, entries: d.entries.map((e, i) => (i === idx ? { ...e, setId: id, main: '' } : e)) }
    })
    window.setTimeout(() => scrollTo(formRef.current), 60)
  }

  const preview = (id: string) => {
    setViewId(id)
    window.setTimeout(() => scrollTo(cardRef.current), 60)
  }

  const onSubmit = async () => {
    setShowErrors(true)
    if (errors.count) {
      window.setTimeout(() => {
        const el = document.querySelector('.mp-form [data-err], .mp-form .invalid') as HTMLElement | null
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }
    setStatus('sending')
    try {
      const payload = buildPayload(draft)
      await submitChoices(payload)
      setSubmitted(payload)
      persist({ draft, submitted: payload })
      setStatus('idle')
      window.setTimeout(() => scrollTo(formRef.current), 60)
    } catch {
      setStatus('error')
    }
  }

  const cuisineIdx = CUISINES.indexOf(view.cuisine)

  return (
    <main className="mp">
      {/* общие градиент и фильтр для звёзд */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="mp-gold" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0" stopColor="#f8e2a4" />
            <stop offset="0.55" stopColor="#d9b259" />
            <stop offset="1" stopColor="#b08430" />
          </linearGradient>
          <filter id="mp-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* уголки-орнаменты, как в приглашении */}
      <img className="mp-corner tl" alt="" src={A('corner-tl.png')} />
      <img className="mp-corner tr" alt="" src={A('corner-tr.png')} />

      <header className="mp-head">
        <a className="mp-back" href="#/">← К приглашению</a>
        <div className="mp-wings">
          <Wings style={{ left: 0, top: 0 }} />
        </div>
        <h1 className="mp-title">Меню</h1>
        <p className="mp-lead">Предлагаем вам заранее ознакомиться с меню и выбрать то, что вам приглянулось больше!</p>
        <div className="mp-stars" aria-hidden="true">
          <i /><Star4 size={15} /><i />
        </div>
      </header>

      {/* выбор сета для просмотра */}
      <Reveal>
        <div className="mp-view">
          <div className="mp-seg" role="tablist" aria-label="Кухня">
            <span className="mp-seg-ind" style={{ transform: `translateX(${cuisineIdx * 100}%)` }} />
            {CUISINES.map((c: Cuisine) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={view.cuisine === c}
                className={view.cuisine === c ? 'on' : ''}
                onClick={() => setViewId(setsOf(c)[0].id)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mp-letters" role="tablist" aria-label="Сет">
            {setsOf(view.cuisine).map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={viewId === s.id}
                className={viewId === s.id ? 'on' : ''}
                onClick={() => setViewId(s.id)}
              >
                Menu {s.letter}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div ref={cardRef} className="mp-card-wrap">
        <MenuCard key={view.id} set={view} onChoose={chooseSet} />
      </div>

      {/* форма */}
      <Reveal>
        <section ref={formRef} className="mp-form" aria-labelledby="mp-form-title">
          <div className="mp-wings small">
            <Wings style={{ left: 0, top: 0 }} />
          </div>
          <h2 id="mp-form-title" className="mp-title sm">Ваш выбор</h2>
          {submitted ? (
            <div className="mp-done" role="status">
              <Star4 size={22} />
              <p className="mp-done-title">Спасибо, {submitted.submittedBy}!</p>
              <p className="mp-lead">Ваш выбор принят.</p>
              <ul className="mp-summary">
                {submitted.choices.map((c, i) => (
                  <li key={i}>
                    <b>{c.forName}</b>
                    <span>{c.setLabel}</span>
                    {c.main && <em>{c.main.replace(/,$/, '')}</em>}
                  </li>
                ))}
              </ul>
              <button type="button" className="mp-btn ghost" onClick={() => setSubmitted(undefined)}>
                Изменить выбор
              </button>
            </div>
          ) : (
            <>
              <p className="mp-lead">Укажите ваше ФИО и выберите сет. Если вы выбираете за другого человека, добавьте его ниже.</p>
              <ChoiceForm draft={draft} setDraft={setDraft} showErrors={showErrors} errors={errors} onPreview={preview} />
              {showErrors && errors.count > 0 && <p className="mp-err center" data-err>Проверьте, пожалуйста, отмеченные поля.</p>}
              {status === 'error' && (
                <p className="mp-err center" data-err>Не получилось отправить выбор. Проверьте интернет и попробуйте ещё раз.</p>
              )}
              <button type="button" className="mp-btn gold" onClick={onSubmit} disabled={status === 'sending'}>
                {status === 'sending' ? 'Отправляем…' : 'Отправить выбор'}
              </button>
            </>
          )}
        </section>
      </Reveal>

      <footer className="mp-foot">
        <a className="mp-back" href="#/">← Вернуться к приглашению</a>
      </footer>

      <img className="mp-corner bl" alt="" src={A('corner-br.png')} />
      <img className="mp-corner br" alt="" src={A('corner-bl.png')} />
    </main>
  )
}
