import { GameRoom } from '@/components/game-room'

export default async function ControlPage({ searchParams }: { searchParams: Promise<{ room?: string; time?: string }> }) {
  const params = await searchParams
  const time = params.time ? Number(params.time) : undefined
  return <GameRoom mode="control" room={params.room ?? ''} timePerQuestion={time} />
}
