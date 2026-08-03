import React, { useState, useEffect, useRef, useMemo } from 'react';
import { C } from '../constants/theme';
import { useGame } from '../context/GameContext';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import { getQcmThemes, whoseTurn, isDuelOver, duelStatusForPlayer } from '../duel/duelLogic';
import { createDuel, findDuelByCode, joinDuel, submitRound, subscribeDuel, subscribeMyDuels } from '../duel/duelApi';

const TONE = { coral: C.coral, amber: C.amber, mint: C.mint, sky: C.sky, red: C.red, dim: 'rgba(251,243,238,0.5)' };
const NICK_KEY = 'fq_duel_nickname';
const PENDING_KEY = 'fq_pending_turns';

// ─── Browser notification helper ──────────────────────────────────────────────
const sendBrowserNotif = (title, body) => {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' });
  }
};

const requestNotifPermission = async () => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
  await Notification.requestPermission();
};

// ─── Toast overlay (fixed top-right) ─────────────────────────────────────────
function ToastStack({ toasts, onDismiss }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          pointerEvents: 'auto',
          background: 'rgba(30,15,45,0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${C.coral}66`,
          borderRadius: 16,
          padding: '14px 18px',
          maxWidth: 300,
          boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 30px ${C.coral}22`,
          animation: 'pop-in 0.35s cubic-bezier(0.2,0.8,0.2,1)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚔️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.coral, marginBottom: 2 }}>À toi de jouer !</div>
            <div style={{ fontSize: 13, color: 'rgba(251,243,238,0.8)', lineHeight: 1.4 }}>{t.message}</div>
          </div>
          <button onClick={() => onDismiss(t.id)} style={{ background: 'none', border: 'none', color: 'rgba(251,243,238,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Shared button ────────────────────────────────────────────────────────────
function Btn({ children, onClick, color = C.coral, disabled, ghost, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', minHeight: 50, padding: '12px 18px', borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer',
        border: ghost ? `1px solid ${C.stroke || 'rgba(255,255,255,0.2)'}` : 'none',
        background: ghost ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        color: ghost ? C.ink : '#1a0f12', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
        opacity: disabled ? 0.45 : 1, touchAction: 'manipulation',
        boxShadow: ghost ? 'none' : `0 12px 24px -8px ${color}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
        transition: 'transform 0.15s', transform: hover && !disabled ? 'scale(1.02)' : 'scale(1)',
        ...style,
      }}
    >{children}</button>
  );
}

// ─── Background wrapper matching the rest of the app ──────────────────────────
function Shell({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: C.bg }}>
      <div className="aurora grain" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <i className="blob-3" /><i className="blob-4" /><i className="blob-5" />
      </div>
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>{children}</div>
      </div>
    </div>
  );
}

function Header({ subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24, animation: 'pop-in 0.6s cubic-bezier(0.2,0.8,0.2,1)' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, margin: '0 auto 12px',
        background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
        boxShadow: `0 16px 40px -10px ${C.coral}88`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'buzz-breathe 2.5s ease-in-out infinite',
      }}><span style={{ fontSize: 26 }}>⏳</span></div>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Défi temps décalé</h1>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: 'rgba(251,243,238,0.5)', textTransform: 'uppercase', margin: 0 }}>
        {subtitle || 'Duel tour par tour, chacun son rythme'}
      </p>
    </div>
  );
}

// ─── Lobby view ───────────────────────────────────────────────────────────────
function Lobby({ playerId, nickname, setNickname, myDuels, notifPerm, onAskNotif, onCreate, onJoined, onOpen, onBack }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const join = async () => {
    setErr(null);
    if (!code.trim()) return;
    setBusy(true);
    try {
      const found = await findDuelByCode(code.trim());
      if (!found) throw new Error('Aucun défi ne correspond à ce code.');
      await joinDuel({ duelId: found.id, playerId, nickname: nickname || 'Joueur' });
      setCode('');
      onJoined(found.id);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />

      {/* Notification permission banner — only shown when browser supports it and permission hasn't been decided */}
      {notifPerm === 'default' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, marginBottom: 14,
          background: `${C.sky}18`, border: `1px solid ${C.sky}44`,
          animation: 'rise-in 0.4s ease',
        }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ flex: 1, fontSize: 13, color: 'rgba(251,243,238,0.8)', lineHeight: 1.4 }}>
            Reçois une notification quand c'est ton tour, même sur un autre onglet.
          </div>
          <button onClick={onAskNotif} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.sky}, ${C.mint})`,
            color: '#0d2820', fontSize: 13, fontWeight: 700,
          }}>Activer</button>
        </div>
      )}

      {notifPerm === 'granted' && myDuels.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, marginBottom: 14,
          background: `${C.mint}14`, border: `1px solid ${C.mint}33`, fontSize: 12, color: C.mint,
        }}>
          <span>🔔</span> Notifications activées — tu seras alerté(e) dès que c'est ton tour.
        </div>
      )}

      <GlassCard style={{ padding: 20, marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, color: C.mint, fontWeight: 600, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>TON PSEUDO</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Tonton Giga-Buzzer…"
          maxLength={28}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
            color: C.ink, fontSize: 16, marginBottom: 16, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 100%' }}>
            <Btn color={C.coral} onClick={onCreate} disabled={!nickname.trim()}>⚔️ Créer un défi</Btn>
          </div>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: 20, marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, color: C.sky, fontWeight: 600, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>REJOINDRE AVEC UN CODE</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="A1B2"
            style={{
              flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, textAlign: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
              color: C.ink, fontSize: 22, fontWeight: 700, letterSpacing: '0.3em', fontFamily: "'JetBrains Mono', monospace", outline: 'none',
            }}
          />
          <div style={{ flex: '0 0 130px' }}>
            <Btn color={C.sky} onClick={join} disabled={busy || code.length < 4 || !nickname.trim()}>Rejoindre</Btn>
          </div>
        </div>
        {err && <p style={{ color: C.red, fontSize: 13, margin: '10px 0 0' }}>{err}</p>}
      </GlassCard>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 4px 12px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(251,243,238,0.7)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>MES DÉFIS</span>
        <span style={{ fontSize: 12, color: 'rgba(251,243,238,0.4)' }}>{myDuels.length}</span>
      </div>

      {myDuels.length === 0 && (
        <GlassCard style={{ padding: 24, textAlign: 'center', color: 'rgba(251,243,238,0.5)', fontSize: 14 }}>
          Aucun défi pour le moment. Crées-en un et partage le code à un membre de la famille !
        </GlassCard>
      )}

      {myDuels.map((d) => {
        const st = duelStatusForPlayer(d, playerId);
        const opp = (d.playerOrder || []).find((id) => id !== playerId);
        const oppName = d.players?.[opp]?.nickname || (d.status === 'waiting' ? '— en attente —' : 'Adversaire');
        const myTurn = whoseTurn(d) === playerId;
        const over = isDuelOver(d);
        const myProg = d.players?.[playerId]?.progress || 0;
        return (
          <GlassCard key={d.id} style={{ padding: 16, marginBottom: 12, animation: 'rise-in 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>vs {oppName}</div>
                <div style={{ fontSize: 12, color: 'rgba(251,243,238,0.45)', marginTop: 2 }}>
                  Round {Math.min(myProg + (over ? 0 : 1), d.config.rounds)} / {d.config.rounds}
                </div>
              </div>
              <Pill color={TONE[st.tone] || C.coral}>{st.label}</Pill>
            </div>

            {d.status === 'waiting' && d.createdBy === playerId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(251,243,238,0.55)' }}>Code à partager :</span>
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.25em', fontFamily: "'JetBrains Mono', monospace", color: C.amber }}>{d.code}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
              {(d.playerOrder || []).map((id) => (
                <div key={id} style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(251,243,238,0.5)', fontSize: 11, marginBottom: 2 }}>{d.players[id]?.nickname}{id === playerId ? ' (toi)' : ''}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: id === playerId ? C.coral : C.sky }}>{d.players[id]?.score || 0} pts</div>
                </div>
              ))}
            </div>

            {over ? (
              <Btn color={C.sky} onClick={() => onOpen(d.id)}>🏆 Voir le résultat</Btn>
            ) : myTurn ? (
              <Btn color={C.coral} onClick={() => onOpen(d.id)}>▶️ Jouer le round {myProg + 1}</Btn>
            ) : (
              <Btn ghost disabled>⏳ {st.label}</Btn>
            )}
          </GlassCard>
        );
      })}
    </>
  );
}

// ─── Create view ──────────────────────────────────────────────────────────────
function Create({ playerId, nickname, onCreated, onCancel }) {
  const [rounds, setRounds] = useState(5);
  const themes = useMemo(() => getQcmThemes(3), []);
  const categories = useMemo(() => {
    const m = {};
    themes.forEach((t) => { (m[t.category] = m[t.category] || []).push(t); });
    return m;
  }, [themes]);
  const [selected, setSelected] = useState([]); // empty = all
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const create = async () => {
    setErr(null);
    setBusy(true);
    try {
      const themeKeys = selected.length ? selected : null;
      const { id } = await createDuel({ playerId, nickname, rounds, qPerRound: 3, themeKeys });
      onCreated(id);
    } catch (e) {
      setErr(e.message || 'Erreur lors de la création.');
      setBusy(false);
    }
  };

  const enoughThemes = (selected.length === 0) || selected.length >= 1;

  return (
    <>
      <Header subtitle="Configure ton défi" />

      <GlassCard style={{ padding: 20, marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, color: C.coral, fontWeight: 600, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>NOMBRE DE ROUNDS</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[3, 5, 7].map((n) => (
            <button key={n} onClick={() => setRounds(n)} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, cursor: 'pointer', fontSize: 18, fontWeight: 800,
              background: rounds === n ? `linear-gradient(135deg, ${C.coral}, ${C.amber})` : 'rgba(255,255,255,0.06)',
              border: rounds === n ? 'none' : '1px solid rgba(255,255,255,0.16)',
              color: rounds === n ? '#1a0f12' : C.ink,
            }}>{n}</button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(251,243,238,0.45)', margin: '12px 0 0' }}>3 questions QCM par round. Chacun répond aux mêmes questions, à son tour.</p>
      </GlassCard>

      <GlassCard style={{ padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: C.mint, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>THÈMES</label>
          <button onClick={() => setSelected([])} style={{ background: 'none', border: 'none', color: selected.length ? C.sky : 'rgba(251,243,238,0.35)', cursor: 'pointer', fontSize: 12 }}>
            {selected.length ? `${selected.length} sélectionné(s) — tout réinitialiser` : 'Tous les thèmes'}
          </button>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(categories).map(([cat, list]) => (
            <div key={cat}>
              <div style={{ fontSize: 11, color: 'rgba(251,243,238,0.4)', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{cat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {list.map((t) => {
                  const on = selected.includes(t.key);
                  return (
                    <button key={t.key} onClick={() => toggle(t.key)} style={{
                      padding: '7px 12px', borderRadius: 9999, cursor: 'pointer', fontSize: 13,
                      background: on ? `${C.mint}22` : 'rgba(255,255,255,0.05)',
                      border: on ? `1px solid ${C.mint}88` : '1px solid rgba(255,255,255,0.12)',
                      color: on ? C.mint : 'rgba(251,243,238,0.7)',
                    }}>{t.label} <span style={{ opacity: 0.5 }}>({t.count})</span></button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {err && <p style={{ color: C.red, fontSize: 13, textAlign: 'center' }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: '0 0 120px' }}><Btn ghost onClick={onCancel}>Annuler</Btn></div>
        <div style={{ flex: 1 }}><Btn color={C.coral} onClick={create} disabled={busy || !enoughThemes}>{busy ? 'Création…' : 'Créer le défi ⚔️'}</Btn></div>
      </div>
    </>
  );
}

// ─── Play a round (one question at a time) ────────────────────────────────────
function PlayRound({ duel, playerId, onDone, onCancel }) {
  const roundIndex = duel.players[playerId].progress || 0;
  const round = duel.rounds[roundIndex];
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState(() => round.questions.map(() => -1));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const q = round.questions[step];
  const last = step === round.questions.length - 1;
  const answered = picks[step] !== -1;

  const choose = (i) => setPicks((p) => p.map((v, idx) => (idx === step ? i : v)));

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const res = await submitRound({ duelId: duel.id, playerId, picks });
      onDone({ ...res, picks });
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Pill color={C.coral}>Round {roundIndex + 1} / {duel.config.rounds}</Pill>
        <span style={{ fontSize: 13, color: 'rgba(251,243,238,0.55)' }}>{round.category} · {round.theme}</span>
      </div>

      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {round.questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? C.mint : i === step ? C.coral : 'rgba(255,255,255,0.12)' }} />
        ))}
      </div>

      <GlassCard style={{ padding: 24, marginBottom: 18, animation: 'rise-in 0.3s ease' }}>
        <div style={{ fontSize: 12, color: 'rgba(251,243,238,0.45)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>QUESTION {step + 1} · {q.difficulty} · {q.points} pt{q.points > 1 ? 's' : ''}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, margin: '0 0 20px' }}>{q.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            const on = picks[step] === i;
            return (
              <button key={i} onClick={() => choose(i)} style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 600,
                background: on ? `${C.coral}26` : 'rgba(255,255,255,0.05)',
                border: on ? `1.5px solid ${C.coral}` : '1px solid rgba(255,255,255,0.14)',
                color: C.ink, transition: 'all 0.15s',
              }}>
                <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 8, marginRight: 12, alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, background: on ? C.coral : 'rgba(255,255,255,0.1)', color: on ? '#1a0f12' : 'rgba(251,243,238,0.6)' }}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {err && <p style={{ color: C.red, fontSize: 13, textAlign: 'center' }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        {step > 0 && <div style={{ flex: '0 0 110px' }}><Btn ghost onClick={() => setStep(step - 1)}>← Préc.</Btn></div>}
        {!last && <Btn color={C.coral} onClick={() => setStep(step + 1)} disabled={!answered}>Suivante →</Btn>}
        {last && <Btn color={C.mint} onClick={submit} disabled={!answered || busy}>{busy ? 'Validation…' : 'Valider mes réponses ✓'}</Btn>}
      </div>
    </>
  );
}

// ─── Result of the round you just played ──────────────────────────────────────
function RoundResult({ result, onBack }) {
  const { round, result: score, picks } = result;
  return (
    <>
      <Header subtitle="Round terminé" />
      <GlassCard style={{ padding: 24, marginBottom: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: C.mint, lineHeight: 1 }}>{score.correct}/{score.total}</div>
        <div style={{ fontSize: 14, color: 'rgba(251,243,238,0.6)', marginTop: 6 }}>bonnes réponses · <strong style={{ color: C.amber }}>+{score.points} pts</strong></div>
      </GlassCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {round.questions.map((q, i) => {
          const ok = picks?.[i] === q.correctIndex;
          const mine = picks?.[i];
          return (
            <GlassCard key={i} style={{ padding: 14, borderLeft: `3px solid ${ok ? C.mint : C.red}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
              <div style={{ fontSize: 13, color: ok ? C.mint : C.red, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{ok ? '✓' : '✕'}</span>
                <span>{mine != null && mine >= 0 ? q.options[mine] : 'Aucune réponse'}</span>
              </div>
              {!ok && (
                <div style={{ fontSize: 13, color: C.mint, marginTop: 4 }}>→ {q.options[q.correctIndex]}</div>
              )}
              {q.explanation && <div style={{ fontSize: 12, color: 'rgba(251,243,238,0.5)', marginTop: 6, lineHeight: 1.4 }}>{q.explanation}</div>}
            </GlassCard>
          );
        })}
      </div>

      <Btn color={C.coral} onClick={onBack}>Retour aux défis →</Btn>
    </>
  );
}

// ─── Finished duel scoreboard ─────────────────────────────────────────────────
function DuelResult({ duel, playerId, onBack }) {
  const order = duel.playerOrder || [];
  const sorted = [...order].sort((a, b) => (duel.players[b]?.score || 0) - (duel.players[a]?.score || 0));
  const winner = (duel.players[sorted[0]]?.score || 0) === (duel.players[sorted[1]]?.score || 0) ? null : sorted[0];

  return (
    <>
      <Header subtitle="Défi terminé" />
      <GlassCard style={{ padding: 24, marginBottom: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{winner ? '🏆' : '🤝'}</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {winner ? `${duel.players[winner].nickname} l'emporte !` : 'Égalité parfaite !'}
        </div>
      </GlassCard>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {order.map((id) => (
          <GlassCard key={id} style={{ flex: 1, padding: 18, textAlign: 'center', border: id === winner ? `1.5px solid ${C.amber}` : undefined }}>
            <div style={{ fontSize: 13, color: 'rgba(251,243,238,0.6)', marginBottom: 4 }}>{duel.players[id]?.nickname}{id === playerId ? ' (toi)' : ''}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: id === playerId ? C.coral : C.sky }}>{duel.players[id]?.score || 0}</div>
            <div style={{ fontSize: 11, color: 'rgba(251,243,238,0.4)' }}>points</div>
          </GlassCard>
        ))}
      </div>

      {/* Round-by-round breakdown */}
      <div style={{ fontSize: 12, color: 'rgba(251,243,238,0.5)', margin: '0 4px 8px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>DÉTAIL PAR ROUND</div>
      {duel.rounds.map((r, ri) => (
        <GlassCard key={ri} style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{ri + 1}. {r.theme}</span>
            <span style={{ display: 'flex', gap: 14 }}>
              {order.map((id) => {
                const a = duel.answers?.[id]?.[ri];
                return <span key={id} style={{ color: id === playerId ? C.coral : C.sky }}>{a ? `${a.correct}/${a.total}` : '—'}</span>;
              })}
            </span>
          </div>
        </GlassCard>
      ))}

      <Btn color={C.coral} onClick={onBack} style={{ marginTop: 12 }}>Retour aux défis →</Btn>
    </>
  );
}

// ─── Main screen orchestrator ─────────────────────────────────────────────────
export default function AsyncDuelScreen({ onBackToWelcome }) {
  const { playerId } = useGame();
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICK_KEY) || '');
  const [view, setView] = useState('lobby'); // lobby | create | play | roundResult | duelResult
  const [myDuels, setMyDuels] = useState([]);
  const [activeDuelId, setActiveDuelId] = useState(null);
  const [activeDuel, setActiveDuel] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifPerm, setNotifPerm] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Track previous turn-state per duel to detect transitions
  const prevTurnRef = useRef({}); // { [duelId]: boolean }
  const initialLoadRef = useRef(false); // skip notifications on first load

  useEffect(() => { localStorage.setItem(NICK_KEY, nickname); }, [nickname]);

  // Subscribe to all my duels for the lobby + badges + notifications
  useEffect(() => {
    if (!playerId) return;
    const unsub = subscribeMyDuels(playerId, (duels) => {
      setMyDuels(duels);

      // Update localStorage badge for WelcomeScreen
      const pending = duels.filter((d) => whoseTurn(d) === playerId).length;
      localStorage.setItem(PENDING_KEY, String(pending));
      window.dispatchEvent(new StorageEvent('storage', { key: PENDING_KEY, newValue: String(pending) }));

      // Detect turn transitions (skip on the very first load burst)
      if (initialLoadRef.current) {
        duels.forEach((d) => {
          const isMyTurn = whoseTurn(d) === playerId;
          const wasMyTurn = prevTurnRef.current[d.id];
          if (isMyTurn && wasMyTurn === false) {
            // Just became my turn
            const opp = (d.playerOrder || []).find((id) => id !== playerId);
            const oppName = d.players?.[opp]?.nickname || 'Ton adversaire';
            const msg = `${oppName} a joué. Tes questions t'attendent !`;
            const toastId = `${d.id}-${Date.now()}`;
            setToasts((prev) => [...prev, { id: toastId, message: msg }]);
            sendBrowserNotif('FamilyQuizz — À toi de jouer ! ⚔️', msg);
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 7000);
          }
          prevTurnRef.current[d.id] = isMyTurn;
        });
      } else {
        // Prime the ref on first load, no notifications
        duels.forEach((d) => { prevTurnRef.current[d.id] = whoseTurn(d) === playerId; });
        initialLoadRef.current = true;
      }
    });
    return unsub;
  }, [playerId]);

  // Subscribe to the currently opened duel
  useEffect(() => {
    if (!activeDuelId) { setActiveDuel(null); return; }
    const unsub = subscribeDuel(activeDuelId, setActiveDuel);
    return unsub;
  }, [activeDuelId]);

  // Deep-link: ?duel=CODE prefill is handled in the lobby join field if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('duel');
    if (code && playerId && nickname.trim()) {
      (async () => {
        const found = await findDuelByCode(code);
        if (found) { try { await joinDuel({ duelId: found.id, playerId, nickname }); } catch { /* already in / full */ } openDuel(found.id); }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const openDuel = (id) => {
    setActiveDuelId(id);
    setView('open'); // resolved by effect below once activeDuel loads
  };

  // Route into play / result once the opened duel resolves
  useEffect(() => {
    if (view !== 'open' || !activeDuel) return;
    if (isDuelOver(activeDuel)) setView('duelResult');
    else if (whoseTurn(activeDuel) === playerId) setView('play');
    else setView('lobby'); // not your turn — fall back
  }, [view, activeDuel, playerId]);

  const backToLobby = () => { setActiveDuelId(null); setActiveDuel(null); setView('lobby'); };

  const askNotifPermission = async () => {
    await requestNotifPermission();
    setNotifPerm(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  };

  let backAction = null;
  let backLabel = "";

  if (view === 'lobby') {
    backAction = onBackToWelcome;
    backLabel = "Accueil";
  } else if (view === 'create') {
    backAction = () => setView('lobby');
    backLabel = "Défis";
  } else if (view === 'play') {
    backAction = () => {
      if (window.confirm("Abandonner ce round en cours ?")) {
        backToLobby();
      }
    };
    backLabel = "Défis";
  } else if (view === 'roundResult') {
    backAction = backToLobby;
    backLabel = "Défis";
  } else if (view === 'duelResult') {
    backAction = backToLobby;
    backLabel = "Défis";
  } else if (view === 'open') {
    backAction = backToLobby;
    backLabel = "Défis";
  }

  return (
    <Shell>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Dynamic Top Navigation Bar */}
      {backAction && (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          animation: 'pop-in 0.4s cubic-bezier(0.2,0.8,0.2,1)',
          position: 'relative',
          zIndex: 100,
        }}>
          <button
            onClick={backAction}
            className="no-tap-highlight"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(251, 243, 238, 0.85)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
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
            <span style={{ fontSize: 14 }}>←</span>
            <span>{backLabel}</span>
          </button>
          
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'rgba(251,243,238,0.35)',
            fontWeight: 700,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>⚔️</span>
            <span>MODE DUEL</span>
          </div>
        </div>
      )}

      {view === 'lobby' && (
        <Lobby
          playerId={playerId}
          nickname={nickname}
          setNickname={setNickname}
          myDuels={myDuels}
          notifPerm={notifPerm}
          onAskNotif={askNotifPermission}
          onCreate={() => setView('create')}
          onJoined={(id) => openDuel(id)}
          onOpen={(id) => openDuel(id)}
          onBack={onBackToWelcome}
        />
      )}
      {view === 'create' && (
        <Create playerId={playerId} nickname={nickname} onCreated={() => setView('lobby')} onCancel={() => setView('lobby')} />
      )}
      {view === 'play' && activeDuel && (
        <PlayRound duel={activeDuel} playerId={playerId} onDone={(res) => { setLastResult(res); setView('roundResult'); }} onCancel={backToLobby} />
      )}
      {view === 'roundResult' && lastResult && (
        <RoundResult result={lastResult} onBack={backToLobby} />
      )}
      {view === 'duelResult' && activeDuel && (
        <DuelResult duel={activeDuel} playerId={playerId} onBack={backToLobby} />
      )}
      {view === 'open' && (
        <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(251,243,238,0.5)' }}>Chargement du défi…</div>
      )}
    </Shell>
  );
}
