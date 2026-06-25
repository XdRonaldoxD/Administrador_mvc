# Constitución del proyecto — Front Angular (administrador_mvc)

Reglas inamovibles que rigen TODA feature. Cualquier spec, plan o implementación que las contradiga debe rechazarse o escalar para cambiar la constitución primero.

## 1. Stack y estructura

- **Framework:** Angular (actualmente v13). SPA del panel de administración del CRM.
- **Lenguaje:** TypeScript. Arquitectura por features en `src/app/features/` (dominio / aplicación / infraestructura / ui).
- **Gestor de paquetes:** npm. Las dependencias se cambian vía `package.json`, nunca editando `node_modules/`.
- **Backend separado:** API en `MVC_CRM` (PHP). El front consume la API; no asume lógica de servidor.
- **Entorno:** Node gestionado con nvm-windows (varias versiones disponibles). Cada versión mayor de Angular exige un rango de Node/TypeScript específico.

## 2. Calidad y verificación

- **Build limpio.** `ng build` debe compilar sin errores antes de dar una feature por terminada.
- **Tests como red.** `ng test` (Karma/Jasmine) igual o mejor que el baseline; no se mergea con tests rotos que antes pasaban.
- **Un commit por tarea verificable.** Facilita revertir y ubicar regresiones.
- **Rama por feature.** Nunca trabajar directo sobre `main`.

## 3. Seguridad

- **Nunca confiar en el cliente.** Toda validación crítica también ocurre en el backend; el front valida por UX, no por seguridad.
- **Tokens en almacenamiento adecuado**; no exponer secretos ni credenciales en el código ni en `environment.ts` versionado.
- **Sanitizar** contenido dinámico (evitar `innerHTML` sin DomSanitizer) para prevenir XSS.

## 4. Datos personales (cumplimiento)

- Datos de estudiantes, docentes y colaboradores son **confidenciales** (Ley 29733 - Perú; SUNEDU/MINEDU).
- No exponer datos personales en logs de consola ni en el repositorio.
- No subir datos reales de producción a entornos de prueba sin anonimizar.

## 5. Proceso SDD

- Toda feature pasa por: **Spec → Plan → Tasks → Implement → Verify**.
- El humano **aprueba la spec y el plan** antes de escribir código.
- Cada spec define **criterios de aceptación objetivos**; sin ellos no se planifica.
- Las migraciones de Angular se hacen **una versión mayor a la vez** (`ng update`), nunca saltando varias de golpe.

## 6. Estilo

- Código nuevo imita el estilo del circundante (naming, estructura de carpetas por feature).
- Comentarios y textos de UI en español.
