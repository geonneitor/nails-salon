# Arquitectura del Proyecto: Sistema de Gestión para Salón de Uñas

## 1. Stack Tecnológico & Despliegue (Estrategia Premium & Serverless)
*   **Frontend:** React / Next.js (App Router) + TypeScript.
*   **Estilos & UI:** Tailwind CSS + Radix UI / Shadcn UI (Para modales y componentes accesibles).
*   **Animaciones:** Motion (Framer Motion) para la fluidez de la línea de tiempo y transiciones de vistas.
*   **Tipografía Requerida:** Calgary (Configurada como fuente principal en Tailwind).
*   **Base de Datos & Auth:** Supabase (PostgreSQL) o Firebase. *Recomendado Supabase por su manejo nativo de Row Level Security (RLS) para los accesos de empleados vía QR y persistencia relacional perfecta para citas.*
*   **Despliegue:** Vercel (Edge-ready, serverless).

## 2. Nomenclatura del Modelo de Datos (Single Source of Truth)
Para evitar que el agente invente términos, nos referiremos a las entidades de la siguiente manera:
*   `Appointment` (Cita): Contiene cliente, empleado, fecha, hora, estatus de anticipo y tipo de servicio.
*   `TimeBlock` (Bloqueo de Espacio): Reserva de tiempo sin servicio asociado (ej. llegar tarde, descanso).
*   `Customer` (Clienta): Contiene nombre, teléfono, notas de servicio, fecha de cumpleaños y contador de visitas.
*   `Project` (Salón / Sucursal): La entidad máxima. Un usuario administrador puede crear múltiples "Proyectos" (salones).
*   `Employee` (Empleado/Usuario): Personal con acceso limitado mediante roles (`TOTAL`, `ONLY_BOOK`).

## 3. Componentes Clave de la Interfaz (UI Anatomy)
*   `DashboardLayout`: Contenedor principal con el Sidebar de navegación.
*   `CalendarView`: La cuadrícula interactiva (Día, Semana, Mes) con zoom vertical y la línea de tiempo móvil (`TimeIndicatorLine`).
*   `AppointmentCard`: Tarjeta de la cita dentro del calendario con colores dinámicos según el estatus:
    *   *Confirmado con anticipo* -> Verde / Premium.
    *   *Sin anticipo* -> Amarillo / Alerta.
    *   *Gratis* -> Púrpura / Especial.
*   `CustomerModal`: Panel para ver el historial de la clienta, recordatorios de cumpleaños y la sección de "Nota para la próxima visita".