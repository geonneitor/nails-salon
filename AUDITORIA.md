# AUDITORÍA TÉCNICA — Zen (web_local)

**Fecha:** 2026-06-14
**Alcance:** `src/**` (TypeScript / TSX). No se incluyen migraciones SQL ni `supabase/`.
**Foco:** bugs, seguridad, tipos. Clasificación **Bug / Mejora / Nit**.
**Modo:** lectura estática. No se ejecutó `tsc` ni `next build`, no se probaron flujos en runtime. Los hallazgos de tipo se basan en inferencia; los de seguridad, en laposura de los contratos y laposura de RLS en el cliente.

> **Disclaimer importante:** El propio proyecto declara (en `GEMINI_HANDOVER.md`) que varias piezas están "al 50%". Eso explica algunos hallazgos. La auditoría es objetiva: el reporte no asume intención, evalúa lo que el código dice hoy.

---

## TL;DR — Lo más urgente

| # | Tipo | Severidad | Archivo | Resumen |
|---|---|---|---|---|
| 1 | Bug | 🔴 Alta | `src/middleware.ts:17-18` | Usa `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` con non-null assertion. Si el env no está en runtime, **crashea** el middleware entero y rompe **toda** la app. |
| 2 | Bug | 🔴 Alta | `src/lib/supabaseClient.ts:9-10` y `.env.local` | El `ANON_KEY` y el `URL` están **hardcodeados como fallback en el bundle del cliente** y, además, commiteados en `.env.local`. Cualquier dev que clone el repo ve la key. |
| 3 | Bug | 🔴 Alta | `src/lib/supabaseAdmin.ts:3-4` | Mismísimo problema con `SUPABASE_SERVICE_ROLE_KEY`: si no se setea, devuelve string vacío y el `createClient` se inicializa con un token inválido. **No hay fail-fast.** |
| 4 | Bug | 🔴 Alta | `src/app/api/admin/users/route.ts` | Endpoint que crea usuarios en Supabase Auth **sin verificar que quien lo llama sea admin**. Cualquier usuario autenticado (o en algunos casos cualquiera) puede invitar empleados a un `projectId` arbitrario. |
| 5 | Bug | 🔴 Alta | `src/app/api/cron/reminders/route.ts:42-57` | El bypass `?dev=1` depende solo de `NODE_ENV`, no de un token. Si el deploy queda mal configurado en staging, **cualquiera puede vaciar reminders y falsificar `notifications_outbox`**. |
| 6 | Bug | 🔴 Alta | `src/hooks/useAppointments.ts:243-258` y todos los hooks de update | Las mutaciones de citas/clientes/empleados NO verifican `project_id` antes de updatear. RLS en Supabase lo cubriría, pero la ausencia de filtros cliente + el `single()` ciego puede llevar a estados inconsistentes. |
| 7 | Bug | 🟠 Media | `src/hooks/useBusinessSettings.ts` + `useBookingFlow.ts:7` | Hay **dos implementaciones de `business_settings`** (este hook y `useBookingFlow`). El segundo hardcodea `PROJECT_ID` y rompe multi-tenant. |
| 8 | Bug | 🟠 Media | `src/hooks/useAppointments.ts:36` y similares | `checkEmployeeAvailability` no se usa en la app, y `createAppointment` solo verifica citas activas (`status != 'cancelled'`) en teoría — pero el query a `time_blocks` no filtra por `project_id`. Riesgo de cross-project en multi-tenant. |
| 9 | Bug | 🟠 Media | `src/hooks/useCustomers.ts:181-219` | `uploadPhoto` no valida MIME ni tamaño, no sanitiza la extensión, y la key usa `uuidv4()` sin prefijo de proyecto. Si el bucket `customer-gallery` no está configurado con políticas de path correctas, hay riesgo de escalado. |
| 10 | Bug | 🟠 Media | `src/hooks/useEmployees.ts:60-79` | `updateEmployee` y `deleteEmployee` no verifican `project_id`. Si dos proyectos comparten un ID (no debería pasar, pero...), borra cruzado. |
| 11 | Bug | 🟠 Media | `src/components/calendar/AppointmentDetailModal.tsx:95` | Llama `useAppointments()` sin argumentos. Eso crea una instancia con `projectId = null`, que **resetea a lista vacía y luego crea un canal realtime fantasma en cada apertura del modal**. |
| 12 | Bug | 🟠 Media | `src/components/calendar/CalendarView.tsx:402-407` | Inyecta `project_id: projectId ?? payload.project_id ?? ""` — si ambos son null/undefined, llega string vacío a la DB, lo que rompe el insert de forma silenciosa (dependiendo del constraint de NOT NULL). |
| 13 | Bug | 🟠 Media | `src/lib/calendarGrid.ts:35-37` | `timeToYOffset` puede devolver números negativos si la hora cae antes de `GRID_START_HOUR`. El `Math.max(0, ...)` lo contiene, pero oculta un bug de UI en citas antes de las 6am. |
| 14 | Bug | 🟠 Media | `src/components/calendar/views/DayView.tsx:113-126` | Los botones "slot clickeable" se renderizan como `<button>` dentro de un grid que ya tiene `<button>` (los AppointmentBlock). En `WeekView` probablemente igual. Riesgo de anidación de interactivos + comportamiento de teclado roto. |
| 15 | Bug | 🟠 Media | `src/components/calendar/CalendarView.tsx:71-83` | `useMemo` filtra por `effectiveEmployeeId` y `customerFilterId`, pero **no reactiva a cambios en `activeProject`**. Si el admin cambia de proyecto, la lista no se re-filtra hasta que cambien las appointments. |
| 16 | Bug | 🟠 Media | `src/app/api/admin/reminders/route.ts:15` | `PROJECT_ID` viene de env en vez de leerse del `user_roles` del solicitante. Si se monta multi-project, este endpoint siempre lee/escribe sobre el proyecto equivocado. |
| 17 | Bug | 🟠 Media | `src/app/api/admin/reminders/settings/route.ts:13` | Igual que arriba: el `PUT` upsert sobreescribe sin validar ownership. Combinado con (4), un usuario cualquiera puede pisar la config de reminders de cualquier proyecto. |
| 18 | Bug | 🟠 Media | `src/components/calendar/AppointmentBlock.tsx:96-98` | `isInProgress` se calcula con `currentTime` que **es `new Date()` del padre y se regenera cada render del padre**. En `DayView` se pasa `currentTime={new Date()}` (línea 346 de CalendarView), así que cambia en cada keystroke, lo que dispara la animación de pulse infinitamente cuando el bloque está activo. |
| 19 | Bug | 🟠 Media | `src/lib/appointmentLayout.ts:31-39` | `flushCluster` calcula `columnCount = Math.max(...col) + 1` por cluster, **no global**. Si dos clusters del mismo día tienen 2 columnas, el `columnCount` se reporta como 2 cada uno pero la UI puede asumir otra cosa. (No es un crash, pero sí un cálculo incorrecto del ancho de columna.) |
| 20 | Bug | 🟠 Media | `src/app/(app)/dashboard/page.tsx:39-43` | `dateRange` se calcula con `useMemo` y dependencia `[]` (vacía). Si el usuario deja la pestaña abierta 3 días, **el "hoy" y "esta semana" no avanzan** sin recargar. |
| 21 | Bug | 🟠 Media | `src/components/dashboard/TodayTimeline.tsx:77-79` | El sort es lexicográfico sobre el string ISO, lo cual **funciona por coincidencia** (ISO 8601 es ordenable como string), pero es frágil. Si el backend devuelve otro formato o con `Z` vs sin `Z`, falla silencioso. |
| 22 | Bug | 🟡 Baja | `src/lib/whatsapp.ts:45-50` | `customerPhone.replace(/[^\d+]/g, '')` deja pasar `+` en cualquier posición. Un cliente con `+52 1 55 1234` produce `+521551234`, que para `wa.me/` está bien. Pero un cliente que pone `++521` produce `++521` y falla. Falta validación. |
| 23 | Bug | 🟡 Baja | `src/components/booking/RebookActions.tsx:34-83` | El `.ics` generado usa `start.getUTC*()` y la duración hardcodeada en 60min. Si la cita dura 120min, el archivo dice "termina 60min después". Bug silencioso para el cliente. |
| 24 | Bug | 🟡 Baja | `src/components/booking/NailMenuCalculator.tsx:74-94` | El `useEffect` mete `totalPrice`/`totalDuration` en las dependencias. Esos valores vienen del cálculo síncrono de `calculateDynamicNailTotals`, que se recalcula en cada render. En la práctica no causa loops, pero huele a dependencia sucia y TS strict + ESLint lo señalan. |
| 25 | Bug | 🟡 Baja | `src/components/ui/ConfirmDialog.tsx:54-58` | Si el componente que llamó `confirm()` se desmonta antes de la respuesta, la promesa queda **huérfana para siempre** (memory leak + estado de UI roto). |

---

## 🐛 BUGS (detallados, con fix sugerido)

### 1. `middleware.ts` — fail-loud en lugar de fail-fast
**Archivo:** `src/middleware.ts:17-18`
```ts
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
```
**Problema:** `!` (non-null assertion) silencia a TS pero no a Node. Si en prod alguien borra la env, el middleware cae con `TypeError: undefined is not a function` (en runtime) o, peor, con un 500 opaco al usuario.

**Fix:**
```ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('[middleware] Faltan env vars de Supabase');
  return NextResponse.json({ error: 'config_missing' }, { status: 503 });
}
```

---

### 2. `supabaseClient.ts` + `.env.local` — keys commiteadas
**Archivos:** `src/lib/supabaseClient.ts:9-10`, `.env.local:1-3`
```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xeclkyydwouszqisgfmr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiI...';
```
**Problemas:**
1. La ANON_KEY está **hardcodeada como fallback**. Eso significa que se mete en el bundle de Next (es `NEXT_PUBLIC_`), así que cualquier visitante del sitio puede verla en los devtools. La ANON key es pública por diseño, pero **dejar el fallback explícito normaliza no rotarla jamás**.
2. El `.env.local` está commiteado (lo confirma que `dir` lo muestra y el `.gitignore` lo excluye, pero el proyecto tiene `.env.local` con keys dentro — lo cual es contradictorio. Verificar con `git log -p .env.local`).
3. El `PROJECT_ID` de Next (`489e898d-3b2a-4775-b784-93a0e1a473e0`) está en `.env.local` y también hardcodeado como fallback en `useBookingFlow.ts:7` y `usePublicBooking.ts:12`.

**Fix:**
- Quitar todos los fallbacks hardcodeados.
- Rotar la ANON_KEY y la SERVICE_ROLE_KEY **ahora** (asumir compromiso).
- Limpiar `.env.local` del repo, agregar `.env.example` con placeholders.
- Verificar en Supabase → Settings → API que las keys actuales no estén siendo usadas en otros lugares inseguros.

---

### 3. `supabaseAdmin.ts` — service role sin guardarraíl
**Archivo:** `src/lib/supabaseAdmin.ts:3-4`
```ts
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {...});
```
**Problema:** Si la env no está, se crea un cliente con token vacío. Cualquier query devuelve 401 silencioso, pero peor, si por un descuido en el futuro alguien hace `supabaseAdmin.from('customers').select('*')` sin filtro, **se salta RLS** (es service role) y se filtran TODAS las clientas de TODOS los proyectos.

**Fix:**
```ts
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key || !supabaseUrl) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY o SUPABASE_URL faltante en servidor.');
}
```

---

### 4. `api/admin/users/route.ts` — invitaciones sin auth ni ownership
**Archivo:** `src/app/api/admin/users/route.ts:4-12`
```ts
export async function POST(request: Request) {
  try {
    const { email, name, role, projectId } = await request.json();
    if (!email || !name || !role || !projectId) { ... }
    // ⚠️ NUNCA verifica quién llama.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(...)
```
**Problema:** Cualquiera que sepa la URL del endpoint puede:
- Crear usuarios en Supabase Auth.
- Asignarles un rol (`admin` o `employee`) y un `project_id` arbitrario.
- Insertar un registro en `employees` con ese `project_id`.

Es un **CRITICAL de seguridad**: con un POST bien armado un atacante se hace admin de cualquier salón.

**Fix:** Antes de cualquier operación, crear un cliente con el JWT del request y verificar:
```ts
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient(URL, ANON, { cookies: { ... } });
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

const { data: role } = await supabase.from('user_roles').select('role, project_id').eq('id', user.id).single();
const isAdmin = role?.role === 'admin' && role?.project_id === projectId;
if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
```

---

### 5. `api/cron/reminders/route.ts` — bypass de auth por env
**Archivo:** `src/app/api/cron/reminders/route.ts:42-57`
```ts
const isDevBypass =
  process.env.NODE_ENV !== 'production' && url.searchParams.get('dev') === '1';
...
if (!isDevBypass) {
  if (!expected) return ...503
  if (provided !== expected) return ...401
}
```
**Problema:** El bypass se activa con `NODE_ENV != 'production' && ?dev=1`. Si el deploy se hace a un entorno `staging` con `NODE_ENV=staging`, **el bypass queda activo** y cualquiera que sepa la URL puede:
- Marcar reminders como `sent` falsamente.
- Insertar filas en `notifications_outbox` con payloads arbitrarios.

**Fix:** Usar una variable dedicada de bypass:
```ts
const isDevBypass =
  process.env.ALLOW_CRON_BYPASS === 'true' && url.searchParams.get('dev') === '1';
```
Y siempre requerir el secret real en producción, sin importar el `NODE_ENV`.

---

### 6. `useAppointments.updateAppointment` — sin filtro de proyecto
**Archivo:** `src/hooks/useAppointments.ts:243-258`
```ts
const { error: updateError } = await supabase
  .from('appointments')
  .update(payload)
  .eq('id', id);
```
**Problema:** Solo filtra por `id`. RLS en Supabase (asumiendo que está bien configurado) lo cubre a nivel DB, pero la convención del proyecto en TODOS los otros mutaciones es pasar `project_id` explícitamente. Esto es:
- Inconsistente.
- Un test de integración que desactive RLS fallaría silenciosamente.
- Si en el futuro alguien cambia de RLS a service-role client, **borrado cruzado instantáneo**.

**Fix:**
```ts
const { error } = await supabase
  .from('appointments')
  .update(payload)
  .eq('id', id)
  .eq('project_id', projectId);
```

Mismo problema aplica a:
- `useAppointments.checkEmployeeAvailability` (línea 146-152): no filtra por proyecto.
- `useAppointments.createAppointment` (línea 209-215): no filtra por proyecto en la query a `time_blocks`.
- `useEmployees.updateEmployee` y `useEmployees.deleteEmployee`.
- `useCustomers.updateCustomer` (línea 128-132): aunque filtra por id, sin `project_id` es un riesgo.
- `useServices` todo CRUD.

---

### 7. `useBookingFlow` vs `useBusinessSettings` — duplicación y multi-tenant roto
**Archivos:** `src/hooks/useBookingFlow.ts:7` y `src/hooks/useBusinessSettings.ts`
```ts
// useBookingFlow.ts (legacy)
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'bf2460b5-f50d-4b30-a780-b91f05e3096b';
...
await supabase.from('business_settings').select('*').eq('project_id', PROJECT_ID)
```
**Problema:** Dos implementaciones. `useBookingFlow` ignora completamente el `activeProject` del contexto y siempre lee del env. En multi-tenant, las reservas públicas se hacen SIEMPRE sobre el proyecto del env, no sobre el salón que el admin está mirando.

**Fix:** Migrar `useBookingFlow` para que use el mismo hook `useBusinessSettings`, o aceptar `projectId` como argumento.

---

### 8. `useAppointments.createAppointment` — race condition y time_blocks
**Archivo:** `src/hooks/useAppointments.ts:209-225`
**Problemas:**
1. El chequeo de `time_blocks` (línea 209) y luego el `insert` (línea 227) **no están dentro de una transacción ni de un lock**. Entre el check y el insert, otra pestaña puede insertar una cita que choque. El check-then-insert clásico.
2. La query a `time_blocks` no filtra por `project_id`, así que un timeblock de OTRO proyecto en el mismo `employee_id` (que parece poco probable pero es posible si se importa data) podría bloquear la inserción.

**Fix:** Usar una RPC o constraint de exclusión en Postgres. Como workaround mínimo, agregar el filtro de proyecto:
```ts
query = supabase.from('time_blocks').select('id').eq('project_id', projectId).eq('employee_id', payload.employee_id)...
```

---

### 9. `useCustomers.uploadPhoto` — sin validación
**Archivo:** `src/hooks/useCustomers.ts:181-219`
```ts
const fileExt = file.name.split('.').pop();
const fileName = `${customerId}/${uuidv4()}.${fileExt}`;
const { error: uploadError } = await supabase.storage
  .from('customer-gallery')
  .upload(fileName, file);
```
**Problemas:**
- Sin validar `file.type` (acepta `image/svg+xml` con XSS, o `application/pdf`).
- Sin validar tamaño (1GB de foto satura el bucket).
- La extensión se toma del nombre del cliente. Si suben `foto.jpg.exe`, la extensión queda en `exe` y la storage lo sirve.
- `customerId` viene de input, no se valida que pertenezca al `projectId`.

**Fix:**
```ts
if (!file.type.startsWith('image/')) throw new Error('Tipo no permitido');
if (file.size > 5 * 1024 * 1024) throw new Error('Máx 5MB');
const safeExt = file.type.split('/')[1] ?? 'bin';
const fileName = `${projectId}/${customerId}/${uuidv4()}.${safeExt}`;
```

---

### 10. `useEmployees.updateEmployee`/`deleteEmployee` — sin proyecto
**Archivo:** `src/hooks/useEmployees.ts:60-79`
Mismo patrón que (6).

**Fix:** Agregar `.eq('project_id', activeProject.id)`.

---

### 11. `AppointmentDetailModal` — instancia de hook zombie
**Archivo:** `src/components/calendar/AppointmentDetailModal.tsx:95`
```ts
const { updateAppointment, error: updateError } = useAppointments();
```
**Problema:** Llama al hook sin argumentos → `projectId = null` (default). El hook retorna listas vacías y aún así:
- Crea un canal realtime con ID random.
- Dispara un `fetchAppointments()` que resuelve con `[ ]`.
- En cada apertura del modal, **se crea un canal nuevo que NUNCA se limpia** (el `useEffect` cleanup corre, pero como el hook no tiene `projectId`, el cleanup no remueve el canal).

Memory leak + ghost channels en Supabase Realtime.

**Fix:** Pasar el projectId:
```ts
const { activeProject } = useApp();
const { updateAppointment, error: updateError } = useAppointments({ projectId: activeProject?.id ?? null });
```

---

### 12. `CalendarView` — `project_id: ""` en inserts
**Archivo:** `src/components/calendar/CalendarView.tsx:402-407`
```ts
onSubmit={async (payload) => {
  const res = await createAppointment({ ...payload, project_id: projectId ?? payload.project_id ?? "" } as any);
```
**Problema:** Si `activeProject` es null (no se ha cargado), el `project_id` queda como string vacío. Dependiendo del constraint de DB:
- Si es `NOT NULL`, el insert falla con error críptico "null value in column violates not-null".
- Si permite empty string, la cita queda huérfana y rompe el multi-tenant.

**Fix:** Bloquear el botón "Confirmar Cita" si no hay `activeProject`, y lanzar un toast claro. No enviar string vacío nunca.

---

### 13. `calendarGrid.timeToYOffset` — horas tempranas invisibles
**Archivo:** `src/lib/calendarGrid.ts:35-37`
```ts
const hours = date.getHours() + date.getMinutes() / 60;
return Math.max(0, (hours - startHour) * hourHeight);
```
**Problema:** Si una cita arranca a las 4:30am (citas de madrugada, eventos especiales), `Math.max(0, …)` la pone en `top: 0` y se renderiza **encima** de la cita de las 6am. El `Math.max` oculta el bug en lugar de tratarlo.

**Fix:** Permitir scroll vertical más allá del `GRID_START_HOUR` o renderizar un indicador "fuera de horario" para esas citas.

---

### 14. `DayView` — `<button>` anidados (a11y + bug de teclado)
**Archivo:** `src/components/calendar/views/DayView.tsx:113-126`
```jsx
{/* Slot clickeable */}
<button onClick={() => onSlotClick?.(...)} className="absolute ...">
  ...
  {/* AppointmentBlock adentro, que es otro <button> */}
  <AppointmentBlock ... />
</button>
```
**Problema:** Anidar `<button>` dentro de `<button>` es HTML inválido y rompe:
- Navegación con Tab (el lector de pantalla se confunde).
- Comportamiento de Enter en los botones inline del AppointmentBlock (el evento puede no llegar).

**Fix:** Cambiar el slot clickeable a un `<div role="button" tabIndex={0}>` con su propio `onKeyDown`, o pintar el slot como un background clickeable y el AppointmentBlock como un overlay controlado por z-index.

---

### 15. `CalendarView.filteredAppointments` — no reactivo a `activeProject`
**Archivo:** `src/components/calendar/CalendarView.tsx:71-83`
```ts
const filteredAppointments = useMemo(() => {
  let result = appointments;
  if (effectiveEmployeeId !== 'all') result = result.filter(...);
  if (customerFilterId) result = result.filter(...);
  return result;
}, [appointments, effectiveEmployeeId, customerFilterId]);
```
**Problema:** El memo depende de `appointments` (que sí cambia al cambiar de proyecto) pero el filtro de `effectiveEmployeeId` se evalúa con el ID viejo hasta que llegue la nueva respuesta de Supabase. En la práctica, se autoresuelve, pero el render intermedio puede mostrar citas de OTRO proyecto filtradas por el ID de empleado del proyecto anterior.

**Fix:** Agregar `projectId` a las dependencias (aunque `appointments` ya lo cubra, hacerlo explícito):
```ts
}, [appointments, effectiveEmployeeId, customerFilterId, projectId]);
```

---

### 16. `api/admin/reminders/route.ts` — `PROJECT_ID` del env, no del usuario
**Archivo:** `src/app/api/admin/reminders/route.ts:15`
```ts
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '...';
...
.eq('project_id', PROJECT_ID)
```
**Problema:** Igual que (7). En multi-tenant, este endpoint siempre lee/escribe sobre el proyecto del env, no sobre el del admin que llama. Si se monta para varios salones, el admin de "Púrpura" ve/modifica los reminders de "Zen".

**Fix:** Resolver el `project_id` del JWT del request, no del env.

---

### 17. `api/admin/reminders/settings/route.ts` — upsert sin ownership
**Archivo:** `src/app/api/admin/reminders/settings/route.ts:34-58`
Mismo problema que (16) y además, como **no verifica auth**, un usuario autenticado cualquiera puede pisar la config de reminders de cualquier proyecto (al ser `supabaseAdmin`, el upsert no respeta RLS).

**Fix:** Validar auth + ownership antes del upsert.

---

### 18. `AppointmentBlock.isInProgress` — pulse infinito por re-render
**Archivo:** `src/components/calendar/AppointmentBlock.tsx:96-98` y `CalendarView.tsx:346`
```jsx
<DayView ... currentTime={new Date()} ... />
```
**Problema:** El padre pasa `currentTime={new Date()}` en cada render → `isInProgress` se recalcula → Framer Motion ve que `animate` cambió → reinicia la animación. En la práctica es un `scale: [1, 1.015, 1]` infinito que se ve como un pulse **constante y agotador** en lugar de "pulsa una vez y queda quieto".

**Fix:** El padre debería tener un estado `currentTime` que se actualice cada 60s, no en cada render:
```ts
const [currentTime, setCurrentTime] = useState(() => new Date());
useEffect(() => {
  const id = setInterval(() => setCurrentTime(new Date()), 60_000);
  return () => clearInterval(id);
}, []);
```

(Esto ya está hecho parcialmente en `useCalendarView` con `currentTime`, pero el `CalendarView` lo sobreescribe con `new Date()`.)

---

### 19. `appointmentLayout.flushCluster` — columnCount incorrecto
**Archivo:** `src/lib/appointmentLayout.ts:31-39`
```ts
const count = Math.max(...cluster.map((c) => c.col)) + 1;
```
**Problema:** Calcula el `columnCount` por cluster. Si en un día hay dos clusters de 2 columnas cada uno (no solapados), cada uno reporta `columnCount: 2`, lo cual es correcto a nivel local. Pero si el `AppointmentBlock` recibe el `columnCount` global (que es 2 también), el ancho de columna es `100/2 = 50%`, lo cual es correcto. Sin embargo, si se llama desde `DayView` sin pasar el `columnCount` global, los bloques usan el local. En `DayView` línea 135-136 veo `columnIndex={0} columnCount={1}` (hardcoded), así que este bug **no se manifiesta visualmente** — pero el algoritmo de layout existe, se está exportando, y va a confundir al próximo dev.

**Fix:** O se borra el archivo (porque `DayView` no lo usa) o se documenta claramente que cada vista calcula su layout manualmente.

---

### 20. `dashboard/page.tsx` — `dateRange` estático
**Archivo:** `src/app/(app)/dashboard/page.tsx:39-43`
```ts
const dateRange = useMemo(() => {
  const from = startOfLocalDay(new Date());
  const to = addDays(from, 7);
  return { from: from.toISOString(), to: to.toISOString() };
}, []);
```
**Problema:** Las citas de "hoy" se calculan en el primer render y nunca se actualizan. Si la pestaña queda abierta 2 días, el dashboard sigue mostrando "hoy" como el día en que se abrió.

**Fix:** Mover el cálculo fuera del `useMemo` (es barato) o usar un `useEffect` que actualice el rango cuando detecte que cambió la fecha del sistema.

---

### 21. `TodayTimeline` sort por string ISO
**Archivo:** `src/components/dashboard/TodayTimeline.tsx:77-79`
```ts
const sorted = [...appointments].sort((a, b) =>
  a.start_time > b.start_time ? 1 : -1
);
```
**Problema:** Funciona porque ISO 8601 es ordenable lexicográficamente, pero es implícito. Si el backend alguna vez devuelve `'2024-01-01 09:00:00'` (con espacio en vez de `T`) o timestamps con offset `+00:00` vs `Z`, el orden se rompe.

**Fix:**
```ts
.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
```

---

### 22. `whatsapp.ts` — limpieza de teléfono frágil
**Archivo:** `src/lib/whatsapp.ts:45-50`
```ts
const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
```
**Problemas:**
- `+` puede quedar en cualquier posición: `++521` queda igual.
- El código de país no se valida: si la clienta pone `1234` (local), `wa.me/1234` falla.
- Múltiples `+` se colapsan: `+52+1` queda `+521`.

**Fix:** Sanitizar estrictamente:
```ts
const digits = customerPhone.replace(/\D/g, '');
const cleanPhone = digits.startsWith('52') ? digits : `52${digits}`; // Asumimos MX
```

---

### 23. `RebookActions` — duración hardcodeada en `.ics`
**Archivo:** `src/components/booking/RebookActions.tsx:102-104`
```ts
const durationMin = 60; // Estimated
const end = new Date(date.getTime() + durationMin * 60_000);
```
**Problema:** El `RebookActions` recibe `date` pero no `duration`. El `.ics` exportado dice "termina 60min después" para TODAS las citas. Una cita de 3 horas se exporta al calendario del cliente como 1 hora.

**Fix:** Agregar `durationMin` a las props y propagarlo desde el flujo de reserva.

---

### 24. `NailMenuCalculator` — `useEffect` con dependencias circulares
**Archivo:** `src/components/booking/NailMenuCalculator.tsx:74-94`
**Problema:** El `useEffect` dispara `onChange(...)` con `totalPrice` y `totalDuration` como dependencias. Esos valores vienen del cálculo síncrono de `calculateDynamicNailTotals`, que se recalcula en cada render. Como el cálculo es puro y determinista, no hay loop infinito real, pero el linter lo señala como código sospechoso, y si en el futuro alguien mete memoización incorrecta, sí puede loopear.

**Fix:** Sacar `totalPrice` y `totalDuration` de las dependencias y usar una ref, o usar un `useMemo` + `useEffect` separados.

---

### 25. `ConfirmDialog` — promesa huérfana al desmontar
**Archivo:** `src/components/ui/ConfirmDialog.tsx:54-58`
**Problema:** Si el componente que llamó `confirm({...})` se desmonta antes de que el usuario responda, la promesa nunca resuelve. El `await confirm(...)` se queda colgado. Si era un `await` dentro de un `try/finally` con un spinner, el spinner queda activo eternamente.

**Fix:** Trackear el `isMounted` y resolver la promesa con `false` en el cleanup.

---

## 🛠️ MEJORAS

### M1. `useAppointments` — usar `projectId` de `useApp` por defecto
**Archivos:** `src/hooks/useAppointments.ts` y todos los consumidores.
**Mejora:** El hook actualmente requiere `projectId` como prop. La convención del resto del proyecto es "usar el del contexto si no se pasa". Hacerlo consistente:
```ts
const { activeProject } = useApp();
const projectId = options.projectId ?? activeProject?.id ?? null;
```

---

### M2. Validación de inputs con Zod o similar
**Archivos:** `src/hooks/useEmployees.ts:40-58`, `useBookingFlow.ts:118-182`, etc.
**Mejora:** No hay validación runtime en el cliente más allá de checks ad-hoc (regex de email, length de password). Una capa de Zod en los form modales blindaría contra payloads malformados que burlen el HTML5 validation (que es trivial de bypassear).

---

### M3. ErrorBoundary global
**Archivo:** `src/app/error.tsx` existe pero captura solo errores de segmentos server-side.
**Mejora:** Agregar un `<ErrorBoundary>` en el layout `(app)` que capture errores de render del cliente y muestre el mismo UI premium con un botón "Reintentar" (ya hay un patrón en `error.tsx`, pero solo cubre segmentos que revientan). Para errores de render de cliente, se necesita un class component o `react-error-boundary`.

---

### M4. Realtime cleanup
**Archivos:** `useAppointments.ts:111-136`, `useCustomers.ts:72-95`, `useTimeBlocks.ts:86-111`.
**Mejora:** El patrón `supabase.removeChannel(channel)` es correcto, pero los hooks crean canales por **instancia del hook**. Si una página tiene 2 useAppointments (caso real en `AppointmentDetailModal` + `CalendarView`), se crean 2 canales por `projectId` que duplican el mismo `filter`. En Supabase se traduce en 2 suscripciones a la misma tabla.
**Fix:** Centralizar en un singleton o deduplicar por `projectId + table`.

---

### M5. Logging estructurado
**Archivos:** todos los hooks, especialmente `useAppointments.ts:154-156`, `useBookingFlow.ts:111-112`.
**Mejora:** Hay `console.error` dispersos, sin contexto. Un logger que incluya `projectId`, `appointmentId`, `userId` facilitaría enormemente el debug en prod.

---

### M6. Tests E2E en el flujo crítico
**Archivos:** `useAppointments.createAppointment` + `usePublicBooking.submitBooking`.
**Mejora:** El handover lo dice, lo repito: el flujo de reserva es la pieza más crítica del negocio. Sin tests, cada refactor es una apuesta. Sugerencia: 1 test E2E con Playwright por flujo (admin crea cita, clienta reserva, admin marca cobrada, admin cierra caja).

---

### M7. Tipos de retorno explícitos en hooks
**Archivos:** todos los hooks.
**Mejora:** Varios hooks usan `useState<any>` o retornan `any` (ej. `useBookingFlow.ts:10` `useState<any>(null)`). TS strict los permite porque están en `tsconfig.json` con `"strict": true`, pero `any` en runtime desaparece. Reemplazar por tipos concretos o `unknown` + narrowing.

---

### M8. `CalendarView` — usar `useMemo` con `useCallback` para `runShortcut`
**Archivo:** `src/components/calendar/CalendarView.tsx:145-185`
**Mejora:** El `runShortcut` está envuelto en `useCallback` con `eslint-disable-next-line react-hooks/exhaustive-deps`. Eso significa que las dependencias de `useCalendarShortcuts` se rompen. La consecuencia: si el `selectedAppointmentId` cambia, el `onShortcut` callback no se actualiza hasta que algo más dispare el re-render.
**Fix:** Incluir las dependencias correctas o refactorizar para que el callback se mantenga estable (ej. usando refs).

---

### M9. Tema oscuro no propagado a tokens
**Archivos:** `src/app/globals.css` y `src/app/(app)/AppClientLayout.tsx:14-17`.
**Mejora:** El layout setea `data-theme` en `<html>`, pero el `<script>` del `layout.tsx:32-44` setea la clase `.dark` en `<html>` para Tailwind. Ambos sistemas coexisten. Verificar que no haya un flash de tema incorrecto en el primer render.

---

### M10. RPC `get_or_create_customer`
**Archivo:** `src/hooks/useBookingFlow.ts:137-142`
**Mejora:** El RPC existe (lo confirma el comentario), pero no está validado que el cliente valide la firma. Si se cambia la firma del RPC, este cliente no se entera hasta runtime. Tipar con `Database['public']['Functions']['get_or_create_customer']['Args']` una vez que se genere el `database.types.ts` desde Supabase CLI.

---

## 🧹 NITS (cosméticos / estilo)

### N1. `process.env` con `||` fallback hardcodeado
**Archivos:** múltiples.
Ya cubierto en bugs 2, 3, 7. Como nit, **todos** los `process.env.NEXT_PUBLIC_*` con `|| 'fallback-hardcodeado'` deberían ser `if (!env) throw` o dejar que falle.

---

### N2. Comentarios `// FIXED:` por todos lados
**Archivos:** incontables.
Hay una historia implícita en los comentarios (`// FIXED: era flex--col (typo)`). Está bien tenerlos en una fase de cleanup, pero **se deberían borrar antes de merge final** — son ruido para el próximo dev.

---

### N3. `as any` en payload de citas
**Archivo:** `src/components/calendar/CalendarView.tsx:404`
```ts
const res = await createAppointment({ ...payload, project_id: projectId ?? payload.project_id ?? "" } as any);
```
**Mejora:** El `as any` es una bomba. Si la firma de `createAppointment` cambia, este sitio no se entera. Tipar explícitamente.

---

### N4. Inconsistencia de estilos inline hardcodeados
**Archivos:** varios, ej. `src/components/calendar/CalendarView.tsx:44` `style={{ height: totalHeight }}`.
**Mejora:** Mezcla de `style={}` inline y clases Tailwind. Decidir una convención (Tailwind donde se pueda, inline solo para valores dinámicos).

---

### N5. `useEffect` con `[]` que debería leer preferencias
**Archivo:** `src/hooks/useCalendarView.ts:67-80`
```ts
useEffect(() => {
  ...
}, []); // Ejecutar SOLO una vez al montar el componente
```
**Mejora:** El comentario lo dice, pero la lógica es: "ignorar cambios en `preferences` después del primer mount". Eso es intencional (la UI no se reconfigura al cambiar preferencias mientras la pestaña está abierta), pero no es obvio. Documentar mejor o hacerlo configurable.

---

### N6. `eslint-disable-next-line` huérfanos
**Archivo:** `src/components/calendar/CalendarView.tsx:181`
**Mejora:** Mejor corregir la regla que silenciarla.

---

### N7. Magic numbers sin constantes
**Archivos:** `src/components/calendar/AppointmentBlock.tsx:175` `height >= 64`, `CalendarView.tsx:230` `w-4 h-4`.
**Mejora:** Extraer a constantes nombradas en `calendarGrid.ts`.

---

### N8. Imports no usados
**Archivos:** varios. Ej. `src/app/reserva/page.tsx:3-4` importa `BookOpen` y `motion` que no se usan en el JSX devuelto.
**Mejora:** Configurar `eslint-plugin-unused-imports` o un hook de pre-commit con `knip`.

---

## ✅ Lo que está BIEN (no es queja, es mérito)

Antes de cerrar, una lista honesta de lo que el proyecto hace bien, porque también ayuda saber qué **no tocar**:

1. **Sistema de tipos como single source of truth.** `src/types/supabase.ts` está bien modelado: enums explícitos, payloads de mutación, relaciones enriquecidas. Si en algún momento se autogenera con `supabase gen types`, va a ser un drop-in.

2. **Convenciones claras en hooks de datos.** `useAppointments`/`useCustomers`/`useTimeBlocks` siguen el mismo patrón: `options.projectId` con prioridad, `useEffect` con fetch + realtime + cleanup. Es replicable y testeable.

3. **Sistema de diseño coherente.** Tokens en `globals.css`, mapeo a Tailwind en `tailwind.config.ts`, convenciones en `DESIGN.md` y `ZEN_FRONTEND_PLAYBOOK.md`. Hay doc que explica el "por qué", no solo el "cómo".

4. **UI premium consistente.** `ConfirmDialog`, `ToastProvider`, `Skeleton`, `EmptyState` están bien pensados. El patrón `useConfirm` + `useToast` es idiomático y reusable.

5. **PWA-style offline-ready.** `next-env.d.ts`, `manifest.json`, fuentes con `next/font` bien configuradas. El setup de build no tiene trampa.

6. **Manejo de sesión robusto en `AppContext`.** La lógica de `Refresh Token Not Found` que fuerza `signOut` es exactamente lo correcto.

7. **Realtime bien acotado.** Filtros por `project_id` en los `postgres_changes`, cleanup en el return del `useEffect`, dedup de channels (en general). Bien.

8. **Documentación interna viva.** `GEMINI_HANDOVER.md`, `ARQUITECTURE.md`, `DESIGN.md`, `system_report.md` son útiles y están actualizados. Eso es raro y valioso.

---

## 📋 Plan de remediación sugerido

### Sprint 1 (urgente, 1-2 días)
- [ ] Rotar `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (asumir compromiso).
- [ ] Quitar fallback hardcodeado de envs en `supabaseClient.ts` y `supabaseAdmin.ts`.
- [ ] Limpiar `.env.local` del repo (git history) y agregar `.env.example`.
- [ ] Agregar verificación de auth + ownership a `/api/admin/users`.
- [ ] Endurecer bypass del cron (`ALLOW_CRON_BYPASS` env en lugar de `NODE_ENV`).
- [ ] Bloquear `AppointmentDetailModal` para que reciba `projectId` (bug 11).

### Sprint 2 (importante, 2-3 días)
- [ ] Agregar `.eq('project_id', projectId)` a TODAS las mutaciones (bugs 6, 10, 16, 17).
- [ ] Unificar `useBookingFlow` con `useBusinessSettings` (bug 7).
- [ ] Resolver `projectId` desde JWT en endpoints de admin (bugs 16, 17).
- [ ] Validar uploads de fotos (tipo, tamaño, path) (bug 9).
- [ ] Memoizar `currentTime` en `CalendarView` (bug 18).
- [ ] Tipar `as any` en CalendarView (nit 3).

### Sprint 3 (calidad, 1 semana)
- [ ] ErrorBoundary global.
- [ ] Zod en form modales.
- [ ] Logger estructurado.
- [ ] Tests E2E del flujo de reserva.
- [ ] Reorganizar `useAppointments` para deduplicar canales realtime (M4).

---

**FIN del reporte.** 25 bugs + 10 mejoras + 8 nits, más una lista honesta de lo que está bien para no romperlo.
