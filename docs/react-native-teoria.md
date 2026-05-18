# React Native — teoría aplicada a NoteFlow

Documento de referencia técnica sobre los conceptos fundamentales de React Native y Expo, con ejemplos y decisiones tomadas en el proyecto **NoteFlow** (app de notas, checklists e ideas).

---

## Tabla de contenidos

1. [React Native frente a apps nativas](#1-react-native-frente-a-apps-nativas)
2. [Metro Bundler](#2-metro-bundler)
3. [Expo Go vs Development Build](#3-expo-go-vs-development-build)
4. [Sistemas de diseño](#4-sistemas-de-diseño)
5. [Navegación](#5-navegación)
6. [Modelado de datos](#6-modelado-de-datos)
7. [Gestión de estado](#7-gestión-de-estado)
8. [Persistencia](#8-persistencia)
9. [Rendimiento en listas](#9-rendimiento-en-listas)
10. [Tema oscuro y claro](#10-tema-oscuro-y-claro)

---

## 1. React Native frente a apps nativas

### 1.1 Enfoque de desarrollo

| Aspecto | App nativa (Swift/Kotlin) | React Native |
|--------|---------------------------|--------------|
| Lenguaje UI | APIs nativas por plataforma | JavaScript/TypeScript + componentes RN |
| Código compartido | Bajo (salvo capas compartidas) | Alto entre iOS y Android |
| Curva de aprendizaje | Dos ecosistemas | Un ecosistema React + APIs RN |
| Acceso a APIs | Directo | A través de módulos nativos |

En **NoteFlow**, toda la interfaz se escribe una vez en TypeScript y se ejecuta en ambas plataformas mediante Expo.

### 1.2 El bridge (puente JS ↔ nativo)

En el modelo clásico de React Native, el **bridge** es el canal de comunicación asíncrono entre el código JavaScript y los módulos nativos (iOS/Android):

```
┌─────────────────┐         bridge          ┌──────────────────┐
│   Hilo JS       │ ◄──────────────────────►│  Hilo UI nativo  │
│  (React, lógica)│   mensajes serializados │  (UIKit/Android) │
└─────────────────┘                         └──────────────────┘
```

- El JS envía instrucciones del tipo «renderiza un `View` aquí» o «lee AsyncStorage».
- El lado nativo ejecuta layout, gestos y dibujado en pantalla.
- Los datos cruzan el bridge en formato serializable (JSON), lo que introduce latencia si hay demasiados mensajes por frame.

Con la **Nueva Arquitectura** (Fabric + TurboModules), parte de esta comunicación se vuelve más directa y síncrona donde el runtime lo permite, pero el concepto de separación entre lógica JS y render nativo sigue siendo central.

### 1.3 Hilo JavaScript

El **hilo JS** ejecuta:

- El árbol de componentes React.
- Hooks, efectos y lógica de negocio (p. ej. filtros de búsqueda en NoteFlow).
- El store de Zustand y la serialización hacia AsyncStorage.

Si este hilo está ocupado (cálculos pesados, re-renders masivos sin memoización), la interfaz puede sentirse entrecortada aunque el hilo nativo esté libre.

### 1.4 Hilo UI nativo

El **hilo UI nativo** se encarga de:

- Medir y posicionar vistas.
- Procesar toques y scroll.
- Componer frames a 60/120 fps.

Componentes como `ScrollView` sin virtualización o listas enormes sin reciclaje saturan este hilo. Por eso NoteFlow usa **FlashList** en las pantallas de listado.

### 1.5 Rendimiento: implicaciones prácticas

| Buena práctica | Motivo |
|----------------|--------|
| Virtualizar listas largas | Solo se montan celdas visibles |
| Memoizar filtros (`useMemo`) | Evita trabajo repetido en el hilo JS |
| Selectores finos en Zustand | Menos re-renders innecesarios |
| Evitar animaciones nativas no soportadas en Expo Go | Menos errores de TurboModule |

NoteFlow prioriza listas virtualizadas, estado global ligero y dependencias compatibles con Expo Go (sin `react-native-reanimated` en el bundle actual).

---

## 2. Metro Bundler

**Metro** es el bundler por defecto de React Native y Expo. Transforma el grafo de módulos del proyecto en un bundle ejecutable para dispositivo o simulador.

### 2.1 Bundling

Proceso resumido:

1. **Entrada**: `expo-router/entry` (definido en `package.json` como `main`).
2. **Resolución**: Metro recorre `import`/`require` y construye el grafo de dependencias.
3. **Transformación**: Babel convierte TypeScript/JSX a JavaScript compatible.
4. **Empaquetado**: Se genera un único (o pocos) archivos para Android/iOS.

```json
{
  "main": "expo-router/entry"
}
```

En desarrollo, el bundle se sirve desde el servidor de Metro; en producción, se empaqueta dentro del binario (Development Build o store).

### 2.2 Hot reload y Fast Refresh

| Mecanismo | Comportamiento |
|-----------|----------------|
| **Fast Refresh** | Recarga componentes tocados preservando estado local cuando es posible |
| **Full reload** | Reinicia el bundle completo; pierde estado en memoria |

Al guardar un archivo de NoteFlow (p. ej. una card o el store), Metro detecta el cambio y actualiza la app sin reinstalar. El estado persistido en AsyncStorage sobrevive; el estado solo en memoria puede perderse según el tipo de cambio.

### 2.3 Resolución de módulos

Metro resuelve rutas siguiendo reglas similares a Node, con extensiones habituales en RN:

- `.ios.ts`, `.android.ts` (archivos específicos por plataforma).
- `index.ts` dentro de carpetas.
- Alias configurables en `metro.config.js` (Expo los genera por defecto).

En NoteFlow, las rutas de archivos coinciden con las rutas de **Expo Router** (`app/(tabs)/notas/index.tsx` → `/notas`).

### 2.4 Configuración Babel en NoteFlow

```js
module.exports = function(api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
  };
};
```

Sin plugins adicionales: configuración mínima y estable para Expo Go.

---

## 3. Expo Go vs Development Build

### 3.1 Expo Go

**Expo Go** es una app preinstalable (App Store / Play Store) que carga tu proyecto en tiempo de ejecución escaneando un QR.

**Ventajas:**

- Arranque inmediato sin compilar Xcode/Android Studio.
- Ideal para prototipos y asignaturas (DAM).
- SDK y módulos nativos de Expo ya incluidos.

**Limitaciones:**

- Solo incluye un subconjunto fijo de módulos nativos.
- No puedes añadir librerías con código nativo arbitrario sin salir de Go.
- Errores de **TurboModule** aparecen si el proyecto importa nativos no empaquetados en Go (p. ej. ciertas versiones de Reanimated sin build propio).

NoteFlow está pensado para ejecutarse en **Expo Go**: dependencias alineadas con el SDK 54 y sin módulos nativos custom.

### 3.2 Development Build

Un **Development Build** es tu propia app (`.apk` / `.ipa`) con el cliente de desarrollo de Expo y **tus** módulos nativos enlazados.

**Ventajas:**

- Cualquier módulo nativo compatible con el SDK.
- Comportamiento más cercano a producción.
- Depuración nativa completa.

**Limitaciones:**

- Requiere compilar (local o en la nube).
- Más lento de iterar que Expo Go para cambios solo-JS.

### 3.3 Módulos nativos

Un **módulo nativo** expone APIs de plataforma a JavaScript (cámara, sensores, almacenamiento optimizado, etc.).

| En Expo Go | En Development Build |
|------------|----------------------|
| Módulos del SDK Expo preinstalados | SDK Expo + módulos que declares en `app.json` / plugins |
| Sin código nativo propio | Con código nativo propio (config plugins) |

NoteFlow usa módulos soportados en Go: `@react-native-async-storage/async-storage`, `expo-router`, `expo-haptics`, etc.

### 3.4 EAS Build

**EAS (Expo Application Services) Build** compila en la nube:

- **Development**: cliente de desarrollo personalizado.
- **Preview**: builds internas para testers.
- **Production**: envío a tiendas.

Flujo típico cuando NoteFlow deje de bastar con Expo Go:

```bash
npx eas build --profile development --platform android
```

No es necesario para el desarrollo diario del proyecto académico, pero es el camino hacia distribución real.

---

## 4. Sistemas de diseño

Un **sistema de diseño** unifica tipografía, color, espaciado y componentes para mantener coherencia visual y acelerar el desarrollo.

### 4.1 Gluestack UI vs React Native Paper

| Criterio | Gluestack UI | React Native Paper |
|----------|--------------|-------------------|
| Base visual | Utility-first, tokens propios, estilo moderno | Material Design 3 (Google) |
| Componentes | Primitivos + composición | Botones, inputs, FAB, chips, etc. listos |
| Tematización | Tokens CSS-like / config | `PaperProvider` + tema MD3 |
| Curva | Más montaje manual | Convenciones MD3 claras |
| Ecosistema | Relacionado con NativeWind | Maduro, amplia documentación |

### 4.2 Elección en NoteFlow: React Native Paper

NoteFlow adopta **React Native Paper** por:

1. **Productividad**: `TextInput`, `FAB`, `Chip`, `Surface` y `Card` cubren formularios (`nueva-nota.tsx`) y listados sin reinventar estilos.
2. **Tema claro/oscuro**: integración directa con `MD3LightTheme` / `MD3DarkTheme` en `constants/theme.ts`.
3. **Accesibilidad y patrones MD3**: estados, elevaciones y contraste alineados con guías de Material.
4. **Alcance del proyecto**: app de notas centrada en contenido, no en un design system custom desde cero.

```tsx
// providers/AppProviders.tsx
<PaperProvider theme={paperTheme}>
  {children}
</PaperProvider>
```

Los tokens propios (`spacing`, `colorsLight`, `colorsDark`) complementan Paper donde hace falta consistencia fuera de los componentes MD3.

---

## 5. Navegación

NoteFlow usa **Expo Router** (file-based routing sobre React Navigation).

### 5.1 Tabs

Las **tabs** definen las secciones principales persistentes en la barra inferior:

```
app/(tabs)/
├── notas/       → tab "Notas"
├── checklists/  → tab "Checklists"
└── ideas/       → tab "Ideas"
```

```tsx
// app/(tabs)/_layout.tsx
<Tabs screenOptions={{ headerShown: false, ... }}>
  <Tabs.Screen name="notas" options={{ title: 'Notas', ... }} />
  <Tabs.Screen name="checklists" ... />
  <Tabs.Screen name="ideas" ... />
</Tabs>
```

Cada tab mantiene su propio historial de navegación interno.

### 5.2 Stack

Un **Stack** apila pantallas con cabecera y botón atrás. En NoteFlow hay dos niveles:

**Stack raíz** (`app/_layout.tsx`):

- `(tabs)` — contenedor de tabs sin header.
- `nueva-nota` — formulario de creación.

**Stack por tab** (p. ej. `app/(tabs)/notas/_layout.tsx`):

- `index` — listado con búsqueda.
- `[id]` — detalle/edición de una nota.

```
Root Stack
├── (tabs) ──► Tabs
│              ├── notas Stack → index | [id]
│              ├── checklists Stack → index | [id]
│              └── ideas Stack → index | [id]
└── nueva-nota
```

### 5.3 Modales

En React Navigation, un **modal** es una pantalla presentada encima del contexto actual (`presentation: 'modal'`), útil para flujos cortos sin perder el contexto de la lista.

NoteFlow usa un patrón equivalente con **push en el Stack raíz**:

```tsx
router.push('/nueva-nota');
```

La pantalla `nueva-nota` cubre las tabs con header propio; al guardar o cancelar, `router.back()` restaura la tab activa. Es semánticamente un flujo modal sin configurar `presentation` explícita.

### 5.4 Justificación de la arquitectura

| Decisión | Razón |
|----------|-------|
| Tabs por tipo de contenido | Separación mental clara: notas, tareas, ideas |
| Stack anidado por tab | Listado → detalle sin mezclar rutas entre tabs |
| `nueva-nota` en root Stack | Un solo formulario multi-tipo (`SegmentedButtons`) reutilizable desde cualquier FAB |
| Rutas dinámicas `[id]` | URLs estables y deep linking preparado |

Esta estructura escala si se añaden ajustes globales (`/settings`) como otra pantalla del Stack raíz.

---

## 6. Modelado de datos

El dominio de NoteFlow se modela en TypeScript en `types/index.ts`, separado de la UI y del store.

### 6.1 Interfaces TypeScript

Las **interfaces** describen la forma de los objetos de dominio:

```ts
export interface NoteBase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextNote extends NoteBase {
  type: 'note';
  content: string;
}

export interface ChecklistNote extends NoteBase {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface IdeaNote extends NoteBase {
  type: 'idea';
  content: string;
  tags: string[];
  color: IdeaColor;
}
```

Ventajas: autocompletado, errores en compilación y documentación viva del modelo.

### 6.2 Union types (tipos unión)

Un mismo concepto («una entrada del cuaderno») puede ser de varios tipos. Se expresa con **unión discriminada** usando el campo `type`:

```ts
export type AnyNote = TextNote | ChecklistNote | IdeaNote;
```

El discriminante `type: 'note' | 'checklist' | 'idea'` permite que TypeScript reduzca el tipo en ramas `switch` o `if`.

Los DTOs de creación también son uniones:

```ts
export type CreateAnyNoteInput =
  | { type: 'note'; title: string; content: string }
  | { type: 'checklist'; title: string; items?: ChecklistItem[] }
  | { type: 'idea'; title: string; content?: string; tags: string[]; color: IdeaColor };
```

### 6.3 Type guards

Los **type guards** son funciones que afirnan el subtipo en tiempo de ejecución:

```ts
export function isTextNote(note: AnyNote): note is TextNote {
  return note.type === 'note';
}

export function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return note.type === 'checklist';
}

export function isIdeaNote(note: AnyNote): note is IdeaNote {
  return note.type === 'idea';
}
```

Uso en componentes:

```tsx
if (isTextNote(item)) {
  return <NoteCard note={item} onPress={...} />;
}
```

Tras el guard, `item` está tipado como `TextNote` sin casts inseguros.

### 6.4 El tipo `AnyNote`

`AnyNote` es el contrato común para:

- Listados que mezclan renderizado según tipo (`NoteListItem`).
- `getNoteById` en el store.
- Migraciones de datos persistidos legacy.

No confundir con `any` de TypeScript: es una **unión bien definida**, no desactivación del tipado.

---

## 7. Gestión de estado

### 7.1 `useState`

**`useState`** gestiona estado **local** del componente:

- Texto del buscador en cada tab (`searchQuery`).
- Campos de formulario en `nueva-nota.tsx` antes de persistir.

```tsx
const [searchQuery, setSearchQuery] = useState('');
```

Es la opción correcta cuando el estado no debe compartirse ni sobrevivir a navegaciones largas.

### 7.2 Context API

**React Context** propaga valores sin prop drilling (tema, usuario, idioma).

En NoteFlow, el tema se delega a **PaperProvider**, que internamente usa contexto para `useTheme()`. No hay un `NotesContext` porque el volumen de datos y actualizaciones lo haría poco eficiente.

| Context | Uso típico en NoteFlow |
|---------|----------------------|
| PaperProvider | Tema MD3, colores de componentes |
| (no usado para notas) | — |

### 7.3 Zustand

**Zustand** es un store global minimalista:

```ts
export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      checklists: [],
      ideas: [],
      getNotesByType: (type) => { ... },
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      // ...
    }),
    { name: NOTES_STORAGE_KEY, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
```

Características:

- API basada en hooks (`useNotesStore(selector)`).
- Suscripciones granulares por selector.
- Middleware `persist` integrado.

### 7.4 Justificación de Zustand en NoteFlow

| Alternativa | Por qué no es la principal |
|-------------|----------------------------|
| Solo `useState` + props | Las tres tabs y `nueva-nota` necesitan los mismos datos |
| Context + `useReducer` | Re-renders amplios al actualizar listas grandes |
| Redux Toolkit | Boilerplate excesivo para el tamaño del proyecto |

Zustand ofrece **estado global tipado**, **poca ceremonia** y **persistencia** con pocas líneas, ideal para un MVP académico que debe seguir siendo legible.

Ejemplo de selector eficiente:

```tsx
const allNotes = useNotesStore((state) => state.getNotesByType('note'));
```

---

## 8. Persistencia

### 8.1 AsyncStorage

**AsyncStorage** es almacenamiento clave-valor asíncrono en el dispositivo:

- Persiste entre sesiones de la app.
- No sustituye una base de datos relacional (sin consultas complejas).
- Adecuado para JSON de tamaño moderado (listas de notas de un usuario).

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### 8.2 Middleware `persist` de Zustand

El middleware **`persist`** sincroniza el store con almacenamiento:

```ts
persist(
  (set, get) => ({ /* estado y acciones */ }),
  {
    name: NOTES_STORAGE_KEY,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      notes: state.notes,
      checklists: state.checklists,
      ideas: state.ideas,
    }),
    version: 2,
    migrate: (persistedState, version) => migratePersistedState(...),
  },
);
```

| Opción | Función en NoteFlow |
|--------|---------------------|
| `name` | Clave `'noteflow-notes'` en AsyncStorage |
| `partialize` | Solo persiste datos de dominio, no flags volátiles |
| `version` + `migrate` | Compatibilidad con formatos antiguos de datos |

### 8.3 Rehidratación del store

Al abrir la app, `persist` **lee** AsyncStorage y **rehidrata** el store antes de que la UI confíe en los datos.

NoteFlow expone `_hasHydrated` para evitar pantallas vacías falsas:

```ts
onRehydrateStorage: () => (state, error) => {
  if (error) {
    console.warn('[notesStore] Error al rehidratar:', error);
  }
  state?.setHasHydrated(true);
},
```

```tsx
const hasHydrated = useNotesStore((state) => state._hasHydrated);

{!hasHydrated ? (
  <ActivityIndicator />
) : (
  <FlashList data={filteredNotes} ... />
)}
```

Flujo temporal:

```
App inicia → store vacío, _hasHydrated: false
     ↓
AsyncStorage leído → migrate si hace falta → estado restaurado
     ↓
setHasHydrated(true) → listas muestran datos reales
```

---

## 9. Rendimiento en listas

### 9.1 FlatList vs FlashList

| | FlatList (RN core) | FlashList (Shopify) |
|---|-------------------|---------------------|
| Virtualización | Sí | Sí, optimizada |
| Reciclaje de vistas | Básico | Agresivo, menos mounts |
| Tamaño estimado | `getItemLayout` manual | `estimatedItemSize` (v1) / auto (v2) |
| Dependencia | Incluida en RN | Paquete `@shopify/flash-list` |

NoteFlow usa **FlashList** en `notas/index.tsx`, `checklists/index.tsx` e `ideas/index.tsx`.

### 9.2 Reciclaje de componentes

En listas largas, crear una vista nativa por ítem es costoso. El **reciclaje** reutiliza celdas que salen de pantalla:

```
Pantalla visible: [ celda 10 ][ celda 11 ][ celda 12 ]
                      ↑ datos del ítem 50 al reciclar
```

`renderItem` debe ser **puro** respecto al ítem: recibe `item` por props y no guarda estado del ítem en el componente de celda.

NoteFlow delega el render en `NoteListItem` + cards (`NoteCard`, `ChecklistCard`, `IdeaCard`).

### 9.3 `estimatedItemSize`

FlashList usa una altura estimada para calcular el scroll antes de medir cada celda. En **FlashList v2**, la medición automática reduce la necesidad del prop, pero NoteFlow mantiene valores documentados por tipo de card:

| Pantalla | `estimatedItemSize` |
|----------|---------------------|
| Notas | 120 |
| Checklists | 160 |
| Ideas | 140 |

```tsx
<FlashList<TextNote>
  {...withEstimatedItemSize<TextNote>(120)}
  data={filteredNotes}
  renderItem={({ item }) => <NoteListItem item={item} onPress={...} />}
  keyExtractor={(item) => item.id}
/>
```

Helper en `components/lists/flashListEstimatedSize.ts` para compatibilidad de tipos con FlashList v2.

### 9.4 Otras optimizaciones en NoteFlow

- **`useMemo`** en filtros de búsqueda (`utils/noteFilters.ts`).
- **`keyExtractor` estable** por `id`.
- **Evitar `ScrollView` + `.map()`** para listas que crecen con el usuario.

---

## 10. Tema oscuro y claro

### 10.1 `useColorScheme`

React Native expone el esquema del sistema:

```tsx
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme(); // 'light' | 'dark' | null
```

NoteFlow lo usa en `AppProviders` para elegir el tema de Paper y el estilo de la status bar:

```tsx
const colorScheme = useColorScheme();
const paperTheme = getPaperTheme(colorScheme);

return (
  <PaperProvider theme={paperTheme}>
    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    {children}
  </PaperProvider>
);
```

La app **sigue la preferencia del sistema**; no hay toggle manual en ajustes (extensión posible).

### 10.2 Tokens visuales

Los **tokens** centralizan decisiones de diseño en `constants/theme.ts`:

**Espaciado**

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
```

**Paleta semántica**

```ts
export const colorsLight: ThemeColors = {
  primary: '#2563eb',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  // ...
};

export const colorsDark: ThemeColors = {
  primary: '#60a5fa',
  background: '#0f172a',
  surface: '#1e293b',
  // ...
};
```

**Integración con Paper**

```ts
export function getPaperTheme(scheme: ColorScheme | null | undefined): MD3Theme {
  const isDark = scheme === 'dark';
  const palette = getThemeColors(scheme);
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      // ...
    },
  };
}
```

Los componentes consumen tokens vía `useTheme()` de Paper (`theme.colors.background`, `theme.colors.primary`) y `spacing` en `StyleSheet`, garantizando coherencia entre tabs, formularios y cards en ambos modos.

---

## Resumen de stack en NoteFlow

| Capa | Tecnología |
|------|------------|
| Runtime | Expo SDK 54 + React Native 0.81 |
| Bundler | Metro (`babel-preset-expo`) |
| Navegación | Expo Router (Tabs + Stack) |
| UI | React Native Paper (MD3) |
| Estado | Zustand + persist |
| Persistencia | AsyncStorage |
| Listas | FlashList |
| Tipado | TypeScript estricto (`AnyNote`, type guards) |
| Desarrollo | Expo Go |

---

## Referencias

- [Documentación React Native](https://reactnative.dev/docs/getting-started)
- [Documentación Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [FlashList](https://shopify.github.io/flash-list/)
- [Metro](https://metrobundler.dev/docs/getting-started)
