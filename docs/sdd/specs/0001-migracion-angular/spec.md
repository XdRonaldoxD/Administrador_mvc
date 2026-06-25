# Spec: Migración de Angular 13 a versión moderna

> Spec sembrada como primera del front. Migración mayor por mayor (13 → 14 → 15 → …), no de golpe.

- **ID:** 0001
- **Estado:** Borrador
- **Autor:** rdurand
- **Fecha:** 2026-06-25

## Problema / Motivación
El panel admin corre sobre **Angular 13**, fuera de soporte (LTS terminado). Quedarse atrás bloquea librerías modernas, deja sin parches de seguridad, e impide usar mejoras de rendimiento y DX (standalone components, nuevo control flow, esbuild). Además hay inconsistencia de versiones interna que conviene sanear.

## Objetivo
Llevar el frontend de Angular 13 a una versión moderna soportada, sin perder funcionalidad ni romper la integración con la API del backend, de forma incremental y reversible.

## Alcance
**Incluye:**
- Actualizar el core de Angular y el CLI **una versión mayor a la vez** vía `ng update`.
- Alinear TypeScript, RxJS, zone.js y Node a los rangos exigidos por cada versión.
- Actualizar o reemplazar dependencias de terceros incompatibles.
- Sanear la inconsistencia de `@angular/animates` (hoy v12 frente a core v13).

**NO incluye (fuera de alcance):**
- Reescribir la arquitectura por features ni cambiar de framework.
- Migrar a standalone components / nuevo control flow como obligatorio (evaluable como mejora posterior).
- Cambios en el backend (`MVC_CRM`).
- Nuevas features funcionales.

## Criterios de aceptación
- [ ] CA1: `npm install` y `ng build` corren sin errores en la versión destino.
- [ ] CA2: `ng test` pasa **igual o mejor** que el baseline capturado en Angular 13.
- [ ] CA3: Los flujos críticos del panel (login, listados/datatables, formularios, editor de texto, PDFs, gráficos) funcionan sin errores nuevos en consola.
- [ ] CA4: `@angular/*` quedan **todos en la misma versión mayor** (sin el desfase de animations).
- [ ] CA5: Node y TypeScript quedan en versiones compatibles con la versión destino de Angular, documentadas en el README.
- [ ] CA6: Las dependencias de terceros quedan en versiones compatibles; las no mantenidas se reemplazan o se documenta el riesgo.

## Reglas de negocio / restricciones
- Trabajar en rama `migracion-angular`, un commit por salto de versión.
- No editar `node_modules/`; todo vía `package.json` / `ng update`.
- Cada salto mayor debe dejar la app compilando y los tests verdes antes de pasar al siguiente.

## Preguntas abiertas
- **Versión destino:** ¿la última estable, o una LTS intermedia más conservadora? Decidir en el plan.
- **Dependencias problemáticas a evaluar:** `angular-font-awesome ^2` (sin mantenimiento — ¿reemplazar por `@fortawesome/angular-fontawesome`?), `angular-datatables` + `jquery` (¿se mantienen o se migra a una tabla nativa de Angular?), `ngx-quill ^8`/`quill ^1`, `ng2-tooltip-directive`, `@kolkov/angular-editor`.
- ¿Hasta qué versión exige el equipo? (depende del Node disponible vía nvm).
