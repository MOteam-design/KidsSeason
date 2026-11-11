/* Экспедиция Дани — общие данные для danya.html (Даня) и papa.html (папа, общий с Сашей).
   Меняете задания, баллы, штрафы или время — меняйте только здесь, обе страницы пересчитаются одинаково.
   Ключи localStorage: dn-* (Даня) и dr-* (родитель). Они не пересекаются с Сашей (sa-/pa-) и Семёном (sm-),
   хотя все сайты живут на одном адресе moteam-design.github.io. */
(function () {
  "use strict";

  // Родитель — папа (общий с Сашей, страница papa.html)
  const P = { nom: "Папа", dat: "папе", gen: "папы", a: "" };

  // Задания: t — название, pts — рубли (1 балл = 1 ₽), kind — цвет на странице
  const T = {
    z:  { t: "Зарядка-баланс 10 минут", pts: 10, kind: "sport" },
    sl: { t: "Сила и ловкость 16 минут", pts: 20, kind: "sport" },
    kb: { t: "Кикбоксинг", pts: 20, kind: "sport" },
    wk: { t: "Гулять с друзьями", pts: 10, kind: "out" },
    f1: { t: "Завтрак", pts: 5, kind: "food" },
    f2: { t: "Перекус-заряд", pts: 5, kind: "food" },
    f3: { t: "Ужин", pts: 5, kind: "food" },
    fn: { t: "Проба вкуса: что-то новое", pts: 10, kind: "food" },
    u1: { t: "Сел за уроки сам, без напоминаний", pts: 10, kind: "study" },
    u2: { t: "Все уроки сделаны", pts: 10, kind: "study" },
    m:  { t: "Математика спокойно: 10 минут", pts: 10, kind: "math" },
    fr: { t: "Французский: 5 слов", pts: 10, kind: "fr" },
    pr: { t: "Программирование", pts: 20, kind: "study" },
    ol: { t: "Олимпиада «Музеи. Парки. Усадьбы»", pts: 20, kind: "out" },
    ex: { t: "Вылазка: парк, усадьба или музей", pts: 20, kind: "out" },
    pc: { t: "Умный подкаст и один факт", pts: 10, kind: "read" },
    po: { t: "Стихотворение недели", pts: 20, kind: "read" },
    r:  { t: "Чтение или аудиокнига 20 минут", pts: 10, kind: "read" },
    bg: { t: "Настолка с семьёй или друзьями", pts: 10, kind: "game" },
    mo: { t: "Как прошёл день", pts: 5, kind: "mood" },
    h:  { t: "Дело по дому", pts: 10, kind: "home" },
    s:  { t: "Отбой вовремя", pts: 10, kind: "sleep" }
  };

  const KIND = {
    sport: "Тело", food: "Еда", study: "Учёба", math: "Математика", fr: "Français",
    out: "Экспедиция", read: "Слово", game: "Игра", mood: "Настроение", home: "Дом", sleep: "Сон"
  };

  // Дело по дому на каждый день недели (0 = Пн)
  const CHORES = [
    "Собери рюкзак и форму на завтра",
    "Вынеси мусор",
    "Накрой на стол и убери после ужина",
    "Наведи порядок на столе и полке",
    "Пропылесось свою комнату",
    "Приготовь что-нибудь вместе со взрослым",
    "Разбери чистое бельё и сложи своё"
  ];

  // План недели. i: 0 = Пн … 6 = Вс. Время примерное — поправьте здесь.
  const PLAN = [
    /* Пн */ [["z","7:10"],["f1","7:30"],["f2","после школы"],["u1","15:30"],["u2","до 17:00"],["m","17:00"],["fr","17:15"],["sl","18:00"],["f3","19:00"],["fn","за ужином"],["h","20:00"],["mo","20:30"],["r","21:00"],["s","22:00"]],
    /* Вт */ [["z","7:10"],["f1","7:30"],["u1","15:15"],["u2","до 16:15"],["f2","16:15"],["kb","17:00"],["f3","19:00"],["fn","за ужином"],["m","19:45"],["fr","20:00"],["h","20:15"],["mo","20:30"],["r","21:00"],["s","22:00"]],
    /* Ср */ [["z","7:10"],["f1","7:30"],["f2","после школы"],["u1","15:30"],["u2","до 17:00"],["m","17:00"],["fr","17:15"],["pc","17:30"],["sl","18:15"],["f3","19:00"],["fn","за ужином"],["h","20:00"],["mo","20:30"],["r","21:00"],["s","22:00"]],
    /* Чт */ [["z","7:10"],["f1","7:30"],["u1","15:15"],["u2","до 16:15"],["f2","16:15"],["kb","17:00"],["f3","19:00"],["fn","за ужином"],["m","19:45"],["fr","20:00"],["h","20:15"],["mo","20:30"],["r","21:00"],["s","22:00"]],
    /* Пт */ [["z","7:10"],["f1","7:30"],["f2","после школы"],["sl","16:00"],["wk","17:00"],["f3","19:00"],["fn","за ужином"],["bg","20:00"],["h","20:45"],["mo","21:00"],["r","21:30"],["s","22:30"]],
    /* Сб */ [["z","9:30"],["f1","10:00"],["pr","12:00"],["f2","14:00"],["ol","15:00"],["pc","16:00"],["f3","19:00"],["fn","за ужином"],["bg","20:00"],["h","20:45"],["mo","21:00"],["r","21:30"],["s","22:30"]],
    /* Вс */ [["z","9:30"],["f1","10:00"],["ex","днём"],["f2","днём"],["u1","16:30"],["u2","до 18:00"],["m","18:00"],["fr","18:15"],["po","18:30"],["f3","19:00"],["fn","за ужином"],["h","20:00"],["mo","20:30"],["r","21:00"],["s","22:00"]]
  ];
  function plan(i) {
    return PLAN[i].map(([k, time]) => {
      let title = T[k].t;
      if (k === "s") title = "Отбой в " + time;
      if (k === "h") title = "Дело по дому: " + CHORES[i].charAt(0).toLowerCase() + CHORES[i].slice(1);
      return { k, time: k === "s" ? "" : time, title, pts: T[k].pts, kind: T[k].kind };
    });
  }

  // Бонусы недели
  const BONUS = [
    { id: "z7", t: "Зарядка все 7 дней", pts: 30 },
    { id: "f5", t: "Пробовал новое 5 дней из 7", pts: 40 },
    { id: "u",  t: "Каждый раз сел за уроки сам", pts: 30 }
  ];
  const BOOK_PTS = 40; // своя книга или аудиокнига
  const PZ_PTS = 10;   // задачка дня от папы

  // Штрафы (выписывает только родитель). Для ранимого ребёнка — редко и после предупреждения.
  const FINES = [
    { id: "g2", t: "Двойка", a: 50 },
    { id: "hw", t: "Не сделал уроки", a: 30 },
    { id: "pc", t: "Нарушил договор о компьютере", a: 30 },
    { id: "x",  t: "Другое (сумму указывает " + P.nom.toLowerCase() + ")", a: 0 }
  ];

  const LEVELS = [
    [0, "Считатель ворон"], [300, "Наблюдатель"], [900, "Следопыт"], [1800, "Исследователь"],
    [3000, "Картограф"], [4500, "Капитан экспедиции"], [6500, "Мудрец"], [9000, "Легенда"]
  ];

  const MOODS = [
    [5, "😄", "Отлично"], [4, "🙂", "Хорошо"], [3, "😐", "Так себе"], [2, "😟", "Грустно"], [1, "😣", "Тяжело"]
  ];

  // Лестница пробы новой еды: любая ступенька засчитывается
  const TASTE = [
    [1, "Посмотрел и положил рядом с тарелкой"],
    [2, "Понюхал"],
    [3, "Потрогал или лизнул"],
    [4, "Откусил — можно выплюнуть в салфетку"],
    [5, "Прожевал и проглотил кусочек"],
    [6, "Съел порцию"]
  ];

  // ---------- даты ----------
  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dowOf = d => (d.getDay() + 6) % 7;
  const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -dowOf(x)); };
  const dayNum = d => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5);
  const MON = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const DAYS = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
  const DSHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const dayLong = d => DAYS[dowOf(d)] + ", " + d.getDate() + " " + MON[d.getMonth()];
  function range(mon) {
    const sun = addDays(mon, 6);
    return mon.getMonth() === sun.getMonth()
      ? mon.getDate() + "–" + sun.getDate() + " " + MON[sun.getMonth()]
      : mon.getDate() + " " + MON[mon.getMonth()] + " – " + sun.getDate() + " " + MON[sun.getMonth()];
  }
  const rub = n => n.toLocaleString("ru-RU") + " ₽";

  // ---------- хранение ----------
  const LS = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- ссылки ----------
  function enc(o) {
    const s = unescape(encodeURIComponent(JSON.stringify(o)));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function dec(t) {
    t = t.replace(/-/g, "+").replace(/_/g, "/");
    while (t.length % 4) t += "=";
    return JSON.parse(decodeURIComponent(escape(atob(t))));
  }
  function readHash(key) {
    const m = location.hash.match(new RegExp("[#&]" + key + "=([A-Za-z0-9_-]+)"));
    if (!m) return null;
    try { return dec(m[1]); } catch (e) { return null; }
  }
  function clearHash() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  const pageURL = (file) => { const u = new URL(file, location.href); u.hash = ""; u.search = ""; return u.href; };

  async function share(text) {
    if (navigator.share) {
      try { await navigator.share({ text }); return "shared"; }
      catch (e) { if (e && e.name === "AbortError") return "abort"; }
    }
    return "fallback";
  }

  // ---------- подсчёт недели ----------
  function bookPts(b, assign) {
    if (b && b.id) {
      const a = (assign || []).find(x => x.id === b.id);
      if (a) return b.d <= a.due ? (+a.rw || 0) : Math.round((+a.rw || 0) / 2);
    }
    return BOOK_PTS;
  }
  const suggestDays = pg => Math.max(1, Math.ceil((+pg || 0) / 25));
  const suggestReward = pg => Math.min(250, Math.max(20, Math.round((+pg || 0) * 0.4 / 10) * 10));

  // pz: {дата: id задачки из puzzles.js} — задачка дня от папы, за решение PZ_PTS (ключ отметки "zq")
  // en/ev — курс «Енот Чек» (enot.js): сверх лимита, в max не входит
  function week(mon, eff, books, fines, assign, pz, en, ev) {
    let base = 0, max = 0, zd = 0, fd = 0, uDays = 0, uOk = 0, sd = 0, pzN = 0, pzOk = 0;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = iso(addDays(mon, i));
      let got = 0, dm = 0;
      if (pz && pz[d]) { pzN++; dm += PZ_PTS; if (eff(d, "zq")) { got += PZ_PTS; pzOk++; } }
      for (const it of plan(i)) {
        dm += it.pts;
        if (it.k === "u1") uDays++;
        if (eff(d, it.k)) {
          got += it.pts;
          if (it.k === "z") zd++;
          if (it.k === "fn") fd++;
          if (it.k === "u1") uOk++;
          if (it.k === "sl" || it.k === "kb") sd++;
        }
      }
      base += got; max += dm;
      days.push({ d, got, max: dm });
    }
    const from = iso(mon), to = iso(addDays(mon, 6));
    const bon = [];
    if (zd === 7) bon.push(BONUS[0]);
    if (fd >= 5) bon.push(BONUS[1]);
    if (uDays && uOk === uDays) bon.push(BONUS[2]);
    const bk = (books || []).filter(b => b.d >= from && b.d <= to);
    bk.forEach(b => { b.pts = bookPts(b, assign); });
    const bonus = bon.reduce((s, b) => s + b.pts, 0) + bk.reduce((s, b) => s + b.pts, 0);
    const fi = (fines || []).filter(f => f.d >= from && f.d <= to);
    const fsum = fi.reduce((s, f) => s + (+f.a || 0), 0);
    const enot = window.ENOT ? window.ENOT.sum(en, ev, from, to) : { n: 0, sum: 0, list: [] };
    const total = Math.max(0, base + bonus + enot.sum - fsum);
    const maxAll = max + BONUS.reduce((s, b) => s + b.pts, 0);
    return { from, to, base, bonus, bon, books: bk, fines: fi, fsum, total, max: maxAll, days, zd, fd, uOk, uDays, sd, pzN, pzOk, enot };
  }

  function level(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { i, name: cur[1], from: cur[0], next: next ? next[0] : null, nextName: next ? next[1] : null };
  }

  function streak(eff, key, today) {
    let d = new Date(today), n = 0;
    if (!eff(iso(d), key)) d = addDays(d, -1);
    while (eff(iso(d), key) && n < 400) { n++; d = addDays(d, -1); }
    return n;
  }

  window.DC = { P, T, KIND, CHORES, plan, BONUS, BOOK_PTS, PZ_PTS, FINES, LEVELS, MOODS, TASTE, bookPts, suggestDays, suggestReward,
    iso, parse, addDays, dowOf, mondayOf, dayNum, dayLong, range, DSHORT, MON, rub,
    LS, enc, dec, readHash, clearHash, pageURL, share, week, level, streak };
})();
