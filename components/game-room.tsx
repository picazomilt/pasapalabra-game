'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CircleX, Copy, Music2, RotateCcw, Settings2, SkipForward, Smartphone, Sparkles, TimerReset, Volume2, VolumeX, WandSparkles } from 'lucide-react'

type Status = 'pending' | 'active' | 'correct' | 'wrong' | 'passed'
type Letter = { letter: string; clue: string; answer: string; gift: string; status: Status }
type RoomResponse = { started?: boolean; selected?: number; statuses?: Status[] }

const seed: Letter[] = [
  ['A','Algo que Elena siempre lleva en el bolso','abanico','Un detalle con mucho aire'],['B','Un plan para hacer juntos','barco','Una escapada'],['C','Su postre favorito','chocolate','Una caja especial'],['D','Donde empezó todo','domingo','Una carta'],['E','La inicial de la cumpleañera','elena','El regalo principal'],['F','Una flor que le pega mucho','flor','Un ramo'],['G','Algo que nunca falta en una celebración','globos','Una sorpresa decorada'],['H','Un lugar para descansar','hotel','Una noche fuera'],['I','Lo que hace que todo sea inolvidable','ilusión','Un recuerdo'],['J','Una joya pequeña','joya','Un destello'],['L','Una forma de decir te quiero','luz','Un momento a solas'],['M','Su música para bailar','música','Una playlist'],['N','Lo que hoy celebramos','nacimiento','Muchos años felices'],['O','Un abrazo muy grande es...','oso','Un peluche'],['P','Pasa palabra si no la sabes','pasa','Seguimos jugando'],['Q','Algo que se hace con cariño','querer','Un beso'],['R','Lo que Elena se merece hoy','reina','Un día de reina'],['S','Un recuerdo que guardamos','sonrisa','Una foto'],['T','Un viaje que empieza con T','tren','Billetes para dos'],['U','Lo que somos cuando estamos juntos','uno','Tiempo compartido'],['V','Un deseo de cumpleaños','vida','Un brindis'],['Y','Un regalo hecho con...','yema','Un dulce'],['Z','El final de este rosco','zapatillas','Para estrenar']
].map(([letter, clue, answer, gift]) => ({ letter, clue, answer, gift, status: 'pending' }))

function BirthdayMusic({ enabled, setEnabled }: { enabled: boolean; setEnabled: (value: boolean) => void }) {
  const audio = useRef<AudioContext | null>(null)
  const timer = useRef<number | null>(null)
  const play = () => {
    if (enabled) { setEnabled(false); if (timer.current) window.clearInterval(timer.current); return }
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audio.current ??= new Ctx()
    const notes = [261.63,261.63,293.66,261.63,349.23,329.63,261.63,261.63,293.66,261.63,392,349.23]
    let i = 0
    const tick = () => { const ctx = audio.current; if (!ctx) return; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = notes[i++ % notes.length]; osc.type = 'triangle'; gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.45) }
    tick(); timer.current = window.setInterval(tick, 520); setEnabled(true)
  }
  return <button onClick={play} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${enabled ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary'}`}><Music2 size={15}/>{enabled ? 'Música sonando' : 'Poner música'}</button>
}

export function GameRoom({ mode, room }: { mode: 'screen' | 'control'; room: string }) {
  const [letters, setLetters] = useState(seed)
  const [selected, setSelected] = useState(0)
  const [editing, setEditing] = useState(false)
  const [music, setMusic] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const syncedSelected = useRef<number | null>(null)
  const lettersRef = useRef(letters)
  const current = letters[selected]
  useEffect(() => { lettersRef.current = letters }, [letters])
  useEffect(() => {
    if (mode !== 'screen' || !room) return
    const syncRoom = async () => {
      const response = await fetch(`/api/rooms?room=${encodeURIComponent(room)}`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json() as RoomResponse
        if (data.started) {
          setStarted(true)
          setRunning(true)
          if (typeof data.selected === 'number') {
            if (syncedSelected.current !== data.selected) {
              setSelected(data.selected)
              setSeconds(30)
              syncedSelected.current = data.selected
            }
          }
          if (data.statuses?.length === letters.length) setLetters((items) => items.map((item, index) => ({ ...item, status: data.statuses?.[index] ?? item.status })))
        }
      }
    }
    syncRoom()
    const id = window.setInterval(syncRoom, 1000)
    return () => window.clearInterval(id)
  }, [letters.length, mode, room, started])
  useEffect(() => {
    if (!started || !running) return
    const id = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          const nextSelected = (selected + 1) % letters.length
          setSelected(nextSelected)
          if (mode === 'control') {
            syncedSelected.current = nextSelected
            fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room, selected: nextSelected, statuses: lettersRef.current.map((item) => item.status) }) })
          }
          return 30
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [letters.length, mode, room, running, selected])
  const update = (index: number, key: 'clue' | 'answer' | 'gift', value: string) => setLetters((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item))
  const setStatus = (status: Status) => {
    const updatedLetters = letters.map((item, index) => index === selected ? { ...item, status } : item)
    setLetters(updatedLetters)
    fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room, selected, statuses: updatedLetters.map((item) => item.status) }) })
  }
  const next = () => {
    const nextSelected = (selected + 1) % letters.length
    setSelected(nextSelected)
    setSeconds(30)
    setRunning(true)
    fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room, selected: nextSelected, statuses: letters.map((item) => item.status) }) })
  }
  const startGame = async () => {
    const response = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room, selected: 0, statuses: letters.map((item) => item.status) }) })
    if (response.ok) { setStarted(true); setRunning(true) }
  }
  const color = (status: Status) => status === 'correct' ? 'bg-emerald-500 text-white border-emerald-300' : status === 'wrong' ? 'bg-rose-500 text-white border-rose-300' : status === 'passed' ? 'bg-amber-400 text-slate-950 border-amber-200' : status === 'active' ? 'border-primary text-primary bg-card' : 'border-border bg-card text-foreground'
  const completed = useMemo(() => letters.filter((l) => l.status === 'correct').length, [letters])
  const copy = () => navigator.clipboard?.writeText(`${location.origin}/control?room=${room}`)

  if (editing && mode === 'control') return <main className="min-h-screen bg-background p-5 text-foreground md:p-8"><div className="mx-auto max-w-4xl"><button onClick={() => setEditing(false)} className="mb-6 text-sm text-muted-foreground hover:text-foreground">← Volver a la partida</button><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Configuración</p><h1 className="mt-2 font-serif text-4xl">Todas las pistas</h1><p className="mt-2 text-sm text-muted-foreground">Edita de una vez las pistas, respuestas y regalos de Elena.</p></div><button onClick={() => setEditing(false)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Guardar cambios</button></div><div className="mt-8 grid gap-4">{letters.map((item, index) => <div key={item.letter} className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full border font-serif text-xl ${color(item.status)}`}>{item.letter}</span><span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Regalo de la letra {item.letter}</span></div><div className="grid gap-3 md:grid-cols-3">{(['clue','answer','gift'] as const).map((key) => <label key={key} className="text-xs font-semibold text-muted-foreground">{key === 'clue' ? 'Pista' : key === 'answer' ? 'Respuesta' : 'Regalo'}<input value={item[key]} onChange={(e) => update(index, key, e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>)}</div></div>)}</div></div></main>

  if (mode === 'screen' && !started) return <main className="projection-bg flex min-h-screen items-center justify-center p-6 text-foreground"><section className="w-full max-w-xl rounded-3xl border border-primary/30 bg-card/80 p-8 text-center shadow-2xl"><Sparkles className="mx-auto text-primary" size={28}/><p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-primary">Partida preparada</p><h1 className="mt-3 font-serif text-5xl">Esperando a control</h1><p className="mt-4 text-muted-foreground">Pulsa Iniciar desde el móvil para comenzar.</p><div className="mt-8 rounded-2xl border border-border bg-background/60 p-5"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Código de sala</p><strong className="mt-2 block font-mono text-4xl tracking-[0.2em] text-primary">{room}</strong></div></section></main>

  return <main className={`min-h-screen text-foreground ${mode === 'screen' ? 'projection-bg p-5 md:p-8' : 'bg-background p-5'}`}><header className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Una sorpresa para Elena</p><h1 className="mt-1 font-serif text-3xl md:text-4xl">Cumpleaños Elena</h1></div><div className="flex items-center gap-2"><BirthdayMusic enabled={music} setEnabled={setMusic}/>{mode === 'screen' && <button onClick={copy} className="rounded-full border border-border bg-card p-3 hover:border-primary" aria-label="Copiar enlace de control"><Copy size={16}/></button>}</div></header>{mode === 'screen' ? <section className="mx-auto mt-8 grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(500px,1fr)_380px]"><div className="relative mx-auto flex aspect-square w-full max-w-[700px] items-center justify-center rounded-full border border-primary/30 bg-card/70 shadow-[0_0_80px_hsl(var(--primary)/.12)]"><div className="absolute inset-7 rounded-full border border-primary/20"/><div className="absolute inset-16 rounded-full border border-border/40"/>{letters.map((item, i) => { const angle = 360 / letters.length * i - 90; return <button key={item.letter} onClick={() => setSelected(i)} aria-label={`Letra ${item.letter}`} className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold transition-all md:h-14 md:w-14 md:text-lg ${color(item.status)} ${i === selected ? 'scale-125 shadow-[0_0_24px_hsl(var(--primary)/.5)]' : ''}`} style={{ left: `${50 + 42 * Math.cos(angle * Math.PI / 180)}%`, top: `${50 + 42 * Math.sin(angle * Math.PI / 180)}%` }}>{item.letter}</button> })}<div className="z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-primary/40 bg-background text-center shadow-xl md:h-48 md:w-48"><WandSparkles className="mb-2 text-primary" size={22}/><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ahora toca</span><strong className="font-serif text-6xl text-primary">{current.letter}</strong></div></div><div className="rounded-3xl border border-primary/20 bg-card/80 p-7 shadow-2xl"><div className="flex items-center justify-between"><p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Pista de la letra {current.letter}</p><div className={`font-mono text-2xl font-bold ${seconds < 6 ? 'text-destructive' : 'text-foreground'}`}>{String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}</div></div><h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">{current.clue}</h2><p className="mt-5 text-sm text-muted-foreground">Cada respuesta esconde un regalo.</p><div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4"><span className="text-sm text-muted-foreground">Aciertos</span><strong className="font-serif text-3xl text-primary">{completed}<span className="text-base text-muted-foreground"> / {letters.length}</span></strong></div><div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4"><span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Conecta el móvil</span><strong className="font-mono text-xl tracking-widest text-primary">{room}</strong></div></div></section> : <section className="mx-auto max-w-lg"><div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4"><Smartphone className="text-primary"/><div><p className="font-semibold">Panel de control</p><p className="text-sm text-muted-foreground">Sala {room || 'sin código'} · tú decides</p></div></div><button onClick={startGame} disabled={started || !room} className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground disabled:opacity-50">{started ? 'Partida iniciada' : 'Iniciar partida'}</button><div className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-xl"><div className="flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Letra actual</p><span className="font-serif text-7xl text-primary">{current.letter}</span></div><button onClick={next} className="rounded-full border border-border p-4 hover:border-primary" aria-label="Siguiente letra"><SkipForward size={20}/></button></div><p className="mt-3 text-lg leading-7">{current.clue}</p><p className="mt-2 text-sm text-muted-foreground">Regalo: {current.gift}</p><div className="mt-6 grid grid-cols-3 gap-2"><button onClick={() => setStatus('correct')} className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-500 px-2 py-4 text-xs font-semibold text-white"><Check size={21}/>Acierto</button><button onClick={() => setStatus('wrong')} className="flex flex-col items-center gap-2 rounded-2xl bg-rose-500 px-2 py-4 text-xs font-semibold text-white"><CircleX size={21}/>Fallo</button><button onClick={() => setStatus('passed')} className="flex flex-col items-center gap-2 rounded-2xl bg-amber-400 px-2 py-4 text-xs font-semibold text-slate-950"><SkipForward size={21}/>Pasa</button></div><div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 py-2"><span className="text-sm text-muted-foreground">Cambio automático en</span><strong className="font-mono text-lg text-primary">{seconds}s</strong><button onClick={() => { setSeconds(30); setRunning(true) }} className="rounded-xl border border-border p-3" aria-label="Reiniciar temporizador"><TimerReset size={18}/></button></div></div><button onClick={() => setEditing(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-sm font-semibold text-primary hover:bg-primary/20"><Settings2 size={17}/>Editar todas las pistas y regalos</button><button onClick={() => { setLetters(seed); setSelected(0); setSeconds(30); setRunning(true) }} className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground"><RotateCcw size={15}/>Reiniciar partida</button></section>}</main>
}
