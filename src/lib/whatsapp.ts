import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentWithRelations } from '@/types/supabase';

/**
 * Interfaz para el servicio de WhatsApp.
 * Esta función está preparada para conectarse a una API en el futuro.
 * Actualmente genera un enlace manual como fallback.
 */
export async function sendWhatsAppReminder(appointment: AppointmentWithRelations): Promise<boolean> {
  const customerName = appointment.customer.name;
  const customerPhone = appointment.customer.phone;
  
  if (!customerPhone) {
    console.warn('Cannot send WhatsApp reminder: Customer has no phone number.');
    return false;
  }

  // Validamos si hay variables de entorno para una API oficial (Ej. Meta API)
  const hasApiKeys = process.env.NEXT_PUBLIC_WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN;

  const appointmentDate = new Date(appointment.start_time);
  const timeString = format(appointmentDate, 'hh:mm a', { locale: es });

  const messageText = `Hola, ${customerName}, te recordamos tu cita el día de hoy a las ${timeString}. Te pedimos de favor confirmar tu asistencia respondiendo a este mensaje automático. ✨\n\n¡Te esperamos!`;

  if (hasApiKeys) {
    // Aquí iría la lógica del POST a la API oficial
    // const response = await fetch(process.env.NEXT_PUBLIC_WHATSAPP_API_URL, { ... })
    // return response.ok;
    console.log('Sending via WhatsApp API (Mock):', messageText);
    return true;
  }

  // Fallback Manual: Generar enlace para WhatsApp Web/App
  const encodedMessage = encodeURIComponent(messageText);
  // Limpiamos el número de teléfono para que solo tenga dígitos y el signo + si existe
  const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  // Abrimos en una nueva pestaña
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank');
  }

  return true;
}
