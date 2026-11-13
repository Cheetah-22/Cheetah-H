# 🐆 Cheetahs House

App para que los invitados que visitan nuestra casa se **registren** y tengan en un solo lugar todo lo que necesitan para **conectarse** y **sentirse en casa**, sin tener que preguntarnos cada vez.

> **Estado:** idea / definición. Este README separa lo que ya está decidido (✅) de lo que todavía falta decidir. Las secciones marcadas con 💡 son ideas sacadas de investigación online, **no** decisiones tomadas.

---

## 1. El problema

Cuando tenemos invitados, siempre nos preguntan:

- ¿Cuál es la **clave del Wi‑Fi**?
- ¿Puedes **agregar una canción** a la playlist de Spotify?
- ¿Qué **cosas debería saber** de la casa? (dónde están las cosas, contraseñas, cómo controlar cosas)

Responder esto una y otra vez interrumpe y la información se termina repitiendo (o se pierde).

## 2. Usuarios

| Usuario | Qué necesita |
|---|---|
| **Invitado** (persona que visita la casa) | Registrarse, conectarse al Wi‑Fi, saber dónde están las cosas, ver contraseñas que le compartimos, controlar cosas de la casa, aportar música. |
| **Anfitrión** (nosotros) | Cargar y mantener actualizada la información, decidir qué ve cada invitado. *(Rol implícito — ver preguntas abiertas.)* |

## 3. Alcance confirmado

1. ✅ **Entrada por NFC** – tenemos tags NFC; el invitado acerca su teléfono y se abre el link de la app al instante.
2. ✅ **Wi‑Fi en un toque** – el invitado se conecta haciendo click en un link, y la red queda guardada en su teléfono.
3. ✅ **Spotify** – el invitado agrega sus canciones a nuestra playlist.
4. ✅ **Bienvenida + reglas de la casa** – pantalla de bienvenida con el texto de la sección 4.
5. **Registro de invitados** – el invitado se registra al llegar *(datos por definir)*.
6. **Guía de la casa** – dónde están las cosas y lo que hay que saber.
7. **Contraseñas** – acceso a las claves que decidamos compartir.
8. **Control** – el invitado puede controlar algo de la casa *(qué, exactamente, está por definir)*.

---

## 4. ✅ Pantalla de bienvenida (contenido)

Texto que verá el invitado al abrir la app:

> **Now boarding**
>
> **Welcome to our home! 🏠**
>
> We're thrilled to have you.
>
> **House rules**
>
> 👟 Shoes off, vibes on
>
> ✈️ Compliment Cami on her model planes
>
> 🎶 Share your fave song for the playlist
>
> 💃 Dancing is required

💡 *Idea de diseño:* “Now boarding” y los aviones a escala dan pie a un tema de **aeropuerto / tarjeta de embarque** (“boarding pass” con el nombre del invitado, “gate” = Wi‑Fi, “in‑flight entertainment” = playlist). Por confirmar.

💡 La regla 🎶 puede ser un **botón directo** a “Agregar canción” (sección 7).

---

## 5. Entrada por NFC

**Lo confirmado:** los tags abren el link de la app en el navegador del teléfono, sin instalar nada.

**Lo que encontramos:**
- Un tag con un **link (URL)** funciona en Android y en iPhone. En iPhone, los modelos XS o más nuevos lo leen sin abrir ninguna app; los iPhone más antiguos necesitan una app lectora de NFC.
- Conviene **bloquear el tag contra escritura** después de grabarlo, para que nadie lo pueda regrabar con otro link.
- 💡 Poner también un **código QR impreso** junto al tag, como respaldo para teléfonos sin NFC o con NFC apagado.
- 💡 Usar varios tags en distintos lugares, cada uno abriendo una sección distinta (ej. `/wifi` junto al router, `/music` junto al parlante, `/` en la entrada).

## 6. Wi‑Fi en un toque

**Objetivo:** el invitado hace click en un link → queda conectado y con la red guardada en su teléfono.

**Limitación importante:** no existe una forma estándar en la web para que un link conecte un teléfono al Wi‑Fi. Cada sistema tiene su propio camino:

| Teléfono | Cómo lograrlo | Experiencia |
|---|---|---|
| **iPhone** | El link descarga un **perfil de configuración Wi‑Fi** (`.mobileconfig`) | Hay que abrirlo en **Safari** (otros navegadores no lo instalan). Safari pide permiso → el invitado va a *Ajustes → Perfil descargado* → *Instalar*. La red queda guardada. Son unos pocos toques, no uno solo. |
| **Android** | Un **tag NFC con un registro Wi‑Fi** (no con un link) | Acercar el teléfono y se conecta directo; Android lo soporta de forma nativa. |
| **Ambos (respaldo)** | **QR de Wi‑Fi** (`WIFI:T:WPA;S:<red>;P:<clave>;;`) + botón “copiar clave” en la app | La cámara del teléfono reconoce el QR y ofrece conectarse. |

Detalles a tener en cuenta:
- En iPhone, **un tag Wi‑Fi no conecta** (iOS no soporta ese tipo de registro). Si un mismo tag lleva varios registros, iOS solo usa el primero compatible → en la práctica es más simple tener **un tag con link (para todos)** y **otro tag Wi‑Fi (para Android)**.
- Un perfil `.mobileconfig` sin firma digital muestra el aviso “No verificado”. Se puede firmar para que se vea más confiable.
- En iOS 16 o más nuevo, el perfil funciona con redes WPA2/WPA3, no con WPA (el más antiguo).
- La clave viaja en texto plano en el perfil, el QR y el tag → recomendable una **red de invitados separada**. Si se cambia la clave, la app debe regenerar el perfil y el QR (y hay que regrabar el tag Wi‑Fi).
- Los caracteres `; , : \` en la red o clave deben escaparse con `\` en el QR.

## 7. Agregar canciones a Spotify

**Objetivo:** el invitado agrega sus canciones a nuestra playlist.

**Lo que encontramos:**
- **Spotify Jam** (función nativa) deja que varias personas agreguen canciones a lo que suena, pero **no tiene API** para integrarlo en una app propia.
- La **Web API de Spotify** permite agregar canciones a una playlist con `POST /v1/playlists/{id}/items`. Desde 2026 el endpoint antiguo `/tracks` ya **no funciona** en modo desarrollo.
- Desde febrero 2026, una app en “modo desarrollo” **requiere que el dueño tenga Spotify Premium** y permite como máximo **5 usuarios** autorizados. ✅ **Tenemos cuenta Premium**, así que cumplimos el requisito. Hay desarrolladores que reportan errores 403 en endpoints de escritura, así que hay que probarlo temprano.

**Propuesta (💡, a confirmar):** que **solo nuestra cuenta** se conecte a Spotify. El invitado busca una canción en la app y nuestro servidor la agrega con nuestra cuenta. Así:
- El invitado **no necesita** tener ni iniciar sesión en Spotify.
- Quedamos dentro del límite de 5 usuarios del modo desarrollo (el único usuario somos nosotros).
- Se puede guardar **quién agregó cada canción** (“🎶 agregada por Ana”).

Formas de agregar a evaluar:
- **A. Directo:** la canción entra de inmediato a la playlist.
- **B. Con aprobación:** queda en una lista de sugerencias que nosotros aprobamos.
- **C. Respaldo sin código:** link a una playlist colaborativa o a un Jam, por si la API falla.

## 8. Guía de la casa (💡 secciones típicas)

En guías digitales para invitados lo más común es: Wi‑Fi y llegada (según una fuente, lo más consultado → ponerlo primero), reglas de la casa, cómo usar electrodomésticos / TV / clima, basura y reciclaje, estacionamiento, contactos de emergencia y recomendaciones locales.

Lección clave: **información desactualizada es peor que no tenerla** (ej. una clave de Wi‑Fi antigua). Editar el contenido tiene que ser fácil para el anfitrión.

## 9. Control de la casa (💡)

- Si usamos **Home Assistant**: no trae “modo invitado” completo; se suele crear un usuario restringido con su propio dashboard, o usar complementos que generan **links de acceso temporal** solo para ciertos dispositivos.
- **Google Home** también tiene opciones de acceso para invitados.
- ⚠️ Exponer **solo** lo necesario (ej. luces del living, TV) y con acceso que **expire**.

## 10. Contraseñas y datos sensibles

- Mostrarlas solo a invitados registrados/aprobados.
- 💡 Que tengan **vencimiento** (cuando el invitado se va, pierde acceso).
- Guardarlas cifradas, nunca en el código del repositorio (incluye la clave Wi‑Fi y el token de Spotify).

---

## 11. ❓ Preguntas abiertas

**Invitados y registro**
- [ ] ¿Qué datos pide el registro? (nombre, teléfono, email, fechas de visita…) ¿Es obligatorio antes de ver el Wi‑Fi?
- [ ] ¿Cada invitado debe ser **aprobado** por nosotros o el acceso es automático?
- [ ] ¿Las visitas son de horas (cena, fiesta) o también de días (alojamiento)?
- [ ] ¿Idioma de la app? La bienvenida está en inglés: ¿toda la app en inglés, en español o en ambos?
- [ ] “Que les cargue la información en sus teléfonos”: además de guardar la red Wi‑Fi, ¿quieren que se guarde algo más? (ej. la app en la pantalla de inicio, nuestro contacto)

**NFC y Wi‑Fi**
- [ ] ¿Cuántos tags NFC tenemos y de qué modelo? (ej. NTAG213/215/216 — define cuánto cabe)
- [ ] ¿Dónde irán ubicados?
- [ ] ¿Tenemos (o podemos crear) una **red de invitados** separada? ¿Es WPA2 o WPA3?
- [ ] ¿Les parece bien la combinación: tag con link + tag Wi‑Fi para Android + QR de respaldo?

**Spotify**
- [x] ¿Tenemos Spotify **Premium**? → ✅ Sí
- [ ] ¿Una playlist fija o una por evento?
- [ ] ¿Agregar directo (A) o con aprobación (B)?

**Plataforma**
- [ ] ¿Quiénes administran? (¿una persona, la pareja, la familia?)
- [ ] ¿Presupuesto para hosting/dominio? (¿gratis, bajo costo?)

**Control de la casa**
- [ ] ¿Qué cosas exactamente quieren que controlen los invitados? (luces, TV, música, clima, portón…)
- [ ] ¿Qué dispositivos/plataforma tenemos hoy? (Home Assistant, Google Home, Alexa, Apple Home, ninguno)

**Contraseñas e información**
- [ ] ¿Qué contraseñas se compartirían además del Wi‑Fi?
- [ ] ¿Qué información de “dónde están las cosas” es la más pedida?

---

## 12. Hoja de ruta propuesta

| Fase | Contenido |
|---|---|
| **0 – Definición** | Responder preguntas abiertas. Elegir stack y hosting. |
| **1 – MVP “Now boarding”** | Web app abierta por tag NFC/QR · Pantalla de bienvenida + reglas · Wi‑Fi (perfil iPhone, tag Android, QR y copiar clave) · Botón a la playlist (opción C). |
| **2 – Música y registro** | Buscar y agregar canciones con la API de Spotify · Registro de invitados · Panel para que el anfitrión edite el contenido. |
| **3 – Guía y contraseñas** | Guía de la casa · Contraseñas solo para invitados aprobados, con vencimiento. |
| **4 – Control** | Integración smart home con acceso limitado y temporal. |
| **5 – Extras (opcional)** | Libro de visitas, notificación al anfitrión cuando llega alguien, recomendaciones locales. |

## 13. Stack técnico

**Por decidir.** Requisitos ya claros:

- **Web app** que funcione bien en el teléfono (se abre desde NFC/QR, sin instalar nada).
- **Backend** necesario para: generar el perfil `.mobileconfig` y el QR de Wi‑Fi, y guardar el token de Spotify del anfitrión y hacer las llamadas a la API.
- **Panel de administración** para editar textos, reglas y la clave Wi‑Fi.
- Secretos (clave Wi‑Fi, credenciales de Spotify) cifrados y fuera del repositorio (`.env` / gestor de secretos).
- **HTTPS** obligatorio (requerido por Safari para perfiles y por Spotify para el login).

## 14. Referencias

- **NFC y Wi‑Fi:** [Apple Community – Wi‑Fi con tag NFC en iPhone](https://discussions.apple.com/thread/251622994), [Dangerous Things – iOS NDEF](https://wiki.dangerousthings.com/en/guides/iOS-NDEF), [Apple – perfiles de configuración](https://support.apple.com/en-is/101360), [Jamf – Wi‑Fi para iOS](https://docs.jamf.com/best-practice-workflows/jamf-pro/configuring-wifi/Configuring_Wi-Fi_for_iOS.html), [Foxpass – clientes iOS](https://docs.foxpass.com/docs/ios-clients)
- **QR de Wi‑Fi:** [QuickChart – WiFi QR codes](https://quickchart.io/documentation/qr-codes/wifi-qr-codes/), [WPA3 WiFi QR codes are broken](https://stevetech-me.pages.dev/posts/wifi-qr-codes-are-broken)
- **Spotify:** [Spotify – guía de migración feb 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide), [Spotify – changelog jul 2026](https://developer.spotify.com/documentation/web-api/references/changes/july-2026), [Spotify Community – 403 en modo desarrollo](https://community.spotify.com/t5/Spotify-for-Developers/Web-API-playlist-creation-returns-403-in-Development-Mode-no/td-p/7482480), [TechCrunch – Spotify Jam](https://techcrunch.com/2023/09/26/spotify-launches-jam-a-real-time-collaborative-playlist-controlled-by-up-to-32-people), [Spotify Community – Jam y Web API](https://community.spotify.com/t5/Spotify-for-Developers/Web-API-info-for-Jams/m-p/7109118/highlight/true)
- **Guías para invitados:** [Chekin](https://chekin.com/en/blog/how-digital-guidebooks-transform-the-guest-experience/), [Touch Stay](https://touchstay.com/blog/vacation-rental-welcome-book), [Minut](https://minut.com/blog/vacation-rental-welcome-book)
- **Smart home para invitados:** [Home Assistant – Guest dashboards](https://community.home-assistant.io/t/guest-dashboards/659023), [Android Authority – Google Home guest access](https://www.androidauthority.com/google-home-guest-access-smart-home-3656804/)
