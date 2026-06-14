# ZEN_FRONTEND_PLAYBOOK.md — Cómo diseñar y construir el frontend de Zen (y Purpura) mejor que el actual

> **Para:** el humano que va a seguir desarrollando este proyecto por su cuenta.
> **Para qué:** un playbook operacional, paso a paso, de cómo se diseña, implementa y mantiene el frontend de Zen a un nivel "premium boutique" — y cómo iterarlo sin caer en la mediocridad de Booksy / Fresha.
> **Cómo se entrega este doc:** está escrito en Markdown para que lo exportes a PDF con `pandoc`, `md-to-pdf`, o el botón "Save as PDF" de VS Code (Ctrl+Shift+P → "Markdown PDF"). Al final hay una sección §11 con instrucciones exactas de exportación.
>
> **Filosofía:** la única manera de ganarle a Booksy no es tener más features — es **diseñar mejor cada feature que ya tienes**. Eso requiere disciplina, herramientas correctas, y un flujo de trabajo que separe "diseñar" de "implementar".

---

## Tabla de contenidos

1. Por qué este playbook existe
2. Principios innegociables de diseño
3. Setup del entorno (CLI, IDE, extensiones, agentes)
4. Sistema de diseño Zen: cómo extenderlo sin romperlo
5. Flujo de trabajo "diseñar → implementar → verificar"
6. Herramientas específicas por tarea
7. Patrones de UI/UX que vamos a usar siempre
8. Patrones que **NO** vamos a usar
9. Cómo medir si el diseño mejoró
10. Recursos y referencias (libros, sites, gente)
11. Cómo exportar este doc a PDF

---

## 1. Por qué este playbook existe

### 1.1 El problema con los SaaS de la competencia

Booksy, Fresha, Mindbody, Boulevard, GlossGenius y Acuity **se parecen todos**:
- Botones azules, layouts en grilla dura, íconos genéricos.
- Tipografía sans-serif de sistema.
- Modales interrumpiendo el flujo.
- Ningún momento de deleite.
- Onboarding obligatorio que se siente como un formulario de hacienda.

Lo que tienen: integraciones, marketing, distribución. Lo que **no** tienen: cuidado por el detalle, identidad visual, y respeto por el tiempo del usuario.

### 1.2 La apuesta de Zen

Zen compite en **experiencia**, no en features. El admin abre la app 30+ veces al día — cada segundo cuenta, cada fricción suma, cada detalle que se siente "bien diseñado" se traduce en una clienta que se queda.

Ese norte se traduce en reglas concretas que están en `DESIGN.md` y en `src/app/globals.css`. Este playbook te enseña a **extender** ese sistema sin diluirlo.

### 1.3 Qué NO es este doc

- No es un tutorial de Next.js. Asumo que sabes React + TypeScript + Tailwind.
- No es una guía de marketing. No hablo de ads ni de funnels.
- No es la verdad absoluta. Las herramientas van a cambiar; los principios no.

---

## 2. Principios innegociables de diseño

Estos 10 principios van tatuados. Si una decisión los viola, la decisión está mal.

### 2.1 Premium = quietud
Booksy grita. Zen susurra. Si una pantalla tiene más de 3 colores compitiendo, está mal. Si un CTA necesita ser rojo para verse, está mal. Si un toast necesita parpadear, está mal.

**Regla práctica:** antes de añadir un elemento, pregúntate: ¿puedo **quitar** algo y que la pantalla siga funcionando? Casi siempre la respuesta es sí.

### 2.2 Tipografía hace el trabajo
La combinación Libre Caslon Text (serif, editorial) + Manrope (sans, técnica) es el activo de marca más fuerte. Si la cambias, perdiste. Si la dejas en `text-lg` cuando debería ser `text-3xl`, perdiste. Si la pones en `font-bold` cuando debería ser `font-medium`, perdiste.

**Regla práctica:** los títulos de página son siempre `font-serif` en `text-4xl` o `text-5xl` con `tracking-tight`. Los labels son siempre `font-sans` en `text-[10px]` con `uppercase` y `tracking-[0.25em]`. El cuerpo es `font-sans` en `text-sm` o `text-base`.

### 2.3 El espacio negativo es contenido
Una tarjeta con mucho padding y un solo dato vale más que una tarjeta apretada con cinco. Si sientes que "falta algo", casi siempre es **más espacio**, no más elementos.

**Regla práctica:** el padding interno de tarjetas principales es `p-6` mínimo. La separación entre secciones es `space-y-8`. La separación entre un título y su subtítulo es `mt-2` o `mt-3`, no más.

### 2.4 La animación explica, no decora
Cada Framer Motion `transition` debe **comunicar** algo: "este elemento acaba de llegar", "esta sección cambió", "estos datos se actualizaron". Si la animación es solo "porque se ve bonito", bórrala.

**Regla práctica:** usar `initial / animate / exit` solo cuando hay cambio de estado. Usar `whileHover` solo para affordances de clic. Respetar `prefers-reduced-motion`.

### 2.5 El color es señal, no decoración
El oro (`#D4AF37` / token `gold-primary`) significa "esto es premium / esto es la acción principal". El verde botánico significa "esto es Zen / esto es seguro". El lavanda significa "esto es un recordatorio / esto es suave". Si pones oro en algo que no es la acción principal, diluiste el oro.

**Regla práctica:** máximo 1 elemento dorado por viewport que esté en estado "activo/principal". El resto del oro está en estado "latente" (iconos, hairlines, íconos de marca).

### 2.6 El cliente público y el admin son dos productos
El cliente público (`/reserva`) es aspiracional, casi mágico. El admin (`/dashboard`, `/calendar`, `/caja`) es eficiente, denso, pero con el mismo lenguaje de marca.

**Regla práctica:** si un componente se usa en ambos, **duplícalo** con ajustes. No abstraigas. La duplicación de 50 líneas que ahorra una prop-drilling de 200 vale la pena.

### 2.7 Los datos del usuario son sagrados
Si un admin marca una cita como cobrada y el click se pierde, **es tu culpa**, no del usuario. Cada acción debe tener feedback inmediato (toast, animación de éxito, reversión optimista con rollback).

**Regla práctica:** cada `onClick` que dispara una mutación debe: (1) feedback optimista en UI, (2) rollback + toast de error si falla, (3) un sonido sutil (opcional). Nunca un `await` silencioso.

### 2.8 La accesibilidad no es extra
Keyboard navigation, focus rings visibles, contraste mínimo AA, `aria-label` en botones ícono, `prefers-reduced-motion` respetado. Esto no es "nice to have" — es lo que diferencia a un producto boutique de un template de Tailwind UI.

**Regla práctica:** antes de mergear una pantalla nueva, recorredla con Tab. Si no podés hacer todo lo que el mouse hace con teclado, no está lista.

### 2.9 El realtime es una promesa
Si la app dice "datos en vivo", dos pestañas tienen que reflejar cambios en menos de 1s. Si no, es mentira. El realtime ya está en `useAppointments` — no lo rompas abriendo canales innecesarios.

**Regla práctica:** solo subscribirse a `postgres_changes` para tablas que el usuario está mirando activamente. Cleanup en el `useEffect` return.

### 2.10 El copy se escribe como un spa
Cero jerga técnica en la UI. Cero imperativos fríos. "Tu día, en un vistazo" en lugar de "Dashboard". "Cerrar caja" en lugar de "Finalizar período contable". "Sin anticipo" en lugar de "payment_status = free".

**Regla práctica:** antes de mergear, leé cada string en voz alta. Si suena a sistema, no es Zen.

---

## 3. Setup del entorno

### 3.1 Sistema operativo y shell

- **OS:** Windows 11 Pro / macOS 14+. El proyecto usa PowerShell 7+ (Windows) o zsh (Mac). El repo es cross-platform — no uses paths absolutos tipo `C:\...` en código.
- **Terminal primaria:** **Windows Terminal** (Windows) o **iTerm2** (Mac). Instala **Oh My Posh** o **Starship** para tener un prompt limpio.

### 3.2 IDE: VS Code (recomendado) o Cursor

**Recomendación fuerte: VS Code + extensión Continue, NO Cursor.**

Razones:
- VS Code es más liviano, mejor con extensiones de diseño.
- Continue (https://continue.dev) te permite usar Gemini, Claude, o modelos locales sin cambiar de IDE.
- Cursor es bueno pero acopla a su modelo; para un proyecto boutique es preferible control fino.

**Extensiones VS Code obligatorias:**

| Extensión | Por qué |
|---|---|
| **ESLint** (`dbaeumer.vscode-eslint`) | Lint on save. El proyecto ya tiene config. |
| **Prettier** (`esbenp.prettier-vscode`) | Format on save. Consistencia. |
| **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) | Autocomplete de clases, hover para ver el CSS. |
| **TypeScript Next** (`ms-vscode.vscode-typescript-next`) | TS más rápido, errores en tiempo real. |
| **Error Lens** (`Alexander.error-lens`) | Errores inline en el código, no solo en el panel. |
| **Auto Rename Tag** | Ahorra 5 min al día. |
| **Path Intellisense** | Imports limpios. |
| **GitLens** | Historial de líneas, blame, compare. |
| **Supabase** (`supabase.supabase`) | Client oficial, autocompleta queries. |
| **Figma for VS Code** (opcional) | Si abrís Figma desde código. |
| **Todo Tree** | Para navegar TODOs en archivos grandes. |
| **indent-rainbow** | Visualizar indentación, clave en JSX anidado. |
| **Console Ninja** | `console.log` con UI, mejor que terminal scrollback. |
| **Pretty TypeScript Errors** | Errores de TS legibles, no murciélagos. |
| **Stylelint** | Para el poco CSS que queda en `globals.css`. |

**Settings JSON mínimo (`Ctrl+Shift+P` → "Open User Settings JSON"):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "workbench.colorTheme": "Rosé Pine Moon" // o tu favorito, pero algo calmado
}
```

### 3.3 Tema y tipografía en el IDE

El IDE no debe cansarte la vista. Temas recomendados:
- **Rosé Pine** (cálido, sin ser amarillo).
- **Tokyo Night** (azul oscuro, contraste justo).
- **Catppuccin Mocha** (rosa + lavanda, encaja con la paleta de Zen).

**Tipografía del IDE:** **JetBrains Mono** o **IBM Plex Mono** para el código. **Inter** o **Geist** si preferís sans para todo. NO uses monospace con serif accidentalmente.

### 3.4 CLI tools (lo que vas a usar todos los días)

| Herramienta | Comando | Para qué |
|---|---|---|
| **Node 20 LTS** | `node --version` | Runtime. |
| **npm 10** | `npm --version` | Package manager. **No** uses pnpm ni yarn, este repo es npm. |
| **Git** | `git --version` | Control de versiones. Configura SSH keys. |
| **Supabase CLI** | `npx supabase --version` | Para migrations locales. Opcional pero útil. |
| **Vercel CLI** | `npx vercel --version` | Para deploys manuales / previews. |
| **Playwright** | `npx playwright --version` | E2E tests (futuro). |
| **ripgrep** | `rg --version` | Búsqueda de código rápida. Viene con VS Code. |
| **fzf** | `fzf --version` | Fuzzy finder en terminal. |
| **bat** | `bat --version` | `cat` con syntax highlighting. |
| **eza** | `eza --version` | `ls` moderno. |
| **zoxide** | `zoxide --version` | `cd` inteligente. |
| **delta** | `delta --version` | `git diff` legible. |
| **lazygit** | `lazygit --version` | TUI para git. Recomendado. |
| **Starship** | `starship --version` | Prompt bonito. |
| **fnm** o **nvm** | `fnm --version` | Manejar múltiples versiones de Node. |
| **pnpm** (opcional) | — | NO usar, pero instalalo para otros proyectos. |

**Windows specifics:** usa **scoop** (`https://scoop.sh`) o **winget** para instalar todo. Ejemplo:
```powershell
winget install --id GitHub.cli
winget install --id Microsoft.PowerShell
winget install --id Stripe.StripeCli # solo si vas a integrar pagos
```

### 3.5 Agentes de IA: el setup correcto

NO uses un solo agente para todo. Cada agente tiene un strength. El setup óptimo para un proyecto boutique como Zen:

**Agente 1 — Arquitecto / Planificador (Claude Opus 4.8 o equivalente)**
- Para: planning, decisiones arquitectónicas, revisión de cambios grandes.
- Config: lee el repo completo, entiende el dominio, propone planes antes de tocar código.
- Cuándo: al iniciar features, al debuggear problemas raros, antes de refactors.

**Agente 2 — Implementador rápido (Gemini Pro 2.5 / 3 Pro)**
- Para: escribir código siguiendo un plan ya aprobado, generar migrations, generar componentes boilerplate.
- Config: dale contexto con `GEMINI_HANDOVER.md` y pídele tareas específicas con criterios de aceptación.
- Cuándo: cuando ya sabés qué hacer y solo querés velocidad.

**Agente 3 — Frontend design (Claude frontend-design skill / Vercel v0 / Galileo AI / Relume)**
- Para: generar variaciones de UI cuando estás bloqueado creativamente.
- Config: pasale el `DESIGN.md` y ejemplos de tu código existente. Pedile 3 variantes distintas.
- Cuándo: cuando no sabés cómo resolver visualmente algo.

**Agente 4 — Code review (CodeRabbit / Sourcery / Claude Sonnet)**
- Para: revisión automática en cada PR.
- Config: instalalo en GitHub. Pedile que revise estilo + bugs, no que apruebe solo.
- Cuándo: antes de mergear, siempre.

**Agente 5 — Diseño visual (Midjourney v6.1 / DALL-E 3 / Flux Pro)**
- Para: generar imágenes hero, fondos botánicos, mockups de marca.
- NO para: íconos (usa lucide), fotos de clientas (consigue stock legal), logos (diseña con Figma).
- Cuándo: necesitás un fondo abstracto o una ilustración editorial.

**Agente 6 — Asistente de docs (Notion AI / Coda AI)**
- Para: redactar manuales de operación, mensajes de WhatsApp, plantillas.
- Cuándo: el manual de Alexandra en `/settings` o el copy de emails.

**Reglas de oro con agentes:**
1. **Nunca** aceptes código de agente sin leerlo.
2. **Siempre** corré el typecheck después de un cambio grande.
3. **Siempre** abrí la app en el navegador y mirala con ojos críticos.
4. Si un agente propone 3 archivos de cambio, decile que proponga 1.
5. No mezcles 2 agentes en el mismo archivo en la misma sesión.

### 3.6 Diseño: Figma + plugins

- **Figma** (plan free alcanza) — para wireframes, mockups, design system.
- **Plugins útiles:**
  - **Iconify** — para íconos custom (igual seguimos con lucide).
  - **Unsplash** — fotos de stock dentro de Figma.
  - **Color Styles Generator** — para extraer paletas.
  - **Tokens Studio** — sincronizar tokens con código.
  - **A11y Annotations** — para documentar accesibilidad.
  - **FigJam** — para brainstormings.

- **No uses:** Adobe XD (deprecated), Sketch (Mac only, caro), InVision (legacy).

### 3.7 Monitoreo y analytics

- **Vercel Analytics** — para tráfico y Web Vitals.
- **Sentry** — para errores en runtime (instalar `@sentry/nextjs`).
- **PostHog** o **Plausible** — para eventos de producto (opcional).

---

## 4. Sistema de diseño Zen: cómo extenderlo sin romperlo

### 4.1 Dónde vive

- **Tokens CSS:** `src/app/globals.css`. **No** muevas nada de ahí.
- **Tema dark/light:** atributos `data-theme` en `<html>`. Toggle en `src/components/ui/ThemeToggle.tsx`.
- **Componentes primitivos:** `src/components/ui/`. Usá `<Button>`, `<Card>`, `<Modal>` etc. cuando existan. **No** invoques clases Tailwind de un botón a mano en un feature.
- **Componentes compuestos:** `src/components/<feature>/`. Estos SÍ pueden tener clases Tailwind largas, pero siguiendo los patrones de §7.

### 4.2 Cómo añadir un nuevo color

**NO.** Si necesitás un color que no está, estás mirando mal el problema. Los tokens actuales son suficientes:
- `primario-zen` (verde botánico oscuro) — CTAs, texto principal.
- `secundario-zen` (verde claro apagado) — fondos secundarios, hover.
- `fondo-zen` (crema / off-white) — fondo de página.
- `botanical-1` (verde medio) — acentos, success.
- `gold-primary` / `gold-dark` — premium, hairlines, CTAs secundarios premium.
- `lavender-primary` / `lavender-dark` — recordatorios, info suave.
- `on-surface`, `on-surface-variant`, `outline`, `outline-variant` — sistema de Material Design adaptado.

Si **de verdad** necesitás un tono, añadilo en `globals.css` con el nombre semántico (no `pink-500`, sino `accent-rose` o lo que sea) y commitea con un PR que documente el caso de uso.

### 4.3 Cómo añadir un nuevo componente

1. **Primero:** ¿ya existe algo similar? Buscar en `src/components/`.
2. **Si no:** decidir el nivel (primitivo en `ui/` o compuesto en `<feature>/`).
3. **Estructura de archivo:**
   ```tsx
   'use client'; // solo si usa hooks/state

   // ============================================================
   // NombreDelComponente.tsx — descripción de UNA línea.
   // Detalles de uso en 2-3 líneas si hay algo no obvio.
   // ============================================================

   import { ... } from 'lucide-react';
   import { motion } from 'framer-motion';

   interface NombreDelComponenteProps {
     /** doc JSDoc para cada prop. */
     variant?: 'primary' | 'ghost';
   }

   export function NombreDelComponente({ variant = 'primary' }: NombreDelComponenteProps) {
     return (
       <div className="...">
         ...
       </div>
     );
   }
   ```
4. **Estilos:** solo Tailwind + tokens. **No** styled-components, **no** CSS modules, **no** inline styles.
5. **Animaciones:** Framer Motion solo si aporta (ver §2.4).
6. **Testear:** ¿se ve bien con 1 elemento? ¿con 10? ¿con 100? ¿en mobile? ¿en dark mode? ¿solo con teclado?

### 4.4 Cómo iterar un componente existente

- **No** renombrar props sin deprecar primero.
- **No** cambiar el visual sin actualizar el `DESIGN.md`.
- **Sí** añadir una prop opcional nueva (`variant?: 'new-variant'`).
- **Sí** extraer subcomponentes cuando un archivo pasa de 200 líneas.

---

## 5. Flujo de trabajo "diseñar → implementar → verificar"

### 5.1 El ciclo completo

Para CADA feature nueva, seguí este orden. Saltarte pasos es la forma #1 de generar deuda.

#### Paso 1 — Sketch (5–15 min)
- Abrí Figma. Dibujá a mano alzada (FigJam) o con shapes.
- **3 layouts distintos mínimo.** No te cases con el primero.
- Preguntate: ¿cuál es la acción principal? ¿Está en el lugar donde el ojo cae primero?

#### Paso 2 — Wireframe (15–30 min)
- En Figma, pasá a grilla. Usá las medidas de `DESIGN.md` (1200px max, gutter 24px).
- Probá el wireframe con 1, 5, 20 elementos.
- Marcá con rojo los puntos de fricción.

#### Paso 3 — Mockup editorial (30–60 min)
- Aplicá los tokens reales. **No** uses los colores default de Figma.
- Ajustá tipografía: títulos `font-serif`, labels `font-sans` uppercase, cuerpo `font-sans` regular.
- Aplicá el ornamento (hairline + rombo dorado) donde corresponda.
- Revisá con ojos críticos: ¿se ve "premium" o "hecho en Figma"?

#### Paso 4 — Prototipo interactivo (opcional, 30 min)
- Si la feature tiene un flujo multi-paso (como `/reserva`), hacé un prototipo.
- Conectá los frames en Figma. Comprobá que el flujo se sienta natural.

#### Paso 5 — Implementar (variable)
- **Antes de codear:** abrí los archivos clave del proyecto (ver §6 del handover) y releé los patrones existentes.
- **Implementá el esqueleto primero:** estructura JSX con datos mock.
- **Después conectá los datos reales** (Supabase).
- **Después afiná las animaciones** (Framer Motion).
- **Después el responsive.**

#### Paso 6 — Verificar (30 min mínimo)
- Typecheck: `npx tsc --noEmit -p .`
- Lint: `npx next lint`
- Dev server: `npm run dev`. Recorré con teclado.
- Lighthouse en Chrome DevTools: aim ≥ 90 en las 4 categorías.
- Responsive: DevTools en mobile (375px), tablet (768px), desktop (1440px).
- Dark mode: toggle y revisá cada elemento.
- Reduced motion: macOS System Settings → Accessibility → Display → Reduce motion. Recargá.

#### Paso 7 — Review (15 min)
- Self-review: leé el diff completo. ¿Hay código que no pasaría review por otro dev?
- Auto-review: pasale el diff a CodeRabbit / Claude. ¿Hay issues reales?
- Pedí review a otro humano si es un cambio grande.

#### Paso 8 — Commit + push
- Mensaje de commit siguiendo Conventional Commits:
  ```
  feat(caja): add cash close view with payment status cycling
  fix(calendar): keyboard shortcut not firing in modal
  style(services): tighten preview card padding
  refactor(hooks): extract useBusinessSettings
  docs(readme): add setup section
  ```
- NO commitear con `--no-verify`. NO usar `git add .`. Stageá archivo por archivo.

### 5.2 Anti-patrones de workflow

- ❌ Codear sin mockup. **Resultado:** reescribir 3 veces.
- ❌ Mockup sin consultar el código existente. **Resultado:** inventar un sistema paralelo.
- ❌ Implementar sin verificar. **Resultado:** bugs en prod.
- ❌ "Lo arreglo después". **Resultado:** nunca se arregla.
- ❌ PRs de 50 archivos. **Resultado:** nadie los revisa.

---

## 6. Herramientas específicas por tarea

### 6.1 "Necesito un ícono"
→ **lucide.dev.** Buscá, copiá el nombre del import. Ej: `import { Wallet } from 'lucide-react'`. **No** uses otros sets (Heroicons, Tabler, Phosphor) — la consistencia visual sufre.

### 6.2 "Necesito una animación de check / loading / pulse"
→ **Framer Motion.** Para el check del success: `motion.svg` con `pathLength: 0 → 1` animado. Para loaders: `motion.div` con `animate={{ rotate: 360 }}` y `transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}`.

### 6.3 "Necesito un gráfico de líneas/barras"
→ **Recharts** o **Tremor**. Para Zen, preferí Recharts (más control). Si necesitás algo más editorial, dibujalo a mano con SVG.

### 6.4 "Necesito un date picker"
→ **react-day-picker** (ya en el proyecto, ver `useBookingFlow`). **No** reinventes.

### 6.5 "Necesito un modal / dialog"
→ **Headless UI** o **Radix UI**. Ya está en el proyecto (ver `ConfirmDialogProvider`). **No** uses `window.confirm`.

### 6.6 "Necesito un toast / notificación"
→ El `ToastProvider` del proyecto. **No** instales `react-hot-toast` o `sonner`.

### 6.7 "Necesito un calendario / agenda"
→ **react-big-calendar** o el custom que ya hay. No agregues FullCalendar (es pesado).

### 6.8 "Necesito un form con validación"
→ **react-hook-form** + **zod**. Ya hay probablemente. Si no, instalá y agregá.

### 6.9 "Necesito drag & drop"
→ **dnd-kit** (mejor que react-beautiful-dnd, que está deprecated). Usá solo si realmente hace falta (reordenamiento de servicios, por ejemplo).

### 6.10 "Necesito una tabla de datos"
→ **TanStack Table** (headless). Estilala con Tailwind a mano — el `card-depth` y la tipografía editorial no vienen en `@tanstack/react-table`.

### 6.11 "Necesito generar PDF"
→ **react-pdf** o **@react-pdf/renderer** en el cliente. **No** uses `jsPDF` (API fea).

### 6.12 "Necesito una imagen optimizada"
→ **`next/image`** con el componente built-in de Next. **No** uses `<img>`.

### 6.13 "Necesito hacer un fetch a Supabase"
→ El cliente de `src/lib/supabaseClient.ts` para el cliente. `src/lib/supabaseAdmin.ts` para server-side (service role). **No** crees nuevos clientes.

### 6.14 "Necesito animaciones de scroll"
→ **GSAP + ScrollTrigger** si necesitás control fino. Framer Motion `useScroll` para cosas simples.

### 6.15 "Necesito un fondo abstracto orgánico"
→ Generá un SVG con blobs en Figma. O usá un shader muy simple con **OGL** o **Three.js** si te animás. **No** metas un video.

### 6.16 "Necesito una fuente nueva"
→ Preguntate primero si **de verdad** la necesitás. Si sí: **Google Fonts** o **Fontshare** (gratis, con buena calidad). Sumá a `globals.css` y a `tailwind.config.js`.

---

## 7. Patrones de UI/UX que vamos a usar siempre

### 7.1 El header editorial
Toda página principal (Dashboard, Caja, Calendar en día completo) empieza con:

```tsx
<header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2">
  <div>
    <p className="text-[10px] uppercase tracking-[0.25em] text-gold-dark font-semibold font-sans mb-2 flex items-center gap-2">
      <Sparkles className="w-3 h-3" strokeWidth={2} />
      Etiqueta de contexto
    </p>
    <h1 className="font-serif text-4xl md:text-5xl text-primario-zen tracking-tight leading-none">
      Título de la página.
    </h1>
    <p className="text-on-surface-variant/70 text-sm font-medium uppercase tracking-[0.18em] font-sans mt-3">
      {format(today, "EEEE, d 'de' MMMM", { locale: es })}
    </p>
  </div>
  <Link href="..." className="...">CTA principal</Link>
</header>

<div className="flex items-center gap-3" aria-hidden>
  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/30 to-gold-primary/30" />
  <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold-primary">
    <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" opacity="0.55" />
  </svg>
  <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/30 to-gold-primary/30" />
</div>
```

**Cuándo:** siempre. Es la firma visual.

### 7.2 La tarjeta "card-depth"
Toda tarjeta principal usa `card-depth rounded-3xl p-6`. El padding interno es generoso. El contenido no compite con el borde.

### 7.3 El botón primario
```tsx
<button className="inline-flex items-center gap-2 bg-primario-zen text-fondo-zen px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-primario-zen/90 transition-all shadow-soft-shadow">
  Acción
</button>
```

**Variantes:**
- Secundario: `bg-secundario-zen/30 text-primario-zen hover:bg-secundario-zen/60`
- Ghost: `text-primario-zen/70 hover:text-primario-zen`
- Danger: `bg-error-container/40 text-on-error border border-error/30` (usar con moderación)

### 7.4 El pill de estado
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.15em] font-sans">
  <span className="w-1.5 h-1.5 rounded-full bg-current" />
  Confirmada
</span>
```

**Colores por estado:**
- Confirmada: `bg-primario-zen/10 text-primario-zen border-primario-zen/30`
- Pendiente: `bg-gold-primary/10 text-gold-dark border-gold-primary/40`
- Cancelada: `bg-error-container/40 text-on-surface-variant/60 line-through`
- Cobrada: `bg-secundario-zen/40 text-on-surface-variant/80`

### 7.5 La empty state
```tsx
<div className="flex flex-col items-center text-center py-12 px-6 rounded-2xl border border-dashed border-primario-zen/30 bg-primario-zen/5">
  <span className="w-12 h-12 rounded-full bg-primario-zen/10 flex items-center justify-center mb-3">
    <Icon className="w-5 h-5 text-primario-zen" strokeWidth={1.75} />
  </span>
  <p className="font-serif text-xl text-primario-zen">Mensaje principal</p>
  <p className="text-xs text-on-surface-variant/70 font-sans mt-1.5 max-w-xs">
    Mensaje secundario con más contexto.
  </p>
  <Link className="mt-4 ...">CTA opcional</Link>
</div>
```

### 7.6 La keycap (para atajos de teclado)
```tsx
<kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded bg-gold-light/80 border border-gold-primary/40 text-gold-dark text-[10px] font-mono font-semibold">
  N
</kbd>
```

### 7.7 El shimmer (para CTAs premium)
Definido en `globals.css`:
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

Uso:
```tsx
<button className="relative overflow-hidden ...">
  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-current/10 to-transparent" />
  <span className="relative">Texto</span>
</button>
```

### 7.8 La hairline con diamante
(Ya en §7.1.) Usar entre secciones, no entre cada elemento.

### 7.9 El toast
- Success: verde botánico + ícono Check.
- Error: rojo + ícono X.
- Info: lavanda + ícono Info.
- Duración: 3s default, dismissible con click.
- Posición: top-right en desktop, bottom-center en mobile.

### 7.10 El grid responsive
- Mobile first. Default: `grid-cols-1`.
- `sm:` → 2 columnas.
- `md:` → 2-3 columnas.
- `lg:` → 3-4 columnas o split editorial (60/40).
- `xl:` → 4-5 columnas.

Usa `grid-cols-1 lg:grid-cols-[3fr_2fr]` para split editorial.

### 7.11 El modal
- Overlay: `bg-black/40 backdrop-blur-sm`.
- Container: `bg-fondo-zen rounded-3xl p-8 max-w-md shadow-soft-shadow`.
- Animación: `initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}`.
- Esc cierra. Click en overlay cierra. Foco atrapado.

### 7.12 El timeline vertical
```tsx
<ol className="relative">
  <div className="absolute left-[34px] top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-gold-primary/40 to-transparent" aria-hidden />
  {items.map((item, idx) => (
    <li className="relative pl-20 pr-3 py-3">
      <div className="absolute left-[28px] top-6 w-3.5 h-3.5 rounded-full border-2 border-gold-primary bg-fondo-zen shadow-[0_0_0_3px_var(--surface)] z-10" aria-hidden />
      <span className="absolute left-0 top-5 text-[11px] ...">HH:MM</span>
      <div className="...">Contenido</div>
    </li>
  ))}
</ol>
```

---

## 8. Patrones que **NO** vamos a usar

### 8.1 NO emojis en la UI
`🔥` `💅` `✨` `💖` — no. El tono de Zen es editorial, no juvenil. Si necesitás un símbolo visual, usá un ícono de lucide. Si necesitás un adorno, usá el diamante dorado.

Excepciones: en mensajes de WhatsApp pre-llenados (D1c), el emoji 🌿 al inicio del mensaje sí va — porque es la marca.

### 8.2 NO colores planos de Tailwind
`bg-blue-500`, `text-red-600`, `bg-gray-100` — no. Usá los tokens. Si necesitás una variante de un token, usá la notación de opacidad: `bg-primario-zen/80`.

### 8.3 NO sombras feas
`shadow-md`, `shadow-lg` plano — no. Usá `shadow-soft-shadow` o `shadow-gold-glow`. Si necesitás una nueva, definila en `globals.css` con blur 30+ y opacity 10-15%.

### 8.4 NO inputs sin label
Cada input tiene su label visible (o `aria-label` si no hay espacio). El `placeholder` no es un label.

### 8.5 NO botones sin feedback
Click → loading state. Loading → success/error toast. Sin excepciones.

### 8.6 NO "Confirmar?" en cada acción
Solo en acciones destructivas (borrar, cancelar cita cobrada, cerrar caja si ya estaba cerrada). El resto, feedback inmediato sin modal.

### 8.7 NO copy tipo sistema
"¿Está seguro?" "Operación exitosa" "Ha ocurrido un error" — no. Escribí como un humano en español de México: "¿Cerramos la caja de hoy?" "Listo, ya cerraste la caja" "No pudimos guardar — revisá tu conexión".

### 8.8 NO información redundante
Si un dato ya está visible en otro lugar, no lo repitas. Si la acción ya tuvo feedback en el toast, no la repitas en la página.

### 8.9 NO layouts en grilla dura para texto
El texto editorial fluye. No metas párrafos en `grid grid-cols-3` "para llenar espacio". Usá `max-w-prose mx-auto` y dejá que respire.

### 8.10 NO dark mode "invertido"
El dark mode de Zen no es "voltear blanco a negro". Es una paleta pensada para luz baja. Si tenés que aplicar `dark:invert` o `dark:filter`, estás haciendo trampa.

---

## 9. Cómo medir si el diseño mejoró

### 9.1 Métricas cuantitativas
- **Lighthouse score ≥ 90** en las 4 categorías (Performance, Accessibility, Best Practices, SEO).
- **TTI (Time to Interactive) < 2s** en 3G simulado.
- **CLS (Cumulative Layout Shift) < 0.05**.
- **Bounce rate del admin** en login: si el admin abre la app y se va en <5s, algo está mal.
- **Time on task** para acciones comunes: crear cita, marcar cobrada, cerrar caja. Aim: < 15s.

### 9.2 Métricas cualitativas
- **El "wows" test:** mostrá la pantalla a alguien que no sea vos. Si no dicen "wow" o "se ve lindo", no está lista.
- **El "5 segundos" test:** mostrá la pantalla 5 segundos y tapala. ¿La persona recuerda qué es y qué puede hacer? Si no, la jerarquía está mal.
- **El "consistency" test:** compará visualmente la nueva pantalla con 2 pantallas existentes. ¿Se siente del mismo sistema? Si no, la nueva rompió algo.
- **El "screenshot to portfolio" test:** ¿la pondrías en tu portfolio de diseño? Si no, no la merges.

### 9.3 Feedback loop con usuarios
Una vez en producción:
- **Hotjar** o **Microsoft Clarity** (gratis) — heatmaps y session recordings.
- Encuesta mensual a las 5 admin más activas: "¿Qué tarea te sigue siendo tediosa?"
- **WhatsApp directo** con las dueñas del salón. Su feedback es el más valioso.

---

## 10. Recursos y referencias

### 10.1 Libros
- **"Refactoring UI"** — Adam Wathan & Steve Schoger. **OBLIGATORIO** antes de diseñar.
- **"Designing Data-Intensive Applications"** — Martin Kleppmann. Para el backend.
- **"The Design of Everyday Things"** — Don Norman. Para entender UX.
- **"Microinteractions"** — Dan Saffer. Para las animaciones pequeñas.
- **"Thinking with Type"** — Ellen Lupton. Para la tipografía.
- **"Grid Systems in Graphic Design"** — Josef Müller-Brockmann. Para layouts editoriales.
- **"Color and Light"** — James Gurney. Para entender color (no técnico).
- **"Logo Design Love"** — David Airey. Si en algún momento rediseñan el logo.

### 10.2 Newsletters
- **CSS Tricks** (https://css-tricks.com) — para novedades de CSS.
- **Smashing Magazine** (https://smashingmagazine.com) — para diseño web.
- **Frontend Focus** (https://frontendfocus.co) — semanal, lo mejor de frontend.
- **Bytes** (https://bytes.dev) — diario, JS/newsletter.
- **Design Systems** (https://designsystems.com) — para cuando crezca el DS.

### 10.3 Cuentas de Twitter/X / Mastodon a seguir
- @adamwathan (Tailwind)
- @steveschoger (Refactoring UI)
- @jessbudd (diseño)
- @rauchg (Vercel, performance)
- @jaredpalmer (Formik, design systems)
- @dabit3 (GraphQL, React Native)
- @wesbos (CSS, JS)
- @tannerlinsley (TanStack)
- @bramus (CSS, animations)
- @lydiahallie (JS, interviews)
- @matthewcp (Zed, Rust)

### 10.4 Sitios de inspiración (NO para copiar, para calibrar el gusto)
- **Awwwards** (https://awwwards.com) — los mejores sitios del mundo.
- **Godly** (https://godly.website) — curado, más accesible.
- **Minimal Gallery** (https://minimal.gallery) — sitios minimalistas.
- **SiteInspire** (https://siteinspire.com) — para web design editorial.
- **Dark Mode Design** (https://darkmodedesign.com) — para inspiración de dark mode.
- **Mobbin** (https://mobbin.com) — patrones de mobile apps.
- **Really Good Emails** (https://reallygoodemails.com) — para emails transaccionales.

### 10.5 Generadores y assets
- **Lucide** (https://lucide.dev) — íconos.
- **Unsplash** (https://unsplash.com) — fotos gratis de alta calidad.
- **Pexels** (https://pexels.com) — alternativa a Unsplash.
- **Coolors** (https://coolors.co) — paletas de color.
- **Google Fonts** (https://fonts.google.com) — fuentes gratis.
- **Fontshare** (https://fontshare.com) — fuentes gratis de alta calidad.
- **SVGOMG** (https://jakearchibald.github.io/svgomg) — optimizar SVGs.
- **TinyPNG** (https://tinypng.com) — comprimir PNG/JPG.
- **Squoosh** (https://squoosh.app) — comprimir imágenes en el browser.

### 10.6 Cursos
- **Frontend Masters** (https://frontendmasters.com) — cursos avanzados de React, TypeScript, CSS, performance.
- **Egghead.io** (https://egghead.io) — cursos cortos, granulares.
- **Level Up Tutorials** (https://leveluptutorials.com) — tutoriales modernos.
- **DesignCourse** (https://designcourse.com) — UI/UX moderno.
- **JavaScript Mastery** (YouTube) — proyectos full-stack.

### 10.7 Comunidades
- **Reddit:** r/reactjs, r/nextjs, r/webdev, r/UXDesign, r/DesignSystems.
- **Discord:** Tailwind CSS, Reactiflux, Design Buddies.
- **Twitter/X:** seguir a los de §10.3, hacer preguntas con screenshots.

---

## 11. Gestión de Accesos y Autenticación (Supabase Auth)

Zen utiliza **Supabase Auth** para gestionar las sesiones, garantizando un nivel de seguridad empresarial. Toda la gestión de contraseñas, correos e invitaciones se delega a las herramientas nativas de Supabase.

### 11.1 Cómo invitar a una nueva empleada / administradora (ej. Alexandra o Alondra)
1. Entra a tu panel de control de Supabase.
2. Ve a la pestaña **Authentication** -> **Users**.
3. Haz clic en **Invite User** (o "Add User").
4. Ingresa el correo electrónico de la persona.
5. Supabase le enviará un correo con un enlace mágico o un formulario para establecer su contraseña, dependiendo de las "Email Templates" que hayas configurado.
6. **MUY IMPORTANTE**: Una vez que el usuario acepte y se registre, debes ir a la tabla `user_roles` en tu base de datos y asignarle el `project_id` correspondiente (Zen o Púrpura) y el rol (`admin` o `employee`). Sin esto, el usuario no verá su calendario.

### 11.2 Recuperación y cambio de contraseñas
- Si una empleada olvida su contraseña, la página de Login en Zen tiene un enlace de "¿Olvidaste tu contraseña?".
- Este enlace dispara el evento `resetPasswordForEmail` de Supabase, que automáticamente envía un correo con un link seguro.
- Para personalizar el correo que les llega (logo, texto, colores), debes ir a **Authentication -> Email Templates** en tu panel de Supabase y editar la plantilla de *Reset Password*.

### 11.3 Por qué no hay botón de "Crear Cuenta"
El sistema de Zen es **cerrado y privado**. No queremos que cualquier persona en internet pueda crearse una cuenta de administrador. Solo la dueña principal (mediante el panel de Supabase) puede disparar correos de invitación.

---

## 12. Cómo exportar este doc a PDF

### 11.1 Opción A — VS Code (recomendada)
1. Abrí `ZEN_FRONTEND_PLAYBOOK.md` en VS Code.
2. Instalá la extensión **"Markdown PDF"** (`md-pdf.vscode-markdown-pdf`).
3. `Ctrl+Shift+P` → "Markdown PDF: Export (pdf)".
4. Se genera `ZEN_FRONTEND_PLAYBOOK.pdf` en el mismo directorio.

### 11.2 Opción B — Pandoc (más control)
```powershell
# Instalar pandoc: winget install JohnMacFarlane.Pandoc

cd "C:\Users\USER END\Desktop\web_local"
pandoc ZEN_FRONTEND_PLAYBOOK.md -o ZEN_FRONTEND_PLAYBOOK.pdf `
  --pdf-engine=xelatex `
  --toc `
  --toc-depth=2 `
  -V geometry:margin=1in `
  -V mainfont="Libre Caslon Text" `
  -V monofont="JetBrains Mono" `
  -V colorlinks=true `
  -V linkcolor=gold `
  -V urlcolor=gold
```

Si no tenés xelatex, instalá MiKTeX o usa Typora.

### 11.3 Opción C — md-to-pdf (npm)
```powershell
npm install -g md-to-pdf
cd "C:\Users\USER END\Desktop\web_local"
md-to-pdf ZEN_FRONTEND_PLAYBOOK.md
```

### 11.4 Opción D — Typora (GUI, pago pero vale la pena)
- Abrir el .md en Typora.
- File → Export → PDF.

### 11.5 Configuración recomendada para el PDF
- **Tamaño:** A4 o US Letter.
- **Márgenes:** 1 inch (2.54 cm).
- **Tipografía:** una serif para el cuerpo (Libre Caslon Text si está disponible, sino Charter o Lora), una mono para el código (JetBrains Mono o Fira Code).
- **Tabla de contenidos:** sí, profundidad 2.
- **Syntax highlighting en código:** pandoc highlight style "tango" o "zenburn".
- **Code blocks:** con ` ```tsx ` o ` ```typescript ` para highlighting correcto.

---

## Epílogo

Si llegaste hasta acá, ya tenés todo lo que necesitás para que el frontend de Zen esté al nivel de un estudio boutique de diseño. No es ciencia — es disciplina + las herramientas correctas + práctica constante.

**El loop virtuoso:**
1. Diseñá en Figma con los principios de §2.
2. Implementá siguiendo los patrones de §7.
3. Evitá los anti-patrones de §8.
4. Verificá con §9.
5. Iterá. Siempre.

Cuando algo se vea "casi bien pero no del todo bien", no lo mergees. Volvé a §2 y preguntate cuál principio violaste. Casi siempre hay uno.

**Y la regla final:** si dudás entre hacer algo "para que se vea moderno" o "para que sea útil", elegí útil. Zen no compite en modernidad — compite en atemporalidad. Cada decisión debería verse bien hoy y en 5 años.

— Fin del playbook.
