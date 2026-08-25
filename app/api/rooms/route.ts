import { NextResponse } from 'next/server'

type RoomState = { started: boolean }

type RoomStore = Map<string, RoomState>

const globalStore = globalThis as typeof globalThis & { pasapalabraRooms?: RoomStore }
const rooms = globalStore.pasapalabraRooms ?? new Map<string, RoomState>()
globalStore.pasapalabraRooms = rooms

export async function GET(request: Request) {
  const room = new URL(request.url).searchParams.get('room')?.trim()
  if (!room) return NextResponse.json({ started: false }, { headers: { 'Cache-Control': 'no-store' } })

  return NextResponse.json({ started: rooms.get(room)?.started ?? false }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { room?: string } | null
  const room = body?.room?.trim()
  if (!room) return NextResponse.json({ error: 'Room is required' }, { status: 400 })

  rooms.set(room, { started: true })
  return NextResponse.json({ started: true })
}
