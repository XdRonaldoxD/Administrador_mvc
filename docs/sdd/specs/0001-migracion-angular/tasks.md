# Tasks: Migración de Angular 13 a versión moderna

> Etapa 4 del ciclo SDD. Plan partido en tareas pequeñas, ordenadas y verificables. Cada tarea ≈ 1 commit. Se ejecutan una a una (Implement) validando cada una antes de seguir.

- **Plan asociado:** specs/0001-migracion-angular/plan.md
- **Rama de trabajo:** `migracion-angular`
- **Regla:** una versión mayor a la vez; build + tests verdes antes de pasar al siguiente salto.

## Tareas

- [ ] **T0 — Pre-vuelo: rama y baseline**
  - Qué hacer: confirmar árbol git limpio, crear rama `migracion-angular`, correr `npm install`, `ng build` y `ng test` en Angular 13. Anotar el resultado (¿compila?, cuántos tests pasan).
  - Cómo verificar: existe la rama y queda registrado el baseline.
  - Archivos: ninguno (solo git + medición).

- [ ] **T1 — Confirmar Node destino (nvm)**
  - Qué hacer: con el humano, fijar la versión de Angular destino y el Node que la soporta (`nvm use`). Recomendación: Angular 17 + Node 20/22.
  - Cómo verificar: `node -v` muestra la versión elegida; documentada.
  - Archivos: ninguno. Depende de: T0.

- [ ] **T2 — Ganancias rápidas: limpiar dependencias muertas/fantasma**
  - Qué hacer: eliminar el import muerto de `@kolkov/angular-editor` en `nuevo-producto.component.ts` (~línea 15); quitar `@kolkov/angular-editor` y `angular-font-awesome` de `package.json`.
  - Cómo verificar: `ng build` sigue compilando; las libs ya no están en `package.json` → avanza CA6.
  - Archivos: `nuevo-producto.component.ts`, `package.json`. Depende de: T0.

- [ ] **T3 — Ganancias rápidas: alinear animations y BrowserModule**
  - Qué hacer: subir `@angular/animations` a la misma major que el core (13 por ahora); cambiar `BrowserModule` por `CommonModule` en `pages.module.ts` (~línea 108).
  - Cómo verificar: `ng build` compila sin el warning de BrowserModule duplicado → avanza CA4.
  - Archivos: `package.json`, `pages.module.ts`. Depende de: T2.

- [ ] **T4 — ng update a Angular 14**
  - Qué hacer: `ng update @angular/core@14 @angular/cli@14`; dejar que los schematics apliquen migraciones automáticas; revisar el diff.
  - Cómo verificar: `ng build` compila; `ng test` ≥ baseline; commit del salto.
  - Archivos: `package.json`, config, código que migren los schematics. Depende de: T3.

- [ ] **T5 — ng update a Angular 15**
  - Qué hacer: `ng update @angular/core@15 @angular/cli@15`; subir libs de terceros que lo exijan (datatables, ngx-quill, ng-select, color-picker, toastr, pdf-viewer).
  - Cómo verificar: build OK; tests ≥ baseline; commit.
  - Archivos: `package.json`, código migrado. Depende de: T4.

- [ ] **T6 — ng update a Angular 16**
  - Qué hacer: `ng update @angular/core@16 @angular/cli@16`; alinear `zone.js` y TypeScript si lo pide; subir terceros.
  - Cómo verificar: build OK; tests ≥ baseline; commit.
  - Archivos: `package.json`, config. Depende de: T5.

- [ ] **T7 — ng update a Angular 17**
  - Qué hacer: `ng update @angular/core@17 @angular/cli@17`; verificar builder esbuild; subir terceros restantes.
  - Cómo verificar: build OK; tests ≥ baseline → **avanza CA1, CA2**; commit.
  - Archivos: `package.json`, `angular.json`, `tsconfig.json`. Depende de: T6.

- [ ] **T8 — Resolver terceros incompatibles (si aparecen)**
  - Qué hacer: para cualquier lib que `ng update` marque sin versión compatible, evaluar: subir, reemplazar, o congelar la versión destino donde sí haya soporte (decisión con el humano). `angular-datatables` es el principal candidato a vigilar.
  - Cómo verificar: `npm install` sin conflictos de peer deps; build OK → **CA6**.
  - Archivos: `package.json`. Depende de: T7.

- [ ] **T9 — Verificación funcional (build + tests + humo)**
  - Qué hacer: `ng build` producción y `ng test` completos; prueba de humo en navegador de los flujos críticos: login, listados con datatables, formularios, editor Quill, visor PDF, gráficos ApexCharts. Revisar consola.
  - Cómo verificar: build limpio (**CA1**), tests ≥ baseline (**CA2**), sin errores nuevos en consola (**CA3**).
  - Archivos: ninguno (validación). Depende de: T8.

- [ ] **T10 — Documentar versiones en README**
  - Qué hacer: anotar en el README la versión de Angular destino, el Node y el TypeScript requeridos.
  - Cómo verificar: README actualizado → **CA5**.
  - Archivos: `README.md`. Depende de: T9.

## Verificación final (etapa Verify)
- [ ] CA1 — `npm install` + `ng build` sin errores (T9)
- [ ] CA2 — `ng test` ≥ baseline (T9)
- [ ] CA3 — Flujos críticos sin errores nuevos en consola (T9)
- [ ] CA4 — `@angular/*` todos en la misma major (T3 + saltos)
- [ ] CA5 — Node y TypeScript compatibles, documentados (T10)
- [ ] CA6 — Terceros compatibles; no mantenidas eliminadas/documentadas (T2, T8)
- [ ] Revisado contra la constitución (seguridad, datos personales)

## Deuda técnica registrada (fuera de alcance — futuras specs)
- Eliminar jQuery (~383 líneas en 27 archivos) → migrar a APIs nativas/directivas Angular.
- Implementar `OnDestroy` en los 24 componentes sin cleanup de subscripciones.
- Adoptar `ChangeDetectionStrategy.OnPush` y, a futuro, standalone components + `bootstrapApplication()`.
