// ============================================================
// /api/push/send — Enviar push a las suscripciones de un usuario
//
// POST { user_id, project_id, title, body, url?, tag? }
// Header: x-cron-secret: <CRON_SECRET>
//
// Este endpoint es INTERNO: solo debe llamarlo el backend (cron,
// eventos del sistema). NO exponer a clientes directos.
// Usa el service-role key para saltarse RLS al iterar suscripciones.
// ============================================================

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

interface SendBody {
  user_id: string;
  project_id: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Configurar VAPID una sola vez por proceso.
let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@zennails.cl';

  if (!publicKey || !privateKey) {
    console.warn('[push/send] VAPID keys no configuradas. Los push NO se entregarán.');
    return;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function POST(request: Request) {
  ensureVapidConfigured();

  // 1. Auth: el caller debe traer el secreto de cron o service role.
  const provided = request.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Aceptar tanto x-cron-secret válido como Authorization: Bearer <service_role>.
  const authHeader = request.headers.get('authorization') ?? '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '');
  const authed =
    (expected && provided === expected) ||
    (serviceRole && bearerToken === serviceRole);

  if (!authed) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parsear body.
  let body: SendBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const { user_id, project_id, title, body: msgBody, url, tag } = body;
  if (!user_id || !project_id || !title || !msgBody) {
    return NextResponse.json(
      { ok: false, error: 'user_id, project_id, title y body son requeridos' },
      { status: 400 }
    );
  }

  // 3. Cargar suscripciones del usuario.
  const { data: subs, error: subsErr } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', user_id)
    .eq('project_id', project_id);

  if (subsErr) {
    console.error('[push/send] load subs error:', subsErr);
    return NextResponse.json({ ok: false, error: subsErr.message }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Sin suscripciones' });
  }

  // 4. Enviar a cada suscripción. Limpiar 404/410 (suscripción inválida).
  const payload = JSON.stringify({
    title,
    body: msgBody,
    icon: '/icon.png',
    url: url ?? '/',
    tag: tag ?? 'zen-default',
  });

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { id: sub.id, status: 'ok' as const };
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          // Suscripción inválida — limpiar.
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          return { id: sub.id, status: 'gone' as const };
        }
        console.warn('[push/send] send error for', sub.id, status, err?.message);
        return { id: sub.id, status: 'error' as const, statusCode: status };
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'ok').length;
  const gone = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'gone').length;

  return NextResponse.json({ ok: true, sent, gone, total: subs.length });
}
