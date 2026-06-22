// ============================================================
// /api/cron/reminders — Vercel-cron compatible
//
// Configurar en vercel.json:
//   { "crons": [{ "path": "/api/cron/reminders", "schedule": "*/15 * * * *" }] }
//
// Comportamiento (D1 = opción c: deep-link al admin):
//   * Lee `appointment_reminders` con send_at <= NOW() y status='pending'.
//   * Para cada recordatorio:
//       - Verifica que la cita sigue activa y en estado válido para recordar.
//       - Verifica que la hora actual cae dentro de la ventana
//         (send_window_start .. send_window_end) del proyecto.
//       - Marca como 'sent' y deja una entrada en notifications_outbox.
//   * NO envía nada por WhatsApp — el "send" en D1c significa "la tarjeta
//     ya está lista para que el admin la abra y pulse el botón de enviar".
//     Cuando se cambie a un relay (D1=b), aquí se hace el POST a la API.
//
// Seguridad: requiere un header `x-cron-secret` que coincida con
// CRON_SECRET. Si la env var no está, se rechaza todo (fail-closed).
// ============================================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

interface ReminderRow {
  id: string;
  project_id: string;
  appointment_id: string;
  send_at: string;
  status: string;
  channel: string;
  message_template: string | null;
  recipient_phone: string | null;
}

export async function GET(request: Request) {
  // 1. Verificar el secreto del cron (configurar en Vercel: CRON_SECRET).
  //    En dev, si se llama con ?dev=1 se permite el bypass (NO production).
  const url = new URL(request.url);
  const isDevBypass =
    process.env.ALLOW_CRON_BYPASS === 'true' && url.searchParams.get('dev') === '1';

  const provided = request.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET;
  if (!isDevBypass) {
    if (!expected) {
      return NextResponse.json(
        { ok: false, error: 'CRON_SECRET no configurado en el servidor.' },
        { status: 503 }
      );
    }
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Traer reminders pendientes cuya fecha ya pasó.
  const { data: pending, error: fetchErr } = await supabaseAdmin
    .from('appointment_reminders')
    .select('id, project_id, appointment_id, send_at, status, channel, message_template, recipient_phone')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())
    .limit(50);

  if (fetchErr) {
    console.error('[cron/reminders] fetch error:', fetchErr);
    return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
  }

  const reminders = (pending ?? []) as ReminderRow[];
  if (reminders.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  // 3. Para cada reminder: validar ventana horaria y cita activa.
  const now = new Date();
  const processed: string[] = [];
  const skipped: string[] = [];

  for (const r of reminders) {
    try {
      // a) Traer settings del proyecto para la ventana horaria.
      const { data: settings } = await supabaseAdmin
        .from('admin_notification_settings')
        .select('send_window_start, send_window_end')
        .eq('project_id', r.project_id)
        .maybeSingle();

      const startStr = (settings as any)?.send_window_start ?? '08:00:00';
      const endStr = (settings as any)?.send_window_end ?? '21:00:00';
      const inWindow = isTimeInWindow(now, startStr, endStr);
      if (!inWindow) {
        skipped.push(r.id);
        continue;
      }

      // b) Traer la cita: si está cancelada o completada, cancelar el reminder.
      const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('id, status, start_time, customer_id, employee_id')
        .eq('id', r.appointment_id)
        .maybeSingle();

      if (!appt) {
        // Cita borrada → cancelar el reminder.
        await supabaseAdmin
          .from('appointment_reminders')
          .update({ status: 'cancelled' })
          .eq('id', r.id);
        skipped.push(r.id);
        continue;
      }
      if (appt.status === 'cancelled' || appt.status === 'completed' || appt.status === 'no_show') {
        await supabaseAdmin
          .from('appointment_reminders')
          .update({ status: 'cancelled' })
          .eq('id', r.id);
        skipped.push(r.id);
        continue;
      }

      // c) Marcar como 'sent' y dejar traza en outbox.
      //    (D1c: no enviamos nada. La tarjeta ya es visible en el dashboard del
      //    admin y al lado de la cita en el calendario.)
      const { error: updErr } = await supabaseAdmin
        .from('appointment_reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', r.id);

      if (updErr) {
        console.error('[cron/reminders] update error:', updErr);
        continue;
      }

      await supabaseAdmin.from('notifications_outbox').insert({
        project_id: r.project_id,
        appointment_id: r.appointment_id,
        reminder_id: r.id,
        kind: 'admin_card',
        payload: {
          message: r.message_template,
          recipient_phone: r.recipient_phone,
          send_at: r.send_at,
        },
      });

      // Push a admins del proyecto (best-effort: si falla, no rompemos el cron).
      try {
        await notifyAdminsAboutReminder({
          projectId: r.project_id,
          appointmentId: r.appointment_id,
          customerName: (appt as any)?.customer?.name ?? 'cliente',
          startTime: (appt as any)?.start_time as string | undefined,
        });
      } catch (pushErr) {
        console.warn('[cron/reminders] push dispatch failed for', r.id, pushErr);
      }

      processed.push(r.id);
    } catch (err) {
      console.error('[cron/reminders] loop error for', r.id, err);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: processed.length,
    skipped: skipped.length,
    ids: { processed, skipped },
  });
}

/**
 * Comprueba si la hora actual (HH:MM:SS) cae dentro de una ventana
 * horaria [startStr, endStr]. Soporta ventanas que cruzan medianoche
 * (p.ej. 22:00 → 02:00) — en ese caso se considera dentro si la hora
 * es >= start O <= end.
 */
/**
 * Envía una push notification a todos los admins del proyecto anunciando
 * que un recordatorio está listo para enviar al cliente. Best-effort:
 * si no hay VAPID keys configuradas o no hay suscripciones, se ignora.
 */
async function notifyAdminsAboutReminder(opts: {
  projectId: string;
  appointmentId: string;
  customerName: string;
  startTime: string | undefined;
}): Promise<void> {
  const { projectId, appointmentId, customerName, startTime } = opts;

  // Si no hay VAPID keys, no hacemos nada.
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return;
  }

  // Traer admins del proyecto (rol 'admin' y con project_id vinculado).
  const { data: adminRows, error: adminErr } = await supabaseAdmin
    .from('user_roles')
    .select('id, role, project_id')
    .eq('project_id', projectId)
    .eq('role', 'admin');

  if (adminErr) {
    console.warn('[notifyAdmins] load admins error:', adminErr);
    return;
  }

  const adminIds = (adminRows ?? []).map((r) => (r as any).id as string);
  if (adminIds.length === 0) return;

  const sendUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`
    : null;

  // Si no podemos llamar al endpoint (URL no configurada), abortamos.
  if (!sendUrl) return;

  const formattedTime = startTime
    ? new Date(startTime).toLocaleString('es-MX', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  await Promise.allSettled(
    adminIds.map((userId) =>
      fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Reusar el secret del cron para autenticar la llamada interna.
          'x-cron-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({
          user_id: userId,
          project_id: projectId,
          title: `Recordatorio listo · ${customerName}`,
          body: formattedTime
            ? `Cita ${formattedTime}. Pulsa para abrir el mensaje de WhatsApp.`
            : 'Pulsa para abrir el mensaje de WhatsApp.',
          url: `/calendar?appointment=${appointmentId}`,
          tag: `reminder-${appointmentId}`,
        }),
      }).catch((err) => {
        console.warn('[notifyAdmins] fetch error for', userId, err);
      })
    )
  );
}

function isTimeInWindow(now: Date, startStr: string, endStr: string): boolean {
  const toSeconds = (s: string): number => {
    const [h, m, sec] = s.split(':').map((n) => parseInt(n, 10) || 0);
    return h * 3600 + m * 60 + (sec ?? 0);
  };
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const start = toSeconds(startStr);
  const end = toSeconds(endStr);

  if (start <= end) {
    return nowSec >= start && nowSec <= end;
  }
  // Cruza medianoche.
  return nowSec >= start || nowSec <= end;
}
