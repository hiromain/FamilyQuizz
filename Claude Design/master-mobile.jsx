// master-mobile.jsx — Mobile screens for the Game Master
// Same scenarios as MasterGame/MasterConfig but designed for a phone.

// ─── Shell ──────────────────────────────────────────────────────────────────
function MasterMobileShell({ children, glass }) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden no-tap-highlight"
         style={{ '--g': glass / 100 }}>
      <div className="phone-aurora" />
      {children}
    </div>
  );
}

// ─── Tiny atom for the master mobile : sticky bottom action row ────────────
function MasterMobileTopBar({ subtitle }) {
  return (
    <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 text-[13px] font-mono text-white/75">
      <span>9:41</span>
      <span className="text-white/45 tracking-widest">{subtitle}</span>
      <span>●●●●</span>
    </div>
  );
}

// ─── Config mobile ─────────────────────────────────────────────────────────
function MasterConfigMobile({ tweaks, onStart }) {
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

  const toggleSub = (s) => setSubCats(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  // Reset subcats when theme changes
  const pickTheme = (name) => { setTheme(name); setSubCats([]); };

  const difficulties = ['Facile', 'Familial', 'Expert', 'Démon'];

  return (
    <MasterMobileShell glass={tweaks.glass}>
      <MasterMobileTopBar subtitle="MAÎTRE DU JEU" />

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pt-2 pb-32">
        {/* Hero */}
        <div className="mb-5">
          <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-mono mb-1">Préparation</div>
          <h1 className="text-[30px] leading-[1.05] font-bold tracking-tight">Configure<br/>la manche</h1>
        </div>

        {/* Joueurs connectés — statut live */}
        <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.18em] uppercase text-white/50 font-mono mb-0.5">Joueurs connectés</div>
            <div className="font-bold text-[28px] tracking-tight leading-none">10 <span className="text-white/40 text-[18px] font-normal">/ 12</span></div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Pill tone="mint"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6fe0c4] animate-pulse" /> Live</Pill>
            <div className="flex -space-x-1.5">
              {['#f5b54a','#ff8466','#6fe0c4','#7eb8ff','#ff6f9c'].map(c => (
                <div key={c} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
              ))}
              <div className="w-5 h-5 rounded-full border border-white/20 glass-soft text-[8px] font-bold flex items-center justify-center text-white/70">+5</div>
            </div>
          </div>
        </div>

        {/* Thème */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/55 font-medium">Thème</h3>
            <button className="text-[11px] text-white/45 font-mono">tout →</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(th => {
              const active = theme === th.name;
              return (
                <button key={th.name} onClick={() => pickTheme(th.name)}
                  className="glass rounded-2xl p-3 text-left transition-all active:scale-[.98] relative"
                  style={{
                    boxShadow: active
                      ? `inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1.5px ${th.color}, 0 10px 24px -8px ${th.color}88`
                      : undefined,
                  }}>
                  <div className="text-[24px] leading-none mb-1.5">{th.emoji}</div>
                  <div className="font-semibold tracking-tight text-[13px] leading-tight">{th.name}</div>
                  {active && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                         style={{ background: th.color }}>
                      <Icon.Check className="w-2.5 h-2.5 text-[#1a0e2e]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sous-catégories — slide in when a theme is picked */}
          {currentTheme && (
            <div style={{ animation: 'rise-in .25s ease both' }} className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[11px] tracking-[0.16em] uppercase font-mono text-white/50">Sous-catégories</div>
                {subCats.length === 0 && (
                  <span className="text-[10px] font-mono text-white/35">· Toutes incluses</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentTheme.subs.map(s => {
                  const on = subCats.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSub(s)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-[.97]"
                      style={{
                        background: on ? `${currentTheme.color}28` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${on ? currentTheme.color + 'aa' : 'rgba(255,255,255,0.14)'}`,
                        color: on ? '#fff' : 'rgba(255,255,255,0.65)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: on ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px -4px ${currentTheme.color}66` : undefined,
                      }}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {subCats.length > 0 && (
                <button onClick={() => setSubCats([])}
                  className="mt-2 text-[10px] font-mono text-white/40 hover:text-white/65 transition-colors">
                  ✕ Tout déselectionner
                </button>
              )}
            </div>
          )}
        </section>

        {/* Difficulté */}
        <section className="mb-6">
          <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/55 font-medium mb-2.5">Difficulté</h3>
          <div className="glass rounded-2xl p-1.5 flex">
            {difficulties.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className="flex-1 py-2 rounded-xl text-[12px] font-medium tracking-tight transition-all"
                style={{
                  background: difficulty === d ? 'linear-gradient(135deg, #ff8466, #f5b54a)' : 'transparent',
                  color: difficulty === d ? '#fff' : 'rgba(255,255,255,.6)',
                  boxShadow: difficulty === d ? '0 6px 16px -6px rgba(255,132,102,.55)' : 'none',
                }}>{d}</button>
            ))}
          </div>
        </section>

        {/* Mode */}
        <section className="mb-6">
          <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/55 font-medium mb-2.5">Mode de jeu</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'buzz', label: 'Buzzer', sub: 'Le plus rapide', icon: <Icon.Bolt className="w-5 h-5" />, color: '#ff8466' },
              { id: 'qcm',  label: 'Calme',  sub: 'A · B · C · D',  icon: <Icon.Users className="w-5 h-5" />, color: '#7eb8ff' },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="glass rounded-2xl p-3 text-left transition-all"
                style={{
                  boxShadow: mode === m.id ? `inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1.5px ${m.color}, 0 8px 20px -8px ${m.color}88` : undefined,
                }}>
                <div style={{ color: m.color }}>{m.icon}</div>
                <div className="font-semibold tracking-tight mt-1.5 text-[14px]">{m.label}</div>
                <div className="text-[10px] text-white/55 font-mono">{m.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Questions */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/55 font-medium">Questions</h3>
            <span className="font-mono text-[11px] text-white/65">{questions} · ~{Math.round(questions * 1.2)} min</span>
          </div>
          <div className="glass rounded-2xl p-4">
            <input type="range" min={5} max={30} step={1} value={questions}
                   onChange={e => setQuestions(Number(e.target.value))}
                   className="w-full" style={{ accentColor: '#ff8466' }} />
            <div className="flex justify-between text-[10px] font-mono text-white/40 mt-2">
              <span>5</span><span>15</span><span>30</span>
            </div>
          </div>
        </section>

        {/* Lobby preview */}
        <section className="mb-2">
          <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/55 font-medium mb-2.5">Joueurs connectés</h3>
          <div className="glass rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
              {[
                { n: 'Tonton Marc', c: '#f5b54a' }, { n: 'Mamie',     c: '#6fe0c4' },
                { n: 'Léa',         c: '#ff8466' }, { n: 'Théo',      c: '#7eb8ff' },
                { n: 'Sophie',      c: '#ff6f9c' }, { n: 'Papy Jean', c: '#f5b54a' },
                { n: 'Camille',     c: '#7eb8ff' }, { n: 'Hugo',      c: '#6fe0c4' },
                { n: 'Élise',       c: '#ff8466' }, { n: 'Antoine',   c: '#ff6f9c' },
              ].map(p => (
                <div key={p.n} className="flex items-center gap-2 py-0.5">
                  <Avatar name={p.n} tone={p.c} size={22} />
                  <span className="truncate">{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Sticky launch button */}
      <div className="absolute left-0 right-0 bottom-0 z-20 px-5 pt-3 pb-9"
           style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,10,31,0.85) 50%)' }}>
        <button onClick={onStart}
          className="w-full h-[58px] rounded-2xl font-semibold text-[16px] tracking-tight active:scale-[.99] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #6fe0c4 0%, #7eb8ff 100%)',
            color: '#0d2820',
            boxShadow: '0 18px 40px -10px rgba(111,224,196,.55), inset 0 1px 0 rgba(255,255,255,.35)',
          }}>
          <span className="inline-flex items-center gap-2.5">
            <Icon.Play className="w-5 h-5" /> Lancer · {theme}{subCats.length > 0 ? ` · ${subCats.length} sous-cat.` : ''}
          </span>
        </button>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-full bg-white/70 z-30" />
    </MasterMobileShell>
  );
}

// ─── In-game mobile ────────────────────────────────────────────────────────
// phase: 'question' | 'buzzed' | 'reveal'
function MasterGameMobile({ tweaks, phase = 'question', onPhase }) {
  const [tab, setTab] = React.useState('jeu'); // 'jeu' | 'classement' | 'feed'
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
  ];

  const buzzFeed = [
    { n: 'Tonton Marc', c: '#f5b54a', t: '0.38s', first: true },
    { n: 'Léa',         c: '#ff8466', t: '0.51s' },
    { n: 'Théo',        c: '#7eb8ff', t: '0.79s' },
    { n: 'Mamie',       c: '#6fe0c4', t: '1.12s' },
  ];

  return (
    <MasterMobileShell glass={tweaks.glass}>
      <MasterMobileTopBar subtitle="MAÎTRE · Q.04/12" />

      {/* Top header */}
      <div className="relative z-10 px-5 mt-2 mb-3 flex items-center gap-3">
        <div className="relative w-[52px] h-[52px] shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="7"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="url(#mmgrad)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={(2 * Math.PI * 34) * (phase === 'reveal' ? 1 : 0.38)}
                    style={{ transition: 'stroke-dashoffset .5s' }} />
            <defs>
              <linearGradient id="mmgrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%"  stopColor="#6fe0c4" />
                <stop offset="60%" stopColor="#f5b54a" />
                <stop offset="100%" stopColor="#ef5973" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] font-semibold tabular-nums"
               style={{ color: phase === 'reveal' ? '#6fe0c4' : '#fff' }}>
            {phase === 'reveal' ? '0:00' : '0:14'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="coral"><Icon.Sparkle className="w-3 h-3" />Cinéma 80s</Pill>
            <Pill tone="amber">Familial</Pill>
          </div>
          <div className="text-[11px] text-white/55 font-mono mt-1">Buzz · 10 joueurs prêts</div>
        </div>
        <Pill tone={phase === 'buzzed' ? 'amber' : phase === 'reveal' ? 'mint' : 'coral'}>
          {phase === 'question' ? 'EN COURS' : phase === 'buzzed' ? '1ER BUZZ' : 'RÉVÉLÉE'}
        </Pill>
      </div>

      {/* Question */}
      <div className="relative z-10 px-5 mb-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-[10px] text-white/50 mb-1.5 font-mono tracking-[0.18em] uppercase">Question</div>
          <h1 className="text-[22px] leading-[1.18] font-bold tracking-tight">
            Qui a réalisé <span style={{
              background: 'linear-gradient(110deg, #ff8466, #f5b54a)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>Retour vers le Futur</span> en 1985 ?
          </h1>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="relative z-10 px-5 mb-2">
        <div className="glass-soft rounded-xl p-1 flex">
          {[
            { id: 'jeu',        label: 'Jeu' },
            { id: 'classement', label: 'Classement' },
            { id: 'feed',       label: 'File buzz' },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium tracking-tight transition-all"
                style={{
                  background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,.6)',
                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
                }}>{t.label}</button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-[160px] pt-1">
        {tab === 'jeu' && (
          <div className="space-y-2">
            {choices.map((c, i) => {
              const sh = CHOICE_SHAPES[i];
              const isCorrect = i === correct;
              const showReveal = phase === 'reveal';
              return (
                <div key={i} className="glass rounded-xl px-3 py-2.5 flex items-center gap-3"
                     style={{
                       opacity: showReveal && !isCorrect ? .45 : 1,
                       boxShadow: showReveal && isCorrect
                         ? `inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1.5px #6fe0c4, 0 12px 28px -8px #6fe0c466`
                         : undefined,
                       transition: 'all .3s',
                     }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 font-bold text-[17px]"
                       style={{
                         background: `${sh.color}22`,
                         border: `1px solid ${sh.color}66`,
                         color: sh.color,
                       }}>
                    {sh.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold tracking-tight truncate">{c}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[16px] font-semibold tabular-nums">{[2, 1, 4, 3][i]}</div>
                    <div className="font-mono text-[9px] text-white/45 tracking-wider">votes</div>
                  </div>
                  {showReveal && isCorrect && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                         style={{ background: '#6fe0c4', animation: 'badge-pop .4s ease both' }}>
                      <Icon.Check className="w-4 h-4 text-[#0d2820]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'classement' && (
          <div className="space-y-1.5">
            {players.map((p, i) => (
              <div key={p.n} className="glass-soft rounded-xl px-3 py-2 flex items-center gap-3">
                <span className="font-mono text-[12px] text-white/45 w-5">{i + 1}</span>
                <Avatar name={p.n} tone={p.c} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{p.n}</div>
                  <div className="font-mono text-[10px] text-white/50">{p.pts} pts</div>
                </div>
                {p.delta !== '+0' && (
                  <span className="font-mono text-[11px] font-semibold" style={{ color: '#6fe0c4' }}>{p.delta}</span>
                )}
                {i === 0 && <Icon.Crown className="w-4 h-4" style={{ color: '#f5b54a' }} />}
              </div>
            ))}
          </div>
        )}

        {tab === 'feed' && (
          <div className="space-y-1.5">
            {buzzFeed.map((p, i) => (
              <div key={p.n} className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                   style={{
                     background: p.first ? 'rgba(245,181,74,.16)' : 'rgba(255,255,255,0.04)',
                     border: p.first ? '1px solid rgba(245,181,74,.4)' : '1px solid rgba(255,255,255,.10)',
                     backdropFilter: 'blur(20px)',
                   }}>
                <span className="font-mono text-[11px] text-white/45 w-5">{i + 1}</span>
                <Avatar name={p.n} tone={p.c} size={26} />
                <span className="text-[13px] font-medium flex-1 truncate">{p.n}</span>
                <span className="font-mono text-[12px] font-semibold" style={{ color: p.first ? '#f5b54a' : 'rgba(255,255,255,.55)' }}>{p.t}</span>
              </div>
            ))}
            <div className="text-center text-[11px] text-white/40 pt-2 font-mono">file complète · 10 buzz</div>
          </div>
        )}
      </div>

      {/* Buzzed overlay */}
      {phase === 'buzzed' && (
        <div className="absolute inset-x-4 z-30"
             style={{
               bottom: 110,
               animation: 'pop-in .35s cubic-bezier(.2,.9,.3,1.3) both',
             }}>
          <div className="glass-thick rounded-3xl p-5"
               style={{
                 background: 'rgba(28, 14, 42, 0.82)',
                 backdropFilter: 'blur(40px) saturate(180%)',
                 WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                 border: '1px solid rgba(245,181,74,0.45)',
                 boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.22), 0 22px 50px -10px rgba(245,181,74,.45), 0 0 0 1px rgba(245,181,74,.3)',
               }}>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: '#f5b54a' }}>1ᵉʳ buzz</div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name="Tonton Marc" tone="#f5b54a" size={56} />
              <div>
                <div className="font-bold text-[20px] tracking-tight leading-tight">Tonton Marc</div>
                <div className="font-mono text-[12px] text-white/65">RÉACTION 0.38s</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onPhase && onPhase('reveal')}
                className="rounded-xl py-3 font-semibold text-[14px] active:scale-[.98]"
                style={{
                  background: 'linear-gradient(135deg, #6fe0c4, #7eb8ff)',
                  color: '#0d2820',
                  boxShadow: '0 10px 24px -8px rgba(111,224,196,.55), inset 0 1px 0 rgba(255,255,255,.35)',
                }}>
                ✓ Valider
              </button>
              <button onClick={() => onPhase && onPhase('question')}
                className="rounded-xl py-3 font-semibold text-[14px] bg-white/10 active:scale-[.98]"
                style={{ border: '1px solid rgba(255,255,255,.18)' }}>
                ✕ Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom action bar */}
      <div className="absolute left-0 right-0 bottom-0 z-20 px-4 pt-3 pb-9"
           style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,10,31,0.92) 45%)' }}>
        {/* Buzzer state pill + skip/pause row */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="glass-soft rounded-xl px-3 py-2 flex items-center gap-2 flex-1">
            <div className="w-9 h-5 rounded-full p-0.5"
                 style={{ background: phase === 'question' ? 'linear-gradient(90deg,#ff8466,#6fe0c4)' : 'rgba(255,255,255,.1)' }}>
              <div className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                   style={{ transform: phase === 'question' ? 'translateX(16px)' : 'translateX(0)' }} />
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-semibold">Buzzers · {phase === 'question' ? 'ON' : phase === 'buzzed' ? 'lock' : 'OFF'}</div>
            </div>
          </div>
          <button className="glass-soft rounded-xl w-10 h-10 flex items-center justify-center">
            <Icon.Pause className="w-4 h-4 text-white/75" />
          </button>
          <button className="glass-soft rounded-xl w-10 h-10 flex items-center justify-center">
            <Icon.Skip className="w-4 h-4 text-white/75" />
          </button>
        </div>

        {/* Primary action */}
        {phase === 'question' && (
          <button onClick={() => onPhase && onPhase('reveal')}
                  className="w-full h-[54px] rounded-2xl font-semibold text-[15px] tracking-tight active:scale-[.99] transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #f5b54a 0%, #ff8466 100%)',
                    color: '#1a0e2e',
                    boxShadow: '0 14px 32px -8px rgba(245,181,74,.6), inset 0 1px 0 rgba(255,255,255,.35)',
                  }}>
            Révéler la réponse
          </button>
        )}
        {phase === 'reveal' && (
          <button onClick={() => onPhase && onPhase('question')}
                  className="w-full h-[54px] rounded-2xl font-semibold text-[15px] tracking-tight active:scale-[.99]"
                  style={{
                    background: 'linear-gradient(135deg, #ff8466 0%, #ff6f9c 100%)',
                    color: '#fff',
                    boxShadow: '0 14px 32px -8px rgba(255,132,102,.55), inset 0 1px 0 rgba(255,255,255,.30)',
                  }}>
            Question suivante →
          </button>
        )}
        {phase === 'buzzed' && (
          <button onClick={() => onPhase && onPhase('reveal')}
                  className="w-full h-[54px] rounded-2xl font-semibold text-[15px] tracking-tight bg-white/10 active:scale-[.99]"
                  style={{ border: '1px solid rgba(255,255,255,.16)' }}>
            Révéler la bonne réponse
          </button>
        )}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-full bg-white/70 z-40" />
    </MasterMobileShell>
  );
}

Object.assign(window, { MasterConfigMobile, MasterGameMobile });
