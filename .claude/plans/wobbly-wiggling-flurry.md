# Plan de Pulido Final — Zen Nail Salon

## Contexto

El proyecto es un sistema de gestión de citas para un salón de uñas premium. Hoy está **funcionalmente completo y con buena base visual**, pero tiene **30+ hallazgos** entre bugs visibles, inconsistencias de diseño, deuda técnica y una grieta seria de seguridad en BD. El objetivo es dejarlo **listo para entregar a la clienta**: pulido, consistente, con errores manejados de forma profesional, y con la arquitectura limpia para que la clienta pueda operarlo sin tropiezos.

**Decisiones ya acordadas con el usuario:**
1. La fase 1 (la que arrancamos primero) es **Diseño + UX** — toasts, modales estilizados, eliminación de `alert/confirm/console.log`, unificación de tokens, refactor de la landing.
2. La landing `(site)/page.tsx` se va a **refactorizar para reutilizar los componentes de `/home/`**, no para mantener la paleta hardcoded.
3. La política de Supabase se queda con anon para reservas públicas **pero** con una migración nueva que acota los permisos (Fase 2).
4. Los mensajes de error serán **siempre en español, amigables**, con el detalle técnico solo en `console.error` para devs.

El plan se divide en **3 fases incrementales**. Cada fase es entregable y verificable de forma independiente, así si en algún punto hay que pausar, lo que ya está queda útil.

---

## Fase 1 — Pulido de diseño y UX (lo que arranca ahora)

**Meta:** la clienta abre el sistema y todo se ve coherente, profesional y sin "saltos" de calidad.

### 1.1 Sistema de toasts (elimina todos los `alert/console.log`)

**Archivos nuevos:**
- `src/components/ui/Toast.tsx` — componente de notificación con `motion`, posición bottom-right en desktop / top en móvil, tipos `success | error | info | warning`, auto-dismiss configurable, botón cerrar.
- `src/components/ui/ToastProvider.tsx` — context + hook `useToast()` con API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`, `toast.warning(msg)`.
- `src/components/ui/ConfirmDialog.tsx` — modal de confirmación estilizado (reemplaza `confirm()` nativo). API: `confirm({ title, message, confirmLabel, danger }) => Promise<boolean>`.

**Archivos modificados:**
- `src/app/layout.tsx` — envolver con `<ToastProvider>`.
- `src/middleware.ts` — sin cambios.

**Sustituciones (los 7+ `alert()` y 4+ `confirm()`):**
| Archivo | Línea | Reemplazo |
|---|---|---|
| `src/components/calendar/CalendarView.tsx` | 168, 172, 178 | eliminar `console.log` |
| `src/components/customers/CustomerDetailModal.tsx` | 105 | `<ConfirmDialog>` |
| `src/components/customers/CustomerList.tsx` | al eliminar clienta | `<ConfirmDialog>` |
| `src/components/services/ServiceCard.tsx` | 35 | `<ConfirmDialog>` |
| `src/components/services/ServiceList.tsx` | al fallar delete | `toast.error` |
| `src/components/dashboard/page.tsx` | 180 | abrir `CustomerDetailModal` con la clienta en vez de `alert` |
| `src/components/calendar/AppointmentDetailModal.tsx` | 142 | `toast.warning` "El cliente no tiene teléfono" |
| `src/components/settings/BusinessSettings.tsx` | 51, 53 | `toast.success` / `toast.error` |
| `src/components/settings/ProjectList.tsx` | 80 | `<ConfirmDialog>` |
| `src/components/settings/EmployeeFormModal.tsx` | 31 | `toast.error` |
| `src/app/forgot-password/page.tsx` | (varios) | `toast.success` / `toast.error` |
| `src/app/reset-password/page.tsx` | (varios) | `toast.success` / `toast.error`; corregir `router.push('/')` → `router.push('/login')` |

**Verificación:** navegar toda la app, intentar cada acción destructiva y cada error, confirmar que toasts se ven en lugar de alerts nativos.

### 1.2 Unificar paleta: tokens semánticos del MD3

El `tailwind.config.ts` ya define `surface`, `primary`, `on-surface`, etc. **El código los ignora y usa literales.** Vamos a:

**Migrar literales a tokens en 12 archivos prioritarios** (los más usados):
- `Sidebar.tsx`, `DashboardLayout.tsx`, `MobileNav.tsx`
- `CustomerCard.tsx`, `CustomerList.tsx`, `CustomerFormModal.tsx`, `CustomerDetailModal.tsx`
- `NewAppointmentModal.tsx`, `AppointmentDetailModal.tsx`, `AppointmentBlock.tsx`
- `BusinessSettings.tsx`, `EmployeeList.tsx`, `EmployeeFormModal.tsx`
- `NailMenuCalculator.tsx` (los 7 paneles internos)

**Reglas de migración:**
- `bg-[#FDFBEE]` / `bg-[#FAF8ED]` → `bg-surface-container-lowest` o `bg-[var(--surface-container-lowest)]`
- `bg-primario-zen` → mantener (es alias correcto a `--primary`)
- `text-primario-zen/X` → mantener
- Colores MD3 ya están mapeados: `var(--surface)`, `var(--surface-container)`, etc.
- `bg-yellow-400` (en proceso, en `AppointmentBlock.tsx`) → token semántico `bg-status-in-progress` definido en `tailwind.config.ts`

**Verificación:** hacer un `grep -r "bg-\[#" src/` y confirmar que no quedan literales en componentes de UI.

### 1.3 Refactor de la landing pública

**Archivo eliminado:** `src/app/(site)/page.tsx` (572 líneas con paleta hardcoded).

**Archivo nuevo:** `src/app/(site)/page.tsx` — versión delgada que importa y compone los componentes ya creados en `src/components/home/`:
- `<Hero />`
- `<BrandInfo />`
- `<PaymentDetails />`
- `<ZenBookingJourney />` (o un link directo a `/reserva`)
- `<TimeRules />`
- Footer propio con `zen-logo` SVG, copyright, links de contacto.

**Lo que se gana:**
- Una sola fuente de verdad visual.
- Cualquier cambio en el Hero se propaga solo.
- El tamaño del archivo baja de 572 a ~80 líneas.

**Verificación:** abrir `/` en navegador, comparar con la versión actual, validar que se ve igual o mejor.

### 1.4 Bugs visibles y quick wins

Cambios puntuales de bajo riesgo / alto impacto visual:

| Cambio | Archivo |
|---|---|
| Corregir `flex--col` → `flex-col` | `src/components/auth/LoginForm.tsx:129` |
| Reemplazar emojis `🤍 🎨 💎 ✨` por iconos `Lucide` | `src/components/home/BrandInfo.tsx` |
| Añadir leyenda textual al filtro de colores del calendario | `src/components/calendar/CalendarView.tsx:202-224` |
| Calcular "Recordatorios pendientes" del dashboard con `appointments.filter(a => a.status === 'pending_advance').length` | `src/app/(app)/dashboard/page.tsx:111` |
| Reemplazar `confirm('¿Estás seguro...?')` por `<ConfirmDialog>` | 4 sitios (ver tabla 1.1) |
| Cambiar hover rojo de "Cerrar Sesión" por tono de la paleta | `src/components/layout/Sidebar.tsx:135` |
| Unificar copy del botón "Nueva" → "+ Nueva Clienta" | `src/components/customers/CustomerList.tsx:68` |
| Corregir redirección post-reset: `/` → `/login` | `src/app/reset-password/page.tsx:45` |
| Hacer `<CustomerCard>` accesible: `role="button"`, `tabIndex`, `onKeyDown` | `src/components/customers/CustomerCard.tsx` |
| Eliminar `var(--color-primario-zen)` inexistente en `TimeIndicatorLine` | `src/components/calendar/TimeIndicatorLine.tsx:39` |
| `ProjectList` con hook (`useProjects` con `deleteProject`) en vez de `window.location.reload()` | `src/components/settings/ProjectList.tsx:89` |

### 1.5 Onboarding de primer uso (cuando no hay datos)

Cuando la clienta abre el sistema por primera vez, no sabe por dónde empezar. Añadir **empty states ilustrados** en:
- `CustomerList` — "Agrega tu primera clienta para empezar"
- `ServiceList` — "Define tus servicios y duraciones"
- `Dashboard` — si no hay citas hoy, "Hoy es un día libre ☕"
- `CalendarView` — si no hay citas en la semana, "Aún no tienes citas esta semana"

**Patrón:** card centrada con icono Lucide grande (color `accent-gold/40`), título serif, descripción, botón CTA primario. Reutilizable.

**Archivo nuevo:** `src/components/ui/EmptyState.tsx` con props `{ icon, title, description, action? }`.

**Verificación:** borrar todas las clientas/servicios, ver cada empty state.

### 1.6 Skeletons de carga

**Archivo nuevo:** `src/components/ui/Skeleton.tsx` con `Skeleton`, `SkeletonText`, `SkeletonCard`.

Sustituir `Loader2` spinner en:
- `CustomerList` (lista de cards)
- `ServiceList` (grid)
- `CalendarView` ya tiene un indicador flotante — suficiente
- `AppointmentDetailModal` cuando `!appointment` (línea 87)
- `Dashboard` (línea 129)

### 1.7 Pequeñas mejoras de microinteracción

- Cards del `CustomerList`, `ServiceList`, `EmployeeList`: añadir `hover:scale-[1.02]` y `active:scale-[0.98]` para uniformidad.
- `AppointmentBlock`: ya tiene `scale` en proceso; añadir leve `hover:scale-[1.01]` en estado normal.
- Botones primarios: añadir `transition-all duration-200` en todos los que falten.

---

## Fase 2 — Seguridad, RLS y migraciones (después de Fase 1)

**Meta:** el sistema es seguro de operar en producción.

### 2.1 Migración nueva de Supabase

**Archivo nuevo:** `supabase/migrations/20260606100000_secure_rls.sql`

- **Eliminar** la política `Anon full access *` actual en todas las tablas.
- **Re-crear** policies acotadas:
  - `anon` puede hacer `SELECT` en `services` y `business_settings` (para que la landing y `/reserva` funcionen sin login).
  - `anon` puede hacer `INSERT` en `customers` y `appointments` SOLO con `status = 'pending_advance'` (flujo público).
  - `anon` puede hacer `SELECT` en `employees` (necesario para que `usePublicBooking` filtre disponibilidad).
  - El resto (UPDATE, DELETE, gestión de clientas, configuración) requiere `authenticated`.
- **Crear** policies `authenticated` que verifiquen `auth.uid()` o pertenencia al `project_id`.

### 2.2 Validaciones de payloads

- `useAppointments.createAppointment` ya valida que `start_time < end_time`. Falta validar que `end_time - start_time <= 8h` (sanidad) y que el `customer_id` pertenece al `project_id`.
- `useCustomers.createCustomer` y `updateCustomer`: validar que `phone` (si presente) tenga al menos 8 dígitos.

### 2.3 Página 404 y error boundary

- `src/app/not-found.tsx` — ilustrado, con CTA a `/` y `/dashboard`.
- `src/app/error.tsx` — captura errores no controlados, log en consola, mensaje amigable con botón "Reintentar".

---

## Fase 3 — Refactor técnico profundo (última)

**Meta:** el código es mantenible para la clienta o para un dev que entre a modificarlo.

### 3.1 Eliminar `PROJECT_ID` env como fuente de verdad

El problema: `CalendarView.tsx:30` y `usePublicBooking.ts:12` leen `process.env.NEXT_PUBLIC_PROJECT_ID` directamente, mientras el resto usa `activeProject.id` del contexto. **Esto crea inconsistencia.**

- Eliminar uso de env en `CalendarView`.
- Mantener env SOLO en `usePublicBooking` (flujo público que no tiene sesión), pero documentar claramente que es el "fallback público" y que el admin usa `activeProject.id`.

### 3.2 Extraer `<CategorySection>` del `NailMenuCalculator`

El archivo tiene 933 líneas con 7 secciones casi idénticas. Refactor a:

```tsx
<CategorySection
  title="Full Set"
  icon={Sparkles}
  isActive={activeServices.has('fullset')}
  onToggle={() => toggleService('fullset')}
  onReset={() => resetSection('fullset')}
  summaryLines={...}
  summaryTotal={...}
>
  {/* children: campos específicos de fullset */}
</CategorySection>
```

**Resultado esperado:** `NailMenuCalculator` baja de 933 a ~250 líneas.

### 3.3 Unificar `usePublicBooking` y `useBookingFlow`

Ambos hacen:
- `fetch business_settings`
- `fetch services`
- `check availability`
- `upsert customer + insert appointment`

Crear `src/lib/bookingCore.ts` con función pura `submitBookingCore({ formData, projectId, isPublic })` que ambos hooks consumen.

### 3.4 Eliminar `ThemeContext` muerto

Decisión: o se implementa el tema oscuro de verdad (con los estilos MD3 que ya están preparados en `globals.css` para `[data-theme='zen-dark']` y `[data-theme='high-contrast']`), o se elimina `ThemeProvider` del layout.

Recomendado: **implementarlo** — los tokens ya están listos, solo hay que añadir los estilos dark a `globals.css` (aprox 30 líneas copiando el bloque y adaptando colores).

### 3.5 Bundle y performance

- Revisar imports de `framer-motion` para importar solo lo usado (`motion`, `AnimatePresence` en cada archivo está bien; no requiere tree-shaking manual con Next 16).
- `date-fns`: importar funciones específicas en vez de `import { ... } from 'date-fns'` cuando sea viable.
- Sustituir las imágenes de Unsplash en la landing por SVGs/PNGs locales optimizados (o dejarlas si aceptamos la dependencia externa — esto es decisión de la clienta).

---

## Archivos críticos a tocar (resumen)

**Nuevos (8):**
- `src/components/ui/Toast.tsx`
- `src/components/ui/ToastProvider.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/lib/bookingCore.ts` (Fase 3)
- `src/app/not-found.tsx` (Fase 2)
- `src/app/error.tsx` (Fase 2)

**Modificados prioritarios (Fase 1):**
- `src/app/layout.tsx` (envolver con ToastProvider)
- `src/app/(site)/page.tsx` (refactor a componentes)
- `src/app/(app)/dashboard/page.tsx` (calcular pendientes + empty state + notas)
- `src/app/forgot-password/page.tsx` + `src/app/reset-password/page.tsx` (toasts, fix redirect)
- `src/components/auth/LoginForm.tsx` (typo)
- `src/components/calendar/CalendarView.tsx` (sin console.log, leyenda filtros)
- `src/components/calendar/AppointmentDetailModal.tsx` (loading state)
- `src/components/calendar/TimeIndicatorLine.tsx` (fix var CSS)
- `src/components/calendar/AppointmentBlock.tsx` (token semántico)
- `src/components/customers/CustomerCard.tsx` (a11y)
- `src/components/customers/CustomerList.tsx` (empty state, confirm, toast)
- `src/components/customers/CustomerDetailModal.tsx` (confirm, copy)
- `src/components/customers/CustomerFormModal.tsx` (toast)
- `src/components/services/ServiceList.tsx` (empty state, toast)
- `src/components/services/ServiceCard.tsx` (confirm)
- `src/components/services/ServiceFormModal.tsx` (toast)
- `src/components/settings/BusinessSettings.tsx` (toast)
- `src/components/settings/ProjectList.tsx` (confirm, hook)
- `src/components/settings/EmployeeList.tsx` (empty state)
- `src/components/settings/EmployeeFormModal.tsx` (toast)
- `src/components/home/BrandInfo.tsx` (Lucide en vez de emoji)
- `src/components/layout/Sidebar.tsx` (hover rojo)
- `src/components/booking/NailMenuCalculator.tsx` (Fase 3 refactor)

**Migración nueva (Fase 2):**
- `supabase/migrations/20260606100000_secure_rls.sql`

---

## Verificación end-to-end (cómo probar al final)

### Después de Fase 1:
1. `npm run build` — compila sin errores ni warnings nuevos.
2. `npm run dev` — abrir `http://localhost:3000`:
   - `/` → landing nueva, mismo look que antes pero construida con componentes.
   - Login con credenciales válidas → dashboard.
   - Click en cada acción destructiva (eliminar clienta, servicio, empleada, proyecto) → debe aparecer `ConfirmDialog` estilizado, no `confirm()` nativo.
   - Forzar un error (ej. crear clienta sin nombre) → toast de error, no `alert()`.
   - Vaciar base de datos → ver empty states en cada lista.
   - DevTools → no debe haber `console.log` de la app (solo errores legítimos).
3. `grep -r "console.log\|confirm(\|alert(" src/` → debe devolver 0 resultados.
4. `grep -r "bg-\[#" src/components src/app` → debe devolver 0 resultados.

### Después de Fase 2:
1. Crear cita desde `/reserva` sin login → debe seguir funcionando.
2. Login normal → CRUD completo de clientas/citas.
3. Sin login, intentar `supabase.from('customers').delete()` desde devtools → debe ser rechazado.
4. Probar página 404 → abrir `/no-existe` → debe verse el 404 ilustrado.

### Después de Fase 3:
1. `npm run build` y revisar `.next/analyze` (si se configura) → bundle size razonable.
2. Lighthouse en `/` y `/dashboard` → score > 90 en Performance, Accessibility, Best Practices, SEO.
3. Probar tema oscuro (si se implementó) → todos los textos legibles, contraste OK.

---

## Riesgos y notas

- **No romper la base de datos:** durante la migración de RLS, validar primero en un proyecto Supabase de prueba, o hacer backup antes.
- **Las imágenes de Unsplash en la landing** pueden ser un problema si el sitio de la clienta se usa offline. Recomiendo reemplazarlas por assets locales, pero eso requiere diseño gráfico nuevo. **Decisión a tomar con la clienta.**
- **El `flex-col` roto en `LoginForm`** es un bug visible hoy. Si la clienta lo prueba y se da cuenta, genera mala impresión. **Es lo primero que arreglo al empezar la implementación.**
- **`framer-motion` con Next 16** puede dar warnings de hidratación en algunos componentes. Hay que envolver animaciones en `useEffect`/`isMounted` si aparecen. Lo monitoreo al construir.
