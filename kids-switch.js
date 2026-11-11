/* Переключатель «Саша / Даня» для страниц папы (papa.html и papa-danya.html).
   Подключать после core.js (window.SC) и danya-core.js (window.DC).
   1) Если открыта ссылка-отчёт не того ребёнка — переходим на нужную страницу.
   2) Рисует в <nav id="kids"> две вкладки с суммой к переводу за текущую неделю. */
(function () {
  "use strict";
  const SC = window.SC, DC = window.DC;
  const here = /papa-danya\.html$/i.test(location.pathname) ? "danya" : "sasha";
  const page = { sasha: "papa.html", danya: "papa-danya.html" };

  // --- перенаправление отчёта ---
  const m = location.hash.match(/[#&]r=([A-Za-z0-9_-]+)/);
  if (m && SC) {
    let who = null;
    try { const r = SC.dec(m[1]); who = r && r.c === "danya" ? "danya" : "sasha"; } catch (e) {}
    if (who && who !== here) { location.replace(page[who] + location.hash); window.KIDS_REDIRECT = true; }
  }

  function get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function total(C, p) {
    if (!C) return 0;
    const days = get(p + "-days", {}), ov = get(p + "-ov", {});
    const eff = (d, k) => { const o = ov[d]; if (o && o[k] !== undefined) return o[k] === 1; return !!(days[d] && days[d].includes(k)); };
    const books = get(p + "-books", { list: [] });
    try { return C.week(C.mondayOf(new Date()), eff, books.list || [], get(p + "-fi", []), get(p + "-as", []), get(p + "-pz", {}), get(p + "-enot", {}), get(p + "-ev", {})).total; }
    catch (e) { return 0; }
  }
  function draw() {
    const nav = document.getElementById("kids"); if (!nav) return;
    const s = total(SC, "pa"), d = total(DC, "dr");
    const rub = n => n.toLocaleString("ru-RU") + " ₽";
    nav.innerHTML =
      `<a href="${page.sasha}" ${here === "sasha" ? 'aria-current="page"' : ""}><span>Саша</span><b>${rub(s)}</b></a>` +
      `<a href="${page.danya}" ${here === "danya" ? 'aria-current="page"' : ""}><span>Даня</span><b>${rub(d)}</b></a>` +
      `<span class="kids-sum">всего за неделю<b>${rub(s + d)}</b></span>`;
  }
  window.KIDS = { draw, here };
  if (!window.KIDS_REDIRECT) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
  }
})();
