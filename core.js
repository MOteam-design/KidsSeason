/* Сезон Саши — общие данные для index.html (Саша) и papa.html (папа).
   Меняете задания, баллы или штрафы — меняйте только здесь, обе страницы пересчитаются одинаково. */
(function () {
  "use strict";

  // Задания: t — название, pts — рубли (1 балл = 1 ₽), kind — цвет на странице
  const T = {
    z:  { t: "Зарядка 10 минут", pts: 10, kind: "sport" },
    f1: { t: "Завтрак с белком", pts: 4, kind: "food" },
    f2: { t: "Перекус-заряд", pts: 4, kind: "food" },
    f3: { t: "Ужин чемпиона", pts: 4, kind: "food" },
    u1: { t: "Сел за уроки сам, без напоминаний", pts: 10, kind: "study" },
    u2: { t: "Все уроки сделаны", pts: 20, kind: "study" },
    p:  { t: "Пианино дома 15 минут", pts: 20, kind: "music" },
    pl: { t: "Урок пианино", pts: 20, kind: "music" },
    kb: { t: "Кикбоксинг", pts: 20, kind: "sport" },
    pr: { t: "Программирование", pts: 20, kind: "study" },
    ft: { t: "Футбол или игра на улице 30 минут", pts: 20, kind: "sport" },
    ex: { t: "Вылазка: парк, усадьба или музей", pts: 20, kind: "out" },
    ol: { t: "Олимпиадные задачи 15 минут", pts: 20, kind: "study" },
    r:  { t: "Чтение 20 минут", pts: 10, kind: "read" },
    h:  { t: "Дело по дому", pts: 10, kind: "home" },
    s:  { t: "Отбой вовремя", pts: 10, kind: "sleep" }
  };

  const KIND = {
    sport: "Спорт", food: "Еда", study: "Учёба", music: "Музыка",
    out: "Вылазка", read: "Книга", home: "Дом", sleep: "Сон", puzzle: "Задачка"
  };

  // Дело по дому на каждый день недели (0 = Пн)
  const CHORES = [
    "Собери портфель и форму на завтра",
    "Вынеси мусор",
    "Накрой на стол и убери после ужина",
    "Наведи порядок на столе и полке",
    "Пропылесось свою комнату",
    "Помоги с покупками или с готовкой",
    "Разбери чистое бельё и сложи своё"
  ];

  // План недели. i: 0 = Пн … 6 = Вс
  const PLAN = [
    /* Пн */ [["z","7:10"],["f1","7:30"],["f2","после школы"],["u1","15:00"],["u2","до 16:30"],["pl","17:00"],["f3","19:00"],["p","19:30"],["h","20:00"],["r","20:30"],["s","21:30"]],
    /* Вт */ [["z","7:10"],["f1","7:30"],["u1","15:00"],["u2","до 16:15"],["f2","16:15"],["kb","17:00"],["f3","19:00"],["p","19:40"],["h","20:00"],["r","20:30"],["s","21:30"]],
    /* Ср */ [["z","7:10"],["f1","7:30"],["u1","14:30"],["u2","до 15:30"],["f2","15:30"],["pr","16:00"],["f3","18:45"],["p","19:30"],["h","20:00"],["r","20:30"],["s","21:30"]],
    /* Чт */ [["z","7:10"],["f1","7:30"],["u1","15:00"],["u2","до 16:15"],["f2","16:15"],["kb","17:00"],["f3","19:00"],["p","19:40"],["h","20:00"],["r","20:30"],["s","21:30"]],
    /* Пт */ [["z","7:10"],["f1","7:30"],["f2","после школы"],["ft","16:00"],["f3","19:00"],["p","19:30"],["h","20:00"],["r","20:30"],["s","22:00"]],
    /* Сб */ [["z","9:30"],["f1","10:00"],["ol","11:00"],["ex","днём"],["f2","днём"],["f3","19:00"],["p","19:30"],["h","20:00"],["r","20:30"],["s","22:00"]],
    /* Вс */ [["z","9:30"],["f1","10:00"],["ex","днём"],["f2","днём"],["ol","16:00"],["u1","17:00"],["u2","до 18:30"],["f3","19:00"],["p","19:30"],["h","20:00"],["r","20:30"],["s","21:30"]]
  ];
  function plan(i) {
    return PLAN[i].map(([k, time]) => {
      let title = T[k].t;
      if (k === "s") title = "Отбой в " + time;
      if (k === "h") title = "Дело по дому: " + CHORES[i].charAt(0).toLowerCase() + CHORES[i].slice(1);
      return { k, time: k === "s" ? "" + time : time, title, pts: T[k].pts, kind: T[k].kind };
    });
  }

  // Бонусы недели
  const BONUS = [
    { id: "p7", t: "Пианино все 7 дней", pts: 60 },
    { id: "r7", t: "Чтение все 7 дней", pts: 40 },
    { id: "u",  t: "Каждый раз сел за уроки сам", pts: 60 }
  ];
  const BOOK_PTS = 40; // за каждую дочитанную книгу
  const PZ_PTS = 10;   // за решённую задачку дня

  // Штрафы (их выписывает только папа)
  const FINES = [
    { id: "g3", t: "Тройка", a: 50 },
    { id: "g2", t: "Двойка", a: 100 },
    { id: "mu", t: "Не сделал задание по музыке", a: 50 },
    { id: "x",  t: "Другое (сумму указывает папа)", a: 0 }
  ];

  const LEVELS = [
    [0, "Дворовый игрок"], [300, "Школа футбола"], [900, "Академия"], [1800, "Молодёжка"],
    [3000, "Основной состав"], [4500, "Капитан"], [6500, "Сборная"], [9000, "Золотой мяч"]
  ];

  // ---------- даты ----------
  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dowOf = d => (d.getDay() + 6) % 7;
  const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -dowOf(x)); };
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

  // Поделиться: системное меню телефона; если его нет — вернём "fallback"
  async function share(text) {
    if (navigator.share) {
      try { await navigator.share({ text }); return "shared"; }
      catch (e) { if (e && e.name === "AbortError") return "abort"; }
    }
    return "fallback";
  }

  // ---------- подсчёт недели ----------
  // eff(date, key) -> засчитано ли; books: [{d}], fines: [{d,a}]
  // Награда за дочитанную книгу. Книга от папы (b.id): его награда, успел к сроку — вся, позже — половина.
  // Своя книга: BOOK_PTS.
  function bookPts(b, assign) {
    if (b && b.id) {
      const a = (assign || []).find(x => x.id === b.id);
      if (a) return b.d <= a.due ? (+a.rw || 0) : Math.round((+a.rw || 0) / 2);
    }
    return BOOK_PTS;
  }
  // Подсказки для папы по числу страниц: дней на чтение (~20 стр. в день) и награда
  const suggestDays = pg => Math.max(1, Math.ceil((+pg || 0) / 20));
  const suggestReward = pg => Math.min(200, Math.max(20, Math.round((+pg || 0) * 0.4 / 10) * 10));

  // pz: {дата: id задачки} — задачка дня от папы, за решение PZ_PTS (ключ отметки "zq")
  function week(mon, eff, books, fines, assign, pz) {
    let base = 0, max = 0, pd = 0, rd = 0, uDays = 0, uOk = 0, pzN = 0, pzOk = 0;
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
          if (it.k === "p") pd++;
          if (it.k === "r") rd++;
          if (it.k === "u1") uOk++;
        }
      }
      base += got; max += dm;
      days.push({ d, got, max: dm });
    }
    const from = iso(mon), to = iso(addDays(mon, 6));
    const bon = [];
    if (pd === 7) bon.push(BONUS[0]);
    if (rd === 7) bon.push(BONUS[1]);
    if (uOk === uDays) bon.push(BONUS[2]);
    const bk = (books || []).filter(b => b.d >= from && b.d <= to);
    bk.forEach(b => { b.pts = bookPts(b, assign); });
    const bonus = bon.reduce((s, b) => s + b.pts, 0) + bk.reduce((s, b) => s + b.pts, 0);
    const fi = (fines || []).filter(f => f.d >= from && f.d <= to);
    const fsum = fi.reduce((s, f) => s + (+f.a || 0), 0);
    const total = Math.max(0, base + bonus - fsum);
    const maxAll = max + BONUS.reduce((s, b) => s + b.pts, 0);
    return { from, to, base, bonus, bon, books: bk, fines: fi, fsum, total, max: maxAll, days, pd, rd, uOk, uDays, pzN, pzOk };
  }

  function level(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { i, name: cur[1], from: cur[0], next: next ? next[0] : null, nextName: next ? next[1] : null };
  }

  // Подряд дней (считая сегодня, если уже сделано, иначе со вчера)
  function streak(eff, key, today) {
    let d = new Date(today), n = 0;
    if (!eff(iso(d), key)) d = addDays(d, -1);
    while (eff(iso(d), key) && n < 400) { n++; d = addDays(d, -1); }
    return n;
  }

  window.SC = { T, KIND, CHORES, plan, BONUS, BOOK_PTS, PZ_PTS, FINES, LEVELS, bookPts, suggestDays, suggestReward,
    iso, parse, addDays, dowOf, mondayOf, dayLong, range, DSHORT, MON, rub,
    LS, enc, dec, readHash, clearHash, pageURL, share, week, level, streak };
})();
