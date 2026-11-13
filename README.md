# 🐆 Cheetahs House

App para que los invitados que visitan nuestra casa se **registren** y tengan en un solo lugar todo lo que necesitan para **conectarse** y **sentirse en casa**, sin tener que preguntarnos cada vez.

> **Estado:** idea / definición. Este README separa lo que ya está decidido de lo que todavía falta decidir. Las secciones marcadas con 💡 son ideas sacadas de investigación online, **no** decisiones tomadas.

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

## 3. Alcance confirmado (lo que ya sabemos)

1. **Registro de invitados** – el invitado se registra al llegar.
2. **Wi‑Fi** – el invitado obtiene la información para conectarse.
3. **Spotify** – el invitado puede sugerir/agregar canciones a nuestra playlist.
4. **Guía de la casa** – dónde están las cosas y lo que hay que saber.
5. **Contraseñas** – acceso a las claves que decidamos compartir.
6. **Control** – el invitado puede controlar algo de la casa *(qué, exactamente, está por definir)*.

---

## 4. 💡 Ideas de la investigación

### 4.1 Acceso sin fricción (QR en la casa)
- Las guías digitales para invitados (tipo Airbnb) normalmente **no obligan a instalar una app**: se abren desde un link o un **código QR** impreso en la casa.
- Se sugiere poner QRs en lugares clave: entrada, cocina, lavandería, termostato, junto a electrodomésticos.
- 👉 Implicancia: una **web app (PWA)** puede ser mejor que una app de App Store/Play Store. *Decisión pendiente.*

### 4.2 Wi‑Fi con un escaneo
- Existe un formato estándar de QR para Wi‑Fi que conecta el teléfono automáticamente:
  ```
  WIFI:T:WPA;S:<nombre_red>;P:<clave>;H:false;;
  ```
- Los caracteres `; , : \` en la red o clave deben escaparse con `\`.
- Redes **WPA3** pueden dar problemas en algunos teléfonos → probar en iPhone y Android antes de imprimir.
- ⚠️ La clave va en texto plano dentro del QR: si se cambia la clave hay que regenerarlo. Por eso conviene una **red de invitados separada** y que la app genere el QR dinámicamente.

### 4.3 Spotify
- **Spotify Jam** (función nativa de Spotify) permite que hasta 32 personas agreguen canciones a lo que suena, pero **no tiene API** para integrarlo en una app propia.
- La **Web API** permite agregar canciones a una playlist (`POST /playlists/{id}/tracks`), pero hay reportes de error 403 cuando quien agrega no es el dueño de la playlist.
- 👉 Opciones a evaluar:
  - **A.** La app agrega canciones usando **la cuenta del anfitrión** (el invitado busca y elige; nuestro backend la agrega). El invitado no necesita Spotify.
  - **B.** Cola de **sugerencias** que nosotros aprobamos antes de agregar.
  - **C.** Simplemente mostrar un link/QR a una playlist colaborativa o a un Jam.

### 4.4 Guía de la casa (manual digital)
Secciones típicas en guías para invitados:
- Wi‑Fi y llegada (según una fuente, son las secciones más consultadas → ponerlas primero)
- Reglas de la casa
- Cómo usar electrodomésticos, calefacción/aire, TV
- Basura y reciclaje, estacionamiento
- Contactos de emergencia
- Recomendaciones locales

Lecciones aprendidas:
- **Información desactualizada es peor que no tenerla** (ej: clave de Wi‑Fi antigua). La app debe ser fácil de editar para el anfitrión.
- Considerar un **respaldo impreso** por si no hay señal.

### 4.5 Control de la casa (smart home)
- Si usamos **Home Assistant**: no trae “modo invitado” completo; se suele crear un usuario restringido con un dashboard propio, o usar complementos de terceros que generan **links de acceso temporal** con solo ciertos dispositivos permitidos.
- **Google Home** también tiene opciones de acceso para invitados.
- ⚠️ Riesgo de seguridad: no exponer todo el sistema a los invitados. Exponer **solo** lo necesario (ej: luces del living, TV) y con acceso que **expire**.

### 4.6 Contraseñas y datos sensibles
- Las contraseñas (Wi‑Fi, streaming, etc.) deberían:
  - Mostrarse solo a invitados registrados/aprobados.
  - Tener **vencimiento** (cuando el invitado se va, pierde acceso).
  - Guardarse cifradas, nunca en el código del repositorio.

---

## 5. ❓ Preguntas abiertas (necesitamos respuesta para implementar)

**Invitados y registro**
- [ ] ¿Qué datos pide el registro? (nombre, teléfono, email, foto, fechas de visita…)
- [ ] ¿Cada invitado debe ser **aprobado** por nosotros o el acceso es automático?
- [ ] ¿Las visitas son de horas (cena, fiesta) o también de días (alojamiento)?
- [ ] ¿Un invitado frecuente debería quedar guardado para la próxima vez?
- [ ] ¿Idioma(s) de la app? (¿solo español, también inglés?)

**Plataforma**
- [ ] ¿Web app (sin instalar, vía QR) o app nativa iOS/Android?
- [ ] ¿Quiénes son los anfitriones que administran? (¿una persona, la pareja, la familia?)
- [ ] ¿Presupuesto para hosting/servicios? (¿gratis, bajo costo?)

**Wi‑Fi**
- [ ] ¿Tenemos (o podemos crear) una **red de invitados** separada?
- [ ] ¿Qué router usamos? (algunos permiten rotar la clave automáticamente)

**Spotify**
- [ ] ¿Tenemos Spotify Premium? ¿Una playlist fija o varias?
- [ ] ¿Los invitados agregan directo, o sugieren y nosotros aprobamos (opción A/B/C)?

**Control de la casa**
- [ ] ¿Qué cosas exactamente quieren que controlen los invitados? (luces, TV, música, clima, portón, cerradura…)
- [ ] ¿Qué dispositivos/plataforma tenemos hoy? (Home Assistant, Google Home, Alexa, Apple Home, ninguno)

**Contraseñas e información**
- [ ] ¿Qué contraseñas se compartirían además del Wi‑Fi? (Netflix, alarma, portón…)
- [ ] ¿Qué información de “dónde están las cosas” es la más pedida?
- [ ] ¿Hay reglas de la casa que quieran comunicar?

---

## 6. Hoja de ruta propuesta

> Se ajusta una vez respondidas las preguntas de la sección 5.

| Fase | Contenido |
|---|---|
| **0 – Definición** | Responder preguntas abiertas. Elegir plataforma y stack. |
| **1 – MVP** | Registro simple · Wi‑Fi con QR · Guía de la casa editable · Link a la playlist de Spotify. |
| **2 – Conexión** | Agregar canciones desde la app (integración Spotify) · Contraseñas visibles solo a invitados aprobados, con vencimiento. |
| **3 – Control** | Integración con la plataforma smart home elegida, acceso limitado y temporal. |
| **4 – Extras (opcional)** | Libro de visitas, recomendaciones locales, notificaciones al anfitrión cuando llega alguien, asistente que responda preguntas sobre la casa. |

## 7. Stack técnico

**Por decidir** según las respuestas de la sección 5 (plataforma, presupuesto, dispositivos). Requisitos mínimos ya claros:

- Panel de administración para que el anfitrión edite la información fácilmente.
- Secretos (claves Wi‑Fi, tokens de Spotify, contraseñas) guardados cifrados y fuera del repositorio (`.env`, gestor de secretos).
- Funcionar bien en teléfono.

## 8. Referencias

- Guías digitales para invitados: [Chekin – digital guidebook](https://chekin.com/en/blog/how-digital-guidebooks-transform-the-guest-experience/), [Touch Stay – welcome book](https://touchstay.com/blog/vacation-rental-welcome-book), [Minut – welcome book](https://minut.com/blog/vacation-rental-welcome-book)
- QR de Wi‑Fi: [QuickChart – WiFi QR codes](https://quickchart.io/documentation/qr-codes/wifi-qr-codes/), [WPA3 WiFi QR codes are broken](https://stevetech-me.pages.dev/posts/wifi-qr-codes-are-broken)
- Spotify: [TechCrunch – Spotify Jam](https://techcrunch.com/2023/09/26/spotify-launches-jam-a-real-time-collaborative-playlist-controlled-by-up-to-32-people), [Spotify Community – Jam y Web API](https://community.spotify.com/t5/Spotify-for-Developers/Web-API-info-for-Jams/m-p/7109118/highlight/true), [Spotify Community – 403 en playlists colaborativas](https://community.spotify.com/t5/Spotify-for-Developers/Feature-Request-Allow-playlist-collaborators-to-add-tracks-to/td-p/5360809)
- Smart home para invitados: [Home Assistant – Guest dashboards](https://community.home-assistant.io/t/guest-dashboards/659023), [Android Authority – Google Home guest access](https://www.androidauthority.com/google-home-guest-access-smart-home-3656804/)
