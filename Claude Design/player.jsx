// player.jsx — Mobile screens (login, lobby, buzzer, QCM, score)

// ─── Shell ──────────────────────────────────────────────────────────────────
function PlayerShell({ children, glass }) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden no-tap-highlight"
         style={{ '--g': glass / 100 }}>
      <div className="phone-aurora" />
      {children}
    </div>
  );
}

function StatusBar({ center = 'FAMILYQUIZZ' }) {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2 text-[13px] font-semibold text-white/80 font-mono">
      <span>9:41</span>
      <span className="tracking-widest text-white/45">{center}</span>
      <span>●●●●</span>
    </div>
  );
}

// ─── 1. CONNEXION ───────────────────────────────────────────────────────────
function PlayerLogin({ tweaks }) {
  const [name, setName] = React.useState('Léa');
  const [loading, setLoading] = React.useState(false);

  const submit = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <PlayerShell glass={tweaks.glass}>
      <StatusBar />
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-6 pb-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-soft">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6fe0c4] animate-pulse" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-white/75 font-medium">Soirée en cours</span>
          </div>
          <div>
            <h1 className="text-[44px] leading-[1.02] font-bold tracking-tight">
              Rejoins<br />
              <span style={{
                background: 'linear-gradient(110deg, #ff8466 0%, #f5b54a 55%, #6fe0c4 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>la famille</span>
            </h1>
            <p className="mt-3 text-white/60 text-[15px] leading-snug max-w-[280px]">
              Choisis ton pseudo. Le Maître du jeu lancera la partie quand tout le monde est prêt.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <label className="block text-[10px] tracking-[0.18em] uppercase text-white/50 font-medium mb-1.5">Ton pseudo</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-transparent text-[22px] font-semibold tracking-tight outline-none placeholder-white/30"
              placeholder="Ex. Tonton Marc" disabled={loading} />
          </div>

          <button onClick={submit} disabled={loading || !name.trim()}
            className="w-full mt-3 h-[60px] rounded-2xl font-semibold text-[17px] tracking-tight transition-all relative overflow-hidden active:scale-[.985]"
            style={{
              background: loading ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(135deg, #ff8466 0%, #f5b54a 100%)',
              boxShadow: loading ? 'none' : '0 14px 36px -8px rgba(255,132,102,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
              color: '#fff',
            }}>
            {loading
              ? <span className="flex items-center justify-center gap-3 text-white/80"><DotsLoader color="#f5b54a" /><span>En attente…</span></span>
              : 'Prêt·e à jouer'}
          </button>

          <div className="text-center text-[11px] text-white/35 mt-2">
            10 joueurs connectés · Manche 1/5
          </div>
        </div>
      </div>
      <HomeBar />
    </PlayerShell>
  );
}

// ─── 2. SALLE D'ATTENTE ──────────────────────────────────────────────────────
function PlayerLobby({ tweaks }) {
  const allPlayers = [
    { n: 'Léa',         c: '#ff8466', ready: true,  delay: 0    },
    { n: 'Tonton Marc', c: '#f5b54a', ready: true,  delay: 0.3  },
    { n: 'Mamie',       c: '#6fe0c4', ready: true,  delay: 0.6  },
    { n: 'Théo',        c: '#7eb8ff', ready: true,  delay: 0.9  },
    { n: 'Sophie',      c: '#ff6f9c', ready: true,  delay: 1.2  },
    { n: 'Papy Jean',   c: '#f5b54a', ready: true,  delay: 1.5  },
    { n: 'Camille',     c: '#7eb8ff', ready: false, delay: 1.8  },
    { n: 'Hugo',        c: '#6fe0c4', ready: false, delay: 2.1  },
    { n: 'Élise',       c: '#ff8466', ready: false, delay: 2.4  },
    { n: 'Antoine',     c: '#ff6f9c', ready: false, delay: 2.7  },
  ];
  const ready = allPlayers.filter(p => p.ready).length;

  return (
    <PlayerShell glass={tweaks.glass}>
      <StatusBar center="SALLE D'ATTENTE" />
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-4 pb-10">

        {/* Hero */}
        <div className="mb-6">
          <div className="text-[11px] tracking-[0.18em] uppercase text-white/55 font-mono mb-2">Cinéma 80s · Familial</div>
          <h2 className="text-[30px] font-bold tracking-tight leading-tight">Prêt·e !<br/>
            <span className="text-white/45 text-[22px] font-semibold">En attente du Maître…</span>
          </h2>
        </div>

        {/* Progress */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-white/60 font-mono tracking-wide">Joueurs prêts</span>
            <span className="font-bold text-[18px] tabular-nums">{ready}<span className="text-white/40 font-normal text-[14px]">/{allPlayers.length}</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div style={{
              height: '100%',
              width: `${(ready / allPlayers.length) * 100}%`,
              background: 'linear-gradient(90deg, #ff8466, #6fe0c4)',
              transition: 'width .6s ease',
            }} />
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            {allPlayers.map((p, i) => (
              <div key={p.n}
                className="glass-soft rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                style={{ animation: `rise-in .4s ease ${p.delay}s both` }}>
                <Avatar name={p.n} tone={p.c} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate leading-tight">{p.n}</div>
                </div>
                {p.ready
                  ? <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#6fe0c4' }}>
                      <Icon.Check className="w-3 h-3 text-[#0d2820]" />
                    </div>
                  : <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white/10">
                      <DotsLoader color="rgba(255,255,255,0.4)" />
                    </div>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-[12px] font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8466] animate-pulse" />
          Le Maître lance quand tout le monde est là
        </div>
      </div>
      <HomeBar />
    </PlayerShell>
  );
}

// ─── 3. BUZZER — full-screen, countdown, micro-animation ─────────────────────
function PlayerBuzzer({ tweaks, state = 'active', onBuzz, otherBuzzer = 'Tonton Marc' }) {
  const [pressed, setPressed] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const [countdown, setCountdown] = React.useState(null);

  // Reset on state change
  React.useEffect(() => {
    setPressed(false);
    setFlash(false);
    if (state === 'active') {
      // 3-2-1 countdown before buzz
      setCountdown(3);
      let n = 3;
      const timer = setInterval(() => {
        n -= 1;
        if (n <= 0) { clearInterval(timer); setCountdown(null); }
        else setCountdown(n);
      }, 750);
      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  }, [state]);

  const isCountingDown = state === 'active' && countdown !== null;
  const isReady = state === 'active' && countdown === null && !pressed;

  // Tint from theme color (passed via tweaks)
  const themeColor = tweaks.themeColor || '#ff8466';

  const countdownColor = countdown === 3 ? '#ef5973' : countdown === 2 ? '#f5b54a' : '#6fe0c4';

  const cfg = {
    wait: {
      label: 'PRÉPARATION', sub: 'Question dans quelques instants…',
      core: 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      border: 'rgba(255,255,255,0.18)', glow: 'rgba(0,0,0,0)',
      txt: 'rgba(255,255,255,0.55)', sub_txt: 'rgba(255,255,255,0.40)',
      pillTone: 'neutral', pillTxt: 'ATTENTE',
    },
    active: {
      label: isCountingDown ? String(countdown) : 'BUZZ',
      sub: isCountingDown ? 'Prépare-toi…' : 'Appuie maintenant !',
      core: isCountingDown
        ? `linear-gradient(160deg, ${countdownColor}40 0%, ${countdownColor}20 100%)`
        : `linear-gradient(160deg, ${themeColor}38 0%, ${themeColor}22 50%, rgba(255,111,156,0.24) 100%)`,
      border: isCountingDown ? `${countdownColor}88` : 'rgba(255,255,255,0.32)',
      glow: isCountingDown ? `${countdownColor}66` : `${themeColor}66`,
      txt: isCountingDown ? countdownColor : '#fff', sub_txt: 'rgba(255,255,255,0.78)',
      pillTone: 'coral', pillTxt: isCountingDown ? 'COMPTE À REBOURS' : 'ACTIF',
    },
    won: {
      label: '+1', sub: '1ᵉʳ à buzzer ! À toi de répondre.',
      core: 'linear-gradient(160deg, rgba(111,224,196,0.40) 0%, rgba(126,184,255,0.25) 100%)',
      border: 'rgba(111,224,196,0.70)', glow: 'rgba(111,224,196,0.55)',
      txt: '#fff', sub_txt: '#dffaf1',
      pillTone: 'mint', pillTxt: '1ER BUZZ',
    },
    blocked: {
      label: 'TROP TARD', sub: `${otherBuzzer} a buzzé en premier`,
      core: 'linear-gradient(160deg, rgba(239,89,115,0.20) 0%, rgba(80,30,50,0.20) 100%)',
      border: 'rgba(239,89,115,0.40)', glow: 'rgba(239,89,115,0.25)',
      txt: 'rgba(255,209,217,0.95)', sub_txt: 'rgba(255,170,185,0.80)',
      pillTone: 'red', pillTxt: 'BLOQUÉ',
    },
  }[state];

  const glassPct = tweaks.glass / 100;
  const buzzScale = tweaks.buzzerSize / 100;

  const handlePress = () => {
    if (state === 'active' && !isCountingDown && !pressed) {
      setPressed(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      onBuzz && onBuzz();
    }
  };

  return (
    <PlayerShell glass={tweaks.glass}>
      <StatusBar center="QUESTION 4 / 12" />

      {/* Header */}
      <div className="relative z-20 px-5 mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name="Léa" tone="#ff8466" size={32} />
          <div>
            <div className="text-[15px] font-semibold leading-tight">Léa</div>
            <div className="text-[11px] text-white/55 font-mono">142 pts · 3ᵉ</div>
          </div>
        </div>
        <Pill tone={cfg.pillTone}><span className="font-mono text-[10px]">{cfg.pillTxt}</span></Pill>
      </div>

      {/* Buzzer */}
      <div className="relative z-10 flex-1 flex items-stretch px-4 pt-4 pb-3">
        <button
          onClick={handlePress}
          disabled={state !== 'active' || isCountingDown}
          className="relative w-full select-none overflow-hidden"
          style={{
            borderRadius: 36,
            background: cfg.core,
            backdropFilter: `blur(${22 + glassPct * 24}px) saturate(200%) brightness(1.08)`,
            WebkitBackdropFilter: `blur(${22 + glassPct * 24}px) saturate(200%) brightness(1.08)`,
            border: `1.5px solid ${cfg.border}`,
            boxShadow: state === 'wait'
              ? 'inset 0 2px 0 rgba(255,255,255,0.10), 0 24px 60px rgba(0,0,0,0.35)'
              : `inset 0 2px 0 rgba(255,255,255,${0.22 + glassPct * 0.10}), inset 0 -2px 0 rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.18), 0 30px 80px -10px ${cfg.glow}, 0 0 120px ${cfg.glow}`,
            transform: pressed
              ? `scale(${0.93 + buzzScale * 0.03})`  // deeper press
              : `scale(${0.96 + buzzScale * 0.04})`,
            transition: pressed ? 'transform .08s ease' : 'transform .22s cubic-bezier(.2,.9,.3,1.2)',
            animation: isReady ? 'buzz-breathe 1.8s ease-in-out infinite' : 'none',
            cursor: isReady ? 'pointer' : 'default',
          }}>

          {/* Pulse rings (active only) */}
          {isReady && (
            <>
              <div className="rect-pulse" style={{ animationDelay: '0s' }} />
              <div className="rect-pulse" style={{ animationDelay: '.7s' }} />
            </>
          )}

          {/* Countdown ring */}
          {isCountingDown && (
            <div className="rect-pulse" style={{
              borderColor: countdownColor,
              animationDuration: '0.75s',
              borderWidth: 3,
            }} />
          )}

          {/* Glass sheen */}
          <div style={{
            position: 'absolute', top: 8, left: 8, right: 8, height: '38%',
            borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '6%', left: '12%', width: '40%', height: '22%',
            borderRadius: '50%', filter: 'blur(20px)',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none', opacity: state === 'wait' ? 0.5 : 1,
          }} />

          {/* Flash on press */}
          {flash && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 34,
              background: 'rgba(255,255,255,0.30)',
              animation: 'buzz-flash .45s ease-out forwards',
              pointerEvents: 'none',
            }} />
          )}

          {/* Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ color: cfg.txt }}>
            {state === 'won' && (
              <Icon.Check className="w-24 h-24 mb-2"
                style={{ animation: 'badge-pop .5s cubic-bezier(.2,.9,.3,1.3) both',
                         filter: 'drop-shadow(0 6px 18px rgba(111,224,196,0.6))' }} />
            )}
            {state === 'blocked' && <Icon.Lock className="w-16 h-16 mb-4 opacity-70" />}
            {state === 'wait' && <div className="mb-4 opacity-70"><DotsLoader color="rgba(255,255,255,0.55)" /></div>}

            <div className="font-bold tracking-tight text-center"
                 style={{
                   fontSize: isCountingDown ? 120
                     : state === 'won' ? 76
                     : state === 'blocked' ? 38
                     : state === 'wait' ? 28 : 92,
                   lineHeight: 0.95,
                   letterSpacing: '-0.05em',
                   textShadow: state === 'wait' ? 'none' : '0 4px 24px rgba(0,0,0,0.45)',
                   animation: isCountingDown ? 'pop-in .3s cubic-bezier(.2,.9,.3,1.3) both' : 'none',
                   key: countdown, // force remount
                 }}>
              {cfg.label}
            </div>

            <div className="mt-5 text-center max-w-[260px] text-[14px] font-medium leading-snug"
                 style={{ color: cfg.sub_txt }}>
              {cfg.sub}
            </div>

            {state === 'won' && (
              <div className="mt-4 flex items-center gap-2 text-[#dffaf1] text-[12px] font-mono">
                <Icon.Sparkle className="w-3.5 h-3.5" /> RÉACTION 0.42s
              </div>
            )}
            {isReady && (
              <div className="mt-5 inline-flex items-center gap-2 text-white/65 text-[11px] font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: themeColor }} />
                FENÊTRE OUVERTE · 2.4s
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Scoreboard footer */}
      <div className="relative z-20 px-4 pb-10 pt-1">
        <div className="glass-soft rounded-2xl p-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar name="Tonton Marc" tone="#f5b54a" size={26} />
            <Avatar name="Mamie" tone="#6fe0c4" size={26} />
            <Avatar name="Léa" tone="#ff8466" size={26} />
            <div className="w-[26px] h-[26px] rounded-full glass-soft text-[10px] font-medium flex items-center justify-center text-white/75 border border-white/15">+7</div>
          </div>
          <div className="flex-1 text-[12px] text-white/60 leading-tight">
            10 joueurs · <span className="text-white/95">Cinéma 80s</span>
          </div>
          <Icon.Users className="w-4 h-4 text-white/45" />
        </div>
      </div>

      {state === 'won' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(111,224,196,0.20)',
          animation: 'buzz-flash .9s ease-out forwards', pointerEvents: 'none', zIndex: 5 }} />
      )}
      <HomeBar />
    </PlayerShell>
  );
}

// ─── 4. QCM ────────────────────────────────────────────────────────────────
function PlayerQCM({ tweaks, state = 'live' }) {
  const [picked, setPicked] = React.useState(state === 'right' ? 2 : state === 'wrong' ? 0 : null);
  const correct = 2;
  React.useEffect(() => { setPicked(state === 'right' ? 2 : state === 'wrong' ? 0 : null); }, [state]);

  const choices = ['Robert Zemeckis', 'Steven Spielberg', 'George Lucas', 'Ridley Scott'];
  const choiceState = (i) => {
    if (state === 'live')   return picked === i ? 'picked' : 'idle';
    if (state === 'locked') return picked === i ? 'locked' : 'dim';
    if (state === 'right')  return i === correct ? 'correct' : picked === i ? 'wrong' : 'dim';
    if (state === 'wrong')  return i === correct ? 'correct' : picked === i ? 'wrong' : 'dim';
    return 'idle';
  };

  return (
    <PlayerShell glass={tweaks.glass}>
      <StatusBar center="Q. 4 / 12" />

      <div className="relative z-10 px-6 mt-2">
        <div className="flex items-center justify-between mb-3">
          <Pill tone="coral"><Icon.Sparkle className="w-3 h-3" />Cinéma 80s</Pill>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/75">
            <Icon.Bolt className="w-3 h-3 text-[#f5b54a]" /> 14s
          </div>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-4">
          <div style={{
            height: '100%',
            width: state === 'live' ? '62%' : state === 'locked' ? '12%' : '0%',
            background: 'linear-gradient(90deg, #6fe0c4, #f5b54a, #ef5973)',
            transition: 'width .5s ease',
          }} />
        </div>
        <h2 className="text-[22px] leading-[1.15] font-semibold tracking-tight">
          Qui a réalisé <span style={{ color: '#f5b54a' }}>Retour vers le Futur</span> en 1985 ?
        </h2>
      </div>

      <div className="relative z-10 px-5 mt-5 flex-1 flex flex-col gap-2.5">
        {choices.map((c, i) => {
          const shape = CHOICE_SHAPES[i];
          const cs = choiceState(i);
          const styles = {
            idle:    { bg: 'rgba(255,255,255,0.06)', ring: 'rgba(255,255,255,0.14)', text: '#fff', op: 1 },
            picked:  { bg: `${shape.color}26`, ring: `${shape.color}cc`, text: '#fff', op: 1 },
            locked:  { bg: `${shape.color}3a`, ring: shape.color, text: '#fff', op: 1 },
            dim:     { bg: 'rgba(255,255,255,0.03)', ring: 'rgba(255,255,255,0.06)', text: '#ffffff65', op: 0.5 },
            correct: { bg: 'rgba(111,224,196,0.20)', ring: '#6fe0c4', text: '#fff', op: 1 },
            wrong:   { bg: 'rgba(239,89,115,0.20)', ring: '#ef5973', text: '#ffd1d9', op: 1 },
          }[cs];
          return (
            <button key={i} onClick={() => state === 'live' && setPicked(i)} disabled={state !== 'live'}
              className="text-left rounded-2xl px-4 py-4 flex items-center gap-4 transition-all active:scale-[.99] relative overflow-hidden"
              style={{
                background: styles.bg,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1.5px solid ${styles.ring}`,
                opacity: styles.op,
                color: styles.text,
                boxShadow: (cs === 'picked' || cs === 'locked' || cs === 'correct' || cs === 'wrong')
                  ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 26px -8px ${styles.ring}`
                  : 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 font-bold text-[18px]"
                   style={{ background: `${shape.color}22`, border: `1px solid ${shape.color}66`, color: shape.color }}>
                {shape.letter}
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-semibold leading-tight tracking-tight">{c}</div>
              </div>
              {cs === 'correct' && <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#6fe0c4', animation: 'badge-pop .4s ease both' }}><Icon.Check className="w-4 h-4 text-[#0d2820]" /></div>}
              {cs === 'wrong'   && <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#ef5973' }}><Icon.X className="w-4 h-4 text-white" /></div>}
              {cs === 'locked'  && <div className="w-7 h-7 rounded-full glass-soft flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white animate-pulse" /></div>}
            </button>
          );
        })}
      </div>

      <div className="relative z-10 px-6 pt-3 pb-12 text-center">
        {state === 'live' && picked === null && <div className="text-white/55 text-[13px]">Touche une réponse pour la verrouiller</div>}
        {state === 'live' && picked !== null && <div className="text-[#ffb09c] text-[13px] flex items-center justify-center gap-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8466] animate-pulse" />Réponse sélectionnée</div>}
        {state === 'locked' && <div className="text-white/70 text-[13px]">Réponse envoyée · En attente du Maître…</div>}
        {state === 'right'  && <div className="text-[#a8f0db] text-[15px] font-semibold flex items-center justify-center gap-2"><Icon.Sparkle className="w-4 h-4" />Bonne réponse · +120 pts</div>}
        {state === 'wrong'  && <div className="text-[#ffb6c2] text-[14px]">Pas cette fois — bonne réponse : <span className="font-semibold text-white">George Lucas</span></div>}
      </div>
      <HomeBar />
    </PlayerShell>
  );
}

// ─── 5. SCORE POST-QUESTION ─────────────────────────────────────────────────
function PlayerScore({ tweaks }) {
  const [count, setCount] = React.useState(0);
  const target = 120;
  const [nextIn, setNextIn] = React.useState(5);

  // Count up pts
  React.useEffect(() => {
    let v = 0;
    const step = Math.ceil(target / 20);
    const t = setInterval(() => {
      v = Math.min(v + step, target);
      setCount(v);
      if (v >= target) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, []);

  // Next question countdown
  React.useEffect(() => {
    if (nextIn <= 0) return;
    const t = setTimeout(() => setNextIn(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [nextIn]);

  const leaderboard = [
    { n: 'Tonton Marc', c: '#f5b54a', pts: 480, delta: '+120', rank: 1, prev: 1 },
    { n: 'Léa',         c: '#ff8466', pts: 420, delta: '+120', rank: 2, prev: 4 },
    { n: 'Mamie',       c: '#6fe0c4', pts: 360, delta: '+0',   rank: 3, prev: 2 },
    { n: 'Théo',        c: '#7eb8ff', pts: 300, delta: '+40',  rank: 4, prev: 3 },
  ];

  return (
    <PlayerShell glass={tweaks.glass}>
      <StatusBar center="QUESTION 4 / 12" />

      <div className="relative z-10 flex-1 flex flex-col px-5 pt-3 pb-10 overflow-hidden">

        {/* Result hero */}
        <div className="glass rounded-3xl p-6 mb-4 text-center" style={{ animation: 'pop-in .4s cubic-bezier(.2,.9,.3,1.3) both' }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6fe0c4, #7eb8ff)', boxShadow: '0 12px 28px -8px rgba(111,224,196,0.6)' }}>
            <Icon.Check className="w-8 h-8 text-[#0d2820]" />
          </div>
          <div className="text-[13px] text-white/65 mb-1">Bonne réponse !</div>
          <div className="font-bold tracking-tight" style={{
            fontSize: 72, lineHeight: 1,
            background: 'linear-gradient(135deg, #6fe0c4, #7eb8ff)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>+{count}</div>
          <div className="text-[14px] text-white/55 mt-1">points</div>
        </div>

        {/* Rank change */}
        <div className="glass-soft rounded-2xl p-4 mb-4 flex items-center gap-4" style={{ animation: 'rise-in .4s ease .2s both' }}>
          <Avatar name="Léa" tone="#ff8466" size={44} />
          <div className="flex-1">
            <div className="text-[11px] text-white/50 font-mono mb-0.5">Ton classement</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[26px] tracking-tight">2ᵉ</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                   style={{ background: 'rgba(111,224,196,0.20)', color: '#6fe0c4', border: '1px solid rgba(111,224,196,0.40)' }}>
                ▲ +2
              </div>
            </div>
            <div className="text-[12px] text-white/55 font-mono mt-0.5">420 pts · était 4ᵉ</div>
          </div>
        </div>

        {/* Mini leaderboard */}
        <div className="space-y-1.5 flex-1" style={{ animation: 'rise-in .4s ease .35s both' }}>
          {leaderboard.map((p, i) => {
            const isMe = p.n === 'Léa';
            return (
              <div key={p.n} className="rounded-xl px-3 py-2 flex items-center gap-3"
                   style={{
                     background: isMe ? 'rgba(255,132,102,0.14)' : 'rgba(255,255,255,0.04)',
                     border: isMe ? '1px solid rgba(255,132,102,0.40)' : '1px solid rgba(255,255,255,0.10)',
                     backdropFilter: 'blur(20px)',
                   }}>
                <span className="font-mono text-[13px] text-white/45 w-5">{p.rank}</span>
                <Avatar name={p.n} tone={p.c} size={26} />
                <span className="flex-1 text-[13px] font-semibold truncate">{p.n}</span>
                <span className="font-mono text-[12px] font-semibold tabular-nums">{p.pts}</span>
                {p.delta !== '+0' && (
                  <span className="font-mono text-[10px] font-semibold" style={{ color: '#6fe0c4' }}>{p.delta}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Next question timer */}
        <div className="mt-4 glass-soft rounded-2xl p-3 flex items-center justify-between"
             style={{ animation: 'rise-in .4s ease .5s both' }}>
          <span className="text-[13px] text-white/65">Prochaine question</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[14px] tabular-nums"
                 style={{ background: nextIn > 0 ? 'rgba(255,132,102,0.25)' : 'rgba(111,224,196,0.25)',
                          color: nextIn > 0 ? '#ff8466' : '#6fe0c4',
                          border: `1px solid ${nextIn > 0 ? 'rgba(255,132,102,0.50)' : 'rgba(111,224,196,0.50)'}` }}>
              {nextIn > 0 ? nextIn : '✓'}
            </div>
            <span className="text-[12px] text-white/45 font-mono">{nextIn > 0 ? 'secondes' : 'C\'est parti !'}</span>
          </div>
        </div>
      </div>
      <HomeBar />
    </PlayerShell>
  );
}

// ─── Atoms ──────────────────────────────────────────────────────────────────
function HomeBar() {
  return <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-full bg-white/70 z-30" />;
}

Object.assign(window, { PlayerLogin, PlayerLobby, PlayerBuzzer, PlayerQCM, PlayerScore });
