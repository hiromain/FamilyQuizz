import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

// ─── Design tokens (matches App.jsx and index.css) ──────────────────────────
const C = {
  coral:  '#ff8466',
  amber:  '#f5b54a',
  mint:   '#6fe0c4',
  rose:   '#ff6f9c',
  sky:    '#7eb8ff',
  red:    '#ef5973',
  ink:    '#fbf3ee',
  bg:     '#140a1f',
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function MonoLabel({ children, color = 'rgba(251,243,238,0.45)' }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10, letterSpacing: '0.22em',
      textTransform: 'uppercase', color, lineHeight: 1,
    }}>{children}</div>
  );
}

function Pill({ children, color = C.coral }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      background: `${color}22`, border: `1px solid ${color}55`,
      color, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.06em',
    }}>{children}</span>
  );
}

function GlassCard({ children, style = {}, className = '' }) {
  return (
    <div className={`glass rounded-2xl ${className}`} style={{ padding: '20px 24px', ...style }}>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MasterSettingsPage({ onClose, onBackToWelcome }) {
  const {
    players,
    gameState,
    clearAllPlayers,
    resetGameState,
  } = useGame();

  // Local URL for QR Code
  const gameUrl = window.location.origin;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=140a1f&bgcolor=ffffff&data=${encodeURIComponent(gameUrl)}`;

  // State
  const [copied, setCopied] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Settings states synced with localStorage
  const [timerDuration, setTimerDuration] = useState(() => 
    parseInt(localStorage.getItem('fq_timer_duration') || '30', 10)
  );
  const [timerAction, setTimerAction] = useState(() => 
    localStorage.getItem('fq_timer_action') || 'lock'
  );
  const [scoringMultiplier, setScoringMultiplier] = useState(() => 
    parseFloat(localStorage.getItem('fq_scoring_multiplier') || '1')
  );
  const [scoringPenalty, setScoringPenalty] = useState(() => 
    localStorage.getItem('fq_scoring_penalty') === 'true'
  );
  const [scoringNegative, setScoringNegative] = useState(() => 
    localStorage.getItem('fq_scoring_negative') === 'true'
  );
  const [displayAurora, setDisplayAurora] = useState(() => 
    localStorage.getItem('fq_display_aurora') !== 'false'
  );
  const [fontSize, setFontSize] = useState(() => 
    localStorage.getItem('fq_display_font_size') || 'M'
  );

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('fq_timer_duration', timerDuration); }, [timerDuration]);
  useEffect(() => { localStorage.setItem('fq_timer_action', timerAction); }, [timerAction]);
  useEffect(() => { localStorage.setItem('fq_scoring_multiplier', scoringMultiplier); }, [scoringMultiplier]);
  useEffect(() => { localStorage.setItem('fq_scoring_penalty', scoringPenalty); }, [scoringPenalty]);
  useEffect(() => { localStorage.setItem('fq_scoring_negative', scoringNegative); }, [scoringNegative]);
  useEffect(() => {
    localStorage.setItem('fq_display_aurora', displayAurora);
    // Apply state locally in index.css variable or document class if desired
    const auroraEl = document.querySelector('.aurora');
    if (auroraEl) {
      auroraEl.style.display = displayAurora ? 'block' : 'none';
    }
  }, [displayAurora]);
  useEffect(() => { localStorage.setItem('fq_display_font_size', fontSize); }, [fontSize]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Danger actions with simple prompt safety
  const handleClearPlayers = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir de déconnecter et réinitialiser tous les joueurs ? Cette action effacera leurs pseudos et scores.")) {
      await clearAllPlayers();
    }
  };

  const handleResetStateOnly = async () => {
    if (window.confirm("Réinitialiser le cockpit ? Les joueurs resteront connectés et garderont leurs scores, mais le buzzer et la question en cours seront remis à zéro.")) {
      await resetGameState();
    }
  };

  const handleFullReset = async () => {
    if (window.confirm("🚨 Lancer une NOUVELLE PARTIE ? Cela réinitialisera complètement le jeu et effacera tous les joueurs.")) {
      await clearAllPlayers();
      await resetGameState();
    }
  };

  return (
    <div className="animate-slide-in-right" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: isMobile ? 64 : 0,
      width: '100%',
      maxWidth: 480,
      background: 'rgba(20, 10, 31, 0.95)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '-10px 0 50px rgba(0,0,0,0.60)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      
      {/* ── HEADER ── */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
            boxShadow: `0 8px 22px -6px ${C.coral}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18 }}>⚙️</span>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Paramètres</h2>
            <MonoLabel color="rgba(251,243,238,0.40)">Configuration & Session</MonoLabel>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(251,243,238,0.60)', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = C.coral;
            e.currentTarget.style.color = C.coral;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(251,243,238,0.60)';
          }}
        >
          ✕
        </button>
      </div>

      {/* ── BODY (Scrollable) ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>

        {/* ── SECTION: CONNECTION & QR CODE ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonoLabel>Partage & Accès Joueurs 📱</MonoLabel>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{
              width: 140, height: 140, borderRadius: 12, overflow: 'hidden',
              background: '#fff', padding: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: `0 0 24px rgba(126,184,255,0.20)`,
              border: `1.5px solid rgba(255,255,255,0.20)`
            }}>
              <img src={qrCodeUrl} alt="QR Code de connexion" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{ width: '100%' }}>
              <div style={{
                fontSize: 13, color: 'rgba(251,243,238,0.85)', fontWeight: 600,
                background: 'rgba(0,0,0,0.20)', padding: '8px 12px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gameUrl}</span>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: copied ? C.mint : C.sky, fontSize: 12, fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0,
                  }}
                >
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowProjection(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.sky}55`,
                background: `${C.sky}18`, color: C.sky, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.sky}28`}
              onMouseLeave={e => e.currentTarget.style.background = `${C.sky}18`}
            >
              📱 Afficher le QR Code Géant
            </button>

            <button
              onClick={() => window.open('/projection', '_blank')}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.mint}55`,
                background: `${C.mint}18`, color: C.mint, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.mint}28`}
              onMouseLeave={e => e.currentTarget.style.background = `${C.mint}18`}
            >
              📺 Ouvrir l'Écran de Projection TV
            </button>

          </GlassCard>
        </section>

        {/* ── SECTION: CHRONOMETRE ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonoLabel>Minuteur / Chrono ⏱️</MonoLabel>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Durée par défaut</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.sky }}>{timerDuration} secondes</span>
              </div>
              <input
                type="range"
                min="5" max="90" step="5"
                value={timerDuration}
                onChange={e => setTimerDuration(parseInt(e.target.value, 10))}
                className="year-slider"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <span style={{ display: 'block', fontSize: 12, color: 'rgba(251,243,238,0.50)', marginBottom: 8 }}>À la fin du temps :</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'lock', label: '🔒 Verrouiller le buzzer' },
                  { id: 'warn', label: '🔊 Jouer un bip / signal' },
                  { id: 'none', label: '💤 Ne rien faire' }
                ].map(act => (
                  <label key={act.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    fontSize: 13, color: timerAction === act.id ? C.ink : 'rgba(251,243,238,0.60)',
                    padding: '8px 12px', borderRadius: 8, background: timerAction === act.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${timerAction === act.id ? 'rgba(255,255,255,0.08)' : 'transparent'}`
                  }}>
                    <input
                      type="radio"
                      name="timerAction"
                      checked={timerAction === act.id}
                      onChange={() => setTimerAction(act.id)}
                      style={{ accentColor: C.sky }}
                    />
                    {act.label}
                  </label>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ── SECTION: SCORING ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonoLabel>Points & Scoring 🎯</MonoLabel>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Multiplier */}
            <div>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Multiplicateur de points global</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[0.5, 1, 1.5, 2].map(mul => (
                  <button
                    key={mul}
                    onClick={() => setScoringMultiplier(mul)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer',
                      background: scoringMultiplier === mul ? `${C.mint}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${scoringMultiplier === mul ? C.mint + '66' : 'rgba(255,255,255,0.08)'}`,
                      color: scoringMultiplier === mul ? C.mint : 'rgba(251,243,238,0.50)',
                      transition: 'all 0.15s',
                    }}
                  >
                    ×{mul}
                  </button>
                ))}
              </div>
            </div>

            {/* Penalty Toggle */}
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Pénalité erreur</span>
                <span style={{ fontSize: 11, color: 'rgba(251,243,238,0.40)' }}>Retire 1pt en cas de mauvaise réponse</span>
              </div>
              <input
                type="checkbox"
                checked={scoringPenalty}
                onChange={e => setScoringPenalty(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: C.mint }}
              />
            </label>

            {/* Negative Scores Toggle */}
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Autoriser scores négatifs</span>
                <span style={{ fontSize: 11, color: 'rgba(251,243,238,0.40)' }}>Les scores peuvent descendre sous zéro</span>
              </div>
              <input
                type="checkbox"
                checked={scoringNegative}
                onChange={e => setScoringNegative(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: C.mint }}
              />
            </label>
          </GlassCard>
        </section>

        {/* ── SECTION: DISPLAY & COMFORT ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonoLabel>Affichage & Confort 🖥️</MonoLabel>
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Aurora toggle */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Aurores en arrière-plan</span>
                <span style={{ fontSize: 11, color: 'rgba(251,243,238,0.40)' }}>Animations colorées (fluidité)</span>
              </div>
              <input
                type="checkbox"
                checked={displayAurora}
                onChange={e => setDisplayAurora(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: C.sky }}
              />
            </label>

            {/* Font size picker */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Taille de la question (Cockpit)</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {['S', 'M', 'L', 'XL'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    style={{
                      padding: '6px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer',
                      background: fontSize === sz ? `${C.sky}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${fontSize === sz ? C.sky + '66' : 'rgba(255,255,255,0.08)'}`,
                      color: fontSize === sz ? C.sky : 'rgba(251,243,238,0.50)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Rupture visuelle volontaire : tout ce qui précède est cosmétique/réglable sans risque,
            tout ce qui suit efface des données. Ce n'est pas juste une section de plus. */}
        <div style={{ borderTop: `1px dashed ${C.red}33`, margin: '4px 0' }} />

        {/* ── SECTION: DANGER ZONE ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MonoLabel color={C.red}>Danger Zone 🚨</MonoLabel>
          <GlassCard style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            border: `1px solid ${C.red}44`, background: `${C.red}0a`
          }}>
            <button
              onClick={handleResetStateOnly}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', color: C.amber, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              ♻️ Réinitialiser le cockpit
            </button>

            <button
              onClick={handleClearPlayers}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', color: C.red, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.red}14`}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              🗑️ Déconnecter tous les joueurs
            </button>

            <div style={{ borderTop: '1px solid rgba(239,89,115,0.15)', marginTop: 4, paddingTop: 10 }}>
              <button
                onClick={handleFullReset}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, #d94060)`,
                  boxShadow: `0 6px 16px ${C.red}33`,
                  color: '#fff', fontWeight: 800, fontSize: 13,
                  cursor: 'pointer', transition: 'transform 0.15s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🏁 Lancer une Nouvelle Partie
              </button>
            </div>
          </GlassCard>
        </section>

        {/* ── SECTION: EXIT COCKPIT ── */}
        {onBackToWelcome && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <MonoLabel>Retour au menu 🏠</MonoLabel>
            <GlassCard style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              border: `1px solid rgba(255, 132, 102, 0.35)`, background: 'rgba(255, 132, 102, 0.05)'
            }}>
              <button
                onClick={() => {
                  if (window.confirm("Quitter le cockpit ? Les scores actuels seront conservés mais vous retournerez à l'accueil.")) {
                    onBackToWelcome();
                  }
                }}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${C.coral}, #f25a38)`,
                  boxShadow: `0 6px 16px ${C.coral}33`,
                  color: '#fff', fontWeight: 800, fontSize: 13,
                  cursor: 'pointer', transition: 'transform 0.15s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🏠 Quitter le Cockpit / Retour Accueil
              </button>
            </GlassCard>
          </section>
        )}

        {/* ── SECTION: SESSION INFO ── */}
        <section style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(251,243,238,0.30)', fontFamily: 'monospace' }}>
            FamilyQuizz Cockpit v1.1<br />
            Firebase Realtime DB sync actif<br />
            {Object.keys(players).length} joueur(s) connecté(s)
          </div>
        </section>

      </div>

      {/* ─── PROJECTION MODE MODAL (FULLSCREEN OVERLAY) ─── */}
      {showProjection && (
        <div className="animate-fade-in" style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10, 5, 20, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px',
        }}>
          {/* Top-right close */}
          <button
            onClick={() => setShowProjection(false)}
            style={{
              position: 'absolute', top: 30, right: 30,
              width: 50, height: 50, borderRadius: 9999,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            ✕
          </button>

          {/* Background decoration blur */}
          <div className="aurora" style={{ opacity: 0.6, pointerEvents: 'none' }}>
            <i className="blob-3" style={{ left: '20%', top: '20%', width: '40vmax', height: '40vmax' }} />
            <i className="blob-5" style={{ right: '20%', bottom: '20%', width: '40vmax', height: '40vmax' }} />
          </div>

          <div className="animate-zoom-in-up" style={{
            maxWidth: 600, width: '100%', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
            position: 'relative', zIndex: 10,
          }}>
            <div>
              <h1 style={{
                fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', margin: 0, marginBottom: 8,
                background: `linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6) 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Rejoignez la partie !
              </h1>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.22em',
                color: 'rgba(251,243,238,0.50)', textTransform: 'uppercase', margin: 0,
              }}>
                Scannez le QR Code pour entrer dans l'arène
              </p>
            </div>

            {/* Giant QR container */}
            <div style={{
              width: 320, height: 320, borderRadius: 28,
              background: '#fff', padding: 18,
              boxShadow: `0 24px 80px rgba(111,224,196,0.30), 0 0 40px rgba(126,184,255,0.20)`,
              border: `2px solid rgba(255,255,255,0.30)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'buzz-breathe 2.5s ease-in-out infinite',
            }}>
              <img src={qrCodeUrl} alt="QR Code de connexion géant" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* Giant text link */}
            <div style={{ width: '100%' }}>
              <div style={{
                fontSize: 22, color: C.mint, fontWeight: 700,
                background: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: 16,
                border: '1.5px solid rgba(255,255,255,0.08)', fontFamily: 'monospace',
                display: 'inline-flex', alignItems: 'center', gap: 14,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <span>{gameUrl}</span>
              </div>
            </div>
            
            <p style={{ fontSize: 14, color: 'rgba(251,243,238,0.40)', margin: 0 }}>
              💡 Sortez vos smartphones ou tablettes et scannez le code ci-dessus.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
