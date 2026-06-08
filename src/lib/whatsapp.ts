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
  const price = appointment.total_price || 0;
  const advance = price * 0.5;

  let messageText = '';
  if (appointment.status === 'pending_advance') {
    messageText = `¡Hola, ${customerName}! ✨\n\nHemos recibido tu solicitud de cita para hoy a las ${timeString}.\n\nPara confirmarla en nuestro sistema, requerimos un anticipo del 50% ($${advance} MXN).\n\n💳 Puedes transferir a la cuenta XXXXXXXX o realizar un depósito.\nPor favor, envíanos tu comprobante por este medio.\n\n¡Gracias por tu preferencia!`;
  } else {
    messageText = `¡Hola, ${customerName}! ✨\n\nTe recordamos tu cita confirmada el día de hoy a las ${timeString}.\n\nTe pedimos de favor confirmar tu asistencia respondiendo a este mensaje.\n\n¡Te esperamos!`;
  }

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
