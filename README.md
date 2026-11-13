# 🐆 Cheetahs House

Web app para que los invitados que visitan nuestra casa tengan en un solo lugar todo lo que necesitan para **conectarse** y **sentirse en casa**, sin tener que preguntarnos cada vez.

> **Estado:** ✅ primera versión construida (bienvenida, Wi‑Fi y Spotify). Falta publicarla y grabar el tag NFC — ver **“Puesta en marcha”** al final. Este README separa lo que ya está decidido (✅) de lo que todavía falta decidir. Las secciones marcadas con 💡 son ideas sacadas de investigación online, **no** decisiones tomadas.

---

## 1. El problema

Cuando tenemos invitados, siempre nos preguntan:

- ¿Cuál es la **clave del Wi‑Fi**?
- ¿Puedes **agregar una canción** a la playlist de Spotify?
- ¿Qué **cosas debería saber** de la casa?

Responder esto una y otra vez interrumpe y la información se termina repitiendo (o se pierde).

## 2. Usuarios

| Usuario | Qué necesita |
|---|---|
| **Invitado** (cualquier visita: horas o días) | Conectarse al Wi‑Fi, conocer las reglas de la casa, agregar canciones a la playlist. |
| **Administrador** (solo el dueño de la casa) | Mantener el contenido actualizado. ✅ Lo hace editando este repositorio (con ayuda de Claude Code), **no** con un panel de administración dentro de la app. |

## 3. Alcance

### ✅ Primera versión
1. **Un solo tag NFC en la entrada de la casa** → abre la app. Desde la app se hace todo.
2. **Bienvenida “Now boarding” + reglas de la casa** (sección 4).
3. **Nombre opcional** – el invitado puede escribir su nombre; no es obligatorio y no bloquea nada.
4. **Wi‑Fi** – conectarse y dejar la red guardada en el teléfono.
5. **Spotify** – agregar canciones a la playlist de la casa (✅ parte de la primera versión).
6. **Idiomas** – inglés por defecto, con opción de cambiar a español.

### ⏸️ Fuera por ahora
- Guía de “dónde están las cosas”.
- Otras contraseñas (solo se comparte la del Wi‑Fi).
- Aprobación de invitados (el acceso es libre para quien escanea el tag).
- Control de la casa (pendiente de definir, sección 9).

---

## 4. ✅ Pantalla de bienvenida (contenido)

Texto principal (inglés):

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

La versión en español se tiene que traducir. 💡 Propuesta (para revisar):

> **Embarque inmediato** · ¡Bienvenidos a nuestra casa! 🏠 · Nos encanta tenerlos aquí.
> **Reglas de la casa:** 👟 Fuera zapatos, arriba la buena onda · ✈️ Felicita a Cami por sus aviones a escala · 🎶 Comparte tu canción favorita para la playlist · 💃 Bailar es obligatorio

💡 *Ideas de diseño (por confirmar):*
- Tema de **aeropuerto / tarjeta de embarque** (“Now boarding”, aviones de Cami).
- La regla 🎶 como **botón directo** a “Agregar canción”.
- Botón **EN / ES** visible arriba.

---

## 5. ✅ Entrada por NFC

- **Un solo tag**, ubicado en la **entrada de la casa**, grabado con el **link de la app**.
- Un tag con link funciona en Android y en iPhone. En iPhone, los modelos XS o más nuevos lo leen sin abrir ninguna app; los iPhone más antiguos necesitan una app lectora de NFC.
- Recomendado: **bloquear el tag contra escritura** después de grabarlo, para que nadie lo pueda regrabar con otro link.
- ❌ Decidido: **no** se usa tag Wi‑Fi separado ni QR de respaldo.

## 6. ✅ Wi‑Fi

Lo que verá el invitado en la app:

> 📶 **WiFi:** `Cheetah`
>
> 🔑 **Password:** `Iwantchocolate!`

- ✅ Prioridad: que el invitado se conecte de la forma **más rápida y simple posible**.
- ✅ La clave se muestra **abierta**, sin registro ni códigos. El dueño de la casa decidió que no le importa que la clave sea visible (incluso en este repositorio público).
- La red es la red principal de la casa (no hay red de invitados separada).

**Cómo se conecta el invitado desde la app** (no existe una forma estándar de que un link conecte al Wi‑Fi, así que depende del teléfono):

| Teléfono | Qué hace la app | Experiencia |
|---|---|---|
| **iPhone** | Botón “Connect to Wi‑Fi” que descarga un **perfil de configuración Wi‑Fi** (`.mobileconfig`) | Se abre en **Safari** (otros navegadores no lo instalan). Safari pide permiso → *Ajustes → Perfil descargado* → *Instalar*. La red queda guardada. Son unos pocos toques. |
| **Android** | Muestra la red y un botón **“Copy password”** | El invitado abre los ajustes de Wi‑Fi, elige `Cheetah` y pega la clave. Android no permite conectarse desde un link web. |

Detalles a tener en cuenta:
- La app detecta si es iPhone o Android y muestra la opción que corresponde.
- Un perfil `.mobileconfig` sin firma digital muestra el aviso “No verificado”. Se puede firmar para que se vea más confiable.
- En iOS 16 o más nuevo, el perfil funciona con redes WPA2/WPA3, no con WPA (el más antiguo). *Confirmar el tipo de seguridad de la red `Cheetah`.*
- Si se cambia la clave, se actualiza en el contenido de la app y el perfil se genera con la clave nueva.

## 7. ✅ Agregar canciones a Spotify

**Decisiones:**
- ✅ Tenemos **Spotify Premium** (requisito de la API).
- ✅ **Una playlist fija** de la casa.
- ✅ Las canciones **entran directo**, sin aprobación.
- ✅ **Sin límite** de canciones por invitado; los duplicados dan igual.

**Cómo funciona:**
- Solo **nuestra cuenta** se conecta a Spotify. El invitado busca una canción en la app y nuestro servidor la agrega a la playlist con nuestra cuenta. El invitado **no necesita** tener Spotify.
- Endpoint: `POST /v1/playlists/{id}/items` (desde 2026 el endpoint antiguo `/tracks` ya no funciona en modo desarrollo).
- En “modo desarrollo” Spotify permite máximo 5 usuarios autorizados; nos basta con 1 (nosotros).
- Hay desarrolladores que reportan errores 403 en endpoints de escritura → **probar esto primero**.
- 💡 Respaldo: link para abrir la playlist en Spotify si la API falla.

## 8. Nombre del invitado

- ✅ Solo **nombre**, **opcional**. No hay aprobación ni cuentas.
- 💡 El nombre se puede guardar en el propio teléfono del invitado (navegador), sin base de datos, y usarse para saludarlo (“Welcome, Ana!”) y para firmar sus canciones.

## 9. Control de la casa (pendiente)

Todavía no definido. Notas de la investigación:
- Si usamos **Home Assistant**: no trae “modo invitado” completo; se suele crear un usuario restringido o usar complementos con **links de acceso temporal** solo para ciertos dispositivos.
- **Google Home** también tiene opciones de acceso para invitados.
- ⚠️ Exponer **solo** lo necesario y con acceso que expire.

---

## 10. ❓ Preguntas abiertas

- [ ] ¿Qué cosas quieren que controlen los invitados? (luces, TV, música, clima, portón…)
- [ ] ¿Qué dispositivos/sistema tenemos hoy? (Home Assistant, Google Home, Alexa, Apple Home, ninguno)
- [ ] ¿La red `Cheetah` es WPA2 o WPA3? (se ve en la configuración del router)
- [ ] ¿Está bien la traducción al español de la bienvenida?

### ✅ Respondidas
- Registro: solo nombre, opcional, no obligatorio para ver el Wi‑Fi, sin aprobación.
- Visitas: de todo tipo (horas o días).
- Idioma: inglés principal, con opción de español.
- “Cargar en el teléfono”: solo guardar la red Wi‑Fi.
- NFC: un solo tag, en la entrada, que abre la app.
- Wi‑Fi: red `Cheetah`, misma red principal; sin tag Wi‑Fi ni QR de respaldo; clave visible para todos, sin código secreto.
- Prioridad: conexión lo más rápida y simple posible; Wi‑Fi y Spotify en la primera versión.
- Spotify: Premium, playlist fija, directo, sin límites, duplicados da igual.
- Administración: solo el dueño, editando este repositorio.
- Presupuesto: gratis.
- Contraseñas: solo la del Wi‑Fi por ahora.
- “Dónde están las cosas”: fuera por ahora.

---

## 11. Hoja de ruta

| Fase | Contenido |
|---|---|
| **1 – MVP “Now boarding”** | Web app bilingüe (EN/ES) · Bienvenida + reglas · Nombre opcional · Wi‑Fi (perfil iPhone, copiar clave Android) · Agregar canciones a la playlist de Spotify · Grabar el tag NFC. |
| **2 – Control** | Cuando se definan dispositivos: control limitado y temporal. |
| **Más adelante** | Guía de la casa, otras contraseñas, libro de visitas. |

## 12. Stack técnico

Requisitos ya claros (la elección concreta queda para el inicio de la Fase 1):

- **Gratis:** hosting con plan gratuito que soporte **funciones de servidor** (serverless) y **HTTPS** (requerido por Safari para perfiles y por Spotify para el login).
- **Funciones de servidor** necesarias para:
  1. Generar el perfil `.mobileconfig` del Wi‑Fi.
  2. Guardar el token de Spotify y agregar canciones a la playlist.
- **Sin base de datos** en la primera versión (el nombre vive en el teléfono del invitado).
- **Contenido** (textos, reglas, traducciones) en archivos del repositorio, editados por el administrador.
- **Secretos de Spotify** (client secret, token) como variables de entorno del hosting, **nunca** en el repositorio: con ellos alguien podría controlar la cuenta de Spotify. (La clave Wi‑Fi sí puede ir en el repositorio, por decisión del dueño.)

## 13. Puesta en marcha

### Estructura del proyecto

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La app que ve el invitado. |
| `content.js` | ✏️ **Todo el contenido editable**: textos EN/ES, reglas, Wi‑Fi y link de la playlist. |
| `wifi.mobileconfig` | Perfil Wi‑Fi para iPhone (red `Cheetah`, WPA2). Si cambia la clave, actualizarla aquí y en `content.js`. |
| `api/search.js`, `api/add.js` | Funciones de servidor: buscar canciones y agregarlas a la playlist. |
| `api/login.js`, `api/callback.js` | Paso único para conectar tu cuenta de Spotify. |
| `vercel.json` | Hace que el iPhone reconozca el perfil Wi‑Fi al descargarlo. |
| `test/` | Pruebas de las funciones de Spotify (`npm test`). |

**Hosting elegido:** [Vercel](https://vercel.com), plan gratuito (Hobby): sirve la app con HTTPS y corre las funciones de servidor.

### Pasos (una sola vez)

1. **Publicar en Vercel**
   - Crear una cuenta gratis en vercel.com entrando con GitHub.
   - *Add New → Project* → elegir el repositorio `Cheetah-H` → *Deploy*.
   - Anotar la dirección que te da (ej. `https://cheetah-h.vercel.app`).
2. **Crear la app de Spotify**
   - Entrar a [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) con tu cuenta Premium → *Create app*.
   - En **Redirect URI** poner: `https://<tu-dirección>/api/callback`.
   - Marcar **Web API** y guardar. Copiar el **Client ID** y el **Client Secret**.
3. **Elegir la playlist**
   - En Spotify, abrir la playlist → *Compartir → Copiar enlace*. Ej: `https://open.spotify.com/playlist/ABC123?si=...`
   - El **ID** es la parte entre `playlist/` y `?` (ej. `ABC123`).
   - Pegar el enlace completo en `playlistUrl` dentro de `content.js`.
4. **Variables secretas en Vercel** (*Project → Settings → Environment Variables*):
   - `SPOTIFY_CLIENT_ID` = Client ID
   - `SPOTIFY_CLIENT_SECRET` = Client Secret
   - `SPOTIFY_PLAYLIST_ID` = ID de la playlist
   - Luego *Deployments → Redeploy*.
5. **Conectar tu cuenta de Spotify**
   - Abrir `https://<tu-dirección>/api/login`, iniciar sesión y aceptar.
   - La página muestra un código largo: guardarlo como variable `SPOTIFY_REFRESH_TOKEN` en Vercel y hacer *Redeploy* otra vez.
   - Desde ese momento `/api/login` queda desactivado.
6. **Probar**: abrir la app, buscar una canción, tocar *Add* y revisar que aparezca en la playlist.
7. **Grabar el tag NFC**
   - Instalar una app como **NFC Tools** (iPhone o Android).
   - *Write → Add a record → URL* → tu dirección de Vercel → *Write* y acercar el tag.
   - Probar con un iPhone y un Android. Si funciona, bloquear el tag (*Other → Lock tag*). ⚠️ El bloqueo es permanente.
8. Pegar el tag en la entrada de la casa. ✈️

### Notas
- La app funciona sin Spotify configurado: el Wi‑Fi y la bienvenida no dependen de él.
- Si Spotify responde con error, los detalles aparecen en Vercel → *Logs*. Revisar que la cuenta sea Premium, que la Redirect URI sea exacta y que el refresh token esté guardado.
- Para cambiar textos o reglas: editar `content.js` (o pedírselo a Claude Code); Vercel publica automáticamente cada cambio.

## 14. Referencias

- **NFC y Wi‑Fi:** [Apple Community – Wi‑Fi con tag NFC en iPhone](https://discussions.apple.com/thread/251622994), [Dangerous Things – iOS NDEF](https://wiki.dangerousthings.com/en/guides/iOS-NDEF), [Apple – perfiles de configuración](https://support.apple.com/en-is/101360), [Jamf – Wi‑Fi para iOS](https://docs.jamf.com/best-practice-workflows/jamf-pro/configuring-wifi/Configuring_Wi-Fi_for_iOS.html), [Foxpass – clientes iOS](https://docs.foxpass.com/docs/ios-clients)
- **Spotify:** [Spotify – guía de migración feb 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide), [Spotify – changelog jul 2026](https://developer.spotify.com/documentation/web-api/references/changes/july-2026), [Spotify Community – 403 en modo desarrollo](https://community.spotify.com/t5/Spotify-for-Developers/Web-API-playlist-creation-returns-403-in-Development-Mode-no/td-p/7482480), [TechCrunch – Spotify Jam](https://techcrunch.com/2023/09/26/spotify-launches-jam-a-real-time-collaborative-playlist-controlled-by-up-to-32-people)
- **Guías para invitados:** [Chekin](https://chekin.com/en/blog/how-digital-guidebooks-transform-the-guest-experience/), [Touch Stay](https://touchstay.com/blog/vacation-rental-welcome-book), [Minut](https://minut.com/blog/vacation-rental-welcome-book)
- **Smart home para invitados:** [Home Assistant – Guest dashboards](https://community.home-assistant.io/t/guest-dashboards/659023), [Android Authority – Google Home guest access](https://www.androidauthority.com/google-home-guest-access-smart-home-3656804/)
