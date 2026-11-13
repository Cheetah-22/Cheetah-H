import { spotify } from "./_spotify.js";

// POST /api/add { uri: "spotify:track:..." } → agrega la canción a la playlist de la casa.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const uri = String(req.body?.uri || "");
  if (!/^spotify:track:[A-Za-z0-9]{22}$/.test(uri)) return res.status(400).json({ error: "bad uri" });
  try {
    const r = await spotify(`/playlists/${process.env.SPOTIFY_PLAYLIST_ID}/items`, {
      method: "POST",
      body: JSON.stringify({ uris: [uri] }),
    });
    if (!r.ok) throw new Error(`add ${r.status}: ${await r.text()}`);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "spotify" });
  }
}
