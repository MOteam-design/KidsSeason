/* Автосинхронизация через закрытый репозиторий GitHub (без бота и без сервера).
   Общий модуль для Саши и Дани. Данные лежат в репозитории REPO:
     sasha/child.json — пишет страница Саши,  sasha/papa.json — пишет папа (papa.html)
     danya/child.json — пишет страница Дани,  danya/papa.json — пишет папа (papa-danya.html)
   У каждого файла один писатель, поэтому конфликтов нет.
   Ключ (fine-grained token, доступ только к REPO, Contents: Read and write) хранится в localStorage
   под KEY. Его вводят один раз в поле на странице или открывают ссылку …#k=<ключ>. */
(function () {
  "use strict";
  const REPO = "MOteam-design/KidsData", BRANCH = "main", KEY = "kids-sync-key";
  const API = "https://api.github.com/repos/" + REPO + "/contents/";
  const shas = {};
  const st = { state: "off", at: 0, err: "" };   // off | ok | err | busy
  const listeners = [];

  function getKey() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function setKey(k) { try { if (k) localStorage.setItem(KEY, k.trim()); else localStorage.removeItem(KEY); } catch (e) {} st.state = k ? "ok" : "off"; emit(); }
  function emit() { listeners.forEach(f => { try { f(st); } catch (e) {} }); }
  function on(f) { listeners.push(f); f(st); }
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  const unb64 = s => decodeURIComponent(escape(atob(String(s).replace(/\s/g, ""))));
  function hdr() { return { "Authorization": "Bearer " + getKey(), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }; }
  function fail(e) { st.state = "err"; st.err = e && e.message ? e.message : String(e); emit(); return null; }

  // Прочитать JSON. null — файла нет или нет ключа.
  async function read(path) {
    if (!getKey()) return null;
    try {
      const r = await fetch(API + path + "?ref=" + BRANCH + "&t=" + Date.now(), { headers: hdr(), cache: "no-store" });
      if (r.status === 404) { delete shas[path]; st.state = "ok"; st.at = Date.now(); emit(); return null; }
      if (r.status === 401 || r.status === 403) throw new Error(r.status === 401 ? "ключ не подходит или истёк" : "нет доступа к репозиторию");
      if (!r.ok) throw new Error("GitHub ответил " + r.status);
      const j = await r.json(); shas[path] = j.sha;
      st.state = "ok"; st.at = Date.now(); emit();
      return JSON.parse(unb64(j.content));
    } catch (e) { return fail(e); }
  }

  // Записать JSON (с одной повторной попыткой при устаревшем sha).
  async function write(path, obj, msg) {
    if (!getKey()) return false;
    const body = sha => JSON.stringify({ message: msg || ("update " + path), content: b64(JSON.stringify(obj)), branch: BRANCH, ...(sha ? { sha } : {}) });
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (!(path in shas) || attempt) {
          const r0 = await fetch(API + path + "?ref=" + BRANCH + "&t=" + Date.now(), { headers: hdr(), cache: "no-store" });
          if (r0.ok) shas[path] = (await r0.json()).sha; else if (r0.status === 404) shas[path] = null;
          else if (r0.status === 401 || r0.status === 403) throw new Error(r0.status === 401 ? "ключ не подходит или истёк" : "нет доступа к репозиторию");
        }
        const r = await fetch(API + path, { method: "PUT", headers: { ...hdr(), "Content-Type": "application/json" }, body: body(shas[path]) });
        if (r.ok) { shas[path] = (await r.json()).content.sha; st.state = "ok"; st.at = Date.now(); emit(); return true; }
        if (r.status !== 409 && r.status !== 422) throw new Error("запись: GitHub ответил " + r.status);
      }
      throw new Error("не удалось записать " + path);
    } catch (e) { fail(e); return false; }
  }

  // Отложенная запись: много отметок подряд → одна запись через delay мс
  const timers = {};
  function writeSoon(path, getObj, delay) {
    clearTimeout(timers[path]);
    timers[path] = setTimeout(() => { write(path, getObj()); }, delay == null ? 2500 : delay);
  }

  // Периодическое чтение: при открытии, каждые sec секунд и при возврате в приложение
  function poll(fn, sec) {
    if (!getKey()) return;
    fn();
    setInterval(() => { if (!document.hidden) fn(); }, (sec || 60) * 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) fn(); });
  }

  var SYNC_FROM_LINK = false;
  // Ключ из ссылки …#k=… (одноразовая настройка телефона)
  (function fromHash() {
    const m = location.hash.match(/[#&]k=([A-Za-z0-9_]+)/);
    if (m) { setKey(m[1]); try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} SYNC_FROM_LINK = true; }
  })();

  // Готовый блок настройки: <div data-sync-box></div> на странице
  function mountBox(box) {
    if (!box) return;
    box.innerHTML = `<span class="sync-st"></span>
      <details class="sync-set"><summary>Ключ синхронизации</summary>
        <div class="sync-row"><input type="password" class="sync-in" placeholder="github_pat_…" autocomplete="off"><button type="button" class="sync-save">Сохранить</button></div>
        <small>Ключ вводится один раз на этом телефоне. Ключ присылает Катя. Без ключа всё работает по-старому, через ссылки.</small>
        <button type="button" class="sync-del">Удалить ключ с телефона</button>
      </details>`;
    const s = box.querySelector(".sync-st");
    on(x => {
      const t = x.at ? new Date(x.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
      s.className = "sync-st " + x.state;
      s.textContent = !getKey() ? "Автосинхронизация выключена: нет ключа" : x.state === "err" ? "Ошибка синхронизации: " + x.err : x.at ? "Синхронизировано в " + t : "Синхронизация…";
    });
    box.querySelector(".sync-save").onclick = () => { const v = box.querySelector(".sync-in").value.trim(); if (!v) return; setKey(v); location.reload(); };
    box.querySelector(".sync-del").onclick = () => { if (confirm("Удалить ключ с этого телефона?")) { setKey(""); location.reload(); } };
  }

  window.SYNC = { REPO, getKey, setKey, read, write, writeSoon, poll, on, mountBox, get fromLink() { return SYNC_FROM_LINK; }, get enabled() { return !!getKey(); } };
})();
