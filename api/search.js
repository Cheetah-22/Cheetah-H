import { spotify } from "./_spotify.js";

// GET /api/search?q=texto → canciones para que el invitado elija.
export default async function handler(req, res) {
  const q = String(req.query?.q || "").trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: "missing q" });
  try {
    const r = await spotify(`/search?type=track&limit=10&q=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error(`search ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const tracks = (j.tracks?.items || []).map((t) => ({
      uri: t.uri,
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      image: t.album?.images?.at(-1)?.url || null,
    }));
    res.status(200).json({ tracks });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "spotify" });
  }
}
