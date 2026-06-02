// common.jsx — Shared constants and layout/navigation components

const PLAYER_SCENES = [
  { id: 'login',       label: 'Connexion',         sub: 'Pseudo' },
  { id: 'lobby',       label: 'Salle d\'attente',  sub: 'Joueurs qui rejoignent' },
  { id: 'buzz-wait',   label: 'Buzz · attente',    sub: 'Désactivé' },
  { id: 'buzz-active', label: 'Buzz · actif',      sub: 'Countdown + plein écran' },
  { id: 'buzz-won',    label: 'Buzz · 1er !',      sub: 'Flash menthe' },
  { id: 'buzz-blocked',label: 'Buzz · bloqué',     sub: 'Trop tard' },
  { id: 'qcm-live',    label: 'QCM · actif',       sub: 'A · B · C · D' },
  { id: 'qcm-locked',  label: 'QCM · envoyé',      sub: 'Verrouillé' },
  { id: 'qcm-right',   label: 'QCM · juste',       sub: 'Bonne réponse' },
  { id: 'qcm-wrong',   label: 'QCM · faux',        sub: 'Mauvaise réponse' },
  { id: 'score',       label: 'Score post-question',sub: '+pts · rang · prochain' },
];

const MASTER_SCENES = [
  { id: 'config',          label: 'Configuration',   sub: 'Thème + difficulté' },
  { id: 'game-question',   label: 'Question live',   sub: 'Buzzers actifs' },
  { id: 'game-buzzed',     label: 'Un joueur buzz',  sub: 'Validation' },
  { id: 'game-reveal',     label: 'Réponse révélée', sub: 'Scores + suite' },
];

function SceneSelector({ scenes, current, onPick, accent, title }) {
  return (
    <div className="glass rounded-2xl p-3 w-[230px]" style={{ '--g': 0.75 }}>
      <div className="text-[10px] tracking-[0.22em] uppercase font-mono text-white/55 px-2 pt-1 pb-2">{title}</div>
      <div className="space-y-1">
        {scenes.map(s => {
          const active = s.id === current;
          return (
            <button key={s.id} onClick={() => onPick(s.id)}
              className="w-full text-left rounded-xl px-3 py-2 transition-all"
              style={{
                background: active ? `${accent}26` : 'transparent',
                boxShadow: active ? `inset 0 0 0 1px ${accent}77` : 'none',
              }}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{
                  background: active ? accent : 'rgba(255,255,255,0.12)',
                }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight"
                       style={{ color: active ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                    {s.label}
                  </div>
                  <div className="text-[10.5px] text-white/45 truncate">{s.sub}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopBar({ view, setView }) {
  const tabs = [
    { id: 'split',          label: 'Vue d\'ensemble' },
    { id: 'player',         label: 'Joueur · mobile' },
    { id: 'master-mobile',  label: 'Maître · mobile' },
    { id: 'master-desktop', label: 'Maître · PC' },
  ];
  return (
    <div className="flex items-center justify-between py-5 px-8 flex-wrap gap-3" style={{ position: 'relative', zIndex: 10 }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{
               background: 'conic-gradient(from 140deg, #ff8466, #f5b54a, #6fe0c4, #7eb8ff, #ff8466)',
               boxShadow: '0 8px 24px -6px rgba(255,132,102,.5)',
             }}>
          <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ background: '#140a1f' }}>
            <Icon.Bolt className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div>
          <div className="font-bold tracking-tight text-[20px] leading-none">FamilyQuizz</div>
          <div className="text-[11px] text-white/45 font-mono tracking-wide">PROTOTYPE · v0.2 GLASS</div>
        </div>
      </div>

      <div className="glass rounded-full p-1 flex" style={{ '--g': 0.7 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            className="px-4 py-2 rounded-full text-[12.5px] font-medium tracking-tight transition-all relative"
            style={{
              background: view === t.id ? 'rgba(255,255,255,0.14)' : 'transparent',
              color: view === t.id ? '#fff' : 'rgba(255,255,255,0.6)',
              boxShadow: view === t.id ? 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 12px rgba(0,0,0,0.3)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-white/45 font-mono">
        <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6fe0c4' }} />
        BACKEND · ANTIGRAVITY 2.0
      </div>
    </div>
  );
}

function SectionHeader({ dotColor, label, caption }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] font-mono text-white/60">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} /> {label}
      </div>
      <div className="text-[12px] text-white/40 font-mono">{caption}</div>
    </div>
  );
}

function SingleView({ scenes, current, onPick, accent, title, children }) {
  const [device, info] = React.Children.toArray(children);
  return (
    <div className="px-8 pb-16 flex justify-center">
      <div className="flex items-start gap-6 flex-wrap">
        <SceneSelector scenes={scenes} current={current} onPick={onPick} accent={accent} title={title} />
        {device}
        <div className="w-[230px]">{info}</div>
      </div>
    </div>
  );
}

function FlowHint() {
  return (
    <div className="max-w-[920px] mx-auto mt-12 glass rounded-2xl p-6" style={{ '--g': 0.7 }}>
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: 'linear-gradient(135deg,#ff8466,#f5b54a)' }}>
          <Icon.Sparkle className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-[15px] tracking-tight mb-1">Comment naviguer</div>
          <div className="text-[13px] text-white/65 leading-relaxed">
            Clique un scénario à gauche d'un appareil pour voir l'état correspondant. Le buzzer mobile occupe tout l'écran maintenant —
            on ne peut plus le rater. Le Maître pilote depuis son canapé via le mode mobile, ou depuis un PC/projo via la vue desktop.
            Ouvre <span className="font-mono text-white/85">Tweaks</span> pour pousser le glass et l'aurora.
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusInfo({ title, desc, accent }) {
  return (
    <div className="glass rounded-2xl p-4 w-[230px] shrink-0" style={{ '--g': 0.7, borderColor: `${accent}44` }}>
      <div className="text-[10px] tracking-[0.22em] uppercase font-mono mb-2" style={{ color: accent }}>Note</div>
      <div className="font-semibold text-[14px] tracking-tight mb-2">{title}</div>
      <div className="text-[12px] text-white/65 leading-relaxed">{desc}</div>
    </div>
  );
}

Object.assign(window, {
  PLAYER_SCENES,
  MASTER_SCENES,
  SceneSelector,
  TopBar,
  SectionHeader,
  SingleView,
  FlowHint,
  FocusInfo,
});
