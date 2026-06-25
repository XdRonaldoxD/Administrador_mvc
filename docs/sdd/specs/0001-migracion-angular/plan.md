# Plan: Migración de Angular 13 a versión moderna

> Etapa 3 del ciclo SDD. Responde **CÓMO**. Basado en evidencia real del código recogida por 3 agentes exploradores (ver "Hallazgos").

- **Spec asociada:** specs/0001-migracion-angular/spec.md
- **Estado:** Borrador (pendiente de aprobación del humano)

## Aclaración de alcance (importante)

Esta migración es un **upgrade de versión** vía `ng update`, no una reescritura de arquitectura. El código actual (NgModules + jQuery + datatables) **es compatible con Angular moderno**; no hace falta eliminar jQuery ni pasar a standalone components para subir de versión. Esas modernizaciones son valiosas pero quedan **fuera de alcance** (futuras specs). Mantener el foco evita convertir un upgrade de ~1-2 semanas en un refactor de meses.

## Hallazgos del escaneo (evidencia)

Tres agentes escanearon `src/`:

1. **Tamaño:** 86 archivos TS, 2 NgModules (AppModule, PagesModule), 39 componentes, 30 servicios, ~13.600 LOC. Arquitectura por NgModules con lazy-loading parcial.
2. **Dependencias muertas / fantasma (ganancias rápidas):**
   - `@kolkov/angular-editor`: importado en `nuevo-producto.component.ts:15` pero **nunca usado** → eliminar import + paquete.
   - `angular-font-awesome`: **0 usos** en `src/` → quitar de `package.json` (resuelve gran parte de CA6).
3. **Inconsistencia de versión:** `@angular/animations ^12.2.17` frente a core `~13.0.0` → alinear a la versión destino.
4. **Anti-patrón real que puede molestar al subir:** `BrowserModule` importado en `pages.module.ts:108` (debe ir solo en `AppModule`; en feature modules va `CommonModule`).
5. **Librerías de terceros que suben con cada major:** `angular-datatables` (11 archivos), `ngx-quill` (6 archivos, config centralizada en `HelpersService`), `@ng-select/ng-select`, `ngx-color-picker`, `ngx-extended-pdf-viewer`, `apexcharts`. Funcionan; solo hay que subir su versión a la compatible con cada Angular.
6. **Config legacy:** TypeScript `target: es2017`, `zone.js 0.11.8`, RxJS 7.4. `ng update` los sube automáticamente.
7. **Fuera de alcance (no bloquean el upgrade):** ~383 líneas de jQuery en 27 archivos, 24 componentes sin `OnDestroy`, ausencia de `OnPush`. Se documentan como deuda técnica para specs futuras.

## Enfoque técnico

Migración **una versión mayor a la vez** con `ng update`, dejando la app compilando y los tests verdes en cada salto. Antes de empezar, **ganancias rápidas** (limpiar deps muertas, alinear animations, arreglar BrowserModule) para reducir ruido. El propio `ng update` aplica *migration schematics* que reescriben código deprecado automáticamente en cada salto.

**Versión destino:** a decidir según el Node disponible (vía nvm). Con Node 22 disponible, es viable la última estable. Recomendación conservadora: **Angular 17** (esbuild por defecto, soporte vigente) como meta inicial; evaluar 18/19 después. Decisión final del humano antes de implementar.

## Archivos / módulos afectados

| Archivo / módulo | Cambio | Origen |
|------------------|--------|--------|
| `package.json` | Subir `@angular/*`, CLI, TS, zone.js, RxJS y libs de terceros; quitar deps fantasma | Todos los saltos |
| `src/app/pages/nuevo-producto/nuevo-producto.component.ts` | Quitar import muerto `@kolkov/angular-editor` (línea ~15) | Ganancia rápida |
| `src/app/pages/pages.module.ts` | `BrowserModule` → `CommonModule` (línea ~108) | Ganancia rápida |
| `angular.json`, `tsconfig.json` | Builder y `target` que actualice `ng update` | Automático |
| Código deprecado puntual | Lo reescriben los schematics de `ng update` | Automático |

## Dependencias / herramientas

- Núcleo: `ng update @angular/core@N @angular/cli@N` por cada N (14, 15, 16, 17).
- Terceros, subir a la major compatible en cada salto: `angular-datatables`, `ngx-quill`/`quill`, `@ng-select/ng-select`, `ngx-color-picker`, `ngx-toastr`, `ngx-extended-pdf-viewer`, `sweetalert2`.
- Eliminar: `@kolkov/angular-editor`, `angular-font-awesome`.
- `@types/node` 12 → acorde al Node destino.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Una lib de terceros no tiene versión para el Angular destino | Detectar con `ng update` (avisa incompatibilidades); evaluar reemplazo o congelar versión destino donde sí haya soporte |
| `angular-datatables` se queda atrás | Verificar su matriz de compatibilidad por salto; si bloquea, congelar en el último Angular que la soporte y abrir spec de reemplazo |
| Cambios de Material/CDK (MDC) si se usa | Revisar; el proyecto no parece usar Material (confirmar) |
| Node insuficiente para versión destino | Fijar versión Node con nvm antes de empezar; documentar en README (CA5) |
| Salto rompe build | Un commit por salto; si falla, revertir solo ese salto |

## Cómo se verificará (mapeo a criterios de aceptación)

| Criterio | Cómo se comprueba |
|----------|-------------------|
| CA1 (`npm install` + `ng build`) | Build sin errores en versión destino |
| CA2 (tests ≥ baseline) | `ng test` vs baseline de Angular 13 |
| CA3 (flujos críticos sin errores) | Prueba manual: login, datatables, formularios, editor Quill, PDF, gráficos; revisar consola |
| CA4 (`@angular/*` misma major) | Revisar `package.json`: animations alineado |
| CA5 (Node/TS compatibles documentados) | README actualizado con versiones |
| CA6 (terceros compatibles, no mantenidas reemplazadas/documentadas) | `@kolkov` y `font-awesome` eliminadas; resto en versión compatible |

## Orden de ejecución propuesto (detalle en tasks.md)

1. Pre-vuelo: rama `migracion-angular` + baseline (`ng build` + `ng test` en v13).
2. Ganancias rápidas: quitar deps muertas/fantasma, alinear animations, arreglar BrowserModule.
3. `ng update` a v14 → build + test + commit.
4. Repetir para v15, v16, v17 (un salto por commit).
5. Subir terceros incompatibles en el salto que lo exija.
6. Verificación final: build + tests + prueba de humo + actualizar README con Node/TS.
