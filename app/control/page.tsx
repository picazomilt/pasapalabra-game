import { GameRoom } from '@/components/game-room'

export default async function ControlPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const params = await searchParams
  return <GameRoom mode="control" room={params.room ?? ''} />
}
