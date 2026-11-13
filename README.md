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
- ✅ La app muestra las **últimas canciones agregadas** y quién las agregó (“by Ana”), guardadas en Supabase (tabla `songs`).

**Cómo funciona:**
- Solo **nuestra cuenta** se conecta a Spotify. El invitado busca una canción en la app y nuestro servidor la agrega a la playlist con nuestra cuenta. El invitado **no necesita** tener Spotify.
- Endpoint: `POST /v1/playlists/{id}/items` (desde 2026 el endpoint antiguo `/tracks` ya no funciona en modo desarrollo).
- En “modo desarrollo” Spotify permite máximo 5 usuarios autorizados; nos basta con 1 (nosotros).
- Hay desarrolladores que reportan errores 403 en endpoints de escritura → **probar esto primero**.
- 💡 Respaldo: link para abrir la playlist en Spotify si la API falla.

## 8. Nombre del invitado

- ✅ Solo **nombre**, **opcional**. No hay aprobación ni cuentas.
- ✅ El nombre se guarda en el teléfono del invitado y en Supabase (tabla `guests`). Se usa para saludarlo (“Welcome aboard, Ana!”) y para mostrar quién agregó cada canción.

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
- Stack: Next.js + Supabase + Vercel + GitHub.
- Contraseñas: solo la del Wi‑Fi por ahora.
- “Dónde están las cosas”: fuera por ahora.

---

## 11. Hoja de ruta

| Fase | Contenido |
|---|---|
| **1 – MVP “Now boarding”** ✅ construido | Web app Next.js bilingüe (EN/ES) · Bienvenida + reglas · Nombre opcional · Wi‑Fi (perfil iPhone, copiar clave Android) · Agregar canciones a la playlist de Spotify · Grabar el tag NFC. |
| **2 – Control** | Cuando se definan dispositivos: control limitado y temporal. |
| **Más adelante** | Guía de la casa, otras contraseñas, libro de visitas. |

## 12. ✅ Stack técnico

| Pieza | Herramienta | Uso |
|---|---|---|
| UI | **Next.js** (App Router, TypeScript) | La app que ve el invitado + rutas de servidor (`app/api/*`). |
| Backend / datos | **Supabase** (Postgres) | Invitados, canciones agregadas y el token de Spotify del anfitrión. |
| Deploy | **Vercel** (plan gratis Hobby) | Publica la app con HTTPS y corre las rutas de servidor. |
| Control de versiones | **GitHub** — [Cheetah-22/Cheetah-H](https://github.com/Cheetah-22/Cheetah-H) | Cada push a la rama principal publica automáticamente en Vercel. |
| Música | **Spotify Web API** | Buscar canciones y agregarlas a la playlist con la cuenta del anfitrión. |

Seguridad:
- La app habla con Supabase **solo desde el servidor** con la *service role key* (nunca llega al navegador).
- Las tablas tienen **RLS activado sin políticas**: nadie puede leerlas ni escribirlas directamente desde internet.
- El token de Spotify se guarda en Supabase (tabla `settings`), no en el código.

## 13. Puesta en marcha

### Estructura del proyecto

| Archivo / carpeta | Para qué sirve |
|---|---|
| `lib/content.ts` | ✏️ **Todo el contenido editable**: textos EN/ES, reglas, Wi‑Fi y link de la playlist. |
| `components/Home.tsx` | La pantalla del invitado (bienvenida, Wi‑Fi, playlist). |
| `app/globals.css` | Estilos (tema tarjeta de embarque). |
| `public/wifi.mobileconfig` | Perfil Wi‑Fi para iPhone (red `Cheetah`, WPA2). Si cambia la clave, actualizarla aquí y en `lib/content.ts`. |
| `app/api/search`, `app/api/add` | Buscar canciones y agregarlas a la playlist (y registrar quién la agregó). |
| `app/api/songs` | Últimas canciones agregadas. |
| `app/api/guests` | Guarda el nombre opcional del invitado. |
| `app/api/spotify/login`, `.../callback` | Paso único para conectar tu cuenta de Spotify. |
| `lib/spotify.ts`, `lib/supabase.ts` | Conexión con Spotify y Supabase (solo servidor). |
| `supabase/migrations/0001_init.sql` | Tablas de la base de datos. |
| `test/` | Pruebas (`npm test`). |

### Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con tus claves
npm run dev                  # http://localhost:3000
npm test
```

### Pasos (una sola vez)

1. **Supabase**
   - Crear un proyecto gratis en [supabase.com](https://supabase.com).
   - *SQL Editor → New query* → pegar el contenido de `supabase/migrations/0001_init.sql` → *Run*.
   - En *Project Settings → API* copiar la **Project URL** y la **service_role key** (o *secret key*).
2. **Spotify**
   - Entrar a [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) con tu cuenta Premium → *Create app*.
   - Marcar **Web API**. La Redirect URI se completa en el paso 5.
   - Copiar el **Client ID** y el **Client Secret**.
   - En Spotify, abrir la playlist → *Compartir → Copiar enlace* (ej. `https://open.spotify.com/playlist/ABC123?si=...`). El **ID** es lo que va entre `playlist/` y `?`. Pegar el enlace completo en `playlistUrl` dentro de `lib/content.ts`.
3. **Vercel**
   - Crear cuenta gratis en [vercel.com](https://vercel.com) entrando con GitHub.
   - *Add New → Project* → elegir `Cheetah-22/Cheetah-H` (Vercel detecta Next.js solo).
   - En *Environment Variables* agregar:
     - `SUPABASE_URL` = Project URL
     - `SUPABASE_SERVICE_ROLE_KEY` = service_role / secret key
     - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` = de Spotify
     - `SPOTIFY_PLAYLIST_ID` = ID de la playlist
   - *Deploy* y anotar la dirección (ej. `https://cheetah-h.vercel.app`).
4. **Redirect URI en Spotify**: en la app de Spotify → *Settings* → Redirect URIs → `https://<tu-dirección>/api/spotify/callback` → guardar.
5. **Conectar tu cuenta de Spotify**: abrir `https://<tu-dirección>/api/spotify/login`, iniciar sesión y aceptar. Debe aparecer “✅ Spotify connected”. El token queda guardado en Supabase y la ruta se desactiva sola.
6. **Probar**: abrir la app, buscar una canción, tocar *Add* y revisar que aparezca en la playlist y en “Recently added”.
7. **Grabar el tag NFC**
   - Instalar una app como **NFC Tools** (iPhone o Android).
   - *Write → Add a record → URL* → tu dirección de Vercel → *Write* y acercar el tag.
   - Probar con un iPhone y un Android. Si funciona, bloquear el tag (*Other → Lock tag*). ⚠️ El bloqueo es permanente.
8. Pegar el tag en la entrada de la casa. ✈️

### Notas
- El Wi‑Fi y la bienvenida funcionan aunque Spotify o Supabase no estén configurados.
- Si Spotify da error, los detalles aparecen en Vercel → *Logs*. Revisar que la cuenta sea Premium, que la Redirect URI sea exacta y que exista la fila `spotify_refresh_token` en la tabla `settings`.
- Para reconectar Spotify: borrar esa fila en Supabase (*Table Editor → settings*) y volver al paso 5.
- Para cambiar textos o reglas: editar `lib/content.ts` (o pedírselo a Claude Code); Vercel publica cada cambio automáticamente.

## 14. Referencias

- **NFC y Wi‑Fi:** [Apple Community – Wi‑Fi con tag NFC en iPhone](https://discussions.apple.com/thread/251622994), [Dangerous Things – iOS NDEF](https://wiki.dangerousthings.com/en/guides/iOS-NDEF), [Apple – perfiles de configuración](https://support.apple.com/en-is/101360), [Jamf – Wi‑Fi para iOS](https://docs.jamf.com/best-practice-workflows/jamf-pro/configuring-wifi/Configuring_Wi-Fi_for_iOS.html), [Foxpass – clientes iOS](https://docs.foxpass.com/docs/ios-clients)
- **Spotify:** [Spotify – guía de migración feb 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide), [Spotify – changelog jul 2026](https://developer.spotify.com/documentation/web-api/references/changes/july-2026), [Spotify Community – 403 en modo desarrollo](https://community.spotify.com/t5/Spotify-for-Developers/Web-API-playlist-creation-returns-403-in-Development-Mode-no/td-p/7482480), [TechCrunch – Spotify Jam](https://techcrunch.com/2023/09/26/spotify-launches-jam-a-real-time-collaborative-playlist-controlled-by-up-to-32-people)
- **Guías para invitados:** [Chekin](https://chekin.com/en/blog/how-digital-guidebooks-transform-the-guest-experience/), [Touch Stay](https://touchstay.com/blog/vacation-rental-welcome-book), [Minut](https://minut.com/blog/vacation-rental-welcome-book)
- **Smart home para invitados:** [Home Assistant – Guest dashboards](https://community.home-assistant.io/t/guest-dashboards/659023), [Android Authority – Google Home guest access](https://www.androidauthority.com/google-home-guest-access-smart-home-3656804/)
