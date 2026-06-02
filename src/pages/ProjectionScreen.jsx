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

const DIFF = {
  facile:    { color: C.mint,  points: 1, label: 'Facile'    },
  moyen:     { color: C.amber, points: 2, label: 'Moyen'     },
  difficile: { color: C.coral, points: 3, label: 'Difficile' },
};

/** Synchronized Timer / Countdown progress bar for TV projection */
function TimerBar({ endsAt, duration }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, endsAt - Date.now());
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt || timeLeft === 0 || !duration) return null;

  const seconds = Math.ceil(timeLeft / 1000);
  const pct = (timeLeft / (duration * 1000)) * 100;
  const isDanger = seconds <= 5;
  const barColor = isDanger ? C.red : pct < 50 ? C.amber : C.mint;

  return (
    <div style={{ width: '100%', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, animation: 'pop-in 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          color: 'rgba(251,243,238,0.40)', letterSpacing: '0.12em', textTransform: 'uppercase'
        }}>
          ⏳ Temps restant
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800,
          color: barColor, letterSpacing: '-0.02em',
          animation: isDanger ? 'buzz-breathe 0.5s infinite' : 'none'
        }}>
          {seconds}s
        </span>
      </div>
      <div style={{
        width: '100%', height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.06)',
        border: '1.5px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: barColor,
          borderRadius: 99,
          transition: 'width 0.1s linear, background-color 0.3s',
          boxShadow: `0 0 20px ${barColor}aa`
        }} />
      </div>
    </div>
  );
}

function Pill({ children, color = C.coral }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 16px', borderRadius: 9999,
      background: `${color}18`, border: `1.5px solid ${color}44`,
      color, fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
      letterSpacing: '0.04em', boxShadow: `0 4px 12px ${color}14`,
      textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function Avatar({ name = '?', tone = C.coral, size = 48 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', fontSize: size * 0.40, fontWeight: 800,
      background: `linear-gradient(135deg, ${tone}, ${tone}88)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 1.5px ${tone}44, 0 8px 20px ${tone}22`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: '-0.02em', flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function ProjectionScreen() {
  const { players, gameState, loading, error } = useGame();
  
  // Audio state
  const [lastBuzzer, setLastBuzzer] = useState(null);
  
  const activeQuestion = gameState.active_question;
  const currentBuzzer  = gameState.current_buzzer;
  const isBuzzerActive = gameState.buzzer_active;
  const showAnswer     = gameState.show_answer;

  const gameUrl = window.location.origin;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&color=140a1f&bgcolor=ffffff&data=${encodeURIComponent(gameUrl)}`;

  // Sound effect / vibe cues on browser events
  useEffect(() => {
    if (currentBuzzer && currentBuzzer !== lastBuzzer) {
      setLastBuzzer(currentBuzzer);
      try {
        // Trigger a premium modern buzz synth tone via Web Audio API!
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Synth osc 1 (main buzz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime); // Low resonant buzzer pitch
        osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.12);
        
        // Synth osc 2 (perfect sub fourth for dramatic power)
        const osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(105, ctx.currentTime); 
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.warn("Audio Context blocked or failed:", e);
      }
    } else if (!currentBuzzer) {
      setLastBuzzer(null);
    }
  }, [currentBuzzer, lastBuzzer]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: C.bg, color: C.ink, fontFamily: "'Space Grotesk', sans-serif"
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: '50%', background: C.coral,
                animation: `dot-bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
          <p style={{ color: 'rgba(251,243,238,0.50)', fontSize: 18, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            CONNEXION AU GRAND ÉCRAN...
          </p>
        </div>
      </div>
    );
  }

  // ─── LOBBY VIEW (NO ACTIVE QUESTION) ───
  if (!activeQuestion) {
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

    return (
      <div className="grain" style={{
        position: 'fixed', inset: 0, overflow: 'hidden', background: C.bg,
        color: C.ink, display: 'flex', flexDirection: 'column', padding: '40px 60px'
      }}>
        {/* Animated Background Auroras */}
        <div className="aurora" style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <i className="blob-3" style={{ left: '15%', top: '20%', width: '55vmax', height: '55vmax' }} />
          <i className="blob-4" style={{ right: '10%', top: '10%', width: '45vmax', height: '45vmax' }} />
          <i className="blob-5" style={{ left: '40%', bottom: '5%', width: '50vmax', height: '50vmax' }} />
        </div>

        {/* Top Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 24, flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
              boxShadow: `0 12px 36px -4px ${C.coral}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'buzz-breathe 2.5s ease-in-out infinite',
            }}>
              <span style={{ fontSize: 26 }}>⚡</span>
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>FamilyQuizz</h1>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em',
                color: 'rgba(251,243,238,0.40)', textTransform: 'uppercase', marginTop: 4
              }}>L'arène de quiz familiale sur grand écran</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
              padding: '6px 14px', borderRadius: 9, color: C.mint,
              fontWeight: 700, letterSpacing: '0.06em'
            }}>
              ● {sortedPlayers.length} JOUEUR{sortedPlayers.length > 1 ? 'S' : ''} CONNECTÉ{sortedPlayers.length > 1 ? 'S' : ''}
            </span>
          </div>
        </header>

        {/* Main Split Layout */}
        <main style={{
          flex: 1, display: 'flex', gap: 60, marginTop: 40, overflow: 'hidden',
          position: 'relative', zIndex: 10
        }}>
          {/* Left Block: Access QR code (showcase element) */}
          <div style={{
            flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 28, animation: 'rise-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <div className="glass-thick" style={{
              padding: '40px 50px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', gap: 32, borderRadius: 28,
              maxWidth: 520, width: '100%'
            }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#fff' }}>Rejoindre l'Arène !</h2>
                <p style={{ fontSize: 14, color: 'rgba(251,243,238,0.55)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                  Sortez vos smartphones, scannez le code ci-dessous et entrez votre pseudo !
                </p>
              </div>

              {/* Glowing QR */}
              <div style={{
                width: 240, height: 240, borderRadius: 24, overflow: 'hidden',
                background: '#fff', padding: 14, display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: `0 24px 80px rgba(111,224,196,0.30), 0 0 40px rgba(126,184,255,0.15)`,
                border: '3px solid rgba(255,255,255,0.40)',
                animation: 'buzz-breathe 3s ease-in-out infinite'
              }}>
                <img src={qrCodeUrl} alt="Lien de connexion" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              {/* Clean URL Container */}
              <div style={{
                fontSize: 18, color: C.mint, fontWeight: 700,
                background: 'rgba(0,0,0,0.25)', padding: '12px 24px', borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.06)', fontFamily: 'monospace',
                letterSpacing: '0.02em', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                {gameUrl}
              </div>
            </div>
          </div>

          {/* Right Block: Players scoreboard list */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            animation: 'rise-in 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(251,243,238,0.40)',
              fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 20px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>Classement des Joueurs 🏆</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>En attente de lancement...</span>
            </h3>

            <div style={{
              flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
              gap: 12, paddingRight: 10
            }}>
              {sortedPlayers.map((p, i) => {
                const toneColor = [C.amber, 'rgba(200,210,230,1)', '#d97706'][i] || C.coral;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

                return (
                  <div key={p.id} className="glass" style={{
                    padding: '16px 24px', borderRadius: 18, display: 'flex',
                    alignItems: 'center', gap: 18, border: `1.5px solid ${i < 3 ? toneColor + '44' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: i === 0 ? `0 12px 32px -4px ${C.amber}18` : 'none',
                    animation: 'pop-in 0.4s ease'
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 18,
                      fontWeight: 800, color: toneColor, width: 34, textAlign: 'center'
                    }}>
                      {medal || `#${i + 1}`}
                    </span>
                    <Avatar name={p.nickname} tone={toneColor} size={42} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{p.nickname}</div>
                      <div style={{ fontSize: 12, color: 'rgba(251,243,238,0.45)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                        {p.score > 0 ? `${p.score} point${p.score > 1 ? 's' : ''}` : 'Aucun point'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 26, fontWeight: 800, color: C.mint,
                      letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                      {p.score}
                    </div>
                  </div>
                );
              })}

              {sortedPlayers.length === 0 && (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 14, minHeight: 250, opacity: 0.5,
                  border: '1.5px dashed rgba(255,255,255,0.08)', borderRadius: 20
                }}>
                  <span style={{ fontSize: 32 }}>💤</span>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(251,243,238,0.50)' }}>
                    Aucun joueur connecté pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── GAME STATE VIEW (ACTIVE QUESTION PRESENTATION) ───
  const activeDiff = activeQuestion.difficulty?.toLowerCase() || 'moyen';
  const diffCfg = DIFF[activeDiff] || DIFF.moyen;
  const isQCM = activeQuestion.type === 'qcm';
  const buzzerWinnerObj = currentBuzzer ? players[currentBuzzer] : null;

  return (
    <div className="grain" style={{
      position: 'fixed', inset: 0, overflow: 'hidden', background: C.bg,
      color: C.ink, display: 'flex', flexDirection: 'column', padding: '30px 48px'
    }}>
      {/* Dynamic Game Background Auroras */}
      <div className="aurora" style={{ opacity: 0.8, pointerEvents: 'none' }}>
        {buzzerWinnerObj ? (
          // Extreme glowing aura spotlight on player buzz
          <>
            <i className="blob-3" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '70vmax', height: '70vmax', background: `radial-gradient(circle, ${C.mint}55 0%, transparent 60%)`, mixBlendMode: 'screen', transition: 'all 0.5s' }} />
          </>
        ) : (
          <>
            <i className="blob-3" style={{ left: '10%', top: '15%', width: '45vmax', height: '45vmax', background: `radial-gradient(circle, ${C.coral}33 0%, transparent 65%)` }} />
            <i className="blob-4" style={{ right: '5%', top: '5%', width: '50vmax', height: '50vmax', background: `radial-gradient(circle, ${C.sky}33 0%, transparent 65%)` }} />
            <i className="blob-5" style={{ left: '30%', bottom: '-10%', width: '40vmax', height: '40vmax', background: `radial-gradient(circle, ${C.rose}22 0%, transparent 65%)` }} />
          </>
        )}
      </div>

      {/* Header Info */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 16, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pill color={C.sky}>{activeQuestion.theme || "Quiz"}</Pill>
          <Pill color={diffCfg.color}>{diffCfg.label} · {diffCfg.points}pt{diffCfg.points > 1 ? 's' : ''}</Pill>
          {activeQuestion.year && <Pill color={C.rose}>Année : {activeQuestion.year}</Pill>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700,
            background: isBuzzerActive ? `${C.mint}18` : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${isBuzzerActive ? C.mint + '44' : 'rgba(255,255,255,0.10)'}`,
            padding: '6px 16px', borderRadius: 9, color: isBuzzerActive ? C.mint : 'rgba(251,243,238,0.50)',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isBuzzerActive ? C.mint : 'rgba(251,243,238,0.30)',
              boxShadow: isBuzzerActive ? `0 0 8px ${C.mint}` : 'none',
              animation: isBuzzerActive ? 'buzz-breathe 1.5s infinite' : 'none'
            }} />
            <span>{isBuzzerActive ? 'BUZZER ACTIF' : 'BUZZER VERROUILLÉ'}</span>
          </div>
        </div>
      </header>

      {/* Main Panel layout */}
      <div style={{
        flex: 1, display: 'flex', gap: 40, marginTop: 24, overflow: 'hidden',
        position: 'relative', zIndex: 10
      }}>
        
        {/* Left/Middle Block: Main Question Arena */}
        <main style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 32, position: 'relative'
        }}>
          
          {/* Question Text Box */}
          <div style={{
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8,
            animation: 'pop-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            {(gameState.show_question || gameState.show_answer) ? (
              <h2 style={{
                fontSize: 34, fontWeight: 800, color: '#fff', margin: 0,
                lineHeight: 1.35, letterSpacing: '-0.03em', maxWidth: 840,
                marginLeft: 'auto', marginRight: 'auto'
              }}>
                {activeQuestion.question}
              </h2>
            ) : (
              <div style={{ padding: '20px 0' }}>
                <span style={{ fontSize: 64, animation: 'buzz-breathe 2s infinite', display: 'block', marginBottom: 16 }}>❓👂</span>
                <h2 style={{
                  fontSize: 32, fontWeight: 800, color: C.sky, margin: 0,
                  lineHeight: 1.35, letterSpacing: '-0.03em', maxWidth: 840,
                  marginLeft: 'auto', marginRight: 'auto'
                }}>
                  Écoutez bien le Maître du Jeu !
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: 16, color: 'rgba(251,243,238,0.40)' }}>
                  La question est posée uniquement à l'oral pour le moment.
                </p>
              </div>
            )}
            <div style={{ maxWidth: 840, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
              <TimerBar endsAt={gameState.timer_ends_at} duration={gameState.timer_duration} />
            </div>
          </div>

          {/* QCM or Open Answers Display */}
          {(gameState.show_question || gameState.show_answer) && isQCM ? (() => {
            const OPTION_COLORS = [C.coral, C.sky, C.amber, C.mint];
            const LETTERS = ['A', 'B', 'C', 'D'];
            return (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
                maxWidth: 820, width: '100%', marginLeft: 'auto', marginRight: 'auto',
                animation: 'rise-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}>
                {activeQuestion.options && activeQuestion.options.map((opt, i) => {
                  const isCorrect = opt === activeQuestion.answer;
                  const accentColor = OPTION_COLORS[i % OPTION_COLORS.length];
                  
                  // Correct reveal styling
                  const revealed = showAnswer && isCorrect;
                  const wrong = showAnswer && !isCorrect;

                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 20px', borderRadius: 20,
                      background: revealed
                        ? `linear-gradient(135deg, ${C.mint}22, ${C.mint}10)`
                        : wrong
                        ? 'rgba(255, 255, 255, 0.02)'
                        : `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))`,
                      border: `2px solid ${
                        revealed ? C.mint
                        : wrong ? 'rgba(255,255,255,0.05)'
                        : 'rgba(255, 255, 255, 0.12)'
                      }`,
                      boxShadow: revealed
                        ? `0 0 40px ${C.mint}33, inset 0 1px 0 rgba(255,255,255,0.20)`
                        : wrong
                        ? 'none'
                        : `0 4px 20px rgba(0,0,0,0.15)`,
                      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      opacity: wrong ? 0.35 : 1,
                      position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 20, fontFamily: "'JetBrains Mono', monospace",
                        background: revealed ? C.mint : wrong ? 'rgba(255,255,255,0.05)' : `${accentColor}25`,
                        border: `1.5px solid ${revealed ? C.mint : wrong ? 'rgba(255,255,255,0.08)' : accentColor + '66'}`,
                        color: revealed ? C.bg : wrong ? 'rgba(251,243,238,0.25)' : accentColor,
                        transition: 'all 0.4s'
                      }}>{LETTERS[i]}</div>
                      <span style={{
                        fontSize: 18, fontWeight: revealed ? 700 : 500,
                        color: revealed ? C.mint : wrong ? 'rgba(251,243,238,0.30)' : C.ink,
                        lineHeight: 1.35, flex: 1, transition: 'color 0.4s'
                      }}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            // Open question answer revealed
            showAnswer && (
              <div style={{
                maxWidth: 600, width: '100%', marginLeft: 'auto', marginRight: 'auto',
                padding: '24px 32px', borderRadius: 24,
                background: `linear-gradient(135deg, ${C.mint}18, ${C.mint}0a)`,
                border: `2px solid ${C.mint}66`,
                boxShadow: `0 0 50px ${C.mint}22, inset 0 1px 0 rgba(255,255,255,0.2)`,
                animation: 'pop-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                textAlign: 'center'
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.mint, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ✓ Réponse attendue
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {activeQuestion.answer}
                </div>
              </div>
            )
          )}

          {/* Explanation "💡 Le saviez-vous ?" */}
          {showAnswer && activeQuestion.explanation && (
            <div style={{
              maxWidth: 720, width: '100%', marginLeft: 'auto', marginRight: 'auto',
              padding: '20px 24px', borderRadius: 18,
              background: 'rgba(245, 181, 74, 0.05)', border: `1.5px solid ${C.amber}44`,
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              animation: 'rise-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.amber,
                letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span>💡 LE SAVIEZ-VOUS ?</span>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: 'rgba(251,243,238,0.85)', lineHeight: 1.55 }}>
                {activeQuestion.explanation}
              </p>
            </div>
          )}

          {/* ── Spotlights & Overlays on Buzzer action ── */}
          {buzzerWinnerObj && (
            <div style={{
              position: 'absolute', inset: -20, background: 'rgba(20, 10, 31, 0.85)',
              borderRadius: 28, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20, zIndex: 100,
              boxShadow: `0 0 100px rgba(111,224,196,0.15)`,
              border: `2.5px solid ${C.mint}55`,
              backdropFilter: 'blur(10px)',
              animation: 'pop-in 0.45s cubic-bezier(0.17, 0.89, 0.32, 1.25)'
            }}>
              <div className="ring-pulse" style={{ color: C.mint, width: 220, height: 220, left: 'auto', top: 'auto' }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <Avatar name={buzzerWinnerObj.nickname} tone={C.mint} size={100} />
                <div style={{
                  background: C.mint, color: '#0c0613', padding: '5px 16px', borderRadius: 9999,
                  fontWeight: 800, fontSize: 13, letterSpacing: '0.12em', fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  ⚡ A PRIS LA MAIN
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h3 style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
                  {buzzerWinnerObj.nickname}
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: 16, color: 'rgba(251,243,238,0.50)' }}>
                  A vous de donner votre réponse à voix haute !
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar Block: Scores ranking */}
        <aside style={{
          width: 320, borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          paddingLeft: 30, display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(251,243,238,0.40)',
            margin: '0 0 16px 0', fontFamily: "'Space Grotesk', sans-serif"
          }}>
            Classement 🏆
          </h3>

          <div style={{
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            gap: 10
          }}>
            {Object.values(players).sort((a, b) => b.score - a.score).map((p, i) => {
              const isWinner = currentBuzzer === p.id;
              const hasBuzzed = p.buzzed && !isWinner;
              const toneColor = [C.amber, 'rgba(200,210,230,1)', '#d97706'][i] || C.coral;

              return (
                <div key={p.id} className="glass" style={{
                  padding: '12px 16px', borderRadius: 14, display: 'flex',
                  alignItems: 'center', gap: 10,
                  background: isWinner ? `${C.mint}14` : hasBuzzed ? `${C.red}08` : undefined,
                  border: `1px solid ${
                    isWinner ? C.mint + '33' : hasBuzzed ? C.red + '22' : 'rgba(255,255,255,0.06)'
                  }`,
                  opacity: hasBuzzed ? 0.5 : 1, transition: 'all .25s'
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                    fontWeight: 700, color: toneColor, width: 22
                  }}>
                    #{i + 1}
                  </span>
                  <Avatar name={p.nickname} tone={toneColor} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 14, color: C.ink,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{p.nickname}</div>
                    <div style={{ fontSize: 10, color: 'rgba(251,243,238,0.40)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {isWinner ? '🎙️ Parle' : hasBuzzed ? '🚫 Bloqué' : '💤 Attente'}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: 18, color: C.mint,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}>
                    {p.score}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
