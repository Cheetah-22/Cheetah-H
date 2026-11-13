// Helpers compartidos para Spotify. Los archivos que empiezan con "_" no son rutas públicas en Vercel.

const ACCOUNTS = "https://accounts.spotify.com";
const API = "https://api.spotify.com/v1";

export const SCOPES = "playlist-modify-public playlist-modify-private";

export function basicAuth() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export function redirectUri(req) {
  return `https://${req.headers.host}/api/callback`;
}

let cached = { token: null, expires: 0 };

// Access token de la cuenta del anfitrión, obtenido con el refresh token guardado como variable secreta.
export async function accessToken() {
  if (cached.token && Date.now() < cached.expires) return cached.token;
  const r = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { Authorization: basicAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  const j = await r.json();
  cached = { token: j.access_token, expires: Date.now() + (j.expires_in - 60) * 1000 };
  return cached.token;
}

export async function spotify(path, init = {}) {
  const token = await accessToken();
  return fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

export async function exchangeCode(code, req) {
  const r = await fetch(`${ACCOUNTS}/api/token`, {
    method: "POST",
    headers: { Authorization: basicAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(req) }),
  });
  if (!r.ok) throw new Error(`exchange ${r.status}: ${await r.text()}`);
  return r.json();
}

export function authorizeUrl(req) {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: redirectUri(req),
  });
  return `${ACCOUNTS}/authorize?${p}`;
}

export function _resetCache() { cached = { token: null, expires: 0 }; }
