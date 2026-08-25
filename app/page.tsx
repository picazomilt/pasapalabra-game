'use client'

import { useMemo, useState } from 'react'
import { Clock3, Gift, Sparkles } from 'lucide-react'
import { GameRoom } from '@/components/game-room'

export default function Page() {
  const [started, setStarted] = useState(false)

  const initialCode = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), [])
  if (!started) {
    return (
      <main className="projection-bg min-h-screen px-6 py-10 text-foreground">
        <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center text-center">
          <div className="mb-8 flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 font-mono text-xs uppercase tracking-[0.25em] text-primary"><Sparkles size={15}/> Una sorpresa para Elena <Sparkles size={15}/></div>
          <h1 className="font-serif text-6xl leading-[0.9] text-balance md:text-9xl">Cumpleaños<br/><span className="text-primary">Elena</span></h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">Un rosco de palabras para descubrir sus regalos, una letra cada vez.</p>
          <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card/70 p-4"><span className="font-serif text-2xl text-primary">A</span><p className="mt-2 text-xs text-muted-foreground">Acierta la pista</p></div><div className="rounded-2xl border border-border bg-card/70 p-4"><Clock3 className="text-primary" size={24}/><p className="mt-2 text-xs text-muted-foreground">Juega contra el tiempo</p></div><div className="rounded-2xl border border-border bg-card/70 p-4"><Gift className="text-primary" size={24}/><p className="mt-2 text-xs text-muted-foreground">Descubre el regalo</p></div></div>
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
