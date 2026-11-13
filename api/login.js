import { authorizeUrl } from "./_spotify.js";

// Paso único de configuración: el anfitrión entra a /api/login y conecta su cuenta de Spotify.
// Una vez guardado SPOTIFY_REFRESH_TOKEN, esta ruta se desactiva.
export default function handler(req, res) {
  if (process.env.SPOTIFY_REFRESH_TOKEN) return res.status(404).send("Spotify already connected.");
  res.redirect(302, authorizeUrl(req));
}
