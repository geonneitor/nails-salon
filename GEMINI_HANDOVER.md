# GEMINI_HANDOVER.md — Plan de Implementación Continua con Gemini Pro

> **Propósito de este documento:** instruir a Gemini Pro (o a cualquier modelo de IA de Google) para que continúe la implementación del plan "Better than Booksy / Fresha" aprobado en `C:\Users\USER END\.claude\plans\robust-wandering-bonbon.md`. Contiene el estado actual, las decisiones ya tomadas (D1–D4), los archivos tocados, los pendientes, y el flujo exacto de pasos que debe ejecutar Gemini para terminar Tier 2.2, Tier 2.3, Tier 3, y la verificación end-to-end.
>
> **NO** reescribir el plan desde cero. Leer este documento primero, luego abrir el plan, luego leer los archivos clave listados en §6, y solo entonces empezar a editar.

---

## 1. Resumen ejecutivo del proyecto

- **Producto:** Sistema de gestión (SaaS interno) para dos salones de uñas. En este repositorio solo está **Zen**. Purpura Nails es un proyecto separado para una migración futura — **no** unificar ahora.
- **Stack inmutable:**
  - Next.js 14+ con App Router y TypeScript estricto.
  - Tailwind CSS con tokens de diseño personalizados (NO introducir un nuevo design system).
  - Supabase (PostgreSQL, RLS, Realtime vía `postgres_changes`).
  - Framer Motion para animaciones.
  - `date-fns` para fechas, `lucide-react` para íconos.
- **Diferenciador declarado:** *premium feel*. La competencia (Booksy / Fresha / Vagaro / Mindbody / Boulevard / GlossGenius / Acuity) debe verse peor que esta app. Por eso los tokens y la tipografía (Libre Caslon Text + Manrope) son innegociables.
- **Horizonte:** terminar en **2 días**. No refactors profundos. No nuevas dependencias. No payment gateway. No SMS. No app nativa.
- **Idioma de UI:** español de México (es-MX). Moneda: MXN. Zona horaria: `America/Mexico_City`.

---

## 2. Decisiones cerradas (NO renegociar)

| ID | Decisión | Lo que significa para el código |
|---|---|---|
| **D1** | WhatsApp vía deep-link `wa.me` (opción c) | NO usar Meta WhatsApp Business API, NO usar relay de pago. El "envío" es abrir un `https://wa.me/<phone>?text=<msg>` con el mensaje pre-llenado. |
| **D2** | Columna nueva `payment_status` en `appointments` | Enum: `unpaid \| advance \| paid`. Default `unpaid`. El campo `status` viejo se conserva para el flujo de la cita (pending/confirmed/completed/cancelled/no_show/free). Son ortogonales. |
| **D3** | Cierre de caja como mensaje de WhatsApp | NO generar PDF. NO imprimir. Solo texto pre-llenado vía `wa.me`. |
| **D4** | NO realtime en `/reserva` para la clienta | El realtime ya está en `/calendar` y `/dashboard` (vía `useAppointments`). El sitio público de reserva NO se suscribe a cambios. |

Cualquier desviación de estas 4 decisiones debe ser aprobada por el humano antes de tocar código.

---

## 3. Estado actual (lo que ya está shipped)

### 3.1 Tier 1 — completado
- **1.1 Calendar realtime + keyboard + inline status** ✅
  - `src/hooks/useCalendarShortcuts.ts` (NEW)
  - `src/components/calendar/AppointmentBlock.tsx` (REWRITTEN)
  - `src/components/calendar/CalendarView.tsx` (MODIFIED)
  - `src/components/calendar/views/DayView.tsx`, `WeekView.tsx` (MODIFIED — `selectedAppointmentId` prop)
- **1.2 Rebook actions en pantalla de éxito** ✅
  - `src/components/booking/RebookActions.tsx` (NEW) — `.ics` + `tel:` + `wa.me`
  - `src/components/home/ZenBookingJourney.tsx` (MODIFIED — inyecta `<RebookActions>`)
- **1.3 Recordatorios de WhatsApp** ✅
  - `supabase/migrations/20260613000000_appointment_reminders.sql` (NEW — tabla + trigger + outbox + settings)
  - `src/app/api/cron/reminders/route.ts` (NEW — Vercel-cron, con bypass `?dev=1` en NODE_ENV!=production)
  - `src/app/api/admin/reminders/route.ts` (NEW — GET/POST)
  - `src/app/api/admin/reminders/settings/route.ts` (NEW — GET/PUT)
  - `src/hooks/useAppointmentReminders.ts` (NEW)
  - `src/components/calendar/ReminderBadge.tsx` (NEW)
- **1.4 Dashboard morning brief** ✅
  - `src/components/dashboard/KpiCard.tsx` (NEW)
  - `src/components/dashboard/AlertList.tsx` (NEW)
  - `src/components/dashboard/TodayTimeline.tsx` (NEW)
  - `src/app/(app)/dashboard/page.tsx` (REWRITTEN)

### 3.2 Tier 2 — parcial
- **2.1 Services live preview** ✅
  - `src/components/services/ServicePreviewCard.tsx` (NEW)
  - `src/components/services/ServiceList.tsx` (MODIFIED — callbacks `onVariantEdited`/`onModifierEdited`)
  - `src/app/(app)/services/page.tsx` (REWRITTEN — split 60/40)
- **2.2 Caja (cash close)** — parcialmente iniciado, **incompleto**
  - `supabase/migrations/20260613010000_payment_status_and_daily_closings.sql` (NEW — D2 + tabla `daily_closings`)
  - `src/app/(app)/caja/page.tsx` (NEW — **PERO con campos fantasma que NO existen en DB**)
  - `src/components/layout/Sidebar.tsx` (MODIFIED — enlace `/caja` con ícono `Wallet`)
  - `src/components/layout/MobileNav.tsx` (MODIFIED — enlace `/caja`)
  - `src/types/supabase.ts` (MODIFIED — añadido `PaymentStatus`, `payment_status` en `Appointment`, en `UpdateAppointmentPayload`)
  - `src/hooks/useBusinessSettings.ts` (REFERENCIADO PERO **NO EXISTE** — debe crearse)
- **2.3 Client profile polish** ⏳ PENDIENTE
- **3 Polish (animaciones, empty states, dark mode)** ⏳ PENDIENTE
- **End-to-end verification (7 pasos)** ⏳ PENDIENTE

---

## 4. Trabajo pendiente para Gemini (orden estricto)

### Paso A — Resolver inconsistencias del trabajo de Tier 2.2 (CRÍTICO, hacer primero)

**A.1** La página `/caja` referencia `useBusinessSettings` que **no existe** como hook. Gemini debe decidir entre:
- (a) Crear `src/hooks/useBusinessSettings.ts` envolviendo el fetch que ya hace `useBookingFlow` y `BusinessSettings.tsx`, o
- (b) Quitar la dependencia y leer `business_settings` directamente con `useEffect` + `supabase.from('business_settings')` dentro de la página Caja.
  → **Recomendación: opción (a)** porque DRY y porque así el resto de la app también puede consumirlo.

**A.2** La página Caja referencia `businessSettings.salon_name` y `businessSettings.salon_phone`, pero la tabla `business_settings` actualmente solo tiene `max_employees`, `opening_hour`, `closing_hour`, `working_days`. **Gemini debe**:
  1. Crear `supabase/migrations/20260613010001_business_settings_salon_fields.sql` con `ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS salon_name TEXT, ADD COLUMN IF NOT EXISTS salon_phone TEXT, ADD COLUMN IF NOT EXISTS salon_whatsapp TEXT, ADD COLUMN IF NOT EXISTS salon_address TEXT, ADD COLUMN IF NOT EXISTS salon_logo_url TEXT;`
  2. Actualizar `src/components/settings/BusinessSettings.tsx` para que la UI permita editar esos campos (un bloque nuevo "Identidad del salón" con name, phone, whatsapp, address, logo URL).
  3. Verificar que la política RLS de `business_settings` permita UPDATE a admins (ya está en la migración `20260612000000_secure_admin_policies.sql`).
  4. En `src/app/(app)/caja/page.tsx`, leer esos campos de forma defensiva: `businessSettings?.salon_name ?? activeProject?.name ?? 'Zen'`.

**A.3** La página Caja hace `await import('@/lib/supabaseClient')` dentro de los handlers. Gemini debe **extraer** el import al top del archivo. Es feo y rompe la convención del resto del proyecto.

**A.4** La query a `daily_closings` está dentro de un `useEffect` con `(await import(...))`. Mover a un `useEffect` con import estático arriba.

**A.5** Verificar que `useToast` provee `info`, `success`, `error`. Si no, ajustar a los métodos que sí existan.

### Paso B — Completar Tier 2.2 (Caja) verificación

**B.1** Correr el typecheck:
```bash
cd "C:\Users\USER END\Desktop\web_local" && npx tsc --noEmit -p . 2>&1 | head -80
```
Si hay errores en `caja/page.tsx` o `supabase.ts`, corregirlos antes de seguir.

**B.2** Verificar manualmente el flujo Caja:
- Sin proyecto activo → mostrar empty state, no crashear.
- Con proyecto y sin citas hoy → mostrar empty state con CTA al calendario.
- Con citas → el ciclo de click en una tarjeta debe alternar `paid → advance → unpaid → paid`. La suma de KPIs debe recalcularse en tiempo real (gracias al realtime de `useAppointments`).
- Botón "Cerrar caja" debe crear una fila en `daily_closings` con `closing_date = YYYY-MM-DD` y mostrar el snapshot.
- Botón "Compartir resumen" debe abrir `wa.me` con el texto correcto.

### Paso C — Tier 2.3 (Client profile polish)

**Archivos a leer primero:**
- `src/app/(app)/customers/page.tsx` (lista actual)
- `src/app/(app)/client-agenda/[clientId]/page.tsx` (ficha actual)
- `src/hooks/useCustomers.ts`
- `src/types/supabase.ts` (recordar el campo `Customer` con `allergies`, `color_formulas`, `visit_count`, `birthday`)

**Tareas:**
1. Crear `src/components/customers/ClientHeader.tsx`:
   - Avatar grande con la inicial del nombre (estilo glassmorphism).
   - Nombre + teléfono (tappable → `wa.me`/`tel:`).
   - "Clienta desde X" (usar `created_at`) y "Nº de visitas" (usar `visit_count`).
2. Crear `src/components/customers/ClinicalCard.tsx`:
   - Tarjeta glassmorphism con `allergies` y `color_formulas` (si existen, sino estado vacío elegante).
   - Botón de edición inline (lápiz) que abre un mini-modal o inline-edit con Supabase update.
3. En `src/app/(app)/customers/page.tsx`:
   - Añadir un input de búsqueda por **fragmento de teléfono** (caso de uso: admin en salón busca "el número de la clienta"). Filtrado en cliente, sin nueva query.
   - Añadir orden por "última visita" usando el campo derivado de la última cita (o contar citas vía `appointments`).
4. En `src/app/(app)/client-agenda/[clientId]/page.tsx`:
   - Reemplazar el header existente con `<ClientHeader>`.
   - Reemplazar la sección clínica con `<ClinicalCard>`.

### Paso D — Tier 3 (Polish)

**D.1 Micro-animaciones del booking journey:**
- `src/components/home/steps/ServiceStep.tsx`: cuando se selecciona una card, levantarla (`y: -2`), rotar el ícono 4°, fade-in del precio.
- `src/app/(app)/calendar/page.tsx` o el componente que monta el grid: el día seleccionado debe deslizarse (no saltar) entre fechas.
- `src/app/reserva/page.tsx` (paso de éxito): un checkmark SVG hecho a mano que se dibuja con `pathLength` de Framer Motion al montar.

**D.2 Empty states que no parecen vacíos:**
- `src/components/calendar/EmptyDay.tsx` (NEW): ilustración SVG simple (una uña estilizada), mensaje suave, CTA "Crear cita".
- Mismo patrón en `customers/page.tsx` (sin clientas), `services/page.tsx` (sin servicios), `caja/page.tsx` (sin citas hoy — ya está, verificar tono).
- `dashboard/page.tsx` ya tiene uno, dejarlo o copiar el estilo.

**D.3 Dark mode nativo:**
- `src/components/ui/ThemeToggle.tsx` ya existe (verificar). El toggle debe persistir en `localStorage` además de `user_preferences.theme` en DB.
- Auditar `src/app/globals.css`: los tonos botánicos y los acentos dorados deben verse bien en ambos modos. El shimmer de los botones primarios debe usar `currentColor`, no colores fijos.
- En `src/app/(app)/AppClientLayout.tsx` ya se aplica `data-theme` a `<html>`; verificar que las clases Tailwind de los componentes respeten el selector `[data-theme="zen-dark"]` o equivalente.

### Paso E — End-to-end verification (7 pasos del plan)

Gemini debe **correr** (no solo describir) cada paso del plan y reportar pass/fail:

1. **Admin flow** — login → `/dashboard` KPIs animan → click KPI → filtra `/calendar` → realtime propaga cambios entre 2 pestañas → marcar pendiente como confirmada inline → toast confirma → `/caja` muestra el nuevo pill.
2. **Customer flow** — incognito → `/reserva` → completa reserva → pantalla de éxito con 3 pills rebook → "Añadir a calendario" descarga `.ics` con datos correctos → abrir `.ics` → evento aparece en app de calendario del sistema.
3. **Reminder flow** — crear cita para mañana → verificar `appointment_reminders` tiene 1 fila `pending` con `send_at ≈ start_time - 24h` → trigger manual `GET /api/cron/reminders?dev=1` → fila marcada `sent` → entrada en `notifications_outbox`.
4. **Multi-admin test** — 2 perfiles admin en mismo calendario → A crea cita → B la ve en <1s → ambos intentan confirmar la misma cita → last-write-wins o ambos succeed sin error 500.
5. **Reduced motion + dark mode** — toggle macOS reduce motion → animaciones degradan a fades simples → toggle dark mode → cada página sigue premium, no grises invertidos.
6. **Performance** — Lighthouse en `/dashboard` y `/reserva` ≥ 90 en las 4 categorías. Realtime solo se abre cuando el usuario está en `/calendar`.
7. **Accessibility** — recorrido solo con teclado del booking flow: Tab al primer servicio, Enter para abrir, flechas para elegir variante, Enter para confirmar, Tab a addons, etc. Todo interactivo debe ser alcanzable.

**Si algún paso falla, NO seguir.** Arreglar y re-correr.

---

## 5. Convenciones de código del proyecto (respetar siempre)

### 5.1 Idioma y tono
- **Comentarios en español** cuando expliquen lógica de negocio, en inglés cuando sean técnicos triviales (`// Loop over the array` → omitir).
- **Strings visibles al usuario en español (es-MX).** Moneda: `$1,234 MXN`. Fechas: `dd 'de' MMMM`. Usar `date-fns/locale/es`.
- **No traducir** nombres de tablas o campos de DB.

### 5.2 Estilo de componentes
- `'use client'` arriba del archivo si usa hooks/state.
- Comentario de cabecera con `// ===` que explique el archivo en 3-6 líneas. Ejemplo:
  ```tsx
  'use client';
  // ============================================================
  // CajaPage — Cierre de caja del día (cobrado / adelanto / pendiente).
  // El admin clicka cada cita para ciclar su payment_status.
  // ============================================================
  ```
- Componentes nombrados en PascalCase exportados, default export solo para `page.tsx`.
- Subcomponentes al final del archivo o en `src/components/<feature>/<Component>.tsx`.
- No usar barrel files (`index.ts`) — el proyecto no los usa.

### 5.3 Tokens de Tailwind
- **Colores:** `bg-primario-zen`, `bg-gold-primary`, `bg-gold-dark`, `bg-lavender-primary`, `bg-botanical-1`, `bg-secundario-zen`, `bg-fondo-zen`. NO inventar hex.
- **Tipografía:** `font-serif` (Libre Caslon Text), `font-sans` (Manrope).
- **Sombras:** `shadow-soft-shadow`, `shadow-gold-glow`. NO `shadow-md` plano.
- **Glassmorphism:** clase `card-depth` (definida en `globals.css`). Usarla para tarjetas principales.
- **Botones primarios:** pill (`rounded-full`) `bg-primario-zen text-fondo-zen` con shimmer en hover (animación `shimmer` en `globals.css`).
- **Botones secundarios:** pill `bg-secundario-zen/30 text-primario-zen` o outlined con borde fino.
- **Ornamento editorial:** para separar secciones usar:
  ```tsx
  <div className="flex items-center gap-3" aria-hidden>
    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-primary/30 to-gold-primary/30" />
    <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold-primary">
      <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" opacity="0.55" />
    </svg>
    <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-primary/30 to-gold-primary/30" />
  </div>
  ```

### 5.4 Hooks custom
- Un hook por archivo. Nombre `use<Thing>`. Retornar objeto con nombres, no array.
- Errores: exponer `error: string | null`, nunca lanzar.
- Loading: exponer `isLoading: boolean`.

### 5.5 Realtime
- Ya viene gratis en `useAppointments` (filtra por `project_id`). No añadir un segundo canal.
- Si necesitas subscribirte a otra tabla, usar el mismo patrón:
  ```ts
  const channel = supabase
    .channel(`<tabla>_<projectId>_<random>`)
    .on('postgres_changes', { event: '*', schema: 'public', table: '<tabla>', filter: `project_id=eq.${projectId}` }, () => fetch())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
  ```

### 5.6 Migraciones
- Naming: `YYYYMMDDHHMMSS_descripcion_corta.sql`.
- Cada migración: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
- RLS: habilitar + política. Admin: `USING (public.is_admin()) WITH CHECK (public.is_admin())`. Employees (read): `FOR SELECT TO authenticated USING (true)`.
- No usar `DROP TABLE` — solo `DROP POLICY IF EXISTS` para idempotencia.

---

## 6. Archivos clave a leer antes de editar

Gemini **debe** leer estos archivos en este orden antes de tocar cualquier cosa:

1. `C:\Users\USER END\.claude\plans\robust-wandering-bonbon.md` — el plan completo.
2. `src\app\globals.css` — tokens de diseño. **NO romper.**
3. `src\types\supabase.ts` — fuente única de tipos.
4. `src\context\AppContext.tsx` — proyecto activo, sesión, preferencias.
5. `src\hooks\useAppointments.ts` — citas + realtime.
6. `src\hooks\useDynamicServices.ts` — menú dinámico.
7. `src\hooks\useBookingFlow.ts` — flujo público.
8. `src\components\ui\ToastProvider.tsx` — sistema de toasts.
9. `supabase\migrations\20260613000000_appointment_reminders.sql` — ejemplo de migración completa con RLS + trigger.
10. `supabase\migrations\20260613010000_payment_status_and_daily_closings.sql` — la migración de Caja (D2 + daily_closings).
11. `src\app\(app)\caja\page.tsx` — el trabajo incompleto que hay que terminar.

---

## 7. Entorno, comandos y herramientas

### 7.1 Sistema
- Windows 11 con PowerShell 7+ (terminal primaria) y Git Bash disponible.
- Node 20.x (verificar con `node --version`).
- npm (no pnpm, no yarn — `package.json` usa npm).

### 7.2 Variables de entorno
- `.env.local` debe tener:
  - `NEXT_PUBLIC_SUPABASE_URL=...`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...` (usado por `supabaseAdmin`)
  - `CRON_SECRET=...` (usado por `/api/cron/reminders`; en dev se puede omitir y usar `?dev=1`)
  - `NEXT_PUBLIC_PROJECT_ID=bf2460b5-f50d-4b30-a780-b91f05e3096b` (default, ya en código).

### 7.3 Comandos clave (PowerShell syntax)
```powershell
# Typecheck
cd "C:\Users\USER END\Desktop\web_local"
npx tsc --noEmit -p . 2>&1 | Select-Object -First 80

# Lint
npx next lint

# Dev server
npm run dev

# Build (verifica que las migraciones referenciadas no rompan tipos)
npm run build

# Aplicar migraciones nuevas (manual, con supabase CLI si está instalada)
# Si no, abrir Supabase Studio → SQL editor y pegar el .sql
```

### 7.4 Cómo probar el cron en dev
```powershell
# Levanta el dev server primero (npm run dev en otra ventana)
curl "http://localhost:3000/api/cron/reminders?dev=1"
# Debe devolver { ok: true, processed: 0 } si no hay reminders pendientes
```

### 7.5 Cómo aplicar una migración
- **Opción A (manual):** abrir `https://app.supabase.com/project/<id>/sql/new`, pegar el SQL, run.
- **Opción B (CLI):** `npx supabase db push` (requiere `supabase` linkeado al proyecto).

---

## 8. Lo que Gemini NO debe hacer (anti-patrones explícitos)

1. **No instalar dependencias nuevas** sin pedir. La lista actual basta. Si necesitas una, propón y espera aprobación.
2. **No crear un nuevo sistema de colores** ni nuevos tokens en `globals.css`. Si necesitas un tono, usa uno existente con `/opacity`.
3. **No reescribir** `NailMenuCalculator.tsx` ni los 7 `calculator/*Section.tsx`. Esos archivos son críticos y ya funcionan.
4. **No romper** el contrato de `useDynamicServices` ni de `useAppointments`. Si necesitas un método nuevo, añádelo, no modifiques los existentes.
5. **No meter `any`** en TypeScript. Si no puedes inferir un tipo, declara una `interface` local.
6. **No usar `useEffect` para estado derivable**. Si el valor sale de props/state, calcúlalo con `useMemo`.
7. **No meter `await import(...)` dentro de handlers** (ya quedó uno en Caja — limpiar).
8. **No ignorar errores** silenciosamente. Si algo puede fallar, exponerlo en `error: string | null` y mostrar toast.
9. **No usar emojis en el código** salvo en strings visibles al usuario (whatsapp, copy de marketing). En logs y comentarios, no.
10. **No borrar archivos existentes** sin confirmar con el humano.

---

## 9. Mi opinión sobre el proyecto (Claude → humano)

Honestamente, esta app tiene un **núcleo sólido** que la mayoría de competidores no tienen: tokens de diseño consistentes, una capa de datos limpia (multi-tenant vía `projects`, RLS maduro, realtime ya en appointments), y un dominio bien modelado (allergies, color_formulas, ticket_details). El Tier 1 que ya shipped la pone por encima de Booksy en UX diaria — los atajos de teclado, el highlight en vivo, el `.ics` y el deep-link wa.me son cosas que Booksy **no** tiene y que un admin usa 30+ veces al día.

**Donde hay que tener cuidado:**

1. **Caja está al 50%.** El layout y los componentes están, pero depende de campos que no existen en DB y de un hook que no existe. Es trabajo de 30-60 min para Gemini si sigue el Paso A de §4.
2. **`business_settings` está subutilizado.** Solo guarda horarios y días. Para que Caja pueda enviar el wa.me correcto y la client profile muestre el header, hay que añadir `salon_name`, `salon_phone`, `salon_whatsapp`, `salon_address`, `salon_logo_url`. También 30 min.
3. **El onboarding de Purpura** va a ser un dolor. El código está lleno de `PROJECT_ID` hardcodeado en `useBookingFlow.ts:7` (debería leerse del contexto `useProject`). Esto **no** es para esta entrega, pero anótalo para el PR de Purpura.
4. **Falta una política de error global.** Si una query falla, el componente renderiza vacío y el admin no sabe por qué. Vale la pena un `<ErrorBoundary>` global que muestre el error con un botón "Reintentar" — pero está fuera del scope de este plan.
5. **El dark mode no está completo.** Hay tokens pero no todos los componentes los respetan. Tier 3.3 va a descubrir 5-10 lugares donde hay colores hardcodeados que no cambian. No es bloqueante, pero va a requerir paciencia.
6. **No hay tests.** Para un SaaS de pagos, eso me preocupa. No automatices sin pedir, pero anota que el flujo de Caja y el de cerrar-caja merecen tests E2E con Playwright en una iteración futura.
7. **El admin va a querer exportar clientes a Excel en 2 semanas.** Anótalo como Tier 4: hook `useCustomersExport` que serializa a CSV usando `Blob` + `URL.createObjectURL`. 1 hora de trabajo.

**Lo que más me emociona:** el patrón de "vista de la clienta en vivo" en `/services` (Tier 2.1) es el tipo de feature que diferencia a Zen de Booksy. Booksy te deja editar precios a ciegas. Zen te muestra el efecto en tiempo real. Eso es **diseño de producto**, no feature count. Si Gemini mantiene ese nivel en Tier 2.3 (client profile) y Tier 3 (animations/empty states), la app va a estar en otro nivel.

**Lo que menos me emociona:** el cron de WhatsApp. D1c funciona pero es un placeholder. Cuando el negocio crezca, van a querer relays automáticos, y entonces todo el código del cron va a tener que reescribirse. Lo documenté en el comentario del archivo, pero la deuda está ahí.

---

## 10. Plantilla de reporte que Gemini debe entregar al final

Al terminar todos los pasos de §4, Gemini debe responder con este formato:

```
## Reporte de cierre — Tier X.Y

### Cambios realizados
- [archivo:linea] descripción corta
- ...

### Verificación
- [ ] Typecheck: PASS/FAIL (pegar output)
- [ ] Paso 1 (admin flow): PASS/FAIL
- [ ] Paso 2 (customer flow): PASS/FAIL
- [ ] Paso 3 (reminder flow): PASS/FAIL
- [ ] Paso 4 (multi-admin): PASS/FAIL
- [ ] Paso 5 (reduced motion + dark): PASS/FAIL
- [ ] Paso 6 (Lighthouse): PASS/FAIL (pegar scores)
- [ ] Paso 7 (a11y): PASS/FAIL

### Issues encontrados
- [archivo:linea] descripción + fix propuesto

### Decisiones que requieren aprobación humana
- ...

### Sugerencias para Tier 4
- ...
```

---

**FIN del documento.** Gemini: lee §1–§5 antes de pedir aclaración. Si después de leer §6 sigues con dudas, pregunta antes de editar. El humano está disponible pero no va a aprobar cambios que rompan D1–D4 o las convenciones de §5.
