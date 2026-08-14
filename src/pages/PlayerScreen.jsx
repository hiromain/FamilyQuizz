import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { C, DIFF } from '../constants/theme';
import Avatar from '../components/ui/Avatar';
import Pill from '../components/ui/Pill';
import DotsLoader from '../components/ui/DotsLoader';
import GlassCard from '../components/ui/GlassCard';
import MonoLabel from '../components/ui/MonoLabel';
import TimerBar from '../components/ui/TimerBar';

/** Mobile Player view */
export default function PlayerScreen({ onBackToWelcome }) {
  const { playerId, currentPlayer, gameState, players, loading, error, joinGame, buzz } = useGame();
  const [nicknameInput, setNicknameInput] = useState('');
  const [useHumorName, setUseHumorName] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: C.bg,
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <DotsLoader color={C.coral} />
          <p style={{ color: 'rgba(251,243,238,0.55)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
            Connexion à la partie…
          </p>
        </div>
      </div>
    );
  }

  // A. CONNEXION SCREEN
  if (!currentPlayer) {
    const handleSubmit = (e) => {
      e.preventDefault();
      joinGame(useHumorName ? '' : nicknameInput);
    };

    return (
      <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: C.bg }}>
        {/* Background Aurora Blobs */}
        <div className="aurora grain" style={{ zIndex: 0, pointerEvents: 'none' }}>
          <i className="blob-3" style={{ pointerEvents: 'none' }} />
          <i className="blob-4" style={{ pointerEvents: 'none' }} />
          <i className="blob-5" style={{ pointerEvents: 'none' }} />
        </div>
        
        <div style={{
          position: 'relative', zIndex: 10, pointerEvents: 'auto',
          display: 'flex', minHeight: '100vh', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: '16px 12px',
        }}>
          {onBackToWelcome && (
            <button
              type="button"
              onClick={onBackToWelcome}
              className="no-tap-highlight"
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(251, 243, 238, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                touchAction: 'manipulation',
                zIndex: 20,
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
              ←
            </button>
          )}
          <div style={{ width: '100%', maxWidth: 400 }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, margin: '0 auto 10px',
                background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
                boxShadow: `0 12px 30px -8px ${C.coral}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 22 }}>⚡</span>
              </div>
              <h1 style={{
                fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05,
                margin: 0, marginBottom: 4,
              }}>FamilyQuizz</h1>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em',
                color: 'rgba(251,243,238,0.45)', textTransform: 'uppercase', margin: 0,
              }}>Rejoins l'arène familiale</p>
            </div>
 
            {/* Form card */}
            <GlassCard style={{ padding: 20 }}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: `${C.red}22`, border: `1px solid ${C.red}44`,
                  color: C.red, marginBottom: 14, fontSize: 12, lineHeight: 1.4,
                }}>
                  <strong>⚠️ Erreur :</strong> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Pseudo input */}
                <div>
                  <label style={{
                    display: 'block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(251,243,238,0.50)', marginBottom: 6,
                  }}>Ton pseudo</label>
                  <div className="glass-soft" style={{ borderRadius: 12, padding: '10px 14px' }}>
                    <input
                      id="nickname"
                      type="text"
                      disabled={useHumorName}
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="Ex: Tonton Bernard, Mamie Nova…"
                      style={{
                        width: '100%', background: 'transparent', border: 'none', outline: 'none',
                        color: C.ink, fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em',
                      }}
                    />
                  </div>
                </div>
 
                {/* Humor toggle */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', userSelect: 'none',
                 }}>
                  <input
                    id="humor"
                    type="checkbox"
                    checked={useHumorName}
                    onChange={(e) => setUseHumorName(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: C.coral, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: 'rgba(251,243,238,0.75)', fontWeight: 500 }}>
                    Pseudo rigolo automatique 😂
                  </span>
                </label>
 
                {/* CTA */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!playerId}
                  style={{
                    height: 50, borderRadius: 14, border: 'none',
                    cursor: playerId ? 'pointer' : 'not-allowed',
                    background: playerId 
                      ? `linear-gradient(135deg, ${C.coral} 0%, ${C.amber} 100%)`
                      : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: playerId 
                      ? `0 12px 28px -8px ${C.coral}66, inset 0 1px 0 rgba(255,255,255,0.30)`
                      : 'none',
                    color: playerId ? '#fff' : 'rgba(251,243,238,0.25)',
                    fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em',
                    transition: 'transform .15s ease, box-shadow .15s ease',
                    opacity: playerId ? 1 : 0.6,
                    touchAction: 'manipulation',
                  }}
                  onMouseEnter={e => playerId && (e.currentTarget.style.transform = 'scale(1.01)')}
                  onMouseLeave={e => playerId && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {playerId ? 'Prêt·e à jouer ⚡' : '🔒 Connexion requise'}
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // B. ACTIVE GAME SCREEN
  const isBuzzerActive    = gameState.buzzer_active;
  const currentBuzzerId   = gameState.current_buzzer;
  const activeQuestion    = gameState.active_question;
  const hasBuzzedThisTurn = currentPlayer.buzzed;
  const isBuzzerWinner    = currentBuzzerId === playerId;
  const isBuzzerLoser     = currentBuzzerId && currentBuzzerId !== playerId;

  const handleBuzzClick = async () => {
    if (!isBuzzerActive || hasBuzzedThisTurn) return;
    await buzz();
  };

  // Buzzer states configuration mapping
  const buzzerCfg = isBuzzerWinner ? {
    label: '1ER BUZZ', sub: 'À toi de répondre à voix haute !',
    bg: `linear-gradient(160deg, ${C.mint}40 0%, ${C.sky}28 100%)`,
    border: `${C.mint}99`, glow: `${C.mint}66`,
    pill: { color: C.mint, label: 'GAGNÉ !' },
  } : isBuzzerLoser ? {
    label: 'TROP TARD', sub: `${players[currentBuzzerId]?.nickname || 'Quelqu\'un'} a buzzé en premier`,
    bg: `linear-gradient(160deg, ${C.red}22 0%, rgba(80,30,50,.20) 100%)`,
    border: `${C.red}55`, glow: 'transparent',
    pill: { color: C.red, label: 'BLOQUÉ' },
  } : hasBuzzedThisTurn ? {
    label: 'VERR.', sub: 'Buzzer désactivé pour cette question.',
    bg: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: 'rgba(255,255,255,0.12)', glow: 'transparent',
    pill: { color: 'rgba(251,243,238,0.45)', label: 'LOCK' },
  } : !isBuzzerActive ? {
    label: 'EN ATTENTE', sub: 'Le Maître n\'a pas encore ouvert le buzzer.',
    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)', glow: 'transparent',
    pill: { color: 'rgba(251,243,238,0.45)', label: 'ATTENTE' },
  } : {
    label: 'BUZZ', sub: 'Appuie maintenant !',
    bg: `linear-gradient(160deg, ${C.coral}38 0%, ${C.rose}24 100%)`,
    border: 'rgba(255,255,255,0.32)', glow: `${C.coral}66`,
    pill: { color: C.coral, label: 'ACTIF' },
    clickable: true,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg, position: 'relative' }}>
      {/* Aurora */}
      <div className="aurora" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <i className="blob-3" style={{ pointerEvents: 'none' }} />
        <i className="blob-4" style={{ pointerEvents: 'none' }} />
        <i className="blob-5" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Sticky Header */}
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onBackToWelcome && (
            <button
              onClick={() => {
                if (window.confirm("Quitter la partie ? Votre score sera conservé mais vous retournerez à l'accueil.")) {
                  onBackToWelcome();
                }
              }}
              className="no-tap-highlight"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(251,243,238,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', fontSize: 15, marginRight: 8, flexShrink: 0,
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
              ←
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={currentPlayer.nickname} tone={C.coral} size={34} />
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(251,243,238,0.45)', textTransform: 'uppercase' }}>Pseudo</div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>{currentPlayer.nickname}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(251,243,238,0.45)', textTransform: 'uppercase' }}>Score</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: C.mint, letterSpacing: '-0.04em' }}>{currentPlayer.score} pts</div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 16 }}>

        {/* Question card */}
        {activeQuestion ? (
          <GlassCard style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <Pill color={C.sky}>{activeQuestion.theme}</Pill>
              {activeQuestion.difficulty && (
                <Pill color={DIFF[activeQuestion.difficulty?.toLowerCase()]?.color || C.amber}>
                  {activeQuestion.difficulty}
                </Pill>
              )}
              {activeQuestion.year && (
                <Pill color={C.rose}>Année : {activeQuestion.year}</Pill>
              )}
            </div>

            {/* Check if Game Master allowed question text display or if answer is already shown */}
            {(gameState.show_question || gameState.show_answer) ? (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em', margin: 0 }}>
                  {activeQuestion.question}
                </h2>

                {/* QCM options */}
                {activeQuestion.type === 'qcm' && activeQuestion.options && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeQuestion.options.map((opt, i) => {
                      const isCorrect = opt === activeQuestion.answer && gameState.show_answer;
                      return (
                        <div key={i} className="glass-soft" style={{
                          padding: '10px 14px', borderRadius: 12,
                          display: 'flex', alignItems: 'center', gap: 10,
                          border: isCorrect ? `1px solid ${C.mint}` : undefined,
                          background: isCorrect ? `${C.mint}18` : undefined,
                        }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12,
                            background: isCorrect ? C.mint : 'rgba(255,255,255,0.10)',
                            color: isCorrect ? '#0d2820' : 'rgba(251,243,238,0.75)',
                          }}>{String.fromCharCode(65 + i)}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: isCorrect ? C.mint : C.ink }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* If question text is hidden by Game Master */
              <div style={{
                textAlign: 'center', padding: '16px 10px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 32, animation: 'buzz-breathe 2s infinite' }}>❓👂</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.sky }}>
                  Question posée à l'oral uniquement !
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(251,243,238,0.50)', lineHeight: 1.4 }}>
                  Écoutez bien le Maître du Jeu et préparez-vous à buzzer dès qu'il active le buzzer !
                </p>
              </div>
            )}

            {/* Answer revealed */}
            {gameState.show_answer && activeQuestion.type === 'open' && (
              <div style={{
                marginTop: 14, padding: '12px 16px', borderRadius: 12,
                background: `${C.mint}18`, border: `1px solid ${C.mint}44`,
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.mint, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Réponse attendue :
                </div>
                <strong style={{ fontSize: 16, color: C.ink }}>{activeQuestion.answer}</strong>
              </div>
            )}

            {/* Explanation revealed */}
            {gameState.show_answer && activeQuestion.explanation && (
              <div style={{
                marginTop: 14, padding: '14px 16px', borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.amber,
                  letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span>💡 Le saviez-vous ?</span>
                </div>
                <p style={{
                  fontSize: 13, color: 'rgba(251,243,238,0.85)', lineHeight: 1.5,
                  margin: 0, fontWeight: 400
                }}>
                  {activeQuestion.explanation}
                </p>
              </div>
            )}
          </GlassCard>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: 'dot-bounce 2s infinite' }}>⏳</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>En attente de diffusion…</h3>
            <p style={{ fontSize: 13, color: 'rgba(251,243,238,0.50)', maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>
              Le Maître du Jeu prépare la prochaine question. Échauffez vos doigts sur le buzzer !
            </p>
          </div>
        )}

        {/* BUZZER — full-width glass button */}
        {activeQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <TimerBar endsAt={gameState.timer_ends_at} duration={gameState.timer_duration} />
            <Pill color={buzzerCfg.pill.color}>{buzzerCfg.pill.label}</Pill>

            <button
              onClick={handleBuzzClick}
              disabled={!buzzerCfg.clickable}
              className="no-tap-highlight"
              style={{
                width: '100%', height: 200, borderRadius: 28, border: 'none',
                background: buzzerCfg.bg,
                backdropFilter: 'blur(32px) saturate(200%) brightness(1.08)',
                WebkitBackdropFilter: 'blur(32px) saturate(200%) brightness(1.08)',
                outline: `1.5px solid ${buzzerCfg.border}`,
                boxShadow: `inset 0 2px 0 rgba(255,255,255,0.18), 0 0 80px ${buzzerCfg.glow}`,
                cursor: buzzerCfg.clickable ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                animation: buzzerCfg.clickable ? 'buzz-breathe 1.8s ease-in-out infinite' : 'none',
                position: 'relative', overflow: 'hidden', transition: 'transform .15s',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
              onMouseDown={e => buzzerCfg.clickable && (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => {
                if (buzzerCfg.clickable) {
                  e.currentTarget.style.transform = 'scale(0.97)';
                }
              }}
              onTouchEnd={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onTouchCancel={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Sheen */}
              <div style={{
                position: 'absolute', top: 8, left: 8, right: 8, height: '35%', borderRadius: 22,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                fontWeight: 800, fontSize: isBuzzerWinner ? 48 : isBuzzerLoser ? 26 : 64,
                letterSpacing: '-0.06em', lineHeight: 1,
                color: isBuzzerWinner ? C.mint : isBuzzerLoser ? C.red : C.ink,
                textShadow: '0 4px 24px rgba(0,0,0,0.50)',
              }}>
                {buzzerCfg.label}
              </div>

              <div style={{
                marginTop: 10, fontSize: 13, fontWeight: 500, textAlign: 'center',
                color: 'rgba(251,243,238,0.70)', maxWidth: 240, lineHeight: 1.4,
              }}>
                {buzzerCfg.sub}
              </div>

              {/* Pulse rings when active */}
              {buzzerCfg.clickable && (
                <>
                  <div className="rect-pulse" style={{ animationDelay: '0s' }} />
                  <div className="rect-pulse" style={{ animationDelay: '.7s' }} />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer players */}
      <footer style={{
        position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)', padding: '12px 16px', backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em',
          color: 'rgba(251,243,238,0.40)', textTransform: 'uppercase', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>Joueurs connectés</span>
          {onBackToWelcome && (
            <button
              onClick={() => {
                if (window.confirm("Quitter la partie ? Votre score sera conservé mais vous retournerez à l'accueil.")) {
                  onBackToWelcome();
                }
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.coral, fontSize: 9, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase',
                letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4,
                padding: '14px 8px', margin: '-14px -8px', touchAction: 'manipulation',
              }}
            >
              🚪 Quitter la partie
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.values(players).map((p) => (
            <div key={p.id} style={{
              padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
              background: p.id === playerId ? `${C.coral}22` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${p.id === playerId ? C.coral + '55' : 'rgba(255,255,255,0.08)'}`,
              color: p.id === playerId ? C.coral : 'rgba(251,243,238,0.65)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: p.buzzed ? C.red : C.mint, flexShrink: 0,
              }} />
              {p.nickname} ({p.score}pts)
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
