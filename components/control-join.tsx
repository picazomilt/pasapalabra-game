'use client'

import { useState } from 'react'

export function ControlJoin() {
  const [code, setCode] = useState('')

  return (
    <main className="projection-bg flex min-h-screen items-center justify-center p-5 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-6 shadow-2xl md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Panel de control</p>
        <h1 className="mt-3 font-serif text-4xl">Conectar partida</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Escribe el código que aparece en el ordenador para manejar el rosco desde tu móvil.</p>
        <label htmlFor="join-code" className="mt-8 block text-sm font-semibold">Código de la partida</label>
        <input id="join-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} onKeyDown={(event) => { if (event.key === 'Enter' && code) window.location.href = `/control?room=${code}` }} placeholder="Ej. ELENA1" autoFocus autoComplete="off" className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-4 font-mono text-xl uppercase tracking-[0.2em] text-foreground outline-none focus:ring-2 focus:ring-ring" />
        <button type="button" onClick={() => { const value = (document.getElementById('join-code') as HTMLInputElement).value.trim(); if (value) window.location.href = `/control?room=${value}` }} className="mt-4 block w-full rounded-2xl bg-primary px-4 py-4 text-center font-semibold text-primary-foreground transition hover:scale-[1.02]">Entrar al control</button>
        <a href="/" className="mt-5 block text-center text-sm text-muted-foreground hover:text-foreground">Volver a la pantalla inicial</a>
      </section>
    </main>
  )
}
