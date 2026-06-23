# Trazabilidad de Bugs y Deuda Técnica 🐛🛠️

Este documento sirve como registro ("trace") de los bugs que se han solucionado recientemente y la deuda técnica que queda pendiente para abordar en un futuro parche o ciclo de mantenimiento.

## 1. Bugs Solucionados Recientemente (Ya en `main`)

### 1.1. Reglas de Negocio (Business Settings)
- **Problema:** Fallo al intentar guardar cambios en la configuración del negocio.
- **Causa:** El código dependía de un `id` interno frágil, y los campos que quedaban vacíos se enviaban como `NaN`. Además, la base de datos retornaba `null` en campos de texto, lo que provocaba que los inputs de React dieran error.
- **Solución Parcheada:** Se cambió la lógica a un `upsert` basado en el `project_id`. Se agregaron fallbacks de validación para números (ej. `1` o `2` por defecto) y strings vacíos (`""`) en lugar de nulos.

### 1.2. Fallos de Construcción (Build / TypeScript)
- **Problema:** El despliegue fallaba al ejecutar `npm run build` o `tsc`.
- **Causa:** El servicio `pushService.ts` intentaba pasar un `Uint8Array` a la clave de servidor de suscripción Push, lo cual no empataba con la definición estricta de TypeScript de la API del navegador. También la inferencia de tipos de Supabase en `route.ts` de Lotito fallaba al leer relaciones de tablas (`customer` y `employee`).
- **Solución Parcheada:** Se forzaron temporalmente los tipos (`as any` y `(a: any)`) para asegurar que el compilador pase y el despliegue no se bloquee.

### 1.3. Acciones Destructivas sin Seguridad (UI)
- **Problema:** Las empleadas podían cancelar, cobrar o marcar como "No Show" una cita accidentalmente con un solo clic.
- **Causa:** Falta de estado intermedio de confirmación en el modal de detalle de cita.
- **Solución Parcheada:** Implementación del contexto estandarizado `useConfirm` (modal unificado) para todas las acciones críticas: Reprogramar (Drag & drop), Reasignar empleada, Cancelar, Cobrar, No-show y Validar anticipos.

---

## 2. Pendientes para el Futuro Parche (Deuda Técnica)

### 2.1. Tipado Estricto de Base de Datos (Supabase types)
- **Requerimiento:** Actualmente dependemos de forzar tipos (`any`) en varias consultas (como las uniones de `appointments` con `customers`). 
- **Futura Solución:** Regenerar los tipos de Supabase con `supabase gen types typescript` y actualizar las interfaces del frontend para que coincidan perfectamente con la base de datos.

### 2.2. Robustez de la Notificaciones Push
- **Requerimiento:** Si un usuario rechaza los permisos de notificaciones o el navegador bloquea el auto-play del sonido de Lotito, falla de manera silenciosa en la consola.
- **Futura Solución:** Agregar un banner visible o un botón en la interfaz (ej. en Ajustes) que le diga explícitamente a la administradora: *"Tus notificaciones están bloqueadas, haz clic aquí para habilitarlas"*, manejando los casos límite de iOS y Safari.

### 2.3. Paginación / Límite de Contexto de Lotito
- **Requerimiento:** Actualmente le inyectamos a Lotito **todas** las citas de la semana en su prompt.
- **Futura Solución:** Si el salón crece mucho (ej. 100 citas a la semana), esto consumirá demasiados tokens de IA. En un futuro, habrá que limitar esta inyección solo a "las citas de hoy" y crear una herramienta de búsqueda específica para que Lotito extraiga el horario de otros días bajo demanda.
