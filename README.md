# NoteFlow

Aplicación móvil multiplataforma para capturar y organizar **notas de texto**, **checklists** e **ideas** en un solo lugar. NoteFlow reduce la fragmentación de la información personal: en lugar de repartir apuntes, tareas y conceptos entre varias apps, ofrece un cuaderno digital ligero con búsqueda instantánea y datos guardados en el dispositivo.

---

## Características principales

- **Notas de texto** — Título y contenido con vista previa en listado y pantalla de detalle.
- **Checklists** — Listas con ítems marcables y progreso visible (completadas / total).
- **Ideas con etiquetas** — Título, tags y color de acento para identificar conceptos rápidamente.
- **Búsqueda en tiempo real** — Filtro por pestaña (título, contenido, ítems o tags).
- **Persistencia local** — Los datos sobreviven al cerrar la app (AsyncStorage + Zustand).
- **Tema claro / oscuro** — Interfaz adaptada al esquema del sistema.
- **Navegación con Expo Router** — Tres tabs (Notas · Checklists · Ideas) y stacks de detalle.

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| [Expo](https://expo.dev/) | Runtime y toolchain |
| [React Native](https://reactnative.dev/) | UI nativa iOS / Android |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático del dominio |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegación file-based |
| [Zustand](https://zustand.docs.pmnd.rs/) | Estado global |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistencia local |
| [React Native Paper](https://callstack.github.io/react-native-paper/) | Sistema de diseño MD3 |
| [FlashList](https://shopify.github.io/flash-list/) | Listas virtualizadas |
| [Zod](https://zod.dev/) | Validación de formularios |

---

## Estructura del proyecto

```
noteflow/
├── app/              # Rutas y pantallas (Expo Router)
├── components/       # UI reutilizable (cards, listas, estados vacíos)
├── store/            # Estado global (notesStore.ts)
├── types/            # Modelos TypeScript (AnyNote, type guards)
├── constants/        # Tema, espaciado, colores de ideas
├── providers/        # AppProviders (Paper + tema del sistema)
├── utils/            # Filtros de búsqueda, formato, helpers
├── validation/       # Esquemas Zod
└── docs/             # Documentación del proyecto
```

| Carpeta | Descripción |
|---------|-------------|
| **`app/`** | Pantallas y layouts: tabs, detalle `[id]`, formulario `nueva-nota`. La lógica de negocio pesada no vive aquí. |
| **`components/`** | Piezas de UI: `items/` (cards), `lists/` (ítems de lista), `ui/` (EmptyState, etc.). |
| **`store/`** | Store Zustand con CRUD, selectores y middleware de persistencia. |
| **`types/`** | Interfaces y uniones discriminadas (`TextNote`, `ChecklistNote`, `IdeaNote`). |
| **`constants/`** | Tokens visuales (`theme.ts`) y paleta de ideas. |
| **`docs/`** | Idea de producto, teoría RN, IA, gestión y planificación. |

---

## Instalación

Requisitos: **Node.js** 18+ y **npm**.

```bash
# Clonar el repositorio y entrar en la carpeta
cd noteflow

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start
```

Otros scripts útiles:

```bash
npm run android   # Abrir en emulador / dispositivo Android
npm run ios       # Abrir en simulador iOS (macOS)
npm run web       # Versión web (opcional)
```

Comprobar tipos:

```bash
npx tsc --noEmit
```

---

## Uso con Expo Go

1. Instala **[Expo Go](https://expo.dev/go)** en tu móvil (iOS o Android).
2. Ejecuta `npx expo start` en el proyecto.
3. Escanea el **código QR** que aparece en la terminal o en el navegador:
   - **Android**: desde Expo Go o la cámara integrada.
   - **iOS**: con la cámara del iPhone (abre en Expo Go).
4. Asegúrate de que el móvil y el PC están en la **misma red Wi‑Fi** (o usa el túnel con `npx expo start --tunnel` si hay restricciones de red).
5. La app cargará NoteFlow; los datos se guardan en el almacenamiento local del dispositivo.

> NoteFlow está pensado para ejecutarse en Expo Go sin módulos nativos personalizados.

---

## Arquitectura

### Expo Router

La navegación sigue la estructura de archivos en `app/`:

- **Stack raíz**: tabs + pantalla `nueva-nota`.
- **Tabs**: Notas, Checklists, Ideas.
- **Stack por tab**: listado (`index`) → detalle (`[id]`).

### Zustand

Un único store (`store/notesStore.ts`) centraliza notas, checklists e ideas. Las pantallas se suscriben con selectores granulares para limitar re-renders.

### Persistencia

El middleware `persist` de Zustand serializa el estado en **AsyncStorage** bajo la clave `noteflow-notes`. Al abrir la app, el store se **rehidrata** antes de mostrar listas (`_hasHydrated`).

### FlashList

Las tres pantallas de listado usan **FlashList** para virtualizar celdas, mantener scroll fluido y reciclar vistas al crecer el número de entradas.

Más detalle en [`docs/react-native-teoria.md`](docs/react-native-teoria.md).

---

## Gestión del proyecto

El desarrollo se organiza con **Kanban en Trello** (columnas: Backlog → Todo → In Progress → Review → Done).

**Tablero:** [NoteFlow en Trello](https://trello.com/invite/b/6a0c1ee99bce9ef3fce77b45/ATTI02c52c350a74df728e27a1e7225875c9550DEEE5/noteflow)

Planificación y tarjetas: [`docs/project-management.md`](docs/project-management.md).

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/idea.md`](docs/idea.md) | Problema, usuario objetivo y alcance v1 |
| [`docs/react-native-teoria.md`](docs/react-native-teoria.md) | Conceptos RN, Metro, Expo, arquitectura |
| [`docs/ai-setup.md`](docs/ai-setup.md) | Cursor, `.cursorrules` y buenas prácticas con IA |
| [`docs/project-management.md`](docs/project-management.md) | Metodología, Trello y subtareas técnicas |

---

## Funcionalidades futuras

Roadmap opcional (fuera del alcance v1):

- Sincronización en la nube
- Autenticación de usuario
- Archivado de entradas
- Notificaciones y recordatorios
- Compartir notas con otras apps

---

## Licencia

Proyecto académico — consultar con el autor del repositorio para condiciones de uso.
