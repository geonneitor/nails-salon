// ============================================================
// /api/push/subscribe — Registrar / eliminar suscripción push
//
// POST    { subscription, userId, projectId, userAgent? }
// DELETE  { endpoint }
// ============================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // Server Component no puede escribir cookies — ignorar.
          }
        },
      },
    }
  );
}

export async function POST(request: Request) {
  let body: {
    subscription: PushSubscriptionJSON;
    userId: string;
    projectId: string;
    userAgent?: string;
    deviceLabel?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const { subscription, userId, projectId, userAgent, deviceLabel } = body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ ok: false, error: 'subscription inválida' }, { status: 400 });
  }
  if (!userId || !projectId) {
    return NextResponse.json({ ok: false, error: 'userId y projectId son requeridos' }, { status: 400 });
  }

  const supabase = await getSupabase();

  // Verificar que el caller está autenticado y coincide con userId.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      project_id: projectId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: userAgent ?? null,
      device_label: deviceLabel ?? null,
    },
    {
      onConflict: 'endpoint',
    }
  );

  if (error) {
    console.error('[push/subscribe] upsert error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  let body: { endpoint: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ ok: false, error: 'endpoint es requerido' }, { status: 400 });
  }

  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', body.endpoint)
    .eq('user_id', user.id);

  if (error) {
    console.error('[push/subscribe] delete error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
