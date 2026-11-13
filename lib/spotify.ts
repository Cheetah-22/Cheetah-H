import "server-only";
import { getSetting, setSetting } from "./supabase";

const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";
const SCOPES = "playlist-modify-public playlist-modify-private";
export const TOKEN_KEY = "spotify_refresh_token";

function basicAuth() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export function redirectUri(origin: string) {
  return `${origin}/api/spotify/callback`;
}

export function authorizeUrl(origin: string) {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
    scope: SCOPES,
    redirect_uri: redirectUri(origin),
  });
  return `${ACCOUNTS}/authorize?${p}`;
}

async function tokenRequest(body: Record<string, string>) {
  const r = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { Authorization: basicAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!r.ok) throw new Error(`spotify token ${r.status}: ${await r.text()}`);
  return r.json() as Promise<{ access_token: string; expires_in: number; refresh_token?: string }>;
}

// Paso único: cambia el código del login por un refresh token y lo guarda en Supabase.
export async function connectAccount(code: string, origin: string) {
  const j = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri(origin) });
  if (!j.refresh_token) throw new Error("no refresh token");
  await setSetting(TOKEN_KEY, j.refresh_token);
}

let cached = { token: "", expires: 0 };
export function _resetCache() {
  cached = { token: "", expires: 0 };
}

// Access token de la cuenta del anfitrión.
async function accessToken() {
  if (cached.token && Date.now() < cached.expires) return cached.token;
  const refresh = await getSetting(TOKEN_KEY);
  if (!refresh) throw new Error("Spotify not connected: open /api/spotify/login");
  const j = await tokenRequest({ grant_type: "refresh_token", refresh_token: refresh });
  if (j.refresh_token && j.refresh_token !== refresh) await setSetting(TOKEN_KEY, j.refresh_token);
  cached = { token: j.access_token, expires: Date.now() + (j.expires_in - 60) * 1000 };
  return cached.token;
}

async function call(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`spotify ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}

export type Track = { uri: string; name: string; artists: string; image: string | null };

type SpotifyTrack = {
  uri: string;
  name: string;
  artists: { name: string }[];
  album?: { images?: { url: string }[] };
};

export async function searchTracks(q: string): Promise<Track[]> {
  const j = await call(`/search?type=track&limit=10&q=${encodeURIComponent(q)}`);
  return ((j.tracks?.items ?? []) as SpotifyTrack[]).map((t) => ({
    uri: t.uri,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(", "),
    image: t.album?.images?.at(-1)?.url ?? null,
  }));
}

export async function addToPlaylist(uri: string) {
  await call(`/playlists/${process.env.SPOTIFY_PLAYLIST_ID}/items`, {
    method: "POST",
    body: JSON.stringify({ uris: [uri] }),
  });
}

export const TRACK_URI = /^spotify:track:[A-Za-z0-9]{22}$/;
