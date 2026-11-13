// ✏️ Contenido de la app — edita este archivo para cambiar textos, reglas, Wi‑Fi o playlist.
// Si cambias la clave Wi‑Fi, actualízala también en public/wifi.mobileconfig (perfil para iPhone).

export const CONTENT = {
  wifi: {
    ssid: "Cheetah",
    password: "Iwantchocolate!",
  },

  // Link público de la playlist (botón "Abrir en Spotify").
  playlistUrl: "https://open.spotify.com/playlist/3sxX9icP8ZiFixqN1ElxlO",

  en: {
    lang: "EN",
    boarding: "Now boarding",
    welcome: "Welcome to our home! 🏠",
    thrilled: "We're thrilled to have you.",
    namePlaceholder: "Your name (optional)",
    hello: (n: string) => `Welcome aboard, ${n}! ✈️`,
    rulesTitle: "House rules",
    rules: [
      "👟 Shoes off, vibes on",
      "✈️ Compliment Cami on her model planes",
      "🎶 Share your fave song for the playlist",
      "💃 Dancing is required",
    ],
    wifiTitle: "Wi‑Fi",
    network: "Network",
    password: "Password",
    connectIphone: "Connect to Wi‑Fi",
    iphoneHelp: "Tap the button, choose “Allow”, then open Settings → Profile Downloaded → Install.",
    copy: "Copy password",
    copied: "Copied! ✅",
    androidHelp: "Copy the password, open Wi‑Fi settings, pick “Cheetah” and paste it.",
    musicTitle: "Playlist",
    searchPlaceholder: "Search a song or artist…",
    search: "Search",
    add: "Add",
    added: "Added 🎶",
    noResults: "No songs found.",
    error: "Something went wrong. Try again or open the playlist in Spotify.",
    openSpotify: "Open playlist in Spotify",
    recentTitle: "Recently added",
    by: (n: string) => `by ${n}`,
  },

  es: {
    lang: "ES",
    boarding: "Embarque inmediato",
    welcome: "¡Bienvenidos a nuestra casa! 🏠",
    thrilled: "Nos encanta tenerlos aquí.",
    namePlaceholder: "Tu nombre (opcional)",
    hello: (n: string) => `¡Bienvenido a bordo, ${n}! ✈️`,
    rulesTitle: "Reglas de la casa",
    rules: [
      "👟 Fuera zapatos, arriba la buena onda",
      "✈️ Felicita a Cami por sus aviones a escala",
      "🎶 Comparte tu canción favorita para la playlist",
      "💃 Bailar es obligatorio",
    ],
    wifiTitle: "Wi‑Fi",
    network: "Red",
    password: "Clave",
    connectIphone: "Conectarme al Wi‑Fi",
    iphoneHelp: "Toca el botón, elige “Permitir” y luego abre Ajustes → Perfil descargado → Instalar.",
    copy: "Copiar clave",
    copied: "¡Copiada! ✅",
    androidHelp: "Copia la clave, abre los ajustes de Wi‑Fi, elige “Cheetah” y pégala.",
    musicTitle: "Playlist",
    searchPlaceholder: "Canción o artista…",
    search: "Buscar",
    add: "Agregar",
    added: "Agregada 🎶",
    noResults: "No se encontraron canciones.",
    error: "Algo salió mal. Intenta de nuevo o abre la playlist en Spotify.",
    openSpotify: "Abrir playlist en Spotify",
    recentTitle: "Agregadas recientemente",
    by: (n: string) => `por ${n}`,
  },
};

export type Lang = "en" | "es";
