import { exchangeCode } from "./_spotify.js";

// Spotify vuelve aquí después del login del anfitrión y muestra el refresh token
// para guardarlo como variable secreta SPOTIFY_REFRESH_TOKEN en Vercel.
export default async function handler(req, res) {
  if (process.env.SPOTIFY_REFRESH_TOKEN) return res.status(404).send("Spotify already connected.");
  const code = req.query?.code;
  if (!code) return res.status(400).send(`Spotify login failed: ${req.query?.error || "no code"}`);
  try {
    const j = await exchangeCode(String(code), req);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width">
<body style="font-family:system-ui;padding:16px;max-width:640px;margin:auto">
<h1>✅ Spotify connected</h1>
<p>Copy this value into the Vercel environment variable <b>SPOTIFY_REFRESH_TOKEN</b>, then redeploy. Don't share it.</p>
<textarea readonly style="width:100%;height:140px">${j.refresh_token}</textarea>
</body>`);
  } catch (e) {
    console.error(e);
    res.status(502).send("Could not connect to Spotify.");
  }
}
