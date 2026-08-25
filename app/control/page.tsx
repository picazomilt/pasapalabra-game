import { ControlJoin } from '@/components/control-join'
import { GameRoom } from '@/components/game-room'

export default async function ControlPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const params = await searchParams
  return params.room ? <GameRoom mode="control" room={params.room} /> : <ControlJoin />
}
