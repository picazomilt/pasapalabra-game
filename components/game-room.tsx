"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CircleX,
  Copy,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";

type Status = "pending" | "active" | "correct" | "wrong" | "passed";
type Letter = {
  letter: string;
  clue: string;
  answer: string;
  gift: string;
  status: Status;
};
type RoomResponse = {
  started?: boolean;
  selected?: number;
  statuses?: Status[];
  running?: boolean;
  nIntro?: boolean;
};

const getNextSelected = (from: number, items: Letter[]) => {
  const nUnlocked = items
    .filter((item) => item.letter !== "N")
    .every((item) => item.status === "correct");
  for (let offset = 1; offset <= items.length; offset += 1) {
    const nextSelected = (from + offset) % items.length;
    const item = items[nextSelected];
    if (
      item.status !== "correct" &&
      (item.letter !== "N" || nUnlocked)
    )
      return nextSelected;
  }
  return from;
};

const seed: Letter[] = [
  [
    "A",
    "Contiene la A: Calzado destinado a acompañar a la protagonista en una actividad que consiste básicamente en desplazarse voluntariamente durante una cantidad considerable de tiempo, aunque nadie la persiga.",
    "Zapas",
    "",
  ],
  [
    "B",
    "Empieza por B: Complemento diseñado para transportar objetos personales sin necesidad de convertir los bolsillos en almacenes de emergencia.",
    "Bandolera",
    "",
  ],
  [
    "C",
    "Empieza por C: Aunque técnicamente es algo que se come, para nosotros puede considerarse perfectamente una actividad de ocio, especialmente cuando decidimos acudir a nuestro sitio de confianza en Imaginalia.",
    "Crepes",
    "",
  ],
  [
    "D",
    "Contiene la D: Calzado que puede pasar de ser un simple complemento a convertirse en equipamiento oficial para una cita o una salida especial.",
    "Sandalias",
    "",
  ],
  [
    "E",
    "Empieza por E: Ciudad portuguesa que forma parte de nuestro historial de escapadas y de uno de esos recuerdos que hemos construido juntos.",
    "Évora",
    "",
  ],
  [
    "H",
    "Empieza por H: Lugar que probablemente no aparezca entre nuestros destinos turísticos soñados, pero que puede convertirse en una parada bastante importante cuando el hambre aparece durante un viaje.",
    "Hellín",
    "",
  ],
  [
    "I",
    "Contiene la I: Prenda destinada a acompañar a la protagonista durante uno de los momentos del día en los que no tiene ninguna obligación de ir guapa, aunque probablemente lo consiga igualmente. Además, su diseño está inspirado en un pequeño chef francés bastante peculiar.",
    "Pijama",
    "",
  ],
  [
    "J",
    "Empieza por J: Elemento que probamos por primera vez durante una de nuestras escapadas. La organización considera que fue una experiencia memorable, aunque la concursante no pareció compartir del todo dicha valoración.",
    "Jacuzzi",
    "",
  ],
  [
    "K",
    "Empieza por K: Disciplina que forma parte de la historia de la protagonista y en la que, por cierto, tiene bastante más experiencia que el presentador.",
    "Karate",
    "",
  ],
  [
    "L",
    "Contiene la L: Juego de mesa cuyo nombre parece haber sido creado específicamente para la ocasión que nos ocupa.",
    "Mi Cumple",
    "",
  ],
  [
    "M",
    "Empieza por M: Recipiente portátil destinado a transportar todo aquello que una persona considera imprescindible para salir de casa, incluyendo probablemente cosas que descubrirá que necesitaba cinco minutos después de salir.",
    "Mochila",
    "",
  ],
  [
    "N",
    "Contiene la N: Pase que permitirá repetir próximamente una experiencia que ya vivimos el año pasado, cuando disfrutamos juntos de la música de un artista que, curiosamente, comparte una colaboración con la protagonista de este premio.",
    "Entradas de Marta Santos",
    "",
  ],
  [
    "O",
    "Empieza por O: Lugar que quizá no estaba destinado a convertirse en un recuerdo especial, pero donde tuve la suerte de compartir una jornada de trabajo contigo y con mi padre.",
    "Ontur",
    "",
  ],
  [
    "P",
    "Empieza por P: Sustancia cuya misión principal es conseguir que una persona huela especialmente bien, aunque su verdadera utilidad podría ser conseguir que otra persona quiera acercarse un poquito más.",
    "Perfume",
    "",
  ],
  [
    "Q",
    "Contiene la Q: Prenda que puede servir para protegerse del frío, pero que también puede utilizarse para completar un conjunto y provocar un «qué guapa vas».",
    "Chaqueta vaquera",
    "",
  ],
  [
    "T",
    "Contiene la T: Calzado que aumenta considerablemente la altura de quien lo lleva y, en determinadas circunstancias, también el peligro de que su acompañante se quede mirándola demasiado.",
    "Botas altas de tacón",
    "",
  ],
  [
    "U",
    "Contiene la U: Categoría a la que pertenece un regalo que puede conseguir que una tranquila tarde en pareja termine convirtiéndose en una batalla por encontrar antes que nadie determinados símbolos. La organización recomienda mantener la calma y recordar que ganar no da derecho a presumir durante el resto del día.",
    "Juego de mesa",
    "",
  ],
  [
    "V",
    "Empieza por V: Actividad que hemos hecho juntos, que nos encanta compartir y que representa una de las cosas que más ansiamos poder hacer durante los próximos años: descubrir mundo, conocer lugares nuevos y seguir acumulando recuerdos juntos.",
    "Viajar",
    "",
  ],
  [
    "Z",
    "Contiene la Z: Municipio manchego al que acompañaste a David a un bolo, donde tuvo que encargarse de un cañón de seguimiento y donde, antes de la gala, la meteorología decidió participar también en el espectáculo.",
    "Tarazona de la Mancha",
    "",
  ],
].map(([letter, clue, answer, gift]) => ({
  letter,
  clue,
  answer,
  gift,
  status: "pending",
}));

function BirthdayMusic({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}) {
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);
  const play = () => {
    if (enabled) {
      setEnabled(false);
      if (timer.current) window.clearInterval(timer.current);
      return;
    }
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audio.current ??= new Ctx();
    const notes = [
      261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 261.63, 261.63, 293.66,
      261.63, 392, 349.23,
    ];
    let i = 0;
    const tick = () => {
      const ctx = audio.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = notes[i++ % notes.length];
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    };
    tick();
    timer.current = window.setInterval(tick, 520);
    setEnabled(true);
  };
  return (
    <button
      onClick={play}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${enabled ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
    >
      <Music2 size={15} />
      {enabled ? "Música sonando" : "Poner música"}
    </button>
  );
}

export function GameRoom({
  mode,
  room,
}: {
  mode: "screen" | "control";
  room: string;
}) {
  const [letters, setLetters] = useState(seed);
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const [music, setMusic] = useState(false);
  const [seconds, setSeconds] = useState(50);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [nIntro, setNIntro] = useState(false);
  const [advanceError, setAdvanceError] = useState("");
  const syncedSelected = useRef<number | null>(null);
  const lettersRef = useRef(letters);
  const current = letters[selected];
  useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);
  useEffect(() => {
    if (mode !== "screen" || !room) return;
    const syncRoom = async () => {
      const response = await fetch(
        `/api/rooms?room=${encodeURIComponent(room)}`,
        { cache: "no-store" },
      );
      if (response.ok) {
        const data = (await response.json()) as RoomResponse;
        if (data.started) {
          setStarted(true);
          setRunning(data.running ?? false);
          setNIntro(data.nIntro ?? false);
          if (typeof data.selected === "number") {
            if (syncedSelected.current !== data.selected) {
              setSelected(data.selected);
              setSeconds(50);
              syncedSelected.current = data.selected;
            }
          }
          if (data.statuses?.length === letters.length)
            setLetters((items) =>
              items.map((item, index) => ({
                ...item,
                status: data.statuses?.[index] ?? item.status,
              })),
            );
        }
      }
    };
    syncRoom();
    const id = window.setInterval(syncRoom, 1000);
    return () => window.clearInterval(id);
  }, [letters.length, mode, room, started]);
  useEffect(() => {
    if (!started || !running) return;
    const id = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          const nextSelected = getNextSelected(selected, lettersRef.current);
          setSelected(nextSelected);
          const enteringN = lettersRef.current[nextSelected]?.letter === "N";
          setNIntro(enteringN);
          setRunning(false);
          if (mode === "control") {
            syncedSelected.current = nextSelected;
            fetch("/api/rooms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                room,
                selected: nextSelected,
                running: false,
                nIntro: enteringN,
                statuses: lettersRef.current.map((item) => item.status),
              }),
            });
          }
          return 50;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [letters.length, mode, room, running, selected]);
  const update = (
    index: number,
    key: "clue" | "answer" | "gift",
    value: string,
  ) =>
    setLetters((items) =>
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const setStatus = (status: Status) => {
    const updatedLetters = letters.map((item, index) =>
      index === selected ? { ...item, status } : item,
    );
    setLetters(updatedLetters);
    setAdvanceError("");
    setRunning(true);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        selected,
        running: true,
        statuses: updatedLetters.map((item) => item.status),
      }),
    });
  };
  const next = () => {
    if (letters[selected]?.status === "pending") {
      setAdvanceError("Marca Acierto, Fallo o Pasa antes de continuar.");
      return;
    }
    const nextSelected = getNextSelected(selected, letters);
    setAdvanceError("");
    setSelected(nextSelected);
    setSeconds(50);
    const enteringN = letters[nextSelected]?.letter === "N";
    setNIntro(enteringN);
    setRunning(!enteringN);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        selected: nextSelected,
        running: !enteringN,
        nIntro: enteringN,
        statuses: letters.map((item) => item.status),
      }),
    });
  };
  const startGame = async () => {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        selected: 0,
        running: true,
        nIntro: false,
        statuses: letters.map((item) => item.status),
      }),
    });
    if (response.ok) {
      setStarted(true);
      setRunning(true);
      setSeconds(50);
      setNIntro(false);
    }
  };
  const continueToN = () => {
    const nIndex = letters.findIndex((item) => item.letter === "N");
    if (nIndex < 0) return;
    setSelected(nIndex);
    setNIntro(false);
    setSeconds(50);
    setRunning(true);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        selected: nIndex,
        running: true,
        nIntro: false,
        statuses: letters.map((item) => item.status),
      }),
    });
  };
  const pauseResume = () => {
    const nextRunning = !running;
    setRunning(nextRunning);
    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        selected,
        running: nextRunning,
        statuses: letters.map((item) => item.status),
      }),
    });
  };
  const isNUnlocked = letters
    .filter((item) => item.letter !== "N")
    .every((item) => item.status === "correct");
  const color = (status: Status) =>
    status === "correct"
      ? "bg-emerald-500 text-white border-emerald-300"
      : status === "wrong"
        ? "bg-rose-500 text-white border-rose-300"
        : status === "passed"
          ? "bg-amber-400 text-slate-950 border-amber-200"
          : status === "active"
            ? "border-primary text-primary bg-card"
            : "border-border bg-card text-foreground";
  const completed = useMemo(
    () => letters.filter((l) => l.status === "correct").length,
    [letters],
  );
  const finished = letters.length > 0 && completed === letters.length;
  const copy = () =>
    navigator.clipboard?.writeText(`${location.origin}/control?room=${room}`);

  if (editing && mode === "control")
    return (
      <main className="min-h-screen bg-background p-5 text-foreground md:p-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => setEditing(false)}
            className="mb-6 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a la partida
          </button>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                Configuración
              </p>
              <h1 className="mt-2 font-serif text-4xl">Todas las pistas</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Edita de una vez las pistas, respuestas y regalos de Elena.
              </p>
            </div>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Guardar cambios
            </button>
          </div>
          <div className="mt-8 grid gap-4">
            {letters.map((item, index) => (
              <div
                key={item.letter}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border font-serif text-xl ${color(item.status)}`}
                  >
                    {item.letter}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Regalo de la letra {item.letter}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {(["clue", "answer", "gift"] as const).map((key) => (
                    <label
                      key={key}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      {key === "clue"
                        ? "Pista"
                        : key === "answer"
                          ? "Respuesta"
                          : "Regalo"}
                      <input
                        value={item[key]}
                        onChange={(e) => update(index, key, e.target.value)}
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );

  if (mode === "screen" && !started)
    return (
      <main className="projection-bg flex min-h-screen items-center justify-center p-6 text-foreground">
        <section className="w-full max-w-xl rounded-3xl border border-primary/30 bg-card/80 p-8 text-center shadow-2xl">
          <Sparkles className="mx-auto text-primary" size={28} />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Partida preparada
          </p>
          <h1 className="mt-3 font-serif text-5xl">Esperando a control</h1>
          <p className="mt-4 text-muted-foreground">
            Pulsa Iniciar desde el móvil para comenzar.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-background/60 p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Código de sala
            </p>
            <strong className="mt-2 block font-mono text-4xl tracking-[0.2em] text-primary">
              {room}
            </strong>
          </div>
        </section>
      </main>
    );

  if (nIntro)
    return (
      <main className="projection-bg flex min-h-screen items-center justify-center p-6 text-foreground">
        <section className="w-full max-w-2xl rounded-3xl border border-primary/30 bg-card/80 p-10 text-center shadow-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">
            El rosco continúa
          </p>
          <h1 className="mt-5 font-serif text-5xl md:text-7xl">Y POR ÚLTIMO...</h1>
          {mode === "control" ? (
            <button
              onClick={continueToN}
              className="mt-10 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground"
            >
              Continuar a la N
            </button>
          ) : (
            <p className="mt-6 text-muted-foreground">Pulsa Continuar desde el controlador.</p>
          )}
        </section>
      </main>
    );

  if (finished && mode === "screen")
    return (
      <main className="projection-bg flex min-h-screen items-center justify-center p-6 text-foreground">
        <section className="w-full max-w-3xl rounded-3xl border border-primary/30 bg-card/80 p-8 text-center shadow-2xl md:p-12">
          <Sparkles className="mx-auto text-primary" size={32} />
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.35em] text-primary">
            Rosco completado
          </p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl">
            FELIZ CUMPLEAÑOSSS
          </h1>
          <div className="mx-auto mt-8 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/tznBgIGSi98?autoplay=1&rel=0"
              title="Canción de cumpleaños"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </section>
      </main>
    );

  return (
    <main
      className={`min-h-screen text-foreground ${mode === "screen" ? "projection-bg p-5 md:p-8" : "bg-background p-5"}`}
    >
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Una sorpresa para Elena
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">
            XXIII Cumpleaños de la concursante
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <BirthdayMusic enabled={music} setEnabled={setMusic} />
          {mode === "screen" && (
            <button
              onClick={copy}
              className="rounded-full border border-border bg-card p-3 hover:border-primary"
              aria-label="Copiar enlace de control"
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </header>
      {mode === "screen" ? (
        <section className="mx-auto mt-8 grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(500px,1fr)_380px]">
          <div className="relative mx-auto flex aspect-square w-full max-w-[700px] items-center justify-center rounded-full border border-primary/30 bg-card/70 shadow-[0_0_80px_hsl(var(--primary)/.12)]">
            <div className="absolute inset-7 rounded-full border border-primary/20" />
            <div className="absolute inset-16 rounded-full border border-border/40" />
            {letters.map((item, i) => {
              const angle = (360 / letters.length) * i - 90;
              return (
                <button
                  key={item.letter}
                  onClick={() =>
                    (item.letter !== "N" || isNUnlocked) && setSelected(i)
                  }
                  aria-label={`Letra ${item.letter}`}
                  disabled={item.letter === "N" && !isNUnlocked}
                  className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold transition-all md:h-14 md:w-14 md:text-lg ${color(item.status)} ${i === selected ? "scale-125 shadow-[0_0_24px_hsl(var(--primary)/.5)]" : ""}`}
                  style={{
                    left: `${50 + 42 * Math.cos((angle * Math.PI) / 180)}%`,
                    top: `${50 + 42 * Math.sin((angle * Math.PI) / 180)}%`,
                  }}
                >
                  {item.letter}
                </button>
              );
            })}
            <div className="z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-primary/40 bg-background text-center shadow-xl md:h-48 md:w-48">
              <WandSparkles className="mb-2 text-primary" size={22} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Ahora toca
              </span>
              <strong className="font-serif text-6xl text-primary">
                {current.letter}
              </strong>
            </div>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-card/80 p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                Pista de la letra {current.letter}
              </p>
              <div
                className={`font-mono text-2xl font-bold ${seconds < 6 ? "text-destructive" : "text-foreground"}`}
              >
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </div>
            </div>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              {current.clue}
            </h2>
            <p className="mt-5 text-sm text-muted-foreground">
              Cada respuesta esconde un regalo.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
              <span className="text-sm text-muted-foreground">Aciertos</span>
              <strong className="font-serif text-3xl text-primary">
                {completed}
                <span className="text-base text-muted-foreground">
                  {" "}
                  / {letters.length}
                </span>
              </strong>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Conecta el móvil
              </span>
              <strong className="font-mono text-xl tracking-widest text-primary">
                {room}
              </strong>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-lg">
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <Smartphone className="text-primary" />
            <div>
              <p className="font-semibold">Panel de control</p>
              <p className="text-sm text-muted-foreground">
                Sala {room || "sin código"} · tú decides
              </p>
            </div>
          </div>
          <button
            onClick={startGame}
            disabled={started || !room}
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground disabled:opacity-50"
          >
            {started ? "Partida iniciada" : "Iniciar partida"}
          </button>
          <div className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Letra actual
                </p>
                <span className="font-serif text-7xl text-primary">
                  {current.letter}
                </span>
              </div>
              <button
                onClick={next}
                className="rounded-full border border-border p-4 hover:border-primary"
                aria-label="Siguiente letra"
              >
                <SkipForward size={20} />
              </button>
            </div>
            <p className="mt-3 text-lg leading-7">{current.clue}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Regalo: {current.gift}
            </p>
            {advanceError && (
              <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-400">
                {advanceError}
              </p>
            )}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                onClick={() => setStatus("correct")}
                disabled={current.status === "correct"}
                className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-500 px-2 py-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check size={21} />
                Acierto
              </button>
              <button
                onClick={() => setStatus("wrong")}
                disabled={current.status === "correct"}
                className="flex flex-col items-center gap-2 rounded-2xl bg-rose-500 px-2 py-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CircleX size={21} />
                Fallo
              </button>
              <button
                onClick={() => setStatus("passed")}
                disabled={current.status === "correct"}
                className="flex flex-col items-center gap-2 rounded-2xl bg-amber-400 px-2 py-4 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SkipForward size={21} />
                Pasa
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                Cambio automático en
              </span>
              <strong className="font-mono text-lg text-primary">
                {seconds}s
              </strong>
              <button
                onClick={pauseResume}
                className="rounded-xl border border-border p-3"
                aria-label={running ? "Pausar temporizador" : "Reanudar temporizador"}
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-sm font-semibold text-primary hover:bg-primary/20"
          >
            <Settings2 size={17} />
            Editar todas las pistas y regalos
          </button>
          <button
            onClick={() => {
              setLetters(seed);
              setSelected(0);
              setSeconds(50);
              setRunning(false);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={15} />
            Reiniciar partida
          </button>
        </section>
      )}
    </main>
  );
}
