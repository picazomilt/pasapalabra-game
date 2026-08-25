import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

function getSql() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!connectionString) throw new Error('DATABASE_URL no está configurada')
  return neon(connectionString)
}

export async function GET(request: Request) {
  const sql = getSql()
  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Falta el código' }, { status: 400 })
  const rows = await sql`SELECT state FROM game_rooms WHERE code = ${code} LIMIT 1`
  return NextResponse.json(rows[0]?.state ?? null, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  const sql = getSql()
  const body = await request.json() as { code?: string; state?: unknown }
  const code = body.code?.trim().toUpperCase()
  if (!code || !body.state) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  await sql`INSERT INTO game_rooms (code, state, updated_at) VALUES (${code}, ${JSON.stringify(body.state)}::jsonb, NOW()) ON CONFLICT (code) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`
  return NextResponse.json({ ok: true })
}
