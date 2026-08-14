import React, { useState } from 'react';
import { C, DIFF } from '../../constants/theme';
import Pill from '../../components/ui/Pill';
import TimerBar from '../../components/ui/TimerBar';
import MonoLabel from '../../components/ui/MonoLabel';
import Avatar from '../../components/ui/Avatar';

/* ─── Styles et utilitaires en ligne pour une robustesse maximale ─── */
const btnStyle = (color, glow, isHov, disabled) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 10, border: 'none',
  fontWeight: 700, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.38 : 1,
  transition: 'all 0.18s cubic-bezier(0.2,0.8,0.2,1)',
  fontFamily: "'Space Grotesk', sans-serif",
  whiteSpace: 'nowrap',
  background: isHov && !disabled
    ? `linear-gradient(135deg, ${color}, ${color}cc)`
    : `linear-gradient(135deg, ${color}ee, ${color}bb)`,
  color: '#0d1a2a',
  boxShadow: glow && isHov && !disabled 
    ? `0 8px 20px -4px ${color}88` 
    : glow ? `0 4px 14px -4px ${color}44` : 'none',
});

const ghostBtnStyle = (accent, isHov, disabled) => {
  const col = accent || 'rgba(255,255,255,0.60)';
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
    fontFamily: "'Space Grotesk', sans-serif",
    opacity: disabled ? 0.38 : 1,
    border: `1px solid ${isHov ? col : col + '55'}`,
    background: isHov ? `${col}14` : 'transparent',
    color: isHov ? col : `${col}bb`,
    transition: 'all 0.18s',
  };
};

/** Inline alert banner */
function AlertBanner({ type = 'warn', children, onClose }) {
  const cfg = {
    warn:    { bg: `${C.amber}1a`, border: `${C.amber}44`, color: C.amber, icon: '⚠️' },
    error:   { bg: `${C.red}1a`,   border: `${C.red}55`,   color: C.red,   icon: '⛔' },
    offline: { bg: 'rgba(168,85,247,0.14)', border: 'rgba(168,85,247,0.40)', color: 'rgb(216,180,254)', icon: '📶' },
    info:    { bg: `${C.sky}14`,   border: `${C.sky}33`,   color: C.sky,   icon: 'ℹ️' },
  };
  const { bg, border, color, icon } = cfg[type] || cfg.warn;
  return (
    <div style={{
      padding: '11px 16px', borderRadius: 12,
      background: bg, border: `1px solid ${border}`,
      color, fontSize: 13, fontWeight: 500, lineHeight: 1.4,
      display: 'flex', alignItems: 'flex-start', gap: 10,
      animation: 'pop-in 0.3s ease',
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color, cursor: 'pointer',
          fontWeight: 800, fontSize: 14, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0,
        }}>✕</button>
      )}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */


export default function GamePanel({
  onBackToWelcome,
  activeQuestionPool,
  activeQuestion,
  buzzerWinnerId,
  isBuzzerActive,
  revealedAnswer,
  setRevealedAnswer,
  setShowSettings,
  masterError,
  setMasterError,
  firebaseError,
  connected,
  localMode,
  setLocalMode,
  bonusPoints,
  setBonusPoints,
  players,
  gameState,
  handleRandomQuestionDraw,
  handleManualQuestionSelect,
  handleValidateAnswer,
  activateBuzzer,
  deactivateBuzzer,
  resetBuzzer,
  resetBuzzedStatus,
  revealAnswer,
  revealQuestion,
  selectedYear,
  isMobile = false,
  quizMode = false,
  onEnterQuizMode,
  onExitQuizMode,
}) {
  const [mjCheatSheetOpen, setMjCheatSheetOpen] = useState(false);

  const currentIndex = activeQuestionPool.findIndex(item => item.questionObj.id === activeQuestion?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < activeQuestionPool.length - 1 && currentIndex !== -1;

  const handlePrevQuestion = () => {
    if (hasPrev) {
      const prevItem = activeQuestionPool[currentIndex - 1];
      handleManualQuestionSelect(prevItem.category, prevItem.subcategory, prevItem.questionObj);
    }
  };

  const handleNextQuestion = () => {
    if (hasNext) {
      const nextItem = activeQuestionPool[currentIndex + 1];
      handleManualQuestionSelect(nextItem.category, nextItem.subcategory, nextItem.questionObj);
    } else if (activeQuestionPool.length > 0 && !activeQuestion) {
      const firstItem = activeQuestionPool[0];
      handleManualQuestionSelect(firstItem.category, firstItem.subcategory, firstItem.questionObj);
    }
  };

  const handleTimerExpire = () => {
    const action = localStorage.getItem('fq_timer_action') || 'lock';
    if (action === 'lock') deactivateBuzzer();
    if (action === 'warn') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {}
    }
  };

  const isAnswerRevealed = revealedAnswer || gameState.show_answer;
  const diffKey = activeQuestion?.difficulty?.toLowerCase() || 'moyen';
  const basePoints = DIFF[diffKey]?.points || 2;
  const totalPoints = basePoints + bonusPoints;


  /* ── Buzzer status badge ── */
  const BuzzerBadge = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 12px', borderRadius: 20,
      background: isBuzzerActive ? `${C.mint}14` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isBuzzerActive ? C.mint + '44' : 'rgba(255,255,255,0.10)'}`,
      transition: 'all 0.3s',
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isBuzzerActive ? C.mint : 'rgba(255,255,255,0.25)',
        boxShadow: isBuzzerActive ? `0 0 8px ${C.mint}` : 'none',
        animation: isBuzzerActive ? 'buzz-breathe 1.8s infinite' : 'none',
      }} />
      <span style={{
        fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: isBuzzerActive ? C.mint : 'rgba(251,243,238,0.40)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {isBuzzerActive ? 'Buzzer ouvert' : 'Verrouillé'}
      </span>
    </div>
  );

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden', position: 'relative', zIndex: 10, width: '100%',
    }}>

      {/* ══════════════════════════════════════════════════════════════
          TOP COMMAND BAR
          Two clear groups: LEFT = draw + status  |  RIGHT = settings
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '10px 14px' : '12px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(8px)',
        flexShrink: 0, gap: 10, flexWrap: 'wrap',
      }}>
        {/* LEFT: draw button + buzzer badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isMobile && onBackToWelcome && (
            <button
              onClick={() => {
                if (window.confirm("Quitter le cockpit ? Les scores actuels seront conservés mais vous retournerez à l'accueil.")) {
                  onBackToWelcome();
                }
              }}
              className="no-tap-highlight"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(251,243,238,0.85)',
                fontSize: 16, cursor: 'pointer',
                transition: 'all 0.18s',
                fontFamily: "'Space Grotesk', sans-serif",
                touchAction: 'manipulation',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = C.coral;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              🏠
            </button>
          )}

          {!quizMode ? (
            /* Badge Mode Config */
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 13 }}>🎛️</span>
              <span style={{
                fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(251,243,238,0.50)', textTransform: 'uppercase', letterSpacing: '0.10em'
              }}>Mode Configuration</span>
            </div>
          ) : (
            /* Controls Mode Jeu */
            <>
              <button
                onClick={handleRandomQuestionDraw}
                disabled={activeQuestionPool.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10, border: 'none',
                  fontWeight: 700, fontSize: 12, cursor: activeQuestionPool.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: activeQuestionPool.length === 0 ? 0.38 : 1,
                  transition: 'all 0.18s',
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: `linear-gradient(135deg, ${C.sky}, #5fa8ee)`,
                  color: '#0d1a2a',
                  boxShadow: `0 4px 14px -4px ${C.sky}44`,
                }}
                onMouseEnter={e => { if (activeQuestionPool.length > 0) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                🎲 Tirer
                <span style={{
                  background: 'rgba(0,0,0,0.18)', borderRadius: 6,
                  padding: '1px 7px', fontSize: 11, color: '#fff'
                }}>
                  {activeQuestionPool.length}
                </span>
              </button>
              <BuzzerBadge />
              {isMobile && (
                <button
                  onClick={onExitQuizMode}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    fontWeight: 700, fontSize: 11,
                    fontFamily: "'Space Grotesk', sans-serif",
                    border: `1px solid ${C.red}55`,
                    background: 'rgba(239, 89, 115, 0.05)',
                    color: C.red,
                    transition: 'all 0.18s',
                    touchAction: 'manipulation',
                  }}
                >
                  ⏹ Arrêter
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT: settings (desktop only) */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8 }}>
            {quizMode && (
              <button
                onClick={onExitQuizMode}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
                  fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                  fontFamily: "'Space Grotesk', sans-serif",
                  border: `1px solid ${C.red}55`,
                  background: 'rgba(239, 89, 115, 0.05)',
                  color: C.red,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 89, 115, 0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 89, 115, 0.05)'; }}
              >
                ⏹ Arrêter le Quiz
              </button>
            )}
            {onBackToWelcome && (
              <button
                onClick={onBackToWelcome}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
                  fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                  fontFamily: "'Space Grotesk', sans-serif",
                  border: `1px solid rgba(255, 255, 255, 0.25)`,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(251,243,238,0.70)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'rgba(251,243,238,0.70)'; }}
              >
                🏠 Accueil
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
                fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                fontFamily: "'Space Grotesk', sans-serif",
                border: `1px solid rgba(255, 255, 255, 0.25)`,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              ⚙️ Réglages
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: isMobile ? '14px 12px 32px' : '24px 28px 40px',
        gap: 16, overflowY: 'auto',
      }}>

        {/* ── Alert banners ── */}
        {firebaseError && (
          <AlertBanner type="error">
            <strong>Problème Firebase :</strong> {firebaseError}
          </AlertBanner>
        )}
        {!connected && !localMode && (
          <AlertBanner type="warn">
            ⏳ Synchronisation Firebase en cours — les actions seront appliquées dès la connexion.
          </AlertBanner>
        )}
        {localMode && (
          <AlertBanner type="offline">
            Mode hors-ligne actif. Les connexions réseau des joueurs sont désactivées.{' '}
            <button onClick={() => setLocalMode(false)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 6, color: 'inherit', padding: '2px 8px',
              fontSize: 11, cursor: 'pointer', fontWeight: 700, marginLeft: 4,
            }}>Reconnecter</button>
          </AlertBanner>
        )}
        {masterError && (
          <AlertBanner type="error" onClose={() => setMasterError(null)}>
            {masterError}
          </AlertBanner>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ACTIVE QUESTION VIEW
        ═══════════════════════════════════════════════════════════ */}
        {activeQuestion ? (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            width: '100%', maxWidth: 780, margin: '0 auto',
            flexShrink: 0,
          }}>
            {/* ── Question card wrapper with Arrow Navigation ── */}
            <div style={{
              maxWidth: 780, width: '100%', margin: '0 auto',
              display: 'flex', alignItems: 'center', gap: 16,
              justifyContent: 'space-between',
              animation: 'pop-in 0.5s cubic-bezier(0.2,0.8,0.2,1)',
            }}>
              
              {/* Left Arrow Button (Desktop only, if we have a previous item) */}
              {!isMobile && (
                <button
                  onClick={handlePrevQuestion}
                  disabled={!hasPrev}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', border: 'none',
                    background: hasPrev ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                    border: `1.5px solid ${hasPrev ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'}`,
                    color: hasPrev ? '#fff' : 'rgba(255,255,255,0.15)',
                    fontSize: 20, cursor: hasPrev ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (hasPrev) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ◀
                </button>
              )}

              {/* Central Question box content */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {/* Badge row */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <Pill color={C.sky}>{activeQuestion.theme}</Pill>
                  {activeQuestion.difficulty && (
                    <Pill color={DIFF[diffKey]?.color || C.amber}>
                      {activeQuestion.difficulty} · {DIFF[diffKey]?.points || 2}pt{(DIFF[diffKey]?.points || 2) > 1 ? 's' : ''}
                    </Pill>
                  )}
                  {activeQuestion.year && <Pill color={C.rose}>📅 {activeQuestion.year}</Pill>}
                  <Pill color="rgba(251,243,238,0.30)">{activeQuestion.type === 'qcm' ? 'QCM' : 'Ouverte'}</Pill>
                </div>

                {/* Question text */}
                <div style={{
                  padding: isMobile ? '20px 18px' : '26px 36px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700, lineHeight: 1.4,
                    letterSpacing: '-0.02em', color: C.ink,
                    textAlign: isMobile ? 'center' : 'left',
                  }}>
                    {activeQuestion.question}
                  </h2>
                </div>

                {/* Mobile Navigation arrows (compact, right below the text box) */}
                {isMobile && (
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 4 }}>
                    <button
                      onClick={handlePrevQuestion}
                      disabled={!hasPrev}
                      style={{
                        padding: '8px 20px', borderRadius: 10, border: 'none',
                        background: hasPrev ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${hasPrev ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                        color: hasPrev ? '#fff' : 'rgba(255,255,255,0.15)',
                        fontSize: 14, fontWeight: 700, cursor: hasPrev ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                      }}
                    >
                      ◀ Précédente
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={!hasNext}
                      style={{
                        padding: '8px 20px', borderRadius: 10, border: 'none',
                        background: hasNext ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${hasNext ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                        color: hasNext ? '#fff' : 'rgba(255,255,255,0.15)',
                        fontSize: 14, fontWeight: 700, cursor: hasNext ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                      }}
                    >
                      Suivante ▶
                    </button>
                  </div>
                )}

                {/* Timer */}
                <TimerBar
                  endsAt={gameState.timer_ends_at}
                  duration={gameState.timer_duration}
                  onExpire={handleTimerExpire}
                />
              </div>

              {/* Right Arrow Button (Desktop only, if we have a next item) */}
              {!isMobile && (
                <button
                  onClick={handleNextQuestion}
                  disabled={!hasNext}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', border: 'none',
                    background: hasNext ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                    border: `1.5px solid ${hasNext ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'}`,
                    color: hasNext ? '#fff' : 'rgba(255,255,255,0.15)',
                    fontSize: 20, cursor: hasNext ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (hasNext) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ▶
                </button>
              )}

            </div>

            {/* ── MJ CHEAT SHEET & FULL EXPLANATION (Collapsible / Deployable) ── */}
            <div style={{
              maxWidth: 780, width: '100%', margin: '0 auto',
              borderRadius: 16,
              background: 'rgba(255, 181, 74, 0.06)',
              border: `1.5px solid rgba(245, 181, 74, ${mjCheatSheetOpen ? 0.35 : 0.15})`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
            }}>
              {/* Header block (clickable toggle) */}
              <button
                onClick={() => setMjCheatSheetOpen(o => !o)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px', border: 'none', background: 'rgba(0,0,0,0.15)',
                  cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>👑</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.amber, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Fiche Réponse & Explications MJ
                  </span>
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700,
                    background: 'rgba(245, 181, 74, 0.15)', color: C.amber,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    Invisible aux joueurs
                  </span>
                  <span style={{ color: C.amber, fontSize: 12, transform: mjCheatSheetOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Expansible cheat sheet body */}
              {mjCheatSheetOpen && (
                <div style={{
                  padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12,
                  borderTop: '1px solid rgba(245, 181, 74, 0.15)',
                  animation: 'rise-in 0.25s ease',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 13, color: 'rgba(251,243,238,0.60)', fontWeight: 600 }}>
                      Réponse attendue :
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.mint, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                      🎯 {activeQuestion.answer}
                    </div>
                  </div>

                  {activeQuestion.explanation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                      <div style={{ fontSize: 13, color: 'rgba(251,243,238,0.60)', fontWeight: 600 }}>
                        💡 Explication complète :
                      </div>
                      <p style={{
                        margin: 0, fontSize: 13, color: 'rgba(251,243,238,0.90)', lineHeight: 1.6,
                        background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        {activeQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── QCM options (Player-visible states) ── */}
            {activeQuestion.type === 'qcm' && activeQuestion.options && (() => {
              const OPTION_COLORS = [C.coral, C.sky, C.amber, C.mint];
              const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? 9 : 12,
                  maxWidth: 780, width: '100%', margin: '0 auto',
                  animation: 'rise-in 0.5s cubic-bezier(0.2,0.8,0.2,1)',
                }}>
                  {activeQuestion.options.map((opt, i) => {
                    const isCorrect = opt === activeQuestion.answer;
                    const accent = OPTION_COLORS[i % OPTION_COLORS.length];
                    const revealed = isAnswerRevealed && isCorrect;
                    const wrong    = isAnswerRevealed && !isCorrect;
                    return (
                      <div
                        key={i}
                        onClick={() => { revealAnswer(!isAnswerRevealed); setRevealedAnswer(!isAnswerRevealed); }}
                        style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: isMobile ? '13px 15px' : '16px 20px',
                        borderRadius: 15,
                        cursor: 'pointer',
                        background: revealed
                          ? `linear-gradient(135deg, ${C.mint}22, ${C.mint}0d)`
                          : wrong ? 'rgba(255,255,255,0.02)'
                          : `linear-gradient(135deg, ${accent}12, ${accent}07)`,
                        border: `2px solid ${revealed ? C.mint : wrong ? 'rgba(255,255,255,0.05)' : accent + '44'}`,
                        boxShadow: revealed ? `0 0 28px ${C.mint}2a` : wrong ? 'none' : `0 4px 16px ${accent}14`,
                        transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
                        opacity: wrong ? 0.40 : 1,
                        position: 'relative', overflow: 'hidden',
                      }}
                        onMouseEnter={e => { if (!isAnswerRevealed) e.currentTarget.style.transform = 'scale(1.015)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <div style={{
                          width: isMobile ? 36 : 42, height: isMobile ? 36 : 42,
                          borderRadius: 11, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: isMobile ? 15 : 18,
                          fontFamily: "'JetBrains Mono', monospace",
                          background: revealed ? C.mint : wrong ? 'rgba(255,255,255,0.05)' : `${accent}28`,
                          border: `1.5px solid ${revealed ? C.mint + 'bb' : wrong ? 'rgba(255,255,255,0.07)' : accent + '55'}`,
                          color: revealed ? '#0d2820' : wrong ? 'rgba(251,243,238,0.20)' : accent,
                          transition: 'all 0.35s',
                        }}>
                          {OPTION_LETTERS[i]}
                        </div>
                        <span style={{
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: revealed ? 700 : 500,
                          color: revealed ? C.mint : wrong ? 'rgba(251,243,238,0.30)' : C.ink,
                          lineHeight: 1.35, flex: 1, transition: 'color 0.35s',
                        }}>{opt}</span>
                        {revealed && (
                          <div style={{
                            background: C.mint, color: '#0d2820',
                            padding: '3px 9px', borderRadius: 7,
                            fontSize: 10, fontWeight: 800,
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.08em', flexShrink: 0,
                            animation: 'badge-pop 0.4s cubic-bezier(0.2,0.8,0.2,1)',
                          }}>✓ CORRECT</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── Open answer reveal (Player view overlay) ── */}
            {activeQuestion.type === 'open' && isAnswerRevealed && (
              <div style={{
                maxWidth: 780, width: '100%', margin: '0 auto',
                padding: '18px 24px', borderRadius: 16,
                background: `${C.mint}12`, border: `1.5px solid ${C.mint}44`,
                animation: 'pop-in 0.4s cubic-bezier(0.2,0.8,0.2,1)',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.mint, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
                  ✓ Réponse correcte
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
                  {activeQuestion.answer}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                GAME CONTROLS ZONE
                ─────────────────────────────────────────────────────────
                Unified robust control panel using native high-fidelity styling
            ══════════════════════════════════════════════════════════ */}
            <div style={{
              maxWidth: 780, width: '100%', margin: '0 auto',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>

              {/* ── Section header ── */}
              <div style={{
                padding: '9px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(251,243,238,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  Contrôles de jeu
                </span>
              </div>

              <div style={{ padding: isMobile ? '10px' : '14px 18px', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 12 }}>

                {/* Row 1: Buzzer controls */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 6 : 8,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: 'rgba(251,243,238,0.30)', textTransform: 'uppercase', letterSpacing: '0.15em',
                    minWidth: 84, marginBottom: isMobile ? 2 : 0,
                  }}>Buzzers</span>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'auto auto auto',
                    gap: isMobile ? 6 : 8,
                    flex: 1,
                  }}>
                    <button
                      onClick={() => {
                        const duration = parseInt(localStorage.getItem('fq_timer_duration') || '30', 10);
                        activateBuzzer(duration);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: isMobile ? 20 : 10, border: 'none',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: `linear-gradient(135deg, ${C.mint}, #52c9b0)`,
                        color: '#0d2820',
                        opacity: isBuzzerActive ? 0.5 : 1,
                        boxShadow: `0 4px 14px -4px ${C.mint}44`,
                        transition: 'transform 0.15s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      🔔 Activer
                    </button>

                    <button
                      onClick={deactivateBuzzer}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: isMobile ? 20 : 10, border: 'none',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: `linear-gradient(135deg, ${C.red}, #d03558)`,
                        color: '#fff',
                        opacity: !isBuzzerActive ? 0.5 : 1,
                        boxShadow: `0 4px 14px -4px ${C.red}44`,
                        transition: 'transform 0.15s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {isMobile ? '🔒 Bloquer' : '🔒 Verrouiller'}
                    </button>

                    <button
                      onClick={resetBuzzedStatus}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '7px 13px', borderRadius: isMobile ? 20 : 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, whiteSpace: 'nowrap',
                        fontFamily: "'Space Grotesk', sans-serif",
                        border: `1px solid rgba(245, 181, 74, 0.4)`,
                        background: 'rgba(245, 181, 74, 0.05)',
                        color: C.amber,
                        transition: 'all 0.18s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = 'rgba(245, 181, 74, 0.1)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'rgba(245, 181, 74, 0.05)'; }}
                    >
                      {isMobile ? '♻️ Reset' : '♻️ Réinitialiser'}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                {/* Row 2: Answer visibility */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 6 : 8,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: 'rgba(251,243,238,0.30)', textTransform: 'uppercase', letterSpacing: '0.15em',
                    minWidth: 84, marginBottom: isMobile ? 2 : 0,
                  }}>Réponse</span>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'auto auto',
                    gap: isMobile ? 6 : 8,
                    flex: 1,
                  }}>
                    <button
                      onClick={() => { revealAnswer(true); setRevealedAnswer(true); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: isMobile ? 20 : 10, border: 'none',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: `linear-gradient(135deg, ${C.sky}, #5fa8ee)`,
                        color: '#0d1a2a',
                        opacity: isAnswerRevealed ? 0.5 : 1,
                        boxShadow: `0 4px 14px -4px ${C.sky}44`,
                        transition: 'transform 0.15s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {isMobile ? '👁️ Révéler' : '👁️ Révéler la réponse'}
                    </button>

                    <button
                      onClick={() => { revealAnswer(false); setRevealedAnswer(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '7px 13px', borderRadius: isMobile ? 20 : 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, whiteSpace: 'nowrap',
                        fontFamily: "'Space Grotesk', sans-serif",
                        border: `1px solid rgba(255, 255, 255, 0.25)`,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(251,243,238,0.70)',
                        opacity: isAnswerRevealed ? 1 : 0.5,
                        transition: 'all 0.18s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                    >
                      {isMobile ? '🙈 Masquer' : '🙈 Cacher la réponse'}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                {/* Row 3: Player screens visibility control */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 6 : 8,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: 'rgba(251,243,238,0.30)', textTransform: 'uppercase', letterSpacing: '0.15em',
                    minWidth: 84, marginBottom: isMobile ? 2 : 0,
                  }}>Écrans Joueurs</span>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'auto auto',
                    gap: isMobile ? 6 : 8,
                    flex: 1,
                  }}>
                    <button
                      onClick={() => revealQuestion(true)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: isMobile ? 20 : 10, border: 'none',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: `linear-gradient(135deg, ${C.sky}, #5fa8ee)`,
                        color: '#0d1a2a',
                        opacity: (gameState.show_question !== false) ? 0.5 : 1,
                        boxShadow: `0 4px 14px -4px ${C.sky}44`,
                        transition: 'transform 0.15s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {isMobile ? '📺 Afficher' : '📺 Afficher la question'}
                    </button>

                    <button
                      onClick={() => revealQuestion(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: isMobile ? 20 : 10, border: 'none',
                        fontWeight: 700, fontSize: isMobile ? 11 : 12, cursor: 'pointer',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: `linear-gradient(135deg, ${C.amber}, #e09d2f)`,
                        color: '#0d2820',
                        opacity: (gameState.show_question === false) ? 0.5 : 1,
                        boxShadow: `0 4px 14px -4px ${C.amber}44`,
                        transition: 'transform 0.15s',
                        height: isMobile ? 38 : 'auto',
                        touchAction: 'manipulation',
                      }}
                      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { if (!isMobile) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {isMobile ? '🗣️ Oral seul' : '🙈 Masquer la question (oral)'}
                    </button>
                  </div>
                </div>

              </div>
            </div>


            {/* ══════════════════════════════════════════════════════════
                BUZZER WINNER DECISION PANEL
            ══════════════════════════════════════════════════════════ */}
            {buzzerWinnerId ? (
              <div style={{
                maxWidth: 780, width: '100%', margin: '0 auto',
                borderRadius: 20,
                background: `linear-gradient(135deg, ${C.mint}14, ${C.sky}0a)`,
                border: `1.5px solid ${C.mint}55`,
                boxShadow: `0 0 50px ${C.mint}18, 0 12px 40px rgba(0,0,0,0.20)`,
                overflow: 'hidden',
                animation: 'pop-in 0.4s cubic-bezier(0.2,0.8,0.2,1)',
              }}>
                {/* Header: winner */}
                <div style={{
                  padding: isMobile ? '16px 18px' : '20px 26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 14, flexWrap: 'wrap',
                  borderBottom: `1px solid ${C.mint}22`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar name={players[buzzerWinnerId]?.nickname || '?'} tone={C.amber} size={isMobile ? 44 : 52} />
                    <div>
                      <Pill color={C.mint}>⚡ À la parole</Pill>
                      <div style={{ marginTop: 5, fontWeight: 800, fontSize: isMobile ? 20 : 24, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {players[buzzerWinnerId]?.nickname || 'Joueur Inconnu'}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(251,243,238,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {DIFF[diffKey]?.label || 'Moyen'} — base {basePoints}pt
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(251,243,238,0.35)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 2 }}>Total</div>
                    <div style={{ fontWeight: 800, fontSize: 36, color: C.mint, letterSpacing: '-0.06em', lineHeight: 1 }}>
                      {totalPoints}<span style={{ fontSize: 16, fontWeight: 600 }}>pt{totalPoints > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Bonus row */}
                <div style={{
                  padding: isMobile ? '12px 14px' : '12px 18px',
                  borderBottom: `1px solid ${C.mint}18`,
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(251,243,238,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: 2 }}>🎁 Bonus</span>
                    {isMobile && (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mint, fontWeight: 700 }}>
                        {bonusPoints > 0 ? `+${bonusPoints} points` : 'aucun'}
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                    flex: 1,
                  }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: isMobile ? 1 : 'none' }}>
                      {[0, 1, 2, 3, 5].map(preset => {
                        const on = bonusPoints === preset;
                        return (
                          <button
                            key={preset}
                            onClick={() => setBonusPoints(preset)}
                            style={{
                              flex: isMobile ? 1 : 'none',
                              padding: isMobile ? '8px 12px' : '5px 11px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: "'JetBrains Mono', monospace",
                              background: on ? `${C.sky}28` : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${on ? C.sky + '88' : 'rgba(255,255,255,0.10)'}`,
                              color: on ? C.sky : 'rgba(251,243,238,0.45)',
                              transition: 'all .15s',
                              boxShadow: on ? `0 2px 10px ${C.sky}22` : 'none',
                              height: isMobile ? 36 : 'auto',
                              touchAction: 'manipulation',
                            }}
                          >
                            {preset === 0 ? '—' : `+${preset}`}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginLeft: isMobile ? 0 : 2,
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      marginTop: isMobile ? 6 : 0,
                    }}>
                      {['-', '+'].map((sym, idx) => (
                        <button
                          key={sym}
                          onClick={() => setBonusPoints(p => Math.max(0, p + (idx === 0 ? -1 : 1)))}
                          style={{
                            width: isMobile ? 34 : 28,
                            height: isMobile ? 34 : 28,
                            borderRadius: 7,
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            color: C.ink,
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation',
                          }}
                        >
                          {sym}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="0"
                        value={bonusPoints}
                        onChange={e => setBonusPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        style={{
                          width: isMobile ? 54 : 44,
                          height: isMobile ? 34 : 28,
                          borderRadius: 7,
                          textAlign: 'center',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: C.ink,
                          fontWeight: 700,
                          fontSize: 14,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA: Validate / Error */}
                <div style={{
                  padding: isMobile ? '12px 14px 16px' : '14px 18px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 10,
                }}>
                  <button
                    onClick={() => handleValidateAnswer(buzzerWinnerId, true, bonusPoints)}
                    style={{
                      flex: 1,
                      padding: isMobile ? '14px 18px' : '15px 18px',
                      borderRadius: 14,
                      border: 'none',
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${C.mint}, #52c9b0)`,
                      boxShadow: `0 10px 26px -5px ${C.mint}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
                      color: '#0d2820',
                      fontWeight: 800,
                      fontSize: isMobile ? 14 : 15,
                      letterSpacing: '-0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      height: isMobile ? 48 : 'auto',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 14px 32px -5px ${C.mint}88, inset 0 1px 0 rgba(255,255,255,0.25)`; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 26px -5px ${C.mint}66, inset 0 1px 0 rgba(255,255,255,0.25)`; }}
                  >
                    <span>✅ VALIDÉ</span>
                    <span style={{ background: 'rgba(0,0,0,0.14)', padding: '2px 9px', borderRadius: 7, fontSize: 12 }}>
                      +{totalPoints}pt{totalPoints > 1 ? 's' : ''}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleValidateAnswer(buzzerWinnerId, false)}
                    style={{
                      padding: isMobile ? '14px 18px' : '15px 22px',
                      borderRadius: 14,
                      border: 'none',
                      cursor: 'pointer',
                      background: `linear-gradient(135deg, ${C.red}, #d03558)`,
                      boxShadow: `0 10px 26px -5px ${C.red}55`,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: isMobile ? 14 : 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      height: isMobile ? 48 : 'auto',
                      touchAction: 'manipulation',
                    }}
                    onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 14px 32px -5px ${C.red}77`; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 26px -5px ${C.red}55`; }}
                  >
                    ❌ Erreur
                  </button>
                </div>
              </div>
            ) : (
              /* Waiting state */
              <div style={{
                maxWidth: 780, width: '100%', margin: '0 auto',
                padding: '18px 22px', borderRadius: 16, textAlign: 'center',
                background: isBuzzerActive ? `${C.mint}08` : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isBuzzerActive ? C.mint + '2a' : 'rgba(255,255,255,0.05)'}`,
                transition: 'all 0.4s',
              }}>
                {isBuzzerActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative', width: 12, height: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.mint, animation: 'buzz-breathe 1.5s infinite' }} />
                      <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1.5px solid ${C.mint}`, animation: 'buzz-pulse 1.8s infinite' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.mint + 'bb' }}>En écoute — Buzzer ouvert</p>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(251,243,238,0.30)' }}>
                    Activez le buzzer pour permettre aux joueurs de répondre.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════
              EMPTY STATE — No active question
          ═══════════════════════════════════════════════════════════ */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 22, padding: '48px 20px', margin: 'auto',
          }}>
            {/* Animated icon */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 88, height: 88, borderRadius: 26,
                background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
                boxShadow: `0 24px 60px -10px ${C.coral}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'buzz-breathe 2.5s ease-in-out infinite',
              }}>
                <span style={{ fontSize: 40 }}>🎲</span>
              </div>
              <div style={{
                position: 'absolute', inset: -8, borderRadius: 34,
                border: `1.5px solid ${C.coral}33`,
                animation: 'rect-pulse 2.5s ease infinite',
              }} />
            </div>

            {/* Copy */}
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
                Aucune question en cours
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(251,243,238,0.48)', margin: 0, lineHeight: 1.65 }}>
                Sélectionnez vos thèmes et niveaux dans le panneau de gauche, puis lancez un tirage.
              </p>
            </div>

            {/* CTA */}
            {!quizMode ? (
              <button
                onClick={onEnterQuizMode}
                disabled={activeQuestionPool.length === 0}
                style={{
                  padding: '16px 40px', borderRadius: 16, border: 'none',
                  cursor: activeQuestionPool.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 800, fontSize: 16, opacity: activeQuestionPool.length === 0 ? 0.38 : 1,
                  background: `linear-gradient(135deg, ${C.mint}, #52c9b0)`,
                  boxShadow: `0 14px 30px -6px ${C.mint}55`,
                  color: '#0d2820', letterSpacing: '-0.02em',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (activeQuestionPool.length > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 18px 38px -6px ${C.mint}77`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 14px 30px -6px ${C.mint}55`; }}
              >
                🚀 Lancer le Quiz
                <span style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 9px', borderRadius: 8, fontSize: 13, color: '#fff' }}>
                  {activeQuestionPool.length} Q
                </span>
              </button>
            ) : (
              <button
                onClick={handleRandomQuestionDraw}
                disabled={activeQuestionPool.length === 0}
                style={{
                  padding: '15px 36px', borderRadius: 16, border: 'none',
                  cursor: activeQuestionPool.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 15, opacity: activeQuestionPool.length === 0 ? 0.38 : 1,
                  background: `linear-gradient(135deg, ${C.sky}, #5fa8ee)`,
                  boxShadow: `0 14px 30px -6px ${C.sky}55`,
                  color: '#0d1a2a', letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (activeQuestionPool.length > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 18px 38px -6px ${C.sky}77`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 14px 30px -6px ${C.sky}55`; }}
              >
                🎲 Tirer une question
                <span style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 9px', borderRadius: 8, fontSize: 13 }}>
                  {activeQuestionPool.length}
                </span>
              </button>
            )}

            {activeQuestionPool.length === 0 && (
              <p style={{ fontSize: 12, color: 'rgba(251,243,238,0.30)', margin: 0, textAlign: 'center' }}>
                ← Cochez au moins une catégorie et un niveau dans le panneau gauche
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
