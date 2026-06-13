# Auditoría de seguridad, bugs y UI — Sistema legado CRM

**Sistema:** `Administrador_mvc` (frontend Angular 13) + `MVC_CRM` (backend PHP puro)
**Fecha:** 2026-06-12
**Modo:** auditoría estática (lectura). Los fixes se registran en el changelog al final.
**Conteo:** 8 CRÍTICAS · 10 ALTAS · 11 MEDIAS · 6 BAJAS

> ⚠️ El backend `MVC_CRM` está hoy **efectivamente sin autenticación** y es explotable de forma remota.
> Riesgo de datos personales de >30k personas → **Ley 29733**. Priorizar las CRÍTICAS de backend.

---

## 🔴 CRÍTICAS — explotables sin autenticación

| # | Hallazgo | Ubicación | Impacto |
|---|----------|-----------|---------|
| C1 | Autenticación anulada por hardcode (`$checktoken = true;` sobrescribe la validación JWT) | `MVC_CRM/index.php:56` | Toda la API abierta a anónimos |
| C2 | Backdoor / token maestro `"@TEXCOTTOM…"` + clave JWT hardcodeada | `MVC_CRM/Helpers/JwtAuth.php:97,11` | Acceso universal + forja de tokens |
| C3 | Inyección SQL masiva (input concatenado; `prepare()` sin bind) | `models/ConsultaGlobal.php`, `MarcaController.php:17`, `Api/ProductoController.php:510`, +15 | Lectura/escritura total de la BD |
| C4 | Subida de archivos → RCE (sin validar extensión/MIME, dir web ejecuta `.php`) | `Controllers/Api/ClienteController.php:281` | Ejecución remota de código |
| C5 | Secretos hardcodeados (BD, SendGrid, Cloudinary, Pusher, Sightengine, WhatsApp) | `config/Parametros.php:26,54,58`, `Eventopusher.php`, etc. | Compromiso de todos los servicios |
| C6 | Token apisperu (JWT) hardcodeado en el bundle del front | `Administrador_mvc/src/app/services/empresa.service.ts:69` | Abuso de cuenta de terceros |
| C7 | XSS almacenado en el chat (mensajes del cliente insertados con `[innerHTML]`/`insertAdjacentHTML`) | `chat-box.component.ts`, `header.component.ts:69` | Robo de sesión del admin |
| C8 | Token JWT en `localStorage` (sin HttpOnly) | `services/login.service.ts:48` | Toma de cuenta admin (encadena con C7) |

**Nota clave (descubierta en remediación):** el "backdoor" C2 se usa **legítimamente** como API-key del
store público (`Carrito_compras` y `Carrito_compras_hermana` lo llevan en su `environment.ts`).
No puede eliminarse sin romper los e-commerce; debe acotarse a endpoints `Api/*` y rotarse.

---

## 🟠 ALTAS

**Backend**
- A1. Contraseñas con SHA-256 sin salt — `UsuarioController.php:25,38`, `Api/ClienteController.php:159`.
- A2. CORS `*` global — `index.php:6`.
- A3. IDOR en pedidos de clientes (`$_GET['id_cliente']`/`id_pedido` sin verificar propiedad) — `Api/ClienteController.php:195`.
- A4. Command injection vía `shell_exec` sin `escapeshellarg` — `ReporteVentaProductoController.php:52`, `LibroVentasController.php:214`.
- A5. XSS por salida sin escape — `WebHookWhassapController.php:11`, `MarcaController.php:93`.

**Frontend**
- A6. AuthGuard roto: retorna `true` síncrono mientras la verificación corre en paralelo — `guards/auth.guard.ts:13`.
- A7. Expiración de sesión confiada a `localStorage` manipulable — `guards/auth.guard.ts:14`.
- A8. ~40 `.subscribe()` sin manejo de error (fallos HTTP silenciosos) — 23 archivos.
- A9. Sin `HttpInterceptor` central; cada service adjunta el token a mano, sin `Bearer` — todos los services.
- A10. (reservado) — ver medias.

---

## 🟡 MEDIAS

- `unserialize` de archivo controlable — `config/EvitarDDos.php:7`.
- `password_verify` con argumentos invertidos (auth rota) — `Api/ClienteController.php:160`.
- Faltan headers de seguridad (X-Content-Type-Options, X-Frame-Options/CSP, HSTS) — `index.php`.
- Path traversal por `$_GET['dominio']` — `config/Parametros.php:6`.
- Directorios creados con `0777` — varios.
- XSS en tickets/PDF vía jQuery `.html()` — `ventas.component.ts:234`, `caja.component.ts:327`, etc.
- XSS en árbol de categorías y cabeceras `[innerHTML]` — `productos.component.ts:109`, `atributo.component.html:149`.
- Validación solo en front; precio/stock sin validadores — `nuevo-producto.component.ts:81`.
- Race en doble-login — `login/login.component.ts:68`.
- Pusher en canal público — `chat-box.component.ts:32`.
- Dependencias EOL: Angular 13, jQuery, SweetAlert2 v10, Quill 1.x — `package.json`.

---

## ⚪ BAJAS

- `mt_rand` no criptográfico para session_id — `Helpers/JwtAuth.php:81`.
- Anti-DDoS por archivo eludible (por URI, sin lock) — `config/EvitarDDos.php`.
- JWT sin expiración real (usa claim `expiracion` en vez de `exp`) — `Helpers/JwtAuth.php:53`.
- `console.log` de sesión en producción — `auth.guard.ts:19`.
- `NO_ERRORS_SCHEMA` global oculta bugs de template — `app.module.ts:38`.
- Sin guard inverso de login (usuario logueado puede volver al login) — `app.routes.ts:8`.

---

## 🎨 UI/UX

Panel = plantilla comercial **Wrappixel Admin Pro** (Bootstrap + ~40 plugins jQuery) sin sistema de diseño:
cero tokens CSS, paleta `#1976d2` hardcodeada con `!important`, **292 estilos inline**, **dos identidades en conflicto**
(login naranja `#ff5e00` vs app azul) y restos del demo en producción (idiomas "India/French/China",
"See all e-Mails", logos placeholder, título "BOTICA SALUD ROSA").

**Quick wins:** tokens en `styles.css`; unificar paleta login↔app; limpiar restos del demo;
clases `.btn-action`/`.cell-center`; `aria-label` en botones-icono; componentes `empty-state`/`loading-spinner`;
corregir textos de validación; adelgazar `index.html` (scripts duplicados).

---

## 📋 Plan de remediación (por lotes)

| Lote | Contenido | Estado |
|------|-----------|--------|
| 1 | Seguridad backend crítica: C1, C4, C5 (+ C2 acotado) | en curso |
| 2 | SQLi (C3): parametrizar `ConsultaGlobal` | pendiente |
| 3 | Seguridad frontend: C6, C7, C8, AuthGuard, HttpInterceptor | pendiente |
| 4 | Altas/medias: bcrypt, CORS, IDOR, command injection, validaciones | pendiente |
| 5 | UI/UX: tokens, limpieza demo, accesibilidad | pendiente |

---

## 📝 Changelog de remediación

### Lote 1 — Seguridad backend crítica (2026-06-12) ✅

- **C1** `index.php:56` — eliminado el override `$checktoken = true;`. La API ahora exige
  token válido. **Verificado:** token inválido → `401 "no esta Autenticado"`; store API-key → OK.
- **C4** `Api/ClienteController.php:270+` — subida de comprobantes ahora valida extensión +
  MIME real (`finfo`) + tamaño (≤5 MB), genera nombre seguro con `random_bytes` (ya no usa el
  nombre del cliente), corrige el bug `mt_srand`, y baja el `mkdir` de `0777`→`0755`. Cierra el RCE.
- **C2/C5** — clave de firma JWT y API-key del store movidas de los archivos **versionados**
  (`Helpers/JwtAuth.php`) al **no versionado** `config/Parametros.php` (`JWT_KEY`, `STORE_API_KEY`).
  `JwtAuth` es fail-closed si falta la clave. **Verificado:** lint PHP OK en los 4 archivos; store sigue operando.

> **⚠️ ACCIÓN PENDIENTE DEL EQUIPO (no la hace el código):** estas claves estuvieron en el historial
> de git, así que **deben ROTARSE**. Cambiar `JWT_KEY` fuerza re-login de admins. Cambiar `STORE_API_KEY`
> requiere actualizar `Carrito_compras` y `Carrito_compras_hermana` en coordinación.

**Propuestas que requieren tu OK (tocan comportamiento del store / otros repos):**
- Acotar `STORE_API_KEY` para que solo alcance endpoints `Api/*` (no controllers admin) — reduce
  drásticamente el daño si la key se filtra. Confirmar antes de implementar (Lote 2).
- Externalizar Sightengine / Pusher / token WhatsApp (también en archivos versionados) — Lote 4.

### Lote 3 — Seguridad frontend (2026-06-12) ✅ (build Angular OK)

- **C7** XSS de chat — añadido `escapeHtml()` y escapados todos los datos del cliente en
  `chat-box.component.ts` (8 sinks) y `header.component.ts` (`construirMensaje`).
- **A6** AuthGuard — reescrito para devolver `Observable<boolean|UrlTree>` que **sí bloquea**
  según el backend (antes retornaba `true` síncrono y la verificación async se ignoraba).
- **C6** Token apisperu — la consulta de RUC pasó a un **proxy backend** (`EmpresaController::BuscarRuc`,
  RUC saneado a dígitos); el token salió del bundle JS y vive en `Parametros.php` (`APISPERU_TOKEN`).
- **A8/A9** — nuevo `HttpErrorInterceptor` (registrado en `app.module.ts`): manejo central de errores
  HTTP + auto-logout en 401/403. El backend ahora responde **401** real en fallo de auth (`index.php`).
- **C8** (token en localStorage) — mitigado vía eliminación de vectores XSS (C7 + medias). La migración a
  cookie HttpOnly queda como mejora arquitectónica pendiente (no se hizo por riesgo de romper auth).

### Lote 2 — Inyección SQL (2026-06-12) ✅ (verificado en runtime)

- **C3** — helper `ConsultaGlobal::esc()` (PDO::quote) + `ConsultaGlobal::enteros()` + casteo `(int)`
  aplicados en **14 archivos**: `models/ConsultaGlobal.php` (ListarPedido, TraerChatLineaActivo) y los
  controllers Marca, Venta, Sucursal, Staff, Slider, Caja, Bodega, Promociones, AnularDocumento,
  ReporteVentaProducto, NotaVenta, Producto (admin) y Api/Producto (TraerProductoSlug).
  **Grep final: 0 patrones residuales. Lint: 14/14 OK.**
  **Prueba runtime:** payload `a' OR '1'='1` queda escapado → devuelve 0 filas en vez de 30.
- **C2 (acotar store key)** — en `index.php`, la `STORE_API_KEY` solo alcanza `Apicontroller=*` +
  allowlist `['NotaVenta']` (checkout). **Verificado:** Apicontroller=Producto→200, controller=Marca→401,
  controller=NotaVenta→200. Una key filtrada ya NO toca Usuario/Caja/Producto-admin.

### Lote 4 — Altas/medias (2026-06-12) ✅ parcial

- **A4** command injection — `escapeshellarg()` en `ReporteVentaProductoController` y `LibroVentasController`
  (antes entrecomillaban a mano datos de `$_POST`/request hacia `shell_exec`).
- **Headers de seguridad** — `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy` en `index.php`.
- **XSS medias frontend** — `escapeHtml()` aplicado en árboles de categoría/atributo (productos, categoria,
  pedidos, nuevo-producto, editar-producto) y en las rutas/URLs de los PDF/ticket (ventas, caja, nota-venta,
  baja-comprobantes). Build Angular OK.

### Lote 5 — UI/UX (2026-06-12) ✅ (build OK)

- **Tokens de diseño** en `styles.css` (`:root --color-*`, espaciados, radius) + utilidades
  `.btn-action`/`.cell-center`/`.empty-state`. Punto único para rebrandear.
- **Paleta login unificada** — el naranja `#ff5e00`/`#b33200`/gradiente del login pasó a `var(--color-primary*)`,
  consistente con la app.
- **Limpieza de restos del demo** — quitados el selector de idiomas falsos (estaba oculto, markup muerto) y el
  link "See all e-Mails" del header; duplicados de scripts/css (dropify x2, styleswitcher x2) en `index.html`.
- (El título "BOTICA SALUD ROSA" y el favicon `iconorosa.png` son **marca real**, no se tocaron.)

---

### Lote 6 — Altas/medias restantes (2026-06-12) ✅ (verificado en runtime)

- **A1 bcrypt** — nuevos helpers `helpers::hashPassword/verifyPassword/passwordNeedsRehash` con
  **compatibilidad total hacia atrás**: se siguen aceptando contraseñas SHA-256 y se **rehashean a bcrypt
  al vuelo** en cada login exitoso. Aplicado en login admin (`JwtAuth::signup` ahora busca por email y
  verifica en PHP), login cliente (`LoginCliente`), y en todos los puntos que fijan contraseña
  (`RegistrarUsuario`, `StaffController` x2, registro de cliente, cambios de contraseña).
  **Verificado runtime:** login sha256 `123456`→migra a bcrypt→JWT válido en endpoint protegido;
  re-login con bcrypt OK; password incorrecto→403. **Nadie queda fuera.**
- **password_verify invertido** (`Api/ClienteController::CambiarContraseniaUsuario`) — el bug (args
  invertidos + comparación contra sha256, nunca funcionaba) **corregido**: ahora usa `verifyPassword`.
- **A2 CORS** — `index.php` pasó de `Access-Control-Allow-Origin: *` a **allowlist** (en `Parametros.php`:
  localhost dev + `sistemaboticarosa.com`/`www` + `boticas.sistemasdurand.com`) **+ comodín de subdominios**
  de los dominios corporativos (cubre el admin esté donde esté bajo ellos). **Verificado:** localhost y
  `admin.sistemaboticarosa.com`→reflejados; `evil.com`→bloqueado.
- **Secretos externalizados** — Sightengine, Pusher (`Eventopusher.php`) y token de webhook WhatsApp
  movidos de archivos versionados a `Parametros.php` (`SIGHTENGINE_*`, `PUSHER_*`, `WHATSAPP_WEBHOOK_TOKEN`).
  Lint PHP OK en los 9 archivos tocados.

---

## ⏳ PENDIENTE — ya no es arreglable solo por código

- **A3 IDOR** (`Api/ClienteController`, pedidos por `id_cliente`/`id_pedido`) — la API pública del store
  **no tiene identidad por-cliente** (usa la API-key compartida), así que no hay contra qué validar la
  propiedad del recurso. Cerrarlo requiere **introducir autenticación por cliente** (token/JWT por cliente
  en el store) — cambio arquitectónico, no un parche. Recomendado hacerlo en el front nuevo (`crm-api`).
- **Rotación de secretos (ACCIÓN DE OPS)** — `JWT_KEY`, `STORE_API_KEY`, `APISPERU_TOKEN`, Pusher, Sightengine,
  SendGrid y Cloudinary estuvieron en git/bundle. El código ya no los filtra, pero **deben rotarse** (cambiar
  el valor real). Rotar `JWT_KEY`=re-login de admins; `STORE_API_KEY`=coordinar con las 2 tiendas.
- **C8 cookie HttpOnly** — migración del token desde localStorage a cookie (mitigado vía eliminación de XSS).
- **Migración total fuera de jQuery** — no recomendada en el legado; va en el front nuevo `crm-admin`.
