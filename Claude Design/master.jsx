// master.jsx — Desktop screens for the Game Master

// ─── Master shell (full bleed inside browser window) ──────────────────────
function MasterShell({ children, glass }) {
  return (
    <div className="relative w-full h-full overflow-hidden text-white"
         style={{ '--g': glass / 100, background: 'transparent' }}>
      {children}
    </div>
  );
}

// ─── Config / Setup screen ──────────────────────────────────────────────────
function MasterConfig({ tweaks, onStart }) {
  const [theme, setTheme] = React.useState('Cinéma');
  const [subCats, setSubCats] = React.useState([]);
  const [difficulty, setDifficulty] = React.useState('Familial');
  const [mode, setMode] = React.useState('buzz');
  const [questions, setQuestions] = React.useState(12);

  const themes = [
    { name: 'Cinéma',   emoji: '🎬', color: '#ff8466',
      subs: ['Films d\'horreur', 'Années 60s', 'Science-fiction', 'Comédies', 'Action', 'Classiques'] },
    { name: 'Cuisine',  emoji: '🥖', color: '#f5b54a',
      subs: ['Pâtisserie', 'Recettes régionales', 'Grands chefs', 'Vins & fromages', 'Cuisine du monde'] },
    { name: 'Géo',      emoji: '🌍', color: '#6fe0c4',
      subs: ['Capitales', 'Drapeaux', 'Fleuves & montagnes', 'Europe', 'Amériques', 'Asie'] },
    { name: 'Sport',    emoji: '⚽', color: '#7eb8ff',
      subs: ['Football', 'Tennis', 'Jeux olympiques', 'Cyclisme', 'Rugby', 'Natation'] },
    { name: 'Musique',  emoji: '🎵', color: '#ff6f9c',
      subs: ['Rock', 'Pop française', 'Jazz', 'Années 80', 'Classique', 'Rap FR'] },
    { name: 'Histoire', emoji: '🏰', color: '#f5b54a',
      subs: ['Révolution FR', 'Moyen Âge', 'Guerres mondiales', 'Rois de France', 'Antiquité'] },
  ];

  const currentTheme = themes.find(t => t.name === theme);
  const toggleSub = (s) => setSubCats(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const pickTheme = (name) => { setTheme(name); setSubCats([]); };

  const difficulties = ['Facile', 'Familial', 'Expert', 'Démon'];

  return (
    <MasterShell glass={tweaks.glass}>
      <div className="h-full grid grid-cols-[1fr_380px]">
        {/* Left — main config */}
        <div className="p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[11px] tracking-[0.22em] uppercase text-white/40 font-mono mb-1.5">Préparation · Soirée du 25 mai</div>
              <h1 className="text-[42px] font-bold tracking-tight leading-none">Configure la manche</h1>
            </div>
            <div className="glass rounded-2xl px-6 py-3 flex items-center gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/45 mb-0.5">Joueurs prêts</div>
                <div className="font-bold text-[28px] leading-none tracking-tight">10 <span className="text-white/40 text-[18px] font-normal">/ 12</span></div>
              </div>
              <Pill tone="mint"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6fe0c4] animate-pulse" /> Live</Pill>
            </div>
          </div>

          {/* Thème */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] tracking-[0.18em] uppercase text-white/50 font-medium">Thème</h3>
              <button className="text-[12px] text-white/40 hover:text-white/70 font-mono">tout voir →</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(th => (
                <button key={th.name} onClick={() => pickTheme(th.name)}
                  className="glass rounded-2xl p-4 text-left transition-all hover:scale-[1.015] relative overflow-hidden"
                  style={{
                    borderColor: theme === th.name ? th.color : undefined,
                    boxShadow: theme === th.name
                      ? `inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1.5px ${th.color}, 0 12px 32px -10px ${th.color}88`
                      : undefined,
                  }}>
                  <div className="text-[32px] leading-none mb-3">{th.emoji}</div>
                  <div className="font-semibold tracking-tight">{th.name}</div>
                  <div className="text-[11px] text-white/45 mt-0.5">240 questions</div>
                  {theme === th.name && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                         style={{ background: th.color }}>
                      <Icon.Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Sous-catégories */}
            {currentTheme && (
              <div className="mt-4" style={{ animation: 'rise-in .25s ease both' }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[12px] tracking-[0.16em] uppercase font-mono text-white/50">Sous-catégories</span>
                  {subCats.length === 0
                    ? <span className="text-[11px] font-mono text-white/35">· Toutes incluses</span>
                    : <button onClick={() => setSubCats([])} className="text-[11px] font-mono text-white/40 hover:text-white/65 ml-auto">✕ Tout déselectionner</button>
                  }
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTheme.subs.map(s => {
                    const on = subCats.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSub(s)}
                        className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-[.98]"
                        style={{
                          background: on ? `${currentTheme.color}28` : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${on ? currentTheme.color + 'aa' : 'rgba(255,255,255,0.14)'}`,
                          color: on ? '#fff' : 'rgba(255,255,255,0.65)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: on ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px -4px ${currentTheme.color}55` : undefined,
                        }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Difficulté + mode */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <section>
              <h3 className="text-[13px] tracking-[0.18em] uppercase text-white/50 font-medium mb-3">Difficulté</h3>
              <div className="glass rounded-2xl p-1.5 flex">
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium tracking-tight transition-all"
                    style={{
                      background: difficulty === d ? 'linear-gradient(135deg, #ff8466, #ff6f9c)' : 'transparent',
                      color: difficulty === d ? '#fff' : 'rgba(255,255,255,.55)',
                      boxShadow: difficulty === d ? '0 6px 18px -6px rgba(255,132,102,.6)' : 'none',
                    }}>{d}</button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[13px] tracking-[0.18em] uppercase text-white/50 font-medium mb-3">Mode de jeu</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'buzz', label: 'Buzzer', sub: 'Le plus rapide', icon: <Icon.Bolt className="w-5 h-5" /> },
                  { id: 'qcm',  label: 'Calme',  sub: 'A · B · C · D',  icon: <Icon.Users className="w-5 h-5" /> },
                ].map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className="glass rounded-2xl p-3 text-left transition-all"
                    style={{
                      boxShadow: mode === m.id ? 'inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1.5px #f5b54a, 0 8px 20px -8px rgba(245,181,74,.6)' : undefined,
                    }}>
                    <div className="text-[#f5b54a]">{m.icon}</div>
                    <div className="font-semibold tracking-tight mt-1.5">{m.label}</div>
                    <div className="text-[11px] text-white/45">{m.sub}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Number of questions */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] tracking-[0.18em] uppercase text-white/50 font-medium">Questions</h3>
              <span className="font-mono text-[12px] text-white/55">{questions} questions · ~{Math.round(questions * 1.2)} min</span>
            </div>
            <div className="glass rounded-2xl p-4">
              <input type="range" min={5} max={30} step={1} value={questions}
                     onChange={e => setQuestions(Number(e.target.value))}
                     className="w-full accent-[#ff8466]" />
              <div className="flex justify-between text-[10px] font-mono text-white/35 mt-2">
                <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
              </div>
            </div>
          </section>

          <button onClick={onStart}
            className="w-full h-[64px] rounded-2xl font-semibold text-[18px] tracking-tight transition-all hover:scale-[1.005] active:scale-[.995]"
            style={{
              background: 'linear-gradient(135deg, #6fe0c4 0%, #5cc4ad 100%)',
              boxShadow: '0 16px 36px -8px rgba(111,224,196,.5), inset 0 1px 0 rgba(255,255,255,.25)',
              color: '#fff',
            }}>
            <span className="inline-flex items-center gap-3">
              <Icon.Play className="w-5 h-5" />
              Lancer la manche · {theme}{subCats.length > 0 ? ` · ${subCats.length} sous-cat.` : ''}
            </span>
          </button>
        </div>

        {/* Right — Lobby */}
        <aside className="border-l border-white/5 p-7 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[15px]">Joueurs</h3>
            <Pill tone="mint"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6fe0c4] animate-pulse" /> Live</Pill>
          </div>

          <div className="glass rounded-2xl p-5 mb-5">
            <div className="font-mono text-[11px] text-white/40 mb-1">Joueurs connectés</div>
            <div className="text-[40px] font-bold tracking-tight leading-none">10<span className="text-white/30 text-[24px]">/12</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
              {[
                { n: 'Tonton Marc', c: '#f5b54a' }, { n: 'Mamie',     c: '#6fe0c4' },
                { n: 'Léa',         c: '#ff8466' }, { n: 'Théo',      c: '#7eb8ff' },
                { n: 'Sophie',      c: '#ff6f9c' }, { n: 'Papy Jean', c: '#f5b54a' },
                { n: 'Camille',     c: '#7eb8ff' }, { n: 'Hugo',      c: '#6fe0c4' },
                { n: 'Élise',       c: '#f5b54a' }, { n: 'Antoine',   c: '#ff8466' },
              ].map(p => (
                <div key={p.n} className="flex items-center gap-2 py-1">
                  <Avatar name={p.n} tone={p.c} size={22} />
                  <span className="truncate">{p.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-soft rounded-2xl p-4">
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/40 mb-3">Statut session</div>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Mode</span>
                  <span className="font-medium">Session unique · locale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Démarrage</span>
                  <span className="font-medium">Sur décision du Maître</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Appareils</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6fe0c4] animate-pulse" />
                    10 connectés
                  </span>
                </div>
              </div>
            </div>
        </aside>
      </div>
    </MasterShell>
  );
}

// ─── Master in-game screen ──────────────────────────────────────────────────
function MasterGame({ tweaks, phase = 'question', onPhase }) {
  // phase: 'question' (live) | 'buzzed' (player buzzed in) | 'reveal'
  const correct = 2;
  const choices = ['Robert Zemeckis', 'Steven Spielberg', 'George Lucas', 'Ridley Scott'];

  const players = [
    { n: 'Tonton Marc', c: '#f5b54a', pts: 480, delta: '+120' },
    { n: 'Léa',         c: '#ff8466', pts: 420, delta: '+80'  },
    { n: 'Mamie',       c: '#6fe0c4', pts: 360, delta: '+0'   },
    { n: 'Théo',        c: '#7eb8ff', pts: 300, delta: '+40'  },
    { n: 'Sophie',      c: '#ff6f9c', pts: 260, delta: '+0'   },
    { n: 'Papy Jean',   c: '#f5b54a', pts: 200, delta: '+0'   },
    { n: 'Camille',     c: '#7eb8ff', pts: 180, delta: '+0'   },
    { n: 'Hugo',        c: '#6fe0c4', pts: 140, delta: '+40'  },
    { n: 'Élise',       c: '#f5b54a', pts: 90,  delta: '+0'   },
    { n: 'Antoine',     c: '#ff8466', pts: 60,  delta: '+0'   },
  ];

  return (
    <MasterShell glass={tweaks.glass}>
      <div className="h-full grid grid-cols-[300px_1fr_340px]">
        {/* ── Leaderboard ───────────────────────────────────── */}
        <aside className="border-r border-white/5 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[14px] tracking-tight flex items-center gap-2">
              <Icon.Trophy className="w-4 h-4 text-[#f5b54a]" /> Classement
            </h3>
            <span className="font-mono text-[10px] text-white/40">LIVE</span>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-2 mb-6 items-end">
            {[1, 0, 2].map((idx, i) => {
              const p = players[idx];
              const h = idx === 0 ? 110 : idx === 1 ? 86 : 70;
              const medal = idx === 0 ? '#f5b54a' : idx === 1 ? '#cbd5e1' : '#d97706';
              return (
                <div key={p.n} className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <Avatar name={p.n} tone={p.c} size={idx === 0 ? 52 : 42} />
                    {idx === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#f5b54a]">
                        <Icon.Crown className="w-6 h-6" style={{ filter: 'drop-shadow(0 2px 8px #f5b54aaa)' }} />
                      </div>
                    )}
                  </div>
                  <div className="text-[12px] font-semibold tracking-tight truncate w-full text-center">{p.n}</div>
                  <div className="font-mono text-[11px] text-white/55 mb-1.5">{p.pts}</div>
                  <div className="w-full rounded-t-xl flex items-start justify-center pt-2"
                       style={{
                         height: h, background: `linear-gradient(180deg, ${medal}55, ${medal}15)`,
                         border: `1px solid ${medal}55`, borderBottom: 'none',
                       }}>
                    <span className="text-[18px] font-bold" style={{ color: medal }}>{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining list */}
          <div className="space-y-1.5">
            {players.slice(3).map((p, i) => (
              <div key={p.n} className="glass-soft rounded-xl px-3 py-2 flex items-center gap-3"
                   style={{ animation: `rise-in .4s ease ${i * .04}s both` }}>
                <span className="font-mono text-[11px] text-white/40 w-5">{i + 4}</span>
                <Avatar name={p.n} tone={p.c} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{p.n}</div>
                  <div className="font-mono text-[10px] text-white/40">{p.pts} pts</div>
                </div>
                {p.delta !== '+0' && (
                  <span className="text-emerald-300 font-mono text-[10px] font-semibold">{p.delta}</span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Center: question + choices ────────────────────── */}
        <main className="p-10 flex flex-col overflow-hidden">
          {/* Top header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Pill tone="violet"><Icon.Sparkle className="w-3 h-3" />Cinéma 80s</Pill>
              <Pill tone="orange">Familial</Pill>
              <Pill tone="neutral"><span className="font-mono">Q. 04 / 12</span></Pill>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] tracking-[0.18em] uppercase text-white/40 font-mono">Temps</div>
                <div className="font-mono text-[24px] font-semibold tabular-nums" style={{ color: phase === 'reveal' ? '#6fe0c4' : '#fff' }}>
                  {phase === 'reveal' ? '00:00' : '00:14'}
                </div>
              </div>
              <div className="relative w-[64px] h-[64px]">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="url(#tgrad)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={(2 * Math.PI * 34) * (phase === 'reveal' ? 1 : 0.38)}
                          style={{ transition: 'stroke-dashoffset .5s' }} />
                  <defs>
                    <linearGradient id="tgrad" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6fe0c4" />
                      <stop offset="60%" stopColor="#f5b54a" />
                      <stop offset="100%" stopColor="#ef5973" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="text-[12px] text-white/45 mb-2 font-mono tracking-wider">QUESTION</div>
            <h1 className="text-[54px] leading-[1.05] font-bold tracking-tight">
              Qui a réalisé <span style={{
                background: 'linear-gradient(110deg, #ff8466, #f5b54a)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>Retour vers le Futur</span><br/>en 1985 ?
            </h1>
          </div>

          {/* Choices */}
          <div className="flex flex-col gap-3 flex-1">
            {choices.map((c, i) => {
              const sh = CHOICE_SHAPES[i];
              const isCorrect = i === correct;
              const showReveal = phase === 'reveal';
              return (
                <div key={i} className="glass rounded-2xl px-5 py-4 flex items-center gap-5 relative overflow-hidden"
                     style={{
                       borderColor: showReveal && isCorrect ? '#6fe0c4' : undefined,
                       opacity: showReveal && !isCorrect ? .4 : 1,
                       boxShadow: showReveal && isCorrect
                         ? `0 0 0 1.5px #6fe0c4, 0 16px 40px -8px #6fe0c466`
                         : undefined,
                       transform: showReveal && isCorrect ? 'scale(1.015)' : 'none',
                       transition: 'all .3s',
                     }}>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 font-bold text-[22px]"
                       style={{
                         background: `${sh.color}22`,
                         border: `1px solid ${sh.color}66`,
                         color: sh.color,
                       }}>
                    {sh.letter}
                  </div>
                  <div className="flex-1">
                    <div className="text-[24px] font-semibold tracking-tight">{c}</div>
                  </div>
                  {/* Vote count bar */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-[11px] text-white/40">Votes</div>
                      <div className="font-mono text-[18px] font-semibold tabular-nums">{[2, 1, 4, 3][i]}</div>
                    </div>
                    {showReveal && isCorrect && (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center"
                           style={{ animation: 'badge-pop .5s cubic-bezier(.2,.9,.3,1.3) both' }}>
                        <Icon.Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── Right: Master controls — hierarchical layout ─── */}
        <aside className="border-l border-white/5 flex flex-col overflow-hidden">

          {/* ① ZONE BUZZ — contextual, only when relevant */}
          {phase === 'buzzed' && (
            <div className="p-5 border-b border-white/5"
                 style={{ animation: 'pop-in .3s cubic-bezier(.2,.9,.3,1.3) both',
                          background: 'rgba(245,181,74,0.07)' }}>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3"
                   style={{ color: '#f5b54a' }}>① 1ᵉʳ buzz</div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name="Tonton Marc" tone="#f5b54a" size={52} />
                <div>
                  <div className="font-bold text-[18px] tracking-tight leading-tight">Tonton Marc</div>
                  <div className="font-mono text-[11px] text-white/55">RÉACTION 0.38s</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: '#f5b54a' }}>
                    #1 sur 4 buzz
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onPhase && onPhase('reveal')}
                  className="rounded-xl py-3 font-semibold text-[14px] active:scale-[.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg,#6fe0c4,#7eb8ff)', color: '#0d2820',
                           boxShadow: '0 8px 20px -6px rgba(111,224,196,0.55), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
                  ✓ Valider
                </button>
                <button onClick={() => onPhase && onPhase('question')}
                  className="rounded-xl py-3 font-semibold text-[14px] bg-white/8 hover:bg-white/12 active:scale-[.98] transition-transform">
                  ✕ Refuser
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-[14px] tracking-tight flex items-center gap-2">
              <Icon.Settings className="w-4 h-4 text-white/50" /> Contrôles
            </h3>
            <Pill tone={phase === 'buzzed' ? 'amber' : phase === 'reveal' ? 'mint' : 'coral'}>
              {phase === 'question' ? 'En cours' : phase === 'buzzed' ? '1ER BUZZ' : 'Révélée'}
            </Pill>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-4">

            {/* ② ZONE BUZZERS — état + toggle */}
            <div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/35 mb-2">② Buzzers</div>
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold">
                    {phase === 'question' ? 'Activés' : phase === 'buzzed' ? 'Verrouillés' : 'Désactivés'}
                  </div>
                  <div className="text-[11px] text-white/45 mt-0.5">10 joueurs prêts</div>
                </div>
                <div className="w-12 h-7 rounded-full p-0.5 transition-all"
                     style={{ background: phase === 'question' ? 'linear-gradient(90deg,#ff8466,#6fe0c4)' : 'rgba(255,255,255,.10)' }}>
                  <div className="w-6 h-6 rounded-full bg-white shadow-md transition-transform"
                       style={{ transform: phase === 'question' ? 'translateX(20px)' : 'translateX(0)' }} />
                </div>
              </div>
            </div>

            {/* ③ ACTION PRIMAIRE — very prominent */}
            <div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/35 mb-2">③ Action principale</div>
              {phase === 'question' && (
                <button onClick={() => onPhase && onPhase('reveal')}
                  className="w-full rounded-2xl py-5 font-bold text-[16px] tracking-tight active:scale-[.99] transition-transform"
                  style={{ background: 'linear-gradient(135deg,#f5b54a,#ff8466)',
                           color: '#1a0a00',
                           boxShadow: '0 16px 36px -8px rgba(245,181,74,.6), inset 0 1.5px 0 rgba(255,255,255,.40)' }}>
                  Révéler la réponse
                </button>
              )}
              {phase === 'reveal' && (
                <button onClick={() => onPhase && onPhase('question')}
                  className="w-full rounded-2xl py-5 font-bold text-[16px] tracking-tight active:scale-[.99] transition-transform"
                  style={{ background: 'linear-gradient(135deg,#ff8466,#ff6f9c)',
                           color: '#fff',
                           boxShadow: '0 16px 36px -8px rgba(255,132,102,.55), inset 0 1.5px 0 rgba(255,255,255,.30)' }}>
                  Question suivante →
                </button>
              )}
              {phase === 'buzzed' && (
                <button onClick={() => onPhase && onPhase('reveal')}
                  className="w-full rounded-2xl py-5 font-semibold text-[15px] tracking-tight bg-white/8 hover:bg-white/12 active:scale-[.99]"
                  style={{ border: '1px solid rgba(255,255,255,.14)' }}>
                  Révéler la bonne réponse
                </button>
              )}
            </div>

            {/* ④ ACTIONS SECONDAIRES */}
            <div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/35 mb-2">④ Secondaire</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="glass-soft rounded-xl py-3 text-[12px] font-medium hover:bg-white/8 flex items-center justify-center gap-1.5 active:scale-[.98]">
                  <Icon.Pause className="w-3.5 h-3.5" /> Pause
                </button>
                <button className="glass-soft rounded-xl py-3 text-[12px] font-medium hover:bg-white/8 flex items-center justify-center gap-1.5 active:scale-[.98]">
                  <Icon.Skip className="w-3.5 h-3.5" /> Passer
                </button>
              </div>
            </div>

            {/* ⑤ FILE DE BUZZ */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/35 mb-2">⑤ File de buzz</div>
              <div className="glass-soft rounded-2xl p-3 flex-1 min-h-0 overflow-y-auto">
                {[
                  { n: 'Tonton Marc', c: '#f5b54a', t: '0.38s', first: true },
                  { n: 'Léa',         c: '#ff8466', t: '0.51s' },
                  { n: 'Théo',        c: '#7eb8ff', t: '0.79s' },
                  { n: 'Mamie',       c: '#6fe0c4', t: '1.12s' },
                ].map((p, i) => (
                  <div key={p.n} className="flex items-center gap-2.5 py-2 px-2 rounded-xl mb-1 last:mb-0"
                       style={{ background: p.first ? 'rgba(245,181,74,.14)' : 'transparent',
                                border: p.first ? '1px solid rgba(245,181,74,.25)' : '1px solid transparent' }}>
                    <span className="font-mono text-[10px] text-white/40 w-4">{i + 1}</span>
                    <Avatar name={p.n} tone={p.c} size={24} />
                    <span className="text-[12px] font-semibold flex-1 truncate">{p.n}</span>
                    <span className="font-mono text-[11px] font-semibold"
                          style={{ color: p.first ? '#f5b54a' : 'rgba(255,255,255,.45)' }}>{p.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </MasterShell>
  );
}

Object.assign(window, { MasterConfig, MasterGame });
