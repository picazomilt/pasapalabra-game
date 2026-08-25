'use client'

import { FormEvent, useEffect, useState } from 'react'
import { GameRoom } from '@/components/game-room'

function ControlEntry({ initialRoom }: { initialRoom: string }) {
  const [room, setRoom] = useState(initialRoom)
  const [joinedRoom, setJoinedRoom] = useState(initialRoom)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('room')?.trim().toUpperCase()
    if (code) {
      setRoom(code)
      setJoinedRoom(code)
    }
  }, [])

  const joinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = room.trim().toUpperCase()
    if (code) setJoinedRoom(code)
  }

  if (joinedRoom) return <GameRoom mode="control" room={joinedRoom} />

  return <main className="projection-bg flex min-h-screen items-center justify-center p-6 text-foreground"><form onSubmit={joinRoom} className="w-full max-w-md rounded-3xl border border-primary/30 bg-card/80 p-8 shadow-2xl"><p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Control de partida</p><h1 className="mt-3 font-serif text-5xl">Conectar sala</h1><p className="mt-4 text-muted-foreground">Introduce el código que aparece en la pantalla.</p><label className="mt-8 block text-sm font-semibold">Código de sala<input value={room} onChange={(event) => setRoom(event.target.value)} autoFocus autoComplete="off" placeholder="ABC123" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-xl uppercase tracking-widest text-foreground outline-none focus:ring-2 focus:ring-ring" /></label><button type="submit" className="mt-5 w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground">Entrar al control</button></form></main>
}

export default function ControlPage() {
  return <ControlEntry initialRoom="" />
}
