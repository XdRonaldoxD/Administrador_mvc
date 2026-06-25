# SDD — Spec-Driven Development (Front Angular)

Método para construir features con IA de forma **predecible y verificable**: primero se escribe *qué* se quiere y *cómo se valida*, y recién entonces se construye. Evita que el agente genere código plausible pero equivocado.

> Este es el SDD del **frontend** (`administrador_mvc`, Angular). Es independiente del SDD del backend (`MVC_CRM`). Cada proyecto tiene su propia constitución y sus propias specs.

## El ciclo

```
Constitución (1 vez)
      │
      ▼
  Specify ─► Plan ─► Tasks ─► Implement ─► Verify ─┐
      ▲                                            │
      └──────────────── (si falla, ajusta) ◄───────┘
```

| Etapa | Pregunta | Artefacto |
|-------|----------|-----------|
| **Constitución** | ¿Cuáles son las reglas inamovibles del proyecto? | `constitution.md` (una vez) |
| **Specify** | ¿QUÉ construyo y cómo sé que quedó bien? | `specs/NNNN-nombre/spec.md` |
| **Plan** | ¿CÓMO lo construyo (técnico)? | `specs/NNNN-nombre/plan.md` |
| **Tasks** | ¿En qué pasos pequeños se divide? | `specs/NNNN-nombre/tasks.md` |
| **Implement** | Ejecutar las tareas una a una | commits por tarea |
| **Verify** | ¿Cumple los criterios de aceptación? | tests + checklist |

## Cómo trabajarlo con Claude

Es una conversación, no escritura manual. Tú describes en lenguaje normal, Claude redacta los `.md`, tú revisas y apruebas.

1. **Nueva feature** → pídele a Claude: *"llena la spec de [feature]"*.
2. Revisa y aprueba la spec. **No avances sin criterios de aceptación claros.**
3. *"genera el plan"* → revisa.
4. *"genera las tareas"* → deben ser pequeñas y verificables.
5. *"implementa la tarea T1"* → Claude ejecuta y commitea. Una a una.
6. *"verifica contra los criterios"* → si falla, vuelve al plan.

> Regla de oro: el humano aprueba **spec** y **plan** antes de tocar código.

## Numeración

Specs numeradas: `0001-`, `0002-`, … La carpeta `0001-migracion-angular/` ya está sembrada (migrar de Angular 13 a una versión moderna).
