import React from 'react';
import { C } from '../../constants/design';
import Avatar from '../../components/ui/Avatar';

export default function ScorePanel({
  players,
  buzzerWinnerId,
  clearAllPlayers,
  adjustScore,
  isMobile = false,
}) {
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <aside style={{
      width: '100%',
      display: 'flex', flexDirection: 'column', height: '100%',
      position: 'relative', zIndex: 10, flexShrink: 0,
    }}>
      <div style={{
        padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Classement 🏆</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(251,243,238,0.40)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>Temps réel</div>
        </div>
        <button onClick={clearAllPlayers} style={{
          padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          background: `${C.red}18`, border: `1px solid ${C.red}33`, color: C.red,
        }}>Reset</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sortedPlayers.map((p, i) => {
          const isWinner = buzzerWinnerId === p.id;
          const hasBuzzed = p.buzzed && !isWinner;
          const toneColor = [C.amber, 'rgba(200,210,230,1)', '#d97706'][i] || C.coral;
          return (
            <div key={p.id} style={{
              padding: '10px 14px', borderRadius: 12,
              background: isWinner ? `${C.mint}14` : hasBuzzed ? `${C.red}08` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isWinner ? C.mint + '44' : hasBuzzed ? C.red + '22' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: hasBuzzed ? 0.65 : 1, transition: 'all .2s',
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: i < 3 ? toneColor : 'rgba(251,243,238,0.35)', fontWeight: 700, width: 20 }}>#{i + 1}</span>
              <Avatar name={p.nickname} tone={i < 3 ? toneColor : C.coral} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nickname}</div>
                <div style={{ fontSize: 10, color: 'rgba(251,243,238,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {isWinner ? '🎙️ Parle' : hasBuzzed ? '🚫 Bloqué' : '💤 Attente'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.mint, letterSpacing: '-0.03em' }}>{p.score}</div>
                <div style={{ display: 'flex', gap: isMobile ? 6 : 3 }}>
                  {[['▲', 1], ['▼', -1]].map(([sym, delta]) => (
                    <button
                      key={sym}
                      onClick={() => adjustScore(p.id, delta)}
                      style={{
                        width: isMobile ? 28 : 18,
                        height: isMobile ? 28 : 18,
                        borderRadius: isMobile ? 6 : 4,
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(251,243,238,0.60)',
                        fontSize: isMobile ? 12 : 9,
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
                </div>
              </div>
            </div>
          );
        })}

        {sortedPlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', fontSize: 13, color: 'rgba(251,243,238,0.30)' }}>
            Aucun joueur connecté.
          </div>
        )}
      </div>
    </aside>
  );
}
