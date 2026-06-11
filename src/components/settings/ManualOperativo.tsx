'use client';

import React from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Clock, 
  Users, 
  ShieldCheck, 
  Database,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export function ManualOperativo() {
  return (
    <div className="flex flex-col gap-8 text-primario-zen">
      
      {/* Resumen Inicial */}
      <div className="bg-primario-zen/5 border border-primario-zen/10 rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primario-zen/60 mb-2">
          Manual de Operación Interna
        </p>
        <h3 className="font-serif text-xl mb-3">Guía de Procedimientos para Alexandra</h3>
        <p className="text-xs text-primario-zen/70 leading-relaxed font-light">
          Este manual operativo documenta detalladamente el funcionamiento lógico del software de Zen Nail Salon. Contiene la guía de pasos, el flujo de confirmación de depósitos de garantía y la gestión del inventario de citas.
        </p>
      </div>

      {/* Flujo de Citas */}
      <div className="flex flex-col gap-4">
        <h4 className="font-serif text-lg border-b border-secundario-zen/30 pb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-gold-primary" />
          1. El Flujo de Gestión de Citas
        </h4>
        <p className="text-xs text-primario-zen/60 leading-relaxed font-light">
          El proceso desde que una clienta inicia una solicitud en línea hasta que finaliza su servicio en el salón consta de 5 fases lógicas:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 border border-secundario-zen/40 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded self-start">
              Fase 1: Solicitud
            </span>
            <p className="text-xs font-semibold">Cita Pendiente de Anticipo</p>
            <p className="text-[11px] text-primario-zen/50 leading-relaxed font-light">
              La clienta completa el asistente. El sistema registra la cita con estatus <strong className="text-amber-700">pending_advance</strong> (Amarillo) y bloquea temporalmente el horario en el calendario de la empleada.
            </p>
          </div>

          <div className="bg-white/50 border border-secundario-zen/40 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded self-start">
              Fase 2: Cobro
            </span>
            <p className="text-xs font-semibold">Envío de Datos de Pago</p>
            <p className="text-[11px] text-primario-zen/50 leading-relaxed font-light">
              Desde el panel de control, abre la cita y presiona <strong className="text-blue-700">Cobrar Anticipo (WhatsApp)</strong>. Esto genera el mensaje pre-llenado con tus datos bancarios de BBVA para enviárselo a la clienta.
            </p>
          </div>

          <div className="bg-white/50 border border-secundario-zen/40 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded self-start">
              Fase 3: Confirmación
            </span>
            <p className="text-xs font-semibold">Cita Confirmada</p>
            <p className="text-[11px] text-primario-zen/50 leading-relaxed font-light">
              Al recibir el comprobante de transferencia, actualiza manualmente el estatus de la cita a <strong className="text-green-700">confirmed_advance</strong> (Verde). El espacio queda asegurado firmemente.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomía del Sistema de Datos */}
      <div className="flex flex-col gap-4">
        <h4 className="font-serif text-lg border-b border-secundario-zen/30 pb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-accent-gold-primary" />
          2. Glosario y Estructura del Sistema (Base de Datos)
        </h4>
        <p className="text-xs text-primario-zen/60 leading-relaxed font-light">
          Para realizar auditorías o cargas de datos correctas en Supabase, debes guiarte por las siguientes tablas del sistema:
        </p>

        <div className="flex flex-col gap-3">
          <div className="w-full p-4 rounded-xl bg-white/40 border border-secundario-zen/30 flex flex-col md:flex-row gap-2 md:items-center justify-between text-xs">
            <span className="font-semibold md:w-32">`Appointment` (Cita)</span>
            <p className="text-primario-zen/60 flex-1 font-light leading-relaxed">
              Registra los horarios de inicio y fin, el precio total, la duración y la relación de la clienta (`customer_id`) y la artista asignada (`employee_id`).
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-white/40 border border-secundario-zen/30 flex flex-col md:flex-row gap-2 md:items-center justify-between text-xs">
            <span className="font-semibold md:w-32">`TimeBlock` (Bloqueo)</span>
            <p className="text-primario-zen/60 flex-1 font-light leading-relaxed">
              Permite bloquear horarios de trabajo en la agenda de una empleada por razones administrativas (comidas, descansos, emergencias). Impide que las clientas reserven en línea durante ese lapso.
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-white/40 border border-secundario-zen/30 flex flex-col md:flex-row gap-2 md:items-center justify-between text-xs">
            <span className="font-semibold md:w-32">`Customer` (Clienta)</span>
            <p className="text-primario-zen/60 flex-1 font-light leading-relaxed">
              Guarda el historial de visitas, teléfono, notas del servicio y fecha de cumpleaños para automatizar las dinámicas de fidelidad.
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-white/40 border border-secundario-zen/30 flex flex-col md:flex-row gap-2 md:items-center justify-between text-xs">
            <span className="font-semibold md:w-32">`Employee` (Personal)</span>
            <p className="text-primario-zen/60 flex-1 font-light leading-relaxed">
              Define a los miembros del equipo y sus credenciales de acceso.
            </p>
          </div>
        </div>
      </div>

      {/* Algoritmo de Disponibilidad */}
      <div className="flex flex-col gap-4">
        <h4 className="font-serif text-lg border-b border-secundario-zen/30 pb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-gold-primary" />
          3. Funcionamiento de Asignación y Disponibilidad
        </h4>
        <p className="text-xs text-primario-zen/60 leading-relaxed font-light">
          ¿Cómo decide la app qué horas mostrar en la web a las clientas? El sistema corre un algoritmo automático al cargar el calendario:
        </p>

        <div className="border border-outline-variant/30 rounded-2xl p-6 bg-white/60 text-xs flex flex-col gap-3 font-light leading-relaxed">
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>Días Hábiles:</strong> Valida que el día seleccionado esté dentro del arreglo `working_days` de la configuración de tu negocio.</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>Horarios de Apertura y Cierre:</strong> Genera bloques cada 30 minutos de forma estricta entre las horas `opening_hour` y `closing_hour` configuradas.</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span><strong>Asignación Automática:</strong> Para cada bloque horario disponible, el sistema comprueba la disponibilidad de todas las empleadas registradas. Si detecta que al menos una artista no tiene citas (`appointments`) ni bloqueos de tiempo (`time_blocks`) cruzando esa franja horaria, el horario se muestra en la web. Si todas las empleadas están ocupadas, el horario se oculta automáticamente.</span>
          </p>
        </div>
      </div>

      {/* Roles de Seguridad */}
      <div className="flex flex-col gap-4">
        <h4 className="font-serif text-lg border-b border-secundario-zen/30 pb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-gold-primary" />
          4. Perfiles y Roles de Acceso
        </h4>
        <p className="text-xs text-primario-zen/60 leading-relaxed font-light">
          El panel cuenta con protección mediante roles de Supabase para evitar accesos no autorizados:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/40 border border-secundario-zen/30 rounded-xl p-5 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full self-start">
              Rol: TOTAL (Administrador)
            </span>
            <p className="text-xs font-semibold mt-1">Alexandra Garcia</p>
            <p className="text-[11px] text-primario-zen/60 leading-relaxed font-light">
              Acceso total al sistema. Puede ver calendarios de todo el personal, reescribir configuraciones de negocio, registrar o eliminar empleadas y editar el menú de servicios.
            </p>
          </div>

          <div className="bg-white/40 border border-secundario-zen/30 rounded-xl p-5 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primario-zen/50 bg-secundario-zen/40 px-2.5 py-1 rounded-full self-start">
              Rol: ONLY_BOOK (Colaborador)
            </span>
            <p className="text-xs font-semibold mt-1">Manicuristas / Staff</p>
            <p className="text-[11px] text-primario-zen/60 leading-relaxed font-light">
              Acceso exclusivo de lectura y registro básico de citas. Este rol no puede alterar la configuración del negocio ni modificar los catálogos ni el precio de los servicios.
            </p>
          </div>
        </div>
      </div>

      {/* Recomendaciones Operativas */}
      <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl p-6 flex gap-4 items-start text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h5 className="font-semibold text-amber-700 mb-1">Recomendación Crítica de Operación:</h5>
          <p className="text-primario-zen/60 leading-relaxed font-light">
            Es indispensable que registres de inmediato los horarios de descanso del personal como <strong>Bloqueos de Tiempo (TimeBlocks)</strong> en el calendario. Esto evitará que una clienta agende un servicio largo en línea durante la hora de comida o salida de tu equipo, manteniendo en perfecta armonía la agenda y los tiempos de atención.
          </p>
        </div>
      </div>

    </div>
  );
}
