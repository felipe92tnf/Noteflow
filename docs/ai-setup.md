# Configuración de IA en NoteFlow

Guía para desarrollar NoteFlow con asistentes de código de forma coherente, segura y alineada con la arquitectura del proyecto.

---

## Tabla de contenidos

1. [Cursor como herramienta principal](#1-cursor-como-herramienta-principal)
2. [Archivo `.cursorrules`](#2-archivo-cursorrules)
3. [Por qué estas reglas ayudan](#3-por-qué-estas-reglas-ayudan)
4. [Alternativas: Gemini y Claude](#4-alternativas-gemini-y-claude)
5. [Buenas prácticas al usar IA](#5-buenas-prácticas-al-usar-ia)
6. [Referencias del proyecto](#6-referencias-del-proyecto)

---

## 1. Cursor como herramienta principal

**Cursor** es el IDE recomendado para NoteFlow. Integra un editor basado en VS Code con agentes de IA que leen el repositorio, ejecutan comandos y aplican cambios en archivos.

### Ventajas en este proyecto

| Capacidad | Uso en NoteFlow |
|-----------|-----------------|
| **Contexto del repo** | La IA indexa `app/`, `store/`, `types/` y `docs/` |
| **`.cursorrules`** | Reglas persistentes en cada conversación |
| **Agent / Chat** | Implementar pantallas, store o documentación |
| **Terminal integrada** | `npx expo start`, `tsc --noEmit`, tests manuales |
| **Diffs revisables** | Aceptar o rechazar cambios por archivo |

### Flujo de trabajo recomendado

1. Abrir la carpeta raíz del monorepo (`noteflow/`).
2. Leer `docs/idea.md` y `docs/react-native-teoria.md` si la tarea es nueva.
3. Formular peticiones concretas («añade búsqueda en la tab Ideas», no «mejora la app»).
4. Revisar el diff antes de aceptar.
5. Probar en **Expo Go** y commitear por unidades lógicas.

---

## 2. Archivo `.cursorrules`

En la raíz del repositorio existe **`.cursorrules`**: instrucciones que Cursor inyecta automáticamente al inicio de cada sesión con el agente. Actúa como *system prompt* del proyecto.

Contenido actual (resumen interpretado):

### 2.1 Contexto del proyecto

```text
# NoteFlow

App de notas con Expo Router y TypeScript.
```

Define de un vistazo **qué es** la aplicación: cuaderno multi-tipo (notas, checklists, ideas), stack Expo + TypeScript, sin ambigüedad con proyectos web o backend.

### 2.2 Stack técnico (implícito y complementario)

El archivo `.cursorrules` nombra **Expo Router** y **TypeScript**. El stack completo del repo —que la IA debe respetar aunque no esté línea por línea en las reglas— es:

| Capa | Tecnología |
|------|------------|
| Framework | Expo SDK 54, React Native 0.81 |
| Navegación | Expo Router (file-based) |
| UI | React Native Paper (MD3) |
| Estado global | Zustand + middleware `persist` |
| Persistencia | AsyncStorage |
| Listas | `@shopify/flash-list` |
| Validación | Zod |
| Lenguaje | TypeScript estricto |

> **Recomendación**: si amplías `.cursorrules`, añade explícitamente Paper, Zustand y FlashList para reducir sugerencias incorrectas del modelo.

### 2.3 Estructura de carpetas

```text
- app/           — rutas (Expo Router). No mover lógica de negocio pesada aquí.
- components/items/ — componentes de listado/detalle de ítems.
- constants/theme.ts — colores, espaciado y tema.
- store/notesStore.ts — estado global de notas.
- types/index.ts — tipos compartidos (Note, ChecklistItem, etc.).
- docs/          — documentación del proyecto.
```

Estructura ampliada en la práctica:

```
noteflow/
├── app/                 # Pantallas y layouts (Expo Router)
│   ├── _layout.tsx      # Stack raíz
│   ├── (tabs)/          # Tabs: notas | checklists | ideas
│   └── nueva-nota.tsx   # Formulario de creación
├── components/
│   ├── items/           # Cards (NoteCard, ChecklistCard, IdeaCard)
│   ├── lists/           # NoteListItem, constantes de listado
│   └── ui/              # EmptyState, placeholders
├── constants/           # theme.ts, ideaColors.ts
├── providers/           # AppProviders (Paper + tema)
├── store/               # notesStore.ts
├── types/               # AnyNote, type guards
├── utils/               # filtros, formato
├── validation/          # esquemas Zod
└── docs/                # idea, teoría, IA, gestión
```

**Regla clave**: `app/` orquesta rutas y UI de pantalla; la lógica de dominio vive en `store/`, `types/` y `utils/`.

### 2.4 Estilo de código

Las convenciones declaradas en `.cursorrules`:

- **TypeScript estricto** — sin `any` innecesarios; tipos en `types/index.ts`.
- **Pantallas en `app/`** — placeholders o UI acotada; lógica pesada fuera de rutas.
- **Imports coherentes** — rutas relativas estables respecto al módulo que importa.
- **Español** — textos de UI y documentación interna cuando aplique.

Patrones alineados con el código existente:

- Componentes funcionales y hooks.
- Selectores granulares de Zustand: `useNotesStore((s) => s.notes)`.
- Estilos con `StyleSheet` y tokens de `constants/theme.ts` (`spacing`).
- Paper para inputs, FAB, chips y superficies.

### 2.5 Restricciones de arquitectura

```text
- No añadir dependencias sin necesidad.
- Implementar lógica de store, persistencia y CRUD solo cuando se solicite explícitamente.
```

| Restricción | Intención |
|-------------|-----------|
| Sin dependencias superfluas | Mantener compatibilidad con **Expo Go** |
| CRUD bajo demanda | Evitar refactors masivos no pedidos |
| Lógica fuera de `app/` | Separación rutas / dominio |
| Sin estado global en Context/Redux | El store oficial es **Zustand** (`store/notesStore.ts`) |
| Sin HTML/CSS web | Solo primitivas RN (`View`, `Text`, Paper) |
| Sin animaciones nativas problemáticas | p. ej. evitar Reanimated si rompe Expo Go |

---

## 3. Por qué estas reglas ayudan

Las reglas (`.cursorrules` + stack documentado) acotan el espacio de soluciones del modelo y reducen código incompatible.

### 3.1 Evitan código web / HTML

Sin reglas, los modelos suelen proponer `<motion.div>`, Tailwind o `localStorage` del navegador. NoteFlow es **React Native**: la IA debe usar `View`, `Pressable`, `StyleSheet` y APIs móviles.

**Efecto**: menos tiempo depurando componentes que no existen en RN.

### 3.2 Mantienen TypeScript estricto

El dominio usa uniones discriminadas (`AnyNote`, `type: 'note' | 'checklist' | 'idea'`) y **type guards** (`isTextNote`, etc.). TypeScript estricto detecta ramas imposibles antes de ejecutar.

**Efecto**: menos errores en `renderItem`, store y formularios.

### 3.3 Respetan Expo Router

La navegación es **por archivos** (`app/(tabs)/notas/[id].tsx`), no por configuración manual de React Navigation en un `App.tsx` clásico.

**Efecto**: rutas y deep links coherentes; no se mezclan `navigation.navigate` inventados con rutas inexistentes.

### 3.4 Evitan Redux / Context para estado global

NoteFlow centraliza datos en **Zustand** con persistencia. Context para todo el árbol o Redux añaden boilerplate y re-renders innecesarios en un MVP.

**Efecto**: cambios de notas/checklists/ideas en un solo sitio (`notesStore.ts`).

### 3.5 Obligan a usar Zustand, Paper y FlashList

| Herramienta | Rol | Si la IA usa otra cosa |
|-------------|-----|-------------------------|
| **Zustand** | Estado + AsyncStorage | Duplicación con Context o estado solo local |
| **Paper** | MD3, tema, inputs | UI inconsistente o estilos desde cero |
| **FlashList** | Listas virtualizadas | ScrollView + `.map()` con mal rendimiento |

**Efecto**: coherencia visual y de rendimiento con lo ya implementado en las tabs.

---

## 4. Alternativas: Gemini y Claude

Si no usas Cursor, puedes replicar el mismo contexto en **Google Gemini** (Gemini Code Assist / chat con instrucciones) o **Anthropic Claude** (Projects / system prompt).

### 4.1 Qué prompt persistente usar

Equivalente a `.cursorrules`: un bloque fijo al inicio de cada hilo o en «instrucciones del proyecto».

**Plantilla recomendada (copiar y adaptar):**

```markdown
Eres un asistente de desarrollo para NoteFlow, app React Native con Expo SDK 54.

Stack obligatorio:
- Expo Router (file-based en app/)
- TypeScript estricto
- React Native Paper (UI)
- Zustand + persist + AsyncStorage (estado)
- FlashList para listas
- Zod para validación de formularios

No uses: HTML, CSS web, Redux, Context API para estado global,
react-native-reanimated (incompatible con Expo Go en este proyecto).

Estructura:
- app/ → solo rutas y UI de pantalla
- store/notesStore.ts → estado global
- types/index.ts → AnyNote, type guards
- components/items/ → cards
- constants/theme.ts → tokens

Textos de UI en español. Cambios pequeños y revisables.
Consulta docs/idea.md y docs/react-native-teoria.md antes de features nuevas.
```

### 4.2 Qué contexto técnico deben recibir

Adjunta o pega en cada sesión relevante:

| Documento / archivo | Para qué |
|-------------------|----------|
| `docs/idea.md` | Alcance de producto y v1 |
| `docs/react-native-teoria.md` | Decisiones de arquitectura |
| `types/index.ts` | Modelo de datos |
| `store/notesStore.ts` | API del store |
| `app/(tabs)/_layout.tsx` | Navegación por tabs |
| `package.json` | Dependencias permitidas |
| Diff o archivo concreto | Tarea puntual («modifica solo index.tsx de ideas») |

En **Claude Projects**, sube `docs/` y los archivos clave como conocimiento permanente. En **Gemini**, usa un Gem personalizado con las instrucciones anteriores.

---

## 5. Buenas prácticas al usar IA

### 5.1 Pedir cambios pequeños

| ❌ Evitar | ✅ Preferir |
|----------|------------|
| «Rehaz toda la app» | «Añade búsqueda por tags en ideas/index.tsx» |
| «Optimiza todo» | «Memoiza el filtro con useMemo en notas» |
| «Añade 5 librerías» | «Usa solo FlashList ya instalado» |

Peticiones acotadas producen diffs legibles y fáciles de revertir.

### 5.2 Revisar el código generado

Checklist mínimo antes de aceptar:

- [ ] ¿Imports correctos y sin dependencias nuevas no aprobadas?
- [ ] ¿Tipos alineados con `types/index.ts`?
- [ ] ¿El store solo se toca si la tarea lo pide?
- [ ] ¿UI con Paper, no con `<div>` ni estilos web?
- [ ] ¿Rutas Expo Router válidas (`router.push('/nueva-nota')`)?

La IA puede inventar APIs (`useNotesStore.deleteAll`) que no existen: contrastar siempre con `notesStore.ts`.

### 5.3 Probar en Expo Go

Tras cada cambio relevante:

```bash
npx expo start -c
```

Comprobar:

- Arranque sin errores de TurboModule / nativos.
- Tabs, FAB, búsqueda y persistencia tras recargar la app.
- Tema claro y oscuro según el sistema.

Si algo falla, acotar el error en el siguiente prompt («falla al rehidratar el store, revisa onRehydrateStorage»).

### 5.4 Hacer commits frecuentes

| Práctica | Beneficio |
|----------|-----------|
| Un commit por feature o fix | Historial legible para corrección |
| Mensaje claro («feat: búsqueda en tab notas») | Trazabilidad en equipo / entrega DAM |
| No commitear `.env` ni secretos | Seguridad |
| Commit antes de un prompt grande de IA | Punto de rollback (`git revert`) |

La IA no sustituye el control de versiones: es un acelerador bajo supervisión humana.

### 5.5 Otros consejos

- Citar archivos con `@app/(tabs)/notas/index.tsx` en Cursor para anclar contexto.
- Pedir «no modifiques el store» cuando solo toque UI.
- Ejecutar `npx tsc --noEmit` tras cambios de tipos.
- Actualizar `docs/` si la arquitectura cambia de verdad.

---

## 6. Referencias del proyecto

| Recurso | Ubicación |
|---------|-----------|
| Reglas del agente | [`.cursorrules`](../.cursorrules) |
| Idea de producto | [`docs/idea.md`](./idea.md) |
| Teoría RN / stack | [`docs/react-native-teoria.md`](./react-native-teoria.md) |
| Gestión y carpetas | [`docs/project-management.md`](./project-management.md) |

---

## Resumen

| Elemento | Función |
|----------|---------|
| **Cursor** | IDE + IA con contexto del repo |
| **`.cursorrules`** | Prompt persistente: estructura, TS, alcance |
| **Stack fijo** | Expo Router, Paper, Zustand, FlashList |
| **Gemini / Claude** | Misma plantilla de instrucciones + docs adjuntos |
| **Buenas prácticas** | Cambios pequeños, revisión, Expo Go, commits |

La IA acelera NoteFlow; las reglas y la revisión humana garantizan que el resultado siga siendo una app móvil mantenible y entregable.
