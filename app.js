(() => {
  const C = window.CONTENT;
  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // Idioma: inglés por defecto, español opcional.
  let lang = store.get("lang") === "es" ? "es" : "en";
  const t = () => C[lang];

  function render() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t()[el.dataset.t]; });
    $("#lang").textContent = lang === "en" ? "ES" : "EN";
    $("#name").placeholder = t().namePlaceholder;
    $("#q").placeholder = t().searchPlaceholder;
    $("#rules").innerHTML = "";
    t().rules.forEach((r) => { const li = document.createElement("li"); li.textContent = r; $("#rules").append(li); });
    renderHello();
  }

  $("#lang").addEventListener("click", () => {
    lang = lang === "en" ? "es" : "en";
    store.set("lang", lang);
    render();
  });

  // Nombre opcional (se guarda solo en este teléfono).
  const nameInput = $("#name");
  nameInput.value = store.get("name") || "";
  function renderHello() {
    const n = nameInput.value.trim();
    $("#hello").hidden = !n;
    if (n) $("#hello").textContent = t().hello(n);
  }
  nameInput.addEventListener("input", () => { store.set("name", nameInput.value.trim()); renderHello(); });

  // Wi‑Fi
  $("#ssid").textContent = C.wifi.ssid;
  $("#pwd").textContent = C.wifi.password;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  if (isIOS) $("#android").hidden = true;
  if (isAndroid) $("#ios").hidden = true;

  $("#copy").addEventListener("click", async () => {
    const btn = $("#copy");
    try {
      await navigator.clipboard.writeText(C.wifi.password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = C.wifi.password; document.body.append(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    btn.textContent = t().copied;
    setTimeout(() => { btn.textContent = t().copy; }, 2000);
  });

  // Spotify
  $("#open").href = C.playlistUrl;
  const status = (msg) => { $("#status").hidden = !msg; $("#status").textContent = msg || ""; };

  $("#search").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = $("#q").value.trim();
    if (!q) return;
    status("…");
    $("#results").innerHTML = "";
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error();
      const { tracks } = await r.json();
      status(tracks.length ? "" : t().noResults);
      tracks.forEach(addResult);
    } catch {
      status(t().error);
    }
  });

  function addResult(tr) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.alt = ""; if (tr.image) img.src = tr.image;
    const meta = document.createElement("span");
    meta.className = "meta";
    const title = document.createElement("span"); title.className = "title"; title.textContent = tr.name;
    const artist = document.createElement("span"); artist.className = "artist"; artist.textContent = tr.artists;
    meta.append(title, artist);
    const btn = document.createElement("button");
    btn.className = "btn"; btn.type = "button"; btn.textContent = t().add;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const r = await fetch("/api/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uri: tr.uri }),
        });
        if (!r.ok) throw new Error();
        btn.textContent = t().added;
      } catch {
        btn.disabled = false;
        status(t().error);
      }
    });
    li.append(img, meta, btn);
    $("#results").append(li);
  }

  render();
})();
