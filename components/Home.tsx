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
      if (!r.ok) throw new Error();
      const { tracks } = (await r.json()) as { tracks: Track[] };
      setResults(tracks);
      setStatus(tracks.length ? "" : t.noResults);
    } catch {
      setStatus(t.error);
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
      if (!r.ok) throw new Error();
      setAdded((a) => ({ ...a, [tr.uri]: "done" }));
      loadRecent();
    } catch {
      setAdded((a) => {
        const { [tr.uri]: _, ...rest } = a;
        return rest;
      });
      setStatus(t.error);
    }
  }

  return (
    <main className="wrap">
      <header className="top">
        <span className="brand">🐆 Cheetahs House</span>
        <button className="lang" type="button" onClick={toggleLang} aria-label="Change language">
          {lang === "en" ? "ES" : "EN"}
        </button>
      </header>

      {/* Boarding pass */}
      <section className="pass">
        <div className="pass-head">
          <span className="badge">{t.boarding}</span>
          <span className="plane">✈️</span>
        </div>
        <h1>{t.welcome}</h1>
        <p className="muted">{t.thrilled}</p>
        {name.trim() && <p className="hello">{t.hello(name.trim())}</p>}
        <input
          className="input"
          type="text"
          autoComplete="given-name"
          maxLength={40}
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
        />
        <div className="perf" aria-hidden="true" />
        <h2>{t.rulesTitle}</h2>
        <ul className="rules">
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      {/* Wi‑Fi */}
      <section className="card">
        <h2>📶 {t.wifiTitle}</h2>
        <div className="row">
          <span className="label">{t.network}</span>
          <strong>{CONTENT.wifi.ssid}</strong>
        </div>
        <div className="row">
          <span className="label">{t.password}</span>
          <strong className="mono">{CONTENT.wifi.password}</strong>
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
      <section className="card">
        <h2>🎶 {t.musicTitle}</h2>
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
              <button className="btn" type="button" disabled={!!added[tr.uri]} onClick={() => add(tr)}>
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
    </main>
  );
}
