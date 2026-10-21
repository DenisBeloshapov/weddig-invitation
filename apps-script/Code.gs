/**
 * Приём выбора меню со свадебного сайта и запись в Google Таблицу.
 *
 * Как подключить: см. README.md (Таблица → Расширения → Apps Script → вставить этот код →
 * Начать развёртывание → Веб-приложение → доступ «Все»).
 *
 * Таблица полностью на английском. Каждый выбор = одна строка:
 *   Date & time | Guest name | Cuisine | Menu | Main dish | Submission ID | Duplicate
 * Имена гостей записываются латиницей (транслитерация): «Иванов Иван» -> «Ivanov Ivan».
 */

var SHEET_NAME = 'Responses';
var HEADERS = ['Date & time', 'Guest name', 'Cuisine', 'Menu', 'Main dish', 'Submission ID', 'Duplicate'];
var COL_GUEST = 2;
var COL_ID = 6;
var COL_DUP = 7;

// Транслитерация имён (упрощённая, как в большинстве английских источников).
// Если нужна другая схема, поменяйте буквы здесь. Незнакомые символы (латиница, дефис, цифры) остаются как есть.
var TRANSLIT = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y',
  'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'і': 'i', 'ї': 'yi', 'є': 'ye', 'ґ': 'g', 'ў': 'u' // украинские и белорусские буквы
};

// Допустимые сеты (должны совпадать с id в src/menuData.ts на сайте)
var SETS = {
  'western-a': { cuisine: 'Western', menu: 'A' },
  'western-b': { cuisine: 'Western', menu: 'B' },
  'western-c': { cuisine: 'Western', menu: 'C' },
  'thai-a': { cuisine: 'Thai', menu: 'A' },
  'thai-b': { cuisine: 'Thai', menu: 'B' }
};

var MAX_CHOICES = 10; // выборов в одной отправке
var MAX_LEN = 200; // длина строки

/** Сайт отправляет сюда ответы (POST). */
function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw) throw new Error('Пустой запрос');
    var data = JSON.parse(raw);
    var parsed = parse_(data);
    save_(parsed.id, parsed.rows);
    return json_({ ok: true, saved: parsed.rows.length });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Проверка в браузере: адрес /exec должен отвечать {"ok":true}. Данные таблицы не отдаются. */
function doGet() {
  return json_({ ok: true, service: 'wedding-menu' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function isUpper_(c) {
  return !!c && c !== c.toLowerCase();
}

/** Кириллица -> латиница с сохранением регистра («Щербаков» -> «Shcherbakov», «ЖУК» -> «ZHUK»). */
function translit_(text) {
  var out = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    var low = ch.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(TRANSLIT, low)) {
      out += ch;
      continue;
    }
    var lat = TRANSLIT[low];
    if (!isUpper_(ch) || lat === '') {
      out += lat;
    } else if (lat.length === 1) {
      out += lat.toUpperCase();
    } else {
      // заглавная буква, дающая несколько латинских: «Ж» -> «Zh», а в слове из заглавных -> «ZH»
      var caps = isUpper_(text.charAt(i + 1)) || isUpper_(text.charAt(i - 1));
      out += caps ? lat.toUpperCase() : lat.charAt(0).toUpperCase() + lat.slice(1);
    }
  }
  return out;
}

/** Текст безопасен для таблицы: обрезаем и защищаемся от формул («=», «+», «-», «@» в начале). */
function clean_(value, label, required, asName) {
  var s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  if (required && s.length < 2) throw new Error('Missing: ' + label);
  if (asName) s = translit_(s).replace(/\s+/g, ' ').trim();
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Проверяет данные и превращает их в строки таблицы. */
function parse_(data) {
  if (!data || typeof data !== 'object') throw new Error('Bad format');
  var id = String(data.submissionId || '');
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) throw new Error('Bad submission id');
  var by = clean_(data.submittedBy, 'submitter name', true, true);
  var choices = data.choices;
  if (!Array.isArray(choices) || choices.length < 1) throw new Error('No choices');
  if (choices.length > MAX_CHOICES) throw new Error('Too many choices');

  var tz = Session.getScriptTimeZone();
  var when = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm');

  var rows = [];
  for (var i = 0; i < choices.length; i++) {
    var c = choices[i] || {};
    var set = SETS[String(c.setId)];
    if (!set) throw new Error('Unknown menu: ' + String(c.setId).slice(0, 40));
    var forSelf = c.forSelf === true;
    var guest = forSelf ? by : clean_(c.forName, 'guest name', true, true);
    var main = clean_(c.main, 'main dish', false);
    rows.push([when, guest, set.cuisine, set.menu, main, id, '']);
  }
  return { id: id, rows: rows };
}

/** Получает лист «Responses» (создаёт с заголовками, если его нет). */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Записывает строки. Если эта же заявка уже отправлялась (тот же ID), прежние строки заменяются:
 * гость исправил выбор или нажал «отправить» повторно — дублей не будет.
 */
function save_(id, rows) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = getSheet_();
    var last = sheet.getLastRow();

    // 1. удаляем прежние строки этой заявки (снизу вверх)
    if (last >= 2) {
      var ids = sheet.getRange(2, COL_ID, last - 1, 1).getValues();
      for (var i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]) === id) sheet.deleteRow(i + 2);
      }
    }

    // 2. дописываем новые строки в конец
    last = sheet.getLastRow();
    var start = last + 1;
    var need = start + rows.length - 1;
    if (need > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), need - sheet.getMaxRows());
    sheet.getRange(start, COL_ID, rows.length, 1).setNumberFormat('@'); // ID — всегда текст
    sheet.getRange(start, 1, rows.length, HEADERS.length).setValues(rows);

    // 3. отметка «duplicate»: один и тот же гость встречается больше одного раза
    var formulas = [];
    for (var r = 0; r < rows.length; r++) {
      var row = start + r;
      formulas.push(['=IF(COUNTIF($B$2:$B,B' + row + ')>1,"duplicate","")']);
    }
    sheet.getRange(start, COL_DUP, rows.length, 1).setFormulas(formulas);
  } finally {
    lock.releaseLock();
  }
}
