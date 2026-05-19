# Gestión del proyecto — NoteFlow

Documento de planificación, seguimiento y entrega del proyecto académico **NoteFlow** (DAM). Define la metodología, el tablero Kanban en Trello y el desglose de funcionalidades en tarjetas con subtareas técnicas.

---

## Tabla de contenidos

1. [Metodología de trabajo](#1-metodología-de-trabajo)
2. [Tablero Trello](#2-tablero-trello)
3. [Columnas del tablero](#3-columnas-del-tablero)
4. [Tarjetas y subtareas](#4-tarjetas-y-subtareas)
5. [Flujo de las tarjetas](#5-flujo-de-las-tarjetas)
6. [Estructura del repositorio](#6-estructura-del-repositorio)
7. [Enlaces](#7-enlaces)

---

## 1. Metodología de trabajo

NoteFlow se desarrolla con un enfoque **ágil ligero** adaptado a un proyecto individual o equipo pequeño (prácticas DAM):

| Principio | Aplicación en NoteFlow |
|-----------|------------------------|
| **Kanban** | Flujo visual de tareas en Trello (Backlog → Done) |
| **Entregas incrementales** | Cada tarjeta deja la app ejecutable en Expo Go |
| **Priorización por valor** | Primero modelo de datos y navegación; después UI y extras |
| **Documentación continua** | `docs/` actualizado en paralelo al código |
| **IA como acelerador** | Cursor + `.cursorrules`; revisión humana obligatoria |
| **Control de versiones** | Git con commits frecuentes por feature |

No se usa Scrum completo (sprints formales, roles PO/SM): el ritmo lo marcan las entregas del módulo y el estado del tablero.

### Ciclo por funcionalidad

1. **Refinar** la tarjeta en Backlog (criterios de aceptación claros).
2. **Mover** a Todo cuando esté lista para desarrollarse.
3. **Implementar** en In Progress (rama o commits locales).
4. **Validar** en Review (`tsc`, Expo Go, revisión de diff).
5. **Cerrar** en Done con documentación y commit asociado.

---

## 2. Tablero Trello

El seguimiento diario se realiza en un tablero Kanban de **Trello** con cinco columnas fijas.

**Enlace al tablero:** [Enlace al tablero Trello pendiente]

> Sustituir el texto anterior por la URL real cuando el tablero esté creado (p. ej. `https://trello.com/b/xxxxxxxx/noteflow`).

### Convenciones en las tarjetas

- **Título**: nombre de la funcionalidad (coincide con las secciones de este documento).
- **Descripción**: objetivo, archivos afectados y criterios de aceptación.
- **Checklist**: subtareas técnicas de la sección 4.
- **Etiquetas sugeridas**: `setup`, `ui`, `store`, `docs`, `bug`.
- **Fechas**: opcional en tarjetas de entrega del módulo.

---

## 3. Columnas del tablero

```
Backlog → Todo → In Progress → Review → Done
```

| Columna | Qué representa | Quién actúa | Criterio de salida |
|---------|----------------|-------------|-------------------|
| **Backlog** | Ideas y trabajo futuro sin compromiso inmediato. Prioridad aún no asignada o dependiente de otra tarjeta. | Product owner / desarrollador | La tarjeta está descrita y descompuesta en subtareas |
| **Todo** | Trabajo **comprometido** para el ciclo actual: listo para empezar, sin bloqueos conocidos. | Desarrollador | Se inicia la implementación |
| **In Progress** | Desarrollo activo: código, pruebas locales, uso de IA bajo revisión. **WIP limit: 1–2** tarjetas para evitar dispersión. | Desarrollador | Feature completa en local; `tsc` sin errores |
| **Review** | Validación antes de cerrar: prueba en Expo Go, revisión de tipos, coherencia con arquitectura y docs. | Desarrollador / revisor | Sin bugs bloqueantes; diff aceptado |
| **Done** | Entregado: merge o commit en `main`, documentación al día, demostrable en dispositivo. | — | Tarjeta archivable; checklist al 100 % |

### Estados especiales

- **Bloqueada**: etiqueta `blocked` + comentario (dependencia, error de Expo, etc.); la tarjeta puede permanecer en Todo o In Progress sin avanzar.
- **Reapertura**: desde Done a Todo solo si es un defecto grave o cambio de alcance acordado.

---

## 4. Tarjetas y subtareas

Cada fila es una **tarjeta** del tablero. Las listas debajo son **subtareas** para la checklist de Trello.

---

### Tarjeta 1 — Definición de la idea

**Columna habitual al cierre:** Done

**Objetivo:** Fijar problema, usuario, alcance v1 y roadmap opcional.

**Subtareas técnicas:**

- [ ] Redactar `docs/idea.md` (problema, usuario, día a día, v1, futuro).
- [ ] Definir tipos de contenido: nota, checklist, idea.
- [ ] Listar funcionalidades excluidas de v1 (nube, auth, etc.).
- [ ] Validar coherencia con requisitos del módulo DAM.

---

### Tarjeta 2 — Configuración inicial Expo

**Columna habitual al cierre:** Done

**Objetivo:** Proyecto Expo ejecutable con TypeScript y entrada Expo Router.

**Subtareas técnicas:**

- [ ] Crear proyecto con Expo SDK 54 (`expo-router` como `main`).
- [ ] Configurar `app.json` (nombre, slug, `newArchEnabled`, plugins).
- [ ] Configurar `tsconfig.json` (modo estricto).
- [ ] Configurar `babel.config.js` con `babel-preset-expo` únicamente.
- [ ] Verificar arranque con `npx expo start` en Expo Go.
- [ ] Añadir `.gitignore` y estructura base de carpetas.

---

### Tarjeta 3 — Configuración IA

**Columna habitual al cierre:** Done

**Objetivo:** Entorno de desarrollo asistido por IA alineado con el stack.

**Subtareas técnicas:**

- [ ] Crear `.cursorrules` (estructura, convenciones, alcance).
- [ ] Redactar `docs/ai-setup.md` (Cursor, reglas, Gemini/Claude, buenas prácticas).
- [ ] Documentar stack obligatorio y restricciones (sin Reanimated en Go, etc.).
- [ ] Definir plantilla de prompt para herramientas alternativas.

---

### Tarjeta 4 — Sistema de diseño

**Columna habitual al cierre:** Done

**Objetivo:** UI coherente con Material Design 3 y tema claro/oscuro.

**Subtareas técnicas:**

- [ ] Instalar y configurar `react-native-paper`.
- [ ] Crear `constants/theme.ts` (spacing, `colorsLight`, `colorsDark`, `getPaperTheme`).
- [ ] Implementar `providers/AppProviders.tsx` con `useColorScheme` y `PaperProvider`.
- [ ] Crear componentes base: `EmptyState`, cards (`NoteCard`, `ChecklistCard`, `IdeaCard`).
- [ ] Usar `useTheme()` y tokens de espaciado en pantallas.

---

### Tarjeta 5 — Navegación Expo Router

**Columna habitual al cierre:** Done

**Objetivo:** Arquitectura de rutas por tabs y stacks anidados.

**Subtareas técnicas:**

- [ ] `app/_layout.tsx` — Stack raíz (`(tabs)`, `nueva-nota`).
- [ ] `app/(tabs)/_layout.tsx` — Tabs Notas / Checklists / Ideas con iconos.
- [ ] `app/(tabs)/{notas,checklists,ideas}/_layout.tsx` — Stack por tab (`index`, `[id]`).
- [ ] Pantallas `index.tsx` por tab (listados).
- [ ] Pantallas `[id].tsx` por tab (detalle).
- [ ] `app/nueva-nota.tsx` — formulario accesible desde FAB (`router.push`).
- [ ] Probar navegación atrás y deep linking básico.

---

### Tarjeta 6 — Modelado TypeScript

**Columna habitual al cierre:** Done

**Objetivo:** Dominio tipado y seguro para las tres entidades.

**Subtareas técnicas:**

- [ ] Definir en `types/index.ts`: `TextNote`, `ChecklistNote`, `IdeaNote`, `ChecklistItem`.
- [ ] Crear union `AnyNote` y tipos de entrada (`CreateAnyNoteInput`, `UpdateAnyNoteInput`).
- [ ] Implementar type guards: `isTextNote`, `isChecklistNote`, `isIdeaNote`.
- [ ] Definir `IdeaColor` y constantes `IDEA_COLORS`.
- [ ] Crear `constants/ideaColors.ts` para etiquetas y valores de color en UI.

---

### Tarjeta 7 — Estado global Zustand

**Columna habitual al cierre:** Done

**Objetivo:** Store único para CRUD y consultas por tipo.

**Subtareas técnicas:**

- [ ] Instalar `zustand`.
- [ ] Crear `store/notesStore.ts` con arrays `notes`, `checklists`, `ideas`.
- [ ] Implementar acciones: `addNote`, `addChecklist`, `addIdea`, `updateNote`, `delete*`, `toggleChecklistItem`.
- [ ] Implementar selectores: `getNotesByType`, `getNoteById`.
- [ ] Exponer flag `_hasHydrated` y `setHasHydrated`.
- [ ] Conectar pantallas con selectores granulares (evitar suscripciones al store completo).

---

### Tarjeta 8 — Listas con FlashList

**Columna habitual al cierre:** Done

**Objetivo:** Listados performantes en las tres tabs.

**Subtareas técnicas:**

- [ ] Instalar `@shopify/flash-list`.
- [ ] Implementar `FlashList` en `app/(tabs)/notas/index.tsx` (`estimatedItemSize`: 120).
- [ ] Implementar en `checklists/index.tsx` (`estimatedItemSize`: 160).
- [ ] Implementar en `ideas/index.tsx` (`estimatedItemSize`: 140).
- [ ] Crear `components/lists/NoteListItem.tsx` y cards asociadas.
- [ ] Estados vacíos con `EmptyState` y `getListEmptyState`.
- [ ] Mantener FAB en cada pantalla de listado.

---

### Tarjeta 9 — Formularios con Zod

**Columna habitual al cierre:** Done

**Objetivo:** Validación de creación/edición en `nueva-nota` y detalle.

**Subtareas técnicas:**

- [ ] Instalar `zod`.
- [ ] Crear `validation/nuevaNotaSchemas.ts` (`noteFormSchema`, `checklistFormSchema`, `ideaFormSchema`).
- [ ] Mapear errores Zod a mensajes de UI (`mapZodErrors`, `FieldError`).
- [ ] Integrar `SegmentedButtons` para tipo de contenido en `nueva-nota.tsx`.
- [ ] Validar antes de llamar a acciones del store.
- [ ] Gestionar ítems dinámicos en checklist (añadir / quitar filas).

---

### Tarjeta 10 — Persistencia AsyncStorage

**Columna habitual al cierre:** Done

**Objetivo:** Datos locales que sobreviven al cierre de la app.

**Subtareas técnicas:**

- [ ] Instalar `@react-native-async-storage/async-storage`.
- [ ] Aplicar middleware `persist` en `notesStore` con `createJSONStorage`.
- [ ] Configurar `partialize` (solo `notes`, `checklists`, `ideas`).
- [ ] Definir `version` y función `migrate` para datos legacy.
- [ ] Implementar `onRehydrateStorage` y `onFinishHydration`.
- [ ] Mostrar `ActivityIndicator` hasta `_hasHydrated === true`.

---

### Tarjeta 11 — Detalle y eliminación

**Columna habitual al cierre:** Done / Review

**Objetivo:** Ver, editar y borrar cada tipo de contenido desde `[id]`.

**Subtareas técnicas:**

- [ ] Resolver `id` de ruta con `utils/resolveParamId.ts`.
- [ ] Cargar entidad con `getNoteById` en pantallas `[id].tsx`.
- [ ] Formularios de edición por tipo (nota, checklist, idea).
- [ ] Botón eliminar con confirmación y `router.back()` tras borrar.
- [ ] Actualizar `updatedAt` en modificaciones.
- [ ] Manejar id inexistente (redirección o mensaje de error).

---

### Tarjeta 12 — Búsqueda

**Columna habitual al cierre:** Done

**Objetivo:** Filtrado en tiempo real por tab.

**Subtareas técnicas:**

- [ ] Crear `utils/noteFilters.ts` (`filterTextNotes`, `filterChecklistNotes`, `filterIdeaNotes`).
- [ ] Añadir `TextInput` de Paper en cada `index.tsx` de tab.
- [ ] Memoizar resultados con `useMemo` según `searchQuery`.
- [ ] Mensaje «No se encontraron resultados» vs «No hay notas/checklists/ideas».
- [ ] Icono limpiar búsqueda en el input.

---

### Tarjeta 13 — Documentación final

**Columna habitual al cierre:** Todo / In Progress

**Objetivo:** Paquete de documentación entregable del módulo.

**Subtareas técnicas:**

- [ ] Completar `docs/idea.md`.
- [ ] Completar `docs/react-native-teoria.md`.
- [ ] Completar `docs/ai-setup.md`.
- [ ] Completar `docs/project-management.md` (este documento).
- [ ] Revisar coherencia entre docs y código real.
- [ ] Añadir enlace al tablero Trello en la sección 7.
- [ ] README raíz opcional con instrucciones de instalación y ejecución.

---

## 5. Flujo de las tarjetas

### Diagrama del ciclo de vida

```
                    ┌─────────────┐
                    │   Backlog   │  Ideas y trabajo futuro
                    └──────┬──────┘
                           │ priorizar / refinar
                           ▼
                    ┌─────────────┐
                    │    Todo     │  Comprometido para ahora
                    └──────┬──────┘
                           │ empezar desarrollo
                           ▼
                    ┌─────────────┐
         ┌─────────│ In Progress │─────────┐
         │         └──────┬──────┘         │
         │ bloqueo        │ feature lista  │ abandonar alcance
         ▼                ▼                ▼
    (etiqueta         ┌─────────────┐   Backlog
     blocked)         │   Review    │
                      └──────┬──────┘
                             │ OK en Expo Go + tsc + docs
                             ▼
                      ┌─────────────┐
                      │    Done     │
                      └─────────────┘
```

### Ejemplo: tarjeta «Búsqueda»

| Fase | Acción |
|------|--------|
| Backlog | Se define filtro por título/contenido/tags tras tener listas FlashList. |
| Todo | Se asigna al sprint actual; checklist copiada desde este doc. |
| In Progress | Se implementa `noteFilters.ts` y `TextInput` en las tres tabs. |
| Review | Se prueba búsqueda vacía, sin resultados y con acentos; `tsc` OK. |
| Done | Commit `feat: búsqueda en tabs`; tarjeta archivada. |

### Orden de dependencias recomendado

```
Definición idea → Expo inicial → Modelado TS → Zustand → Persistencia
       ↓
  Navegación + Diseño (paralelo)
       ↓
  FlashList → Formularios Zod → Detalle/eliminación → Búsqueda
       ↓
  Config IA + Documentación final (continuo)
```

Las tarjetas no deberían pasar a **Done** si una dependencia posterior en runtime falla (p. ej. Persistencia antes de probar que el store guarda).

---

## 6. Estructura del repositorio

Referencia rápida alineada con las tarjetas:

| Carpeta | Responsabilidad |
|---------|-----------------|
| `app/` | Rutas Expo Router y pantallas |
| `components/` | UI reutilizable (items, lists, ui) |
| `constants/` | Tema, colores de ideas |
| `providers/` | `AppProviders` (Paper + tema sistema) |
| `store/` | `notesStore.ts` (Zustand + persist) |
| `types/` | Modelo TypeScript |
| `utils/` | Filtros, formato, helpers de rutas |
| `validation/` | Esquemas Zod |
| `docs/` | Idea, teoría, IA, gestión |

---

## 7. Enlaces

| Recurso | Enlace |
|---------|--------|
| **Tablero Trello** | [Enlace al tablero Trello pendiente] |
| Idea de producto | [`docs/idea.md`](./idea.md) |
| Teoría React Native | [`docs/react-native-teoria.md`](./react-native-teoria.md) |
| Configuración IA | [`docs/ai-setup.md`](./ai-setup.md) |
| Reglas Cursor | [`.cursorrules`](../.cursorrules) |

---

## Resumen

NoteFlow se gestiona con **Kanban en Trello**: trabajo visible, límites de WIP y entregas incrementales. Las **13 tarjetas** de este documento cubren el alcance v1 desde la idea hasta la documentación final; cada una incluye subtareas técnicas para copiar directamente en Trello. El movimiento **Backlog → Done** refleja el avance real del código, las pruebas en Expo Go y la documentación asociada.
