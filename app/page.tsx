'use client'

import { useMemo, useState } from 'react'
import { GameRoom } from '@/components/game-room'

export default function Page() {
  const [started, setStarted] = useState(false)

  const initialCode = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), [])
  if (!started) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">Una sorpresa para Elena</p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.95] text-balance md:text-8xl">Cumpleaños Elena</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">Un rosco de palabras para descubrir sus regalos, una letra cada vez.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition-transform hover:scale-105" onClick={() => setStarted(true)}>Crear partida</button>
            <a className="rounded-full border border-border px-7 py-4 font-semibold hover:bg-muted" href="/control">Entrar como control</a>
          </div>
          <p className="mt-8 font-mono text-xs text-muted-foreground">El ordenador mostrará un código para conectar tu teléfono</p>
        </div>
      </main>
    )
  }
  return <GameRoom mode="screen" room={initialCode} />
}
