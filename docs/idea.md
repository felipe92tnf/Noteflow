# NoteFlow — Idea de producto

**NoteFlow** es una aplicación móvil multiplataforma (iOS y Android) para capturar, organizar y recuperar información personal de forma rápida. Combina en un solo lugar notas de texto, listas de tareas e ideas creativas, sin depender de servicios en la nube en su primera versión.

---

## 1. Problema que resuelve

Hoy la información personal está fragmentada: un recordatorio en la app de notas del sistema, una lista de la compra en otra app, una idea suelta en un mensaje o en papel. Esa dispersión genera fricción:

- **Pérdida de contexto**: cuesta encontrar algo escrito hace días si no se recuerda dónde se guardó.
- **Herramientas inadecuadas**: usar solo texto para tareas o solo listas para ideas limita la expresión.
- **Fricción al capturar**: abrir varias apps o buscar la carpeta correcta frena el momento en que surge el pensamiento.

NoteFlow unifica tres formatos naturales de captura —**nota**, **checklist** e **idea**— en una experiencia coherente, con búsqueda instantánea y datos guardados en el dispositivo. El objetivo no es competir con suites empresariales, sino ofrecer un **cuaderno digital ligero** que esté siempre disponible y responda al ritmo del día a día.

---

## 2. Usuario objetivo

### Perfil principal

Personas que necesitan **organizar su vida personal o académica** sin complejidad:

| Segmento | Necesidad |
|----------|-----------|
| **Estudiantes (DAM, FP, universidad)** | Apuntes rápidos, listas de entregas, ideas de proyectos |
| **Profesionales con agenda cargada** | Tareas del día, notas de reuniones, ideas de mejora |
| **Usuarios generales organizados** | Listas de compra, recordatorios informales, reflexiones |

### Características del usuario

- Usa el móvil como herramienta principal de captura.
- Valora la **simplicidad** por encima de funciones avanzadas (colaboración, IA, etc.).
- Prefiere que sus datos **permanezcan en el dispositivo** o, al menos, que la app funcione sin cuenta obligatoria.
- Está familiarizado con interfaces tipo Material Design (tabs, FAB, búsqueda).

NoteFlow no está pensada inicialmente para equipos ni para gestión documental corporativa.

---

## 3. Uso en el día a día

Un día típico con NoteFlow podría verse así:

**Mañana**

1. Abre la pestaña **Checklists** y revisa las tareas del día (marcar ítems completados).
2. Desde el FAB (+), añade una tarea nueva si surge algo imprevisto.

**Durante el día**

3. En **Notas**, escribe un apunte de clase o un resumen de reunión.
4. Usa el **buscador** de la pestaña activa para localizar una nota por palabra clave.
5. En **Ideas**, guarda un concepto para un proyecto con **etiquetas** (`#app`, `#examen`) y color para distinguirlo visualmente.

**Noche**

6. Repasa checklists pendientes y marca lo completado.
7. La app **recuerda todo al día siguiente** gracias a la persistencia local; no hace falta volver a crear el contenido.

El flujo se apoya en **tres pestañas** (Notas · Checklists · Ideas) y un único botón de creación que adapta el formulario al tipo de contenido. La navegación es predecible: lista → detalle → volver atrás.

---

## 4. Funcionalidades principales (v1)

La primera versión de NoteFlow entrega un producto usable de extremo a extremo en el dispositivo, sin backend.

### 4.1 Notas de texto

- Crear, editar y eliminar notas con **título** y **cuerpo**.
- Vista de listado con vista previa del contenido y fecha de última modificación.
- Pantalla de detalle para lectura y edición.

### 4.2 Checklists

- Listas con **ítems** marcables (completado / pendiente).
- Indicador de progreso en la tarjeta (p. ej. «2 de 5 completadas»).
- Alternar estado de cada ítem desde el detalle.

### 4.3 Ideas con etiquetas

- Notas tipo **idea** con título, etiquetas (`tags`) y **color** de acento (paleta predefinida).
- Etiquetas visibles en listado (chips) para escaneo rápido.
- Filtrado mental por color y texto; búsqueda por título y tags.

### 4.4 Búsqueda

- Campo de búsqueda en cada pestaña, con filtrado **en tiempo real**:
  - **Notas**: título y contenido.
  - **Checklists**: título y texto de los ítems.
  - **Ideas**: título y etiquetas.
- Estados vacíos diferenciados: sin elementos vs. sin resultados de búsqueda.

### 4.5 Persistencia local

- Datos guardados en el dispositivo con **AsyncStorage** (vía Zustand `persist`).
- Los contenidos sobreviven al cerrar la app o reiniciar el teléfono.
- Migración de formatos antiguos para no perder datos en actualizaciones.

### 4.6 Tema claro y oscuro

- La interfaz **sigue el tema del sistema** (claro u oscuro).
- Paleta y componentes Material Design 3 coherentes en ambos modos.

### 4.7 Navegación por pestañas

- **Tres tabs** persistentes: Notas, Checklists, Ideas.
- **Stack** por tab: listado → detalle `[id]`.
- Pantalla global **Nueva nota** (formulario unificado con selector de tipo) accesible desde el FAB.

---

## 5. Funcionalidades opcionales futuras

Estas capacidades amplían el valor del producto pero **no forman parte del alcance v1**. Se documentan como evolución natural del roadmap.

| Funcionalidad | Descripción | Valor para el usuario |
|---------------|-------------|------------------------|
| **Sincronización en la nube** | Backup y multi-dispositivo (Firebase, Supabase, etc.) | Acceso desde otro móvil o tablet |
| **Autenticación** | Cuenta de usuario (email, OAuth) | Datos privados y sync por perfil |
| **Recordatorios** | Alarmas locales asociadas a nota o ítem | No olvidar tareas con fecha límite |
| **Compartir notas** | Exportar texto o enlace a otras apps | Enviar lista de compra o apunte por WhatsApp |
| **Archivado** | Ocultar sin borrar del listado principal | Mantener historial sin ruido visual |
| **Exportación** | JSON, Markdown o PDF | Respaldo manual o entrega académica |
| **Notificaciones** | Push o locales para recordatorios y novedades | Re-engagement y alertas programadas |

### Priorización sugerida (orientativa)

1. **Exportación / compartir** — bajo coste, alto valor inmediato.
2. **Recordatorios + notificaciones locales** — refuerza checklists.
3. **Archivado** — mejora organización sin infraestructura.
4. **Autenticación + sincronización** — requiere backend y política de privacidad.

---

## 6. Propuesta de valor (resumen)

| | |
|---|---|
| **Qué es** | Cuaderno digital con notas, listas e ideas |
| **Para quién** | Estudiantes y usuarios que buscan simplicidad |
| **Diferencial v1** | Tres tipos de contenido + búsqueda + offline-first |
| **Cómo se usa** | Tres pestañas, FAB, búsqueda por tab, tema del sistema |
| **Hacia dónde** | Nube, recordatorios y compartir sin romper la simplicidad |

NoteFlow apuesta por **capturar rápido, encontrar rápido y olvidarse de la herramienta**: la tecnología debe acompañar el pensamiento, no interrumpirlo.

---

## 7. Alcance técnico alineado (referencia)

La v1 se implementa con **Expo**, **React Native Paper**, **Zustand**, **FlashList** y **TypeScript**, ejecutable en **Expo Go** para desarrollo y demostración. El detalle arquitectónico y teórico se recoge en [`react-native-teoria.md`](./react-native-teoria.md).
