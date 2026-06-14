# Reporte de Estado del Sistema: Zen Booking App 🌿

Este documento detalla la arquitectura, flujos, rutas y herramientas que conforman el estado actual de la plataforma de reservas **Zen**.

---

## 1. Arquitectura y Stack Tecnológico

El proyecto está construido bajo una arquitectura moderna orientada a **rendimiento, escalabilidad y estética premium**:

*   **Framework Core:** Next.js 14+ (App Router) con TypeScript estricto.
*   **Estilos y UI:** Tailwind CSS (con un sistema de diseño de tokens personalizado en `globals.css` para colores botánicos y "glassmorphism"), Framer Motion para micro-animaciones fluidas, y Lucide React para iconografía consistente.
*   **Backend & Base de Datos:** Supabase (PostgreSQL). Gestiona tanto la base de datos relacional como las políticas de seguridad (RLS) y la autenticación.
*   **Gestión de Estado:** Combinación de Context API (`AppContext`, `ToastProvider`, `ConfirmDialogProvider`) y Custom Hooks altamente especializados (ej. `useBookingFlow.ts`).

---

## 2. Flujo de Clientes (Frontend Público)

El ecosistema visible para los clientes está diseñado para convertir y transmitir calma y profesionalismo.

### Rutas Públicas
*   **`/` (Landing Page):**
    *   **Hero / Galería:** Transformado a una Galería *Bento Box* dinámica con imágenes verificadas (Manicura, Pedicura, Arte, Acrílicas) que reemplaza el hero tradicional, mostrando el portafolio inmediatamente.
    *   **Sección Filosofía:** Texto de marca ("Nuestra Esencia").
    *   **Servicios Signature:** Carrusel horizontal de servicios estrella.
    *   **Preguntas Frecuentes (FAQ):** Acordeón animado para resolver dudas de anticipos y retrasos.
    *   **Botón Flotante:** Navegación inteligente e intuitiva (`Navigation.tsx`) que invita constantemente a reservar con animaciones de "shimmer" (brillo).
*   **`/reserva` (Booking Journey - Modo Quiosco):**
    *   Convertida a un entorno **independiente** sin menús que distraigan, logrando una altura 100% nativa (sin scrollbars innecesarias).
    *   **Paso 1 (Servicios):** Selección jerárquica: Categoría $\rightarrow$ Variante (precio base) $\rightarrow$ Complementos (x cantidad). Calcula automáticamente precios y duración en tiempo real.
    *   **Paso 2 (Datos y Fecha):**
        *   Formulario de cliente (Nombre, WhatsApp, Notas).
        *   **Calendario Inteligente:** Filtra dinámicamente los días usando `businessSettings.working_days` (ej. si cierras en domingo, el domingo desaparece).
        *   **Validación de Horas Pasadas:** Filtra horas que ya transcurrieron en el día actual (no deja reservar a las 11:00 am si son las 2:00 pm).
        *   **Confirmación:** Pantalla final de éxito con integración directa a la base de datos de Supabase y un ticket en formato digital.

---

## 3. Flujo Administrativo (Back-Office)

El sistema de gestión interna (`/(app)`) está completamente estructurado para operar el salón sin depender de software de terceros.

### Rutas y Herramientas Administrativas
*   **`/dashboard`:**
    *   Panel de control principal. Actúa como el centro de mando para métricas financieras, citas de hoy y estatus de los clientes.
*   **`/calendar`:**
    *   Vista maestra del calendario del salón (alimentado por `useCalendarView.ts` y `useAppointments.ts`).
    *   Permite ver conflictos, citas confirmadas y espacios muertos en la agenda.
*   **`/client-agenda` / `/customers`:**
    *   **CRM Integrado:** Gestiona el historial de visitas, detalles de contacto y recurrencia de los clientes a través del hook `useCustomers.ts`.
*   **`/services`:**
    *   Configurador avanzado del menú. Soporta la creación de categorías, opciones base (ej. "Manicura Spa") y la vinculación de addons/complementos usando el hook `useDynamicServices.ts`.
*   **`/settings`:**
    *   Ajustes globales del local (Horas de apertura, días de descanso). Controla el comportamiento dinámico de toda la app.
    *   Incluye acceso al **Manual Operativo** de la aplicación.

---

## 4. Lógica Core y Custom Hooks (Cerebro del Sistema)

La inteligencia del sistema reside en la carpeta `src/hooks`, donde cada hook abstrae la comunicación con la base de datos de manera atómica:

1.  **`useBookingFlow.ts`:**
    *   Trae la configuración del negocio (`businessSettings`).
    *   Genera "Time Slots" de 30 minutos y los cruza en tiempo real con la tabla de `appointments` para bloquear horas tomadas.
    *   Ejecuta el `submitBooking`: Proceso transaccional que valida la fecha, crea/busca al cliente en la BD, localiza a un empleado y registra la cita (estado `pending_advance`).
2.  **`useDynamicServices.ts`:**
    *   Se encarga de traer y cachear la oferta del salón. Relaciona las categorías con las `variants` (precios) y los `modifiers` (complementos).
3.  **`useAppointments.ts` / `useTimeBlocks.ts`:**
    *   Manejo de estados de citas (confirmadas, canceladas) y bloqueos manuales de tiempo (por ejemplo, si el staff sale a comer).

---

## 5. Diseño y "Zen" Design System

El sistema está cimentado en un estándar *Premium*:
*   **Tipografía:** *Libre Caslon Text* para un aspecto de revista editorial en encabezados, y *Manrope* para una lectura fluida en la interfaz.
*   **Colores Globales (`globals.css`):** Tonos cremas, verde olivo (`--primary: #4A5D23`) y acentos dorados (`--accent-gold-primary`). Transiciones fluidas entre Modo Claro / Modo Oscuro.
*   **Micro-interacciones:** Los botones flotantes y de confirmación contienen animaciones "Shimmer" y sombras suaves (`shadow-soft-shadow`, `shadow-gold-glow`) que hacen sentir la app "viva".

---

## Resumen Final de Estabilidad 🟢

*   **Front-End / UX:** 100% estable. Los flujos están cerrados, las validaciones de error (toasts) funcionan y la responsividad móvil/escritorio es excelente.
*   **Reservas (Core):** 100% estable. No hay conflictos de sobreposición ("Double-booking"), el sistema descarta horas pasadas y respeta días no laborales.
*   **Diseño:** A nivel de "oro". La transición a pantallas separadas para la reserva y el Bento Box inicial de imágenes dan la impresión de una marca de ultra-lujo.
