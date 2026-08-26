import { NextResponse } from 'next/server'

type LetterStatus = 'pending' | 'active' | 'correct' | 'wrong' | 'passed'
type RoomState = { started: boolean; selected: number; statuses: LetterStatus[]; running: boolean; nIntro: boolean }
type RoomRequest = { room?: string; selected?: number; statuses?: LetterStatus[]; running?: boolean; nIntro?: boolean }

type RoomStore = Map<string, RoomState>

const globalStore = globalThis as typeof globalThis & { pasapalabraRooms?: RoomStore }
const rooms = globalStore.pasapalabraRooms ?? new Map<string, RoomState>()
globalStore.pasapalabraRooms = rooms

export async function GET(request: Request) {
  const room = new URL(request.url).searchParams.get('room')?.trim()
  if (!room) return NextResponse.json({ started: false }, { headers: { 'Cache-Control': 'no-store' } })

  const state = rooms.get(room)
  return NextResponse.json(state ?? { started: false }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as RoomRequest | null
  const room = body?.room?.trim()
  if (!room) return NextResponse.json({ error: 'Room is required' }, { status: 400 })

  const current = rooms.get(room)
  const selected = typeof body?.selected === 'number' ? body.selected : current?.selected ?? 0
  const statuses = Array.isArray(body?.statuses) ? body.statuses : current?.statuses ?? []
  const running = typeof body?.running === 'boolean' ? body.running : current?.running ?? false
  const nIntro = typeof body?.nIntro === 'boolean' ? body.nIntro : current?.nIntro ?? false
  rooms.set(room, { started: true, selected, statuses, running, nIntro })
  return NextResponse.json({ started: true, selected, statuses, running, nIntro })
}
