"use client";

import { useEffect, useRef, useState } from "react";
import { CONTENT, type Lang } from "@/lib/content";

type Track = { uri: string; name: string; artists: string; image: string | null };
type Song = { track_name: string; artists: string; image: string | null; added_by: string | null };
type OS = "ios" | "android" | "other";

const store = {
  get(k: string) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k: string, v: string) {
    try { localStorage.setItem(k, v); } catch {}
  },
};

function detectOS(): OS {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [name, setName] = useState("");
  const [os, setOS] = useState<OS>("other");
  const [copied, setCopied] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [added, setAdded] = useState<Record<string, "busy" | "done">>({});
  const [recent, setRecent] = useState<Song[]>([]);
  const guestId = useRef<string | null>(null);
  const t = CONTENT[lang];

  useEffect(() => {
    setLang(store.get("lang") === "es" ? "es" : "en");
    setName(store.get("name") ?? "");
    guestId.current = store.get("guestId");
    setOS(detectOS());
    loadRecent();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  async function loadRecent() {
    try {
      const r = await fetch("/api/songs");
      if (r.ok) setRecent((await r.json()).songs ?? []);
    } catch {}
  }

  function toggleLang() {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    store.set("lang", next);
  }

  // Nombre opcional: se guarda en el teléfono y en Supabase al salir del campo.
  async function saveName() {
    const n = name.trim();
    store.set("name", n);
    if (!n) return;
    try {
      const r = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId.current, name: n }),
      });
      if (r.ok) {
        const { id } = await r.json();
        guestId.current = id;
        store.set("guestId", id);
      }
    } catch {}
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(CONTENT.wifi.password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CONTENT.wifi.password;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setStatus("…");
    setResults([]);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail ?? `HTTP ${r.status}`);
      const { tracks } = (await r.json()) as { tracks: Track[] };
      setResults(tracks);
      setStatus(tracks.length ? "" : t.noResults);
    } catch (err) {
      setStatus(`${t.error} (${(err as Error).message})`);
    }
  }

  async function add(tr: Track) {
    setAdded((a) => ({ ...a, [tr.uri]: "busy" }));
    try {
      const r = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tr, guestId: guestId.current, addedBy: name.trim() || null }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail ?? `HTTP ${r.status}`);
      setAdded((a) => ({ ...a, [tr.uri]: "done" }));
      loadRecent();
    } catch (err) {
      setAdded((a) => {
        const { [tr.uri]: _, ...rest } = a;
        return rest;
      });
      setStatus(`${t.error} (${(err as Error).message})`);
    }
  }

  const F = CONTENT.flight;
  const passenger = name.trim();

  return (
    <main className="wrap">
      <header className="top">
        <span className="brand">
          <span className="star" aria-hidden="true">★</span> {t.airline}
        </span>
        <button className="lang" type="button" onClick={toggleLang} aria-label="Change language">
          {lang === "en" ? "ES" : "EN"}
        </button>
      </header>

      {/* Boarding pass */}
      <section className="ticket pass">
        <div className="ticket-head">
          <span className="airline">✈ {t.airline}</span>
          <span className="doc">{t.boardingPass}</span>
        </div>
        <div className="stripes" aria-hidden="true" />

        <div className="ticket-body">
          <div className="status-row">
            <span className="badge">● {t.boarding}</span>
            <span className="ontime">{t.status}</span>
          </div>

          <div className="route">
            <div>
              <span className="label">{t.from}</span>
              <span className="code">{F.fromCode}</span>
              <span className="city">🇺🇸 {t.fromCity}</span>
            </div>
            <div className="path" aria-hidden="true">
              <span className="dash" />
              <span className="jet">✈</span>
              <span className="dash" />
            </div>
            <div className="right">
              <span className="label">{t.to}</span>
              <span className="code">{F.toCode}</span>
              <span className="city">🇨🇱 {t.toCity}</span>
            </div>
          </div>

          <h1>{t.welcome}</h1>
          <p className="muted">{t.thrilled}</p>

          <label className="field passenger">
            <span className="label">{t.passenger}</span>
            <input
              type="text"
              autoComplete="given-name"
              maxLength={40}
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
            />
          </label>

          <div className="grid">
            <div className="field"><span className="label">{t.flightLabel}</span><strong>{F.number}</strong></div>
            <div className="field"><span className="label">{t.gate}</span><strong>{t.gateValue}</strong></div>
            <div className="field"><span className="label">{t.boardingTime}</span><strong className="red">{t.boardingValue}</strong></div>
            <div className="field"><span className="label">{t.seat}</span><strong>{t.seatValue}</strong></div>
            <div className="field"><span className="label">{t.classLabel}</span><strong>{t.classValue}</strong></div>
          </div>
        </div>

        <div className="perf" aria-hidden="true" />

        <div className="stub">
          <div className="barcode" aria-hidden="true" />
          <span className="stub-text">
            {passenger ? passenger.toUpperCase() : "GUEST"} · {F.number} · {F.fromCode} → {F.toCode}
          </span>
        </div>
      </section>

      {/* Flight information */}
      <section className="ticket">
        <div className="section-head">
          <h2>🛫 {t.infoTitle}</h2>
        </div>
        {t.info.map((p) => (
          <p className="info" key={p}>{p}</p>
        ))}
      </section>

      {/* House rules */}
      <section className="ticket">
        <div className="section-head">
          <h2>{t.rulesTitle}</h2>
          <span className="tag red">{t.rulesTag}</span>
        </div>
        <ol className="rules">
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      {/* Wi‑Fi */}
      <section className="ticket">
        <div className="section-head">
          <h2>📶 {t.wifiTitle}</h2>
        </div>
        <p className="info">{t.wifiInfo}</p>
        <div className="grid two">
          <div className="field"><span className="label">{t.network}</span><strong>{CONTENT.wifi.ssid}</strong></div>
          <div className="field"><span className="label">{t.password}</span><strong className="mono">{CONTENT.wifi.password}</strong></div>
        </div>
        {os !== "android" && (
          <div className="os">
            <a className="btn primary" href="/wifi.mobileconfig">{t.connectIphone}</a>
            <p className="help">{t.iphoneHelp}</p>
          </div>
        )}
        {os !== "ios" && (
          <div className="os">
            <button className="btn primary" type="button" onClick={copyPassword}>
              {copied ? t.copied : t.copy}
            </button>
            <p className="help">{t.androidHelp}</p>
          </div>
        )}
      </section>

      {/* Spotify */}
      <section className="ticket">
        <div className="section-head">
          <h2>🎶 {t.musicTitle}</h2>
        </div>
        <p className="info">{t.musicInfo}</p>
        <form className="search" onSubmit={search}>
          <input
            className="input"
            type="search"
            required
            placeholder={t.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" type="submit">{t.search}</button>
        </form>
        {status && <p className="help">{status}</p>}
        <ul className="results">
          {results.map((tr) => (
            <li key={tr.uri}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={tr.image ?? undefined} />
              <span className="meta">
                <span className="title">{tr.name}</span>
                <span className="artist">{tr.artists}</span>
              </span>
              <button className="btn add" type="button" disabled={!!added[tr.uri]} onClick={() => add(tr)}>
                {added[tr.uri] === "done" ? t.added : t.add}
              </button>
            </li>
          ))}
        </ul>

        {recent.length > 0 && (
          <>
            <h3 className="subhead">{t.recentTitle}</h3>
            <ul className="results recent">
              {recent.map((s, i) => (
                <li key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={s.image ?? undefined} />
                  <span className="meta">
                    <span className="title">{s.track_name}</span>
                    <span className="artist">
                      {s.artists}
                      {s.added_by ? ` · ${t.by(s.added_by)}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <a className="btn ghost" href={CONTENT.playlistUrl} target="_blank" rel="noopener">
          {t.openSpotify}
        </a>
      </section>

      <footer className="footer">
        <span className="star" aria-hidden="true">★</span> {t.footer}
      </footer>
    </main>
  );
}
