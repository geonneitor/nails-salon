// ============================================================
// /api/admin/reminders/settings
//
// GET  → lee la fila del proyecto (o defaults si no existe).
// PUT  → upsert: recibe { admin_whatsapp, reminders_enabled,
//                          hours_before, send_window_start,
//                          send_window_end }
// ============================================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'bf2460b5-f50d-4b30-a780-b91f05e3096b';

const DEFAULTS = {
  admin_whatsapp: '',
  reminders_enabled: true,
  hours_before: 24,
  send_window_start: '08:00:00',
  send_window_end: '21:00:00',
};

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('admin_notification_settings')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, settings: data ?? { project_id: PROJECT_ID, ...DEFAULTS } });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const allowed = [
      'admin_whatsapp',
      'reminders_enabled',
      'hours_before',
      'send_window_start',
      'send_window_end',
    ] as const;
    const updates: Record<string, unknown> = { project_id: PROJECT_ID, updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('admin_notification_settings')
      .upsert(updates, { onConflict: 'project_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
