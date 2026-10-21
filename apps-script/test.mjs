// Проверка Code.gs на имитации Google Таблицы (запуск: node apps-script/test.mjs)
import vm from 'node:vm'
import fs from 'node:fs'
import assert from 'node:assert/strict'

const code = fs.readFileSync(new URL('./Code.gs', import.meta.url), 'utf8')

function makeEnv() {
  const sheets = new Map()
  class Sheet {
    constructor(name) { this.name = name; this.rows = []; this.max = 1000; this.fmt = {}; this.frozen = 0 }
    getLastRow() { let l = 0; this.rows.forEach((r, i) => { if (r && r.some((v) => v !== '' && v != null)) l = i + 1 }); return l }
    getMaxRows() { return this.max }
    insertRowsAfter(pos, n) { this.max += n }
    deleteRow(n) { this.rows.splice(n - 1, 1); this.max = Math.max(this.max, this.rows.length) }
    setFrozenRows(n) { this.frozen = n }
    getRange(r, c, nr = 1, nc = 1) {
      const sh = this
      const rng = {
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (sh.rows[r - 1 + i]?.[c - 1 + j] ?? ''))),
        setValues(vals) {
          assert.ok(r - 1 + nr <= sh.max, 'запись за пределами листа')
          vals.forEach((row, i) => { sh.rows[r - 1 + i] ??= []; row.forEach((v, j) => (sh.rows[r - 1 + i][c - 1 + j] = v)) })
          return rng
        },
        setFormulas(f) { f.forEach((row, i) => { sh.rows[r - 1 + i] ??= []; row.forEach((v, j) => (sh.rows[r - 1 + i][c - 1 + j] = v)) }); return rng },
        setNumberFormat(x) { sh.fmt[`${r}:${c}`] = x; return rng },
        setFontWeight() { return rng },
      }
      return rng
    }
  }
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ({
      getSheetByName: (n) => sheets.get(n) || null,
      insertSheet: (n) => { const s = new Sheet(n); sheets.set(n, s); return s },
    }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ t, setMimeType() { return this }, getContent() { return this.t } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Session: { getScriptTimeZone: () => 'Europe/Moscow' },
    Utilities: { formatDate: (d, tz, fmt) => fmt.replace('yyyy', '2026').replace('MM', '10').replace('dd', '16').replace('HH', '12').replace('mm', '00') },
  }
  vm.createContext(ctx); vm.runInContext(code, ctx)
  const post = (body) => JSON.parse(ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).getContent())
  return { ctx, sheets, post }
}

const base = (over = {}) => ({
  submissionId: 'abcd1234-aaaa', submittedBy: 'Иванов Иван Иванович', submittedAt: '2026-10-16T09:00:00Z',
  choices: [
    { forName: 'Иванов Иван Иванович', forSelf: true, setId: 'western-a', setLabel: 'x', cuisine: 'Western', menu: 'A', main: 'Pan Seared Barramundi Fillet' },
    { forName: 'Иванова Мария', forSelf: false, setId: 'thai-b', setLabel: 'x', cuisine: 'Thai', menu: 'B', main: '' },
  ], ...over,
})
let n = 0; const ok = (name) => console.log(`✓ ${++n}. ${name}`)

{ // 1. обычная запись
  const { sheets, post } = makeEnv()
  const r = post(base()); assert.deepEqual(r, { ok: true, saved: 2 })
  const s = sheets.get('Responses')
  assert.deepEqual(s.rows[0], ['Date & time', 'Guest name', 'Cuisine', 'Menu', 'Main dish', 'Submission ID', 'Duplicate'])
  assert.equal(s.rows[1][0], '2026-10-16 12:00')
  assert.deepEqual(s.rows[1].slice(1, 6), ['Ivanov Ivan Ivanovich', 'Western', 'A', 'Pan Seared Barramundi Fillet', 'abcd1234-aaaa'])
  assert.deepEqual(s.rows[2].slice(1, 6), ['Ivanova Mariya', 'Thai', 'B', '', 'abcd1234-aaaa'])
  assert.equal(s.rows[1].length, 7); assert.equal(s.rows[0].length, 7)
  assert.match(s.rows[1][6], /^=IF\(COUNTIF\(\$B\$2:\$B,B2\)>1,"duplicate"/); assert.match(s.rows[2][6], /B3\)>1/)
  assert.equal(s.fmt['2:6'], '@'); assert.equal(s.frozen, 1)
  ok('одна отправка → 2 строки, лист и заголовки на английском, без колонок «кто заполнил» и «для кого»')
}
{ // 2. повторная отправка той же заявки заменяет строки
  const { sheets, post } = makeEnv(); post(base())
  const b = base(); b.choices[0].setId = 'western-c'; b.choices[0].main = 'Roasted Honey Miso Glazed Cod'
  assert.equal(post(b).ok, true)
  const s = sheets.get('Responses'); assert.equal(s.getLastRow(), 3)
  assert.deepEqual(s.rows[1].slice(2, 5), ['Western', 'C', 'Roasted Honey Miso Glazed Cod'])
  ok('повторная отправка с тем же ID заменяет строки, дублей нет (3 строки: заголовок + 2)')
}
{ // 3. другая заявка того же гостя
  const { sheets, post } = makeEnv(); post(base()); post(base({ submissionId: 'zzzz9999-bbbb' }))
  const s = sheets.get('Responses'); assert.equal(s.getLastRow(), 5)
  assert.match(s.rows[3][6], /B4\)>1/); assert.match(s.rows[4][6], /B5\)>1/)
  ok('другая заявка добавляется ниже, строки отмечаются формулой «duplicate»')
}
{ // 4. невалидные данные
  const { sheets, post } = makeEnv()
  const bad = base(); bad.choices[0].setId = 'hack'
  const err = post(bad); assert.equal(err.ok, false)
  assert.equal(post(base({ submittedBy: ' ' })).ok, false)
  const g = base(); g.choices[1].forName = ''; assert.equal(post(g).ok, false)
  assert.equal(post(base({ submissionId: '1' })).ok, false)
  assert.equal(post(base({ choices: [] })).ok, false)
  assert.equal(post(base({ choices: Array(11).fill(base().choices[0]) })).ok, false)
  assert.equal(post('не json').ok, false)
  assert.ok(!sheets.has('Responses') || sheets.get('Responses').getLastRow() <= 1)
  ok('неверные данные отклоняются, в таблицу ничего не попадает (пример ответа сервера: «' + err.error + '»)')
}
{ // 5. формулы в имени и блюде
  const { sheets, post } = makeEnv()
  const b = base({ submittedBy: '=HYPERLINK("http://x","y")' }); b.choices[0].forName = '+1+1'; b.choices[1].main = '@SUM(A1)'
  assert.equal(post(b).ok, true); const s = sheets.get('Responses')
  assert.equal(s.rows[1][1], "'=HYPERLINK(\"http://x\",\"y\")"); assert.equal(s.rows[2][4], "'@SUM(A1)")
  ok('значения, начинающиеся с «=», «+», «@», записываются как текст (защита от формул)')
}
{ // 6. обрезка длины
  const { sheets, post } = makeEnv(); const b = base(); b.choices[0].forSelf = false; b.choices[0].forName = '  Пётр   ' + 'я'.repeat(500)
  assert.equal(post(b).ok, true); const v = sheets.get('Responses').rows[1][1]; assert.ok(v.length <= 200 && v.startsWith('Pyotr ya'))
  ok('длинные строки обрезаются до 200 символов, лишние пробелы убираются')
}
{ // 7. расширение листа
  const { sheets, post } = makeEnv(); post(base()); const s = sheets.get('Responses'); s.max = 3
  assert.equal(post(base({ submissionId: 'other-id-1234' })).ok, true); assert.equal(s.getLastRow(), 5)
  ok('когда строки на листе заканчиваются, лист автоматически расширяется')
}
{ // 8. doGet
  const { ctx } = makeEnv(); const r = JSON.parse(ctx.doGet().getContent()); assert.deepEqual(r, { ok: true, service: 'wedding-menu' })
  ok('GET отвечает только {"ok":true}, данные таблицы не раскрываются')
}
{ // 9. транслитерация имён
  const { ctx } = makeEnv()
  const cases = [
    ['Иванов Иван Иванович', 'Ivanov Ivan Ivanovich'], ['Юлия Щербакова', 'Yuliya Shcherbakova'], ['Жданов Ёжик', 'Zhdanov Yozhik'],
    ['Алексей Дмитриевич Хохлов', 'Aleksey Dmitrievich Khokhlov'], ['Мария-Анна Цветкова', 'Mariya-Anna Tsvetkova'],
    ['ИВАНОВ ЖУК ЮЛИЯ', 'IVANOV ZHUK YULIYA'], ['Ольга Чернова-Шаповалова', 'Olga Chernova-Shapovalova'], ['Эльвира Объедкова', 'Elvira Obedkova'],
    ['Олексій Їжак Ґудзь', 'Oleksiy Yizhak Gudz'], ['John Smith', 'John Smith'], ['Анна Smith-Петрова', 'Anna Smith-Petrova']
  ]
  for (const [src, want] of cases) assert.equal(ctx.translit_(src), want, `${src} -> ${ctx.translit_(src)} (ожидалось ${want})`)
  ok('транслитерация: ' + cases.slice(0, 5).map((c) => c[0] + ' → ' + ctx.translit_(c[0])).join('; '))
}
{ // 10. «для себя» берёт имя заполняющего, «для другого» — своё поле; оба латиницей
  const { sheets, post } = makeEnv(); const b = base({ submittedBy: 'Петров Пётр' }); b.choices[0].forName = 'игнорируется'; b.choices[1].forName = 'Сидорова Анна'
  assert.equal(post(b).ok, true); const s = sheets.get('Responses')
  assert.equal(s.rows[1][1], 'Petrov Pyotr'); assert.equal(s.rows[2][1], 'Sidorova Anna')
  ok('для «себя» берётся имя заполняющего, для другого гостя — его собственное; оба латиницей')
}
console.log(`\nВсе проверки пройдены (${n}).`)
