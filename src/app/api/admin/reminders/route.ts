// ============================================================
// /api/admin/reminders
//
// Endpoints:
//   GET  /api/admin/reminders              → lista reminders del proyecto
//                                            con filtros ?status=&dateFrom=
//   POST /api/admin/reminders              → acciones: cancel / mark_sent
//   GET  /api/admin/reminders/settings     → settings del proyecto actual
//   PUT  /api/admin/reminders/settings     → upsert settings
// ============================================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAccess } from '@/lib/supabaseServer';

// Listar reminders. Soporta ?status=pending|sent|cancelled|failed
// y ?dateFrom=ISO (default: 30 días atrás).
export async function GET(request: Request) {
  const access = await verifyAdminAccess();
  if (access.status !== 200) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }
  const PROJECT_ID = access.roleData!.project_id;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dateFrom =
    searchParams.get('dateFrom') ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabaseAdmin
    .from('appointment_reminders')
    .select(
      'id, project_id, appointment_id, send_at, status, channel, message_template, recipient_phone, created_at, sent_at'
    )
    .eq('project_id', PROJECT_ID)
    .gte('created_at', dateFrom)
    .order('send_at', { ascending: true })
    .limit(200);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reminders: data ?? [] });
}

// Acciones sobre un reminder existente: { id, action: 'cancel' | 'mark_sent' }
export async function POST(request: Request) {
  try {
    const access = await verifyAdminAccess();
    if (access.status !== 200) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
    }
    const PROJECT_ID = access.roleData!.project_id;

    const body = await request.json();
    const { id, action } = body as { id?: string; action?: string };
    if (!id || !action) {
      return NextResponse.json({ ok: false, error: 'Faltan id o action.' }, { status: 400 });
    }

    let payload: Record<string, unknown> = {};
    if (action === 'cancel') payload = { status: 'cancelled' };
    else if (action === 'mark_sent') {
      payload = { status: 'sent', sent_at: new Date().toISOString() };
    } else if (action === 'mark_failed') {
      payload = { status: 'failed' };
    } else {
      return NextResponse.json({ ok: false, error: 'Acción no soportada.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('appointment_reminders')
      .update(payload)
      .eq('id', id)
      .eq('project_id', PROJECT_ID);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
